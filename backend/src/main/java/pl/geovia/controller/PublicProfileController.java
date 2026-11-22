package pl.geovia.controller;

import org.springframework.http.CacheControl;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pl.geovia.dto.PublicProfileResponse;
import pl.geovia.service.ProfileService;
import pl.geovia.service.GameAttemptService;
import pl.geovia.repository.ProfileRepository;
import pl.geovia.dto.PublicProfileActivityResponse;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/public/profiles")
public class PublicProfileController {
    private final ProfileService profiles;
    private final GameAttemptService attempts;
    private final ProfileRepository profileRepository;
    public PublicProfileController(ProfileService profiles, GameAttemptService attempts, ProfileRepository profileRepository) {
        this.profiles = profiles; this.attempts = attempts; this.profileRepository = profileRepository;
    }

    @GetMapping("/{username}")
    public PublicProfileResponse getPublicProfile(@PathVariable String username) {
        return profiles.getPublicProfile(username);
    }

    @GetMapping("/{username}/activity")
    public PublicProfileActivityResponse getPublicActivity(@PathVariable String username) {
        var profile = profileRepository.findByUsernameIgnoreCase(username)
                .filter(item -> "public".equals(item.getVisibility()))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Public profile not found"));
        return attempts.getPublicActivity(profile.getId());
    }

    @GetMapping("/{username}/avatar")
    public ResponseEntity<byte[]> getPublicAvatar(@PathVariable String username) {
        var avatar = profiles.getPublicAvatar(username);
        return ResponseEntity.ok().contentType(MediaType.parseMediaType(avatar.contentType()))
                .cacheControl(CacheControl.noCache()).body(avatar.bytes());
    }
}
