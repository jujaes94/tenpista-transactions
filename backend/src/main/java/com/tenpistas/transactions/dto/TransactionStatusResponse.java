package com.tenpistas.transactions.dto;

public record TransactionStatusResponse(
    Integer id,
    String name,
    String description
) {}