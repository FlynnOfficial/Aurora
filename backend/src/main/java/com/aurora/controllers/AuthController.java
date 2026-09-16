package com.aurora.controllers;

import com.aurora.models.User;
import com.aurora.services.AuthService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.http.ResponseCookie;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.Cookie;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@Slf4j
public class AuthController {
    private final AuthService authService;

    @Value("${security.cookies.secure:false}")
    private boolean secureCookies;

    @Value("${security.cookies.same-site:Lax}")
    private String sameSite;

    private String getClientIp(HttpServletRequest request) {
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
                String accessToken = String.valueOf(response.remove("accessToken"));
                String refreshToken = String.valueOf(response.remove("refreshToken"));
                return ResponseEntity.ok()
                    .header(HttpHeaders.SET_COOKIE, sessionCookie("aurora_access", accessToken, 3600).toString())
                    .header(HttpHeaders.SET_COOKIE, sessionCookie("aurora_refresh", refreshToken, 86400).toString())
                    .body(response);
        } catch (Exception e) {
            log.error("Erro no login: {}", e.getMessage());
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
        }
    }

    @PostMapping("/refresh-token")
    public ResponseEntity<?> refreshToken(HttpServletRequest request) {
        try {
            String refreshToken = cookieValue(request, "aurora_refresh");
            if (refreshToken == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Sessão expirada"));
            Map<String, Object> response = authService.refreshToken(refreshToken);
            String accessToken = String.valueOf(response.remove("accessToken"));
            return ResponseEntity.ok()
                    .header(HttpHeaders.SET_COOKIE, sessionCookie("aurora_access", accessToken, 3600).toString())
                    .body(response);
        } catch (Exception e) {
            log.error("Erro ao renovar token: {}", e.getMessage());
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
        }
    }

    @GetMapping("/me")
    public ResponseEntity<?> me(HttpServletRequest request) {
        try {
            Object userId = request.getAttribute("userId");
            if (!(userId instanceof Long)) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Sessão inválida"));
            User user = authService.currentUser((Long) userId);
            return ResponseEntity.ok(Map.of("userId", user.getId(), "email", user.getEmail(), "name", user.getName(), "role", user.getRole().name()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Sessão inválida"));
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout() {
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, expiredCookie("aurora_access").toString())
                .header(HttpHeaders.SET_COOKIE, expiredCookie("aurora_refresh").toString())
                .body(Map.of("message", "Sessão encerrada"));
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request, HttpServletRequest httpRequest) {
        try {
            String ipAddress = getClientIp(httpRequest);

                authService.requestAdminRegistration(
                    request.email, 
                    request.password, 
                    request.name, 
                    request.organizationKey,
                    ipAddress
            );
            Map<String, String> response = new HashMap<>();
            response.put("message", "Solicitacao enviada. Um Super Admin precisa aprovar o cadastro antes do primeiro acesso.");
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
            Object authenticatedUserId = httpRequest.getAttribute("userId");
            if (!(authenticatedUserId instanceof Long)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Sessão inválida"));
            }

            authService.changePassword(
                    (Long) authenticatedUserId,
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
        public String organizationKey;
    }

    public static class ChangePasswordRequest {
        public String oldPassword;
        public String newPassword;
    }

    private ResponseCookie sessionCookie(String name, String value, long maxAge) {
        return ResponseCookie.from(name, value)
                .httpOnly(true)
                .secure(secureCookies)
                .sameSite(sameSite)
                .path("/api")
                .maxAge(maxAge)
                .build();
    }

    private ResponseCookie expiredCookie(String name) {
        return sessionCookie(name, "", 0);
    }

    private String cookieValue(HttpServletRequest request, String name) {
        Cookie[] cookies = request.getCookies();
        if (cookies == null) return null;
        for (Cookie cookie : cookies) if (name.equals(cookie.getName())) return cookie.getValue();
        return null;
    }
}