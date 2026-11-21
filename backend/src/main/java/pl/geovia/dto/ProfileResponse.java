package pl.geovia.dto;

import pl.geovia.entity.enums.GuestImportStatus;

import java.time.OffsetDateTime;
import java.util.UUID;

public record ProfileResponse(
        UUID id,
        String username,
        String avatarUrl,
        String bio,
        String city,
        String visibility,
        GuestImportStatus guestImportStatus,
        OffsetDateTime createdAt,
        OffsetDateTime updatedAt
) {
}
