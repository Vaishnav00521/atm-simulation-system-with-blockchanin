package com.global.atm_blockchain.config;

import com.global.atm_blockchain.security.IpFingerprintService;
import com.global.atm_blockchain.security.TokenBlacklistService;
import com.global.atm_blockchain.util.JwtUtil;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.ArrayList;

@Component
public class JwtFilter extends OncePerRequestFilter {

    @Autowired
    private JwtUtil jwtUtil;

    /*
     * ╔══════════════════════════════════════════════════════════════╗
     * ║   LAYER 5 INTEGRATION: TOKEN BLACKLIST CHECK                 ║
     * ║   LAYER 7 INTEGRATION: IP FINGERPRINT GEO-FENCE CHECK        ║
     * ╚══════════════════════════════════════════════════════════════╝
     * Both checks happen before EVERY authenticated request.
     */
    @Autowired
    private TokenBlacklistService tokenBlacklistService;

    @Autowired
    private IpFingerprintService ipFingerprintService;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        // Allow browser preflight CORS requests to bypass the JWT check instantly
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            filterChain.doFilter(request, response);
            return;
        }

        final String authorizationHeader = request.getHeader("Authorization");

        String username = null;
        String jwt = null;

        if (authorizationHeader != null && authorizationHeader.startsWith("Bearer ")) {
            jwt = authorizationHeader.substring(7);

            // ⚡ LAYER 5: Reject tokens that have been explicitly revoked (logged out)
            if (tokenBlacklistService.isBlacklisted(jwt)) {
                System.err.println("[SECURITY] Blacklisted token used. Rejecting request.");
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                response.getWriter().write("{\"error\":\"Token has been revoked. Please log in again.\"}");
                return;
            }

            try {
                username = jwtUtil.extractUsername(jwt);
            } catch (Exception e) {
                System.out.println("[JWT_FILTER] Invalid or Expired JWT Token");
            }
        }

        if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            if (jwtUtil.validateToken(jwt, username)) {

                // ⚡ LAYER 7: Geo-fence check — reject if IP changed since login
                String clientIp = resolveClientIp(request);
                if (ipFingerprintService.isSuspiciousRequest(username, clientIp)) {
                    response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                    response.setContentType("application/json");
                    response.getWriter().write("{\"error\":\"Security alert: Request origin mismatch. Please log in again.\"}");
                    return;
                }

                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                        username, null, new ArrayList<>());
                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authToken);
            }
        }
        filterChain.doFilter(request, response);
    }

    private String resolveClientIp(HttpServletRequest request) {
        String[] headers = {"X-Forwarded-For", "X-Real-IP", "Proxy-Client-IP"};
        for (String header : headers) {
            String ip = request.getHeader(header);
            if (ip != null && !ip.isEmpty() && !"unknown".equalsIgnoreCase(ip)) {
                return ip.split(",")[0].trim();
            }
        }
        return request.getRemoteAddr();
    }
}