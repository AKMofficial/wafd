package com.example.wafd.DTO;

import lombok.Data;

@Data
public class CreateTentRequest {
    private String name;
    private String code;
    private String type; // "male" or "female"
    private Integer capacity;
    private String location;
    private String description;
}
