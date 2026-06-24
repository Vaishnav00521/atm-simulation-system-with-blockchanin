package com.global.atm_blockchain.controller;

import com.global.atm_blockchain.model.ScheduledTransaction;
import com.global.atm_blockchain.service.ScheduledTransactionService;
import com.global.atm_blockchain.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/schedules")
public class ScheduledTransactionController {

    @Autowired
    private ScheduledTransactionService scheduledTransactionService;

    @Autowired
    private JwtUtil jwtUtil;

    @GetMapping
    public ResponseEntity<List<ScheduledTransaction>> getSchedules(@RequestHeader("Authorization") String tokenHeader) {
        String username = jwtUtil.extractUsername(tokenHeader.substring(7));
        List<ScheduledTransaction> schedules = scheduledTransactionService.getUserSchedules(username);
        return ResponseEntity.ok(schedules);
    }

    @PostMapping
    public ResponseEntity<?> createSchedule(
            @RequestHeader("Authorization") String tokenHeader,
            @RequestBody ScheduledTransaction request) {
        try {
            String username = jwtUtil.extractUsername(tokenHeader.substring(7));
            ScheduledTransaction created = scheduledTransactionService.createSchedule(username, request);
            return ResponseEntity.ok(created);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Failed to create schedule: " + e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> cancelSchedule(
            @RequestHeader("Authorization") String tokenHeader,
            @PathVariable Long id) {
        try {
            String username = jwtUtil.extractUsername(tokenHeader.substring(7));
            scheduledTransactionService.cancelSchedule(username, id);
            return ResponseEntity.ok(Map.of("message", "Schedule cancelled successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Failed to cancel schedule: " + e.getMessage()));
        }
    }
}
