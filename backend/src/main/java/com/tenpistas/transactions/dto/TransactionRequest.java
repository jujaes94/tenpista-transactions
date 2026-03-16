package com.tenpistas.transactions.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record TransactionRequest(
    @NotNull(message = "Amount is required")
    @Min(value = 1, message = "Amount must be positive")
    Integer amount,

    @NotBlank(message = "Merchant is required")
    String merchant,

    @Size(max = 500, message = "Description cannot exceed 500 characters")
    String description,

    Integer statusId
) {}