package com.example.wafd.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class TentDTOIn {
    private String name;
    private String code;
    private String type; // "male" or "female"
    private Integer capacity;
    private String location;
    private String description;
}
