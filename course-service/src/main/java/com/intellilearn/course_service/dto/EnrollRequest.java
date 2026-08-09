package com.intellilearn.course_service.dto;

import jakarta.validation.constraints.NotBlank;

public class EnrollRequest {

    @NotBlank(message = "User ID is required")
    private String userId;

    public EnrollRequest() {
    }

    public EnrollRequest(String userId) {
        this.userId = userId;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }
}
