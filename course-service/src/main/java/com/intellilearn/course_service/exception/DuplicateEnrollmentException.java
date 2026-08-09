package com.intellilearn.course_service.exception;

public class DuplicateEnrollmentException extends RuntimeException {
    public DuplicateEnrollmentException(String message) {
        super(message);
    }
}
