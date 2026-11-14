package pl.geovia.controller;

import pl.geovia.dto.CreateProfileRequest;
import pl.geovia.dto.ProfileResponse;
import pl.geovia.dto.UpdateProfileRequest;
import pl.geovia.service.ProfileService;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/profiles")
public class ProfileController {

    private final ProfileService profileService;

    public ProfileController(ProfileService profileService) {
        this.profileService = profileService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ProfileResponse createProfile(
            @Valid @RequestBody CreateProfileRequest request
    ) {
        return profileService.createProfile(request);
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
}