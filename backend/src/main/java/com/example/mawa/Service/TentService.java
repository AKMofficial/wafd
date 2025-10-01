package com.example.mawa.Service;

import com.example.mawa.Api.ApiException;
import com.example.mawa.Model.Tent;
import com.example.mawa.Repository.TentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TentService {
    
    private final TentRepository tentRepository;
    
    public List<Tent> findAllTents(){
        return tentRepository.findAll();
    }
    
    public void addTent(Tent tent){
        tentRepository.save(tent);
    }
    
    public void updateTent(Tent tent, Integer id){
        Tent tentToUpdate = tentRepository.findTentById(id);
        if (tentToUpdate == null){
            throw new ApiException("Tent not found");
        }
        tentToUpdate.setLocation(tent.getLocation());
        tentToUpdate.setCapacity(tent.getCapacity());
        tentRepository.save(tentToUpdate);
    }
    
    public void deleteTent(Integer id){
        Tent tentToDelete = tentRepository.findTentById(id);
        if (tentToDelete == null){
            throw new ApiException("Tent not found");
        }
        tentRepository.delete(tentToDelete);
    }
}