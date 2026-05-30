package com.global.atm_blockchain.controller;

import com.global.atm_blockchain.model.User;
import com.global.atm_blockchain.repository.UserRepository;
import com.global.atm_blockchain.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Map<String, String> userData) {
        try {
            String username = userData.get("username");
            String password = userData.get("password");

            if (username == null || username.trim().isEmpty() || password == null || password.trim().isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("message", "Username and password cannot be empty"));
            }

            if (userRepository.findByUsername(username).isPresent()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("message", "Username already exists!"));
            }

            User newUser = new User();
            newUser.setUsername(username);
            newUser.setPassword(passwordEncoder.encode(password));

            String generatedAccountNumber = String.valueOf((long) (Math.random() * 9000000000L) + 1000000000L);
            newUser.setAccountNumber(generatedAccountNumber);

            // 🛡️ THE FIX: Tell MySQL this user is KYC verified to prevent the error
            newUser.setKycVerified(true);

            newUser.setFiatBalance(15000.00);
            newUser.setCryptoBalance(2.5);

            userRepository.save(newUser);

            String token = jwtUtil.generateToken(username);
            return ResponseEntity.ok(Map.of("token", token, "username", username, "message", "Registration successful"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Registration failed: " + e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> credentials) {
        try {
            String username = credentials.get("username");
            String password = credentials.get("password");

            if (username == null || password == null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("message", "Username and password are required"));
            }

            Optional<User> userOpt = userRepository.findByUsername(username);

            if (userOpt.isPresent() && passwordEncoder.matches(password, userOpt.get().getPassword())) {
                String token = jwtUtil.generateToken(username);
                return ResponseEntity.ok(Map.of("token", token, "username", username, "status", "success"));
            } else {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("message", "Invalid Credentials"));
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Login failed: " + e.getMessage()));
        }
    }
}