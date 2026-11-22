package pl.geovia.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record FriendRequestCreateRequest(@NotBlank @Size(min = 2, max = 30) String username) {}
