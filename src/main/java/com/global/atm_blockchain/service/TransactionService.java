package com.global.atm_blockchain.service;

import com.global.atm_blockchain.model.Transaction;
import com.global.atm_blockchain.model.User;
import com.global.atm_blockchain.repository.TransactionRepository;
import com.global.atm_blockchain.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.util.List;

@Service
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final UserRepository userRepository;
    private final VelocityLimitService velocityLimitService;

    public TransactionService(TransactionRepository transactionRepository,
                              UserRepository userRepository,
                              VelocityLimitService velocityLimitService) {
        this.transactionRepository = transactionRepository;
        this.userRepository = userRepository;
        this.velocityLimitService = velocityLimitService;
    }

    @Transactional
    public void deposit(User user, BigDecimal amount) {
        user.setBalance(user.getBalance().add(amount));
        userRepository.save(user);

        Transaction log = new Transaction();
        log.setUser(user);
        log.setAmount(amount);
        log.setType("DEPOSIT");
        transactionRepository.save(log);
    }

    @Transactional
    public void withdraw(User user, BigDecimal amount) throws Exception {
        // 🛡️ Velocity Limit Gate — runs BEFORE any balance mutation
        velocityLimitService.checkWithdrawalAllowed(user.getId(), amount, "USD");

        if (user.getBalance().compareTo(amount) < 0) {
            throw new Exception("Insufficient Balance!");
        }

        user.setBalance(user.getBalance().subtract(amount));
        userRepository.save(user);

        Transaction log = new Transaction();
        log.setUser(user);
        log.setAmount(amount);
        log.setType("WITHDRAW");
        transactionRepository.save(log);
    }

    public List<Transaction> getHistory(User user) {
        return transactionRepository.findByUserIdOrderByTimestampDesc(user.getId());
    }
}