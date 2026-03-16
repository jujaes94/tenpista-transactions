package com.tenpistas.transactions.repository;

import com.tenpistas.transactions.entity.Transaction;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Integer> {

    long countByUser_Id(Integer userId);

    @EntityGraph(attributePaths = { "status", "user" })
    List<Transaction> findByUser_IdAndIsActiveTrue(Integer userId);

    @EntityGraph(attributePaths = { "status", "user" })
    Optional<Transaction> findByIdAndIsActiveTrue(Integer id);

    @EntityGraph(attributePaths = { "status", "user" })
    List<Transaction> findByIsActiveTrue();
}
