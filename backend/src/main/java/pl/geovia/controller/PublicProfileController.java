package pl.geovia.controller;

import org.springframework.http.CacheControl;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pl.geovia.dto.PublicProfileResponse;
import pl.geovia.service.ProfileService;

@RestController
@RequestMapping("/api/public/profiles")
public class PublicProfileController {
    private final ProfileService profiles;
    public PublicProfileController(ProfileService profiles) { this.profiles = profiles; }

    @GetMapping("/{username}")
    public PublicProfileResponse getPublicProfile(@PathVariable String username) {
        return profiles.getPublicProfile(username);
    }

    @GetMapping("/{username}/avatar")
    public ResponseEntity<byte[]> getPublicAvatar(@PathVariable String username) {
        var avatar = profiles.getPublicAvatar(username);
        return ResponseEntity.ok().contentType(MediaType.parseMediaType(avatar.contentType()))
                .cacheControl(CacheControl.noCache()).body(avatar.bytes());
    }
}
