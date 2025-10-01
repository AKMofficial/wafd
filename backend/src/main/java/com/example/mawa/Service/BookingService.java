package com.example.mawa.Service;

import com.example.mawa.Api.ApiException;
import com.example.mawa.Model.*;
import com.example.mawa.Repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class BookingService {

    private final BookingRepository bookingRepository;
    private final PilgrimRepository pilgrimRepository;
    private final UserRepository userRepository;
    private final AgencyRepository agencyRepository;
    private final BedRepository bedRepository;

    public List<Booking> findAllBookings(){
        return bookingRepository.findAll();
    }

    public void addBooking(String user_email){
        User user = userRepository.findUserByEmail(user_email);
        Pilgrim pilgrim = pilgrimRepository.findPilgrimById(user.getPilgrim().getId());
        if (pilgrim == null){
            throw new ApiException("Pilgrim not found");
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

    public void updateBookedBed(Integer bed_id, String user_email){
        User user = userRepository.findUserByEmail(user_email);
        Pilgrim pilgrim = pilgrimRepository.findPilgrimById(user.getPilgrim().getId());
        if (pilgrim == null){
            throw new ApiException("Pilgrim not found");
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
}
