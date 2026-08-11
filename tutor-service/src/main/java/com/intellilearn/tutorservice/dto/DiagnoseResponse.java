package com.intellilearn.tutorservice.dto;

import java.util.List;

public class DiagnoseResponse {
    private String command;
    private String error;
    private String diagnosis;
    private List<String> possibleCauses;
    private List<String> suggestedCommands;
    private String explanation;

    public DiagnoseResponse() {}

    public DiagnoseResponse(String command, String error, String diagnosis, 
                            List<String> possibleCauses, List<String> suggestedCommands, String explanation) {
        this.command = command;
        this.error = error;
        this.diagnosis = diagnosis;
        this.possibleCauses = possibleCauses;
        this.suggestedCommands = suggestedCommands;
        this.explanation = explanation;
    }

    public String getCommand() { return command; }
    public void setCommand(String command) { this.command = command; }
    public String getError() { return error; }
    public void setError(String error) { this.error = error; }
    public String getDiagnosis() { return diagnosis; }
    public void setDiagnosis(String diagnosis) { this.diagnosis = diagnosis; }
    public List<String> getPossibleCauses() { return possibleCauses; }
    public void setPossibleCauses(List<String> possibleCauses) { this.possibleCauses = possibleCauses; }
    public List<String> getSuggestedCommands() { return suggestedCommands; }
    public void setSuggestedCommands(List<String> suggestedCommands) { this.suggestedCommands = suggestedCommands; }
    public String getExplanation() { return explanation; }
    public void setExplanation(String explanation) { this.explanation = explanation; }
}
