package com.global.atm_blockchain.controller;

import com.global.atm_blockchain.security.AuditLogService;
import com.global.atm_blockchain.security.IpFingerprintService;
import com.global.atm_blockchain.service.WebAuthnService;
import com.global.atm_blockchain.util.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth/webauthn")
public class WebAuthnController {

    @Autowired
    private WebAuthnService webAuthnService;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private AuditLogService auditLogService;

    @Autowired
    private IpFingerprintService ipFingerprintService;

    // A helper method to resolve IP Address
    private String resolveClientIp(HttpServletRequest request) {
        String xfHeader = request.getHeader("X-Forwarded-For");
        if (xfHeader == null) {
            return request.getRemoteAddr();
        }
        return xfHeader.split(",")[0];
    }

    @PostMapping("/register/start")
    public ResponseEntity<?> startRegistration(@RequestBody Map<String, String> payload) {
        try {
            String username = payload.get("username");
            String options = webAuthnService.startRegistration(username);
            return ResponseEntity.ok(options);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Failed to start registration"));
        }
    }

    @PostMapping("/register/finish")
    public ResponseEntity<?> finishRegistration(@RequestBody Map<String, String> payload, HttpServletRequest request) {
        try {
            String username = payload.get("username");
            String responseJson = payload.get("responseJson");
            webAuthnService.finishRegistration(username, responseJson);

            String clientIp = resolveClientIp(request);
            auditLogService.logSuccess(username, "WEBAUTHN_REGISTER", "Registered a new WebAuthn credential", clientIp);

            return ResponseEntity.ok(Map.of("message", "Registration successful"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Failed to finish registration"));
        }
    }

    @PostMapping("/authenticate/start")
    public ResponseEntity<?> startAuthentication(@RequestBody Map<String, String> payload) {
        try {
            String username = payload.get("username");
            String options = webAuthnService.startAuthentication(username);
            return ResponseEntity.ok(options);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Failed to start authentication"));
        }
    }

    @PostMapping("/authenticate/finish")
    public ResponseEntity<?> finishAuthentication(@RequestBody Map<String, String> payload, HttpServletRequest request) {
        try {
            String username = payload.get("username");
            String responseJson = payload.get("responseJson");

            String clientIp = resolveClientIp(request);

            boolean success = webAuthnService.finishAuthentication(username, responseJson);
            if (success) {
                String token = jwtUtil.generateToken(username);
                ipFingerprintService.registerFingerprint(username, clientIp);
                auditLogService.logSuccess(username, "LOGIN", "Authenticated via WebAuthn", clientIp);
                return ResponseEntity.ok(Map.of("token", token, "username", username));
            } else {
                auditLogService.logFailure(username, "LOGIN_FAILED", "Invalid WebAuthn assertion", clientIp);
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("message", "Authentication failed"));
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Failed to process assertion"));
        }
    }
}
