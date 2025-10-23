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
import com.example.wafd.Util.RegistrationNumberGenerator;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PilgrimService {

    private final PilgrimRepository pilgrimRepository;
    private final UserRepository userRepository;
    private final AgencyRepository agencyRepository;
    private final RegistrationNumberGenerator registrationNumberGenerator;
    private final PasswordEncoder passwordEncoder;

    @Cacheable("pilgrims")
    public List<PilgrimDTOOut> getAllPilgrims(){
        return pilgrimRepository.findAllWithDetails().stream()
            .map(PilgrimDTOOut::fromEntity)
            .collect(Collectors.toList());
    }

    public Page<Pilgrim> getAllPilgrims(Pageable pageable){
        return pilgrimRepository.findAllWithDetails(pageable);
    }

    @CacheEvict(value = "pilgrims", allEntries = true)
    public Pilgrim addPilgrim(PilgrimDTOIn pilgrimDTOIn){
        // Generate user fields if not provided
        String userName = pilgrimDTOIn.getName() != null ? pilgrimDTOIn.getName() :
            (pilgrimDTOIn.getFirstName() != null && pilgrimDTOIn.getLastName() != null)
                ? pilgrimDTOIn.getFirstName() + " " + pilgrimDTOIn.getLastName()
                : "Pilgrim";

        String userEmail = pilgrimDTOIn.getEmail() != null ? pilgrimDTOIn.getEmail() :
            (pilgrimDTOIn.getNationalId() != null ? pilgrimDTOIn.getNationalId() + "@pilgrim.local" : "pilgrim@local");

        // Ensure phone has country code format
        String userPhone = pilgrimDTOIn.getPhone() != null ? pilgrimDTOIn.getPhone() :
            (pilgrimDTOIn.getPhoneNumber() != null && pilgrimDTOIn.getPhoneNumber().startsWith("+")
                ? pilgrimDTOIn.getPhoneNumber()
                : "+966" + (pilgrimDTOIn.getPhoneNumber() != null ? pilgrimDTOIn.getPhoneNumber() : "500000000"));

        // Password with encoding
        String rawPassword = pilgrimDTOIn.getPassword() != null ? pilgrimDTOIn.getPassword() : "Default@123";
        String encodedPassword = passwordEncoder.encode(rawPassword);

        // Convert gender from "male"/"female" to "M"/"F"
        String genderCode = "male".equalsIgnoreCase(pilgrimDTOIn.getGender()) ? "M" : "F";

        // Calculate date of birth from age
        LocalDate dateOfBirth;
        if (pilgrimDTOIn.getAge() != null) {
            dateOfBirth = LocalDate.now().minusYears(pilgrimDTOIn.getAge());
        } else {
            dateOfBirth = LocalDate.now().minusYears(30);
        }

        User user = new User(null, userName, userEmail, userPhone, encodedPassword, "Pilgrim", null, null, null);

        String registrationNumber = registrationNumberGenerator.generate();
        String nationalId = pilgrimDTOIn.getNationalId() != null ? pilgrimDTOIn.getNationalId() :
                           (pilgrimDTOIn.getPassportNumber() != null ? pilgrimDTOIn.getPassportNumber() : "00000000");
        String passportNumber = pilgrimDTOIn.getPassportNumber() != null ? pilgrimDTOIn.getPassportNumber() : "00000000";

        Pilgrim pilgrim = new Pilgrim(null, registrationNumber, nationalId, passportNumber,
                pilgrimDTOIn.getNationality(), dateOfBirth, genderCode, "Registered", null, null, user);

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
            user.setPassword(passwordEncoder.encode(pilgrimDTOIn.getPassword()));
        }

        // Update pilgrim fields
        if (pilgrimDTOIn.getPassportNumber() != null) {
            pilgrim.setPassport_number(pilgrimDTOIn.getPassportNumber());
        }

        if (pilgrimDTOIn.getNationality() != null) {
            pilgrim.setNationality(pilgrimDTOIn.getNationality());
        }

        if (pilgrimDTOIn.getAge() != null) {
            LocalDate dateOfBirth = LocalDate.now().minusYears(pilgrimDTOIn.getAge());
            pilgrim.setDate_of_birth(dateOfBirth);
        }

        if (pilgrimDTOIn.getGender() != null) {
            String genderCode = "male".equalsIgnoreCase(pilgrimDTOIn.getGender()) ? "M" : "F";
            pilgrim.setGender(genderCode);
        }

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
    public PilgrimDTOOut getPilgrimById(Integer id){
        Pilgrim pilgrim = pilgrimRepository.findByIdWithDetails(id).orElse(null);
        if (pilgrim == null) {
            throw new ApiException("Pilgrim not found");
        }
        return PilgrimDTOOut.fromEntity(pilgrim);
    }

}
