package pl.geovia.dto;

import java.util.List;

public record DailyChallengeHistoryResponse(
        List<GameAttemptResponse> attempts,
        GameAttemptResponse bestAttempt
) {}
