package com.intellilearn.quizservice.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.List;

/**
 * Request body for {@code POST /api/quizzes/{id}/submit}. Contains one 0-based
 * option index per question, in the same order the questions are returned by
 * the API.
 *
 * @param selectedOptions selected option index (0-based) for each question
 */
public record QuizSubmissionDto(
        @Schema(description = "0-based index of the selected option for each question, in the order questions are returned by the API",
                example = "[1, 0, 2]")
        @NotNull(message = "selectedOptions is required")
        @Size(min = 1, message = "At least one answer is required")
        List<@NotNull(message = "Each answer index must not be null")
             @Min(value = 0, message = "Answer index must be 0 or greater") Integer> selectedOptions) {
}
