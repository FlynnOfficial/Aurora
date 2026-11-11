package com.aurora.repositories;

import com.aurora.models.SupportChat;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface SupportChatRepository extends JpaRepository<SupportChat, Long> {
    @EntityGraph(attributePaths = "requester")
    List<SupportChat> findByRecipientIsNullAndCreatedAtGreaterThanEqualOrderByIdDesc(Instant since);

    @EntityGraph(attributePaths = {"requester", "recipient"})
    @Query("""
        select chat from SupportChat chat
        where (chat.recipient is null and chat.requester.id = :userId and chat.createdAt >= :since)
           or (chat.recipient is not null and (chat.requester.id = :userId or chat.recipient.id = :userId))
        order by chat.id desc
        """)
    List<SupportChat> findForUser(Long userId, Instant since);

    Optional<SupportChat> findByRequesterIdAndRecipientId(Long requesterId, Long recipientId);

    Optional<SupportChat> findByRequesterIdAndRequestId(Long requesterId, UUID requestId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select chat from SupportChat chat where chat.id = :id")
    Optional<SupportChat> findForUpdate(Long id);
}
