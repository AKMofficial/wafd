package com.example.wafd.Service;

import com.example.wafd.Api.ApiException;
import com.example.wafd.DTO.TentDTOIn;
import com.example.wafd.DTO.TentDTOOut;
import com.example.wafd.Model.Bed;
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
    private final BedService bedService;

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

        tent.setName(tentDTO.getName());
        tent.setCode(tentDTO.getCode());
        tent.setType(tentDTO.getType());
        tent.setLocation(tentDTO.getLocation() != null && !tentDTO.getLocation().isEmpty()
            ? tentDTO.getLocation()
            : tentDTO.getName());
        tent.setCapacity(tentDTO.getCapacity());

        tentRepository.save(tent);

        // Create beds based on capacity
        if (tentDTO.getCapacity() != null && tentDTO.getCapacity() > 0) {
            for (int i = 0; i < tentDTO.getCapacity(); i++) {
                Bed bed = new Bed();
                bed.setTent(tent);
                bed.setStatus("Available");
                bedService.addBed(bed);
            }
        }
    }

    public void updateTent(TentDTOIn tentDTO, Integer id){
        Tent tentToUpdate = tentRepository.findTentById(id);
        if (tentToUpdate == null){
            throw new ApiException("Tent not found");
        }

        // Store old capacity for bed adjustment
        Integer oldCapacity = tentToUpdate.getCapacity();
        Integer newCapacity = tentDTO.getCapacity();

        tentToUpdate.setName(tentDTO.getName());
        tentToUpdate.setCode(tentDTO.getCode());
        tentToUpdate.setType(tentDTO.getType());
        tentToUpdate.setLocation(tentDTO.getLocation() != null && !tentDTO.getLocation().isEmpty()
            ? tentDTO.getLocation()
            : tentDTO.getName());
        tentToUpdate.setCapacity(newCapacity);

        tentRepository.save(tentToUpdate);

        // Handle capacity changes
        if (newCapacity != null && oldCapacity != null && !newCapacity.equals(oldCapacity)) {
            if (newCapacity > oldCapacity) {
                // Create additional beds
                int bedsToCreate = newCapacity - oldCapacity;
                for (int i = 0; i < bedsToCreate; i++) {
                    Bed bed = new Bed();
                    bed.setTent(tentToUpdate);
                    bed.setStatus("Available");
                    bedService.addBed(bed);
                }
            } else if (newCapacity < oldCapacity) {
                // Delete excess beds (only Available ones)
                int bedsToRemove = oldCapacity - newCapacity;
                List<Bed> availableBeds = tentToUpdate.getBeds().stream()
                    .filter(bed -> "Available".equals(bed.getStatus()))
                    .limit(bedsToRemove)
                    .collect(Collectors.toList());

                for (Bed bed : availableBeds) {
                    bedService.deleteBed(bed.getId());
                }
            }
        }
    }
    
    public void deleteTent(Integer id){
        Tent tentToDelete = tentRepository.findTentById(id);
        if (tentToDelete == null){
            throw new ApiException("Tent not found");
        }
        tentRepository.delete(tentToDelete);
    }
}