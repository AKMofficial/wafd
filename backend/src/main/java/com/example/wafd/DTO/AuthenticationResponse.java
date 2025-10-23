package com.example.wafd.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class AuthenticationResponse {
    private String accessToken;
    private String refreshToken;
    private String tokenType;
    private long expiresIn;
    private Integer userId;
    private String userName;
    private String userEmail;
    private String userPhone;
    private String userRole;
    private Integer agencyId;
}