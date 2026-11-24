package pl.geovia.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

public record CreateGameAttemptRequest(
        @NotNull UUID profileId,
        @NotBlank @Size(max = 64) String categoryId,
        @NotBlank @Size(max = 64) String areaId,
        @NotBlank @Size(max = 64) String modeId,
        @NotNull @Min(0) Integer correctCount,
        @NotNull @Min(1) @Max(10000) Integer totalQuestions,
        @NotNull @Min(0) Long durationMs,
        @NotNull OffsetDateTime startedAt,
        @NotNull OffsetDateTime finishedAt,
        @NotBlank @Pattern(regexp = "^(completed|ended-early|time-expired)$") String status,
        @Size(max = 300) List<@Valid CountryResultRequest> countryResults,
        @NotNull UUID clientAttemptId
) {}
