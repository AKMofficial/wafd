package com.example.wafd.Service;

import com.example.wafd.Api.ApiException;
import com.example.wafd.DTO.PilgrimDTOIn;
import com.example.wafd.Model.Agency;
import com.example.wafd.Model.Pilgrim;
import com.example.wafd.Model.User;
import com.example.wafd.Repository.AgencyRepository;
import com.example.wafd.Repository.PilgrimRepository;
import com.example.wafd.Repository.UserRepository;
import com.example.wafd.Util.RegistrationNumberGenerator;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PilgrimService {

    private final PilgrimRepository pilgrimRepository;
    private final UserRepository userRepository;
    private final AgencyRepository agencyRepository;
    private final RegistrationNumberGenerator registrationNumberGenerator;
    private final PasswordEncoder passwordEncoder;

    @Cacheable("pilgrims")
    public List<Pilgrim> getAllPilgrims(){
        return pilgrimRepository.findAllWithDetails();
    }

    public Page<Pilgrim> getAllPilgrims(Pageable pageable){
        return pilgrimRepository.findAllWithDetails(pageable);
    }

    @CacheEvict(value = "pilgrims", allEntries = true)
    public Pilgrim addPilgrim(PilgrimDTOIn pilgrimDTOIn){
        String encodedPassword = passwordEncoder.encode(pilgrimDTOIn.getPassword());
        User user = new User(null,pilgrimDTOIn.getName(),pilgrimDTOIn.getEmail(),pilgrimDTOIn.getPhone(),encodedPassword,"Pilgrim",null,null,null);

        String registrationNumber = registrationNumberGenerator.generate();
        String nationalId = pilgrimDTOIn.getPassportNumber(); // Use passport as national ID for now
        Pilgrim pilgrim = new Pilgrim(null, registrationNumber, nationalId, pilgrimDTOIn.getPassportNumber(),pilgrimDTOIn.getNationality(),pilgrimDTOIn.getDateOfBirth(),pilgrimDTOIn.getGender(),"Registered",null,null,user);

        user.setPilgrim(pilgrim);
        pilgrim.setUser(user);

        // Save user only - cascade will save pilgrim with matching ID due to @MapsId
        userRepository.save(user);

        // Return the saved pilgrim with its generated ID
        return pilgrim;
    }

    public void addPilgrimToAgency(Integer pilgrim_id, Integer agency_id){
        Pilgrim pilgrim = pilgrimRepository.findPilgrimById(pilgrim_id);
        if (pilgrim == null){
            throw new ApiException("Pilgrim not found");
        }
        Agency agency = agencyRepository.findAgencyById(agency_id);
        if (agency == null){
            throw new ApiException("Agency not found");
        }
        if (agency.getPilgrims().size() >= agency.getMax_pilgrim()){
            throw new ApiException("Agency is full");
        }
        pilgrim.setAgency(agency);
        pilgrimRepository.save(pilgrim);
    }

    @CacheEvict(value = "pilgrims", allEntries = true)
    public void updatePilgrim(Integer id, PilgrimDTOIn pilgrimDTOIn){
        Pilgrim pilgrim = pilgrimRepository.findPilgrimById(id);
        if (pilgrim == null){
            throw new ApiException("Pilgrim not found");
        }
        User user = pilgrim.getUser();

        user.setName(pilgrimDTOIn.getName());
        user.setEmail(pilgrimDTOIn.getEmail());
        user.setPhone(pilgrimDTOIn.getPhone());
        user.setPassword(passwordEncoder.encode(pilgrimDTOIn.getPassword()));

        pilgrim.setPassport_number(pilgrimDTOIn.getPassportNumber());
        pilgrim.setNationality(pilgrimDTOIn.getNationality());
        pilgrim.setDate_of_birth(pilgrimDTOIn.getDateOfBirth());
        pilgrim.setGender(pilgrimDTOIn.getGender());

        userRepository.save(user);
        pilgrimRepository.save(pilgrim);
    }

    @CacheEvict(value = "pilgrims", allEntries = true)
    public void deletePilgrim(Integer id){
        Pilgrim pilgrim = pilgrimRepository.findPilgrimById(id);
        if (pilgrim == null){
            throw new ApiException("Pilgrim not found");
        }
        pilgrimRepository.delete(pilgrim);
    }

    @Cacheable(value = "pilgrims", key = "#id")
    public Pilgrim getPilgrimById(Integer id){
        return pilgrimRepository.findByIdWithDetails(id).orElse(null);
    }



}
