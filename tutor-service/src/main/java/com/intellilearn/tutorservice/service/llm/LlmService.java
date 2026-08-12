package com.intellilearn.tutorservice.service.llm;

import org.springframework.stereotype.Service;

import java.util.List;

@Service("llmProviderService")
public class LlmService {

    private final List<LlmProvider> providers;

    public LlmService(List<LlmProvider> providers) {
        this.providers = providers;
    }

    public String generateCompletion(String prompt) {
        for (LlmProvider provider : providers) {
            if (provider.isAvailable() && !(provider instanceof MockLlmProvider)) {
                return provider.generateCompletion(prompt);
            }
        }

        // Fallback to MockLlmProvider
        return providers.stream()
                .filter(p -> p instanceof MockLlmProvider)
                .findFirst()
                .orElse(new MockLlmProvider())
                .generateCompletion(prompt);
    }

    public String getActiveProviderName() {
        for (LlmProvider provider : providers) {
            if (provider.isAvailable() && !(provider instanceof MockLlmProvider)) {
                return provider.getProviderName();
            }
        }
        return "Local-Mock-Engine";
    }
}
