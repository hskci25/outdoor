package com.outdoor.controller;

import com.outdoor.service.AuthService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request) {
        try {
            AuthService.AuthResult result = authService.register(
                    request.inviteCode(),
                    request.email(),
                    request.password(),
                    request.displayName()
            );
            return ResponseEntity.ok(Map.of(
                    "token", result.getToken(),
                    "userId", result.getUserId(),
                    "email", result.getEmail(),
                    "displayName", result.getDisplayName() != null ? result.getDisplayName() : "",
                    "inviteCode", result.getInviteCode()
            ));
        } catch (AuthService.AuthException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {
        try {
            AuthService.AuthResult result = authService.login(request.email(), request.password());
            return ResponseEntity.ok(Map.of(
                    "token", result.getToken(),
                    "userId", result.getUserId(),
                    "email", result.getEmail(),
                    "displayName", result.getDisplayName() != null ? result.getDisplayName() : "",
                    "inviteCode", result.getInviteCode()
            ));
        } catch (AuthService.AuthException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    public record RegisterRequest(
            @NotBlank String inviteCode,
            @NotBlank String email,
            @NotBlank String password,
            String displayName
    ) {}

    public record LoginRequest(@NotBlank String email, @NotBlank String password) {}
}
