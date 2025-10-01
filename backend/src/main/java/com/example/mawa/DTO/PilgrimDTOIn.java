package com.example.mawa.DTO;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDate;

@Data
@AllArgsConstructor
public class PilgrimDTOIn {
    
    // User fields
    @NotEmpty(message = "Name is required")
    @Size(min = 3, max = 55, message = "Name must be between 3 and 55 characters")
    private String name;

    @NotEmpty(message = "Email is required")
    @Email(message = "Email is invalid")
    @Size(min = 3, max = 255, message = "Email must be between 3 and 255 characters")
    private String email;

    @NotEmpty(message = "Phone is required")
    @Pattern(regexp = "^\\+[1-9]\\d{1,14}$", message = "Phone number must include country code (e.g., +1234567890)")
    private String phone;

    @NotEmpty(message = "Password is required")
    @Size(min = 8, max = 20, message = "Password must be between 8 and 20 characters")
    @Pattern(regexp = "^(?=.*[!@#$%^&*]).*$", message = "Password must contain at least one special character")
    private String password;

    // Pilgrim fields
    @NotEmpty(message = "Passport number is required")
    @Pattern(regexp = "^\\d{8}$", message = "Passport number must be 8 digits")
    private String passportNumber;

    @NotEmpty(message = "Nationality is required")
    @Pattern(regexp = "^[A-Za-z]{2}$", message = "Nationality must be 2 characters")
    private String nationality;

    @NotNull(message = "Date of birth is required")
    @Past(message = "Date of birth must be in the past")
    private LocalDate dateOfBirth;

    @NotEmpty(message = "Gender is required")
    @Pattern(regexp = "^([MF])$", message = "Gender must be M or F")
    private String gender;
}