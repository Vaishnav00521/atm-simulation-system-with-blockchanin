package com.global.atm_blockchain.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "scheduled_transactions")
public class ScheduledTransaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    private String type; // DEPOSIT, WITHDRAW, TRANSFER
    
    private String currency; // "USD", "ETH", etc.

    @Column(precision = 19, scale = 4)
    private BigDecimal amount;

    private String targetAddress; // Optional, for crypto transfers
    
    private String cronExpression; // E.g., "0 0 12 * * ?" for daily at noon

    private LocalDateTime nextExecutionTime;

    private Boolean active = true;

    // --- GETTERS AND SETTERS ---

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }

    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }

    public String getTargetAddress() { return targetAddress; }
    public void setTargetAddress(String targetAddress) { this.targetAddress = targetAddress; }

    public String getCronExpression() { return cronExpression; }
    public void setCronExpression(String cronExpression) { this.cronExpression = cronExpression; }

    public LocalDateTime getNextExecutionTime() { return nextExecutionTime; }
    public void setNextExecutionTime(LocalDateTime nextExecutionTime) { this.nextExecutionTime = nextExecutionTime; }

    public Boolean getActive() { return active; }
    public void setActive(Boolean active) { this.active = active; }
}
