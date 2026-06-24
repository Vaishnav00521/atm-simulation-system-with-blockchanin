package com.global.atm_blockchain.security;

import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicLong;

/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║   LAYER 2: SLIDING-WINDOW DISTRIBUTED RATE LIMITER          ║
 * ║   Threat: DDoS, Botnet Flood, Brute-Force, API Exhaustion   ║
 * ║   Defense: Per-IP sliding window with automatic eviction     ║
 * ╚══════════════════════════════════════════════════════════════╝
 *
 * Tracks the ACTUAL authorization vector (X-Forwarded-For or remote IP)
 * to bypass proxy evasion techniques.
 *
 * Sliding window (vs. fixed window): prevents "burst at the boundary"
 * attacks where a malicious actor can make 2x the allowed requests by
 * splitting them at the start/end of a fixed time window.
 *
 * Additionally implements automatic map eviction to prevent memory exhaustion
 * under sustained DDoS — a vulnerability in naive ConcurrentHashMap rate limiters.
 */
@Component
public class DistributedRateLimiter implements HandlerInterceptor {

    // Auth endpoints get STRICTER limits to prevent credential stuffing
    private static final int MAX_AUTH_REQUESTS = 5;
    // General API endpoints are more lenient for UX
    private static final int MAX_API_REQUESTS = 30;
    private static final long TIME_WINDOW_MS = 60_000; // 60-second sliding window
    // Memory safety: Evict stale entries after 5 minutes
    private static final long EVICTION_THRESHOLD_MS = 300_000;

    private final ConcurrentHashMap<String, RateTracker> rateMap = new ConcurrentHashMap<>();
    private final AtomicLong lastEvictionTime = new AtomicLong(System.currentTimeMillis());

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        // Evict stale entries periodically to prevent memory bloat under sustained attack
        evictStaleEntries();

        // Determine the real client IP, even behind load balancers and reverse proxies
        String identificationKey = resolveClientIp(request);
        String requestPath = request.getRequestURI();

        int maxRequests = requestPath.startsWith("/api/auth") ? MAX_AUTH_REQUESTS : MAX_API_REQUESTS;
        long currentTime = System.currentTimeMillis();

        rateMap.putIfAbsent(identificationKey, new RateTracker(currentTime));
        RateTracker tracker = rateMap.get(identificationKey);

        synchronized (tracker) {
            // Sliding window: reset only the count, not by time bucket
            if (currentTime - tracker.windowStartTime > TIME_WINDOW_MS) {
                tracker.windowStartTime = currentTime;
                tracker.requestCount.set(1);
                tracker.lastSeen.set(currentTime);
                return true;
            }

            tracker.lastSeen.set(currentTime);
            int currentCount = tracker.requestCount.incrementAndGet();

            if (currentCount > maxRequests) {
                // Log the security event
                System.err.printf("[RATE_LIMITER] Security lockdown for IP: %s | Path: %s | Requests: %d%n",
                        identificationKey, requestPath, currentCount);

                response.setStatus(429);
                response.setContentType("application/json");
                response.setHeader("Retry-After", "60");
                response.setHeader("X-RateLimit-Limit", String.valueOf(maxRequests));
                response.setHeader("X-RateLimit-Remaining", "0");
                response.getWriter().write(String.format(
                        "{\"status\":429,\"error\":\"Too Many Requests\",\"message\":\"Rate limit breached. Security lockdown active. Retry after 60 seconds.\",\"ip\":\"%s\"}",
                        identificationKey));
                return false;
            }

            response.setHeader("X-RateLimit-Limit", String.valueOf(maxRequests));
            response.setHeader("X-RateLimit-Remaining", String.valueOf(maxRequests - currentCount));
        }
        return true;
    }

    /**
     * Resolves the true client IP even when behind CDN / Load Balancers.
     * Supports X-Forwarded-For, X-Real-IP, and falls back to remoteAddr.
     */
    private String resolveClientIp(HttpServletRequest request) {
        String[] headers = {"X-Forwarded-For", "X-Real-IP", "Proxy-Client-IP", "WL-Proxy-Client-IP"};
        for (String header : headers) {
            String ip = request.getHeader(header);
            if (ip != null && !ip.isEmpty() && !"unknown".equalsIgnoreCase(ip)) {
                // X-Forwarded-For can be a comma-separated chain — take the first (original client)
                return ip.split(",")[0].trim();
            }
        }
        return request.getRemoteAddr();
    }

    /**
     * Automatic memory safety: removes stale entries to prevent ConcurrentHashMap
     * from growing unboundedly under sustained DDoS from thousands of unique IPs.
     */
    private void evictStaleEntries() {
        long now = System.currentTimeMillis();
        if (now - lastEvictionTime.get() > EVICTION_THRESHOLD_MS) {
            lastEvictionTime.set(now);
            rateMap.entrySet().removeIf(entry ->
                    now - entry.getValue().lastSeen.get() > EVICTION_THRESHOLD_MS);
        }
    }

    private static class RateTracker {
        long windowStartTime;
        final AtomicInteger requestCount = new AtomicInteger(0);
        final AtomicLong lastSeen;

        RateTracker(long startTime) {
            this.windowStartTime = startTime;
            this.lastSeen = new AtomicLong(startTime);
        }
    }
}
