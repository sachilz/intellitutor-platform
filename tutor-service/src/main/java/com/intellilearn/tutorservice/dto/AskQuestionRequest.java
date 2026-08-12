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

    @Schema(description = "Optional LLM API Key (OpenAI, Gemini, Groq, etc.)", example = "sk-...")
    private String apiKey;

    @Schema(description = "Optional LLM Provider (openai, gemini, groq, openrouter)", example = "openai")
    private String provider;

    @Schema(description = "Optional LLM Model", example = "gpt-4o")
    private String model;

    public AskQuestionRequest() {
    }

    public AskQuestionRequest(String courseId, String question, String userId) {
        this.courseId = courseId;
        this.question = question;
        this.userId = userId;
    }

    public AskQuestionRequest(String courseId, String question, String userId, String apiKey, String provider, String model) {
        this.courseId = courseId;
        this.question = question;
        this.userId = userId;
        this.apiKey = apiKey;
        this.provider = provider;
        this.model = model;
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

    public String getApiKey() {
        return apiKey;
    }

    public void setApiKey(String apiKey) {
        this.apiKey = apiKey;
    }

    public String getProvider() {
        return provider;
    }

    public void setProvider(String provider) {
        this.provider = provider;
    }

    public String getModel() {
        return model;
    }

    public void setModel(String model) {
        this.model = model;
    }
}
