package com.global.atm_blockchain.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import com.global.atm_blockchain.security.AuthenticatedEncryptionEngine;

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
    
    @Convert(converter = AuthenticatedEncryptionEngine.class)
    @Column(length = 500) // Encrypted payload is longer than 255 chars
    private String accountNumber;

    // 🛡️ THE FIX: Adding the missing database column
    @Column(name = "kyc_verified")
    private Boolean kycVerified = false;

    // --- New Web3 Institutional Dashboard Fields ---
    private Double fiatBalance = 0.0;
    private Double cryptoBalance = 0.0;
    
    @Convert(converter = AuthenticatedEncryptionEngine.class)
    @Column(length = 500)
    private String walletAddress;

    // --- Security Enhancement Fields ---

    // Anti-phishing: user's secret word shown on every login
    @Column(name = "anti_phishing_phrase")
    private String antiPhishingPhrase;

    // TOTP / Google Authenticator
    @Convert(converter = AuthenticatedEncryptionEngine.class)
    @Column(name = "totp_secret", length = 500)
    private String totpSecret;

    @Column(name = "totp_enabled")
    private Boolean totpEnabled = false;

    // WebAuthn / Passkey
    @Lob
    @Column(name = "webauthn_credential_id")
    private byte[] webauthnCredentialId;

    @Lob
    @Column(name = "webauthn_public_key")
    private byte[] webauthnPublicKey;

    @Column(name = "webauthn_sign_count")
    private Long webauthnSignCount = 0L;

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

    public String getAntiPhishingPhrase() { return antiPhishingPhrase; }
    public void setAntiPhishingPhrase(String antiPhishingPhrase) { this.antiPhishingPhrase = antiPhishingPhrase; }

    public String getTotpSecret() { return totpSecret; }
    public void setTotpSecret(String totpSecret) { this.totpSecret = totpSecret; }

    public Boolean getTotpEnabled() { return totpEnabled; }
    public void setTotpEnabled(Boolean totpEnabled) { this.totpEnabled = totpEnabled; }

    public byte[] getWebauthnCredentialId() { return webauthnCredentialId; }
    public void setWebauthnCredentialId(byte[] webauthnCredentialId) { this.webauthnCredentialId = webauthnCredentialId; }

    public byte[] getWebauthnPublicKey() { return webauthnPublicKey; }
    public void setWebauthnPublicKey(byte[] webauthnPublicKey) { this.webauthnPublicKey = webauthnPublicKey; }

    public Long getWebauthnSignCount() { return webauthnSignCount; }
    public void setWebauthnSignCount(Long webauthnSignCount) { this.webauthnSignCount = webauthnSignCount; }
}