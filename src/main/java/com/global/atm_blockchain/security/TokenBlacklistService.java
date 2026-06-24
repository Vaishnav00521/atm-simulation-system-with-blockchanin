package com.global.atm_blockchain.security;

import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.HashSet;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║   LAYER 5: JWT TOKEN REVOCATION ENGINE (10X ADDITION)        ║
 * ║   Threat: Token Replay / Session Hijacking after logout       ║
 * ║   Defense: In-memory cryptographic blacklist                  ║
 * ╚══════════════════════════════════════════════════════════════╝
 *
 * This is a critical security gap in most JWT implementations.
 * Since JWTs are stateless by design, simply deleting them from
 * localStorage is NOT enough — the token is still mathematically
 * valid until it expires. If an attacker intercepted it, they can
 * still use it for hours (our tokens expire in 10 hours!).
 *
 * This blacklist maintains a set of revoked token signatures.
 * The JwtFilter checks this before allowing ANY request through.
 *
 * Production upgrade: Replace with Redis for distributed environments.
 */
@Service
public class TokenBlacklistService {

    // Thread-safe set of revoked JWT signatures
    private final Set<String> blacklistedTokens =
            Collections.newSetFromMap(new ConcurrentHashMap<>());

    /**
     * Revokes a token immediately upon logout.
     * Extracts the unique signature portion to minimize memory footprint.
     */
    public void revokeToken(String bearerToken) {
        if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
            String token = bearerToken.substring(7);
            // Store only the signature portion (last segment) — unique per token
            String[] parts = token.split("\\.");
            if (parts.length == 3) {
                blacklistedTokens.add(parts[2]); // JWT signature = parts[2]
            }
        }
    }

    /**
     * Checks if a token has been explicitly revoked by the user or system.
     */
    public boolean isBlacklisted(String token) {
        if (token == null) return false;
        String[] parts = token.split("\\.");
        if (parts.length != 3) return false;
        return blacklistedTokens.contains(parts[2]);
    }

    /**
     * Returns count of currently revoked tokens (for monitoring/metrics).
     */
    public int getRevokedTokenCount() {
        return blacklistedTokens.size();
    }
}
