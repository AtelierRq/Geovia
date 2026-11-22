package pl.geovia.dto;

import java.time.OffsetDateTime;
import java.util.UUID;

public record ProfileResponse(
        UUID id,
        String username,
        String avatarUrl,
        String bio,
        String city,
        String visibility,
        OffsetDateTime createdAt,
        OffsetDateTime updatedAt
) {
}
