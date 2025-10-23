package com.example.wafd.DTO;

import lombok.Data;

@Data
public class CreatePilgrimRequest {
    private String nationalId;
    private String passportNumber;
    private String firstName;
    private String lastName;
    private Integer age;
    private String gender; // "male" or "female"
    private String nationality;
    private String phoneNumber;
    private Boolean hasSpecialNeeds;
    private String specialNeedsType;
    private String notes;
}
