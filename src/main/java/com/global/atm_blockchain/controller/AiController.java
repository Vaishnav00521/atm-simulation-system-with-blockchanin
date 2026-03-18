package com.global.atm_blockchain.controller;

import com.global.atm_blockchain.service.LisaAgentService;
import com.global.atm_blockchain.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/ai")
public class AiController {

    @Autowired
    private LisaAgentService lisaAgentService;

    @Autowired
    private JwtUtil jwtUtil;

    @PostMapping("/chat")
    public Map<String, String> chat(
            @RequestHeader("Authorization") String tokenHeader,
            @RequestBody Map<String, String> request) {

        // Extract both parameters sent by LisaAI.jsx
        String message = request.get("message");
        String language = request.getOrDefault("language", "en"); // Defaults to English if missing

        // Extract the user
        String token = tokenHeader.substring(7);
        String username = jwtUtil.extractUsername(token);

        // Route to the new Lisa service
        String response = lisaAgentService.processCommand(message, username, language);

        return Map.of("response", response);
    }
}