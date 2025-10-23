package com.example.wafd.Service;

import com.example.wafd.Api.ApiException;
import com.example.wafd.DTO.PilgrimDTOIn;
import com.example.wafd.DTO.PilgrimDTOOut;
import com.example.wafd.Model.Agency;
import com.example.wafd.Model.Pilgrim;
import com.example.wafd.Repository.AgencyRepository;
import com.example.wafd.Repository.PilgrimRepository;
import com.example.wafd.Util.RegistrationNumberGenerator;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PilgrimService {

    private final PilgrimRepository pilgrimRepository;
    private final AgencyRepository agencyRepository;
    private final RegistrationNumberGenerator registrationNumberGenerator;
    private final AuthenticationService authenticationService;

    @Cacheable("pilgrims")
    public List<PilgrimDTOOut> getAllPilgrims() {
        var currentUser = authenticationService.getCurrentUser();
        List<Pilgrim> pilgrims;

        if ("Supervisor".equals(currentUser.getRole()) && currentUser.getManagedAgency() != null) {
            Integer agencyId = currentUser.getManagedAgency().getId();
            pilgrims = pilgrimRepository.findByAgencyId(agencyId);
        } else {
            pilgrims = pilgrimRepository.findAllWithDetails();
        }

        return pilgrims.stream()
                .map(PilgrimDTOOut::fromEntity)
                .collect(Collectors.toList());
    }

    public Page<PilgrimDTOOut> getAllPilgrims(Pageable pageable) {
        var currentUser = authenticationService.getCurrentUser();

        if ("Supervisor".equals(currentUser.getRole()) && currentUser.getManagedAgency() != null) {
            Integer agencyId = currentUser.getManagedAgency().getId();
            return pilgrimRepository.findByAgencyIdWithDetails(agencyId, pageable)
                    .map(PilgrimDTOOut::fromEntity);
        }

        return pilgrimRepository.findAllWithDetails(pageable)
                .map(PilgrimDTOOut::fromEntity);
    }

    @CacheEvict(value = "pilgrims", allEntries = true)
    public PilgrimDTOOut addPilgrim(PilgrimDTOIn pilgrimDTOIn) {
        String registrationNumber = registrationNumberGenerator.generate();
        var currentUser = authenticationService.getCurrentUser();

        Pilgrim pilgrim = new Pilgrim();
        pilgrim.setRegistrationNumber(registrationNumber);
        pilgrim.setNationalId(resolveNationalId(pilgrimDTOIn, registrationNumber));
        pilgrim.setPassportNumber(pilgrimDTOIn.getPassportNumber());
        pilgrim.setFirstName(Objects.requireNonNullElse(pilgrimDTOIn.getFirstName(), ""));
        pilgrim.setLastName(Objects.requireNonNullElse(pilgrimDTOIn.getLastName(), ""));
        pilgrim.setGender(normalizeGender(pilgrimDTOIn.getGender()));
        Integer age = pilgrimDTOIn.getAge();
        pilgrim.setAge(age != null ? age : 0);
        pilgrim.setNationality(Objects.requireNonNullElse(pilgrimDTOIn.getNationality(), ""));
        pilgrim.setPhoneNumber(Objects.requireNonNullElse(pilgrimDTOIn.getPhoneNumber(), ""));
        pilgrim.setHasSpecialNeeds(Boolean.TRUE.equals(pilgrimDTOIn.getHasSpecialNeeds()));
        pilgrim.setSpecialNeedsType(pilgrimDTOIn.getSpecialNeedsType());
        pilgrim.setSpecialNeedsNotes(pilgrimDTOIn.getSpecialNeedsNotes());
        pilgrim.setNotes(pilgrimDTOIn.getNotes());
        pilgrim.setStatus(normalizeStatus(pilgrimDTOIn.getStatus()));

        // Supervisors can only add pilgrims to their own agency
        if ("Supervisor".equals(currentUser.getRole()) && currentUser.getManagedAgency() != null) {
            pilgrim.setAgency(currentUser.getManagedAgency());
        } else {
            pilgrim.setAgency(resolveGroup(pilgrimDTOIn.getGroupId()));
        }

        Pilgrim savedPilgrim = pilgrimRepository.save(pilgrim);
        return PilgrimDTOOut.fromEntity(savedPilgrim);
    }

    public void addPilgrimToGroup(Integer pilgrimId, Integer groupId) {
        Pilgrim pilgrim = pilgrimRepository.findPilgrimById(pilgrimId);
        if (pilgrim == null) {
            throw new ApiException("Pilgrim not found");
        }

        Agency agency = agencyRepository.findAgencyById(groupId);
        if (agency == null) {
            throw new ApiException("Group not found");
        }

        if (agency.getPilgrims().size() >= agency.getMax_pilgrim()) {
            throw new ApiException("Group is full");
        }

        pilgrim.setAgency(agency);
        pilgrimRepository.save(pilgrim);
    }

    @CacheEvict(value = "pilgrims", allEntries = true)
    public void updatePilgrim(Integer id, PilgrimDTOIn pilgrimDTOIn) {
        var currentUser = authenticationService.getCurrentUser();
        if ("Supervisor".equals(currentUser.getRole())) {
            throw new ApiException("Supervisors are not allowed to edit pilgrims");
        }

        Pilgrim pilgrim = pilgrimRepository.findPilgrimById(id);
        if (pilgrim == null) {
            throw new ApiException("Pilgrim not found");
        }

        if (pilgrimDTOIn.getFirstName() != null) {
            pilgrim.setFirstName(pilgrimDTOIn.getFirstName());
        }
        if (pilgrimDTOIn.getLastName() != null) {
            pilgrim.setLastName(pilgrimDTOIn.getLastName());
        }
        if (pilgrimDTOIn.getNationalId() != null) {
            pilgrim.setNationalId(pilgrimDTOIn.getNationalId());
        }
        if (pilgrimDTOIn.getPassportNumber() != null) {
            pilgrim.setPassportNumber(pilgrimDTOIn.getPassportNumber());
        }
        if (pilgrimDTOIn.getAge() != null) {
            pilgrim.setAge(pilgrimDTOIn.getAge());
        }
        if (pilgrimDTOIn.getGender() != null) {
            pilgrim.setGender(normalizeGender(pilgrimDTOIn.getGender()));
        }
        if (pilgrimDTOIn.getNationality() != null) {
            pilgrim.setNationality(pilgrimDTOIn.getNationality());
        }
        if (pilgrimDTOIn.getPhoneNumber() != null) {
            pilgrim.setPhoneNumber(pilgrimDTOIn.getPhoneNumber());
        }
        if (pilgrimDTOIn.getHasSpecialNeeds() != null) {
            pilgrim.setHasSpecialNeeds(pilgrimDTOIn.getHasSpecialNeeds());
        }
        if (pilgrimDTOIn.getSpecialNeedsType() != null) {
            pilgrim.setSpecialNeedsType(pilgrimDTOIn.getSpecialNeedsType());
        }
        if (pilgrimDTOIn.getSpecialNeedsNotes() != null) {
            pilgrim.setSpecialNeedsNotes(pilgrimDTOIn.getSpecialNeedsNotes());
        }
        if (pilgrimDTOIn.getNotes() != null) {
            pilgrim.setNotes(pilgrimDTOIn.getNotes());
        }
        if (pilgrimDTOIn.getStatus() != null) {
            pilgrim.setStatus(normalizeStatus(pilgrimDTOIn.getStatus()));
        }

        if (pilgrimDTOIn.getGroupId() != null) {
            pilgrim.setAgency(resolveGroup(pilgrimDTOIn.getGroupId()));
        }

        pilgrimRepository.save(pilgrim);
    }

    @CacheEvict(value = "pilgrims", allEntries = true)
    public void deletePilgrim(Integer id) {
        var currentUser = authenticationService.getCurrentUser();
        if ("Supervisor".equals(currentUser.getRole())) {
            throw new ApiException("Supervisors are not allowed to delete pilgrims");
        }

        Pilgrim pilgrim = pilgrimRepository.findPilgrimById(id);
        if (pilgrim == null) {
            throw new ApiException("Pilgrim not found");
        }
        pilgrimRepository.delete(pilgrim);
    }

    @Cacheable(value = "pilgrims", key = "#id")
    public PilgrimDTOOut getPilgrimById(Integer id) {
        Pilgrim pilgrim = pilgrimRepository.findByIdWithDetails(id).orElse(null);
        if (pilgrim == null) {
            throw new ApiException("Pilgrim not found");
        }
        return PilgrimDTOOut.fromEntity(pilgrim);
    }

    private String normalizeGender(String gender) {
        if (gender == null) {
            return "male";
        }
        if (gender.equalsIgnoreCase("female") || gender.equalsIgnoreCase("f")) {
            return "female";
        }
        return "male";
    }

    private String normalizeStatus(String status) {
        if (status == null) {
            return "expected";
        }
        return switch (status.toLowerCase()) {
            case "registered", "expected" -> "expected";
            case "arrived" -> "arrived";
            case "departed" -> "departed";
            case "no_show", "no-show", "cancelled" -> "no_show";
            default -> "expected";
        };
    }

    private String resolveNationalId(PilgrimDTOIn pilgrimDTOIn, String fallback) {
        if (pilgrimDTOIn.getNationalId() != null && !pilgrimDTOIn.getNationalId().isBlank()) {
            return pilgrimDTOIn.getNationalId();
        }
        if (pilgrimDTOIn.getPassportNumber() != null && !pilgrimDTOIn.getPassportNumber().isBlank()) {
            return pilgrimDTOIn.getPassportNumber();
        }
        return Objects.requireNonNullElse(fallback, "PILGRIM");
    }

    private Agency resolveGroup(Integer groupId) {
        if (groupId == null) {
            throw new ApiException("Group is required");
        }
        Agency agency = agencyRepository.findAgencyById(groupId);
        if (agency == null) {
            throw new ApiException("Group not found");
        }
        return agency;
    }
}
