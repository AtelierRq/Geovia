package pl.geovia.dto;
import jakarta.validation.constraints.*;
public record ChangeEmailRequest(@NotBlank @Email @Size(max=254) String email) {}
