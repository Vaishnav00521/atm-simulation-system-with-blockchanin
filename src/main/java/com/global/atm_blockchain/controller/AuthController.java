package com.global.atm_blockchain.controller;

import com.global.atm_blockchain.model.User;
import com.global.atm_blockchain.repository.UserRepository;
import com.global.atm_blockchain.security.AuditLogService;
import com.global.atm_blockchain.security.AuthenticatedEncryptionEngine;
import com.global.atm_blockchain.security.IpFingerprintService;
import com.global.atm_blockchain.security.TokenBlacklistService;
import com.global.atm_blockchain.service.TotpService;
import com.global.atm_blockchain.util.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private TotpService totpService;


    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    // ─── Layer 5, 6, 7 Integrations ─────────────────────────────
    @Autowired
    private TokenBlacklistService tokenBlacklistService;

    @Autowired
    private IpFingerprintService ipFingerprintService;

    @Autowired
    private AuditLogService auditLogService;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Map<String, String> userData, HttpServletRequest request) {
        String clientIp = resolveClientIp(request);
        try {
            String username = userData.get("username");
            String password = userData.get("password");

            if (username == null || username.trim().isEmpty() || password == null || password.trim().isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("message", "Username and password cannot be empty"));
            }

            if (userRepository.findByUsername(username).isPresent()) {
                auditLogService.logFailure(username, "REGISTER", "Duplicate username attempt", clientIp);
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("message", "Username already exists!"));
            }

            User newUser = new User();
            newUser.setUsername(username);
            newUser.setPassword(passwordEncoder.encode(password));

            String generatedAccountNumber = String.valueOf((long) (Math.random() * 9000000000L) + 1000000000L);
            newUser.setAccountNumber(generatedAccountNumber);
            newUser.setKycVerified(true);
            newUser.setFiatBalance(15000.00);
            newUser.setCryptoBalance(2.5);

            userRepository.save(newUser);

            String token = jwtUtil.generateToken(username);

            // Layer 7: Fingerprint new user's IP at registration
            ipFingerprintService.registerFingerprint(username, clientIp);
            // Layer 6: Audit log the registration event
            auditLogService.logSuccess(username, "REGISTER", "Account created | Account#: " + generatedAccountNumber, clientIp);

            return ResponseEntity.ok(Map.of("token", token, "username", username, "message", "Registration successful"));
        } catch (Exception e) {
            auditLogService.logFailure("UNKNOWN", "REGISTER", "Server error: " + e.getMessage(), clientIp);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Registration failed: " + e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> credentials, HttpServletRequest request) {
        String clientIp = resolveClientIp(request);
        try {
            String username = credentials.get("username");
            String password = credentials.get("password");
            String totpCodeStr = credentials.get("totpCode");

            if (username == null || password == null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("message", "Username and password are required"));
            }

            Optional<User> userOpt = userRepository.findByUsername(username);

            if (userOpt.isPresent() && passwordEncoder.matches(password, userOpt.get().getPassword())) {
                User user = userOpt.get();

                // Layer 8: TOTP Gate
                if (Boolean.TRUE.equals(user.getTotpEnabled())) {
                    if (totpCodeStr == null || totpCodeStr.trim().isEmpty()) {
                        // Return 202 Accepted to tell frontend we need the TOTP code
                        return ResponseEntity.status(HttpStatus.ACCEPTED)
                                .body(Map.of("requiresTotp", true, "message", "TOTP code required"));
                    }

                    try {
                        int totpCode = Integer.parseInt(totpCodeStr);
                        String rawSecret = user.getTotpSecret();
                        if (!totpService.verifyCode(rawSecret, totpCode)) {
                            auditLogService.logFailure(username, "LOGIN_FAILED", "Invalid TOTP code from IP: " + clientIp, clientIp);
                            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                                    .body(Map.of("message", "Invalid TOTP code"));
                        }
                    } catch (Exception e) {
                        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                                .body(Map.of("message", "Invalid TOTP format"));
                    }
                }

                String token = jwtUtil.generateToken(username);

                // Layer 7: Fingerprint the IP this token was issued from
                ipFingerprintService.registerFingerprint(username, clientIp);
                // Layer 6: Audit log successful login
                auditLogService.logSuccess(username, "LOGIN", "Authenticated from IP: " + clientIp + (Boolean.TRUE.equals(user.getTotpEnabled()) ? " (with TOTP)" : ""), clientIp);

                // Build enriched response
                Map<String, Object> responseBody = new HashMap<>();
                responseBody.put("token", token);
                responseBody.put("username", username);
                responseBody.put("status", "success");
                responseBody.put("antiPhishingPhrase",
                        user.getAntiPhishingPhrase() != null ? user.getAntiPhishingPhrase() : "");
                responseBody.put("totpEnabled",
                        user.getTotpEnabled() != null ? user.getTotpEnabled() : false);

                return ResponseEntity.ok(responseBody);
            } else {
                // Layer 6: Audit log failed login attempt (credential stuffing detection)
                auditLogService.logFailure(username != null ? username : "UNKNOWN",
                        "LOGIN_FAILED", "Invalid credentials from IP: " + clientIp, clientIp);
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("message", "Invalid Credentials"));
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Login failed: " + e.getMessage()));
        }
    }

    /**
     * Layer 5: Logout endpoint — revokes the JWT immediately so it cannot be replayed.
     */
    @PostMapping("/logout")
    public ResponseEntity<?> logout(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            HttpServletRequest request) {
        String clientIp = resolveClientIp(request);
        try {
            if (authHeader != null) {
                String username = "UNKNOWN";
                try {
                    username = jwtUtil.extractUsername(authHeader.substring(7));
                } catch (Exception ignored) {}

                // Layer 5: Blacklist the token immediately
                tokenBlacklistService.revokeToken(authHeader);
                // Layer 7: Clear the IP fingerprint
                ipFingerprintService.clearFingerprint(username);
                // Layer 6: Audit the logout
                auditLogService.logSuccess(username, "LOGOUT", "Token revoked", clientIp);
            }
            return ResponseEntity.ok(Map.of("message", "Logged out securely. Token has been revoked."));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Logout error: " + e.getMessage()));
        }
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

    /**
     * Set or update the user's anti-phishing phrase.
     * PUT /api/auth/anti-phishing
     * Body: { "phrase": "MySecretWord" }
     */
    @PutMapping("/anti-phishing")
    public ResponseEntity<?> setAntiPhishingPhrase(@RequestBody Map<String, String> body) {
        try {
            String username = SecurityContextHolder.getContext().getAuthentication().getName();
            String phrase = body.get("phrase");
            if (phrase == null || phrase.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("message", "Phrase cannot be empty"));
            }
            Optional<User> userOpt = userRepository.findByUsername(username);
            if (userOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "User not found"));
            }
            User user = userOpt.get();
            user.setAntiPhishingPhrase(phrase.trim());
            userRepository.save(user);
            auditLogService.logSuccess(username, "ANTI_PHISHING_SET", "Phrase updated", "system");
            return ResponseEntity.ok(Map.of("message", "Anti-phishing phrase updated successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Failed to update phrase: " + e.getMessage()));
        }
    }
}