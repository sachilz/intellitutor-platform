package com.intellilearn.quizservice.exception;

import java.time.LocalDateTime;

/**
 * Standard error payload returned by {@link GlobalExceptionHandler} for every
 * error response, keeping the API error format consistent across endpoints.
 */
public record ApiError(
        LocalDateTime timestamp,
        int status,
        String error,
        String message,
        String path) {
}
