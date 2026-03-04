package com.outdoor.repository;

import com.outdoor.entity.Referral;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface ReferralRepository extends MongoRepository<Referral, String> {

    List<Referral> findByReferrerUserIdOrderByCreatedAtDesc(String referrerUserId);
}
