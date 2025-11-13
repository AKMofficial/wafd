package com.example.wafd.Controller;

import com.example.wafd.Api.ApiResponse;
import com.example.wafd.Model.Bed;
import com.example.wafd.Service.BedAssignmentService;
import com.example.wafd.Service.BedService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/bed")
public class BedController {

    private final BedService bedService;
    private final BedAssignmentService bedAssignmentService;

    @GetMapping("/get/all")
    @Cacheable(value = "beds")
    public ResponseEntity<?> findAllBeds(){
        return ResponseEntity.ok(bedService.findAllBeds());
    }

    @PostMapping("/add")
    @CacheEvict(value = "beds", allEntries = true)
    public ResponseEntity<?> addBed(@RequestBody @Valid Bed bed){
        bedService.addBed(bed);
        return ResponseEntity.status(HttpStatus.CREATED.value()).body(new ApiResponse("Bed added successfully"));
    }
    
    @DeleteMapping("/delete/{id}")
    @CacheEvict(value = "beds", allEntries = true)
    public ResponseEntity<?> deleteBed(@PathVariable Integer id){
        bedService.deleteBed(id);
        return ResponseEntity.ok(new ApiResponse("Bed deleted successfully"));
    }

    @PostMapping("/assign")
    @CacheEvict(value = "beds", allEntries = true)
    public ResponseEntity<?> assignBed(@RequestBody Map<String, Integer> payload){
        Integer pilgrimId = payload.get("pilgrimId");
        Integer bedId = payload.get("bedId");

        if (pilgrimId == null || bedId == null) {
            return ResponseEntity.badRequest().body(new ApiResponse("pilgrimId and bedId are required"));
        }

        bedAssignmentService.assignBed(pilgrimId, bedId);
        return ResponseEntity.ok(new ApiResponse("Bed assigned successfully"));
    }

    @PutMapping("/vacate/{bedId}")
    @CacheEvict(value = "beds", allEntries = true)
    public ResponseEntity<?> vacateBed(@PathVariable Integer bedId){
        bedAssignmentService.vacateBed(bedId);
        return ResponseEntity.ok(new ApiResponse("Bed vacated successfully"));
    }

    @PutMapping("/status/{bedId}")
    @CacheEvict(value = "beds", allEntries = true)
    public ResponseEntity<?> updateBedStatus(@PathVariable Integer bedId, @RequestBody Map<String, String> payload){
        String status = payload.get("status");

        if (status == null || status.isEmpty()) {
            return ResponseEntity.badRequest().body(new ApiResponse("Status is required"));
        }

        bedService.updateBedStatus(bedId, status);
        return ResponseEntity.ok(new ApiResponse("Bed status updated successfully"));
    }
}