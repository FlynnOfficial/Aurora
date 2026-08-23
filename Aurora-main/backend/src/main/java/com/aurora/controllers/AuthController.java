package com.aurora.controllers;

import com.aurora.models.User;
import com.aurora.services.AuthService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.servlet.http.HttpServletRequest;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"}, 
             allowCredentials = "true",
             maxAge = 3600)
@Slf4j
public class AuthController {
    private final AuthService authService;

    private String getClientIp(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0];
        }
        return request.getRemoteAddr();
    }

    private String getUserAgent(HttpServletRequest request) {
        return request.getHeader("User-Agent");
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request, HttpServletRequest httpRequest) {
        try {
            String ipAddress = getClientIp(httpRequest);
            String userAgent = getUserAgent(httpRequest);

            Map<String, Object> response = authService.login(
                    request.email, 
                    request.password, 
                    ipAddress,
                    userAgent
            );
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Erro no login: {}", e.getMessage());
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
        }
    }

    @PostMapping("/refresh-token")
    public ResponseEntity<?> refreshToken(@RequestBody RefreshTokenRequest request) {
        try {
            Map<String, Object> response = authService.refreshToken(request.refreshToken);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Erro ao renovar token: {}", e.getMessage());
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
        }
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request, HttpServletRequest httpRequest) {
        try {
            String ipAddress = getClientIp(httpRequest);

            authService.registerUser(
                    request.email, 
                    request.password, 
                    request.name, 
                    request.role,
                    ipAddress
            );
            Map<String, String> response = new HashMap<>();
            response.put("message", "Usuário registrado com sucesso");
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            log.error("Erro no registro: {}", e.getMessage());
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(@RequestBody ChangePasswordRequest request, HttpServletRequest httpRequest) {
        try {
            String ipAddress = getClientIp(httpRequest);

            authService.changePassword(
                    request.userId, 
                    request.oldPassword, 
                    request.newPassword,
                    ipAddress
            );
            Map<String, String> response = new HashMap<>();
            response.put("message", "Senha alterada com sucesso");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Erro ao alterar senha: {}", e.getMessage());
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    // DTOs
    public static class LoginRequest {
        public String email;
        public String password;
    }

    public static class RegisterRequest {
        public String email;
        public String password;
        public String name;
        public User.UserRole role;
    }

    public static class ChangePasswordRequest {
        public Long userId;
        public String oldPassword;
        public String newPassword;
    }

    public static class RefreshTokenRequest {
        public String refreshToken;
    }
}