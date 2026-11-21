package pl.geovia.dto;
import java.time.OffsetDateTime;
import java.util.UUID;
public record AccountResponse(UUID id, String email, boolean emailVerified, UUID profileId, String username, String avatarUrl, String bio, String city, String visibility) {}
