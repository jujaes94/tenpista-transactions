package com.tenpistas.transactions.dto;

import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;

public record TransactionRequest(
    @NotNull(message = "Amount is required")
    @Min(value = 1, message = "Amount must be positive")
    Integer amount,

    @NotBlank(message = "Merchant is required")
    String merchant,

    @NotNull(message = "Transaction date is required")
    @FutureOrPresent(message = "Transaction date cannot be in the past")
    LocalDateTime transactionDate,

    Integer statusId
) {}