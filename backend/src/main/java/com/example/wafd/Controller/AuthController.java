package com.example.wafd.Controller;

import com.example.wafd.DTO.LoginRequest;
import com.example.wafd.DTO.LoginResponse;
import com.example.wafd.Model.User;
import com.example.wafd.Service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/auth")
@CrossOrigin(origins = "http://localhost:3000")
public class AuthController {

    @Autowired
    private UserService userService;

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest loginRequest) {
        try {
            List<User> users = userService.findAllUsers();

            // Find user by email
            User user = users.stream()
                    .filter(u -> u.getEmail().equals(loginRequest.getEmail()))
                    .findFirst()
                    .orElse(null);

            if (user == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(new LoginResponse("Invalid credentials", null, null, false));
            }

            // Check password (in production, use proper password hashing)
            if (user.getPassword().equals(loginRequest.getPassword())) {
                return ResponseEntity.ok(new LoginResponse(
                        "Login successful",
                        user.getEmail(),
                        user.getName(),
                        true
                ));
            } else {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(new LoginResponse("Invalid credentials", null, null, false));
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new LoginResponse("An error occurred", null, null, false));
        }
    }
}
