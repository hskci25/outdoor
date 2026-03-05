package com.outdoor.service;

import com.outdoor.entity.InviteRequest;
import com.outdoor.entity.User;
import com.outdoor.repository.InviteRequestRepository;
import com.outdoor.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class InviteRequestService {

    private static final int JOIN_TOKEN_DAYS_VALID = 7;

    private final InviteRequestRepository inviteRequestRepository;
    private final UserRepository userRepository;

    @Value("${admin.emails:}")
    private String adminEmailsConfig;

    public InviteRequestService(InviteRequestRepository inviteRequestRepository, UserRepository userRepository) {
        this.inviteRequestRepository = inviteRequestRepository;
        this.userRepository = userRepository;
    }

    public boolean isAdmin(String userEmail) {
        if (adminEmailsConfig == null || adminEmailsConfig.isBlank()) return false;
        String email = userEmail != null ? userEmail.trim().toLowerCase() : "";
        for (String admin : adminEmailsConfig.split(",")) {
            if (admin.trim().equalsIgnoreCase(email)) return true;
        }
        return false;
    }

    /** Public: submit invite request (no auth). Referrer is identified by inviteCode. */
    public void submit(String inviteCode, String email, String phone, String linkedInUrl) {
        User referrer = userRepository.findByInviteCode(inviteCode != null ? inviteCode.trim() : "")
                .orElseThrow(() -> new IllegalArgumentException("Invalid invite code"));
        InviteRequest req = new InviteRequest();
        req.setReferrerUserId(referrer.getId());
        req.setEmail(email != null ? email.trim() : "");
        req.setPhone(phone != null ? phone.trim() : "");
        req.setLinkedInUrl(linkedInUrl != null ? linkedInUrl.trim() : "");
        req.setStatus(InviteRequest.Status.PENDING);
        inviteRequestRepository.save(req);
    }

    /** Authenticated: current user submits referral details. You verify manually from backend and approve to generate join link. */
    public void submitAsReferrer(String referrerUserId, String email, String phone, String linkedInUrl) {
        InviteRequest req = new InviteRequest();
        req.setReferrerUserId(referrerUserId);
        req.setEmail(email != null ? email.trim() : "");
        req.setPhone(phone != null ? phone.trim() : "");
        req.setLinkedInUrl(linkedInUrl != null ? linkedInUrl.trim() : "");
        req.setStatus(InviteRequest.Status.PENDING);
        inviteRequestRepository.save(req);
    }

    public List<InviteRequest> listAll() {
        return inviteRequestRepository.findAllByOrderByCreatedAtDesc();
    }

    public Optional<InviteRequest> approve(String requestId, String approvedByUserId) {
        return inviteRequestRepository.findById(requestId)
                .map(req -> {
                    if (req.getStatus() != InviteRequest.Status.PENDING) return req;
                    req.setStatus(InviteRequest.Status.APPROVED);
                    req.setApprovedAt(Instant.now());
                    req.setApprovedByUserId(approvedByUserId);
                    req.setJoinToken(UUID.randomUUID().toString().replace("-", ""));
                    req.setTokenExpiresAt(Instant.now().plusSeconds(JOIN_TOKEN_DAYS_VALID * 86400L));
                    return inviteRequestRepository.save(req);
                });
    }

    public Optional<InviteRequest> reject(String requestId) {
        return inviteRequestRepository.findById(requestId)
                .map(req -> {
                    if (req.getStatus() != InviteRequest.Status.PENDING) return req;
                    req.setStatus(InviteRequest.Status.REJECTED);
                    return inviteRequestRepository.save(req);
                });
    }

    /** Validate join token for registration: must be APPROVED, not expired, not used, and email must match. */
    public Optional<InviteRequest> validateJoinToken(String joinToken, String email) {
        if (joinToken == null || joinToken.isBlank() || email == null || email.isBlank()) return Optional.empty();
        return inviteRequestRepository.findByJoinTokenAndStatus(joinToken.trim(), InviteRequest.Status.APPROVED)
                .filter(req -> req.getUsedAt() == null)
                .filter(req -> req.getTokenExpiresAt() != null && req.getTokenExpiresAt().isAfter(Instant.now()))
                .filter(req -> email.trim().equalsIgnoreCase(req.getEmail()));
    }

    public void markTokenUsed(String joinToken) {
        inviteRequestRepository.findByJoinTokenAndStatus(joinToken, InviteRequest.Status.APPROVED)
                .ifPresent(req -> {
                    req.setUsedAt(Instant.now());
                    inviteRequestRepository.save(req);
                });
    }
}
