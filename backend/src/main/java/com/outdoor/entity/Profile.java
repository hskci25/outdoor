package com.outdoor.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "profiles")
public class Profile {

    @Id
    private String id;

    @Indexed(unique = true)
    private String userId;

    private Integer yearsExperience;
    private String currentCompany;
    private List<String> targetCompanies = new ArrayList<>();
    private BigDecimal salaryRangeMin;
    private BigDecimal salaryRangeMax;
    private String bio;
    private List<String> preferredActivities = new ArrayList<>();
    private String preferredMatchFrequency;

    /** GridFS file id for profile photo (stored in MongoDB). */
    private String profilePhotoFileId;
    /** Link to resume (e.g. Google Drive, LinkedIn PDF). */
    private String resumeLink;
    /** GitHub profile URL. */
    private String githubLink;

    /** Embedded: skill id + optional proficiency (beginner, intermediate, expert). */
    private List<ProfileSkillEntry> skills = new ArrayList<>();

    private Instant createdAt = Instant.now();

    @LastModifiedDate
    private Instant updatedAt = Instant.now();

    public record ProfileSkillEntry(String skillId, String proficiency) {}

    protected Profile() {}

    public Profile(String userId) {
        this.userId = userId;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }
    public Integer getYearsExperience() { return yearsExperience; }
    public void setYearsExperience(Integer yearsExperience) { this.yearsExperience = yearsExperience; }
    public String getCurrentCompany() { return currentCompany; }
    public void setCurrentCompany(String currentCompany) { this.currentCompany = currentCompany; }
    public List<String> getTargetCompanies() { return targetCompanies; }
    public void setTargetCompanies(List<String> targetCompanies) { this.targetCompanies = targetCompanies != null ? targetCompanies : new ArrayList<>(); }
    public BigDecimal getSalaryRangeMin() { return salaryRangeMin; }
    public void setSalaryRangeMin(BigDecimal salaryRangeMin) { this.salaryRangeMin = salaryRangeMin; }
    public BigDecimal getSalaryRangeMax() { return salaryRangeMax; }
    public void setSalaryRangeMax(BigDecimal salaryRangeMax) { this.salaryRangeMax = salaryRangeMax; }
    public String getBio() { return bio; }
    public void setBio(String bio) { this.bio = bio; }
    public List<String> getPreferredActivities() { return preferredActivities; }
    public void setPreferredActivities(List<String> preferredActivities) { this.preferredActivities = preferredActivities != null ? preferredActivities : new ArrayList<>(); }
    public String getPreferredMatchFrequency() { return preferredMatchFrequency; }
    public void setPreferredMatchFrequency(String preferredMatchFrequency) { this.preferredMatchFrequency = preferredMatchFrequency; }
    public String getProfilePhotoFileId() { return profilePhotoFileId; }
    public void setProfilePhotoFileId(String profilePhotoFileId) { this.profilePhotoFileId = profilePhotoFileId; }
    public String getResumeLink() { return resumeLink; }
    public void setResumeLink(String resumeLink) { this.resumeLink = resumeLink; }
    public String getGithubLink() { return githubLink; }
    public void setGithubLink(String githubLink) { this.githubLink = githubLink; }
    public List<ProfileSkillEntry> getSkills() { return skills; }
    public void setSkills(List<ProfileSkillEntry> skills) { this.skills = skills != null ? skills : new ArrayList<>(); }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
