package com.example.wafd.Controller;

import com.example.wafd.Api.ApiResponse;
import com.example.wafd.DTO.AgencyDTO;
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
        return ResponseEntity.ok(agencyService.findAgencyById(id));
    }

    @GetMapping("/get/{id}/pilgrims")
    public ResponseEntity<?> getPilgrimsByAgencyId(@PathVariable Integer id){
        return ResponseEntity.ok(agencyService.findPilgrimsByAgencyId(id));
    }

    @PostMapping("/add")
    public ResponseEntity<?> addAgency(@RequestBody @Valid AgencyDTO agency){
        return ResponseEntity.status(HttpStatus.CREATED.value()).body(agencyService.addAgency(agency));
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<?> updateAgency(@RequestBody @Valid AgencyDTO agency, @PathVariable Integer id){
        return ResponseEntity.ok(agencyService.updateAgency(agency, id));
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<?> deleteAgency(@PathVariable Integer id){
        agencyService.deleteAgency(id);
        return ResponseEntity.ok(new ApiResponse("Group deleted successfully"));
    }
}
