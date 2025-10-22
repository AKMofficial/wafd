package com.example.wafd.Controller;

import com.example.wafd.Api.ApiResponse;
import com.example.wafd.Model.Agency;
import com.example.wafd.Service.AgencyService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/agency")
public class AgencyController {

    private final AgencyService agencyService;

    @GetMapping("/get/all")
    public ResponseEntity<?> findAllAgencies(){
        return ResponseEntity.ok(agencyService.findAllAgencies());
    }

    @GetMapping("/get/{id}")
    public ResponseEntity<?> findAgencyById(@PathVariable Integer id){
        Agency agency = agencyService.findAgencyById(id);
        if (agency == null){
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new ApiResponse("Agency not found"));
        }
        return ResponseEntity.ok(agency);
    }

    @GetMapping("/get/{id}/pilgrims")
    public ResponseEntity<?> getPilgrimsByAgencyId(@PathVariable Integer id){
        return ResponseEntity.ok(agencyService.findPilgrimsByAgencyId(id));
    }

    @PostMapping("/add")
    public ResponseEntity<?> addAgency(@RequestBody @Valid Agency agency){
        agencyService.addAgency(agency);
        return ResponseEntity.status(HttpStatus.CREATED.value()).body(new ApiResponse("Agency added successfully"));
    }
    
    @PutMapping("/update/{id}")
    public ResponseEntity<?> updateAgency(@RequestBody @Valid Agency agency, @PathVariable Integer id){
        agencyService.updateAgency(agency, id);
        return ResponseEntity.ok(new ApiResponse("Agency updated successfully"));
    }
    
    @DeleteMapping("/delete/{id}")
    public ResponseEntity<?> deleteAgency(@PathVariable Integer id){
        agencyService.deleteAgency(id);
        return ResponseEntity.ok(new ApiResponse("Agency deleted successfully"));
    }
}