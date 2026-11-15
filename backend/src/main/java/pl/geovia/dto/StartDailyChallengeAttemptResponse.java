package pl.geovia.dto;

import java.time.OffsetDateTime;
import java.util.UUID;

public record StartDailyChallengeAttemptResponse(
        UUID attemptSessionId,
        OffsetDateTime startedAt,
        int timeLimitSeconds
) {}
