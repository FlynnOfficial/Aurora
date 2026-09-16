package com.aurora.security;

import com.aurora.utils.JWTUtil;
import com.aurora.models.User;
import com.aurora.repositories.UserRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.Cookie;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Component
@RequiredArgsConstructor
@SuppressWarnings("null")
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    private final JWTUtil jwtUtil;
    private final UserRepository userRepository;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        try {
            String jwt = getCookie(request, "aurora_access");

            if (jwt != null && jwtUtil.isTokenValid(jwt) && jwtUtil.isAccessToken(jwt)) {
                String email = jwtUtil.extractEmail(jwt);
                Long userId = jwtUtil.extractUserId(jwt);
                String role = jwtUtil.extractRole(jwt);
                User user = userRepository.findById(userId).orElse(null);

                if (user == null || !Boolean.TRUE.equals(user.getActive()) ||
                        !user.getEmail().equalsIgnoreCase(email) ||
                        !user.getRole().name().equals(role)) {
                    filterChain.doFilter(request, response);
                    return;
                }

                UsernamePasswordAuthenticationToken authentication =
                    new UsernamePasswordAuthenticationToken(
                        email,
                        null,
                        List.of(new org.springframework.security.core.authority.SimpleGrantedAuthority("ROLE_" + role))
                    );
                authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authentication);

                // Store userId in request for later use
                request.setAttribute("userId", userId);
                request.setAttribute("role", role);
            }
        } catch (Exception ex) {
            logger.warn("Could not authenticate request with JWT: " + ex.getMessage());
        }

        filterChain.doFilter(request, response);
    }

    private String getCookie(HttpServletRequest request, String name) {
        Cookie[] cookies = request.getCookies();
        if (cookies == null) return null;
        for (Cookie cookie : cookies) {
            if (name.equals(cookie.getName())) return cookie.getValue();
        }
        return null;
    }
}