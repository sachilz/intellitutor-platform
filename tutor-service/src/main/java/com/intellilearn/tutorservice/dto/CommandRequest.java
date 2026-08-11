package com.intellilearn.tutorservice.dto;

import jakarta.validation.constraints.NotBlank;

public class CommandRequest {
    @NotBlank(message = "Prompt cannot be blank")
    private String prompt;
    private String userId;
    private String courseId;

    public CommandRequest() {}

    public CommandRequest(String prompt, String userId, String courseId) {
        this.prompt = prompt;
        this.userId = userId;
        this.courseId = courseId;
    }

    public String getPrompt() { return prompt; }
    public void setPrompt(String prompt) { this.prompt = prompt; }
    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }
    public String getCourseId() { return courseId; }
    public void setCourseId(String courseId) { this.courseId = courseId; }
}
