package com.tenpistas.transactions.repository;

import com.tenpistas.transactions.entity.TransactionStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface TransactionStatusRepository extends JpaRepository<TransactionStatus, Integer> {
    Optional<TransactionStatus> findByName(String name);
}
