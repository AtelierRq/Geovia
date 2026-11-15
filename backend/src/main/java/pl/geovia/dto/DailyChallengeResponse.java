package pl.geovia.dto;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public record DailyChallengeResponse(
        UUID id,
        LocalDate challengeDate,
        String title,
        int questionCount,
        int timeLimitSeconds,
        List<DailyChallengeQuestionResponse> questions
) {}
