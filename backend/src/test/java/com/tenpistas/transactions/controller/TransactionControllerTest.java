package com.tenpistas.transactions.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.tenpistas.transactions.dto.TransactionRequest;
import com.tenpistas.transactions.dto.TransactionResponse;
import com.tenpistas.transactions.dto.TransactionStatusUpdateRequest;
import com.tenpistas.transactions.entity.Role;
import com.tenpistas.transactions.entity.User;
import com.tenpistas.transactions.exception.AccessDeniedException;
import com.tenpistas.transactions.exception.GlobalExceptionHandler;
import com.tenpistas.transactions.exception.ResourceNotFoundException;
import com.tenpistas.transactions.service.TransactionService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.core.MethodParameter;
import org.springframework.http.MediaType;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.bind.support.WebDataBinderFactory;
import org.springframework.web.context.request.NativeWebRequest;
import org.springframework.web.method.support.HandlerMethodArgumentResolver;
import org.springframework.web.method.support.ModelAndViewContainer;

import java.time.LocalDateTime;
import java.util.List;

import static org.hamcrest.Matchers.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class TransactionControllerTest {

    @Mock
    private TransactionService transactionService;

    @InjectMocks
    private TransactionController transactionController;

    private MockMvc mockMvc;
    private ObjectMapper objectMapper;
    private User testUser;
    private TransactionResponse sampleResponse;

    @BeforeEach
    void setUp() {
        testUser = User.builder()
                .id(1)
                .username("testuser")
                .role(Role.USER)
                .password("encoded")
                .build();

        sampleResponse = new TransactionResponse(
                1, 5000, "Amazon", "Online purchase", "testuser",
                LocalDateTime.of(2024, 1, 15, 10, 0),
                new TransactionResponse.TransactionStatusDto(1, "PENDING", "Pending transaction")
        );

        objectMapper = new ObjectMapper();
        objectMapper.registerModule(new JavaTimeModule());
        objectMapper.disable(com.fasterxml.jackson.databind.SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);

        // Custom resolver that injects testUser for any @AuthenticationPrincipal parameter,
        // bypassing Spring Security in unit tests
        HandlerMethodArgumentResolver principalResolver = new HandlerMethodArgumentResolver() {
            @Override
            public boolean supportsParameter(MethodParameter parameter) {
                return parameter.hasParameterAnnotation(AuthenticationPrincipal.class);
            }

            @Override
            public Object resolveArgument(MethodParameter parameter, ModelAndViewContainer mavContainer,
                                          NativeWebRequest webRequest, WebDataBinderFactory binderFactory) {
                return testUser;
            }
        };

        mockMvc = MockMvcBuilders.standaloneSetup(transactionController)
                .setCustomArgumentResolvers(principalResolver)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
    }

    // GET /api/transaction

    @Test
    void getAllTransactions_returns200WithList() throws Exception {
        when(transactionService.getAllTransactions(testUser)).thenReturn(List.of(sampleResponse));

        mockMvc.perform(get("/api/transaction"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].merchant", is("Amazon")))
                .andExpect(jsonPath("$[0].amount", is(5000)))
                .andExpect(jsonPath("$[0].description", is("Online purchase")));
    }

    @Test
    void getAllTransactions_emptyList_returns200WithEmptyArray() throws Exception {
        when(transactionService.getAllTransactions(testUser)).thenReturn(List.of());

        mockMvc.perform(get("/api/transaction"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(0)));
    }

    // GET /api/transaction/{id}

    @Test
    void getTransactionById_existingId_returns200WithTransaction() throws Exception {
        when(transactionService.getTransactionById(1, testUser)).thenReturn(sampleResponse);

        mockMvc.perform(get("/api/transaction/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is(1)))
                .andExpect(jsonPath("$.merchant", is("Amazon")))
                .andExpect(jsonPath("$.description", is("Online purchase")))
                .andExpect(jsonPath("$.status.name", is("PENDING")));
    }

    @Test
    void getTransactionById_notFound_returns404() throws Exception {
        when(transactionService.getTransactionById(99, testUser))
                .thenThrow(new ResourceNotFoundException("Transaction not found with id: 99"));

        mockMvc.perform(get("/api/transaction/99"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message", containsString("99")));
    }

    // GET /api/transaction/user/{userId}

    @Test
    void getTransactionsByUserId_returns200WithList() throws Exception {
        when(transactionService.getTransactionsByUserId(2, testUser)).thenReturn(List.of(sampleResponse));

        mockMvc.perform(get("/api/transaction/user/2"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)));
    }

    @Test
    void getTransactionsByUserId_nonAdmin_returns403() throws Exception {
        when(transactionService.getTransactionsByUserId(2, testUser))
                .thenThrow(new AccessDeniedException("Access denied: admin role required"));

        mockMvc.perform(get("/api/transaction/user/2"))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.message", containsString("admin role required")));
    }

    // POST /api/transaction

    @Test
    void createTransaction_validRequest_returns201() throws Exception {
        TransactionRequest request = new TransactionRequest(3000, "Netflix", "Monthly plan", null);
        when(transactionService.createTransaction(any(TransactionRequest.class), eq(testUser)))
                .thenReturn(sampleResponse);

        mockMvc.perform(post("/api/transaction")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.merchant", is("Amazon")));
    }

    @Test
    void createTransaction_missingAmount_returns400() throws Exception {
        String invalidJson = "{\"merchant\":\"Netflix\"}";

        mockMvc.perform(post("/api/transaction")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(invalidJson))
                .andExpect(status().isBadRequest());
    }

    @Test
    void createTransaction_missingMerchant_returns400() throws Exception {
        String invalidJson = "{\"amount\":1000}";

        mockMvc.perform(post("/api/transaction")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(invalidJson))
                .andExpect(status().isBadRequest());
    }

    // PUT /api/transaction/{id}

    @Test
    void updateTransaction_validRequest_returns200() throws Exception {
        TransactionRequest request = new TransactionRequest(6000, "Updated Store", "Updated note", null);
        TransactionResponse updated = new TransactionResponse(
                1, 6000, "Updated Store", "Updated note", "testuser",
                LocalDateTime.of(2024, 1, 15, 10, 0),
                new TransactionResponse.TransactionStatusDto(1, "PENDING", "Pending transaction")
        );
        when(transactionService.updateTransaction(eq(1), any(TransactionRequest.class), eq(testUser)))
                .thenReturn(updated);

        mockMvc.perform(put("/api/transaction/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.amount", is(6000)))
                .andExpect(jsonPath("$.description", is("Updated note")));
    }

    @Test
    void updateTransaction_notFound_returns404() throws Exception {
        TransactionRequest request = new TransactionRequest(6000, "Store", null, null);
        when(transactionService.updateTransaction(eq(99), any(TransactionRequest.class), eq(testUser)))
                .thenThrow(new ResourceNotFoundException("Transaction not found with id: 99"));

        mockMvc.perform(put("/api/transaction/99")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isNotFound());
    }

    // PATCH /api/transaction/{id}/status

    @Test
    void updateTransactionStatus_validRequest_returns200() throws Exception {
        TransactionStatusUpdateRequest statusRequest = new TransactionStatusUpdateRequest(2);
        TransactionResponse updated = new TransactionResponse(
                1, 5000, "Amazon", null, "testuser",
                LocalDateTime.of(2024, 1, 15, 10, 0),
                new TransactionResponse.TransactionStatusDto(2, "COMPLETED", "Completed")
        );
        when(transactionService.updateTransactionStatus(eq(1), eq(2), eq(testUser))).thenReturn(updated);

        mockMvc.perform(patch("/api/transaction/1/status")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(statusRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status.name", is("COMPLETED")));
    }

    @Test
    void updateTransactionStatus_nonAdmin_returns403() throws Exception {
        TransactionStatusUpdateRequest statusRequest = new TransactionStatusUpdateRequest(2);
        when(transactionService.updateTransactionStatus(eq(1), eq(2), eq(testUser)))
                .thenThrow(new AccessDeniedException("Access denied: admin role required"));

        mockMvc.perform(patch("/api/transaction/1/status")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(statusRequest)))
                .andExpect(status().isForbidden());
    }

    // DELETE /api/transaction/{id}

    @Test
    void deleteTransaction_existingId_returns204() throws Exception {
        doNothing().when(transactionService).deleteTransaction(1, testUser);

        mockMvc.perform(delete("/api/transaction/1"))
                .andExpect(status().isNoContent());

        verify(transactionService).deleteTransaction(1, testUser);
    }

    @Test
    void deleteTransaction_notFound_returns404() throws Exception {
        doThrow(new ResourceNotFoundException("Transaction not found with id: 99"))
                .when(transactionService).deleteTransaction(99, testUser);

        mockMvc.perform(delete("/api/transaction/99"))
                .andExpect(status().isNotFound());
    }
}
