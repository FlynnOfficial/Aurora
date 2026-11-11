package com.aurora.security;

import com.aurora.repositories.UserRepository;
import com.aurora.utils.JWTUtil;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.dao.DataAccessException;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    private final JWTUtil jwtUtil;
    private final UserRepository userRepository;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        try {
            jwtUtil.readAccessToken(accessCookie(request)).ifPresent(session ->
                userRepository.findById(session.userId()).filter(user ->
                    Boolean.TRUE.equals(user.getActive()) && user.getEmail().equalsIgnoreCase(session.email())
                            && user.getRole().name().equals(session.role())
                ).ifPresent(user -> {
                    var authentication = UsernamePasswordAuthenticationToken.authenticated(
                            user.getEmail(), null, List.of(new SimpleGrantedAuthority("ROLE_" + session.role())));
                    SecurityContextHolder.getContext().setAuthentication(authentication);
                    request.setAttribute("userId", user.getId());
                    request.setAttribute("role", session.role());
                }));
        } catch (DataAccessException error) {
            logger.warn("Banco indisponível ao validar sessão (" + error.getClass().getSimpleName() + ")");
            response.setStatus(HttpServletResponse.SC_SERVICE_UNAVAILABLE);
            response.setContentType("application/json");
            response.setCharacterEncoding("UTF-8");
            response.getWriter().write("{\"error\":\"Serviço temporariamente indisponível. Tente novamente.\"}");
            return;
        }
        chain.doFilter(request, response);
    }

    private String accessCookie(HttpServletRequest request) {
        Cookie[] cookies = request.getCookies();
        if (cookies == null) return null;
        for (Cookie cookie : cookies) {
            if ("aurora_access".equals(cookie.getName())) return cookie.getValue();
        }
        return null;
    }
}
