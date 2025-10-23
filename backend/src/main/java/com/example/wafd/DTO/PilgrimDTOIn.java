package com.example.wafd.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PilgrimDTOIn {

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
    private String specialNeedsNotes;
    private String notes;
    private String status; // optional override
    private Integer groupId;
}
