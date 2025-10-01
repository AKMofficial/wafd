package com.example.mawa.Service;

import com.example.mawa.Api.ApiException;
import com.example.mawa.DTO.PilgrimDTOIn;
import com.example.mawa.Model.Agency;
import com.example.mawa.Model.Pilgrim;
import com.example.mawa.Model.User;
import com.example.mawa.Repository.AgencyRepository;
import com.example.mawa.Repository.PilgrimRepository;
import com.example.mawa.Repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PilgrimService {

    private final PilgrimRepository pilgrimRepository;
    private final UserRepository userRepository;
    private final AgencyRepository agencyRepository;

    public List<Pilgrim> getAllPilgrims(){
        return pilgrimRepository.findAll();
    }

    public void addPilgrim(PilgrimDTOIn pilgrimDTOIn){
        User user = new User(null,pilgrimDTOIn.getName(),pilgrimDTOIn.getEmail(),pilgrimDTOIn.getPhone(),pilgrimDTOIn.getPassword(),"Pilgrim",null,null,null);
        Pilgrim pilgrim = new Pilgrim(null,pilgrimDTOIn.getPassportNumber(),pilgrimDTOIn.getNationality(),pilgrimDTOIn.getDateOfBirth(),pilgrimDTOIn.getGender(),"Registered",null,null,user);
        user.setPilgrim(pilgrim);
        pilgrim.setUser(user);
        userRepository.save(user);
        pilgrimRepository.save(pilgrim);
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

    public void updatePilgrim(Integer id, PilgrimDTOIn pilgrimDTOIn){
        Pilgrim pilgrim = pilgrimRepository.findPilgrimById(id);
        if (pilgrim == null){
            throw new ApiException("Pilgrim not found");
        }
        User user = pilgrim.getUser();

        user.setName(pilgrimDTOIn.getName());
        user.setEmail(pilgrimDTOIn.getEmail());
        user.setPhone(pilgrimDTOIn.getPhone());
        user.setPassword(pilgrimDTOIn.getPassword());

        pilgrim.setPassport_number(pilgrimDTOIn.getPassportNumber());
        pilgrim.setNationality(pilgrimDTOIn.getNationality());
        pilgrim.setDate_of_birth(pilgrimDTOIn.getDateOfBirth());
        pilgrim.setGender(pilgrimDTOIn.getGender());

        userRepository.save(user);
        pilgrimRepository.save(pilgrim);
    }

    public void deletePilgrim(Integer id){
        Pilgrim pilgrim = pilgrimRepository.findPilgrimById(id);
        if (pilgrim == null){
            throw new ApiException("Pilgrim not found");
        }
        pilgrimRepository.delete(pilgrim);
    }

    public Pilgrim getPilgrimById(Integer id){
        return pilgrimRepository.findPilgrimById(id);
    }



}
