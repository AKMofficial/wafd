package com.example.wafd.DTO;

import com.example.wafd.Model.Pilgrim;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PilgrimDTOOut {
    private Integer id;
    private String registrationNumber;
    private String nationalId;
    private String passportNumber;
    private String firstName;
    private String lastName;
    private String fullName;
    private Integer age;
    private String gender; // male | female
    private String nationality;
    private String phoneNumber;
    private String status; // expected | arrived | departed | no_show
    private Boolean hasSpecialNeeds;
    private String specialNeedsType;
    private String specialNeedsNotes;
    private String notes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Integer groupId;
    private String groupName;

    public static PilgrimDTOOut fromEntity(Pilgrim pilgrim) {
        PilgrimDTOOut dto = new PilgrimDTOOut();
        dto.setId(pilgrim.getId());
        dto.setRegistrationNumber(pilgrim.getRegistrationNumber());
        dto.setNationalId(pilgrim.getNationalId());
        dto.setPassportNumber(pilgrim.getPassportNumber());
        String firstName = pilgrim.getFirstName() != null ? pilgrim.getFirstName() : "";
        String lastName = pilgrim.getLastName() != null ? pilgrim.getLastName() : "";
        dto.setFirstName(firstName);
        dto.setLastName(lastName);
        dto.setFullName(String.format("%s %s", firstName, lastName).trim());
        Integer pilgrimAge = pilgrim.getAge();
        dto.setAge(pilgrimAge != null ? pilgrimAge : Integer.valueOf(0));
        String gender = pilgrim.getGender();
        if (gender != null) {
            gender = gender.equalsIgnoreCase("female") || gender.equalsIgnoreCase("f") ? "female" : "male";
        } else {
            gender = "male";
        }
        dto.setGender(gender);

        dto.setNationality(pilgrim.getNationality());
        dto.setPhoneNumber(pilgrim.getPhoneNumber() != null ? pilgrim.getPhoneNumber() : "");
        String status = pilgrim.getStatus();
        if (status != null) {
            switch (status.toLowerCase()) {
                case "arrived" -> status = "arrived";
                case "departed" -> status = "departed";
                case "no_show", "no-show", "cancelled" -> status = "no_show";
                default -> status = "expected";
            }
        } else {
            status = "expected";
        }
        dto.setStatus(status);
        dto.setHasSpecialNeeds(Boolean.TRUE.equals(pilgrim.getHasSpecialNeeds()));
        dto.setSpecialNeedsType(pilgrim.getSpecialNeedsType());
        dto.setSpecialNeedsNotes(pilgrim.getSpecialNeedsNotes());
        dto.setNotes(pilgrim.getNotes());
        dto.setCreatedAt(pilgrim.getCreatedAt());
        dto.setUpdatedAt(pilgrim.getUpdatedAt());
        if (pilgrim.getAgency() != null) {
            dto.setGroupId(pilgrim.getAgency().getId());
            dto.setGroupName(pilgrim.getAgency().getName());
        }
        return dto;
    }
}
