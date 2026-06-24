package com.global.atm_blockchain.exception;

import java.math.BigDecimal;

/**
 * Thrown when a user's withdrawal attempt exceeds their daily or weekly velocity limit.
 * Contains detailed limit information for the error response.
 */
public class VelocityLimitExceededException extends RuntimeException {

    private final BigDecimal dailyUsed;
    private final BigDecimal dailyLimit;
    private final BigDecimal weeklyUsed;
    private final BigDecimal weeklyLimit;
    private final String currency;

    public VelocityLimitExceededException(
            String message,
            BigDecimal dailyUsed, BigDecimal dailyLimit,
            BigDecimal weeklyUsed, BigDecimal weeklyLimit,
            String currency) {
        super(message);
        this.dailyUsed = dailyUsed;
        this.dailyLimit = dailyLimit;
        this.weeklyUsed = weeklyUsed;
        this.weeklyLimit = weeklyLimit;
        this.currency = currency;
    }

    public BigDecimal getDailyUsed() { return dailyUsed; }
    public BigDecimal getDailyLimit() { return dailyLimit; }
    public BigDecimal getWeeklyUsed() { return weeklyUsed; }
    public BigDecimal getWeeklyLimit() { return weeklyLimit; }
    public String getCurrency() { return currency; }
}
