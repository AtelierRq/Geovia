package pl.geovia.dto;

import java.time.OffsetDateTime;
import java.util.UUID;

public record FriendProfileResponse(UUID profileId, String username, String avatarUrl, String visibility, String bio, String city, OffsetDateTime requestedAt) {}
