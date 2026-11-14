package pl.geovia.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UpdateProfileRequest(

        @NotBlank(message = "Username cannot be empty")
        @Size(max = 50, message = "Username cannot exceed 50 characters")
        String username,

        String avatarUrl,

        String bio,

        @Size(max = 100, message = "City cannot exceed 100 characters")
        String city
) {
}