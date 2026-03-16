package com.tenpistas.transactions.controller;

import com.tenpistas.transactions.dto.TransactionRequest;
import com.tenpistas.transactions.dto.TransactionResponse;
import com.tenpistas.transactions.dto.TransactionStatusUpdateRequest;
import com.tenpistas.transactions.entity.User;
import com.tenpistas.transactions.service.TransactionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/transaction")
@RequiredArgsConstructor
public class TransactionController {

    private final TransactionService transactionService;

    @GetMapping
    public ResponseEntity<List<TransactionResponse>> getAllTransactions(@AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(transactionService.getAllTransactions(currentUser));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<TransactionResponse>> getTransactionsByUserId(
            @PathVariable Integer userId,
            @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(transactionService.getTransactionsByUserId(userId, currentUser));
    }

    @GetMapping("/{id}")
    public ResponseEntity<TransactionResponse> getTransactionById(@PathVariable Integer id, @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(transactionService.getTransactionById(id, currentUser));
    }

    @PostMapping
    public ResponseEntity<TransactionResponse> createTransaction(@Valid @RequestBody TransactionRequest request, @AuthenticationPrincipal User currentUser) {
        TransactionResponse created = transactionService.createTransaction(request, currentUser);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<TransactionResponse> updateTransaction(@PathVariable Integer id, @Valid @RequestBody TransactionRequest request, @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(transactionService.updateTransaction(id, request, currentUser));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<TransactionResponse> updateTransactionStatus(
            @PathVariable Integer id,
            @Valid @RequestBody TransactionStatusUpdateRequest request,
            @AuthenticationPrincipal User currentUser
    ) {
        return ResponseEntity.ok(transactionService.updateTransactionStatus(id, request.statusId(), currentUser));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTransaction(@PathVariable Integer id, @AuthenticationPrincipal User currentUser) {
        transactionService.deleteTransaction(id, currentUser);
        return ResponseEntity.noContent().build();
    }
}