package com.global.atm_blockchain.service;

import com.global.atm_blockchain.exception.VelocityLimitExceededException;
import com.global.atm_blockchain.repository.TransactionRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║   VELOCITY LIMIT ENGINE — Financial Safety Gate             ║
 * ║   Threat: Account drain after credential compromise         ║
 * ║   Defense: Hard caps on 24h and 7-day withdrawal volumes    ║
 * ╚══════════════════════════════════════════════════════════════╝
 *
 * Even if a hacker obtains valid credentials, they cannot drain
 * the vault in one shot. The limits act as a circuit breaker.
 */
@Service
public class VelocityLimitService {

    // Fiat (USD) limits
    private static final BigDecimal FIAT_DAILY_LIMIT  = new BigDecimal("5000.00");
    private static final BigDecimal FIAT_WEEKLY_LIMIT = new BigDecimal("20000.00");

    // Crypto (ETH) limits
    private static final BigDecimal CRYPTO_DAILY_LIMIT  = new BigDecimal("1.5");
    private static final BigDecimal CRYPTO_WEEKLY_LIMIT = new BigDecimal("5.0");

    private final TransactionRepository transactionRepository;

    public VelocityLimitService(TransactionRepository transactionRepository) {
        this.transactionRepository = transactionRepository;
    }

    /**
     * Validates whether a withdrawal is within the user's velocity limits.
     *
     * @param userId   The user's database ID
     * @param amount   The requested withdrawal amount
     * @param currency "USD" (fiat) or "ETH" (crypto)
     * @throws VelocityLimitExceededException if the limits would be breached
     */
    public void checkWithdrawalAllowed(Long userId, BigDecimal amount, String currency) {
        boolean isCrypto = "ETH".equalsIgnoreCase(currency);

        BigDecimal dailyLimit  = isCrypto ? CRYPTO_DAILY_LIMIT  : FIAT_DAILY_LIMIT;
        BigDecimal weeklyLimit = isCrypto ? CRYPTO_WEEKLY_LIMIT : FIAT_WEEKLY_LIMIT;

        LocalDateTime now = LocalDateTime.now();
        LocalDateTime oneDayAgo   = now.minusHours(24);
        LocalDateTime oneWeekAgo  = now.minusDays(7);

        BigDecimal dailyUsed  = transactionRepository.sumWithdrawalsForUserSince(userId, oneDayAgo);
        BigDecimal weeklyUsed = transactionRepository.sumWithdrawalsForUserSince(userId, oneWeekAgo);

        BigDecimal newDailyTotal  = dailyUsed.add(amount);
        BigDecimal newWeeklyTotal = weeklyUsed.add(amount);

        if (newDailyTotal.compareTo(dailyLimit) > 0) {
            throw new VelocityLimitExceededException(
                    String.format("Daily %s withdrawal limit exceeded. Limit: %s, Used: %s, Requested: %s",
                            currency, dailyLimit, dailyUsed, amount),
                    dailyUsed, dailyLimit, weeklyUsed, weeklyLimit, currency
            );
        }

        if (newWeeklyTotal.compareTo(weeklyLimit) > 0) {
            throw new VelocityLimitExceededException(
                    String.format("Weekly %s withdrawal limit exceeded. Limit: %s, Used: %s, Requested: %s",
                            currency, weeklyLimit, weeklyUsed, amount),
                    dailyUsed, dailyLimit, weeklyUsed, weeklyLimit, currency
            );
        }
    }

    /**
     * Returns the current velocity status for display in the dashboard.
     */
    public VelocityStatus getStatus(Long userId) {
        LocalDateTime oneDayAgo  = LocalDateTime.now().minusHours(24);
        LocalDateTime oneWeekAgo = LocalDateTime.now().minusDays(7);

        BigDecimal fiatDailyUsed  = transactionRepository.sumWithdrawalsForUserSince(userId, oneDayAgo);
        BigDecimal fiatWeeklyUsed = transactionRepository.sumWithdrawalsForUserSince(userId, oneWeekAgo);

        return new VelocityStatus(
                fiatDailyUsed, FIAT_DAILY_LIMIT,
                fiatWeeklyUsed, FIAT_WEEKLY_LIMIT
        );
    }

    public record VelocityStatus(
            BigDecimal fiatDailyUsed,
            BigDecimal fiatDailyLimit,
            BigDecimal fiatWeeklyUsed,
            BigDecimal fiatWeeklyLimit
    ) {}
}
