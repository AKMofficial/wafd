package com.example.mawa.Model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.Set;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Entity
public class Agency {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @NotEmpty(message = "Name is required")
    @Size(min = 3, max = 55,message = "Name must be between 3 and 55 characters")
    @Column(columnDefinition = "varchar(55) not null")
    private String name;

    @NotEmpty(message = "License Number is required")
    @Size(min = 3, max = 50,message = "License Number must be between 3 and 50 characters")
    @Column(columnDefinition = "varchar(50) not null unique")
    private String license_number;

    @NotEmpty(message = "Country is required")
    @Size(min = 2, max = 2,message = "Country must be 2 characters")
    @Column(columnDefinition = "varchar(2) not null")
    private String country;

    @NotEmpty(message = "Status is required")
    @Pattern(regexp = "^(Registered|Arrived|Departed|Cancelled)$", message = "Status must be Registered, Arrived, Departed or Cancelled")
    @Column(columnDefinition = "varchar(10) not null")
    private String status;

    @NotNull(message = "Max Pilgrim is required")
    @Column(columnDefinition = "int not null")
    @Positive(message = "Max Pilgrim must be a positive integer")
    private Integer max_pilgrim;

    @OneToMany(cascade = CascadeType.ALL, mappedBy = "agency")
    private Set<Pilgrim> pilgrims;

    @OneToMany(cascade = CascadeType.ALL, mappedBy = "agency")
    private Set<Tent> tents;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime created_at;
    @UpdateTimestamp
    @Column
    private LocalDateTime updated_at;
}
