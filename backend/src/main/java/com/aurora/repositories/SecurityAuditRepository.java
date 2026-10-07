package com.aurora.repositories;

import com.aurora.models.SecurityAudit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SecurityAuditRepository extends JpaRepository<SecurityAudit, Long> {
    List<SecurityAudit> findByEmail(String email);
    List<SecurityAudit> findByAction(String action);
    List<SecurityAudit> findByIpAddress(String ipAddress);
}