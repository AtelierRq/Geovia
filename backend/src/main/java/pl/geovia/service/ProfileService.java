package pl.geovia.service;

import pl.geovia.dto.CreateProfileRequest;
import pl.geovia.dto.ProfileResponse;
import pl.geovia.dto.UpdateProfileRequest;
import pl.geovia.dto.PublicProfileResponse;
import pl.geovia.entity.Profile;
import pl.geovia.repository.ProfileRepository;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.UUID;
import org.springframework.web.multipart.MultipartFile;

@Service
@Transactional
public class ProfileService {

    private final ProfileRepository profileRepository;
    private final AvatarStorageService avatarStorage;

    public ProfileService(ProfileRepository profileRepository, AvatarStorageService avatarStorage) {
        this.profileRepository = profileRepository;
        this.avatarStorage = avatarStorage;
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
        profile.setBio(request.bio());
        profile.setCity(request.city());
        profile.setVisibility(request.visibility());

        Profile updatedProfile = profileRepository.save(profile);

        return mapToResponse(updatedProfile);
    }

    public ProfileResponse uploadAvatar(UUID id, MultipartFile file) {
        Profile profile = profileRepository.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Profile not found"));
        String previous = profile.getAvatarUrl();
        String key = avatarStorage.store(id, file);
        profile.setAvatarUrl(key);
        Profile updated = profileRepository.saveAndFlush(profile);
        avatarStorage.delete(id, previous);
        return mapToResponse(updated);
    }

    public ProfileResponse deleteAvatar(UUID id) {
        Profile profile = profileRepository.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Profile not found"));
        String previous = profile.getAvatarUrl();
        profile.setAvatarUrl(null);
        Profile updated = profileRepository.saveAndFlush(profile);
        avatarStorage.delete(id, previous);
        return mapToResponse(updated);
    }

    @Transactional(readOnly = true)
    public AvatarStorageService.AvatarImage getAvatar(UUID id) {
        Profile profile = profileRepository.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Profile not found"));
        return getAvatar(profile);
    }

    @Transactional(readOnly = true)
    public PublicProfileResponse getPublicProfile(String username) {
        Profile profile = profileRepository.findByUsernameIgnoreCase(username)
                .filter(item -> "public".equals(item.getVisibility()))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Public profile not found"));
        String avatar = profile.getAvatarUrl() == null ? null : profile.getAvatarUrl().startsWith("data:image/")
                ? profile.getAvatarUrl() : "/api/public/profiles/" + java.net.URLEncoder.encode(profile.getUsername(), java.nio.charset.StandardCharsets.UTF_8).replace("+", "%20") + "/avatar";
        return new PublicProfileResponse(profile.getUsername(), avatar, profile.getBio(), profile.getCity());
    }

    @Transactional(readOnly = true)
    public AvatarStorageService.AvatarImage getPublicAvatar(String username) {
        Profile profile = profileRepository.findByUsernameIgnoreCase(username)
                .filter(item -> "public".equals(item.getVisibility()))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Public profile not found"));
        return getAvatar(profile);
    }

    private AvatarStorageService.AvatarImage getAvatar(Profile profile) {
        String key = profile.getAvatarUrl();
        if (key == null) throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Profile avatar not found");
        if (key.startsWith("data:image/")) {
            try {
                String[] parts = key.split(",", 2);
                String contentType = parts[0].substring(5, parts[0].indexOf(';'));
                return new AvatarStorageService.AvatarImage(java.util.Base64.getDecoder().decode(parts[1]), contentType);
            } catch (RuntimeException exception) {
                throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Profile avatar not found");
            }
        }
        return avatarStorage.load(profile.getId(), key);
    }

    private ProfileResponse mapToResponse(Profile profile) {

        return new ProfileResponse(
                profile.getId(),
                profile.getUsername(),
                toAvatarUrl(profile),
                profile.getBio(),
                profile.getCity(),
                profile.getVisibility(),
                profile.getGuestImportStatus(),
                profile.getCreatedAt(),
                profile.getUpdatedAt()
        );
    }

    public static String toAvatarUrl(Profile profile) {
        if (profile.getAvatarUrl() == null) return null;
        if (profile.getAvatarUrl().startsWith("data:image/")) return profile.getAvatarUrl();
        return "/api/profiles/" + profile.getId() + "/avatar";
    }
}
