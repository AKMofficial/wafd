package com.example.wafd.Service;

import com.example.wafd.Api.ApiException;
import com.example.wafd.DTO.TentDTOIn;
import com.example.wafd.DTO.TentDTOOut;
import com.example.wafd.Model.Tent;
import com.example.wafd.Repository.TentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TentService {

    private final TentRepository tentRepository;

    public List<TentDTOOut> findAllTents(){
        return tentRepository.findAll().stream()
            .map(TentDTOOut::fromEntity)
            .collect(Collectors.toList());
    }

    public TentDTOOut findTentById(Integer id){
        Tent tent = tentRepository.findTentById(id);
        if (tent == null){
            throw new ApiException("Tent not found");
        }
        return TentDTOOut.fromEntity(tent);
    }

    public void addTent(TentDTOIn tentDTO){
        // Map DTO to Tent entity
        Tent tent = new Tent();

        // Build location from name and code if not provided
        String location;
        if (tentDTO.getLocation() != null && !tentDTO.getLocation().isEmpty()) {
            location = tentDTO.getLocation();
        } else if (tentDTO.getName() != null && tentDTO.getCode() != null) {
            location = tentDTO.getName() + " - " + tentDTO.getCode();
        } else if (tentDTO.getName() != null) {
            location = tentDTO.getName();
        } else {
            location = "Tent " + System.currentTimeMillis();
        }

        tent.setLocation(location);
        tent.setCapacity(tentDTO.getCapacity());
        tentRepository.save(tent);
    }

    public void updateTent(TentDTOIn tentDTO, Integer id){
        Tent tentToUpdate = tentRepository.findTentById(id);
        if (tentToUpdate == null){
            throw new ApiException("Tent not found");
        }

        // Build location from name and code if not provided
        String location;
        if (tentDTO.getLocation() != null && !tentDTO.getLocation().isEmpty()) {
            location = tentDTO.getLocation();
        } else if (tentDTO.getName() != null && tentDTO.getCode() != null) {
            location = tentDTO.getName() + " - " + tentDTO.getCode();
        } else if (tentDTO.getName() != null) {
            location = tentDTO.getName();
        } else {
            location = tentToUpdate.getLocation(); // Keep existing location
        }

        tentToUpdate.setLocation(location);
        tentToUpdate.setCapacity(tentDTO.getCapacity());
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