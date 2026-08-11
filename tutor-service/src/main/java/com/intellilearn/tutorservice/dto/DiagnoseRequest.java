package com.intellilearn.tutorservice.dto;

import jakarta.validation.constraints.NotBlank;

public class DiagnoseRequest {
    @NotBlank(message = "Command cannot be blank")
    private String command;
    @NotBlank(message = "Error trace cannot be blank")
    private String error;
    private String userId;

    public DiagnoseRequest() {}

    public DiagnoseRequest(String command, String error, String userId) {
        this.command = command;
        this.error = error;
        this.userId = userId;
    }

    public String getCommand() { return command; }
    public void setCommand(String command) { this.command = command; }
    public String getError() { return error; }
    public void setError(String error) { this.error = error; }
    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }
}
