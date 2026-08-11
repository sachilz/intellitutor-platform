package com.intellilearn.tutorservice.dto;

import jakarta.validation.constraints.NotBlank;

public class ChatMessageRequest {
    private String sessionId;
    @NotBlank(message = "Message cannot be blank")
    private String message;
    private String courseId;
    private String userId;

    public ChatMessageRequest() {}

    public ChatMessageRequest(String sessionId, String message, String courseId, String userId) {
        this.sessionId = sessionId;
        this.message = message;
        this.courseId = courseId;
        this.userId = userId;
    }

    public String getSessionId() { return sessionId; }
    public void setSessionId(String sessionId) { this.sessionId = sessionId; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    public String getCourseId() { return courseId; }
    public void setCourseId(String courseId) { this.courseId = courseId; }
    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }
}
