package com.global.atm_blockchain.repository;

import com.global.atm_blockchain.model.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    List<Transaction> findByUserIdOrderByTimestampDesc(Long userId);
    List<Transaction> findByUser_UsernameOrderByTimestampDesc(String username);

    /**
     * Sums the total withdrawal amount for a user since a given timestamp.
     * Used by VelocityLimitService to enforce daily/weekly caps.
     */
    @Query("SELECT COALESCE(SUM(t.amount), 0) FROM Transaction t " +
           "WHERE t.user.id = :userId " +
           "AND UPPER(t.type) = 'WITHDRAW' " +
           "AND t.timestamp >= :since")
    BigDecimal sumWithdrawalsForUserSince(
            @Param("userId") Long userId,
            @Param("since") LocalDateTime since);
}