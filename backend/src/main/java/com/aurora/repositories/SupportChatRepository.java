package com.aurora.repositories;

import com.aurora.models.SupportChat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface SupportChatRepository extends JpaRepository<SupportChat, Long> {
    @EntityGraph(attributePaths = {"requester", "messages", "messages.sender"})
    List<SupportChat> findByRequesterIdAndCreatedAtGreaterThanEqualOrderByCreatedAtDesc(Long requesterId, LocalDateTime since);

    @EntityGraph(attributePaths = {"requester", "messages", "messages.sender"})
    List<SupportChat> findByCreatedAtGreaterThanEqualOrderByCreatedAtDesc(LocalDateTime since);

    @Modifying
    @Query("delete from SupportChat chat where chat.status = 'CLOSED' and chat.closedAt < :cutoff")
    int deleteClosedBefore(@Param("cutoff") LocalDateTime cutoff);
}