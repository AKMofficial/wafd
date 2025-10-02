package com.example.wafd.DTO;

import com.example.wafd.Model.Pilgrim;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.Period;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PilgrimDTOOut {
    private String id;
    private String registrationNumber;
    private String nationalId;
    private String passportNumber;
    private String firstName;
    private String lastName;
    private String fullName;
    private Integer age;
    private String gender; // "male" or "female"
    private String nationality;
    private String phoneNumber;
    private String status; // convert from backend status
    private Boolean hasSpecialNeeds;
    private String notes;

    public static PilgrimDTOOut fromEntity(Pilgrim pilgrim) {
        PilgrimDTOOut dto = new PilgrimDTOOut();
        dto.setId(String.valueOf(pilgrim.getId()));
        dto.setRegistrationNumber("REG-" + pilgrim.getId());
        dto.setNationalId(pilgrim.getId() != null ? String.valueOf(pilgrim.getId()) : "");
        dto.setPassportNumber(pilgrim.getPassport_number());

        // Split name from User
        String fullName = pilgrim.getUser() != null ? pilgrim.getUser().getName() : "Unknown";
        dto.setFullName(fullName);
        String[] nameParts = fullName.split(" ", 2);
        dto.setFirstName(nameParts.length > 0 ? nameParts[0] : fullName);
        dto.setLastName(nameParts.length > 1 ? nameParts[1] : "");

        // Calculate age from date of birth
        if (pilgrim.getDate_of_birth() != null) {
            dto.setAge(Period.between(pilgrim.getDate_of_birth(), LocalDate.now()).getYears());
        } else {
            dto.setAge(0);
        }

        // Convert gender M/F to male/female
        dto.setGender("M".equals(pilgrim.getGender()) ? "male" : "female");

        dto.setNationality(pilgrim.getNationality());
        dto.setPhoneNumber(pilgrim.getUser() != null ? pilgrim.getUser().getPhone() : "");

        // Convert status - map "Registered" to "expected"
        String backendStatus = pilgrim.getStatus() != null ? pilgrim.getStatus() : "Registered";
        String frontendStatus = switch (backendStatus.toLowerCase()) {
            case "registered" -> "expected";
            case "arrived" -> "arrived";
            case "departed" -> "departed";
            case "cancelled" -> "no_show";
            default -> "expected";
        };
        dto.setStatus(frontendStatus);

        dto.setHasSpecialNeeds(false);
        dto.setNotes("");

        return dto;
    }
}
