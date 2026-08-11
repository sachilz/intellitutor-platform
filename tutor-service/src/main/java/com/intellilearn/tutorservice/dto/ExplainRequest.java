package com.intellilearn.tutorservice.dto;

import jakarta.validation.constraints.NotBlank;

public class ExplainRequest {
    @NotBlank(message = "Command cannot be blank")
    private String command;
    private String userId;

    public ExplainRequest() {}

    public ExplainRequest(String command, String userId) {
        this.command = command;
        this.userId = userId;
    }

    public String getCommand() { return command; }
    public void setCommand(String command) { this.command = command; }
    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }
}
