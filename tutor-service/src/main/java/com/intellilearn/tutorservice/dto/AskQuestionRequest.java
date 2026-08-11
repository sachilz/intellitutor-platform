package com.intellilearn.tutorservice.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AskQuestionRequest {

    @Schema(description = "Course identifier or slug", example = "java-101")
    private String courseId;

    @NotBlank(message = "Question text cannot be blank")
    @Schema(description = "Academic question asked by student", example = "What is polymorphism?")
    private String question;

    @Schema(description = "User identifier asking the question", example = "student1@intellilearn.com")
    private String userId;
}
