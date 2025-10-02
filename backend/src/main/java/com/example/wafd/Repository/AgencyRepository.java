package com.example.wafd.Repository;

import com.example.wafd.Model.Agency;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AgencyRepository extends JpaRepository<Agency, Integer> {
    Agency findAgencyById(Integer id);
}
