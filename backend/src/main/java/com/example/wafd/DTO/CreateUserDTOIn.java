package com.example.wafd.DTO;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class CreateUserDTOIn {
    @NotEmpty(message = "Name is required")
    @Size(min = 3, max = 55, message = "Name must be between 3 and 55 characters")
    private String name;

    @NotEmpty(message = "Email is required")
    @Email(message = "Email is invalid")
    private String email;

    @NotEmpty(message = "Phone is required")
    @Pattern(regexp = "^\\+[1-9]\\d{1,14}$", message = "Phone number must include country code (e.g., +966501234567)")
    private String phone;

    @NotEmpty(message = "Password is required")
    @Size(min = 8, max = 20, message = "Password must be between 8 and 20 characters")
    @Pattern(regexp = "^(?=.*[!@#$%^&*]).*$", message = "Password must contain at least one special character")
    private String password;

    @NotEmpty(message = "Role is required")
    @Pattern(regexp = "^(Admin|Pilgrim|Supervisor)$", message = "Role must be Admin, Pilgrim or Supervisor")
    private String role;
}