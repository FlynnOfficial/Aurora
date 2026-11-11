package com.aurora.services;

import com.aurora.controllers.AuthController;
import com.aurora.repositories.RegistrationRepository;
import com.aurora.repositories.UserRepository;
import com.aurora.utils.InputSanitizer;
import com.aurora.utils.JWTUtil;
import com.aurora.utils.RateLimitingUtil;
import jakarta.servlet.http.Cookie;
import org.junit.jupiter.api.Test;
import org.springframework.dao.DataAccessResourceFailureException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

class AuthServiceTest {
    @Test
    void preservesDatabaseFailuresWhenRefreshingSession() throws Exception {
        UserRepository users = mock(UserRepository.class);
        JWTUtil jwt = mock(JWTUtil.class);
        when(jwt.readRefreshToken("refresh")).thenReturn(
                Optional.of(new JWTUtil.Session(1L, "user@aurora.test", null)));
        var failure = new DataAccessResourceFailureException("Banco indisponível");
        when(users.findById(1L)).thenThrow(failure);
        var service = new AuthService(users, mock(RegistrationRepository.class), jwt,
                mock(PasswordEncoder.class), mock(RateLimitingUtil.class),
                mock(InputSanitizer.class), mock(SecurityAuditService.class));

        assertSame(failure, assertThrows(DataAccessResourceFailureException.class,
                () -> service.refreshToken("refresh")));
    }

    @Test
    void reportsDatabaseOutageAsServerFailureInsteadOfExpiredSession() throws Exception {
        AuthService service = mock(AuthService.class);
        when(service.refreshToken("refresh")).thenThrow(
                new DataAccessResourceFailureException("Banco indisponível"));
        when(service.currentUser(1L)).thenThrow(
                new DataAccessResourceFailureException("Banco indisponível"));
        var mvc = MockMvcBuilders.standaloneSetup(new AuthController(service)).build();

        mvc.perform(post("/auth/refresh-token").cookie(new Cookie("aurora_refresh", "refresh")))
                .andExpect(status().isInternalServerError())
                .andExpect(jsonPath("$.error").value("Não foi possível concluir a solicitação"));
        mvc.perform(get("/auth/me").requestAttr("userId", 1L))
                .andExpect(status().isInternalServerError());
    }
}
