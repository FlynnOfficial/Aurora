package com.aurora.controllers;

import com.aurora.models.Grade;
import com.aurora.services.GradeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import jakarta.servlet.http.HttpServletRequest;

@RestController
@RequestMapping("/grades")
@RequiredArgsConstructor
public class GradeController {
    private final GradeService gradeService;

    @PostMapping
    public ResponseEntity<?> createGrade(@RequestBody CreateGradeRequest request, HttpServletRequest httpRequest) {
        try {
            Grade grade = gradeService.createGrade(
                    userId(httpRequest),
                    role(httpRequest),
                    request.studentId,
                    request.subject,
                    request.period,
                    request.value,
                    request.weight
            );
            return ResponseEntity.ok(grade);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(createError(e.getMessage()));
        }
    }

    @GetMapping("/student/{studentId}")
    public ResponseEntity<?> getGradesByStudent(@PathVariable Long studentId, HttpServletRequest httpRequest) {
        try {
            List<Grade> grades = gradeService.getGradesByStudent(userId(httpRequest), role(httpRequest), studentId);
            return ResponseEntity.ok(grades);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(createError(e.getMessage()));
        }
    }

    @GetMapping("/subject/{subject}")
    public ResponseEntity<?> getGradesBySubject(@PathVariable String subject) {
        try {
            List<Grade> grades = gradeService.getGradesBySubject(subject);
            return ResponseEntity.ok(grades);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(createError(e.getMessage()));
        }
    }

    @GetMapping("/student/{studentId}/average")
    public ResponseEntity<?> getStudentAverage(@PathVariable Long studentId, HttpServletRequest httpRequest) {
        try {
            Double average = gradeService.calculateStudentAverage(userId(httpRequest), role(httpRequest), studentId);
            Map<String, Double> response = new HashMap<>();
            response.put("average", average);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(createError(e.getMessage()));
        }
    }

    @PutMapping("/{gradeId}")
    public ResponseEntity<?> updateGrade(@PathVariable Long gradeId, @RequestBody UpdateGradeRequest request, HttpServletRequest httpRequest) {
        try {
            Grade updated = gradeService.updateGrade(userId(httpRequest), role(httpRequest), gradeId, request.value);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(createError(e.getMessage()));
        }
    }

    private Map<String, String> createError(String message) {
        Map<String, String> error = new HashMap<>();
        error.put("error", message);
        return error;
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

    public static class CreateGradeRequest {
        public Long studentId;
        public String subject;
        public String period;
        public Double value;
        public Integer weight;
    }

    public static class UpdateGradeRequest {
        public Double value;
    }
}