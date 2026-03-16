package com.tenpistas.transactions.dto;

public record AuthResponse(
    String token,
    String username,
    String role
) {}