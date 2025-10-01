package com.example.mawa.Service;

import com.example.mawa.Api.ApiException;
import com.example.mawa.Model.Agency;
import com.example.mawa.Repository.AgencyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AgencyService {

    private final AgencyRepository agencyRepository;

    public List<Agency> findAllAgencies(){
        return agencyRepository.findAll();
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
}
