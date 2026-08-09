package com.intellilearn.quizservice.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import java.util.List;

/**
 * Response produced by {@code POST /api/quizzes/{id}/submit} with the
 * evaluation of a quiz attempt: the percentage score, the number of correct
 * answers and personalised feedback / study recommendations.
 *
 * @param quizId             the quiz that was attempted
 * @param score              percentage score in the range 0-100
 * @param correctAnswersCount number of correctly answered questions
 * @param totalQuestions     total number of questions in the quiz
 * @param feedback           human-readable performance feedback
 * @param recommendations    personalised study recommendations
 */
public record AssessmentResultDto(
        @Schema(description = "Id of the quiz that was attempted", example = "1")
        Long quizId,

        @Schema(description = "Percentage score (0-100)", example = "67")
        int score,

        @Schema(description = "Number of correctly answered questions", example = "2")
        int correctAnswersCount,

        @Schema(description = "Total number of questions in the quiz", example = "3")
        int totalQuestions,

        @Schema(description = "Human-readable performance feedback",
                example = "Good effort! You understand most concepts - a little more review will get you to mastery.")
        String feedback,

        @Schema(description = "Personalised study recommendations",
                example = "[\"Review question 2: \\\"Which of these is a valid Java primitive type?\\\"\"]")
        List<String> recommendations) {
}
