package com.example.mawa.Controller;

import com.example.mawa.Api.ApiResponse;
import com.example.mawa.DTO.PilgrimDTOIn;
import com.example.mawa.Service.PilgrimService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/pilgrim")
public class PilgrimController {

    private final PilgrimService pilgrimService;

    @GetMapping("/get/all")
    public ResponseEntity<?> findAllPilgrims(){
        return ResponseEntity.ok(pilgrimService.getAllPilgrims());
    }

    @PostMapping("/add")
    public ResponseEntity<?> addPilgrim(@RequestBody @Valid PilgrimDTOIn pilgrimDTOIn){
        pilgrimService.addPilgrim(pilgrimDTOIn);
        return ResponseEntity.status(HttpStatus.CREATED.value()).body(new ApiResponse("Pilgrim added successfully"));
    }
    
    @PutMapping("/update/{id}")
    public ResponseEntity<?> updatePilgrim(@RequestBody @Valid PilgrimDTOIn pilgrimDTOIn, @PathVariable Integer id){
        pilgrimService.updatePilgrim(id, pilgrimDTOIn);
        return ResponseEntity.ok(new ApiResponse("Pilgrim updated successfully"));
    }
    
    @DeleteMapping("/delete/{id}")
    public ResponseEntity<?> deletePilgrim(@PathVariable Integer id){
        pilgrimService.deletePilgrim(id);
        return ResponseEntity.ok(new ApiResponse("Pilgrim deleted successfully"));
    }

    @GetMapping("/get/{id}")
    public ResponseEntity<?> getPilgrimById(@PathVariable Integer id){
        return ResponseEntity.ok(pilgrimService.getPilgrimById(id));
    }

    @PutMapping("/assign/pilgrim/{pilgrimId}/agency/{agencyId}")
    public ResponseEntity<?> addPilgrimToAgency(@PathVariable Integer pilgrimId, @PathVariable Integer agencyId){
        pilgrimService.addPilgrimToAgency(pilgrimId, agencyId);
        return ResponseEntity.ok(new ApiResponse("Pilgrim assigned to agency successfully"));
    }
}