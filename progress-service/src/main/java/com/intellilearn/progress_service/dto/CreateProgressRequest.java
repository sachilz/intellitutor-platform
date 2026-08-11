package com.intellilearn.progress_service.dto;

import jakarta.validation.constraints.NotBlank;

public class CreateProgressRequest {

    @NotBlank(message = "userId is required")
    private String userId;

    @NotBlank(message = "courseId is required")
    private String courseId;

    public CreateProgressRequest() {
    }

    public CreateProgressRequest(String userId, String courseId) {
        this.userId = userId;
        this.courseId = courseId;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getCourseId() {
        return courseId;
    }

    public void setCourseId(String courseId) {
        this.courseId = courseId;
    }
}
