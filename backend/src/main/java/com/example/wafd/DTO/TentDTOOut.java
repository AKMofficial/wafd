package com.example.wafd.DTO;

import com.example.wafd.Model.Tent;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class TentDTOOut {
    private String id;
    private String name;
    private String code;
    private String type;
    private Integer capacity;
    private Integer currentOccupancy;
    private Integer availableBeds;
    private Integer specialNeedsOccupancy;
    private List<BedDTOOut> beds;
    private String numberingFormat;
    private BedNumberingConfig numberingConfig;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String location;
    private String description;

    public static TentDTOOut fromEntity(Tent tent) {
        TentDTOOut dto = new TentDTOOut();
        dto.setId(String.valueOf(tent.getId()));

        // Use the actual fields from the tent entity
        dto.setName(tent.getName() != null ? tent.getName() : "Hall " + tent.getId());
        dto.setCode(tent.getCode() != null ? tent.getCode() : "H" + tent.getId());
        dto.setType(tent.getType() != null ? tent.getType() : "male");
        dto.setLocation(tent.getLocation() != null ? tent.getLocation() : tent.getName());

        dto.setCapacity(tent.getCapacity());

        // Convert beds to DTOs and calculate occupancy
        List<BedDTOOut> bedDTOs = new ArrayList<>();
        int occupied = 0;
        int specialNeeds = 0;

        if (tent.getBeds() != null) {
            for (var bed : tent.getBeds()) {
                BedDTOOut bedDTO = BedDTOOut.fromEntity(bed);
                bedDTOs.add(bedDTO);
                String status = bedDTO.getStatus();
                if ("occupied".equals(status)) {
                    occupied++;
                    if (bedDTO.getIsSpecialNeeds()) {
                        specialNeeds++;
                    }
                }
            }
        }

        dto.setBeds(bedDTOs);
        dto.setCurrentOccupancy(occupied);
        dto.setAvailableBeds(tent.getCapacity() - occupied);
        dto.setSpecialNeedsOccupancy(specialNeeds);

        // Set numbering format
        dto.setNumberingFormat("standard");

        // Set numbering config based on type
        BedNumberingConfig config = new BedNumberingConfig();
        config.setSeparator("-");
        if ("female".equals(dto.getType())) {
            config.setPrefix("");
            config.setStartNumber(1);
            config.setPadding(3);
        } else {
            config.setStartNumber(100);
            config.setPadding(0);
        }
        dto.setNumberingConfig(config);

        // Set timestamps
        dto.setCreatedAt(tent.getCreated_at());
        dto.setUpdatedAt(tent.getUpdated_at());

        dto.setDescription("");

        return dto;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class BedNumberingConfig {
        private String prefix;
        private String suffix;
        private Integer startNumber;
        private Integer padding;
        private String separator;
    }
}
