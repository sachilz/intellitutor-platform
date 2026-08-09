package com.intellilearn.quizservice.exception;

/** Thrown when a requested quiz does not exist. Mapped to HTTP 404. */
public class QuizNotFoundException extends RuntimeException {

    public QuizNotFoundException(Long id) {
        super("Quiz with id " + id + " not found");
    }
}
