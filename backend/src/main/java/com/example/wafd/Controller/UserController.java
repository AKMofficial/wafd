package com.example.wafd.Controller;

import com.example.wafd.Api.ApiException;
import com.example.wafd.Api.ApiResponse;
import com.example.wafd.DTO.ChangePasswordDTOIn;
import com.example.wafd.DTO.CreateUserDTOIn;
import com.example.wafd.DTO.UpdateUserDTOIn;
import com.example.wafd.Model.User;
import com.example.wafd.Service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/user")
public class UserController {

    private final UserService userService;
    private final PasswordEncoder passwordEncoder;

    @GetMapping("/get/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> findAllUsers(){
        return ResponseEntity.ok(userService.findAllUsers());
    }

    @GetMapping("/get/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getUserById(@PathVariable Integer id){
        User user = userService.findUserById(id);
        if (user == null){
            throw new ApiException("User not found");
        }
        return ResponseEntity.ok(user);
    }

    @PostMapping("/add")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> addUser(@RequestBody @Valid CreateUserDTOIn createUserDTOIn){
        User user = new User();
        user.setName(createUserDTOIn.getName());
        user.setEmail(createUserDTOIn.getEmail());
        user.setPhone(createUserDTOIn.getPhone());
        user.setPassword(passwordEncoder.encode(createUserDTOIn.getPassword()));
        user.setRole(createUserDTOIn.getRole());

        userService.addUser(user);
        return ResponseEntity.status(HttpStatus.CREATED.value()).body(new ApiResponse("User added successfully"));
    }

    @PutMapping("/update/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateUser(@RequestBody @Valid UpdateUserDTOIn updateUserDTOIn, @PathVariable Integer id){
        User user = userService.findUserById(id);
        if (user == null){
            throw new ApiException("User not found");
        }

        user.setName(updateUserDTOIn.getName());
        user.setEmail(updateUserDTOIn.getEmail());
        user.setPhone(updateUserDTOIn.getPhone());
        user.setRole(updateUserDTOIn.getRole());

        if (updateUserDTOIn.getPassword() != null && !updateUserDTOIn.getPassword().isEmpty()){
            user.setPassword(passwordEncoder.encode(updateUserDTOIn.getPassword()));
        }

        userService.updateUser(user);
        return ResponseEntity.ok(new ApiResponse("User updated successfully"));
    }

    @DeleteMapping("/delete/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteUser(@PathVariable Integer id){
        userService.deleteUser(id);
        return ResponseEntity.ok(new ApiResponse("User deleted successfully"));
    }

    @PutMapping("/change-password/{id}")
    public ResponseEntity<?> changePassword(@RequestBody @Valid ChangePasswordDTOIn changePasswordDTOIn, @PathVariable Integer id){
        User currentUser = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();

        if (!currentUser.getId().equals(id) && !currentUser.getRole().equals("Admin")){
            throw new ApiException("Unauthorized");
        }

        User user = userService.findUserById(id);
        if (user == null){
            throw new ApiException("User not found");
        }

        if (!passwordEncoder.matches(changePasswordDTOIn.getCurrentPassword(), user.getPassword())){
            throw new ApiException("Current password is incorrect");
        }

        user.setPassword(passwordEncoder.encode(changePasswordDTOIn.getNewPassword()));
        userService.updateUser(user);

        return ResponseEntity.ok(new ApiResponse("Password changed successfully"));
    }
}