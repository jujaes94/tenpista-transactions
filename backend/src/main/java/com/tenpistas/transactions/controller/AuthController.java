package com.tenpistas.transactions.controller;

import com.tenpistas.transactions.dto.AuthRequest;
import com.tenpistas.transactions.dto.AuthResponse;
import com.tenpistas.transactions.entity.Role;
import com.tenpistas.transactions.entity.User;
import com.tenpistas.transactions.repository.UserRepository;
import com.tenpistas.transactions.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

        private final UserRepository userRepository;
        private final PasswordEncoder passwordEncoder;
        private final JwtService jwtService;
        private final AuthenticationManager authenticationManager;

        @PostMapping("/register")
        public ResponseEntity<?> register(@RequestBody AuthRequest request) {
                if (userRepository.existsByUsername(request.username())) {
                        return ResponseEntity.badRequest()
                                        .body(Map.of("message", "Username already exists"));
                }

                User user = User.builder()
                                .username(request.username())
                                .password(passwordEncoder.encode(request.password()))
                                .role(Role.USER)
                                .build();

                userRepository.save(user);

                String token = jwtService.generateToken(user, user.getRole().name());

                return ResponseEntity.status(HttpStatus.CREATED).body(
                                new AuthResponse(token, user.getUsername(), user.getRole().name()));
        }

        @PostMapping("/register/admin")
        public ResponseEntity<?> registerAdmin(@RequestBody AuthRequest request) {
                if (userRepository.existsByUsername(request.username())) {
                        return ResponseEntity.badRequest()
                                        .body(Map.of("message", "Username already exists"));
                }

                User user = User.builder()
                                .username(request.username())
                                .password(passwordEncoder.encode(request.password()))
                                .role(Role.ADMIN)
                                .build();

                userRepository.save(user);

                String token = jwtService.generateToken(user, user.getRole().name());

                return ResponseEntity.status(HttpStatus.CREATED).body(
                                new AuthResponse(token, user.getUsername(), user.getRole().name()));
        }

        @PostMapping("/login")
        public ResponseEntity<?> login(@RequestBody AuthRequest request) {
                try {
                        authenticationManager.authenticate(
                                        new UsernamePasswordAuthenticationToken(request.username(),
                                                        request.password()));
                } catch (BadCredentialsException e) {
                        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                                        .body(Map.of("message", "Invalid username or password"));
                }

                User user = userRepository.findByUsername(request.username())
                                .orElseThrow();

                String token = jwtService.generateToken(user, user.getRole().name());

                return ResponseEntity.ok(
                                new AuthResponse(token, user.getUsername(), user.getRole().name()));
        }
}