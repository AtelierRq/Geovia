package pl.geovia.dto;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

public record PublicProfileActivityResponse(
        long totalAttempts,
        long attemptsLast30Days,
        long totalCorrectAnswers,
        BigDecimal averageScorePercent,
        OffsetDateTime lastAttemptAt,
        String lastCategoryId,
        BigDecimal lastScorePercent
) {}
