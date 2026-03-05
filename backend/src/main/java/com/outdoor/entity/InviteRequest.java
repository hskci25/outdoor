package com.outdoor.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Document(collection = "invite_requests")
public class InviteRequest {

    @Id
    private String id;

    @Indexed
    private String referrerUserId;

    private String email;
    private String phone;
    private String linkedInUrl;

    private Status status = Status.PENDING;

    private Instant createdAt = Instant.now();
    private Instant approvedAt;
    private String approvedByUserId;

    @Indexed(unique = true)
    private String joinToken;
    private Instant tokenExpiresAt;
    private Instant usedAt;

    public enum Status { PENDING, APPROVED, REJECTED }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getReferrerUserId() { return referrerUserId; }
    public void setReferrerUserId(String referrerUserId) { this.referrerUserId = referrerUserId; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public String getLinkedInUrl() { return linkedInUrl; }
    public void setLinkedInUrl(String linkedInUrl) { this.linkedInUrl = linkedInUrl; }
    public Status getStatus() { return status; }
    public void setStatus(Status status) { this.status = status; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
    public Instant getApprovedAt() { return approvedAt; }
    public void setApprovedAt(Instant approvedAt) { this.approvedAt = approvedAt; }
    public String getApprovedByUserId() { return approvedByUserId; }
    public void setApprovedByUserId(String approvedByUserId) { this.approvedByUserId = approvedByUserId; }
    public String getJoinToken() { return joinToken; }
    public void setJoinToken(String joinToken) { this.joinToken = joinToken; }
    public Instant getTokenExpiresAt() { return tokenExpiresAt; }
    public void setTokenExpiresAt(Instant tokenExpiresAt) { this.tokenExpiresAt = tokenExpiresAt; }
    public Instant getUsedAt() { return usedAt; }
    public void setUsedAt(Instant usedAt) { this.usedAt = usedAt; }
}
