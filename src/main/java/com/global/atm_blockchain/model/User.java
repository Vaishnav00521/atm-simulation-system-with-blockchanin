package com.global.atm_blockchain.model;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String username;

    @Column(nullable = false)
    private String password;

    private String role = "USER";

    // --- Legacy ATM Engine Fields ---
    private BigDecimal balance = BigDecimal.ZERO;
    private String accountNumber;

    // 🛡️ THE FIX: Adding the missing database column
    @Column(name = "kyc_verified")
    private Boolean kycVerified = false;

    // --- New Web3 Institutional Dashboard Fields ---
    private Double fiatBalance = 0.0;
    private Double cryptoBalance = 0.0;
    private String walletAddress;

    // ==========================================
    // EXPLICIT GETTERS AND SETTERS
    // ==========================================

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public BigDecimal getBalance() { return balance; }
    public void setBalance(BigDecimal balance) { this.balance = balance; }

    public String getAccountNumber() { return accountNumber; }
    public void setAccountNumber(String accountNumber) { this.accountNumber = accountNumber; }

    public Boolean getKycVerified() { return kycVerified; }
    public void setKycVerified(Boolean kycVerified) { this.kycVerified = kycVerified; }

    public Double getFiatBalance() { return fiatBalance; }
    public void setFiatBalance(Double fiatBalance) { this.fiatBalance = fiatBalance; }

    public Double getCryptoBalance() { return cryptoBalance; }
    public void setCryptoBalance(Double cryptoBalance) { this.cryptoBalance = cryptoBalance; }

    public String getWalletAddress() { return walletAddress; }
    public void setWalletAddress(String walletAddress) { this.walletAddress = walletAddress; }
}