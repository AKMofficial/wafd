package com.example.wafd.Util;

import com.example.wafd.Repository.PilgrimRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.time.LocalDate;

@Component
@RequiredArgsConstructor
public class RegistrationNumberGenerator {

    private final PilgrimRepository pilgrimRepository;

    public String generate() {
        int hijriYear = getHijriYear();
        String latestRegNo = pilgrimRepository.findLatestRegistrationNumber();
        int sequence = extractSequence(latestRegNo) + 1;
        return String.format("H%d%06d", hijriYear, sequence);
    }

    private int getHijriYear() {
        return LocalDate.now().getYear() - 579;
    }

    private int extractSequence(String regNo) {
        if (regNo == null) return 0;
        return Integer.parseInt(regNo.substring(regNo.length() - 6));
    }
}