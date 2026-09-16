package com.aurora.services;

import com.aurora.models.SupportChat;
import com.aurora.models.SupportMessage;
import com.aurora.models.User;
import com.aurora.repositories.SupportChatRepository;
import com.aurora.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@SuppressWarnings("null")
public class SupportService {
    private final SupportChatRepository chatRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<SupportChat> list(Long userId, boolean superAdmin) throws Exception {
        user(userId);
        LocalDateTime since = LocalDateTime.now().minusDays(7);
        return superAdmin
            ? chatRepository.findByCreatedAtGreaterThanEqualOrderByCreatedAtDesc(since)
                : chatRepository.findByRequesterIdAndCreatedAtGreaterThanEqualOrderByCreatedAtDesc(userId, since);
    }

    @Transactional
    public SupportChat create(Long userId, String content) throws Exception {
        SupportChat chat = new SupportChat();
        chat.setRequester(user(userId));
        chat.setOrganizationKey(chat.getRequester().getOrganizationKey());
        addMessage(chat, chat.getRequester(), content);
        return chatRepository.save(chat);
    }

    @Transactional
    public SupportChat addMessage(Long userId, Long chatId, String content, boolean superAdmin) throws Exception {
        SupportChat chat = accessible(chatId, userId, superAdmin);
        if (chat.getStatus() == SupportChat.Status.CLOSED) throw new Exception("Este atendimento está encerrado");
        addMessage(chat, user(userId), content);
        return chatRepository.save(chat);
    }

    @Transactional
    public SupportChat close(Long userId, Long chatId, boolean superAdmin) throws Exception {
        SupportChat chat = accessible(chatId, userId, superAdmin);
        chat.setStatus(SupportChat.Status.CLOSED);
        chat.setClosedAt(LocalDateTime.now());
        return chatRepository.save(chat);
    }

    @Scheduled(cron = "0 0 * * * *")
    @Transactional
    public void purgeExpired() {
        chatRepository.deleteClosedBefore(LocalDateTime.now().minusDays(7));
    }

    private SupportChat accessible(Long chatId, Long userId, boolean superAdmin) throws Exception {
        SupportChat chat = chatRepository.findById(chatId).orElseThrow(() -> new Exception("Atendimento não encontrado"));
        User current = user(userId);
        if (!superAdmin && !chat.getRequester().getId().equals(userId)) throw new Exception("Sem permissão para este atendimento");
        if (!superAdmin && !chat.getOrganizationKey().equals(current.getOrganizationKey())) throw new Exception("Atendimento fora da organização");
        return chat;
    }

    private User user(Long id) throws Exception {
        return userRepository.findById(id).orElseThrow(() -> new Exception("Usuário não encontrado"));
    }

    private void addMessage(SupportChat chat, User sender, String content) throws Exception {
        if (content == null || content.isBlank()) throw new Exception("A mensagem não pode ficar vazia");
        SupportMessage message = new SupportMessage();
        message.setChat(chat);
        message.setSender(sender);
        message.setContent(content.trim());
        chat.getMessages().add(message);
    }
}