package com.outdoor.repository;

import com.outdoor.entity.InviteRequest;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface InviteRequestRepository extends MongoRepository<InviteRequest, String> {

    Optional<InviteRequest> findByJoinTokenAndStatus(String joinToken, InviteRequest.Status status);

    List<InviteRequest> findAllByOrderByCreatedAtDesc();
}
