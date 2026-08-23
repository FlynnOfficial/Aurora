package com.aurora.utils;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

@Component
@Slf4j
public class RateLimitingUtil {
    private static final int MAX_ATTEMPTS = 5;
    private static final long LOCKOUT_TIME = 15 * 60 * 1000;
    private final ConcurrentHashMap<String, LoginAttempt> loginAttempts = new ConcurrentHashMap<>();

    public boolean isLocked(String email) {
        LoginAttempt attempt = loginAttempts.get(email);
        if (attempt == null) {
            return false;
        }

        if (System.currentTimeMillis() - attempt.lastAttemptTime > LOCKOUT_TIME) {
            loginAttempts.remove(email);
            return false;
        }

        return attempt.attemptCount.get() >= MAX_ATTEMPTS;
    }

    public void recordFailedAttempt(String email) {
        loginAttempts.computeIfAbsent(email, k -> new LoginAttempt())
                .recordFailedAttempt();
        log.warn("Tentativa de login falhada para: {}", email);
    }

    public void recordSuccessfulAttempt(String email) {
        loginAttempts.remove(email);
        log.info("Login bem-sucedido para: {}", email);
    }

    public int getAttemptCount(String email) {
        LoginAttempt attempt = loginAttempts.get(email);
        return attempt != null ? attempt.attemptCount.get() : 0;
    }

    private static class LoginAttempt {
        private final AtomicInteger attemptCount = new AtomicInteger(0);
        private long lastAttemptTime;

        void recordFailedAttempt() {
            this.attemptCount.incrementAndGet();
            this.lastAttemptTime = System.currentTimeMillis();
        }
    }
}