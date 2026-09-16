package com.aurora.controllers;

import com.aurora.models.Registration;
import com.aurora.services.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.servlet.http.HttpServletRequest;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import com.aurora.models.SchoolClass;
import com.aurora.models.Subject;
import com.aurora.models.User;
import com.aurora.repositories.SchoolClassRepository;
import com.aurora.repositories.SubjectRepository;
import com.aurora.repositories.UserRepository;

@RestController
@RequestMapping("/admin")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
public class AdminController {
    private final AdminService adminService;
    private final UserRepository userRepository;
    private final SchoolClassRepository schoolClassRepository;
    private final SubjectRepository subjectRepository;

    @GetMapping("/registrations/pending")
    public ResponseEntity<?> getPendingRegistrations() {
        try {
            List<Registration> registrations = adminService.getPendingRegistrations();
            return ResponseEntity.ok(registrations);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(createError(e.getMessage()));
        }
    }

    @GetMapping("/registrations")
    public ResponseEntity<?> getAllRegistrations() {
        try {
            return ResponseEntity.ok(adminService.getAllRegistrations());
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
    public ResponseEntity<?> getAllUsers(HttpServletRequest request) {
        try {
            Object userId = request.getAttribute("userId");
            if (!(userId instanceof Long)) throw new Exception("Sessao invalida");
            List<com.aurora.models.User> users = adminService.getUsersFor((Long) userId);
            return ResponseEntity.ok(users);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(createError(e.getMessage()));
        }
    }

    @DeleteMapping("/users/{userId}")
    public ResponseEntity<?> deactivateUser(@PathVariable Long userId, HttpServletRequest request) {
        try {
            Object requesterId = request.getAttribute("userId");
            if (!(requesterId instanceof Long)) throw new Exception("Sessao invalida");
            adminService.deactivateUser((Long) requesterId, userId);
            return ResponseEntity.ok(createMessage("Usuário desativado com sucesso"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(createError(e.getMessage()));
        }
    }

    @PostMapping("/users")
    public ResponseEntity<?> createUser(@RequestBody CreateUserRequest input, HttpServletRequest request) {
        try { Object id = request.getAttribute("userId"); if (!(id instanceof Long)) throw new Exception("Sessao invalida"); return ResponseEntity.ok(adminService.createUser((Long) id, input.name, input.email, input.password, input.role, input.subject, input.classes, input.className, input.enrollment)); }
        catch (Exception e) { return ResponseEntity.badRequest().body(createError(e.getMessage())); }
    }

    @GetMapping("/classes")
    public ResponseEntity<?> getClasses(HttpServletRequest request) {
        try { return ResponseEntity.ok(schoolClassRepository.findByOrganizationKeyAndActiveTrueOrderByName(organization(request))); }
        catch (Exception e) { return ResponseEntity.badRequest().body(createError(e.getMessage())); }
    }

    @PostMapping("/classes")
    public ResponseEntity<?> createClass(@RequestBody ClassRequest input, HttpServletRequest request) {
        try { SchoolClass value = new SchoolClass(); value.setName(input.name.trim()); value.setSchoolYear(input.schoolYear); value.setOrganizationKey(organization(request)); return ResponseEntity.ok(schoolClassRepository.save(value)); }
        catch (Exception e) { return ResponseEntity.badRequest().body(createError(e.getMessage())); }
    }

    @DeleteMapping("/classes/{id}")
    public ResponseEntity<?> deleteClass(@PathVariable Long id, HttpServletRequest request) {
        try { SchoolClass value = schoolClassRepository.findById(id).orElseThrow(() -> new Exception("Turma nao encontrada")); if (!value.getOrganizationKey().equals(organization(request))) throw new Exception("Turma fora da organizacao"); value.setActive(false); schoolClassRepository.save(value); return ResponseEntity.ok().build(); }
        catch (Exception e) { return ResponseEntity.badRequest().body(createError(e.getMessage())); }
    }

    @GetMapping("/subjects")
    public ResponseEntity<?> getSubjects(HttpServletRequest request) {
        try { return ResponseEntity.ok(subjectRepository.findByOrganizationKeyAndActiveTrueOrderByName(organization(request))); }
        catch (Exception e) { return ResponseEntity.badRequest().body(createError(e.getMessage())); }
    }

    @PostMapping("/subjects")
    public ResponseEntity<?> createSubject(@RequestBody SubjectRequest input, HttpServletRequest request) {
        try { Subject value = new Subject(); value.setName(input.name.trim()); value.setOrganizationKey(organization(request)); return ResponseEntity.ok(subjectRepository.save(value)); }
        catch (Exception e) { return ResponseEntity.badRequest().body(createError(e.getMessage())); }
    }

    @DeleteMapping("/subjects/{id}")
    public ResponseEntity<?> deleteSubject(@PathVariable Long id, HttpServletRequest request) {
        try { Subject value = subjectRepository.findById(id).orElseThrow(() -> new Exception("Materia nao encontrada")); if (!value.getOrganizationKey().equals(organization(request))) throw new Exception("Materia fora da organizacao"); value.setActive(false); subjectRepository.save(value); return ResponseEntity.ok().build(); }
        catch (Exception e) { return ResponseEntity.badRequest().body(createError(e.getMessage())); }
    }

    private String organization(HttpServletRequest request) throws Exception {
        Object id = request.getAttribute("userId");
        if (!(id instanceof Long)) throw new Exception("Sessao invalida");
        return userRepository.findById((Long) id).orElseThrow(() -> new Exception("Usuario nao encontrado")).getOrganizationKey();
    }

    public static class ClassRequest { public String name; public Integer schoolYear; }
    public static class SubjectRequest { public String name; }
    public static class CreateUserRequest { public String name; public String email; public String password; public User.UserRole role; public String subject; public java.util.Set<String> classes; public String className; public String enrollment; }

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