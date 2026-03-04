package com.outdoor.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.util.StringUtils;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.util.Arrays;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Value("${cors.allowed-origins:}")
    private String corsAllowedOrigins;

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
