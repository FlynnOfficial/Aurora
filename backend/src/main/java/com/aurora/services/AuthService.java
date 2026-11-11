package com.aurora.services;

import com.aurora.models.User;
import com.aurora.models.Registration;
import com.aurora.repositories.UserRepository;
import com.aurora.repositories.RegistrationRepository;
import com.aurora.utils.JWTUtil;
import com.aurora.utils.RateLimitingUtil;
import com.aurora.utils.InputSanitizer;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@SuppressWarnings("null")
public class AuthService {
    private final UserRepository userRepository;
    private final RegistrationRepository registrationRepository;
    private final JWTUtil jwtUtil;
    private final PasswordEncoder passwordEncoder;
    private final RateLimitingUtil rateLimitingUtil;
    private final InputSanitizer inputSanitizer;
    private final SecurityAuditService auditService;

    public Map<String, Object> login(String email, String password, String ipAddress, String userAgent) throws Exception {
        email = inputSanitizer.sanitizeEmail(email);
        password = inputSanitizer.sanitizePassword(password);

        if (rateLimitingUtil.isLocked(email)) {
            auditService.logLoginAttempt(email, false, ipAddress, userAgent);
            throw new Exception("Conta bloqueada temporariamente. Tente novamente em 15 minutos.");
        }

        Optional<User> user = userRepository.findByEmailIgnoreCase(email);
        if (user.isEmpty()) {
            rateLimitingUtil.recordFailedAttempt(email);
            auditService.logLoginAttempt(email, false, ipAddress, userAgent);
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

        return response;
    }

    public Map<String, Object> refreshToken(String refreshToken) throws Exception {
        var session = jwtUtil.readRefreshToken(refreshToken)
                .orElseThrow(() -> new Exception("Refresh token inválido"));
        String email = session.email();
        Long userId = session.userId();

        Optional<User> user = userRepository.findById(userId);
        if (user.isEmpty() || !user.get().getActive() || !user.get().getEmail().equalsIgnoreCase(email)) {
            throw new Exception("Usuário inválido ou inativo");
        }

        User foundUser = user.get();
        String newAccessToken = jwtUtil.generateAccessToken(userId, email, foundUser.getRole().name());

        Map<String, Object> response = new HashMap<>();
        response.put("accessToken", newAccessToken);
        response.put("expiresIn", 3600);

        return response;
    }

    public User currentUser(Long userId) throws Exception {
        return userRepository.findById(userId)
                .filter(user -> Boolean.TRUE.equals(user.getActive()))
                .orElseThrow(() -> new Exception("Usuário inválido ou inativo"));
    }

    public void requestAdminRegistration(String email, String password, String name, String organizationKey, String ipAddress) throws Exception {
        email = inputSanitizer.sanitizeEmail(email);
        password = inputSanitizer.sanitizePassword(password);
        name = inputSanitizer.sanitizeText(name);
        if (name == null || name.isBlank() || name.length() > 255) {
            throw new IllegalArgumentException("Informe um nome válido");
        }

        if (!isStrongPassword(password)) {
            throw new Exception("Senha não atende aos requisitos de segurança");
        }

        if (userRepository.findByEmailIgnoreCase(email).isPresent()) {
            auditService.logSecurityEvent(email, "DUPLICATE_REGISTRATION", "Tentativa de registrar email já existente", ipAddress);
            throw new Exception("Email já cadastrado");
        }

        if (organizationKey == null || organizationKey.isBlank()) {
            throw new Exception("Organizacao/escola obrigatoria");
        }
        if (registrationRepository.existsByEmailAndStatus(email, Registration.Status.PENDING)) {
            throw new Exception("Ja existe uma solicitacao pendente para este email");
        }

            Registration registration = Registration.builder()
                .type(Registration.RegistrationType.ADMIN)
                .email(email)
                .name(name)
                .password(passwordEncoder.encode(password))
                .organizationKey(inputSanitizer.sanitizeText(organizationKey))
                .status(Registration.Status.PENDING)
                .build();
            registrationRepository.save(registration);
            auditService.logSecurityEvent(email, "ADMIN_REGISTRATION_REQUESTED", "Solicitacao de Admin aguardando aprovacao", ipAddress);
    }

    public User changePassword(Long userId, String oldPassword, String newPassword, String ipAddress) throws Exception {
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

        return updatedUser;
    }

    private boolean isStrongPassword(String password) {
        return password.length() >= 8 &&
               password.matches(".*[A-Z].*") &&
               password.matches(".*[a-z].*") &&
               password.matches(".*\\d.*") &&
               password.matches(".*[!@#$%^&*].*");
    }
}