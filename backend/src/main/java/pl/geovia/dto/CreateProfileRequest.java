package pl.geovia.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateProfileRequest(

        @NotBlank(message = "Username cannot be empty")
        @Size(max = 30, message = "Username cannot exceed 30 characters")
        String username,

        @Size(max = 3000000, message = "Avatar data cannot exceed 3 MB")
        String avatarUrl,

        @Size(max = 300, message = "Bio cannot exceed 300 characters")
        String bio,

        @Size(max = 80, message = "City cannot exceed 80 characters")
        String city
) {
}