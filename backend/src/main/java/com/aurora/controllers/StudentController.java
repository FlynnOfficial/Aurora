package com.aurora.controllers;

import com.aurora.models.Student;
import com.aurora.models.Grade;
import com.aurora.services.StudentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import jakarta.servlet.http.HttpServletRequest;

@RestController
@RequestMapping("/students")
@RequiredArgsConstructor
public class StudentController {
    private final StudentService studentService;

    @PostMapping
    public ResponseEntity<?> createStudent(@RequestBody CreateStudentRequest request) {
        try {
            Student student = studentService.createStudent(request.userId, request.className, request.enrollment);
            return ResponseEntity.ok(student);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(createError(e.getMessage()));
        }
    }

    @GetMapping("/{userId}")
    public ResponseEntity<?> getStudent(@PathVariable Long userId, HttpServletRequest request) {
        try {
            studentService.authorizeUserAccess(userId(request), role(request), userId);
            Optional<Student> student = studentService.getStudentByUserId(userId);
            return student.map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(createError(e.getMessage()));
        }
    }

    @GetMapping("/class/{className}")
    public ResponseEntity<?> getStudentsByClass(@PathVariable String className, HttpServletRequest request) {
        try {
            requireRole(request, "ADMIN", "SUPER_ADMIN");
            List<Student> students = studentService.getStudentsByClass(className);
            return ResponseEntity.ok(students);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(createError(e.getMessage()));
        }
    }

    @GetMapping("/{studentId}/grades")
    public ResponseEntity<?> getGrades(@PathVariable Long studentId, HttpServletRequest request) {
        try {
            studentService.authorizeAccess(userId(request), role(request), studentId);
            List<Grade> grades = studentService.getStudentGrades(studentId);
            return ResponseEntity.ok(grades);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(createError(e.getMessage()));
        }
    }

    @GetMapping("/{studentId}/average/{subject}")
    public ResponseEntity<?> getAverage(@PathVariable Long studentId, @PathVariable String subject, HttpServletRequest request) {
        try {
            studentService.authorizeAccess(userId(request), role(request), studentId);
            Double average = studentService.calculateAverageBySubject(studentId, subject);
            Map<String, Double> response = new HashMap<>();
            response.put("average", average);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(createError(e.getMessage()));
        }
    }

    @PutMapping("/{studentId}")
    public ResponseEntity<?> updateStudent(@PathVariable Long studentId, @RequestBody Student updates, HttpServletRequest request) {
        try {
            studentService.authorizeAccess(userId(request), role(request), studentId);
            Student updated = studentService.updateStudent(studentId, updates);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(createError(e.getMessage()));
        }
    }

    @DeleteMapping("/{studentId}")
    public ResponseEntity<?> deleteStudent(@PathVariable Long studentId, HttpServletRequest request) {
        try {
            requireRole(request, "ADMIN", "SUPER_ADMIN");
            studentService.deleteStudent(studentId);
            return ResponseEntity.ok(createMessage("Aluno deletado com sucesso"));
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

    public static class CreateStudentRequest {
        public Long userId;
        public String className;
        public String enrollment;
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