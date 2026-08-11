package com.intellilearn.tutorservice.dto;

import jakarta.validation.constraints.NotBlank;

public class ChatMessageRequest {

    @NotBlank(message = "Message cannot be blank")
    private String message;

    private String sessionId;
    private String courseId;
    private String courseTitle;
    private String courseCategory;
    private String userId;
    private String contextType;

    public ChatMessageRequest() {}

    public ChatMessageRequest(String message, String sessionId, String courseId, String userId) {
        this.message = message;
        this.sessionId = sessionId;
        this.courseId = courseId;
        this.userId = userId;
    }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public String getSessionId() { return sessionId; }
    public void setSessionId(String sessionId) { this.sessionId = sessionId; }

    public String getCourseId() { return courseId; }
    public void setCourseId(String courseId) { this.courseId = courseId; }

    public String getCourseTitle() { return courseTitle; }
    public void setCourseTitle(String courseTitle) { this.courseTitle = courseTitle; }

    public String getCourseCategory() { return courseCategory; }
    public void setCourseCategory(String courseCategory) { this.courseCategory = courseCategory; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getContextType() { return contextType; }
    public void setContextType(String contextType) { this.contextType = contextType; }
}
