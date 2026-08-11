package com.intellilearn.tutorservice.dto;

import java.util.List;

public class ExplainResponse {

    public static class TokenBreakdown {
        private String token;
        private String meaning;
        private String category;

        public TokenBreakdown() {}

        public TokenBreakdown(String token, String meaning, String category) {
            this.token = token;
            this.meaning = meaning;
            this.category = category;
        }

        public String getToken() { return token; }
        public void setToken(String token) { this.token = token; }
        public String getMeaning() { return meaning; }
        public void setMeaning(String meaning) { this.meaning = meaning; }
        public String getCategory() { return category; }
        public void setCategory(String category) { this.category = category; }
    }

    private String command;
    private String binary;
    private String summary;
    private List<TokenBreakdown> tokens;
    private String educationalNotes;

    public ExplainResponse() {}

    public ExplainResponse(String command, String binary, String summary, List<TokenBreakdown> tokens, String educationalNotes) {
        this.command = command;
        this.binary = binary;
        this.summary = summary;
        this.tokens = tokens;
        this.educationalNotes = educationalNotes;
    }

    public String getCommand() { return command; }
    public void setCommand(String command) { this.command = command; }
    public String getBinary() { return binary; }
    public void setBinary(String binary) { this.binary = binary; }
    public String getSummary() { return summary; }
    public void setSummary(String summary) { this.summary = summary; }
    public List<TokenBreakdown> getTokens() { return tokens; }
    public void setTokens(List<TokenBreakdown> tokens) { this.tokens = tokens; }
    public String getEducationalNotes() { return educationalNotes; }
    public void setEducationalNotes(String educationalNotes) { this.educationalNotes = educationalNotes; }
}
