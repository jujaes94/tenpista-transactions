package com.tenpistas.transactions.controller;

import com.tenpistas.transactions.dto.UserResponse;
import com.tenpistas.transactions.entity.Role;
import com.tenpistas.transactions.entity.User;
import com.tenpistas.transactions.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<?> getAllUsers(@AuthenticationPrincipal User currentUser) {
        if (currentUser.getRole() != Role.ADMIN) {
            return ResponseEntity.status(403).body(java.util.Map.of("message", "Access denied"));
        }

        List<UserResponse> users = userRepository.findAll().stream()
                .map(user -> new UserResponse(user.getId(), user.getUsername(), user.getRole().name()))
                .toList();

        return ResponseEntity.ok(users);
    }
}