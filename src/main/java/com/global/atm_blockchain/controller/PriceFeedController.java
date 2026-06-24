package com.global.atm_blockchain.controller;

import com.global.atm_blockchain.exception.VelocityLimitExceededException;
import com.global.atm_blockchain.service.PriceFeedService;
import com.global.atm_blockchain.service.VelocityLimitService;
import com.global.atm_blockchain.repository.UserRepository;
import com.global.atm_blockchain.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/prices")
public class PriceFeedController {

    @Autowired
    private PriceFeedService priceFeedService;

    @Autowired
    private VelocityLimitService velocityLimitService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtUtil jwtUtil;

    /**
     * GET /api/prices/eth
     * Returns current ETH prices in USD, EUR, and INR.
     * Public endpoint — no auth required.
     */
    @GetMapping("/eth")
    public ResponseEntity<Map<String, Object>> getEthPrices() {
        Map<String, Double> prices = priceFeedService.getCurrentPrices();
        Map<String, Object> response = new HashMap<>(prices);
        response.put("lastUpdated", priceFeedService.getLastFetchTime());
        return ResponseEntity.ok(response);
    }

    /**
     * GET /api/prices/velocity
     * Returns the authenticated user's current velocity limit usage.
     */
    @GetMapping("/velocity")
    public ResponseEntity<Map<String, Object>> getVelocityStatus(
            @RequestHeader("Authorization") String tokenHeader) {
        try {
            String username = jwtUtil.extractUsername(tokenHeader.substring(7));
            var userOpt = userRepository.findByUsername(username);
            if (userOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            VelocityLimitService.VelocityStatus status =
                    velocityLimitService.getStatus(userOpt.get().getId());

            Map<String, Object> response = new HashMap<>();
            response.put("fiatDailyUsed",  status.fiatDailyUsed());
            response.put("fiatDailyLimit", status.fiatDailyLimit());
            response.put("fiatWeeklyUsed", status.fiatWeeklyUsed());
            response.put("fiatWeeklyLimit", status.fiatWeeklyLimit());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}
