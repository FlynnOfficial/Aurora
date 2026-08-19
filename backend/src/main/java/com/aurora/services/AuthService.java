package com.aurora.services;

import com.aurora.models.User;
import com.aurora.repositories.UserRepository;
import com.aurora.utils.JWTUtil;
import com.aurora.utils.RateLimitingUtil;
import com.aurora.utils.InputSanitizer;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {
    private final UserRepository userRepository;
    private final JWTUtil jwtUtil;
    private final PasswordEncoder passwordEncoder;
    private final RateLimitingUtil rateLimitingUtil;
    private final InputSanitizer inputSanitizer;
    private final SecurityAuditService auditService;

    public Map<String, Object> login(String email, String password, String ipAddress, String userAgent) throws Exception {
        try {
            email = inputSanitizer.sanitizeEmail(email);
            password = inputSanitizer.sanitizePassword(password);

            if (rateLimitingUtil.isLocked(email)) {
                auditService.logLoginAttempt(email, false, ipAddress, userAgent);
                throw new Exception("Conta bloqueada temporariamente. Tente novamente em 15 minutos.");
            }

            Optional<User> user = userRepository.findByEmail(email);
            if (user.isEmpty()) {
                rateLimitingUtil.recordFailedAttempt(email);
                auditService.logLoginAttempt(email, false, ipAddress, userAgent);
                log.warn("Tentativa de login com email não registrado: {}", email);
                throw new Exception("Email ou senha incorretos");
            }

            User foundUser = user.get();

            if (!foundUser.getActive()) {
                auditService.logLoginAttempt(email, false, ipAddress, userAgent);
                throw new Exception("Usuário inativo");
            }

            if (!passwordEncoder.matches(password, foundUser.getPassword())) {
                rateLimitingUtil.recordFailedAttempt(email);
                auditService.logLoginAttempt(email, false, ipAddress, userAgent);
                int attempts = rateLimitingUtil.getAttemptCount(email);
                log.warn("Senha incorreta para: {}. Tentativas: {}/5", email, attempts);
                throw new Exception("Email ou senha incorretos");
            }

            rateLimitingUtil.recordSuccessfulAttempt(email);
            auditService.logLoginAttempt(email, true, ipAddress, userAgent);

            String accessToken = jwtUtil.generateAccessToken(foundUser.getId(), foundUser.getEmail(), foundUser.getRole().name());
            String refreshToken = jwtUtil.generateRefreshToken(foundUser.getId(), foundUser.getEmail());

            Map<String, Object> response = new HashMap<>();
            response.put("accessToken", accessToken);
            response.put("refreshToken", refreshToken);
            response.put("userId", foundUser.getId());
            response.put("email", foundUser.getEmail());
            response.put("name", foundUser.getName());
            response.put("role", foundUser.getRole().name());
            response.put("expiresIn", 3600);

            log.info("Login bem-sucedido para: {}", email);
            return response;
        } catch (Exception e) {
            log.error("Erro durante login: {}", e.getMessage());
            throw e;
        }
    }

    public Map<String, Object> refreshToken(String refreshToken) throws Exception {
        try {
            if (!jwtUtil.isTokenValid(refreshToken) || !jwtUtil.isRefreshToken(refreshToken)) {
                throw new Exception("Refresh token inválido");
            }

            String email = jwtUtil.extractEmail(refreshToken);
            Long userId = jwtUtil.extractUserId(refreshToken);

            Optional<User> user = userRepository.findById(userId);
            if (user.isEmpty() || !user.get().getActive()) {
                throw new Exception("Usuário inválido ou inativo");
            }

            User foundUser = user.get();
            String newAccessToken = jwtUtil.generateAccessToken(userId, email, foundUser.getRole().name());

            Map<String, Object> response = new HashMap<>();
            response.put("accessToken", newAccessToken);
            response.put("expiresIn", 3600);

            log.info("Token renovado para: {}", email);
            return response;
        } catch (Exception e) {
            log.error("Erro ao renovar token: {}", e.getMessage());
            throw new Exception("Falha ao renovar token");
        }
    }

    public User registerUser(String email, String password, String name, User.UserRole role, String ipAddress) throws Exception {
        try {
            email = inputSanitizer.sanitizeEmail(email);
            password = inputSanitizer.sanitizePassword(password);
            name = inputSanitizer.sanitizeText(name);

            if (!isStrongPassword(password)) {
                throw new Exception("Senha não atende aos requisitos de segurança");
            }

            if (userRepository.findByEmail(email).isPresent()) {
                auditService.logSecurityEvent(email, "DUPLICATE_REGISTRATION", "Tentativa de registrar email já existente", ipAddress);
                throw new Exception("Email já cadastrado");
            }

            User newUser = new User();
            newUser.setEmail(email);
            newUser.setPassword(passwordEncoder.encode(password));
            newUser.setName(name);
            newUser.setRole(role);
            newUser.setActive(true);

            User savedUser = userRepository.save(newUser);
            auditService.logSecurityEvent(email, "REGISTRATION", "Novo usuário registrado", ipAddress);

            log.info("Novo usuário registrado: {}", email);
            return savedUser;
        } catch (Exception e) {
            log.error("Erro ao registrar usuário: {}", e.getMessage());
            throw e;
        }
    }

    public User changePassword(Long userId, String oldPassword, String newPassword, String ipAddress) throws Exception {
        try {
            oldPassword = inputSanitizer.sanitizePassword(oldPassword);
            newPassword = inputSanitizer.sanitizePassword(newPassword);

            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new Exception("Usuário não encontrado"));

            if (!passwordEncoder.matches(oldPassword, user.getPassword())) {
                auditService.logSecurityEvent(user.getEmail(), "PASSWORD_CHANGE_FAILED", "Senha atual incorreta", ipAddress);
                throw new Exception("Senha atual incorreta");
            }

            if (!isStrongPassword(newPassword)) {
                throw new Exception("Nova senha não atende aos requisitos");
            }

            if (passwordEncoder.matches(newPassword, user.getPassword())) {
                throw new Exception("Nova senha deve ser diferente da senha atual");
            }

            user.setPassword(passwordEncoder.encode(newPassword));
            User updatedUser = userRepository.save(user);

            auditService.logSecurityEvent(user.getEmail(), "PASSWORD_CHANGED", "Senha alterada com sucesso", ipAddress);
            log.info("Senha alterada para: {}", user.getEmail());

            return updatedUser;
        } catch (Exception e) {
            log.error("Erro ao alterar senha: {}", e.getMessage());
            throw e;
        }
    }

    private boolean isStrongPassword(String password) {
        return password.length() >= 8 &&
               password.matches(".*[A-Z].*") &&
               password.matches(".*[a-z].*") &&
               password.matches(".*\\d.*") &&
               password.matches(".*[!@#$%^&*].*");
    }
}