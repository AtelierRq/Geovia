package pl.geovia.dto;

import java.util.List;

public record DailyChallengeQuestionResponse(
        int index,
        String country,
        List<String> options
) {}
