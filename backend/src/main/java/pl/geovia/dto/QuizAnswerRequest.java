package pl.geovia.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record QuizAnswerRequest(
        @NotBlank @Pattern(regexp = "^[a-z0-9]+(-[a-z0-9]+)*$") String countryId,
        @NotBlank @Size(max = 120) String answer
) {}
