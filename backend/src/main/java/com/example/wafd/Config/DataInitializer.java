package com.example.wafd.Config;

import com.example.wafd.Model.User;
import com.example.wafd.Repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        // Check if admin user exists
        User existingAdmin = userRepository.findUserByEmail("admin@wafd.com");

        if (existingAdmin == null) {
            // Create default admin user
            User adminUser = new User();
            adminUser.setName("System Administrator");
            adminUser.setEmail("admin@wafd.com");
            adminUser.setPhone("+966500000001");
            adminUser.setPassword(passwordEncoder.encode("Admin123!"));
            adminUser.setRole("Admin");

            userRepository.save(adminUser);
            System.out.println("Default admin user created:");
            System.out.println("Email: admin@wafd.com");
            System.out.println("Password: Admin123!");
            System.out.println("Please change the password after first login!");
        }

        // Check if supervisor user exists
        User existingSupervisor = userRepository.findUserByEmail("supervisor@wafd.com");

        if (existingSupervisor == null) {
            // Create default supervisor user
            User supervisorUser = new User();
            supervisorUser.setName("System Supervisor");
            supervisorUser.setEmail("supervisor@wafd.com");
            supervisorUser.setPhone("+966500000002");
            supervisorUser.setPassword(passwordEncoder.encode("Super123!"));
            supervisorUser.setRole("Supervisor");

            userRepository.save(supervisorUser);
            System.out.println("Default supervisor user created:");
            System.out.println("Email: supervisor@wafd.com");
            System.out.println("Password: Super123!");
        }
    }
}