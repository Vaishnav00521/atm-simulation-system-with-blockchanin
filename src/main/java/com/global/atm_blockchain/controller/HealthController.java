package com.global.atm_blockchain.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
public class HealthController {

    @GetMapping("/")
    public ResponseEntity<Map<String, String>> healthCheck() {
        Map<String, String> response = new HashMap<>();
        response.put("status", "Online");
        response.put("message", "Global ATM Blockchain Engine is running securely.");
        response.put("environment", "Production");
        return ResponseEntity.ok(response);
    }
}
