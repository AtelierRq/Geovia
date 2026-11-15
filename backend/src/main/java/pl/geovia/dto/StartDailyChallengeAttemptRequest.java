package pl.geovia.dto;

import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public record StartDailyChallengeAttemptRequest(
        @NotNull UUID profileId
) {}
