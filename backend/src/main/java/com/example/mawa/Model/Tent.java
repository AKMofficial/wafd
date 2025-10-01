package com.example.mawa.Model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;
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
public class Tent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @NotEmpty(message = "Location is required")
    @Size(min = 3, max = 255, message = "Location must be between 3 and 255 characters")
    @Column(columnDefinition = "varchar(255) not null")
    private String location;

    @NotNull(message = "Capacity is required")
    @PositiveOrZero(message = "Capacity must be a positive integer or Zero")
    @Column(columnDefinition = "Integer not null")
    private Integer capacity;

    @ManyToOne
    @JsonIgnore
    private Agency agency;

    @OneToMany(cascade = CascadeType.ALL, mappedBy = "tent")
    private Set<Bed> beds;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime created_at;
    @UpdateTimestamp
    @Column
    private LocalDateTime updated_at;
}