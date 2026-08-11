package com.intellilearn.tutorservice.service.llm;

public interface LlmProvider {
    String generateCompletion(String prompt);
    String getProviderName();
    boolean isAvailable();
}
