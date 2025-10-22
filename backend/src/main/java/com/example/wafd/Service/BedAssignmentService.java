package com.example.wafd.Service;

import com.example.wafd.Api.ApiException;
import com.example.wafd.Model.Bed;
import com.example.wafd.Model.Booking;
import com.example.wafd.Model.Pilgrim;
import com.example.wafd.Repository.BedRepository;
import com.example.wafd.Repository.BookingRepository;
import com.example.wafd.Repository.PilgrimRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class BedAssignmentService {

    private final BedRepository bedRepository;
    private final PilgrimRepository pilgrimRepository;
    private final BookingRepository bookingRepository;

    public Bed assignBed(Integer pilgrimId, Integer bedId) {
        Pilgrim pilgrim = pilgrimRepository.findPilgrimById(pilgrimId);
        if (pilgrim == null) {
            throw new ApiException("Pilgrim not found");
        }
        Bed bed = bedRepository.findBedById(bedId);
        if (bed == null) {
            throw new ApiException("Bed not found");
        }

        if (!bed.getStatus().equals("Available")) {
            throw new ApiException("Bed is not available");
        }

        Booking booking = pilgrim.getBooking();
        if (booking == null) {
            booking = new Booking();
            booking.setPilgrim(pilgrim);
        }

        booking.setBed(bed);
        booking.setStatus("Booked");
        bookingRepository.save(booking);

        bed.setStatus("Booked");
        bedRepository.save(bed);

        return bed;
    }

    public Bed vacateBed(Integer bedId) {
        Bed bed = bedRepository.findBedById(bedId);
        if (bed == null) {
            throw new ApiException("Bed not found");
        }

        Booking booking = bed.getBooking();
        if (booking != null) {
            booking.setStatus("Cancelled");
            bookingRepository.save(booking);
        }

        bed.setStatus("Available");
        return bedRepository.save(bed);
    }
}