package com.example.wafd.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.Map;

@Data
@AllArgsConstructor
public class PilgrimStatisticsDTOOut {
    private long total;
    private long arrived;
    private long expected;
    private long departed;
    private long noShow;
    private long specialNeeds;
    private long maleCount;
    private long femaleCount;
    private double occupancyRate;
    private Map<String, Long> byNationality;
    private Map<String, Long> byAgeGroup;
}
