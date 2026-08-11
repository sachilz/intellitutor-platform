package com.intellilearn.tutorservice.dto;

import jakarta.validation.constraints.NotBlank;

public class ExecuteRequest {
    @NotBlank(message = "Command cannot be blank")
    private String command;
    private String historyId;
    private String userId;

    public ExecuteRequest() {}

    public ExecuteRequest(String command, String historyId, String userId) {
        this.command = command;
        this.historyId = historyId;
        this.userId = userId;
    }

    public String getCommand() { return command; }
    public void setCommand(String command) { this.command = command; }
    public String getHistoryId() { return historyId; }
    public void setHistoryId(String historyId) { this.historyId = historyId; }
    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }
}
