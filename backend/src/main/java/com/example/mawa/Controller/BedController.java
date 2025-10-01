package com.example.mawa.Controller;

import com.example.mawa.Api.ApiResponse;
import com.example.mawa.Model.Bed;
import com.example.mawa.Service.BedService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/bed")
public class BedController {

    private final BedService bedService;

    @GetMapping("/get/all")
    public ResponseEntity<?> findAllBeds(){
        return ResponseEntity.ok(bedService.findAllBeds());
    }

    @PostMapping("/add")
    public ResponseEntity<?> addBed(@RequestBody @Valid Bed bed){
        bedService.addBed(bed);
        return ResponseEntity.status(HttpStatus.CREATED.value()).body(new ApiResponse("Bed added successfully"));
    }
    
    @DeleteMapping("/delete/{id}")
    public ResponseEntity<?> deleteBed(@PathVariable Integer id){
        bedService.deleteBed(id);
        return ResponseEntity.ok(new ApiResponse("Bed deleted successfully"));
    }
}