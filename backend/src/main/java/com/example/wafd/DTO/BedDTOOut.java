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

            // Extract hall code from location
            String location = bed.getTent().getLocation();
            if (location != null && location.contains(" - ")) {
                String[] parts = location.split(" - ", 2);
                dto.setHallCode(parts[1]);
                dto.setNumber(parts[1] + "-" + bed.getId());
            } else {
                dto.setHallCode("T" + bed.getTent().getId());
                dto.setNumber("T" + bed.getTent().getId() + "-" + bed.getId());
            }
        } else {
            dto.setHallId("");
            dto.setHallCode("");
            dto.setNumber("BED-" + bed.getId());
        }

        // Convert backend status to frontend status
        String backendStatus = bed.getStatus() != null ? bed.getStatus() : "Available";
        String frontendStatus = switch (backendStatus) {
            case "Available" -> "available";
            case "Booked" -> "reserved";
            case "Checked_in" -> "occupied";
            case "Checked_out" -> "available";
            default -> "available";
        };
        dto.setStatus(frontendStatus);

        // Get pilgrim ID from booking if available
        if (bed.getBooking() != null && bed.getBooking().getPilgrim() != null) {
            dto.setPilgrimId(String.valueOf(bed.getBooking().getPilgrim().getId()));
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
