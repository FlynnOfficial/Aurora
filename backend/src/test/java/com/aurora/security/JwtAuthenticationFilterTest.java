package com.aurora.security;

import com.aurora.repositories.UserRepository;
import com.aurora.utils.JWTUtil;
import jakarta.servlet.FilterChain;
import jakarta.servlet.http.Cookie;
import org.junit.jupiter.api.Test;
import org.springframework.dao.DataAccessResourceFailureException;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class JwtAuthenticationFilterTest {
    @Test
    void reportsDatabaseFailureWithoutTreatingTheSessionAsExpired() throws Exception {
        JWTUtil jwt = mock(JWTUtil.class);
        UserRepository users = mock(UserRepository.class);
        when(jwt.readAccessToken("access")).thenReturn(
                Optional.of(new JWTUtil.Session(1L, "user@aurora.test", "STUDENT")));
        when(users.findById(1L)).thenThrow(new DataAccessResourceFailureException("Banco indisponível"));
        var request = new MockHttpServletRequest("GET", "/activities/teacher");
        request.setCookies(new Cookie("aurora_access", "access"));
        var response = new MockHttpServletResponse();
        FilterChain chain = mock(FilterChain.class);

        new JwtAuthenticationFilter(jwt, users).doFilter(request, response, chain);

        assertEquals(503, response.getStatus());
        assertTrue(response.getContentAsString().contains("temporariamente indisponível"));
        assertNull(response.getHeader("Set-Cookie"));
        verifyNoInteractions(chain);
    }
}
