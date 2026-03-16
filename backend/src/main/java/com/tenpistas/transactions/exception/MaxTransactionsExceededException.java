package com.tenpistas.transactions.exception;

public class MaxTransactionsExceededException extends RuntimeException {
    public MaxTransactionsExceededException(String message) {
        super(message);
    }
}
