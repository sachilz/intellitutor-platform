package com.intellilearn.tutorservice.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;

public class AskQuestionRequest {

    @Schema(description = "Course identifier or slug", example = "java-101")
    private String courseId;

    @NotBlank(message = "Question text cannot be blank")
    @Schema(description = "Academic question asked by student", example = "What is polymorphism?")
    private String question;

    @Schema(description = "User identifier asking the question", example = "student1@intellilearn.com")
    private String userId;

    public AskQuestionRequest() {
    }

    public AskQuestionRequest(String courseId, String question, String userId) {
        this.courseId = courseId;
        this.question = question;
        this.userId = userId;
    }

    public String getCourseId() {
        return courseId;
    }

    public void setCourseId(String courseId) {
        this.courseId = courseId;
    }

    public String getQuestion() {
        return question;
    }

    public void setQuestion(String question) {
        this.question = question;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }
}
