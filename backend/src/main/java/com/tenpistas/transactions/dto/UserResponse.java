package com.tenpistas.transactions.dto;

public record UserResponse(
    Integer id,
    String username,
    String role
) {}