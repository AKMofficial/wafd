package com.example.mawa.Model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Pattern;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Entity
public class Booking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @NotEmpty(message = "Status is required")
    @Pattern(regexp = "^(Booked|Cancelled)$", message = "Status must be Booked or Cancelled")
    @Column(columnDefinition = "varchar(10) not null")
    private String status;

    @OneToOne
    @JsonIgnore
    private Pilgrim pilgrim;

    @OneToOne
    @JsonIgnore
    private Bed bed;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime created_at;

    @UpdateTimestamp
    @Column
    private LocalDateTime updated_at;
}