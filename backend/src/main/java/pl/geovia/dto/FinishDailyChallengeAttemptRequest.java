package pl.geovia.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.util.List;

public record FinishDailyChallengeAttemptRequest(
        @NotNull @Size(min = 5, max = 5) List<String> answers
) {}
