package com.global.atm_blockchain.security;

import com.global.atm_blockchain.repository.AuditEventRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

/**
 * Service for writing tamper-evident audit events.
 * All financial controllers should inject this and call log() on every operation.
 */
@Service
public class AuditLogService {

    @Autowired
    private AuditEventRepository auditEventRepository;

    public void log(String username, String action, String detail, String ipAddress, String outcome) {
        AuditEvent event = new AuditEvent(username, action, detail, ipAddress, outcome);
        auditEventRepository.save(event);
    }

    public void logSuccess(String username, String action, String detail, String ip) {
        log(username, action, detail, ip, "SUCCESS");
    }

    public void logFailure(String username, String action, String detail, String ip) {
        log(username, action, detail, ip, "FAILURE");
    }
}
