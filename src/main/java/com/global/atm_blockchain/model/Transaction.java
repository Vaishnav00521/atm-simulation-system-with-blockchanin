package com.global.atm_blockchain.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "transactions")
public class Transaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String type; // DEPOSIT, WITHDRAW, CRYPTO_TRANSFER

    @Column(precision = 19, scale = 4)
    private BigDecimal amount;

    private LocalDateTime timestamp;
    private String txHash;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    // --- GETTERS AND SETTERS ---

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }

    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }

    public String getTxHash() { return txHash; }
    public void setTxHash(String txHash) { this.txHash = txHash; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    @PrePersist
    protected void onCreate() { this.timestamp = LocalDateTime.now(); }

    // ... existing fields (id, type, amount...)

    // --- NEW GLOBAL FIELDS ---

    private String currency; // "USD", "EUR", "ETH"

    @Column(precision = 19, scale = 4)
    private BigDecimal fee;  // The bank makes money here!

    private String status;   // "SUCCESS", "PENDING", "FAILED"

    @Column(unique = true)
    private String referenceId; // Unique Global ID (e.g., "TXN-2024-998877")

    // --- NEW GETTERS AND SETTERS ---

    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }

    public BigDecimal getFee() { return fee; }
    public void setFee(BigDecimal fee) { this.fee = fee; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getReferenceId() { return referenceId; }
    public void setReferenceId(String referenceId) { this.referenceId = referenceId; }
}