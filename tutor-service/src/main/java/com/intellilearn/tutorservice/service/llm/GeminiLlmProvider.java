package com.intellilearn.tutorservice.service.llm;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Component
public class GeminiLlmProvider implements LlmProvider {

    private static final Logger log = LoggerFactory.getLogger(GeminiLlmProvider.class);

    @Value("${gemini.api-key:${GEMINI_API_KEY:}}")
    private String apiKey;

    private final RestTemplate restTemplate = new RestTemplate();
    private final MockLlmProvider fallbackProvider;

    public GeminiLlmProvider(MockLlmProvider fallbackProvider) {
        this.fallbackProvider = fallbackProvider;
    }

    @Override
    public String generateCompletion(String prompt) {
        if (!isAvailable()) {
            log.info("Gemini API key is not configured. Falling back to MockLlmProvider.");
            return fallbackProvider.generateCompletion(prompt);
        }

        try {
            String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + apiKey;

            Map<String, Object> textPart = new HashMap<>();
            String promptText = prompt;
            if (prompt != null && !prompt.contains("IntelliTutor AI Assistant") && !prompt.contains("INSTRUCTIONS") && !prompt.contains("RETRIEVED KNOWLEDGE")) {
                promptText = "You are an expert DevOps and Linux command assistant. User request: " + prompt + 
                        ". Output JSON format with keys: 'command', 'explanation', 'riskLevel' (LOW, MEDIUM, HIGH, CRITICAL). Output JSON only.";
            }
            textPart.put("text", promptText);

            Map<String, Object> content = new HashMap<>();
            content.put("parts", Collections.singletonList(textPart));

            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("contents", Collections.singletonList(content));

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
            ResponseEntity<Map> response = restTemplate.postForEntity(url, entity, Map.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                List candidates = (List) response.getBody().get("candidates");
                if (candidates != null && !candidates.isEmpty()) {
                    Map candidate = (Map) candidates.get(0);
                    Map resContent = (Map) candidate.get("content");
                    List parts = (List) resContent.get("parts");
                    Map part = (Map) parts.get(0);
                    return (String) part.get("text");
                }
            }
        } catch (Exception e) {
            log.warn("Gemini API call encountered an issue: {}. Falling back to local engine.", e.getMessage());
        }

        return fallbackProvider.generateCompletion(prompt);
    }

    @Override
    public String getProviderName() {
        return "Google-Gemini-LLM";
    }

    @Override
    public boolean isAvailable() {
        return apiKey != null && !apiKey.isBlank() && !apiKey.startsWith("your_");
    }
}
