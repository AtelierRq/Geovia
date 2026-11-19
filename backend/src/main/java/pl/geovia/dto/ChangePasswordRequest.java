package pl.geovia.dto;
import jakarta.validation.constraints.*;
public record ChangePasswordRequest(@NotBlank @Size(max=128) String currentPassword, @NotBlank @Size(min=10,max=128) String newPassword) {}
