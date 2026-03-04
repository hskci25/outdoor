package com.outdoor.repository;

import com.outdoor.entity.User;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface UserRepository extends MongoRepository<User, String> {

    Optional<User> findByEmail(String email);

    Optional<User> findByInviteCode(String inviteCode);

    boolean existsByEmail(String email);

    boolean existsByInviteCode(String inviteCode);
}
