package com.example.wafd.DTO;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PilgrimStatsDTO {
    private Long total;
    private Long arrived;
    private Long expected;
    private Long departed;
    private Long noShow;
    private Long specialNeeds;
    private Long maleCount;
    private Long femaleCount;
    private Double occupancyRate;
    private Map<String, Long> byNationality;
    private Map<String, Long> byAgeGroup;
    private Map<String, Long> bySpecialNeeds; // Added for special needs breakdown
    
    // Convenience getters for frontend (camelCase versions)
    public Long getArrivedCount() { return arrived; }
    public Long getExpectedCount() { return expected; }
    public Long getDepartedCount() { return departed; }
    public Long getNoShowCount() { return noShow; }
}
