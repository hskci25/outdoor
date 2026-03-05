package com.outdoor.controller;

import com.outdoor.service.InviteRequestService;
import jakarta.validation.constraints.NotBlank;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/invite-request")
public class InviteRequestController {

    private final InviteRequestService inviteRequestService;

    public InviteRequestController(InviteRequestService inviteRequestService) {
        this.inviteRequestService = inviteRequestService;
    }

    @PostMapping
    public ResponseEntity<?> submit(@RequestBody SubmitInviteRequest body) {
        try {
            inviteRequestService.submit(
                    body.inviteCode(),
                    body.email(),
                    body.phone(),
                    body.linkedInUrl()
            );
            return ResponseEntity.ok(Map.of("message", "Request submitted. We'll review and get back to you."));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    public record SubmitInviteRequest(
            @NotBlank String inviteCode,
            @NotBlank String email,
            String phone,
            String linkedInUrl
    ) {}
}
