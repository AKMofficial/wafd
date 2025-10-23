package com.example.wafd.Repository;

import com.example.wafd.Model.Tent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface TentRepository extends JpaRepository<Tent, Integer> {
    @Query("SELECT DISTINCT t FROM Tent t " +
           "LEFT JOIN FETCH t.beds b " +
           "LEFT JOIN FETCH b.booking bk " +
           "LEFT JOIN FETCH bk.pilgrim p " +
           "LEFT JOIN FETCH p.agency " +
           "WHERE t.id = :id")
    Tent findTentById(@Param("id") Integer id);

    @Query("SELECT DISTINCT t FROM Tent t " +
           "LEFT JOIN FETCH t.beds b " +
           "LEFT JOIN FETCH b.booking bk " +
           "LEFT JOIN FETCH bk.pilgrim p " +
           "LEFT JOIN FETCH p.agency")
    java.util.List<Tent> findAll();
}
