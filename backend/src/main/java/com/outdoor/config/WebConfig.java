package com.outdoor.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.util.StringUtils;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.util.Arrays;
import java.util.List;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Value("${cors.allowed-origins:}")
    private String corsAllowedOrigins;

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);
        // Local dev + production; extra origins from CORS_ALLOWED_ORIGINS env
        config.setAllowedOriginPatterns(List.of(
            "http://localhost:*",
            "http://127.0.0.1:*",
            "https://outdoor-frontend.onrender.com",
            "https://krew.life",
            "https://www.krew.life"
        ));
        if (StringUtils.hasText(corsAllowedOrigins)) {
            for (String o : corsAllowedOrigins.split(",")) {
                String t = o.trim();
                if (!t.isEmpty()) config.addAllowedOriginPattern(t);
            }
        }
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        var mapping = registry.addMapping("/**")
            .allowedMethods("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")
            .allowedHeaders("*")
            .allowCredentials(true);
        if (StringUtils.hasText(corsAllowedOrigins)) {
            String[] origins = Arrays.stream(corsAllowedOrigins.split(","))
                .map(String::trim)
                .filter(StringUtils::hasText)
                .toArray(String[]::new);
            if (origins.length > 0) {
                mapping.allowedOrigins(origins);
            } else {
                mapping.allowedOriginPatterns("http://localhost:*", "http://127.0.0.1:*");
            }
        } else {
            mapping.allowedOriginPatterns("http://localhost:*", "http://127.0.0.1:*");
        }
    }
}
