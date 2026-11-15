package pl.geovia.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.List;

public record FinishDailyChallengeAttemptRequest(
        @NotNull @Size(min = 5, max = 5) List<String> answers,
        @Min(0) @Max(7500) long pausedDurationMs
) {}
