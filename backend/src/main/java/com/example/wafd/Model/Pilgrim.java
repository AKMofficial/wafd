package com.example.wafd.Model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Entity
public class Pilgrim {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "registration_number", columnDefinition = "varchar(50) unique")
    private String registrationNumber;

    @Column(name = "national_id", columnDefinition = "varchar(50) unique")
    private String nationalId;

    @Column(name = "passport_number", columnDefinition = "varchar(50)")
    private String passportNumber;

    @Column(name = "first_name", columnDefinition = "varchar(100) not null")
    private String firstName;

    @Column(name = "last_name", columnDefinition = "varchar(100) not null")
    private String lastName;

    @Column(name = "gender", columnDefinition = "varchar(10) not null")
    private String gender; // male | female

    @Column(name = "age", columnDefinition = "int not null")
    private Integer age;

    @Column(name = "nationality", columnDefinition = "varchar(255) not null")
    private String nationality;

    @Column(name = "phone_number", columnDefinition = "varchar(50) not null")
    private String phoneNumber;

    @Column(name = "has_special_needs")
    private Boolean hasSpecialNeeds;

    @Column(name = "special_needs_type", columnDefinition = "varchar(100)")
    private String specialNeedsType;

    @Column(name = "special_needs_notes", columnDefinition = "text")
    private String specialNeedsNotes;

    @Column(name = "notes", columnDefinition = "text")
    private String notes;

    @Column(name = "status", columnDefinition = "varchar(20) not null")
    private String status; // expected | arrived | departed | no_show

    @ManyToOne
    @JsonIgnore
    private Agency agency;

    @OneToOne(mappedBy = "pilgrim", cascade = CascadeType.ALL)
    private Booking booking;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
