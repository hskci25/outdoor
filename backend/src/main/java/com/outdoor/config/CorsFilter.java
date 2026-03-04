package com.outdoor.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Runs first to add CORS headers to every response and handle OPTIONS preflight.
 * Registered with FilterRegistrationBean so it runs before Spring Security.
 */
public class CorsFilter extends OncePerRequestFilter {

    private final String corsAllowedOrigins;

    public CorsFilter(String corsAllowedOrigins) {
        this.corsAllowedOrigins = corsAllowedOrigins != null ? corsAllowedOrigins : "";
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
        if (!StringUtils.hasText(this.corsAllowedOrigins)) {
            return origin.startsWith("http://localhost:") || origin.startsWith("http://127.0.0.1:");
        }
        List<String> allowed = Arrays.stream(this.corsAllowedOrigins.split(","))
                .map(String::trim)
                .filter(StringUtils::hasText)
                .collect(Collectors.toList());
        return allowed.contains(origin);
    }
}
