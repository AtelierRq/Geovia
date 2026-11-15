package pl.geovia.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Min;

public record CheckDailyChallengeAnswerRequest(
        @Min(0) int questionIndex,
        @NotBlank String answer
) {}
