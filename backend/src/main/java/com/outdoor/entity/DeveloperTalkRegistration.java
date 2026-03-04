package com.outdoor.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Document(collection = "developer_talk_registrations")
@CompoundIndex(name = "talk_user_unique", def = "{'talkId': 1, 'userId': 1}", unique = true)
public class DeveloperTalkRegistration {

    @Id
    private String id;

    @Indexed
    private String talkId;

    @Indexed
    private String userId;

    private Instant createdAt = Instant.now();

    protected DeveloperTalkRegistration() {}

    public DeveloperTalkRegistration(String talkId, String userId) {
        this.talkId = talkId;
        this.userId = userId;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getTalkId() { return talkId; }
    public void setTalkId(String talkId) { this.talkId = talkId; }
    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
