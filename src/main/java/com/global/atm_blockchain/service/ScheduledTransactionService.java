package com.global.atm_blockchain.service;

import com.global.atm_blockchain.model.ScheduledTransaction;
import com.global.atm_blockchain.model.Transaction;
import com.global.atm_blockchain.model.User;
import com.global.atm_blockchain.repository.ScheduledTransactionRepository;
import com.global.atm_blockchain.repository.TransactionRepository;
import com.global.atm_blockchain.repository.UserRepository;
import com.global.atm_blockchain.security.AuditLogService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@EnableScheduling
public class ScheduledTransactionService {

    @Autowired
    private ScheduledTransactionRepository scheduledTransactionRepository;

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AuditLogService auditLogService;

    public ScheduledTransaction createSchedule(String username, ScheduledTransaction request) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        request.setUser(user);
        request.setActive(true);
        request.setNextExecutionTime(LocalDateTime.now().plusMinutes(1)); // For testing purposes, execute in 1 minute
        
        ScheduledTransaction saved = scheduledTransactionRepository.save(request);
        auditLogService.logSuccess(username, "SCHEDULE_CREATED", "Created schedule for " + request.getType() + " of " + request.getAmount() + " " + request.getCurrency(), "system");
        return saved;
    }

    public List<ScheduledTransaction> getUserSchedules(String username) {
        return scheduledTransactionRepository.findByUser_Username(username);
    }

    public void cancelSchedule(String username, Long scheduleId) {
        ScheduledTransaction st = scheduledTransactionRepository.findById(scheduleId)
                .orElseThrow(() -> new RuntimeException("Schedule not found"));
        
        if (!st.getUser().getUsername().equals(username)) {
            throw new RuntimeException("Unauthorized to cancel this schedule");
        }
        
        st.setActive(false);
        scheduledTransactionRepository.save(st);
        auditLogService.logSuccess(username, "SCHEDULE_CANCELLED", "Cancelled schedule ID " + scheduleId, "system");
    }

    /**
     * Runs every minute to check for due scheduled transactions.
     * In a real application, this would use a robust job scheduler (like Quartz).
     */
    @Scheduled(fixedRate = 60000)
    public void executeDueSchedules() {
        List<ScheduledTransaction> dueTransactions = scheduledTransactionRepository.findByActiveTrue();
        LocalDateTime now = LocalDateTime.now();

        for (ScheduledTransaction st : dueTransactions) {
            if (st.getNextExecutionTime() != null && !now.isBefore(st.getNextExecutionTime())) {
                executeTransaction(st);
                // Update next execution time based on cron - for demo, we just add 1 day
                st.setNextExecutionTime(now.plusDays(1));
                scheduledTransactionRepository.save(st);
            }
        }
    }

    private void executeTransaction(ScheduledTransaction st) {
        User user = st.getUser();
        BigDecimal amount = st.getAmount();

        if (st.getCurrency().equals("ETH")) {
            if (user.getCryptoBalance() < amount.doubleValue()) {
                auditLogService.logFailure(user.getUsername(), "SCHEDULE_FAILED", "Insufficient crypto balance for scheduled transfer", "system");
                return;
            }
            user.setCryptoBalance(user.getCryptoBalance() - amount.doubleValue());
        } else {
            if (user.getFiatBalance() < amount.doubleValue()) {
                auditLogService.logFailure(user.getUsername(), "SCHEDULE_FAILED", "Insufficient fiat balance for scheduled transfer", "system");
                return;
            }
            user.setFiatBalance(user.getFiatBalance() - amount.doubleValue());
        }

        userRepository.save(user);

        Transaction tx = new Transaction();
        tx.setUser(user);
        tx.setType(st.getType());
        tx.setCurrency(st.getCurrency());
        tx.setAmount(amount);
        tx.setFee(BigDecimal.ZERO);
        tx.setStatus("SUCCESS");
        tx.setReferenceId("SCH-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        tx.setTxHash("0x" + UUID.randomUUID().toString().replace("-", ""));

        transactionRepository.save(tx);
        auditLogService.logSuccess(user.getUsername(), "SCHEDULE_EXECUTED", "Executed scheduled " + st.getType(), "system");
    }
}
