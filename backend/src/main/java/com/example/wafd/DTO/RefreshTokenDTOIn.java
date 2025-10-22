package com.example.wafd.DTO;

import jakarta.validation.constraints.NotEmpty;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class RefreshTokenDTOIn {
    @NotEmpty(message = "Refresh token is required")
    private String refreshToken;
}