package com.global.atm_blockchain.service;

import com.warrenstrange.googleauth.GoogleAuthenticator;
import com.warrenstrange.googleauth.GoogleAuthenticatorKey;
import org.springframework.stereotype.Service;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║   TOTP ENGINE — Google Authenticator / Authy Integration    ║
 * ║   RFC 6238 Time-based One-Time Password implementation      ║
 * ║   Even with stolen credentials, no access without phone     ║
 * ╚══════════════════════════════════════════════════════════════╝
 */
@Service
public class TotpService {

    private final GoogleAuthenticator gAuth = new GoogleAuthenticator();

    /**
     * Generates a new TOTP secret key for a user.
     * The secret is Base32-encoded and should be stored encrypted.
     */
    public String generateSecret() {
        GoogleAuthenticatorKey credentials = gAuth.createCredentials();
        return credentials.getKey();
    }

    /**
     * Returns an otpauth:// URI that encodes into a scannable QR code.
     * Compatible with Google Authenticator, Authy, Microsoft Authenticator.
     */
    public String getQrCodeUri(String username, String secret) {
        String encodedUser   = URLEncoder.encode(username, StandardCharsets.UTF_8);
        String encodedIssuer = URLEncoder.encode("GlobalATM", StandardCharsets.UTF_8);
        return String.format(
                "otpauth://totp/GlobalATM:%s?secret=%s&issuer=%s&algorithm=SHA1&digits=6&period=30",
                encodedUser, secret, encodedIssuer
        );
    }

    /**
     * Validates a 6-digit TOTP code against the stored secret.
     * Accepts codes from the current and ±1 time windows (30s tolerance).
     */
    public boolean verifyCode(String secret, int code) {
        try {
            return gAuth.authorize(secret, code);
        } catch (Exception e) {
            return false;
        }
    }
}
