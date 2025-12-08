package com.example.wafd.DTO;

import com.example.wafd.Model.Bed;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class BedDTOOut {
    private String id;
    private String number;
    private String hallId;
    private String hallCode;
    private String status; // "available", "occupied", "maintenance", "reserved"
    private String pilgrimId;
    private String pilgrimName;
    private Boolean isSpecialNeeds;
    private Boolean isDoubleBed;
    private String companionBedId;
    private LocalDateTime lastAssignedAt;
    private LocalDateTime lastVacatedAt;
    private String maintenanceNotes;

    public static BedDTOOut fromEntity(Bed bed) {
        BedDTOOut dto = new BedDTOOut();
        dto.setId(String.valueOf(bed.getId()));

        // Generate bed number from tent and bed id
        if (bed.getTent() != null) {
            dto.setHallId(String.valueOf(bed.getTent().getId()));

            // Use the actual code field from tent
            String hallCode = bed.getTent().getCode() != null
                ? bed.getTent().getCode()
                : "H" + bed.getTent().getId();

            dto.setHallCode(hallCode);
            dto.setNumber(hallCode + "-" + bed.getId());
        } else {
            dto.setHallId("");
            dto.setHallCode("");
            dto.setNumber("BED-" + bed.getId());
        }

        // Convert backend status to frontend status
        String backendStatus = bed.getStatus() != null ? bed.getStatus() : "Available";
        String frontendStatus = switch (backendStatus) {
            case "Available" -> "vacant";
            case "Booked" -> "occupied";
            case "Reserved" -> "reserved";
            case "Maintenance" -> "maintenance";
            case "Checked_in" -> "occupied";
            case "Checked_out" -> "vacant";
            default -> "vacant";
        };
        dto.setStatus(frontendStatus);

        // Get pilgrim ID and name from booking if available
        if (bed.getBooking() != null && bed.getBooking().getPilgrim() != null) {
            dto.setPilgrimId(String.valueOf(bed.getBooking().getPilgrim().getId()));
            String firstName = bed.getBooking().getPilgrim().getFirstName() != null ? bed.getBooking().getPilgrim().getFirstName() : "";
            String lastName = bed.getBooking().getPilgrim().getLastName() != null ? bed.getBooking().getPilgrim().getLastName() : "";
            dto.setPilgrimName(String.format("%s %s", firstName, lastName).trim());
        } else {
            dto.setPilgrimName("None");
        }

        // Default values for fields not in backend
        dto.setIsSpecialNeeds(false);
        dto.setIsDoubleBed(false);
        dto.setCompanionBedId(null);
        dto.setLastAssignedAt(bed.getCreated_at());
        dto.setLastVacatedAt(null);
        dto.setMaintenanceNotes("");

        return dto;
    }

    public String getStatus() {
        return status;
    }

    public Boolean getIsSpecialNeeds() {
        return isSpecialNeeds;
    }
}
