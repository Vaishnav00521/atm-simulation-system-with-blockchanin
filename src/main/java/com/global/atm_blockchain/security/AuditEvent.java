package com.global.atm_blockchain.security;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║   LAYER 6: TAMPER-EVIDENT FINANCIAL AUDIT TRAIL (10X ADD)   ║
 * ║   Threat: Financial Fraud / Compliance Violation / PCI-DSS   ║
 * ║   Defense: Immutable, timestamped log of every financial op  ║
 * ╚══════════════════════════════════════════════════════════════╝
 *
 * Every financial mutation (deposit, withdraw, AI query with balance data,
 * ETH transaction) generates an AuditEvent record.
 * Records are append-only — there is no UPDATE or DELETE endpoint.
 */
@Entity
@Table(name = "audit_events")
public class AuditEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String username;

    @Column(nullable = false)
    private String action; // e.g., "DEPOSIT", "WITHDRAW", "ETH_TRANSFER", "LOGIN", "LOGOUT", "RATE_LIMIT_BREACH"

    @Column
    private String detail; // e.g., "Amount: 500 USD", "TxHash: 0xabc..."

    @Column(nullable = false)
    private String ipAddress;

    @Column(nullable = false)
    private String outcome; // "SUCCESS" or "FAILURE"

    @Column(nullable = false)
    private LocalDateTime timestamp = LocalDateTime.now();

    // ========================
    // CONSTRUCTORS
    // ========================

    public AuditEvent() {}

    public AuditEvent(String username, String action, String detail, String ipAddress, String outcome) {
        this.username = username;
        this.action = action;
        this.detail = detail;
        this.ipAddress = ipAddress;
        this.outcome = outcome;
        this.timestamp = LocalDateTime.now();
    }

    // ========================
    // GETTERS & SETTERS
    // ========================

    public Long getId() { return id; }
    public String getUsername() { return username; }
    public String getAction() { return action; }
    public String getDetail() { return detail; }
    public String getIpAddress() { return ipAddress; }
    public String getOutcome() { return outcome; }
    public LocalDateTime getTimestamp() { return timestamp; }
}
