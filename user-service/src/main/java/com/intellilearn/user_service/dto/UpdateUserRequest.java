package com.intellilearn.user_service.dto;

public class UpdateUserRequest {

    private String name;
    private String role;

    public UpdateUserRequest() {
    }

    public UpdateUserRequest(String name, String role) {
        this.name = name;
        this.role = role;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }
}
