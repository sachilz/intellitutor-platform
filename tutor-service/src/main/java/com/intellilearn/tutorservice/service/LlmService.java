package com.intellilearn.tutorservice.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class LlmService {

    private static final Logger log = LoggerFactory.getLogger(LlmService.class);

    private final HttpClient httpClient;
    private final ObjectMapper objectMapper;

    @Value("${llm.default-provider:openrouter}")
    private String defaultProvider;

    @Value("${llm.openai.api-key:}")
    private String envOpenAiApiKey;

    @Value("${llm.gemini.api-key:}")
    private String envGeminiApiKey;

    @Value("${llm.groq.api-key:}")
    private String envGroqApiKey;

    @Value("${llm.openrouter.api-key:}")
    private String envOpenRouterApiKey;

    private static final String SYSTEM_PROMPT = 
        "You are IntelliTutor AI, a world-class AI learning assistant for the IntelliLearn Platform. " +
        "You are an expert tutor in Java, Object-Oriented Programming, Spring Boot, Microservices Architecture, API Gateway routing, " +
        "React frontend development, MongoDB databases, Redis caching, Keycloak auth, and modern software engineering. " +
        "Give friendly, clear, academic yet practical explanations. Use Markdown formatting, bullet points, and clean code examples where appropriate.";

    public LlmService() {
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(15))
                .build();
        this.objectMapper = new ObjectMapper();
    }

    /**
     * Check if any LLM provider is configured (either via user key or server env).
     * When no userApiKey is provided, checks all server-side env keys.
     */
    public boolean isConfigured(String userApiKey, String provider) {
        if (userApiKey != null && !userApiKey.trim().isEmpty()) {
            return true;
        }
        // Check server-side env keys based on provider or any available
        String resolvedProvider = (provider != null && !provider.trim().isEmpty()) ? provider.toLowerCase() : defaultProvider;

        String envKey = getEnvKeyForProvider(resolvedProvider);
        if (envKey != null && !envKey.trim().isEmpty()) {
            return true;
        }

        // Fallback: check all env keys
        if (isNotEmpty(envOpenRouterApiKey)) return true;
        if (isNotEmpty(envOpenAiApiKey)) return true;
        if (isNotEmpty(envGeminiApiKey)) return true;
        if (isNotEmpty(envGroqApiKey)) return true;

        return false;
    }

    public String generateResponse(String question, String courseId, String userApiKey, String requestedProvider, String requestedModel) throws Exception {
        // Resolve provider: user request → default env → "openrouter"
        String provider = (requestedProvider != null && !requestedProvider.trim().isEmpty()) 
            ? requestedProvider.toLowerCase() 
            : (defaultProvider != null && !defaultProvider.trim().isEmpty() ? defaultProvider.toLowerCase() : "openrouter");

        // Resolve API key: user-provided → env for provider → any available env key
        String apiKey = (userApiKey != null && !userApiKey.trim().isEmpty()) ? userApiKey.trim() : getEnvKeyForProvider(provider);

        // If still no key, try to find any available key and adjust provider accordingly
        if (apiKey == null || apiKey.trim().isEmpty()) {
            if (isNotEmpty(envOpenRouterApiKey)) {
                provider = "openrouter";
                apiKey = envOpenRouterApiKey.trim();
            } else if (isNotEmpty(envOpenAiApiKey)) {
                provider = "openai";
                apiKey = envOpenAiApiKey.trim();
            } else if (isNotEmpty(envGeminiApiKey)) {
                provider = "gemini";
                apiKey = envGeminiApiKey.trim();
            } else if (isNotEmpty(envGroqApiKey)) {
                provider = "groq";
                apiKey = envGroqApiKey.trim();
            }
        }

        // Auto-detect provider from key prefix
        if (apiKey != null && !apiKey.isEmpty()) {
            if (apiKey.startsWith("AIza")) provider = "gemini";
            else if (apiKey.startsWith("gsk_")) provider = "groq";
            else if (apiKey.startsWith("sk-or-")) provider = "openrouter";
        }

        if (apiKey == null || apiKey.isEmpty()) {
            throw new IllegalArgumentException("No valid LLM API key provided.");
        }

        log.info("Using LLM provider: {} for question (courseId: {})", provider, courseId);

        if ("gemini".equalsIgnoreCase(provider)) {
            return callGeminiApi(question, courseId, apiKey, requestedModel);
        } else if ("groq".equalsIgnoreCase(provider)) {
            return callOpenAiCompatibleApi("https://api.groq.com/openai/v1/chat/completions", apiKey, 
                    (requestedModel != null && !requestedModel.trim().isEmpty()) ? requestedModel : "llama-3.3-70b-versatile", question, courseId);
        } else if ("openrouter".equalsIgnoreCase(provider)) {
            return callOpenAiCompatibleApi("https://openrouter.ai/api/v1/chat/completions", apiKey, 
                    (requestedModel != null && !requestedModel.trim().isEmpty()) ? requestedModel : "openai/gpt-4o-mini", question, courseId);
        } else {
            // OpenAI default
            return callOpenAiCompatibleApi("https://api.openai.com/v1/chat/completions", apiKey, 
                    (requestedModel != null && !requestedModel.trim().isEmpty()) ? requestedModel : "gpt-4o-mini", question, courseId);
        }
    }

    private String getEnvKeyForProvider(String provider) {
        if ("openrouter".equalsIgnoreCase(provider)) return envOpenRouterApiKey;
        if ("gemini".equalsIgnoreCase(provider)) return envGeminiApiKey;
        if ("groq".equalsIgnoreCase(provider)) return envGroqApiKey;
        if ("openai".equalsIgnoreCase(provider)) return envOpenAiApiKey;
        // Fallback chain
        if (isNotEmpty(envOpenRouterApiKey)) return envOpenRouterApiKey;
        if (isNotEmpty(envOpenAiApiKey)) return envOpenAiApiKey;
        if (isNotEmpty(envGeminiApiKey)) return envGeminiApiKey;
        return envGroqApiKey;
    }

    private boolean isNotEmpty(String val) {
        return val != null && !val.trim().isEmpty();
    }

    private String callOpenAiCompatibleApi(String endpoint, String apiKey, String model, String question, String courseId) throws Exception {
        String contextualPrompt = "Context Course: " + courseId + "\nStudent Question: " + question;

        Map<String, Object> body = new HashMap<>();
        body.put("model", model);
        body.put("temperature", 0.7);
        body.put("messages", List.of(
                Map.of("role", "system", "content", SYSTEM_PROMPT),
                Map.of("role", "user", "content", contextualPrompt)
        ));

        String jsonPayload = objectMapper.writeValueAsString(body);

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(endpoint))
                .header("Content-Type", "application/json")
                .header("Authorization", "Bearer " + apiKey)
                .POST(HttpRequest.BodyPublishers.ofString(jsonPayload))
                .timeout(Duration.ofSeconds(30))
                .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

        if (response.statusCode() >= 200 && response.statusCode() < 300) {
            JsonNode rootNode = objectMapper.readTree(response.body());
            JsonNode contentNode = rootNode.path("choices").path(0).path("message").path("content");
            if (!contentNode.isMissingNode()) {
                return contentNode.asText();
            }
            throw new RuntimeException("Unexpected API response structure");
        } else {
            log.error("LLM API returned error status {}: {}", response.statusCode(), response.body());
            JsonNode errJson = objectMapper.readTree(response.body());
            String errMsg = errJson.path("error").path("message").asText(response.body());
            throw new RuntimeException("AI API Error (" + response.statusCode() + "): " + errMsg);
        }
    }

    private String callGeminiApi(String question, String courseId, String apiKey, String requestedModel) throws Exception {
        String model = (requestedModel != null && !requestedModel.trim().isEmpty()) ? requestedModel : "gemini-1.5-flash";
        String url = "https://generativelanguage.googleapis.com/v1beta/models/" + model + ":generateContent?key=" + apiKey;

        String fullText = SYSTEM_PROMPT + "\n\nContext Course: " + courseId + "\nStudent Question: " + question;

        Map<String, Object> body = Map.of(
                "contents", List.of(
                        Map.of(
                                "role", "user",
                                "parts", List.of(Map.of("text", fullText))
                        )
                )
        );

        String jsonPayload = objectMapper.writeValueAsString(body);

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(url))
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(jsonPayload))
                .timeout(Duration.ofSeconds(30))
                .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

        if (response.statusCode() >= 200 && response.statusCode() < 300) {
            JsonNode rootNode = objectMapper.readTree(response.body());
            JsonNode textNode = rootNode.path("candidates").path(0).path("content").path("parts").path(0).path("text");
            if (!textNode.isMissingNode()) {
                return textNode.asText();
            }
            throw new RuntimeException("Unexpected Gemini API response structure");
        } else {
            log.error("Gemini API error {}: {}", response.statusCode(), response.body());
            JsonNode errJson = objectMapper.readTree(response.body());
            String errMsg = errJson.path("error").path("message").asText(response.body());
            throw new RuntimeException("Gemini API Error (" + response.statusCode() + "): " + errMsg);
        }
    }
}
