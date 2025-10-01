package com.example.mawa.Model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Past;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Entity
public class Pilgrim {

    @Id
    private Integer id;

/*
    @NotEmpty(message = "Passport number is required")
    @Pattern(regexp = "^\\d{8}$", message = "Passport number must be 8 digits")
*/
    @Column(columnDefinition = "varchar(8) not null")
    private String passport_number;

/*
    @NotEmpty(message = "Nationality is required")
    @Pattern(regexp = "^[A-Za-z]{2}$", message = "Nationality must be 2 characters")
*/
    @Column(columnDefinition = "varchar(2) not null")
    private String nationality;



/*
    @NotNull(message = "Date of birth is required")
    @Past
*/
    @Column(columnDefinition = "date not null")
    private LocalDate date_of_birth;

/*
    @NotEmpty(message = "Gender is required")
    @Pattern(regexp = "^([MF])$", message = "Gender must be Male or Female")
*/
    @Column(columnDefinition = "varchar(1) not null")
    private String gender;

/*
    @NotEmpty(message = "Status is required")
    @Pattern(regexp = "^(Registered|Booked|Arrived|Departed|Cancelled)$", message = "Status must be Registered, Booked, Arrived, Departed or Cancelled")
*/
    @Column(columnDefinition = "varchar(10) not null")
    private String status;

    @ManyToOne
    @JsonIgnore
    private Agency agency;

    @OneToOne(mappedBy = "pilgrim", cascade = CascadeType.ALL)
    private Booking booking;


    @OneToOne
    @MapsId
    @JsonIgnore
    private User user;



}
