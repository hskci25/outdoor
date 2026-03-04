package com.outdoor.repository;

import com.outdoor.entity.Match;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface MatchRepository extends MongoRepository<Match, String> {

    List<Match> findByUser1IdOrUser2IdOrderByMatchDateDesc(String user1Id, String user2Id);

    @Query("{ $or: [ { user1Id: ?0, matchDate: ?1 }, { user2Id: ?0, matchDate: ?1 } ] }")
    Optional<Match> findMatchForUserOnDate(String userId, LocalDate date);

    @Query("{ $or: [ { user1Id: ?0, user2Id: ?1 }, { user1Id: ?1, user2Id: ?0 } ], matchDate: { $gte: ?2 } }")
    List<Match> findMatchesBetweenUsersSince(String userA, String userB, LocalDate since);
}
