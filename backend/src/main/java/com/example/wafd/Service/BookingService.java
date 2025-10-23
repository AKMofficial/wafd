package com.example.wafd.Service;

import com.example.wafd.Api.ApiException;
import com.example.wafd.Model.*;
import com.example.wafd.Repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class BookingService {

    private final BookingRepository bookingRepository;
    private final PilgrimRepository pilgrimRepository;
    private final AgencyRepository agencyRepository;
    private final BedRepository bedRepository;

    public List<Booking> findAllBookings(){
        return bookingRepository.findAll();
    }

    public void addBooking(String pilgrimIdentifier){
        Pilgrim pilgrim = resolvePilgrim(pilgrimIdentifier);
        if (pilgrim == null){
            throw new ApiException("Pilgrim not found");
        }
        if (pilgrim.getAgency() == null) {
            throw new ApiException("Pilgrim is not assigned to a group");
        }
        Agency agency = agencyRepository.findAgencyById(pilgrim.getAgency().getId());
        if (agency == null){
            throw new ApiException("Agency not found");
        }
        for (Tent tent : agency.getTents()){
            if (tent.getCapacity() == 0){
                continue;
            }
            for (Bed bed : tent.getBeds()){
                if (bed.getStatus().equals("Booked")){
                    continue;
                }
                bed.setStatus("Booked");
                Booking booking = new Booking(null,"Booked",pilgrim,bed,null,null);
                bookingRepository.save(booking);
                return;
            }
        }
        throw new ApiException("All Tents are full");
    }

    public void updateBookedBed(Integer bed_id, String pilgrimIdentifier){
        Pilgrim pilgrim = resolvePilgrim(pilgrimIdentifier);
        if (pilgrim == null){
            throw new ApiException("Pilgrim not found");
        }
        if (pilgrim.getAgency() == null) {
            throw new ApiException("Pilgrim is not assigned to a group");
        }
        Bed bed = bedRepository.findBedById(bed_id);
        if (bed == null){
            throw new ApiException("Bed not found");
        }
        if (!bed.getStatus().equals("Available")){
            throw new ApiException("Bed is not available");
        }
        bed.setStatus("Booked");
        Booking booking = new Booking(null,"Booked",pilgrim,bed,null,null);
        bookingRepository.save(booking);
        pilgrimRepository.save(pilgrim);
    }

    public void deleteBooking(Integer id){
        Booking booking = bookingRepository.findBookingById(id);
        if (booking == null){
            throw new ApiException("Booking not found");
        }
        bookingRepository.delete(booking);
    }

    private Pilgrim resolvePilgrim(String identifier) {
        if (identifier == null) {
            return null;
        }

        // Try by numeric id
        try {
            int id = Integer.parseInt(identifier);
            Pilgrim pilgrim = pilgrimRepository.findPilgrimById(id);
            if (pilgrim != null) {
                return pilgrim;
            }
        } catch (NumberFormatException ignored) {
        }

        Optional<Pilgrim> byNationalId = pilgrimRepository.findByNationalId(identifier);
        if (byNationalId.isPresent()) {
            return byNationalId.get();
        }

        Optional<Pilgrim> byRegistrationNumber = pilgrimRepository.findByRegistrationNumber(identifier);
        return byRegistrationNumber.orElse(null);
    }
}
