package com.example.wafd.Controller;

import com.example.wafd.Api.ApiResponse;
import com.example.wafd.DTO.PilgrimDTOIn;
import com.example.wafd.Service.PilgrimService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/pilgrim")
public class PilgrimController {

    private final PilgrimService pilgrimService;

    @GetMapping("/get/all")
    public ResponseEntity<?> findAllPilgrims(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDirection){

        Sort.Direction direction = sortDirection.equalsIgnoreCase("ASC")
            ? Sort.Direction.ASC
            : Sort.Direction.DESC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));
        return ResponseEntity.ok(pilgrimService.getAllPilgrims(pageable));
    }

    @PostMapping("/add")
    public ResponseEntity<?> addPilgrim(@RequestBody @Valid PilgrimDTOIn pilgrimDTOIn){
        return ResponseEntity.status(HttpStatus.CREATED.value()).body(pilgrimService.addPilgrim(pilgrimDTOIn));
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

    @PutMapping("/assign/pilgrim/{pilgrimId}/group/{groupId}")
    public ResponseEntity<?> addPilgrimToGroup(@PathVariable Integer pilgrimId, @PathVariable Integer groupId){
        pilgrimService.addPilgrimToGroup(pilgrimId, groupId);
        return ResponseEntity.ok(new ApiResponse("Pilgrim assigned to group successfully"));
    }

    @GetMapping("/stats")
    public ResponseEntity<?> getPilgrimStatistics(){
        return ResponseEntity.ok(pilgrimService.getStatistics());
    }
}
