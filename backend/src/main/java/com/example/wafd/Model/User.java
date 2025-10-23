package com.example.wafd.Model;

import com.example.wafd.Model.Agency;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.Collections;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "users")
public class User implements UserDetails {

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
    private String phone;
    @NotEmpty(message = "Password is required")
    @Column(columnDefinition = "varchar(255) not null")
    private String password;
    @Pattern(regexp = "^(Admin|Supervisor)$",message = "Role must be Admin or Supervisor")
    private String role;

    @OneToOne(mappedBy = "manager")
    @JsonIgnore
    private Agency managedAgency;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime created_at;

    @UpdateTimestamp
    @Column
    private LocalDateTime updated_at;

    // UserDetails interface methods
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + role.toUpperCase()));
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }
}
