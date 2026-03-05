package com.outdoor.service;

import com.outdoor.entity.InviteRequest;
import com.outdoor.entity.Profile;
import com.outdoor.entity.User;
import com.outdoor.repository.ProfileRepository;
import com.outdoor.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.util.Base64;

@Service
public class AuthService {

    private static final int INVITE_CODE_LENGTH = 10;
    private static final SecureRandom RANDOM = new SecureRandom();

    private final UserRepository userRepository;
    private final ProfileRepository profileRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final InviteRequestService inviteRequestService;

    @Value("${bootstrap.invite-code:OUTDOOR_FIRST}")
    private String bootstrapInviteCode;

    public AuthService(UserRepository userRepository,
                       ProfileRepository profileRepository,
                       PasswordEncoder passwordEncoder,
                       JwtService jwtService,
                       InviteRequestService inviteRequestService) {
        this.userRepository = userRepository;
        this.profileRepository = profileRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.inviteRequestService = inviteRequestService;
    }

    /**
     * Register a new user. Accepts either a join token (admin-approved invite), the bootstrap invite code,
     * or an existing user's invite code.
     */
    public AuthResult register(String inviteCode, String joinToken, String email, String password, String displayName) {
        if (userRepository.existsByEmail(email)) {
            throw new AuthException("Email already registered");
        }

        String referredByUserId = null;

        if (joinToken != null && !joinToken.isBlank()) {
            InviteRequest req = inviteRequestService.validateJoinToken(joinToken.trim(), email)
                    .orElseThrow(() -> new AuthException("Invalid or expired join link. Use the link shared with you and the same email."));
            referredByUserId = req.getReferrerUserId();
            inviteRequestService.markTokenUsed(joinToken.trim());
        } else {
            String code = inviteCode != null ? inviteCode.trim() : "";
            if (code.isBlank()) {
                throw new AuthException("Invite code or join link required");
            }
            boolean isBootstrap = bootstrapInviteCode.equalsIgnoreCase(code) && userRepository.count() == 0;
            if (!isBootstrap) {
                User referrer = userRepository.findByInviteCode(code)
                        .orElseThrow(() -> new AuthException("Invalid or expired invite code"));
                referredByUserId = referrer.getId();
            }
        }

        String newInviteCode = generateUniqueInviteCode();
        User user = new User(email, passwordEncoder.encode(password), newInviteCode);
        user.setDisplayName(displayName != null && !displayName.isBlank() ? displayName.trim() : null);
        user.setReferredByUserId(referredByUserId);
        user = userRepository.save(user);

        Profile profile = new Profile(user.getId());
        profileRepository.save(profile);

        String token = jwtService.createToken(user.getId());
        return new AuthResult(token, user.getId(), user.getEmail(), user.getDisplayName(), user.getInviteCode());
    }

    public AuthResult login(String email, String password) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AuthException("Invalid email or password"));
        if (!passwordEncoder.matches(password, user.getPasswordHash())) {
            throw new AuthException("Invalid email or password");
        }
        String token = jwtService.createToken(user.getId());
        return new AuthResult(token, user.getId(), user.getEmail(), user.getDisplayName(), user.getInviteCode());
    }

    private String generateUniqueInviteCode() {
        String code;
        do {
            code = randomInviteCode();
        } while (userRepository.existsByInviteCode(code));
        return code;
    }

    private static String randomInviteCode() {
        byte[] bytes = new byte[INVITE_CODE_LENGTH];
        RANDOM.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes).substring(0, INVITE_CODE_LENGTH).toUpperCase();
    }

    public static final class AuthResult {
        private final String token;
        private final String userId;
        private final String email;
        private final String displayName;
        private final String inviteCode;

        public AuthResult(String token, String userId, String email, String displayName, String inviteCode) {
            this.token = token;
            this.userId = userId;
            this.email = email;
            this.displayName = displayName;
            this.inviteCode = inviteCode;
        }

        public String getToken() { return token; }
        public String getUserId() { return userId; }
        public String getEmail() { return email; }
        public String getDisplayName() { return displayName; }
        public String getInviteCode() { return inviteCode; }
    }

    public static class AuthException extends RuntimeException {
        public AuthException(String message) {
            super(message);
        }
    }
}
