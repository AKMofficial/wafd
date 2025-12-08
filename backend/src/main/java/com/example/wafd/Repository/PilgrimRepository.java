package com.example.wafd.Repository;

import com.example.wafd.Model.Pilgrim;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PilgrimRepository extends JpaRepository<Pilgrim, Integer> {
    Pilgrim findPilgrimById(Integer id);

    Optional<Pilgrim> findByNationalId(String nationalId);

    Optional<Pilgrim> findByRegistrationNumber(String registrationNumber);

    @Query(value = "SELECT p.registration_number FROM pilgrim p ORDER BY p.registration_number DESC LIMIT 1", nativeQuery = true)
    String findLatestRegistrationNumber();

    long countByStatus(String status);

    long countByGender(String gender);

    @Query("SELECT COUNT(p) FROM Pilgrim p WHERE p.status IN :statuses")
    long countByStatuses(@Param("statuses") List<String> statuses);

    @Query("SELECT p.nationality, COUNT(p) FROM Pilgrim p GROUP BY p.nationality")
    List<Object[]> countByNationality();

    @Query(value = "SELECT CASE\n            WHEN p.age < 30 THEN '18-29'\n            WHEN p.age < 50 THEN '30-49'\n            WHEN p.age < 70 THEN '50-69'\n            ELSE '70+'\n        END AS age_group, COUNT(*)\n        FROM pilgrim p\n        GROUP BY age_group", nativeQuery = true)
    List<Object[]> countByAgeGroup();

    // Optimized query with JOIN FETCH to avoid N+1 problem
    @Query("SELECT DISTINCT p FROM Pilgrim p " +
           "LEFT JOIN FETCH p.agency a " +
           "LEFT JOIN FETCH p.booking b " +
           "LEFT JOIN FETCH b.bed bed")
    List<Pilgrim> findAllWithDetails();

    // Optimized paginated query
    @Query(value = "SELECT DISTINCT p FROM Pilgrim p " +
                   "LEFT JOIN FETCH p.agency a " +
                   "LEFT JOIN FETCH p.booking b " +
                   "LEFT JOIN FETCH b.bed bed",
           countQuery = "SELECT COUNT(DISTINCT p) FROM Pilgrim p")
    Page<Pilgrim> findAllWithDetails(Pageable pageable);

    // Optimized single pilgrim fetch
    @Query("SELECT p FROM Pilgrim p " +
           "LEFT JOIN FETCH p.agency a " +
           "LEFT JOIN FETCH p.booking b " +
           "LEFT JOIN FETCH b.bed bed " +
           "WHERE p.id = :id")
    Optional<Pilgrim> findByIdWithDetails(@Param("id") Integer id);

    // Optimized single pilgrim fetch by ID (non-Optional version)
    @Query("SELECT p FROM Pilgrim p " +
           "LEFT JOIN FETCH p.agency a " +
           "LEFT JOIN FETCH p.booking b " +
           "LEFT JOIN FETCH b.bed bed " +
           "WHERE p.id = :id")
    Pilgrim findPilgrimByIdWithDetails(@Param("id") Integer id);

    // Find pilgrims by agency
    @Query("SELECT p FROM Pilgrim p " +
           "LEFT JOIN FETCH p.booking b " +
           "WHERE p.agency.id = :agencyId")
    List<Pilgrim> findByAgencyId(@Param("agencyId") Integer agencyId);

    // Find pilgrims by agency with pagination
    @Query(value = "SELECT DISTINCT p FROM Pilgrim p " +
                   "LEFT JOIN FETCH p.agency a " +
                   "LEFT JOIN FETCH p.booking b " +
                   "LEFT JOIN FETCH b.bed bed " +
                   "WHERE p.agency.id = :agencyId",
           countQuery = "SELECT COUNT(DISTINCT p) FROM Pilgrim p WHERE p.agency.id = :agencyId")
    Page<Pilgrim> findByAgencyIdWithDetails(@Param("agencyId") Integer agencyId, Pageable pageable);

    long countByAgencyId(Integer agencyId);
}
