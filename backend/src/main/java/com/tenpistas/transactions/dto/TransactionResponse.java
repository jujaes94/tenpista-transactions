package com.tenpistas.transactions.dto;

import java.time.LocalDateTime;

public record TransactionResponse(
    Integer id,
    Integer amount,
    String merchant,
    String userName,
    LocalDateTime transactionDate,
    TransactionStatusDto status
) {
    public record TransactionStatusDto(
        Integer id,
        String name,
        String description
    ) {}
}