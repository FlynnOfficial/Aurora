package com.aurora.controllers;

import com.aurora.models.Registration;
import com.aurora.services.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/admin")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
public class AdminController {
    private final AdminService adminService;

    @GetMapping("/registrations/pending")
    public ResponseEntity<?> getPendingRegistrations() {
        try {
            List<Registration> registrations = adminService.getPendingRegistrations();
            return ResponseEntity.ok(registrations);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(createError(e.getMessage()));
        }
    }

    @PutMapping("/registrations/{registrationId}/approve")
    public ResponseEntity<?> approveRegistration(@PathVariable Long registrationId) {
        try {
            Registration registration = adminService.approveRegistration(registrationId);
            return ResponseEntity.ok(registration);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(createError(e.getMessage()));
        }
    }

    @PutMapping("/registrations/{registrationId}/reject")
    public ResponseEntity<?> rejectRegistration(@PathVariable Long registrationId) {
        try {
            Registration registration = adminService.rejectRegistration(registrationId);
            return ResponseEntity.ok(registration);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(createError(e.getMessage()));
        }
    }

    @GetMapping("/users")
    public ResponseEntity<?> getAllUsers() {
        try {
            List<com.aurora.models.User> users = adminService.getAllUsers();
            return ResponseEntity.ok(users);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(createError(e.getMessage()));
        }
    }

    @DeleteMapping("/users/{userId}")
    public ResponseEntity<?> deactivateUser(@PathVariable Long userId) {
        try {
            adminService.deactivateUser(userId);
            return ResponseEntity.ok(createMessage("Usuário desativado com sucesso"));
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
}