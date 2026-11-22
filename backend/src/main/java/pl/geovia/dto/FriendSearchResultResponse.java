package pl.geovia.dto;

import java.util.UUID;

public record FriendSearchResultResponse(UUID profileId, String username, String avatarUrl, String visibility, String relationState) {}
