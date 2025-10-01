package com.example.mawa.Model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Entity
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @NotEmpty(message = "Name is required")
    @Size(min = 3, max = 55,message = "Name must be between 3 and 55 characters")
    @Column(columnDefinition = "varchar(55) not null")
    private String name;

    @NotEmpty(message = "Email is required")
    @Email(message = "Email is invalid")
    @Size(min = 3, max = 255,message = "Email must be between 3 and 255 characters")
    @Column(columnDefinition = "varchar(255) not null unique")
    private String email;

    @NotEmpty(message = "Phone is required")
    @Pattern(regexp = "^\\+[1-9]\\d{1,14}$", message = "Phone number must include country code (e.g., +1234567890)")
    @Column(columnDefinition = "varchar(255) not null unique")
    private String Phone;
    @NotEmpty(message = "Password is required")
    @Size(min = 8, max = 20,message = "Password must be between 3 and 20 characters")
    @Pattern(regexp = "^(?=.*[!@#$%^&*]).*$", message = "Password must contain at least one special character")
    @Column(columnDefinition = "varchar(255) not null")
    private String password;
    @Pattern(regexp = "^(Admin|Pilgrim|Supervisor)$",message = "Role must be Admin, Pilgrim or Supervisor")
    private String role;

    @OneToOne(cascade = CascadeType.ALL, mappedBy = "user")
    @PrimaryKeyJoinColumn
    private Pilgrim pilgrim;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime created_at;

    @UpdateTimestamp
    @Column
    private LocalDateTime updated_at;
}