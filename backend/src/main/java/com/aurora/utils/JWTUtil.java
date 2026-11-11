package com.aurora.utils;

import io.jsonwebtoken.JwtBuilder;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.JwtParser;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;
import java.util.Optional;

@Component
public class JWTUtil {
    private final SecretKey signingKey;
    private final JwtParser parser;
    private final long accessExpiration;
    private final long refreshExpiration;

    public JWTUtil(@Value("${jwt.secret}") String secret,
                   @Value("${jwt.access-expiration}") long accessExpiration,
                   @Value("${jwt.refresh-expiration}") long refreshExpiration) {
        signingKey = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        parser = Jwts.parser().verifyWith(signingKey).build();
        this.accessExpiration = accessExpiration;
        this.refreshExpiration = refreshExpiration;
    }

    public String generateAccessToken(Long userId, String email, String role) {
        return token(userId, email, "ACCESS", accessExpiration)
                .claim("role", role).signWith(signingKey, Jwts.SIG.HS256).compact();
    }

    public String generateRefreshToken(Long userId, String email) {
        return token(userId, email, "REFRESH", refreshExpiration)
                .signWith(signingKey, Jwts.SIG.HS256).compact();
    }

    public Optional<Session> readAccessToken(String token) {
        return read(token, "ACCESS").filter(session -> session.role() != null);
    }

    public Optional<Session> readRefreshToken(String token) {
        return read(token, "REFRESH");
    }

    private JwtBuilder token(Long userId, String email, String type, long expiration) {
        Instant now = Instant.now();
        return Jwts.builder().subject(email).claim("userId", userId).claim("type", type)
                .issuedAt(Date.from(now)).expiration(Date.from(now.plusMillis(expiration)));
    }

    private Optional<Session> read(String token, String type) {
        if (token == null || token.isBlank()) return Optional.empty();
        try {
            var claims = parser.parseSignedClaims(token).getPayload();
            Long userId = claims.get("userId", Long.class);
            if (!type.equals(claims.get("type")) || userId == null || claims.getSubject() == null
                    || claims.getExpiration() == null) return Optional.empty();
            return Optional.of(new Session(userId, claims.getSubject(), claims.get("role", String.class)));
        } catch (JwtException | IllegalArgumentException exception) {
            return Optional.empty();
        }
    }

    public record Session(Long userId, String email, String role) {}
}
