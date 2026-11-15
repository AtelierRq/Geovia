package pl.geovia.dto;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

public record QuizAttemptResponse(
        UUID id,
        String categoryId,
        String areaId,
        String modeId,
        int correctCount,
        int totalQuestions,
        BigDecimal scorePercent,
        long durationMs,
        String status,
        OffsetDateTime startedAt,
        OffsetDateTime finishedAt,
        List<CountryResultRequest> countryResults
) {}
