package com.aurora.controllers;

import com.aurora.services.SupportService;
import com.aurora.services.SupportService.Chat;
import com.aurora.services.SupportService.Contact;
import com.aurora.services.SupportService.Message;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/support")
@RequiredArgsConstructor
public class SupportController {
    private final SupportService supportService;

    @GetMapping("/chats")
    public List<Chat> list(@RequestAttribute Long userId) {
        return supportService.list(userId);
    }

    @GetMapping("/contacts")
    public List<Contact> contacts(@RequestAttribute Long userId) {
        return supportService.contacts(userId);
    }

    @PostMapping("/chats")
    public Chat create(@RequestAttribute Long userId, @Valid @RequestBody MessageRequest input) {
        return supportService.create(userId, input.content(), input.requestId());
    }

    @PostMapping("/direct/{contactId}")
    public Chat direct(@RequestAttribute Long userId, @PathVariable Long contactId,
                       @Valid @RequestBody MessageRequest input) {
        return supportService.direct(userId, contactId, input.content(), input.requestId());
    }

    @GetMapping("/chats/{chatId}/messages")
    public List<Message> messages(@RequestAttribute Long userId, @PathVariable Long chatId,
                                  @RequestParam(defaultValue = "0") Long afterId) {
        return supportService.messages(userId, chatId, afterId);
    }

    @PostMapping("/chats/{chatId}/messages")
    public Message message(@RequestAttribute Long userId, @PathVariable Long chatId,
                           @Valid @RequestBody MessageRequest input) {
        return supportService.addMessage(userId, chatId, input.content(), input.requestId());
    }

    @PutMapping("/chats/{chatId}/close")
    public Chat close(@RequestAttribute Long userId, @PathVariable Long chatId) {
        return supportService.close(userId, chatId);
    }

    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<Map<String, String>> error(ResponseStatusException error) {
        return ResponseEntity.status(error.getStatusCode()).body(Map.of("error", error.getReason()));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>> invalidMessage() {
        return ResponseEntity.badRequest().body(Map.of("error", "Informe uma mensagem com até 4.000 caracteres"));
    }

    public record MessageRequest(@NotBlank @Size(max = 4000) String content, @NotNull UUID requestId) {}
}
