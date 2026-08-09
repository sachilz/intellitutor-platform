package com.intellilearn.quizservice.exception;

/**
 * Thrown when a quiz submission (or the quiz payload of a create request) is
 * malformed, e.g. the number of answers does not match the number of questions.
 * Mapped to HTTP 400.
 */
public class InvalidSubmissionException extends RuntimeException {

    public InvalidSubmissionException(String message) {
        super(message);
    }
}
