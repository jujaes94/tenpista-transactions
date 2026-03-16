package com.tenpistas.transactions.dto;

import jakarta.validation.constraints.NotNull;

public record TransactionStatusUpdateRequest(
        @NotNull(message = "statusId is required")
        Integer statusId
) {}

