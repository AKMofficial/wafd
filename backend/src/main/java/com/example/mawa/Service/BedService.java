package com.example.mawa.Service;

import com.example.mawa.Api.ApiException;
import com.example.mawa.Model.Bed;
import com.example.mawa.Repository.BedRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class BedService {
    
    private final BedRepository bedRepository;
    
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
}