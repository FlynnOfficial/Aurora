package com.aurora.controllers;

import com.aurora.services.ActivityService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/activities")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
public class ActivityController {
    private final ActivityService activityService;

    @PostMapping
    public ResponseEntity<?> create(@RequestBody ActivityService.CreateActivityRequest request, HttpServletRequest httpRequest) {
        try { return ResponseEntity.ok(activityService.create(userId(httpRequest), request)); }
        catch (Exception e) { return error(e); }
    }

    @GetMapping("/teacher")
    public ResponseEntity<?> teacherActivities(HttpServletRequest request) {
        try { return ResponseEntity.ok(activityService.teacherActivities(userId(request))); }
        catch (Exception e) { return error(e); }
    }

    @GetMapping("/teacher/overview")
    public ResponseEntity<?> teacherOverview(HttpServletRequest request) {
        try { return ResponseEntity.ok(activityService.teacherOverview(userId(request))); }
        catch (Exception e) { return error(e); }
    }

    @GetMapping("/student")
    public ResponseEntity<?> studentActivities(HttpServletRequest request) {
        try { return ResponseEntity.ok(activityService.studentActivities(userId(request))); }
        catch (Exception e) { return error(e); }
    }

    @PostMapping("/{activityId}/submit")
    public ResponseEntity<?> submit(@PathVariable Long activityId, @RequestBody java.util.List<ActivityService.AnswerRequest> request, HttpServletRequest httpRequest) {
        try { return ResponseEntity.ok(activityService.submit(userId(httpRequest), activityId, request)); }
        catch (Exception e) { return error(e); }
    }

    @GetMapping("/{activityId}/submissions")
    public ResponseEntity<?> submissions(@PathVariable Long activityId, HttpServletRequest request) {
        try { return ResponseEntity.ok(activityService.submissions(userId(request), activityId)); }
        catch (Exception e) { return error(e); }
    }

    @PutMapping("/submissions/{submissionId}/grade")
    public ResponseEntity<?> grade(@PathVariable Long submissionId, @RequestBody ActivityService.GradeRequest request, HttpServletRequest httpRequest) {
        try { return ResponseEntity.ok(activityService.grade(userId(httpRequest), submissionId, request)); }
        catch (Exception e) { return error(e); }
    }

    private Long userId(HttpServletRequest request) {
        Object value = request.getAttribute("userId");
        if (!(value instanceof Long)) throw new IllegalArgumentException("Sessao invalida");
        return (Long) value;
    }

    private ResponseEntity<Map<String, String>> error(Exception exception) {
        Map<String, String> body = new HashMap<>(); body.put("error", exception.getMessage());
        return ResponseEntity.badRequest().body(body);
    }
}
