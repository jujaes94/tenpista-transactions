package com.tenpistas.transactions.config;

import com.tenpistas.transactions.service.RateLimiterService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

@Component
@RequiredArgsConstructor
public class RateLimitInterceptor implements HandlerInterceptor {

    private final RateLimiterService rateLimiterService;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        // Use X-Forwarded-For header when behind a proxy/load balancer, fallback to remote address
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        String clientId;
        if (xForwardedFor != null && !xForwardedFor.isBlank()) {
            // X-Forwarded-For can contain a comma-separated list; take the first (original) IP
            clientId = xForwardedFor.split(",")[0].trim();
        } else {
            clientId = request.getRemoteAddr();
        }

        if (!rateLimiterService.isAllowed(clientId)) {
            response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
            response.getWriter().write("Rate limit exceeded. Try again later.");
            return false;
        }

        return true;
    }
}
