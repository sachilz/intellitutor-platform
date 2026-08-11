package com.intellilearn.tutorservice.dto;

import java.util.List;

public class CommandResponse {
    private String id;
    private String prompt;
    private String command;
    private String explanation;
    private String riskLevel; // LOW, MEDIUM, HIGH, CRITICAL
    private boolean requiresConfirmation;
    private List<String> warningFlags;
    private String providerUsed;

    public CommandResponse() {}

    public CommandResponse(String id, String prompt, String command, String explanation, 
                           String riskLevel, boolean requiresConfirmation, List<String> warningFlags, String providerUsed) {
        this.id = id;
        this.prompt = prompt;
        this.command = command;
        this.explanation = explanation;
        this.riskLevel = riskLevel;
        this.requiresConfirmation = requiresConfirmation;
        this.warningFlags = warningFlags;
        this.providerUsed = providerUsed;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getPrompt() { return prompt; }
    public void setPrompt(String prompt) { this.prompt = prompt; }
    public String getCommand() { return command; }
    public void setCommand(String command) { this.command = command; }
    public String getExplanation() { return explanation; }
    public void setExplanation(String explanation) { this.explanation = explanation; }
    public String getRiskLevel() { return riskLevel; }
    public void setRiskLevel(String riskLevel) { this.riskLevel = riskLevel; }
    public boolean isRequiresConfirmation() { return requiresConfirmation; }
    public void setRequiresConfirmation(boolean requiresConfirmation) { this.requiresConfirmation = requiresConfirmation; }
    public List<String> getWarningFlags() { return warningFlags; }
    public void setWarningFlags(List<String> warningFlags) { this.warningFlags = warningFlags; }
    public String getProviderUsed() { return providerUsed; }
    public void setProviderUsed(String providerUsed) { this.providerUsed = providerUsed; }
}
