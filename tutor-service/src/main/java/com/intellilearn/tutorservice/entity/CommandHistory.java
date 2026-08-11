package com.intellilearn.tutorservice.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "command_history")
public class CommandHistory {

    @Id
    private String id;
    private String userId;
    private String courseId;
    private String prompt;
    private String command;
    private String explanation;
    private String riskLevel;
    private boolean executed;
    private String executionOutput;
    private String providerUsed;
    private LocalDateTime timestamp;

    public CommandHistory() {}

    public CommandHistory(String id, String userId, String courseId, String prompt, String command, 
                          String explanation, String riskLevel, boolean executed, String executionOutput, 
                          String providerUsed, LocalDateTime timestamp) {
        this.id = id;
        this.userId = userId;
        this.courseId = courseId;
        this.prompt = prompt;
        this.command = command;
        this.explanation = explanation;
        this.riskLevel = riskLevel;
        this.executed = executed;
        this.executionOutput = executionOutput;
        this.providerUsed = providerUsed;
        this.timestamp = timestamp;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }
    public String getCourseId() { return courseId; }
    public void setCourseId(String courseId) { this.courseId = courseId; }
    public String getPrompt() { return prompt; }
    public void setPrompt(String prompt) { this.prompt = prompt; }
    public String getCommand() { return command; }
    public void setCommand(String command) { this.command = command; }
    public String getExplanation() { return explanation; }
    public void setExplanation(String explanation) { this.explanation = explanation; }
    public String getRiskLevel() { return riskLevel; }
    public void setRiskLevel(String riskLevel) { this.riskLevel = riskLevel; }
    public boolean isExecuted() { return executed; }
    public void setExecuted(boolean executed) { this.executed = executed; }
    public String getExecutionOutput() { return executionOutput; }
    public void setExecutionOutput(String executionOutput) { this.executionOutput = executionOutput; }
    public String getProviderUsed() { return providerUsed; }
    public void setProviderUsed(String providerUsed) { this.providerUsed = providerUsed; }
    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
}
