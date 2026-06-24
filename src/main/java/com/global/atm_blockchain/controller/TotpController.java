package com.global.atm_blockchain.controller;

import com.global.atm_blockchain.model.User;
import com.global.atm_blockchain.repository.UserRepository;
import com.global.atm_blockchain.security.AuthenticatedEncryptionEngine;
import com.global.atm_blockchain.service.TotpService;
import com.global.atm_blockchain.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

/**
 * TotpController — Handles TOTP 2FA setup and verification.
 */
@RestController
@RequestMapping("/api/totp")
public class TotpController {

    @Autowired
    private TotpService totpService;

    @Autowired
    private UserRepository userRepository;


    @Autowired
    private JwtUtil jwtUtil;

    /**
     * Step 1: Generate a new secret and return the QR code URI.
     * Note: This does not enable TOTP yet. The user must verify a code first.
     */
    @GetMapping("/setup")
    public ResponseEntity<Map<String, Object>> setupTotp(@RequestHeader("Authorization") String tokenHeader) throws Exception {
        String username = jwtUtil.extractUsername(tokenHeader.substring(7));
        Optional<User> userOpt = userRepository.findByUsername(username);

        if (userOpt.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("error", true, "message", "User not found"));
        }

        String rawSecret = totpService.generateSecret();
        String qrUri = totpService.getQrCodeUri(username, rawSecret);

        // The @Convert annotation on totpSecret handles encryption automatically
        User user = userOpt.get();
        user.setTotpSecret(rawSecret);
        user.setTotpEnabled(false);
        userRepository.save(user);

        Map<String, Object> response = new HashMap<>();
        response.put("secret", rawSecret);
        response.put("qrUri", qrUri);
        return ResponseEntity.ok(response);
    }

    /**
     * Step 2: Verify the first code to finalize and enable TOTP.
     */
    @PostMapping("/verify-setup")
    public ResponseEntity<Map<String, Object>> verifySetup(
            @RequestHeader("Authorization") String tokenHeader,
            @RequestBody Map<String, Integer> payload) throws Exception {

        String username = jwtUtil.extractUsername(tokenHeader.substring(7));
        Integer code = payload.get("code");

        if (code == null) {
            return ResponseEntity.badRequest().body(Map.of("error", true, "message", "Code required"));
        }

        Optional<User> userOpt = userRepository.findByUsername(username);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("error", true, "message", "User not found"));
        }

        User user = userOpt.get();
        if (user.getTotpSecret() == null) {
            return ResponseEntity.badRequest().body(Map.of("error", true, "message", "TOTP not configured"));
        }

        String rawSecret = user.getTotpSecret(); // Automatically decrypted by JPA
        boolean isValid = totpService.verifyCode(rawSecret, code);

        if (isValid) {
            user.setTotpEnabled(true);
            userRepository.save(user);
            return ResponseEntity.ok(Map.of("success", true, "message", "TOTP enabled successfully"));
        } else {
            return ResponseEntity.status(401).body(Map.of("error", true, "message", "Invalid verification code"));
        }
    }
}
