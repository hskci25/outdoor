package com.outdoor.repository;

import com.outdoor.entity.Skill;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface SkillRepository extends MongoRepository<Skill, String> {

    Optional<Skill> findByNameIgnoreCase(String name);
}
