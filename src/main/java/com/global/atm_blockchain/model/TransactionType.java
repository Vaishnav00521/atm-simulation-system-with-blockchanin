package com.global.atm_blockchain.model;

public enum TransactionType {
    DEPOSIT,
    WITHDRAW,
    CRYPTO_TRANSFER,
    CURRENCY_EXCHANGE, // New: Swap USD to EUR
    BILL_PAYMENT       // New: Pay utility bills
}