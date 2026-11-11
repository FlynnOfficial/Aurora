package com.aurora.services;

import com.aurora.models.SecurityAudit;
import com.aurora.repositories.SecurityAuditRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@SuppressWarnings("null")
public class SecurityAuditService {
    private final SecurityAuditRepository auditRepository;

    public void logLoginAttempt(String email, boolean success, String ipAddress, String userAgent) {
        SecurityAudit audit = SecurityAudit.builder()
                .email(email)
                .action("LOGIN")
                .success(success)
                .ipAddress(ipAddress)
                .userAgent(userAgent)
                .timestamp(System.currentTimeMillis())
                .build();

        auditRepository.save(audit);
    }

    public void logSecurityEvent(String email, String event, String details, String ipAddress) {
        SecurityAudit audit = SecurityAudit.builder()
                .email(email)
                .action("SECURITY_EVENT")
                .resource(event)
                .details(details)
                .ipAddress(ipAddress)
                .timestamp(System.currentTimeMillis())
                .build();

        auditRepository.save(audit);
    }
}