package com.outdoor.repository;

import com.outdoor.entity.DeveloperTalk;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.time.Instant;
import java.util.List;

public interface DeveloperTalkRepository extends MongoRepository<DeveloperTalk, String> {

    List<DeveloperTalk> findByScheduledAtGreaterThanEqualOrderByScheduledAtAsc(Instant since);
}
