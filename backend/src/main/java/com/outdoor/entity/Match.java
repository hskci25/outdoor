package com.outdoor.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.time.LocalDate;

@Document(collection = "matches")
public class Match {

    public enum Status { PENDING, ACCEPTED, DECLINED, COMPLETED }

    @Id
    private String id;

    @Indexed
    private String user1Id;

    @Indexed
    private String user2Id;

    @Indexed
    private LocalDate matchDate;

    private String suggestedActivity;
    private Status status = Status.PENDING;
    private Instant createdAt = Instant.now();

    /** Venue selected by user1 for this match (e.g. venue id or name). */
    private String user1VenueChoice;
    /** Venue selected by user2 for this match. */
    private String user2VenueChoice;

    protected Match() {}

    public Match(String user1Id, String user2Id, LocalDate matchDate, String suggestedActivity) {
        this.user1Id = user1Id;
        this.user2Id = user2Id;
        this.matchDate = matchDate;
        this.suggestedActivity = suggestedActivity;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getUser1Id() { return user1Id; }
    public void setUser1Id(String user1Id) { this.user1Id = user1Id; }
    public String getUser2Id() { return user2Id; }
    public void setUser2Id(String user2Id) { this.user2Id = user2Id; }
    public LocalDate getMatchDate() { return matchDate; }
    public void setMatchDate(LocalDate matchDate) { this.matchDate = matchDate; }
    public String getSuggestedActivity() { return suggestedActivity; }
    public void setSuggestedActivity(String suggestedActivity) { this.suggestedActivity = suggestedActivity; }
    public Status getStatus() { return status; }
    public void setStatus(Status status) { this.status = status; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
    public String getUser1VenueChoice() { return user1VenueChoice; }
    public void setUser1VenueChoice(String user1VenueChoice) { this.user1VenueChoice = user1VenueChoice; }
    public String getUser2VenueChoice() { return user2VenueChoice; }
    public void setUser2VenueChoice(String user2VenueChoice) { this.user2VenueChoice = user2VenueChoice; }
}
