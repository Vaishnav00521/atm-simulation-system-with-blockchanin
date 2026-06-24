package com.global.atm_blockchain.repository;

import com.global.atm_blockchain.model.ScheduledTransaction;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ScheduledTransactionRepository extends JpaRepository<ScheduledTransaction, Long> {
    List<ScheduledTransaction> findByUser_Username(String username);
    List<ScheduledTransaction> findByActiveTrue();
}
