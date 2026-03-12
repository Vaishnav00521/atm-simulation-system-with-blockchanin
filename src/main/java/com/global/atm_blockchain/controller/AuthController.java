package com.global.atm_blockchain.controller;

import com.global.atm_blockchain.model.User;
import com.global.atm_blockchain.repository.UserRepository;
import com.global.atm_blockchain.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174"})
public class AuthController {

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @PostMapping("/register")
    public Map<String, String> register(@RequestBody Map<String, String> userData) {
        String username = userData.get("username");
        String password = userData.get("password");

        if (userRepository.findByUsername(username).isPresent()) {
            throw new RuntimeException("Username already exists!");
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
        return Map.of("token", token, "username", username, "message", "Registration successful");
    }

    @PostMapping("/login")
    public Map<String, String> login(@RequestBody Map<String, String> credentials) {
        String username = credentials.get("username");
        String password = credentials.get("password");

        Optional<User> userOpt = userRepository.findByUsername(username);

        if (userOpt.isPresent() && passwordEncoder.matches(password, userOpt.get().getPassword())) {
            String token = jwtUtil.generateToken(username);
            return Map.of("token", token, "username", username, "status", "success");
        } else {
            throw new RuntimeException("Invalid Credentials");
        }
    }
}