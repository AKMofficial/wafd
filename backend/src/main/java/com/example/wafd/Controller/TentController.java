package com.example.wafd.Controller;

import com.example.wafd.Api.ApiResponse;
import com.example.wafd.Model.Tent;
import com.example.wafd.Service.TentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/tent")
public class TentController {

    private final TentService tentService;

    @GetMapping("/get/all")
    public ResponseEntity<?> findAllTents(){
        return ResponseEntity.ok(tentService.findAllTents());
    }

    @PostMapping("/add")
    public ResponseEntity<?> addTent(@RequestBody @Valid Tent tent){
        tentService.addTent(tent);
        return ResponseEntity.status(HttpStatus.CREATED.value()).body(new ApiResponse("Tent added successfully"));
    }
    
    @PutMapping("/update/{id}")
    public ResponseEntity<?> updateTent(@RequestBody @Valid Tent tent, @PathVariable Integer id){
        tentService.updateTent(tent, id);
        return ResponseEntity.ok(new ApiResponse("Tent updated successfully"));
    }
    
    @DeleteMapping("/delete/{id}")
    public ResponseEntity<?> deleteTent(@PathVariable Integer id){
        tentService.deleteTent(id);
        return ResponseEntity.ok(new ApiResponse("Tent deleted successfully"));
    }
}