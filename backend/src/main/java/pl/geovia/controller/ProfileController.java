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
