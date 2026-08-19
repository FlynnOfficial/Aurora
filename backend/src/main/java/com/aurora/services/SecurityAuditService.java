package com.aurora.services;

import com.aurora.models.SecurityAudit;
import com.aurora.repositories.SecurityAuditRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
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
        log.info("Login attempt logged - Email: {}, Success: {}, IP: {}", email, success, ipAddress);
    }

    public void logDataAccess(String email, String action, String resource, String ipAddress) {
        SecurityAudit audit = SecurityAudit.builder()
                .email(email)
                .action(action)
                .resource(resource)
                .ipAddress(ipAddress)
                .timestamp(System.currentTimeMillis())
                .build();

        auditRepository.save(audit);
        log.info("Data access logged - Email: {}, Action: {}, Resource: {}", email, action, resource);
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
        log.warn("Security event logged - Email: {}, Event: {}", email, event);
    }
}