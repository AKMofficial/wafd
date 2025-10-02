package com.example.wafd.Service;

import com.example.wafd.Api.ApiException;
import com.example.wafd.DTO.PilgrimDTOIn;
import com.example.wafd.DTO.PilgrimDTOOut;
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
public class PilgrimService {

    private final PilgrimRepository pilgrimRepository;
    private final UserRepository userRepository;
    private final AgencyRepository agencyRepository;

    public List<PilgrimDTOOut> getAllPilgrims(){
        return pilgrimRepository.findAll().stream()
            .map(PilgrimDTOOut::fromEntity)
            .collect(Collectors.toList());
    }

    public void addPilgrim(PilgrimDTOIn pilgrimDTOIn){
        // Generate user fields if not provided
        String userName = pilgrimDTOIn.getName() != null ? pilgrimDTOIn.getName() :
            pilgrimDTOIn.getFirstName() + " " + pilgrimDTOIn.getLastName();

        String userEmail = pilgrimDTOIn.getEmail() != null ? pilgrimDTOIn.getEmail() :
            pilgrimDTOIn.getNationalId() + "@pilgrim.local";

        // Ensure phone has country code format
        String userPhone = pilgrimDTOIn.getPhone() != null ? pilgrimDTOIn.getPhone() :
            (pilgrimDTOIn.getPhoneNumber() != null && pilgrimDTOIn.getPhoneNumber().startsWith("+")
                ? pilgrimDTOIn.getPhoneNumber()
                : "+966" + (pilgrimDTOIn.getPhoneNumber() != null ? pilgrimDTOIn.getPhoneNumber() : "500000000"));

        // Password with special character, 8-20 chars
        String userPassword = pilgrimDTOIn.getPassword() != null ? pilgrimDTOIn.getPassword() :
            "Default@123";

        // Convert gender from "male"/"female" to "M"/"F"
        String genderCode = "male".equalsIgnoreCase(pilgrimDTOIn.getGender()) ? "M" : "F";

        // Calculate date of birth from age (approximate)
        java.time.LocalDate dateOfBirth = java.time.LocalDate.now().minusYears(
            pilgrimDTOIn.getAge() != null ? pilgrimDTOIn.getAge() : 30
        );

        User user = new User(null, userName, userEmail, userPhone, userPassword, "Pilgrim", null, null, null);
        Pilgrim pilgrim = new Pilgrim(null,
            pilgrimDTOIn.getPassportNumber() != null ? pilgrimDTOIn.getPassportNumber() : "00000000",
            pilgrimDTOIn.getNationality(),
            dateOfBirth,
            genderCode,
            "Registered",
            null, null, user);

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

        // Update user fields if provided
        if (pilgrimDTOIn.getName() != null) {
            user.setName(pilgrimDTOIn.getName());
        } else if (pilgrimDTOIn.getFirstName() != null && pilgrimDTOIn.getLastName() != null) {
            user.setName(pilgrimDTOIn.getFirstName() + " " + pilgrimDTOIn.getLastName());
        }

        if (pilgrimDTOIn.getEmail() != null) {
            user.setEmail(pilgrimDTOIn.getEmail());
        }

        if (pilgrimDTOIn.getPhone() != null) {
            user.setPhone(pilgrimDTOIn.getPhone());
        } else if (pilgrimDTOIn.getPhoneNumber() != null) {
            user.setPhone(pilgrimDTOIn.getPhoneNumber());
        }

        if (pilgrimDTOIn.getPassword() != null) {
            user.setPassword(pilgrimDTOIn.getPassword());
        }

        // Update pilgrim fields
        if (pilgrimDTOIn.getPassportNumber() != null) {
            pilgrim.setPassport_number(pilgrimDTOIn.getPassportNumber());
        }

        if (pilgrimDTOIn.getNationality() != null) {
            pilgrim.setNationality(pilgrimDTOIn.getNationality());
        }

        if (pilgrimDTOIn.getAge() != null) {
            java.time.LocalDate dateOfBirth = java.time.LocalDate.now().minusYears(pilgrimDTOIn.getAge());
            pilgrim.setDate_of_birth(dateOfBirth);
        }

        if (pilgrimDTOIn.getGender() != null) {
            String genderCode = "male".equalsIgnoreCase(pilgrimDTOIn.getGender()) ? "M" : "F";
            pilgrim.setGender(genderCode);
        }

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

    public PilgrimDTOOut getPilgrimById(Integer id){
        Pilgrim pilgrim = pilgrimRepository.findPilgrimById(id);
        if (pilgrim == null) {
            throw new ApiException("Pilgrim not found");
        }
        return PilgrimDTOOut.fromEntity(pilgrim);
    }



}
