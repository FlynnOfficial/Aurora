package com.aurora.controllers;

import com.aurora.services.SupportService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/support")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
public class SupportController {
    private final SupportService supportService;

    @GetMapping("/chats")
    public ResponseEntity<?> list(HttpServletRequest request) {
        try { return ResponseEntity.ok(supportService.list(userId(request), isSuperAdmin(request))); }
        catch (Exception e) { return error(e); }
    }

    @PostMapping("/chats")
    public ResponseEntity<?> create(@RequestBody MessageRequest input, HttpServletRequest request) {
        try { return ResponseEntity.ok(supportService.create(userId(request), input.content)); }
        catch (Exception e) { return error(e); }
    }

    @PostMapping("/chats/{chatId}/messages")
    public ResponseEntity<?> message(@PathVariable Long chatId, @RequestBody MessageRequest input, HttpServletRequest request) {
        try { return ResponseEntity.ok(supportService.addMessage(userId(request), chatId, input.content, isSuperAdmin(request))); }
        catch (Exception e) { return error(e); }
    }

    @PutMapping("/chats/{chatId}/close")
    public ResponseEntity<?> close(@PathVariable Long chatId, HttpServletRequest request) {
        try { return ResponseEntity.ok(supportService.close(userId(request), chatId, isSuperAdmin(request))); }
        catch (Exception e) { return error(e); }
    }

    private Long userId(HttpServletRequest request) throws Exception {
        Object id = request.getAttribute("userId");
        if (!(id instanceof Long)) throw new Exception("Sessão inválida");
        return (Long) id;
    }

    private boolean isSuperAdmin(HttpServletRequest request) {
        return "SUPER_ADMIN".equals(request.getAttribute("role"));
    }

    private ResponseEntity<Map<String, String>> error(Exception e) {
        Map<String, String> body = new HashMap<>();
        body.put("error", e.getMessage());
        return ResponseEntity.badRequest().body(body);
    }

    public static class MessageRequest { public String content; }
}