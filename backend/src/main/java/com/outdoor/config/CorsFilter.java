package com.outdoor.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.Ordered;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Runs first to add CORS headers and handle OPTIONS preflight before Spring Security.
 */
@Component
public class CorsFilter extends OncePerRequestFilter implements Ordered {

    private static final String RENDER_FRONTEND = "https://outdoor-frontend.onrender.com";
    private static final List<String> ALWAYS_ALLOWED_ORIGINS = List.of(
        "https://outdoor-frontend.onrender.com",
        "https://krew.life",
        "https://www.krew.life"
    );

    @Value("${cors.allowed-origins:}")
    private String corsAllowedOrigins;

    @Override
    public int getOrder() {
        return Ordered.HIGHEST_PRECEDENCE;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        String origin = request.getHeader("Origin");
        if (StringUtils.hasText(origin) && isAllowedOrigin(origin)) {
            response.setHeader("Access-Control-Allow-Origin", origin);
            response.setHeader("Access-Control-Allow-Credentials", "true");
            response.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
            response.setHeader("Access-Control-Allow-Headers", "*");
            response.setHeader("Access-Control-Max-Age", "3600");
        }

        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            response.setStatus(HttpServletResponse.SC_OK);
            return;
        }

        filterChain.doFilter(request, response);
    }

    private boolean isAllowedOrigin(String origin) {
        if (origin == null) return false;
        String o = origin.trim();
        // Always allow local dev origins
        if (o.startsWith("http://localhost:") || o.startsWith("http://127.0.0.1:")) return true;
        if (ALWAYS_ALLOWED_ORIGINS.contains(o)) return true;
        if (!StringUtils.hasText(corsAllowedOrigins)) return false;
        List<String> allowed = Arrays.stream(corsAllowedOrigins.split(","))
                .map(String::trim)
                .filter(StringUtils::hasText)
                .collect(Collectors.toList());
        return allowed.contains(o);
    }
}
