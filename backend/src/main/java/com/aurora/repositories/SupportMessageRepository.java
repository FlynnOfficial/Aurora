package com.aurora.repositories;

import com.aurora.models.SupportMessage;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface SupportMessageRepository extends JpaRepository<SupportMessage, Long> {
    @EntityGraph(attributePaths = "sender")
    List<SupportMessage> findFirst100ByChatIdAndIdGreaterThanOrderByIdAsc(Long chatId, Long afterId);

    Optional<SupportMessage> findByChatIdAndSenderIdAndRequestId(Long chatId, Long senderId, UUID requestId);
}
