package pl.geovia.dto;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

public record ProfileStatsResponse(
        long totalAttempts,
        long attemptsLast30Days,
        long totalCorrectAnswers,
        BigDecimal averageScorePercent,
        OffsetDateTime lastAttemptAt
) {}
