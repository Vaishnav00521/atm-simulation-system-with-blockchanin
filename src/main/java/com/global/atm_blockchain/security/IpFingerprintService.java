package com.global.atm_blockchain.security;

import org.springframework.stereotype.Service;

import java.util.concurrent.ConcurrentHashMap;

/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║   LAYER 7: IP FINGERPRINT GEO-FENCE ENGINE (10X ADDITION)   ║
 * ║   Threat: Stolen JWT / Session Hijacking / Token Theft       ║
 * ║   Defense: Bind token to issuing IP, reject cross-IP reuse   ║
 * ╚══════════════════════════════════════════════════════════════╝
 *
 * This is your defense against MITM token theft scenarios.
 * Even if an attacker steals a valid JWT from a coffee shop network,
 * they cannot use it from a different IP because the token was
 * "fingerprinted" to the original client's IP at login.
 *
 * Algorithm:
 *   1. At LOGIN: store username -> issuing_ip in the fingerprint map.
 *   2. On every request: compare the current request IP to the stored IP.
 *   3. If they don't match: reject the request as a potential stolen token.
 *
 * Note: For users on mobile networks with dynamic IPs, or users behind
 * corporate NAT, consider relaxing this to CIDR /24 subnet matching.
 */
@Service
public class IpFingerprintService {

    // Maps username -> IP address at time of token issuance
    private final ConcurrentHashMap<String, String> fingerprintMap = new ConcurrentHashMap<>();

    /**
     * Called at login time to bind the token to the client's IP.
     */
    public void registerFingerprint(String username, String ipAddress) {
        fingerprintMap.put(username, ipAddress);
        System.out.printf("[GEO_FENCE] Token fingerprinted for user '%s' from IP: %s%n", username, ipAddress);
    }

    /**
     * Validates that the current request IP matches the fingerprinted IP.
     * Returns true if access should be DENIED.
     */
    public boolean isSuspiciousRequest(String username, String currentIp) {
        String originalIp = fingerprintMap.get(username);
        if (originalIp == null) return false; // No fingerprint yet (first request)
        
        if (!originalIp.equals(currentIp)) {
            System.err.printf("[GEO_FENCE] 🚨 SUSPICIOUS IP CHANGE for user '%s'. Original: %s | Current: %s%n",
                    username, originalIp, currentIp);
            return true;
        }
        return false;
    }

    /**
     * Remove fingerprint on logout.
     */
    public void clearFingerprint(String username) {
        fingerprintMap.remove(username);
    }
}
