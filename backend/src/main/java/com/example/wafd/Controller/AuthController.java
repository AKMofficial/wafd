package com.example.wafd.Controller;

import com.example.wafd.Api.ApiResponse;
import com.example.wafd.DTO.LoginDTOIn;
import com.example.wafd.DTO.RefreshTokenDTOIn;
import com.example.wafd.Service.AuthenticationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final AuthenticationService authenticationService;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody @Valid LoginDTOIn loginDTOIn) {
        return ResponseEntity.ok(authenticationService.authenticate(loginDTOIn));
    }

    @PostMapping("/refresh")
    public ResponseEntity<?> refresh(@RequestBody @Valid RefreshTokenDTOIn refreshTokenDTOIn) {
        return ResponseEntity.ok(authenticationService.refreshToken(refreshTokenDTOIn));
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(@RequestHeader("Authorization") String authHeader) {
        authenticationService.logout(authHeader.substring(7));
        return ResponseEntity.ok(new ApiResponse("Logged out successfully"));
    }

    @GetMapping("/get/me")
    public ResponseEntity<?> getCurrentUser() {
        return ResponseEntity.ok(authenticationService.getCurrentUser());
    }
}