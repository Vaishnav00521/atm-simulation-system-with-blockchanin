package com.global.atm_blockchain.controller;

import com.global.atm_blockchain.security.AuditEvent;
import com.global.atm_blockchain.repository.AuditEventRepository;
import com.global.atm_blockchain.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * AuditController — Exposes the immutable audit log to the frontend.
 *
 * All events (login, logout, deposit, withdraw, security changes, rate limits)
 * are stored by AuditLogService and surfaced here for the Account Activity page.
 */
@RestController
@RequestMapping("/api/audit")
public class AuditController {

    @Autowired
    private AuditEventRepository auditEventRepository;

    @Autowired
    private JwtUtil jwtUtil;

    /**
     * GET /api/audit/events
     * Returns paginated audit events for the authenticated user.
     * Query params: page (0-indexed), size (default 20), action (optional filter)
     */
    @GetMapping("/events")
    public ResponseEntity<Map<String, Object>> getAuditEvents(
            @RequestHeader("Authorization") String tokenHeader,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String action) {

        String username = jwtUtil.extractUsername(tokenHeader.substring(7));

        Page<AuditEvent> eventPage;
        PageRequest pageable = PageRequest.of(page, size, Sort.by("timestamp").descending());

        if (action != null && !action.isEmpty()) {
            // Filter by action type — uses native query fallback
            eventPage = auditEventRepository.findByUsernameAndActionContainingIgnoreCaseOrderByTimestampDesc(
                    username, action, pageable);
        } else {
            eventPage = auditEventRepository.findByUsernameOrderByTimestampDesc(username, pageable);
        }

        List<Map<String, Object>> events = eventPage.getContent().stream().map(e -> {
            Map<String, Object> ev = new HashMap<>();
            ev.put("id",        e.getId());
            ev.put("action",    e.getAction());
            ev.put("detail",    e.getDetail());
            ev.put("timestamp", e.getTimestamp());
            ev.put("ipAddress", e.getIpAddress());
            ev.put("outcome",   e.getOutcome());
            return ev;
        }).collect(Collectors.toList());

        Map<String, Object> response = new HashMap<>();
        response.put("events",      events);
        response.put("totalPages",  eventPage.getTotalPages());
        response.put("totalEvents", eventPage.getTotalElements());
        response.put("currentPage", page);

        return ResponseEntity.ok(response);
    }
}
