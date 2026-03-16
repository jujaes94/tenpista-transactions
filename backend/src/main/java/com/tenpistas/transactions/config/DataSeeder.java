package com.tenpistas.transactions.config;

import com.tenpistas.transactions.entity.TransactionStatus;
import com.tenpistas.transactions.repository.TransactionStatusRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final TransactionStatusRepository statusRepository;

    @Override
    public void run(String... args) {
        seedStatus("PENDING", "Transaction is pending processing");
        seedStatus("COMPLETED", "Transaction has been completed successfully");
        seedStatus("CANCELLED", "Transaction has been cancelled");
        seedStatus("FAILED", "Transaction has failed");
    }

    private void seedStatus(String name, String description) {
        if (statusRepository.findByName(name).isEmpty()) {
            statusRepository.save(
                    TransactionStatus.builder()
                            .name(name)
                            .description(description)
                            .build()
            );
        }
    }
}
