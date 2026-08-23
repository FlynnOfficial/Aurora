package com.aurora.models;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import jakarta.persistence.*;

@Entity
@Table(name = "security_audits", indexes = {
    @Index(name = "idx_email", columnList = "email"),
    @Index(name = "idx_timestamp", columnList = "timestamp"),
    @Index(name = "idx_action", columnList = "action")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SecurityAudit {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String email;

    @Column(nullable = false)
    private String action;

    private String resource;

    private String details;

    @Column(nullable = false)
    private Boolean success = false;

    @Column(nullable = false)
    private String ipAddress;

    private String userAgent;

    @Column(nullable = false, columnDefinition = "BIGINT DEFAULT 0")
    private Long timestamp;

    @PrePersist
    protected void onCreate() {
        if (success == null) success = false;
        if (timestamp == null) timestamp = System.currentTimeMillis();
    }
}