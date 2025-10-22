package com.example.wafd.Service;

import com.example.wafd.Api.ApiException;
import com.example.wafd.Model.Agency;
import com.example.wafd.Model.Pilgrim;
import com.example.wafd.Repository.AgencyRepository;
import com.example.wafd.Repository.PilgrimRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AgencyService {

    private final AgencyRepository agencyRepository;
    private final PilgrimRepository pilgrimRepository;

    public List<Agency> findAllAgencies(){
        return agencyRepository.findAll();
    }

    public Agency findAgencyById(Integer id){
        return agencyRepository.findAgencyById(id);
    }

    public void addAgency(Agency agency){
        agencyRepository.save(agency);
    }

    public void updateAgency(Agency agency, Integer id){
        Agency agencyToUpdate = agencyRepository.findAgencyById(id);
        if (agencyToUpdate == null){
            throw new ApiException("Agency not found");
        }
        agencyToUpdate.setCountry(agency.getCountry());
        agencyToUpdate.setName(agency.getName());
        agencyToUpdate.setLicense_number(agency.getLicense_number());
        agencyToUpdate.setMax_pilgrim(agency.getMax_pilgrim());
        agencyToUpdate.setStatus(agency.getStatus());
        agencyRepository.save(agencyToUpdate);
    }

    public void deleteAgency(Integer id){
        Agency agencyToDelete = agencyRepository.findAgencyById(id);
        if (agencyToDelete == null){
            throw new ApiException("Agency not found");
        }
        agencyRepository.delete(agencyToDelete);
    }

    public List<Pilgrim> findPilgrimsByAgencyId(Integer agencyId){
        Agency agency = agencyRepository.findAgencyById(agencyId);
        if (agency == null){
            throw new ApiException("Agency not found");
        }
        return pilgrimRepository.findByAgencyId(agencyId);
    }
}
