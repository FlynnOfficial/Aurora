package com.aurora.controllers;

import com.aurora.models.Teacher;
import com.aurora.services.TeacherService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import jakarta.servlet.http.HttpServletRequest;

@RestController
@RequestMapping("/teachers")
@RequiredArgsConstructor
public class TeacherController {
    private final TeacherService teacherService;

    @PostMapping
    public ResponseEntity<?> createTeacher(@RequestBody CreateTeacherRequest request) {
        try {
            Teacher teacher = teacherService.createTeacher(request.userId, request.subject, request.classes);
            return ResponseEntity.ok(teacher);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(createError(e.getMessage()));
        }
    }

    @GetMapping("/{userId}")
    public ResponseEntity<?> getTeacher(@PathVariable Long userId, HttpServletRequest request) {
        try {
            teacherService.authorizeUserAccess(userId(request), role(request), userId);
            Optional<Teacher> teacher = teacherService.getTeacherByUserId(userId);
            return teacher.map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(createError(e.getMessage()));
        }
    }

    @GetMapping("/subject/{subject}")
    public ResponseEntity<?> getTeachersBySubject(@PathVariable String subject, HttpServletRequest request) {
        try {
            requireRole(request, "ADMIN", "SUPER_ADMIN");
            List<Teacher> teachers = teacherService.getTeachersBySubject(subject);
            return ResponseEntity.ok(teachers);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(createError(e.getMessage()));
        }
    }

    @GetMapping
    public ResponseEntity<?> getAllTeachers(HttpServletRequest request) {
        try {
            requireRole(request, "ADMIN", "SUPER_ADMIN");
            List<Teacher> teachers = teacherService.getAllTeachers();
            return ResponseEntity.ok(teachers);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(createError(e.getMessage()));
        }
    }

    @PutMapping("/{teacherId}")
    public ResponseEntity<?> updateTeacher(@PathVariable Long teacherId, @RequestBody Teacher updates, HttpServletRequest request) {
        try {
            requireRole(request, "ADMIN", "SUPER_ADMIN");
            Teacher updated = teacherService.updateTeacher(teacherId, updates);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(createError(e.getMessage()));
        }
    }

    @DeleteMapping("/{teacherId}")
    public ResponseEntity<?> deleteTeacher(@PathVariable Long teacherId, HttpServletRequest request) {
        try {
            requireRole(request, "ADMIN", "SUPER_ADMIN");
            teacherService.deleteTeacher(teacherId);
            return ResponseEntity.ok(createMessage("Professor deletado com sucesso"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(createError(e.getMessage()));
        }
    }

    private Map<String, String> createError(String message) {
        Map<String, String> error = new HashMap<>();
        error.put("error", message);
        return error;
    }

    private Map<String, String> createMessage(String message) {
        Map<String, String> msg = new HashMap<>();
        msg.put("message", message);
        return msg;
    }

    public static class CreateTeacherRequest {
        public Long userId;
        public String subject;
        public Set<String> classes;
    }

    private Long userId(HttpServletRequest request) throws Exception {
        Object value = request.getAttribute("userId");
        if (!(value instanceof Long)) throw new Exception("Sessão inválida");
        return (Long) value;
    }

    private String role(HttpServletRequest request) throws Exception {
        Object value = request.getAttribute("role");
        if (!(value instanceof String)) throw new Exception("Sessão inválida");
        return (String) value;
    }

    private void requireRole(HttpServletRequest request, String... allowedRoles) throws Exception {
        String currentRole = role(request);
        for (String allowedRole : allowedRoles) if (allowedRole.equals(currentRole)) return;
        throw new Exception("Sem permissão");
    }
}