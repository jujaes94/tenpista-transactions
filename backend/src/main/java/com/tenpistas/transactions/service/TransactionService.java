package com.tenpistas.transactions.service;

import com.tenpistas.transactions.dto.TransactionRequest;
import com.tenpistas.transactions.dto.TransactionResponse;
import com.tenpistas.transactions.entity.Role;
import com.tenpistas.transactions.entity.Transaction;
import com.tenpistas.transactions.entity.TransactionStatus;
import com.tenpistas.transactions.entity.User;
import com.tenpistas.transactions.exception.MaxTransactionsExceededException;
import com.tenpistas.transactions.exception.ResourceNotFoundException;
import com.tenpistas.transactions.repository.TransactionRepository;
import com.tenpistas.transactions.repository.TransactionStatusRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final TransactionStatusRepository transactionStatusRepository;
    private static final int MAX_TRANSACTIONS_PER_USER = 100;

    @Transactional(readOnly = true)
    public List<TransactionResponse> getAllTransactions(User currentUser) {
        List<Transaction> transactions;
        if (currentUser.getRole() == Role.ADMIN) {
            transactions = transactionRepository.findByIsActiveTrue();
        } else {
            transactions = transactionRepository.findByUser_IdAndIsActiveTrue(currentUser.getId());
        }
        return transactions.stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<TransactionResponse> getTransactionsByUserId(Integer userId, User currentUser) {
        if (currentUser.getRole() != Role.ADMIN) {
            throw new ResourceNotFoundException("Access denied");
        }

        List<Transaction> transactions = transactionRepository.findByUser_IdAndIsActiveTrue(userId);
        return transactions.stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public TransactionResponse getTransactionById(Integer id, User currentUser) {
        Transaction transaction = transactionRepository.findByIdAndIsActiveTrue(id)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found with id: " + id));

        if (currentUser.getRole() != Role.ADMIN && !transaction.getUser().getId().equals(currentUser.getId())) {
            throw new ResourceNotFoundException("Transaction not found with id: " + id);
        }

        return toResponse(transaction);
    }

    @Transactional
    public TransactionResponse createTransaction(TransactionRequest request, User currentUser) {
        long currentCount = transactionRepository.countByUser_Id(currentUser.getId());

        if (currentCount >= MAX_TRANSACTIONS_PER_USER) {
            throw new MaxTransactionsExceededException(
                    "User " + currentUser.getUsername() + " has reached the maximum limit of " + MAX_TRANSACTIONS_PER_USER + " transactions.");
        }

        TransactionStatus status;
        if (request.statusId() != null) {
            status = transactionStatusRepository.findById(request.statusId())
                    .orElseThrow(() -> new ResourceNotFoundException("Status not found with id: " + request.statusId()));
        } else {
            status = transactionStatusRepository.findByName("PENDING")
                    .orElseThrow(() -> new ResourceNotFoundException("Status PENDING not found"));
        }

        Transaction transaction = Transaction.builder()
                .amount(request.amount())
                .merchant(request.merchant())
                .user(currentUser)
                .transactionDate(request.transactionDate())
                .status(status)
                .build();

        Transaction saved = transactionRepository.save(transaction);
        return toResponse(saved);
    }

    @Transactional
    public TransactionResponse updateTransaction(Integer id, TransactionRequest request, User currentUser) {
        Transaction existingTransaction = transactionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found with id: " + id));

        if (currentUser.getRole() != Role.ADMIN && !existingTransaction.getUser().getUsername().equals(currentUser.getUsername())) {
            throw new ResourceNotFoundException("Transaction not found with id: " + id);
        }

        existingTransaction.setAmount(request.amount());
        existingTransaction.setMerchant(request.merchant());

        if (request.statusId() != null) {
            TransactionStatus status = transactionStatusRepository.findById(request.statusId())
                    .orElseThrow(() -> new ResourceNotFoundException("Status not found with id: " + request.statusId()));
            existingTransaction.setStatus(status);
        }

        Transaction saved = transactionRepository.save(existingTransaction);
        return toResponse(saved);
    }

    @Transactional
    public TransactionResponse updateTransactionStatus(Integer id, Integer statusId, User currentUser) {
        if (currentUser.getRole() != Role.ADMIN) {
            throw new ResourceNotFoundException("Access denied");
        }

        Transaction existingTransaction = transactionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found with id: " + id));

        TransactionStatus status = transactionStatusRepository.findById(statusId)
                .orElseThrow(() -> new ResourceNotFoundException("Status not found with id: " + statusId));

        existingTransaction.setStatus(status);

        Transaction saved = transactionRepository.save(existingTransaction);
        return toResponse(saved);
    }

    @Transactional
    public void deleteTransaction(Integer id, User currentUser) {
        Transaction transaction = transactionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found with id: " + id));

        if (currentUser.getRole() != Role.ADMIN && !transaction.getUser().getUsername().equals(currentUser.getUsername())) {
            throw new ResourceNotFoundException("Transaction not found with id: " + id);
        }

        transaction.setActive(false);

        transactionRepository.save(transaction);
    }

    private TransactionResponse toResponse(Transaction transaction) {
        TransactionStatus status = transaction.getStatus();
        TransactionResponse.TransactionStatusDto statusDto = null;

        if (status != null) {
            statusDto = new TransactionResponse.TransactionStatusDto(
                    status.getId(),
                    status.getName(),
                    status.getDescription()
            );
        }

        return new TransactionResponse(
                transaction.getId(),
                transaction.getAmount(),
                transaction.getMerchant(),
                transaction.getUser().getUsername(),
                transaction.getTransactionDate(),
                statusDto
        );
    }
}