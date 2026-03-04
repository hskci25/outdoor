package com.outdoor.job;

import com.outdoor.service.MatchingService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;

@Component
public class DailyMatchingJob {

    private static final Logger log = LoggerFactory.getLogger(DailyMatchingJob.class);

    private final MatchingService matchingService;

    public DailyMatchingJob(MatchingService matchingService) {
        this.matchingService = matchingService;
    }

    @Scheduled(cron = "${matching.cron:0 0 6 * * ?}")
    public void runDailyMatching() {
        LocalDate today = LocalDate.now();
        log.info("Starting daily matching for {}", today);
        int created = matchingService.runDailyMatching(today);
        log.info("Daily matching finished: {} new matches created", created);
    }
}
