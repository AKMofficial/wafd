package com.example.wafd.Service;

import com.example.wafd.Api.ApiException;
import com.example.wafd.DTO.AuthenticationResponse;
import com.example.wafd.DTO.LoginDTOIn;
import com.example.wafd.DTO.RefreshTokenDTOIn;
import com.example.wafd.Model.User;
import com.example.wafd.Repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthenticationService {

    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    public AuthenticationResponse authenticate(LoginDTOIn loginDTOIn) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginDTOIn.getEmail(),
                        loginDTOIn.getPassword()
                )
        );

        User user = userRepository.findUserByEmail(loginDTOIn.getEmail());
        if (user == null) {
            throw new ApiException("User not found");
        }

        String accessToken = jwtService.generateToken(user);
        String refreshToken = jwtService.generateRefreshToken(user);

        Integer agencyId = null;
        if (user.getManagedAgency() != null) {
            agencyId = user.getManagedAgency().getId();
        }

        return new AuthenticationResponse(
                accessToken,
                refreshToken,
                "Bearer",
                3600000L,
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getPhone(),
                user.getRole(),
                agencyId
        );
    }

    public AuthenticationResponse refreshToken(RefreshTokenDTOIn refreshTokenDTOIn) {
        String userEmail = jwtService.extractUsername(refreshTokenDTOIn.getRefreshToken());
        User user = userRepository.findUserByEmail(userEmail);
        if (user == null) {
            throw new ApiException("User not found");
        }

        if (!jwtService.isTokenValid(refreshTokenDTOIn.getRefreshToken(), user)) {
            throw new ApiException("Invalid refresh token");
        }

        String accessToken = jwtService.generateToken(user);

        Integer agencyId = null;
        if (user.getManagedAgency() != null) {
            agencyId = user.getManagedAgency().getId();
        }

        return new AuthenticationResponse(
                accessToken,
                refreshTokenDTOIn.getRefreshToken(),
                "Bearer",
                3600000L,
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getPhone(),
                user.getRole(),
                agencyId
        );
    }

    public void logout(String token) {
        // Add token to blacklist (implement token blacklist with Redis or DB)
        // For now, just invalidate on frontend
    }

    public User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        User user = userRepository.findUserByEmail(email);
        if (user == null) {
            throw new ApiException("User not found");
        }
        return user;
    }
}