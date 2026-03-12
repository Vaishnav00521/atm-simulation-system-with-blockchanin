package com.global.atm_blockchain.controller;

import com.global.atm_blockchain.dto.DashboardMetrics;
import com.global.atm_blockchain.model.User;
import com.global.atm_blockchain.repository.UserRepository;
import com.global.atm_blockchain.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/dashboard")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174"})
public class DashboardController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtUtil jwtUtil;

    @GetMapping("/metrics")
    public DashboardMetrics getLiveMetrics(@RequestHeader("Authorization") String tokenHeader) {

        // 1. Extract and verify the active user from the JWT
        String token = tokenHeader.substring(7); // Remove "Bearer "
        String username = jwtUtil.extractUsername(token);

        // 2. Fetch their specific ledger from MySQL
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Secure Profile not found."));

        // 3. Package the live data and return it to React
        // We inject the live Fiat and Crypto balances, while mocking the global network stats for effect.
        return new DashboardMetrics(
                user.getFiatBalance(),
                user.getCryptoBalance(),
                "Optimal (14 Nodes)",
                1204
        );
    }
}