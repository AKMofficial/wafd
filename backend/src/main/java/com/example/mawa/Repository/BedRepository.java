package com.example.mawa.Repository;

import com.example.mawa.Model.Bed;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BedRepository extends JpaRepository<Bed, Integer> {
    Bed findBedById(Integer id);
}
