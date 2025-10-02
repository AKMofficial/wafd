package com.example.wafd.Repository;

import com.example.wafd.Model.Pilgrim;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PilgrimRepository extends JpaRepository<Pilgrim, Integer> {
    Pilgrim findPilgrimById(Integer id);
}
