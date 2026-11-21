package pl.geovia.dto;
import java.time.OffsetDateTime;
import java.util.UUID;
public record AccountSessionResponse(UUID id, OffsetDateTime createdAt, OffsetDateTime expiresAt, String userAgent, boolean current) {}
