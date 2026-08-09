package com.intellilearn.quizservice.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.MediaType;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * Gatekeeper filter that rejects any request missing an invalid
 * {@code X-API-Key} header with HTTP 401. It is deliberately kept outside the
 * main authorisation logic: if the header is valid the request is simply
 * passed down the chain (see {@link SecurityConfig}).
 *
 * <p>The API key value is injected via the {@code intellilearn.api-key}
 * property so it can be overridden per environment. Swagger/OpenAPI endpoints
 * are excluded via {@link #shouldNotFilter(HttpServletRequest)}.</p>
 */
public class ApiKeyFilter extends OncePerRequestFilter {

    public static final String API_KEY_HEADER = "X-API-Key";

    private final String expectedApiKey;

    public ApiKeyFilter(String expectedApiKey) {
        this.expectedApiKey = expectedApiKey;
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getRequestURI();
        // Swagger UI / OpenAPI docs and their static assets (webjars) are public.
        // The root path (/) is public too: it redirects browsers to Swagger UI.
        return path.equals("/v3/api-docs") || path.startsWith("/v3/api-docs/")
                || path.equals("/swagger-ui.html") || path.startsWith("/swagger-ui/")
                || path.startsWith("/webjars/")
                || path.equals("/");
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        // Let CORS preflight requests through; the API Gateway owns CORS centrally.
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            filterChain.doFilter(request, response);
            return;
        }

        String providedKey = request.getHeader(API_KEY_HEADER);
        if (expectedApiKey.equals(providedKey)) {
            filterChain.doFilter(request, response);
            return;
        }

        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setCharacterEncoding("UTF-8");
        // Same shape as ApiError so every error response on the API is consistent.
        response.getWriter().write("{\"timestamp\":\"" + java.time.LocalDateTime.now() + "\","
                + "\"status\":401,\"error\":\"Unauthorized\","
                + "\"message\":\"Missing or invalid X-API-Key header. Access denied.\","
                + "\"path\":\"" + request.getRequestURI() + "\"}");
    }
}
