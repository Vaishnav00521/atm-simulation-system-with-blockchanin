package com.global.atm_blockchain.controller;

import com.global.atm_blockchain.service.EthereumService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/transactions")
public class TransactionApiController {

    private final EthereumService ethereumService;
    private final com.global.atm_blockchain.security.AuditLogService auditLogService;

    public TransactionApiController(EthereumService ethereumService, com.global.atm_blockchain.security.AuditLogService auditLogService) {
        this.ethereumService = ethereumService;
        this.auditLogService = auditLogService;
    }

    @PostMapping("/execute")
    public ResponseEntity<Map<String, Object>> executeTransaction(@RequestBody Map<String, Object> payload, jakarta.servlet.http.HttpServletRequest request) {
        // Extract username from Spring Security context
        String username = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication().getName();
        String clientIp = request.getRemoteAddr();
        String type = "UNKNOWN";
        
        try {
            type = (String) payload.get("type");
            double amountInEther = Double.parseDouble(payload.get("amount").toString());

            String transactionHash = ethereumService.executeTransaction(type, amountInEther);

            // Layer 6: Log successful financial execution
            auditLogService.logSuccess(username, type.toUpperCase(), "Amount: " + amountInEther + " ETH | Hash: " + transactionHash, clientIp);

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "transactionHash", transactionHash
            ));
        } catch (Exception e) {
            // Layer 6: Log failed financial execution
            auditLogService.logFailure(username, type.toUpperCase() + "_FAILED", "Error: " + e.getMessage(), clientIp);
            throw new RuntimeException(e.getMessage(), e);
        }
    }
}
