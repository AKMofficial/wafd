package com.example.wafd.DTO;

import com.example.wafd.Model.Agency;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AgencyDTO {
    private Integer id;
    private String name;
    private String code;
    private String country;
    private String status;
    private Integer maxPilgrim;
    private Integer pilgrimsCount;
    private String notes;

    private Integer managerId;
    private String managerName;
    private String managerEmail;
    private String managerPhone;
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private String managerPassword;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static AgencyDTO fromEntity(Agency agency) {
        if (agency == null) {
            return null;
        }
        var builder = AgencyDTO.builder()
                .id(agency.getId())
                .name(agency.getName())
                .code(agency.getLicense_number())
                .country(agency.getCountry())
                .status(agency.getStatus())
                .maxPilgrim(agency.getMax_pilgrim())
                .notes(agency.getNotes())
                .createdAt(agency.getCreated_at())
                .updatedAt(agency.getUpdated_at());

        if (agency.getManager() != null) {
            builder.managerId(agency.getManager().getId())
                    .managerName(agency.getManager().getName())
                    .managerEmail(agency.getManager().getEmail())
                    .managerPhone(agency.getManager().getPhone());
        }

        return builder.build();
    }
}
