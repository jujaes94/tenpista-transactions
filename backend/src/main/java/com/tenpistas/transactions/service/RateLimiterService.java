package com.tenpistas.transactions.service;

import org.springframework.stereotype.Service;

import java.util.Queue;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentLinkedQueue;

@Service
public class RateLimiterService {
    private final ConcurrentHashMap<String, Queue<Long>> requestCounts = new ConcurrentHashMap<>();
    private static final int MAX_REQUESTS = 30;
    private static final long TIME_WINDOW_MS = 60000; // 1 minute

    public boolean isAllowed(String clientId) {
        long currentTime = System.currentTimeMillis();
        requestCounts.putIfAbsent(clientId, new ConcurrentLinkedQueue<>());
        Queue<Long> requests = requestCounts.get(clientId);

        // Remove old requests outside the time window
        while (!requests.isEmpty() && currentTime - requests.peek() > TIME_WINDOW_MS) {
            requests.poll();
        }

        if (requests.size() < MAX_REQUESTS) {
            requests.offer(currentTime);
            return true;
        }

        return false;
    }
}
