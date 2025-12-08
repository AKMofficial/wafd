package com.example.wafd.Repository;

import com.example.wafd.Model.Bed;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface BedRepository extends JpaRepository<Bed, Integer> {
    Bed findBedById(Integer id);

    @Query("SELECT b FROM Bed b LEFT JOIN FETCH b.tent WHERE b.id = :id")
    Bed findBedByIdWithTent(@Param("id") Integer id);
}
