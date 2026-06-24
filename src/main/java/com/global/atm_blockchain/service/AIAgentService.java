package com.global.atm_blockchain.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class AIAgentService {

    @Value("${gemini.api.key}")
    private String apiKey;

    private final HttpClient httpClient = HttpClient.newHttpClient();
    private final ObjectMapper objectMapper = new ObjectMapper();

    // Strict system instructions to enforce accuracy and prevent hallucinations
    private final String SYSTEM_INSTRUCTION = 
        "You are the Core AI Agent for the Global ATM Blockchain Platform. " +
        "You have direct visibility over the user's balances and Sepolia smart contract actions. " +
        "Be extremely precise, concise, and professional. Never hallucinate transaction status. " +
        "If asked about processing speeds, remind the user that blocks on Sepolia mine in 12-15 seconds.";

    public String consultAgent(String userPrompt, Map<String, Object> currentMetrics) throws Exception {
        String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + apiKey;

        // Bundle system instructions, current system metrics context, and user prompt
        String contextualPrompt = String.format(
            "System Context: Current Fiat Balance is $%s, Crypto Balance is %s ETH. User Question: %s",
            currentMetrics.getOrDefault("fiatBalance", "0.00"),
            currentMetrics.getOrDefault("cryptoBalance", "0.00"),
            userPrompt
        );

        // Build native payload matching the official Gemini REST specifications
        Map<String, Object> requestBody = new HashMap<>();
        
        Map<String, Object> systemInstructionMap = new HashMap<>();
        systemInstructionMap.put("parts", List.of(Map.of("text", SYSTEM_INSTRUCTION)));
        requestBody.put("systemInstruction", systemInstructionMap);

        Map<String, Object> contentsMap = new HashMap<>();
        contentsMap.put("parts", List.of(Map.of("text", contextualPrompt)));
        requestBody.put("contents", List.of(contentsMap));

        String jsonPayload = objectMapper.writeValueAsString(requestBody);

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(url))
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(jsonPayload))
                .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

        if (response.statusCode() != 200) {
            throw new RuntimeException("Gemini API Error: Status Code " + response.statusCode());
        }

        // Parse response cleanly down to the generated text part
        Map<?, ?> responseMap = objectMapper.readValue(response.body(), Map.class);
        List<?> candidates = (List<?>) responseMap.get("candidates");
        Map<?, ?> firstCandidate = (Map<?, ?>) candidates.get(0);
        Map<?, ?> content = (Map<?, ?>) firstCandidate.get("content");
        List<?> parts = (List<?>) content.get("parts");
        Map<?, ?> firstPart = (Map<?, ?>) parts.get(0);

        return firstPart.get("text").toString();
    }
}
