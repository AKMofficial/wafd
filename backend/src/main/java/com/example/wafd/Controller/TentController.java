package com.example.wafd.Controller;

import com.example.wafd.Api.ApiResponse;
import com.example.wafd.DTO.TentDTOIn;
import com.example.wafd.Service.TentService;
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

    @GetMapping("/get/{id}")
    public ResponseEntity<?> findTentById(@PathVariable Integer id){
        return ResponseEntity.ok(tentService.findTentById(id));
    }

    @PostMapping("/add")
    public ResponseEntity<?> addTent(@RequestBody TentDTOIn tentDTO){
        tentService.addTent(tentDTO);
        return ResponseEntity.status(HttpStatus.CREATED.value()).body(new ApiResponse("Tent added successfully"));
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<?> updateTent(@RequestBody TentDTOIn tentDTO, @PathVariable Integer id){
        tentService.updateTent(tentDTO, id);
        return ResponseEntity.ok(new ApiResponse("Tent updated successfully"));
    }
    
    @DeleteMapping("/delete/{id}")
    public ResponseEntity<?> deleteTent(@PathVariable Integer id){
        tentService.deleteTent(id);
        return ResponseEntity.ok(new ApiResponse("Tent deleted successfully"));
    }
}
