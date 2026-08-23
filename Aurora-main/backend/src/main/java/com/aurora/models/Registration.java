package com.aurora.models;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import jakarta.persistence.*;

@Entity
@Table(name = "registrations")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Registration {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private RegistrationType type;

    @Column(columnDefinition = "LONGTEXT")
    private String data;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private Status status;

    @Column(name = "submitted_at", nullable = false, columnDefinition = "TIMESTAMP DEFAULT CURRENT_TIMESTAMP")
    private Long submittedAt;

    @PrePersist
    protected void onCreate() {
        submittedAt = System.currentTimeMillis();
    }

    public enum RegistrationType {
        FISICA, JURIDICA
    }

    public enum Status {
        PENDING, APPROVED, REJECTED
    }
}