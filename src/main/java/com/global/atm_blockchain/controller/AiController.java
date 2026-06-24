package com.global.atm_blockchain.controller;

import com.global.atm_blockchain.model.User;
import com.global.atm_blockchain.repository.UserRepository;
import com.global.atm_blockchain.service.AIAgentService;
import com.global.atm_blockchain.service.LisaAgentService;
import com.global.atm_blockchain.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/ai")
public class AiController {

    @Autowired
    private LisaAgentService lisaAgentService;

    @Autowired
    private AIAgentService aiAgentService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtUtil jwtUtil;

    @PostMapping("/chat")
    public Map<String, String> chat(
            @RequestHeader("Authorization") String tokenHeader,
            @RequestBody Map<String, String> request) {

        String message = request.get("message");
        String language = request.getOrDefault("language", "en");

        String token = tokenHeader.substring(7);
        String username = jwtUtil.extractUsername(token);

        String response = lisaAgentService.processCommand(message, username, language);

        return Map.of("response", response);
    }

    @PostMapping("/query")
    public ResponseEntity<Map<String, String>> askAgent(
            @RequestHeader("Authorization") String tokenHeader,
            @RequestBody Map<String, String> payload) {
        
        Map<String, String> response = new HashMap<>();
        try {
            String userPrompt = payload.get("prompt");
            
            // Extract the user to get real metrics
            String token = tokenHeader.substring(7);
            String username = jwtUtil.extractUsername(token);
            
            User user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("Secure Profile not found."));
            
            Map<String, Object> currentMetrics = new HashMap<>();
            currentMetrics.put("fiatBalance", user.getFiatBalance());
            currentMetrics.put("cryptoBalance", user.getCryptoBalance());

            String aiResponse = aiAgentService.consultAgent(userPrompt, currentMetrics);
            
            response.put("status", "Success");
            response.put("reply", aiResponse);
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            response.put("status", "Error");
            response.put("reply", "Agent connection bottlenecked: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
}