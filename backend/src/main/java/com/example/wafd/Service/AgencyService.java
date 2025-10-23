package com.example.wafd.Service;

import com.example.wafd.Api.ApiException;
import com.example.wafd.DTO.AgencyDTO;
import com.example.wafd.Model.Agency;
import com.example.wafd.Model.Pilgrim;
import com.example.wafd.Model.User;
import com.example.wafd.Repository.AgencyRepository;
import com.example.wafd.Repository.PilgrimRepository;
import com.example.wafd.Repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AgencyService {

    private final AgencyRepository agencyRepository;
    private final PilgrimRepository pilgrimRepository;
    private final UserRepository userRepository;
    private final org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;

    public List<AgencyDTO> findAllAgencies(){
        return agencyRepository.findAll().stream()
                .map(agency -> {
                    AgencyDTO dto = AgencyDTO.fromEntity(agency);
                    if (agency.getId() != null) {
                        dto.setPilgrimsCount((int) pilgrimRepository.countByAgencyId(agency.getId()));
                    }
                    return dto;
                })
                .collect(Collectors.toList());
    }

    public AgencyDTO findAgencyById(Integer id){
        Agency agency = agencyRepository.findAgencyById(id);
        if (agency == null){
            throw new ApiException("Group not found");
        }
        AgencyDTO dto = AgencyDTO.fromEntity(agency);
        if (agency.getId() != null) {
            dto.setPilgrimsCount((int) pilgrimRepository.countByAgencyId(agency.getId()));
        }
        return dto;
    }

    public AgencyDTO addAgency(AgencyDTO dto){
        Agency agency = new Agency();
        applyAgencyDetails(agency, dto, true);
        Agency saved = agencyRepository.save(agency);
        AgencyDTO response = AgencyDTO.fromEntity(saved);
        if (saved.getId() != null) {
            response.setPilgrimsCount((int) pilgrimRepository.countByAgencyId(saved.getId()));
        }
        return response;
    }

    public AgencyDTO updateAgency(AgencyDTO dto, Integer id){
        Agency agencyToUpdate = agencyRepository.findAgencyById(id);
        if (agencyToUpdate == null){
            throw new ApiException("Group not found");
        }
        applyAgencyDetails(agencyToUpdate, dto, false);
        Agency saved = agencyRepository.save(agencyToUpdate);
        AgencyDTO response = AgencyDTO.fromEntity(saved);
        if (saved.getId() != null) {
            response.setPilgrimsCount((int) pilgrimRepository.countByAgencyId(saved.getId()));
        }
        return response;
    }

    public void deleteAgency(Integer id){
        Agency agencyToDelete = agencyRepository.findAgencyById(id);
        if (agencyToDelete == null){
            throw new ApiException("Group not found");
        }
        User manager = agencyToDelete.getManager();
        agencyRepository.delete(agencyToDelete);
        if (manager != null) {
            userRepository.delete(manager);
        }
    }

    public List<Pilgrim> findPilgrimsByAgencyId(Integer agencyId){
        Agency agency = agencyRepository.findAgencyById(agencyId);
        if (agency == null){
            throw new ApiException("Group not found");
        }
        return pilgrimRepository.findByAgencyId(agencyId);
    }

    private void applyAgencyDetails(Agency agency, AgencyDTO dto, boolean isCreate) {
        if (dto.getName() == null || dto.getName().isBlank()) {
            throw new ApiException("Group name is required");
        }
        if (dto.getCode() == null || dto.getCode().isBlank()) {
            throw new ApiException("Group code is required");
        }
        if (dto.getManagerName() == null || dto.getManagerName().isBlank()) {
            throw new ApiException("Group manager name is required");
        }
        if (dto.getManagerPhone() == null || dto.getManagerPhone().isBlank()) {
            throw new ApiException("Group manager phone is required");
        }

        agency.setName(dto.getName());
        agency.setLicense_number(dto.getCode());
        if (dto.getCountry() != null && !dto.getCountry().isBlank()) {
            agency.setCountry(dto.getCountry());
        } else if (agency.getCountry() == null) {
            agency.setCountry("SA");
        }
        if (dto.getStatus() != null && !dto.getStatus().isBlank()) {
            agency.setStatus(dto.getStatus());
        } else if (agency.getStatus() == null) {
            agency.setStatus("Registered");
        }
        if (dto.getMaxPilgrim() != null) {
            agency.setMax_pilgrim(dto.getMaxPilgrim());
        } else if (agency.getMax_pilgrim() == null) {
            agency.setMax_pilgrim(0);
        }
        agency.setNotes(dto.getNotes());

        if (dto.getManagerEmail() == null || dto.getManagerEmail().isBlank()) {
            throw new ApiException("Group manager email is required");
        }

        User manager = agency.getManager();
        if (manager == null) {
            if (userRepository.findUserByEmail(dto.getManagerEmail()) != null) {
                throw new ApiException("Manager email already exists");
            }
            manager = new User();
        } else if (!manager.getEmail().equalsIgnoreCase(dto.getManagerEmail())) {
            User existing = userRepository.findUserByEmail(dto.getManagerEmail());
            if (existing != null && !existing.getId().equals(manager.getId())) {
                throw new ApiException("Manager email already exists");
            }
        }

        manager.setName(dto.getManagerName());
        manager.setEmail(dto.getManagerEmail());
        manager.setPhone(dto.getManagerPhone());
        if ((isCreate || (dto.getManagerPassword() != null && !dto.getManagerPassword().isBlank()))) {
            if (dto.getManagerPassword() == null || dto.getManagerPassword().isBlank()) {
                throw new ApiException("Manager password is required");
            }
            manager.setPassword(passwordEncoder.encode(dto.getManagerPassword()));
        }
        manager.setRole("Supervisor");
        manager = userRepository.save(manager);
        agency.setManager(manager);
    }
}
