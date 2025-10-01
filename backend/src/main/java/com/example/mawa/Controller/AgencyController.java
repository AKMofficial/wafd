package com.example.mawa.Controller;

import com.example.mawa.Api.ApiResponse;
import com.example.mawa.Model.Agency;
import com.example.mawa.Service.AgencyService;
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