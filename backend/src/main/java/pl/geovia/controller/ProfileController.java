package pl.geovia.controller;

import jakarta.validation.Valid;
import pl.geovia.dto.*;
import pl.geovia.service.GameAttemptService;
import pl.geovia.service.ProfileService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/profiles")
public class ProfileController {
    private final ProfileService profileService;
    private final GameAttemptService gameAttemptService;

    public ProfileController(ProfileService profileService, GameAttemptService gameAttemptService) {
        this.profileService = profileService;
        this.gameAttemptService = gameAttemptService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ProfileResponse createProfile(@Valid @RequestBody CreateProfileRequest request) {
        return profileService.createProfile(request);
    }

    @PostMapping("/ensure")
    public ProfileResponse ensureProfile(@Valid @RequestBody CreateProfileRequest request) {
        return profileService.ensureProfile(request);
    }

    @GetMapping("/{id}")
    public ProfileResponse getProfile(@PathVariable UUID id) {
        return profileService.getProfile(id);
    }

    @PutMapping("/{id}")
    public ProfileResponse updateProfile(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateProfileRequest request
    ) {
        return profileService.updateProfile(id, request);
    }

    @GetMapping("/{id}/attempts")
    public List<QuizAttemptResponse> getAttempts(@PathVariable UUID id) {
        return gameAttemptService.getHistory(id);
    }

    @GetMapping("/{id}/stats")
    public ProfileStatsResponse getStats(@PathVariable UUID id) {
        return gameAttemptService.getStats(id);
    }

    @GetMapping("/{id}/country-knowledge")
    public CountryKnowledgeResponse getCountryKnowledge(@PathVariable UUID id) {
        return gameAttemptService.getCountryKnowledge(id);
    }
}
