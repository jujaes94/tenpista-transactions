package com.tenpistas.transactions.service;

import com.tenpistas.transactions.dto.TransactionRequest;
import com.tenpistas.transactions.dto.TransactionResponse;
import com.tenpistas.transactions.entity.Role;
import com.tenpistas.transactions.entity.Transaction;
import com.tenpistas.transactions.entity.TransactionStatus;
import com.tenpistas.transactions.entity.User;
import com.tenpistas.transactions.exception.AccessDeniedException;
import com.tenpistas.transactions.exception.MaxTransactionsExceededException;
import com.tenpistas.transactions.exception.ResourceNotFoundException;
import com.tenpistas.transactions.repository.TransactionRepository;
import com.tenpistas.transactions.repository.TransactionStatusRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TransactionServiceTest {

    @Mock
    private TransactionRepository transactionRepository;

    @Mock
    private TransactionStatusRepository transactionStatusRepository;

    @InjectMocks
    private TransactionService transactionService;

    private User adminUser;
    private User regularUser;
    private User otherUser;
    private TransactionStatus pendingStatus;
    private TransactionStatus completedStatus;
    private Transaction transaction;

    @BeforeEach
    void setUp() {
        adminUser = User.builder()
                .id(1)
                .username("admin")
                .role(Role.ADMIN)
                .password("encoded")
                .build();

        regularUser = User.builder()
                .id(2)
                .username("user")
                .role(Role.USER)
                .password("encoded")
                .build();

        otherUser = User.builder()
                .id(3)
                .username("other")
                .role(Role.USER)
                .password("encoded")
                .build();

        pendingStatus = TransactionStatus.builder()
                .id(1)
                .name("PENDING")
                .description("Pending transaction")
                .build();

        completedStatus = TransactionStatus.builder()
                .id(2)
                .name("COMPLETED")
                .description("Completed transaction")
                .build();

        transaction = Transaction.builder()
                .id(1)
                .amount(5000)
                .merchant("Amazon")
                .description("Online purchase")
                .user(regularUser)
                .status(pendingStatus)
                .build();
    }

    //  getAllTransactions  

    @Test
    void getAllTransactions_adminUser_returnsAllActiveTransactions() {
        Transaction otherTx = Transaction.builder()
                .id(2).amount(2000).merchant("Spotify").user(otherUser).status(pendingStatus).build();
        when(transactionRepository.findByIsActiveTrue()).thenReturn(List.of(transaction, otherTx));

        List<TransactionResponse> result = transactionService.getAllTransactions(adminUser);

        assertThat(result).hasSize(2);
        verify(transactionRepository).findByIsActiveTrue();
        verify(transactionRepository, never()).findByUser_IdAndIsActiveTrue(any());
    }

    @Test
    void getAllTransactions_regularUser_returnsOnlyOwnTransactions() {
        when(transactionRepository.findByUser_IdAndIsActiveTrue(regularUser.getId()))
                .thenReturn(List.of(transaction));

        List<TransactionResponse> result = transactionService.getAllTransactions(regularUser);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).merchant()).isEqualTo("Amazon");
        verify(transactionRepository).findByUser_IdAndIsActiveTrue(regularUser.getId());
        verify(transactionRepository, never()).findByIsActiveTrue();
    }

    //  getTransactionsByUserId 

    @Test
    void getTransactionsByUserId_adminUser_returnsTransactionsForTargetUser() {
        when(transactionRepository.findByUser_IdAndIsActiveTrue(regularUser.getId()))
                .thenReturn(List.of(transaction));

        List<TransactionResponse> result =
                transactionService.getTransactionsByUserId(regularUser.getId(), adminUser);

        assertThat(result).hasSize(1);
        verify(transactionRepository).findByUser_IdAndIsActiveTrue(regularUser.getId());
    }

    @Test
    void getTransactionsByUserId_nonAdminUser_throwsAccessDeniedException() {
        assertThatThrownBy(() -> transactionService.getTransactionsByUserId(1, regularUser))
                .isInstanceOf(AccessDeniedException.class)
                .hasMessageContaining("admin role required");

        verify(transactionRepository, never()).findByUser_IdAndIsActiveTrue(any());
    }

    //  getTransactionById

    @Test
    void getTransactionById_ownerUser_returnsTransaction() {
        when(transactionRepository.findByIdAndIsActiveTrue(1)).thenReturn(Optional.of(transaction));

        TransactionResponse result = transactionService.getTransactionById(1, regularUser);

        assertThat(result.id()).isEqualTo(1);
        assertThat(result.merchant()).isEqualTo("Amazon");
        assertThat(result.description()).isEqualTo("Online purchase");
        assertThat(result.status().name()).isEqualTo("PENDING");
    }

    @Test
    void getTransactionById_adminUser_returnsAnyTransaction() {
        Transaction otherTx = Transaction.builder()
                .id(2).amount(1000).merchant("Spotify").user(otherUser).status(pendingStatus).build();
        when(transactionRepository.findByIdAndIsActiveTrue(2)).thenReturn(Optional.of(otherTx));

        TransactionResponse result = transactionService.getTransactionById(2, adminUser);

        assertThat(result.id()).isEqualTo(2);
    }

    @Test
    void getTransactionById_transactionNotFound_throwsResourceNotFoundException() {
        when(transactionRepository.findByIdAndIsActiveTrue(99)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> transactionService.getTransactionById(99, regularUser))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("99");
    }

    @Test
    void getTransactionById_differentUser_throwsResourceNotFoundException() {
        when(transactionRepository.findByIdAndIsActiveTrue(1)).thenReturn(Optional.of(transaction));

        assertThatThrownBy(() -> transactionService.getTransactionById(1, otherUser))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    //  createTransaction  

    @Test
    void createTransaction_success_returnsResponseWithDescription() {
        TransactionRequest request = new TransactionRequest(3000, "Netflix", "Monthly subscription", null);
        when(transactionRepository.countByUser_IdAndIsActiveTrue(regularUser.getId())).thenReturn(0L);
        when(transactionStatusRepository.findByName("PENDING")).thenReturn(Optional.of(pendingStatus));
        Transaction saved = Transaction.builder()
                .id(10).amount(3000).merchant("Netflix").description("Monthly subscription")
                .user(regularUser).status(pendingStatus).build();
        when(transactionRepository.save(any(Transaction.class))).thenReturn(saved);

        TransactionResponse result = transactionService.createTransaction(request, regularUser);

        assertThat(result.amount()).isEqualTo(3000);
        assertThat(result.merchant()).isEqualTo("Netflix");
        assertThat(result.description()).isEqualTo("Monthly subscription");
        verify(transactionRepository).save(any(Transaction.class));
    }

    @Test
    void createTransaction_noDescription_returnsResponseWithNullDescription() {
        TransactionRequest request = new TransactionRequest(1000, "Store", null, null);
        when(transactionRepository.countByUser_IdAndIsActiveTrue(regularUser.getId())).thenReturn(5L);
        when(transactionStatusRepository.findByName("PENDING")).thenReturn(Optional.of(pendingStatus));
        Transaction saved = Transaction.builder()
                .id(11).amount(1000).merchant("Store")
                .user(regularUser).status(pendingStatus).build();
        when(transactionRepository.save(any(Transaction.class))).thenReturn(saved);

        TransactionResponse result = transactionService.createTransaction(request, regularUser);

        assertThat(result.description()).isNull();
    }

    @Test
    void createTransaction_maxLimitReached_throwsMaxTransactionsExceededException() {
        TransactionRequest request = new TransactionRequest(100, "Shop", null, null);
        when(transactionRepository.countByUser_IdAndIsActiveTrue(regularUser.getId())).thenReturn(100L);

        assertThatThrownBy(() -> transactionService.createTransaction(request, regularUser))
                .isInstanceOf(MaxTransactionsExceededException.class);

        verify(transactionRepository, never()).save(any());
    }

    @Test
    void createTransaction_withExplicitStatusId_usesProvidedStatus() {
        TransactionRequest request = new TransactionRequest(5000, "Store", null, 2);
        when(transactionRepository.countByUser_IdAndIsActiveTrue(regularUser.getId())).thenReturn(0L);
        when(transactionStatusRepository.findById(2)).thenReturn(Optional.of(completedStatus));
        Transaction saved = Transaction.builder()
                .id(11).amount(5000).merchant("Store").user(regularUser).status(completedStatus).build();
        when(transactionRepository.save(any(Transaction.class))).thenReturn(saved);

        TransactionResponse result = transactionService.createTransaction(request, regularUser);

        assertThat(result.status().name()).isEqualTo("COMPLETED");
        verify(transactionStatusRepository).findById(2);
        verify(transactionStatusRepository, never()).findByName(any());
    }

    @Test
    void createTransaction_statusNotFound_throwsResourceNotFoundException() {
        TransactionRequest request = new TransactionRequest(1000, "Shop", null, 99);
        when(transactionRepository.countByUser_IdAndIsActiveTrue(regularUser.getId())).thenReturn(0L);
        when(transactionStatusRepository.findById(99)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> transactionService.createTransaction(request, regularUser))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("99");
    }

    //  updateTransaction  

    @Test
    void updateTransaction_ownerUser_updatesAllEditableFields() {
        TransactionRequest request = new TransactionRequest(9000, "Updated Merchant", "Updated note", null);
        when(transactionRepository.findById(1)).thenReturn(Optional.of(transaction));
        Transaction saved = Transaction.builder()
                .id(1).amount(9000).merchant("Updated Merchant").description("Updated note")
                .user(regularUser).status(pendingStatus).build();
        when(transactionRepository.save(any(Transaction.class))).thenReturn(saved);

        TransactionResponse result = transactionService.updateTransaction(1, request, regularUser);

        assertThat(result.amount()).isEqualTo(9000);
        assertThat(result.merchant()).isEqualTo("Updated Merchant");
        assertThat(result.description()).isEqualTo("Updated note");
        verify(transactionRepository).save(any(Transaction.class));
    }

    @Test
    void updateTransaction_notFound_throwsResourceNotFoundException() {
        TransactionRequest request = new TransactionRequest(1000, "Shop", null, null);
        when(transactionRepository.findById(99)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> transactionService.updateTransaction(99, request, regularUser))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("99");
    }

    @Test
    void updateTransaction_differentUser_throwsResourceNotFoundException() {
        TransactionRequest request = new TransactionRequest(1000, "Shop", null, null);
        when(transactionRepository.findById(1)).thenReturn(Optional.of(transaction));

        assertThatThrownBy(() -> transactionService.updateTransaction(1, request, otherUser))
                .isInstanceOf(ResourceNotFoundException.class);

        verify(transactionRepository, never()).save(any());
    }

    @Test
    void updateTransaction_adminUser_canUpdateAnyTransaction() {
        TransactionRequest request = new TransactionRequest(7000, "Admin Updated", null, null);
        when(transactionRepository.findById(1)).thenReturn(Optional.of(transaction));
        Transaction saved = Transaction.builder()
                .id(1).amount(7000).merchant("Admin Updated").user(regularUser).status(pendingStatus).build();
        when(transactionRepository.save(any(Transaction.class))).thenReturn(saved);

        TransactionResponse result = transactionService.updateTransaction(1, request, adminUser);

        assertThat(result.amount()).isEqualTo(7000);
    }

    //  updateTransactionStatus

    @Test
    void updateTransactionStatus_adminUser_updatesStatusSuccessfully() {
        when(transactionRepository.findById(1)).thenReturn(Optional.of(transaction));
        when(transactionStatusRepository.findById(2)).thenReturn(Optional.of(completedStatus));
        Transaction saved = Transaction.builder()
                .id(1).amount(5000).merchant("Amazon").user(regularUser).status(completedStatus).build();
        when(transactionRepository.save(any(Transaction.class))).thenReturn(saved);

        TransactionResponse result = transactionService.updateTransactionStatus(1, 2, adminUser);

        assertThat(result.status().name()).isEqualTo("COMPLETED");
    }

    @Test
    void updateTransactionStatus_nonAdminUser_throwsAccessDeniedException() {
        assertThatThrownBy(() -> transactionService.updateTransactionStatus(1, 2, regularUser))
                .isInstanceOf(AccessDeniedException.class)
                .hasMessageContaining("admin role required");

        verify(transactionRepository, never()).findById(any());
    }

    @Test
    void updateTransactionStatus_statusNotFound_throwsResourceNotFoundException() {
        when(transactionRepository.findById(1)).thenReturn(Optional.of(transaction));
        when(transactionStatusRepository.findById(99)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> transactionService.updateTransactionStatus(1, 99, adminUser))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("99");
    }

    //  deleteTransaction  

    @Test
    void deleteTransaction_ownerUser_softDeletesTransaction() {
        when(transactionRepository.findById(1)).thenReturn(Optional.of(transaction));

        transactionService.deleteTransaction(1, regularUser);

        assertThat(transaction.isActive()).isFalse();
        verify(transactionRepository).save(transaction);
    }

    @Test
    void deleteTransaction_adminUser_canSoftDeleteAnyTransaction() {
        when(transactionRepository.findById(1)).thenReturn(Optional.of(transaction));

        transactionService.deleteTransaction(1, adminUser);

        assertThat(transaction.isActive()).isFalse();
        verify(transactionRepository).save(transaction);
    }

    @Test
    void deleteTransaction_differentUser_throwsResourceNotFoundException() {
        when(transactionRepository.findById(1)).thenReturn(Optional.of(transaction));

        assertThatThrownBy(() -> transactionService.deleteTransaction(1, otherUser))
                .isInstanceOf(ResourceNotFoundException.class);

        verify(transactionRepository, never()).save(any());
    }

    @Test
    void deleteTransaction_notFound_throwsResourceNotFoundException() {
        when(transactionRepository.findById(99)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> transactionService.deleteTransaction(99, regularUser))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("99");
    }
}
