package com.global.atm_blockchain.model;

public enum Role {
    USER,       // Standard Customer
    ADMIN,      // System Super User
    AUDITOR,    // Read-only access to check for fraud (Global Compliance)
    TELLER      // Can deposit cash for users at physical branches
}