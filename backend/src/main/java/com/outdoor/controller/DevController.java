package com.outdoor.controller;

import com.outdoor.service.MatchingService;
import org.springframework.context.annotation.Profile;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.Map;

/**
 * Dev-only endpoints for testing. Only active when spring.profiles.active includes "dev".
 * Use: mvn spring-boot:run -Dspring-boot.run.profiles=dev
 * Then: POST /api/dev/run-matching?date=2025-02-28 (date optional, defaults to today)
 */
@Profile("dev")
@RestController
@RequestMapping("/dev")
public class DevController {

    private final MatchingService matchingService;

    public DevController(MatchingService matchingService) {
        this.matchingService = matchingService;
    }

    @PostMapping("/run-matching")
    public ResponseEntity<Map<String, Object>> runMatching(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date
    ) {
        LocalDate runDate = date != null ? date : LocalDate.now();
        int created = matchingService.runDailyMatching(runDate);
        return ResponseEntity.ok(Map.of(
                "date", runDate.toString(),
                "matchesCreated", created,
                "message", "Matching run complete. Use GET /api/me/matches (with auth) to see results."
        ));
    }
}
