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
public class Bed {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @NotEmpty(message = "Status is required")
    @Pattern(regexp = "^(Available|Booked|Checked_in|Checked_out)$", message = "Status must be Booked, Checked_in, or Checked_out")
    @Column(columnDefinition = "varchar(15) not null")
    private String status;

    @ManyToOne
    @JsonIgnore
    private Tent tent;

    @OneToOne(mappedBy = "bed", cascade = CascadeType.ALL)
    private Booking booking;


    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime created_at;

    @UpdateTimestamp
    @Column
    private LocalDateTime updated_at;
}