package com.outdoor.controller;

import com.outdoor.entity.Match;
import com.outdoor.entity.Profile;
import com.outdoor.entity.Referral;
import com.outdoor.entity.User;
import com.outdoor.repository.MatchRepository;
import com.outdoor.repository.ProfileRepository;
import com.outdoor.repository.ReferralRepository;
import com.outdoor.repository.UserRepository;
import com.outdoor.service.InviteRequestService;
import com.outdoor.service.ProfilePhotoService;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/me")
public class MeController {

    private final ProfileRepository profileRepository;
    private final MatchRepository matchRepository;
    private final UserRepository userRepository;
    private final ReferralRepository referralRepository;
    private final ProfilePhotoService profilePhotoService;
    private final InviteRequestService inviteRequestService;

    public MeController(ProfileRepository profileRepository,
                        MatchRepository matchRepository,
                        UserRepository userRepository,
                        ReferralRepository referralRepository,
                        ProfilePhotoService profilePhotoService,
                        InviteRequestService inviteRequestService) {
        this.profileRepository = profileRepository;
        this.matchRepository = matchRepository;
        this.userRepository = userRepository;
        this.referralRepository = referralRepository;
        this.profilePhotoService = profilePhotoService;
        this.inviteRequestService = inviteRequestService;
    }

    private String currentUserId(Authentication auth) {
        if (auth == null || auth.getPrincipal() == null) return null;
        return (String) auth.getPrincipal();
    }

    @GetMapping
    public ResponseEntity<?> getMe(Authentication auth) {
        String userId = currentUserId(auth);
        if (userId == null) return ResponseEntity.status(401).build();
        return userRepository.findById(userId)
                .map(u -> ResponseEntity.ok(Map.of(
                        "userId", u.getId(),
                        "email", u.getEmail() != null ? u.getEmail() : "",
                        "isAdmin", inviteRequestService.isAdmin(u.getEmail())
                )))
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/invite-code")
    public ResponseEntity<?> getMyInviteCode(Authentication auth) {
        String userId = currentUserId(auth);
        if (userId == null) return ResponseEntity.status(401).build();
        return userRepository.findById(userId)
                .map(u -> ResponseEntity.ok(Map.of("inviteCode", u.getInviteCode() != null ? u.getInviteCode() : "")))
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/profile")
    public ResponseEntity<?> getProfile(Authentication auth) {
        String userId = currentUserId(auth);
        if (userId == null) return ResponseEntity.status(401).build();
        return profileRepository.findByUserId(userId)
                .map(MeController::toResponse)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(Authentication auth, @RequestBody Map<String, Object> body) {
        String userId = currentUserId(auth);
        if (userId == null) return ResponseEntity.status(401).build();

        Profile profile = profileRepository.findByUserId(userId)
                .orElseGet(() -> {
                    Profile p = new Profile(userId);
                    return profileRepository.save(p);
                });

        if (body.containsKey("yearsExperience")) {
            Object v = body.get("yearsExperience");
            profile.setYearsExperience(v != null && v instanceof Number n ? n.intValue() : null);
        }
        if (body.containsKey("currentCompany"))
            profile.setCurrentCompany(body.get("currentCompany") != null ? body.get("currentCompany").toString() : null);
        if (body.containsKey("targetCompanies")) {
            Object raw = body.get("targetCompanies");
            if (raw instanceof List<?> list) {
                profile.setTargetCompanies(list.stream().map(o -> o != null ? o.toString() : null).filter(s -> s != null && !s.isBlank()).toList());
            }
        }
        if (body.containsKey("salaryRangeMin")) {
            Object v = body.get("salaryRangeMin");
            profile.setSalaryRangeMin(v != null && v instanceof Number ? new BigDecimal(v.toString()) : null);
        }
        if (body.containsKey("salaryRangeMax")) {
            Object v = body.get("salaryRangeMax");
            profile.setSalaryRangeMax(v != null && v instanceof Number ? new BigDecimal(v.toString()) : null);
        }
        if (body.containsKey("bio"))
            profile.setBio((String) body.get("bio"));
        if (body.containsKey("preferredActivities")) {
            @SuppressWarnings("unchecked")
            List<String> list = (List<String>) body.get("preferredActivities");
            profile.setPreferredActivities(list != null ? list : List.of());
        }
        if (body.containsKey("resumeLink"))
            profile.setResumeLink(body.get("resumeLink") != null ? body.get("resumeLink").toString().trim() : null);
        if (body.containsKey("githubLink"))
            profile.setGithubLink(body.get("githubLink") != null ? body.get("githubLink").toString().trim() : null);
        if (body.containsKey("skills")) {
            Object raw = body.get("skills");
            if (raw instanceof List<?> list) {
                List<Profile.ProfileSkillEntry> skills = new ArrayList<>();
                for (Object item : list) {
                    if (item instanceof Map<?, ?> map) {
                        String name = map.get("skillName") != null ? map.get("skillName").toString().trim()
                                : map.get("skillId") != null ? map.get("skillId").toString().trim() : null;
                        String prof = map.get("proficiency") != null ? map.get("proficiency").toString().trim() : null;
                        if (name != null && !name.isBlank())
                            skills.add(new Profile.ProfileSkillEntry(name, prof != null && !prof.isBlank() ? prof : null));
                    }
                }
                profile.setSkills(skills);
            }
        }

        profile = profileRepository.save(profile);
        return ResponseEntity.ok(toResponse(profile));
    }

    @PostMapping("/profile/photo")
    public ResponseEntity<?> uploadProfilePhoto(Authentication auth, @RequestParam("file") MultipartFile file) {
        String userId = currentUserId(auth);
        if (userId == null) return ResponseEntity.status(401).build();
        try {
            profilePhotoService.storePhoto(userId, file);
            return ResponseEntity.ok(Map.of("message", "Photo uploaded"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("message", "Upload failed"));
        }
    }

    @GetMapping("/profile/photo")
    public ResponseEntity<Resource> getProfilePhoto(Authentication auth) {
        String userId = currentUserId(auth);
        if (userId == null) return ResponseEntity.status(401).build();
        try {
            Resource resource = profilePhotoService.loadPhoto(userId);
            if (resource == null) return ResponseEntity.notFound().build();
            String contentType = "image/jpeg";
            String filename = resource.getFilename();
            if (filename != null) {
                if (filename.endsWith(".png")) contentType = "image/png";
                else if (filename.endsWith(".gif")) contentType = "image/gif";
                else if (filename.endsWith(".webp")) contentType = "image/webp";
            }
            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + (filename != null ? filename : "photo") + "\"")
                    .body(resource);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/partner/{partnerUserId}/photo")
    public ResponseEntity<Resource> getPartnerPhoto(Authentication auth, @PathVariable String partnerUserId) {
        String userId = currentUserId(auth);
        if (userId == null) return ResponseEntity.status(401).build();
        if (partnerUserId == null || partnerUserId.isBlank())
            return ResponseEntity.badRequest().build();
        if (userId.equals(partnerUserId))
            return ResponseEntity.badRequest().build();
        List<Match> shared = matchRepository.findByUser1IdOrUser2IdOrderByMatchDateDesc(userId, userId).stream()
                .filter(m -> (m.getUser1Id().equals(partnerUserId) || m.getUser2Id().equals(partnerUserId)))
                .toList();
        if (shared.isEmpty())
            return ResponseEntity.status(403).build();
        try {
            Resource resource = profilePhotoService.loadPhoto(partnerUserId);
            if (resource == null) return ResponseEntity.notFound().build();
            String contentType = "image/jpeg";
            String filename = resource.getFilename();
            if (filename != null) {
                if (filename.endsWith(".png")) contentType = "image/png";
                else if (filename.endsWith(".gif")) contentType = "image/gif";
                else if (filename.endsWith(".webp")) contentType = "image/webp";
            }
            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + (filename != null ? filename : "photo") + "\"")
                    .body(resource);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/matches")
    public ResponseEntity<?> getMatches(Authentication auth) {
        String userId = currentUserId(auth);
        if (userId == null) return ResponseEntity.status(401).build();
        List<Match> matches = matchRepository.findByUser1IdOrUser2IdOrderByMatchDateDesc(userId, userId);
        List<Map<String, Object>> response = new ArrayList<>();
        for (Match m : matches) {
            String otherUserId = userId.equals(m.getUser1Id()) ? m.getUser2Id() : m.getUser1Id();
            Map<String, Object> matchedWith = getMatchedWith(otherUserId);
            boolean isUser1 = userId.equals(m.getUser1Id());
            String myVenue = isUser1 ? m.getUser1VenueChoice() : m.getUser2VenueChoice();
            String partnerVenue = isUser1 ? m.getUser2VenueChoice() : m.getUser1VenueChoice();
            response.add(Map.of(
                    "id", m.getId(),
                    "user1Id", m.getUser1Id(),
                    "user2Id", m.getUser2Id(),
                    "matchDate", m.getMatchDate().toString(),
                    "suggestedActivity", m.getSuggestedActivity() != null ? m.getSuggestedActivity() : "",
                    "status", m.getStatus().name(),
                    "matchedWith", matchedWith,
                    "myVenueChoice", myVenue != null ? myVenue : "",
                    "partnerVenueChoice", partnerVenue != null ? partnerVenue : ""
            ));
        }
        return ResponseEntity.ok(response);
    }

    @PutMapping("/matches/{matchId}/venue")
    public ResponseEntity<?> setMatchVenue(Authentication auth, @PathVariable String matchId, @RequestBody Map<String, Object> body) {
        String userId = currentUserId(auth);
        if (userId == null) return ResponseEntity.status(401).build();
        String venueId = body != null && body.get("venueId") != null ? body.get("venueId").toString().trim() : null;
        if (venueId == null || venueId.isBlank())
            return ResponseEntity.badRequest().body(Map.of("message", "venueId is required"));
        Optional<Match> opt = matchRepository.findById(matchId);
        if (opt.isEmpty()) return ResponseEntity.notFound().build();
        Match m = opt.get();
        if (!m.getUser1Id().equals(userId) && !m.getUser2Id().equals(userId))
            return ResponseEntity.status(403).build();
        if (m.getUser1Id().equals(userId))
            m.setUser1VenueChoice(venueId);
        else
            m.setUser2VenueChoice(venueId);
        matchRepository.save(m);
        return ResponseEntity.ok(Map.of("message", "Venue updated", "myVenueChoice", m.getUser1Id().equals(userId) ? m.getUser1VenueChoice() : m.getUser2VenueChoice()));
    }

    private static final List<Map<String, String>> VENUES = List.of(
            Map.of("id", "downtown-badminton", "name", "Downtown Badminton Complex", "address", "123 Sports Ave"),
            Map.of("id", "tech-park-courts", "name", "Tech Park Courts", "address", "456 Innovation Blvd"),
            Map.of("id", "community-center", "name", "Community Center Court", "address", "789 Main St"),
            Map.of("id", "smash-club", "name", "Smash Club", "address", "321 Game Lane")
    );

    @GetMapping("/venues")
    public ResponseEntity<?> getVenues(Authentication auth) {
        if (currentUserId(auth) == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(VENUES);
    }

    @PostMapping("/referrals")
    public ResponseEntity<?> createReferral(Authentication auth, @RequestBody Map<String, Object> body) {
        String userId = currentUserId(auth);
        if (userId == null) return ResponseEntity.status(401).build();
        String name = body.get("referredName") != null ? body.get("referredName").toString().trim() : null;
        String email = body.get("referredEmail") != null ? body.get("referredEmail").toString().trim() : null;
        if (name == null || name.isBlank() || email == null || email.isBlank())
            return ResponseEntity.badRequest().body(Map.of("message", "Name and email are required"));
        Referral referral = new Referral(userId, name, email);
        referral.setReferredPhone(body.get("referredPhone") != null ? body.get("referredPhone").toString().trim() : null);
        referral.setLinkedinProfileLink(body.get("linkedinProfileLink") != null ? body.get("linkedinProfileLink").toString().trim() : null);
        referral.setResumeUrl(body.get("resumeUrl") != null ? body.get("resumeUrl").toString().trim() : null);
        referral.setResumeFileName(body.get("resumeFileName") != null ? body.get("resumeFileName").toString().trim() : null);
        referral = referralRepository.save(referral);
        return ResponseEntity.ok(toReferralResponse(referral));
    }

    @GetMapping("/referrals")
    public ResponseEntity<?> getReferrals(Authentication auth) {
        String userId = currentUserId(auth);
        if (userId == null) return ResponseEntity.status(401).build();
        List<Referral> referrals = referralRepository.findByReferrerUserIdOrderByCreatedAtDesc(userId);
        List<Map<String, Object>> response = referrals.stream().map(MeController::toReferralResponse).toList();
        return ResponseEntity.ok(response);
    }

    private static Map<String, Object> toReferralResponse(Referral r) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", r.getId());
        m.put("referrerUserId", r.getReferrerUserId());
        m.put("referredName", r.getReferredName() != null ? r.getReferredName() : "");
        m.put("referredEmail", r.getReferredEmail() != null ? r.getReferredEmail() : "");
        m.put("referredPhone", r.getReferredPhone() != null ? r.getReferredPhone() : "");
        m.put("linkedinProfileLink", r.getLinkedinProfileLink() != null ? r.getLinkedinProfileLink() : "");
        m.put("resumeUrl", r.getResumeUrl() != null ? r.getResumeUrl() : "");
        m.put("resumeFileName", r.getResumeFileName() != null ? r.getResumeFileName() : "");
        m.put("status", r.getStatus().name());
        m.put("referredUserId", r.getReferredUserId() != null ? r.getReferredUserId() : "");
        m.put("createdAt", r.getCreatedAt().toString());
        return m;
    }

    private Map<String, Object> getMatchedWith(String otherUserId) {
        User other = userRepository.findById(otherUserId).orElse(null);
        Profile otherProfile = profileRepository.findByUserId(otherUserId).orElse(null);
        boolean hasPhoto = otherProfile != null && otherProfile.getProfilePhotoFileId() != null && !otherProfile.getProfilePhotoFileId().isBlank();
        return Map.of(
                "userId", otherUserId != null ? otherUserId : "",
                "displayName", other != null && other.getDisplayName() != null ? other.getDisplayName() : "",
                "bio", otherProfile != null && otherProfile.getBio() != null ? otherProfile.getBio() : "",
                "preferredActivities", otherProfile != null && otherProfile.getPreferredActivities() != null ? otherProfile.getPreferredActivities() : List.<String>of(),
                "hasProfilePhoto", hasPhoto
        );
    }

    private static Map<String, Object> toResponse(Profile p) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", p.getId());
        m.put("userId", p.getUserId());
        m.put("yearsExperience", p.getYearsExperience() != null ? p.getYearsExperience() : 0);
        m.put("currentCompany", p.getCurrentCompany() != null ? p.getCurrentCompany() : "");
        m.put("targetCompanies", p.getTargetCompanies() != null ? p.getTargetCompanies() : List.<String>of());
        m.put("salaryRangeMin", p.getSalaryRangeMin() != null ? p.getSalaryRangeMin() : 0);
        m.put("salaryRangeMax", p.getSalaryRangeMax() != null ? p.getSalaryRangeMax() : 0);
        m.put("bio", p.getBio() != null ? p.getBio() : "");
        m.put("preferredActivities", p.getPreferredActivities() != null ? p.getPreferredActivities() : List.<String>of());
        m.put("hasProfilePhoto", p.getProfilePhotoFileId() != null && !p.getProfilePhotoFileId().isBlank());
        m.put("resumeLink", p.getResumeLink() != null ? p.getResumeLink() : "");
        m.put("githubLink", p.getGithubLink() != null ? p.getGithubLink() : "");
        m.put("skills", p.getSkills() != null ? p.getSkills().stream()
                .map(s -> Map.of("skillId", s.skillId(), "skillName", s.skillId(), "proficiency", s.proficiency() != null ? s.proficiency() : ""))
                .toList() : List.<Map<String, String>>of());
        return m;
    }
}
