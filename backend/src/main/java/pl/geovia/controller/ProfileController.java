package pl.geovia.controller;

import jakarta.validation.Valid;
import pl.geovia.dto.*;
import pl.geovia.service.GameAttemptService;
import pl.geovia.service.ProfileService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
import pl.geovia.repository.ProfileRepository;
import pl.geovia.entity.Profile;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.MediaType;
import org.springframework.http.CacheControl;
import org.springframework.http.ResponseEntity;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/profiles")
public class ProfileController {
    private final ProfileService profileService;
    private final GameAttemptService gameAttemptService;
    private final ProfileRepository profileRepository;

    public ProfileController(ProfileService profileService, GameAttemptService gameAttemptService, ProfileRepository profileRepository) {
        this.profileService = profileService;
        this.gameAttemptService = gameAttemptService;
        this.profileRepository = profileRepository;
    }

    @GetMapping("/{id}")
    public ProfileResponse getProfile(@PathVariable UUID id, @RequestAttribute("accountId") UUID accountId) {
        requireOwner(id, accountId);
        return profileService.getProfile(id);
    }

    @PutMapping("/{id}")
    public ProfileResponse updateProfile(
            @PathVariable UUID id,
            @RequestAttribute("accountId") UUID accountId,
            @Valid @RequestBody UpdateProfileRequest request
    ) {
        requireOwner(id, accountId);
        return profileService.updateProfile(id, request);
    }

    @PutMapping(path = "/{id}/avatar", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ProfileResponse uploadAvatar(@PathVariable UUID id, @RequestAttribute("accountId") UUID accountId,
                                        @RequestPart("file") MultipartFile file) {
        requireOwner(id, accountId);
        return profileService.uploadAvatar(id, file);
    }

    @DeleteMapping("/{id}/avatar")
    public ProfileResponse deleteAvatar(@PathVariable UUID id, @RequestAttribute("accountId") UUID accountId) {
        requireOwner(id, accountId);
        return profileService.deleteAvatar(id);
    }

    @GetMapping("/{id}/avatar")
    public ResponseEntity<byte[]> getAvatar(@PathVariable UUID id, @RequestAttribute("accountId") UUID accountId) {
        requireOwner(id, accountId);
        var avatar = profileService.getAvatar(id);
        return ResponseEntity.ok().contentType(MediaType.parseMediaType(avatar.contentType()))
                .cacheControl(CacheControl.noCache()).body(avatar.bytes());
    }

    @GetMapping("/{id}/attempts")
    public List<QuizAttemptResponse> getAttempts(@PathVariable UUID id, @RequestAttribute("accountId") UUID accountId) {
        requireOwner(id, accountId);
        return gameAttemptService.getHistory(id);
    }

    @GetMapping("/{id}/stats")
    public ProfileStatsResponse getStats(@PathVariable UUID id, @RequestAttribute("accountId") UUID accountId) {
        requireOwner(id, accountId);
        return gameAttemptService.getStats(id);
    }

    @GetMapping("/{id}/country-knowledge")
    public CountryKnowledgeResponse getCountryKnowledge(@PathVariable UUID id, @RequestAttribute("accountId") UUID accountId) {
        requireOwner(id, accountId);
        return gameAttemptService.getCountryKnowledge(id);
    }

    private void requireOwner(UUID profileId, UUID accountId) {
        if (!profileRepository.existsById(profileId)) throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Profile not found");
        if (!profileRepository.existsByIdAndAccount_Id(profileId, accountId)) throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Profile does not belong to this account");
    }
}
