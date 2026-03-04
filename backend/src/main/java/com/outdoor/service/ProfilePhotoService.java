package com.outdoor.service;

import com.outdoor.entity.Profile;
import com.outdoor.repository.ProfileRepository;
import com.mongodb.client.gridfs.model.GridFSFile;
import org.bson.types.ObjectId;
import org.springframework.core.io.Resource;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.gridfs.GridFsResource;
import org.springframework.data.mongodb.gridfs.GridFsTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.util.Set;

@Service
public class ProfilePhotoService {

    private static final Set<String> ALLOWED_CONTENT_TYPES = Set.of(
            "image/jpeg", "image/png", "image/gif", "image/webp"
    );
    private static final long MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

    private final GridFsTemplate gridFsTemplate;
    private final ProfileRepository profileRepository;

    public ProfilePhotoService(GridFsTemplate gridFsTemplate, ProfileRepository profileRepository) {
        this.gridFsTemplate = gridFsTemplate;
        this.profileRepository = profileRepository;
    }

    public void storePhoto(String userId, MultipartFile file) throws IOException {
        if (file.isEmpty())
            throw new IllegalArgumentException("File is empty");
        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_CONTENT_TYPES.contains(contentType))
            throw new IllegalArgumentException("Invalid image type. Use JPEG, PNG, GIF or WebP.");
        if (file.getSize() > MAX_SIZE_BYTES)
            throw new IllegalArgumentException("File too large. Max 5 MB.");

        Profile profile = profileRepository.findByUserId(userId)
                .orElseGet(() -> {
                    Profile p = new Profile(userId);
                    return profileRepository.save(p);
                });

        // Delete previous photo from GridFS if any
        if (profile.getProfilePhotoFileId() != null && !profile.getProfilePhotoFileId().isBlank()) {
            try {
                gridFsTemplate.delete(Query.query(Criteria.where("_id").is(new ObjectId(profile.getProfilePhotoFileId()))));
            } catch (Exception ignored) {
                // Old file may already be gone
            }
        }

        String filename = "profile-" + userId;
        try (InputStream in = file.getInputStream()) {
            ObjectId fileId = gridFsTemplate.store(in, filename, contentType, null);
            profile.setProfilePhotoFileId(fileId.toHexString());
            profileRepository.save(profile);
        }
    }

    public Resource loadPhoto(String userId) throws IOException {
        Profile profile = profileRepository.findByUserId(userId).orElse(null);
        if (profile == null || profile.getProfilePhotoFileId() == null || profile.getProfilePhotoFileId().isBlank())
            return null;
        try {
            GridFSFile file = gridFsTemplate.findOne(Query.query(Criteria.where("_id").is(new ObjectId(profile.getProfilePhotoFileId()))));
            if (file == null) return null;
            GridFsResource resource = gridFsTemplate.getResource(file);
            return resource.isReadable() ? resource : null;
        } catch (Exception e) {
            return null;
        }
    }
}
