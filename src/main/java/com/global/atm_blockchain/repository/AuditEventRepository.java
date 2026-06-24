package com.global.atm_blockchain.repository;

import com.global.atm_blockchain.security.AuditEvent;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface AuditEventRepository extends JpaRepository<AuditEvent, Long> {
    List<AuditEvent> findByUsernameOrderByTimestampDesc(String username);
    List<AuditEvent> findByActionOrderByTimestampDesc(String action);

    // Paginated — for Account Activity page
    Page<AuditEvent> findByUsernameOrderByTimestampDesc(String username, Pageable pageable);
    Page<AuditEvent> findByUsernameAndActionContainingIgnoreCaseOrderByTimestampDesc(
            String username, String action, Pageable pageable);
}
