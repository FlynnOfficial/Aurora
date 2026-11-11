package com.aurora.services;

import com.aurora.models.SupportChat;
import com.aurora.models.SupportMessage;
import com.aurora.models.User;
import com.aurora.models.User.UserRole;
import com.aurora.repositories.SupportChatRepository;
import com.aurora.repositories.SupportMessageRepository;
import com.aurora.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SupportService {
    private final SupportChatRepository chatRepository;
    private final SupportMessageRepository messageRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<Chat> list(Long userId) {
        User current = user(userId);
        Instant since = Instant.now().minus(7, ChronoUnit.DAYS);
        if (current.getRole() == UserRole.SUPER_ADMIN) {
            return chatRepository.findByRecipientIsNullAndCreatedAtGreaterThanEqualOrderByIdDesc(since)
                    .stream().map(this::summary).toList();
        }

        Set<Long> allowedContacts = eligibleContacts(current).stream().map(User::getId).collect(Collectors.toSet());
        return chatRepository.findForUser(userId, since).stream()
                .filter(chat -> chat.getOrganizationKey().equals(current.getOrganizationKey()))
                .filter(chat -> chat.getRecipient() == null || allowedContacts.contains(otherParticipant(chat, userId)))
                .map(this::summary).toList();
    }

    @Transactional(readOnly = true)
    public List<Contact> contacts(Long userId) {
        return eligibleContacts(user(userId)).stream().map(user -> new Contact(user.getId(), user.getName())).toList();
    }

    @Transactional(readOnly = true)
    public List<Message> messages(Long userId, Long chatId, Long afterId) {
        requireAccess(chatRepository.findById(chatId).orElseThrow(SupportService::notFound), user(userId));
        return messageRepository.findFirst100ByChatIdAndIdGreaterThanOrderByIdAsc(chatId, afterId)
                .stream().map(this::message).toList();
    }

    @Transactional
    public Chat create(Long userId, String content, UUID requestId) {
        User current = lockUser(userId);
        SupportChat chat = chatRepository.findByRequesterIdAndRequestId(userId, requestId)
                .orElseGet(() -> {
                    SupportChat ticket = newChat(current);
                    ticket.setRequestId(requestId);
                    return chatRepository.save(ticket);
                });
        persistMessage(chat, current, content, requestId);
        return summary(chat);
    }

    @Transactional
    public Chat direct(Long userId, Long contactId, String content, UUID requestId) {
        User current = user(userId);
        User contact = eligibleContacts(current).stream().filter(candidate -> candidate.getId().equals(contactId))
                .findFirst().orElseThrow(() -> new ResponseStatusException(HttpStatus.FORBIDDEN, "Contato indisponível"));
        User student = current.getRole() == UserRole.STUDENT ? current : contact;
        User teacher = current.getRole() == UserRole.TEACHER ? current : contact;
        lockUser(student.getId());
        SupportChat chat = chatRepository.findByRequesterIdAndRecipientId(student.getId(), teacher.getId())
                .map(existing -> chatRepository.findForUpdate(existing.getId()).orElseThrow(SupportService::notFound))
                .orElseGet(() -> {
                    SupportChat conversation = newChat(student);
                    conversation.setRecipient(teacher);
                    return chatRepository.save(conversation);
                });
        requireAccess(chat, current);
        persistMessage(chat, current, content, requestId);
        return summary(chat);
    }

    @Transactional
    public Message addMessage(Long userId, Long chatId, String content, UUID requestId) {
        User current = user(userId);
        SupportChat chat = chatRepository.findForUpdate(chatId).orElseThrow(SupportService::notFound);
        requireAccess(chat, current);
        return message(persistMessage(chat, current, content, requestId));
    }

    @Transactional
    public Chat close(Long userId, Long chatId) {
        SupportChat chat = chatRepository.findForUpdate(chatId).orElseThrow(SupportService::notFound);
        requireAccess(chat, user(userId));
        if (chat.getRecipient() != null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Apenas atendimentos podem ser encerrados");
        }
        if (chat.getStatus() == SupportChat.Status.OPEN) {
            chat.setStatus(SupportChat.Status.CLOSED);
            chat.setClosedAt(Instant.now());
        }
        return summary(chat);
    }

    private List<User> eligibleContacts(User current) {
        return switch (current.getRole()) {
            case STUDENT -> userRepository.findTeachersForStudent(current.getId());
            case TEACHER -> userRepository.findStudentsForTeacher(current.getId());
            default -> List.of();
        };
    }

    private void requireAccess(SupportChat chat, User current) {
        Long userId = current.getId();
        boolean isRequester = chat.getRequester().getId().equals(userId);
        if (chat.getRecipient() == null) {
            if (current.getRole() == UserRole.SUPER_ADMIN ||
                    (isRequester && chat.getOrganizationKey().equals(current.getOrganizationKey()))) return;
        } else if ((isRequester || chat.getRecipient().getId().equals(userId))
                && chat.getOrganizationKey().equals(current.getOrganizationKey())
                && eligibleContacts(current).stream().anyMatch(contact -> contact.getId().equals(otherParticipant(chat, userId)))) {
            return;
        }
        throw notFound();
    }

    private Long otherParticipant(SupportChat chat, Long userId) {
        return chat.getRequester().getId().equals(userId) ? chat.getRecipient().getId() : chat.getRequester().getId();
    }

    private User user(Long id) {
        return userRepository.findById(id).filter(User::getActive)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Sessão inválida"));
    }

    private User lockUser(Long id) {
        return userRepository.findForUpdate(id).orElseThrow(() ->
                new ResponseStatusException(HttpStatus.FORBIDDEN, "Contato indisponível"));
    }

    private SupportChat newChat(User requester) {
        SupportChat chat = new SupportChat();
        chat.setRequester(requester);
        chat.setOrganizationKey(requester.getOrganizationKey());
        return chat;
    }

    private SupportMessage persistMessage(SupportChat chat, User sender, String content, UUID requestId) {
        return messageRepository.findByChatIdAndSenderIdAndRequestId(chat.getId(), sender.getId(), requestId)
                .orElseGet(() -> {
                    if (chat.getStatus() == SupportChat.Status.CLOSED) {
                        throw new ResponseStatusException(HttpStatus.CONFLICT, "Este atendimento está encerrado");
                    }
                    SupportMessage message = new SupportMessage();
                    message.setChat(chat);
                    message.setSender(sender);
                    message.setContent(content.strip());
                    message.setRequestId(requestId);
                    return messageRepository.save(message);
                });
    }

    private Chat summary(SupportChat chat) {
        User requester = chat.getRequester();
        User recipient = chat.getRecipient();
        return new Chat(chat.getId(), chat.getStatus(), chat.getCreatedAt(), chat.getClosedAt(),
                new Participant(requester.getId(), requester.getName(), recipient == null ? requester.getEmail() : null,
                        requester.getRole()), recipient == null ? null : new Contact(recipient.getId(), recipient.getName()));
    }

    private Message message(SupportMessage message) {
        User sender = message.getSender();
        return new Message(message.getId(), message.getContent(), message.getCreatedAt(), new Contact(sender.getId(), sender.getName()));
    }

    private static ResponseStatusException notFound() {
        return new ResponseStatusException(HttpStatus.NOT_FOUND, "Conversa não encontrada");
    }

    public record Contact(Long id, String name) {}
    public record Participant(Long id, String name, String email, UserRole role) {}
    public record Chat(Long id, SupportChat.Status status, Instant createdAt, Instant closedAt,
                       Participant requester, Contact recipient) {}
    public record Message(Long id, String content, Instant createdAt, Contact sender) {}
}
