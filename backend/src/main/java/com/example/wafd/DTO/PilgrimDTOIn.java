package com.example.wafd.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PilgrimDTOIn {

    // User fields (optional - will be generated if not provided)
    private String name;
    private String email;
    private String phone;
    private String password;

    // Pilgrim fields from frontend
    private String nationalId;
    private String passportNumber;
    private String firstName;
    private String lastName;
    private Integer age;
    private String gender; // "male" or "female" from frontend
    private String nationality;
    private String phoneNumber;
    private Boolean hasSpecialNeeds;
    private String specialNeedsType;
    private String notes;
}
