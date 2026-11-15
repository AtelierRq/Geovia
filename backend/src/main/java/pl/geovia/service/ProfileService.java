package pl.geovia.service;

import pl.geovia.dto.CreateProfileRequest;
import pl.geovia.dto.ProfileResponse;
import pl.geovia.dto.UpdateProfileRequest;
import pl.geovia.entity.Profile;
import pl.geovia.repository.ProfileRepository;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.UUID;

@Service
@Transactional
public class ProfileService {

    private final ProfileRepository profileRepository;

    public ProfileService(ProfileRepository profileRepository) {
        this.profileRepository = profileRepository;
    }

    public ProfileResponse createProfile(CreateProfileRequest request) {

        String username = request.username().trim();

        if (profileRepository.existsByUsernameIgnoreCase(username)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Username is already taken"
            );
        }

        Profile profile = new Profile(
                UUID.randomUUID(),
                username,
                request.avatarUrl(),
                request.bio(),
                request.city()
        );

        Profile savedProfile = profileRepository.save(profile);

        return mapToResponse(savedProfile);
    }

    public ProfileResponse ensureProfile(CreateProfileRequest request) {
        String username = request.username().trim();
        Profile existing = profileRepository.findByUsernameIgnoreCase(username).orElse(null);
        if (existing != null) {
            return mapToResponse(existing);
        }

        Profile profile = new Profile(
                UUID.randomUUID(),
                username,
                request.avatarUrl(),
                request.bio(),
                request.city()
        );
        return mapToResponse(profileRepository.save(profile));
    }

    @Transactional(readOnly = true)
    public ProfileResponse getProfile(UUID id) {

        Profile profile = profileRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Profile not found"
                ));

        return mapToResponse(profile);
    }

    public ProfileResponse updateProfile(
            UUID id,
            UpdateProfileRequest request
    ) {

        Profile profile = profileRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Profile not found"
                ));

        String username = request.username().trim();

        boolean usernameTaken =
                profileRepository.findByUsernameIgnoreCase(username)
                        .filter(existing -> !existing.getId().equals(id))
                        .isPresent();

        if (usernameTaken) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Username is already taken"
            );
        }

        profile.setUsername(username);
        profile.setAvatarUrl(request.avatarUrl());
        profile.setBio(request.bio());
        profile.setCity(request.city());

        Profile updatedProfile = profileRepository.save(profile);

        return mapToResponse(updatedProfile);
    }

    private ProfileResponse mapToResponse(Profile profile) {

        return new ProfileResponse(
                profile.getId(),
                profile.getUsername(),
                profile.getAvatarUrl(),
                profile.getBio(),
                profile.getCity(),
                profile.getGuestImportStatus(),
                profile.getCreatedAt(),
                profile.getUpdatedAt()
        );
    }
}