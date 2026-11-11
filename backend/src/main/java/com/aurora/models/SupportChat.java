package com.aurora.models;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "support_chats", uniqueConstraints = {
        @UniqueConstraint(name = "uq_support_chat_participants", columnNames = {"requester_id", "recipient_id"}),
        @UniqueConstraint(name = "uq_support_chat_request", columnNames = {"requester_id", "request_id"})
})
@Getter
@Setter
@NoArgsConstructor
public class SupportChat {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "requester_id", nullable = false)
    private User requester;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recipient_id")
    private User recipient;

    @Column(name = "request_id")
    private UUID requestId;

    @Column(name = "organization_key", nullable = false)
    private String organizationKey;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Status status = Status.OPEN;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @Column(name = "closed_at")
    private Instant closedAt;

    @PrePersist
    void onCreate() {
        createdAt = Instant.now();
    }

    public enum Status { OPEN, CLOSED }
}
