package pl.geovia.dto;

import pl.geovia.entity.enums.AttemptStatus;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

public record GameAttemptResponse(
        UUID id,
        UUID challengeId,
        int correctCount,
        int totalQuestions,
        BigDecimal scorePercent,
        long durationMs,
        AttemptStatus status,
        OffsetDateTime startedAt,
        OffsetDateTime finishedAt
) {}
