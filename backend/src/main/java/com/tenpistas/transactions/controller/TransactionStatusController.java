package com.tenpistas.transactions.controller;

import com.tenpistas.transactions.dto.TransactionStatusResponse;
import com.tenpistas.transactions.repository.TransactionStatusRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/status")
@RequiredArgsConstructor
public class TransactionStatusController {

    private final TransactionStatusRepository transactionStatusRepository;

    @GetMapping
    public ResponseEntity<List<TransactionStatusResponse>> getAllStatuses() {
        List<TransactionStatusResponse> statuses = transactionStatusRepository.findAll().stream()
                .map(status -> new TransactionStatusResponse(status.getId(), status.getName(), status.getDescription()))
                .toList();

        return ResponseEntity.ok(statuses);
    }
}