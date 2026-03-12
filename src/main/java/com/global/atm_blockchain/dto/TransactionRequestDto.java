package com.global.atm_blockchain.dto;

import java.math.BigDecimal;

public class TransactionRequestDto {

    private String receiverWalletAddress; // For crypto transfers
    private BigDecimal amount;
    private String transactionType; // DEPOSIT, WITHDRAW, TRANSFER

    // --- GETTERS AND SETTERS ---

    public String getReceiverWalletAddress() {
        return receiverWalletAddress;
    }

    public void setReceiverWalletAddress(String receiverWalletAddress) {
        this.receiverWalletAddress = receiverWalletAddress;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public String getTransactionType() {
        return transactionType;
    }

    public void setTransactionType(String transactionType) {
        this.transactionType = transactionType;
    }
}