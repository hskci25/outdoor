# Matching Algorithm

This document explains how the daily developer matching works and how to test all flows.

## Overview

The system runs **daily matching** that pairs developers (users with complete profiles) into 1:1 matches. Each user gets **at most one** new match per day. Pairs are chosen by a **score** based on shared preferred activities, with a **cooldown** so the same two people are not matched again too soon.

## Eligibility

A user is **eligible for matching** only if they have a **complete profile**:

- **Complete profile** = `preferredActivities` is non-null and not empty.

So to get matches:

1. User must be registered and have a profile.
2. Profile must have at least one **preferred activity** set (e.g. `coffee`, `badminton`, `padel`, `dev talks`).

Update via `PUT /api/me/profile` with a body like:

```json
{
  "preferredActivities": ["coffee", "badminton"],
  "bio": "Backend dev"
}
```

## Scoring (`scorePair`)

For every pair of eligible users (A, B):

1. **Common activities:** Count how many preferred activities they have in common.
2. **Score:** `commonCount * 10`; if they have **no** common activities, subtract 5.
3. **Tie-breaker:** A tiny random value (0–0.1) is added so ordering is stable but not fully deterministic.

So:

- More shared activities → higher score (e.g. both like coffee + badminton → 20).
- No overlap → negative score (-5 + small random).

## Activity choice (`chooseActivity`)

For a matched pair, the **suggested activity** is:

- One of their **common** preferred activities (arbitrary if multiple).
- If they have **no** common activities, the default is **`coffee`**.

## Cooldown

- **Config:** `matching.cooldown-days` (default **90** in `application.yml`).
- **Rule:** Users A and B are **not** paired again if they already have **any** match with each other on or after `(matchDate - cooldownDays)`.
- So the same pair can be matched again only after the cooldown window has passed.

## Daily run

1. **Who runs it:** `DailyMatchingJob` (scheduled cron, default **6:00 AM** every day: `matching.cron`).
2. **What it does:** Calls `MatchingService.runDailyMatching(LocalDate.now())`.
3. **Steps:**
   - Load all **eligible** profiles (complete as above).
   - If fewer than 2, exit (no matches).
   - Build all unordered pairs (i, j) of eligible users.
   - Skip pairs where either user is already in `matchedUserIds` or they **recently matched** (cooldown).
   - Compute **score** for each remaining pair; sort by score **descending**.
   - In that order: for each pair, if both users are still unmatched, create a **Match** with:
     - `user1Id`, `user2Id`
     - `matchDate` = run date
     - `suggestedActivity` = from `chooseActivity`
   - Mark both users as matched for this run.
   - Persist all new matches.

So: **greedy** assignment by score; each user gets at most one new match per day; cooldown prevents repeat pairs within the configured days.

## Match data

- **Entity:** `Match`: `user1Id`, `user2Id`, `matchDate`, `suggestedActivity`, `status` (e.g. PENDING).
- **API:** `GET /api/me/matches` returns the current user’s matches (with `matchedWith` populated for the other user).

## How to test all flows

### 1. Create at least 2 eligible users

- Register 2+ users (invite code from your env/bootstrap).
- For each user, ensure they have a profile with **at least one** `preferredActivities` (e.g. via Profile/Settings or `PUT /api/me/profile`).

### 2. Trigger matching (without waiting for 6 AM)

Use the **dev endpoint** (only when `dev` profile is active):

```bash
# Run matching for today (default)
curl -X POST "http://localhost:8080/api/dev/run-matching"

# Run matching for a specific date (e.g. for testing “today’s” match on the dashboard)
curl -X POST "http://localhost:8080/api/dev/run-matching?date=2025-02-28"
```

Start the backend with the dev profile:

```bash
mvn spring-boot:run -Dspring-boot.run.profiles=dev
```

Or set in `application.yml`:

```yaml
spring:
  profiles:
    active: dev
```

Then:

1. **Trigger matching** for today (or a chosen date) with the curl above.
2. **Log in** as one of the matched users and open the app.
3. **Dashboard** should show “Today’s match” (or the match for that date).
4. **Matches** page should list that match and any past ones.

### 3. Test cooldown

- Run matching for day D (e.g. today).
- Run again for day D+1 (next day) with the **same** two users still eligible: they should **not** be paired again (cooldown 90 days).
- So you’ll see new matches only for **other** eligible users, or after changing cooldown for tests.

### 4. Test “no match today”

- Use a date for which no matching was run, or a user who was not paired that day: dashboard “today” section can be empty; Matches list may show only other dates.

### 5. Test activity suggestion

- Set overlapping `preferredActivities` for two users (e.g. both `["coffee", "badminton"]`).
- Run matching; their match’s `suggestedActivity` should be one of the common ones (e.g. coffee or badminton).
- Set two users with **no** overlap; their match’s `suggestedActivity` should be **coffee** (default).

## Summary

| Concept            | Implementation                                                                 |
|--------------------|---------------------------------------------------------------------------------|
| Eligibility        | Profile exists and `preferredActivities` is non-empty                            |
| Pair score         | 10 per shared activity; -5 if none; plus small random                          |
| Suggested activity | One common activity, or `coffee` if none                                        |
| Cooldown           | Same pair not matched again within `matching.cooldown-days` (default 90)         |
| When it runs       | Daily via cron at 6 AM; or manually via `POST /api/dev/run-matching` (dev only)  |
| Test flow          | 2+ eligible users → trigger dev endpoint → check dashboard and Matches page    |
