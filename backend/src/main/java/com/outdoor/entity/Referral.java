package com.outdoor.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Document(collection = "referrals")
public class Referral {

    public enum Status { PENDING, INVITED, ACCEPTED, REJECTED }

    @Id
    private String id;

    @Indexed
    private String referrerUserId;

    private String referredName;
    private String referredEmail;
    private String referredPhone;
    private String linkedinProfileLink;

    /** Link to resume (e.g. Google Drive, LinkedIn PDF). Optional file upload can be added later. */
    private String resumeUrl;

    /** Optional: original file name if resume was uploaded */
    private String resumeFileName;

    private Status status = Status.PENDING;

    /** Set when the referred person signs up on the platform */
    @Indexed
    private String referredUserId;

    private Instant createdAt = Instant.now();

    protected Referral() {}

    public Referral(String referrerUserId, String referredName, String referredEmail) {
        this.referrerUserId = referrerUserId;
        this.referredName = referredName;
        this.referredEmail = referredEmail;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getReferrerUserId() { return referrerUserId; }
    public void setReferrerUserId(String referrerUserId) { this.referrerUserId = referrerUserId; }
    public String getReferredName() { return referredName; }
    public void setReferredName(String referredName) { this.referredName = referredName; }
    public String getReferredEmail() { return referredEmail; }
    public void setReferredEmail(String referredEmail) { this.referredEmail = referredEmail; }
    public String getReferredPhone() { return referredPhone; }
    public void setReferredPhone(String referredPhone) { this.referredPhone = referredPhone; }
    public String getLinkedinProfileLink() { return linkedinProfileLink; }
    public void setLinkedinProfileLink(String linkedinProfileLink) { this.linkedinProfileLink = linkedinProfileLink; }
    public String getResumeUrl() { return resumeUrl; }
    public void setResumeUrl(String resumeUrl) { this.resumeUrl = resumeUrl; }
    public String getResumeFileName() { return resumeFileName; }
    public void setResumeFileName(String resumeFileName) { this.resumeFileName = resumeFileName; }
    public Status getStatus() { return status; }
    public void setStatus(Status status) { this.status = status; }
    public String getReferredUserId() { return referredUserId; }
    public void setReferredUserId(String referredUserId) { this.referredUserId = referredUserId; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
