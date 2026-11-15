package pl.geovia.dto;

public record CheckDailyChallengeAnswerResponse(
        boolean correct,
        String correctAnswer
) {}
