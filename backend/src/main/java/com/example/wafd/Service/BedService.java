package com.example.wafd.Service;

import com.example.wafd.Api.ApiException;
import com.example.wafd.Model.Bed;
import com.example.wafd.Repository.BedRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class BedService {

    private final BedRepository bedRepository;
    private final AuthenticationService authenticationService;
    
    public List<Bed> findAllBeds(){
        return bedRepository.findAll();
    }
    
    public void addBed(Bed bed){
        bed.setStatus("Available");
        bedRepository.save(bed);
    }
    
    public void deleteBed(Integer id){
        Bed bedToDelete = bedRepository.findBedById(id);
        if (bedToDelete == null){
            throw new ApiException("Bed not found");
        }
        bedRepository.delete(bedToDelete);
    }

    public void updateBedStatus(Integer id, String status){
        var currentUser = authenticationService.getCurrentUser();

        // Supervisors cannot set beds to Maintenance status
        if ("Supervisor".equals(currentUser.getRole()) && "Maintenance".equalsIgnoreCase(status)) {
            throw new ApiException("Supervisors are not allowed to set beds to maintenance status");
        }

        Bed bed = bedRepository.findBedById(id);
        if (bed == null){
            throw new ApiException("Bed not found");
        }
        bed.setStatus(status);
        bedRepository.save(bed);
    }
}