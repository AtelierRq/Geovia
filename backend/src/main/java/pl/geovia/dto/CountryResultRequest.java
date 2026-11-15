package pl.geovia.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record CountryResultRequest(
        @NotBlank
        @Pattern(regexp = "^[a-z0-9]+(-[a-z0-9]+)*$")
        String countryId,
        @NotBlank
        @Pattern(regexp = "^(correct|incorrect|skipped)$")
        String outcome
) {}
