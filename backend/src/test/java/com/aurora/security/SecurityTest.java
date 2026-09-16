package com.aurora.security;

import com.aurora.services.AuthService;
import com.aurora.utils.InputSanitizer;
import com.aurora.utils.RateLimitingUtil;
import com.aurora.utils.JWTUtil;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@TestPropertySource(locations = "classpath:application-test.properties")
public class SecurityTest {

    @Autowired
    private InputSanitizer inputSanitizer;

    @Autowired
    private RateLimitingUtil rateLimitingUtil;

    @Autowired
    private JWTUtil jwtUtil;

    @Test
    public void testSQLInjectionDetection() {
        assertThrows(IllegalArgumentException.class, () -> {
            inputSanitizer.sanitizeInput("'; DROP TABLE users; --");
        });
    }

    @Test
    public void testXSSDetection() {
        assertThrows(IllegalArgumentException.class, () -> {
            inputSanitizer.sanitizeText("<script>alert('xss')</script>");
        });
    }

    @Test
    public void testEmailValidation() {
        assertThrows(IllegalArgumentException.class, () -> {
            inputSanitizer.sanitizeEmail("invalid@email");
        });
    }

    @Test
    public void testRateLimiting() {
        String email = "test@email.com";
        
        for (int i = 0; i < 5; i++) {
            rateLimitingUtil.recordFailedAttempt(email);
        }

        assertTrue(rateLimitingUtil.isLocked(email));
    }

    @Test
    public void testStrongPasswordValidation() {
        assertThrows(Exception.class, () -> {
            inputSanitizer.sanitizePassword("123"); // Muito fraca
        });
    }

    @Test
    public void testRefreshTokenCannotBeUsedAsAccessToken() {
        String accessToken = jwtUtil.generateAccessToken(1L, "user@aurora.test", "STUDENT");
        String refreshToken = jwtUtil.generateRefreshToken(1L, "user@aurora.test");

        assertTrue(jwtUtil.isAccessToken(accessToken));
        assertFalse(jwtUtil.isAccessToken(refreshToken));
        assertTrue(jwtUtil.isRefreshToken(refreshToken));
    }
}