package pl.geovia.dto;
import jakarta.validation.constraints.*;
public record RegisterRequest(
    @NotBlank @Email @Size(max=254) String email,
    @NotBlank @Size(min=10,max=128) String password,
    @NotBlank @Size(min=2,max=30) String username
) {}
