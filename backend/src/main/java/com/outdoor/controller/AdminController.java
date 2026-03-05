package com.outdoor.controller;

import com.outdoor.entity.InviteRequest;
import com.outdoor.entity.User;
import com.outdoor.repository.UserRepository;
import com.outdoor.service.InviteRequestService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/admin")
public class AdminController {

    private final InviteRequestService inviteRequestService;
    private final UserRepository userRepository;

    public AdminController(InviteRequestService inviteRequestService, UserRepository userRepository) {
        this.inviteRequestService = inviteRequestService;
        this.userRepository = userRepository;
    }

    private String currentUserId(Authentication auth) {
        if (auth == null || auth.getPrincipal() == null) return null;
        return (String) auth.getPrincipal();
    }

    private ResponseEntity<?> requireAdmin(Authentication auth, Runnable action) {
        String userId = currentUserId(auth);
        if (userId == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        Optional<User> user = userRepository.findById(userId);
        if (user.isEmpty() || !inviteRequestService.isAdmin(user.get().getEmail())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message", "Admin only"));
        }
        action.run();
        return null;
    }

    @GetMapping("/invite-requests")
    public ResponseEntity<?> listInviteRequests(Authentication auth) {
        String userId = currentUserId(auth);
        if (userId == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        Optional<User> user = userRepository.findById(userId);
        if (user.isEmpty() || !inviteRequestService.isAdmin(user.get().getEmail())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message", "Admin only"));
        }
        List<InviteRequest> list = inviteRequestService.listAll();
        List<Map<String, Object>> items = list.stream().map(this::toResponse).collect(Collectors.toList());
        return ResponseEntity.ok(Map.of("items", items));
    }

    @PostMapping("/invite-requests/{id}/approve")
    public ResponseEntity<?> approve(@PathVariable String id, Authentication auth) {
        String userId = currentUserId(auth);
        if (userId == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        Optional<User> user = userRepository.findById(userId);
        if (user.isEmpty() || !inviteRequestService.isAdmin(user.get().getEmail())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message", "Admin only"));
        }
        return inviteRequestService.approve(id, userId)
                .map(req -> ResponseEntity.ok(Map.of(
                        "message", "Approved",
                        "joinToken", req.getJoinToken(),
                        "email", req.getEmail(),
                        "joinLink", "/register?join=" + req.getJoinToken()
                )))
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/invite-requests/{id}/reject")
    public ResponseEntity<?> reject(@PathVariable String id, Authentication auth) {
        String userId = currentUserId(auth);
        if (userId == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        Optional<User> user = userRepository.findById(userId);
        if (user.isEmpty() || !inviteRequestService.isAdmin(user.get().getEmail())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message", "Admin only"));
        }
        return inviteRequestService.reject(id)
                .map(req -> ResponseEntity.ok(Map.of("message", "Rejected")))
                .orElse(ResponseEntity.notFound().build());
    }

    private Map<String, Object> toResponse(InviteRequest req) {
        String referrerName = userRepository.findById(req.getReferrerUserId())
                .map(User::getDisplayName)
                .orElse(null);
        if (referrerName == null) {
            referrerName = userRepository.findById(req.getReferrerUserId())
                    .map(User::getEmail)
                    .orElse(req.getReferrerUserId());
        }
        return Map.of(
                "id", req.getId(),
                "email", req.getEmail() != null ? req.getEmail() : "",
                "phone", req.getPhone() != null ? req.getPhone() : "",
                "linkedInUrl", req.getLinkedInUrl() != null ? req.getLinkedInUrl() : "",
                "status", req.getStatus().name(),
                "referrerUserId", req.getReferrerUserId(),
                "referrerName", referrerName != null ? referrerName : "",
                "createdAt", req.getCreatedAt() != null ? req.getCreatedAt().toString() : "",
                "joinToken", req.getJoinToken() != null ? req.getJoinToken() : "",
                "usedAt", req.getUsedAt() != null ? req.getUsedAt().toString() : ""
        );
    }
}
