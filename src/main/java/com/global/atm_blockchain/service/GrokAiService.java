package com.global.atm_blockchain.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class GrokAiService {

    @Value("${ollama.api.url:http://localhost:11434/api/chat}")
    private String ollamaApiUrl;

    @Value("${ollama.model:llama3}")
    private String ollamaModel;

    private final RestTemplate restTemplate = new RestTemplate();

    // 🛡️ ADDED THIS ANNOTATION TO SILENCE THE COMPILER WARNING
    @SuppressWarnings("unchecked")
    public String getAiResponse(String userMessage) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        String systemPrompt = "You are Emlie, a highly professional, secure, and helpful female AI banking assistant for Global ATM. " +
                "You assist users with cross-border transfers, risk management, crypto vaults, and compliance. " +
                "You are fluent in English, Hindi, Gujarati, and Marathi. Always reply in the language the user speaks to you. " +
                "Keep responses concise, professional, and empathetic.";

        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("model", ollamaModel);
        requestBody.put("stream", false);
        requestBody.put("messages", List.of(
                Map.of("role", "system", "content", systemPrompt),
                Map.of("role", "user", "content", userMessage)
        ));

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(ollamaApiUrl, entity, Map.class);
            Map<String, Object> message = (Map<String, Object>) response.getBody().get("message");
            return (String) message.get("content");
        } catch (Exception e) {
            System.err.println("OLLAMA OFFLINE: " + e.getMessage());
            return "My local neural link is currently offline. Please ensure the Ollama server is running on port 11434.";
        }
    }
}