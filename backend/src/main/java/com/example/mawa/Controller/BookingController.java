package com.example.mawa.Controller;

import com.example.mawa.Api.ApiResponse;
import com.example.mawa.Service.BookingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/booking")
public class BookingController {

    private final BookingService bookingService;

    @GetMapping("/get/all")
    public ResponseEntity<?> findAllBookings(){
        return ResponseEntity.ok(bookingService.findAllBookings());
    }

    @PostMapping("/add/{userEmail}")
    public ResponseEntity<?> addBooking(@PathVariable String userEmail){
        bookingService.addBooking(userEmail);
        return ResponseEntity.status(HttpStatus.CREATED.value()).body(new ApiResponse("Booking added successfully"));
    }
    
    @PutMapping("/update-bed/{bedId}/{userEmail}")
    public ResponseEntity<?> updateBookedBed(@PathVariable Integer bedId, @PathVariable String userEmail){
        bookingService.updateBookedBed(bedId, userEmail);
        return ResponseEntity.ok(new ApiResponse("Bed booking updated successfully"));
    }
    
    @DeleteMapping("/delete/{id}")
    public ResponseEntity<?> deleteBooking(@PathVariable Integer id){
        bookingService.deleteBooking(id);
        return ResponseEntity.ok(new ApiResponse("Booking deleted successfully"));
    }
}