package com.example.wafd.Service;

import com.example.wafd.Api.ApiException;
import com.example.wafd.Model.Tent;
import com.example.wafd.Repository.TentRepository;
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

    public Tent findTentById(Integer id){
        return tentRepository.findTentById(id);
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