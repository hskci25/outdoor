package com.outdoor.service;

import com.outdoor.entity.Match;
import com.outdoor.entity.Profile;
import com.outdoor.repository.MatchRepository;
import com.outdoor.repository.ProfileRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Daily matching algorithm: pairs developers based on preferred activities
 * and ensures cooldown between same pairs. MVP uses rule-based scoring only.
 */
@Service
public class MatchingService {

    private static final Logger log = LoggerFactory.getLogger(MatchingService.class);
    private static final String DEFAULT_ACTIVITY = "badminton";

    private final ProfileRepository profileRepository;
    private final MatchRepository matchRepository;

    @Value("${matching.cooldown-days:90}")
    private int cooldownDays;

    public MatchingService(ProfileRepository profileRepository, MatchRepository matchRepository) {
        this.profileRepository = profileRepository;
        this.matchRepository = matchRepository;
    }

    /**
     * Run daily matching for the given date. Each user appears in at most one new match.
     */
    public int runDailyMatching(LocalDate date) {
        List<Profile> eligible = findEligibleProfiles();
        if (eligible.size() < 2) {
            log.info("Not enough eligible profiles for matching on {}", date);
            return 0;
        }

        Set<String> matchedUserIds = new HashSet<>();
        List<Match> newMatches = new ArrayList<>();

        List<PairScore> pairs = new ArrayList<>();
        for (int i = 0; i < eligible.size(); i++) {
            for (int j = i + 1; j < eligible.size(); j++) {
                Profile a = eligible.get(i);
                Profile b = eligible.get(j);
                String idA = a.getUserId();
                String idB = b.getUserId();
                if (matchedUserIds.contains(idA) || matchedUserIds.contains(idB)) continue;
                if (recentlyMatched(idA, idB, date)) continue;

                double score = scorePair(a, b);
                pairs.add(new PairScore(a, b, score));
            }
        }

        pairs.sort(Comparator.comparingDouble(PairScore::score).reversed());
        for (PairScore ps : pairs) {
            String idA = ps.a.getUserId();
            String idB = ps.b.getUserId();
            if (matchedUserIds.contains(idA) || matchedUserIds.contains(idB)) continue;

            String activity = chooseActivity(ps.a, ps.b);
            Match m = new Match(idA, idB, date, activity);
            newMatches.add(m);
            matchedUserIds.add(idA);
            matchedUserIds.add(idB);
        }

        matchRepository.saveAll(newMatches);
        log.info("Created {} new matches for date {}", newMatches.size(), date);
        return newMatches.size();
    }

    private List<Profile> findEligibleProfiles() {
        return profileRepository.findAll().stream()
            .filter(this::isProfileComplete)
            .collect(Collectors.toList());
    }

    private boolean isProfileComplete(Profile p) {
        if (p.getPreferredActivities() == null || p.getPreferredActivities().isEmpty()) return false;
        return p.getPreferredActivities().stream().anyMatch("badminton"::equalsIgnoreCase);
    }

    private boolean recentlyMatched(String userA, String userB, LocalDate beforeDate) {
        LocalDate since = beforeDate.minusDays(cooldownDays);
        return !matchRepository.findMatchesBetweenUsersSince(userA, userB, since).isEmpty();
    }

    private double scorePair(Profile a, Profile b) {
        double score = 0;
        Set<String> activitiesA = new HashSet<>(a.getPreferredActivities() != null ? a.getPreferredActivities() : List.of());
        Set<String> activitiesB = new HashSet<>(b.getPreferredActivities() != null ? b.getPreferredActivities() : List.of());
        Set<String> common = new HashSet<>(activitiesA);
        common.retainAll(activitiesB);
        score += common.size() * 10;
        if (common.isEmpty()) score -= 5;
        return score + (new Random().nextDouble() * 0.1);
    }

    private String chooseActivity(Profile a, Profile b) {
        return DEFAULT_ACTIVITY;
    }

    private record PairScore(Profile a, Profile b, double score) {}
}
