package com.outdoor.repository;

import com.outdoor.entity.DeveloperTalkRegistration;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface DeveloperTalkRegistrationRepository extends MongoRepository<DeveloperTalkRegistration, String> {

    Optional<DeveloperTalkRegistration> findByTalkIdAndUserId(String talkId, String userId);

    boolean existsByTalkIdAndUserId(String talkId, String userId);
}
