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

    @Value("${OPENAI_API_KEY:}")
    private String envOpenAiApiKey;

    @Value("${GEMINI_API_KEY:}")
    private String envGeminiApiKey;

    @Value("${GROQ_API_KEY:}")
    private String envGroqApiKey;

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

    public boolean isConfigured(String userApiKey, String provider) {
        if (userApiKey != null && !userApiKey.trim().isEmpty()) {
            return true;
        }
        if ("gemini".equalsIgnoreCase(provider) && envGeminiApiKey != null && !envGeminiApiKey.trim().isEmpty()) {
            return true;
        }
        if ("groq".equalsIgnoreCase(provider) && envGroqApiKey != null && !envGroqApiKey.trim().isEmpty()) {
            return true;
        }
        if (envOpenAiApiKey != null && !envOpenAiApiKey.trim().isEmpty()) {
            return true;
        }
        if (envGeminiApiKey != null && !envGeminiApiKey.trim().isEmpty()) {
            return true;
        }
        return envGroqApiKey != null && !envGroqApiKey.trim().isEmpty();
    }

    public String generateResponse(String question, String courseId, String userApiKey, String requestedProvider, String requestedModel) throws Exception {
        String provider = (requestedProvider != null && !requestedProvider.trim().isEmpty()) ? requestedProvider.toLowerCase() : "openai";
        String apiKey = userApiKey != null && !userApiKey.trim().isEmpty() ? userApiKey.trim() : getEnvKeyForProvider(provider);

        if (apiKey == null || apiKey.trim().isEmpty()) {
            // Auto-detect provider if user supplied key
            if (userApiKey != null && userApiKey.startsWith("AIza")) {
                provider = "gemini";
                apiKey = userApiKey.trim();
            } else if (userApiKey != null && userApiKey.startsWith("gsk_")) {
                provider = "groq";
                apiKey = userApiKey.trim();
            } else {
                apiKey = userApiKey != null ? userApiKey.trim() : "";
            }
        }

        if (apiKey.isEmpty()) {
            throw new IllegalArgumentException("No valid LLM API key provided.");
        }

        if ("gemini".equalsIgnoreCase(provider) || apiKey.startsWith("AIza")) {
            return callGeminiApi(question, courseId, apiKey, requestedModel);
        } else if ("groq".equalsIgnoreCase(provider) || apiKey.startsWith("gsk_")) {
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
        if ("gemini".equalsIgnoreCase(provider)) return envGeminiApiKey;
        if ("groq".equalsIgnoreCase(provider)) return envGroqApiKey;
        if (envOpenAiApiKey != null && !envOpenAiApiKey.isEmpty()) return envOpenAiApiKey;
        if (envGeminiApiKey != null && !envGeminiApiKey.isEmpty()) return envGeminiApiKey;
        return envGroqApiKey;
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
                .timeout(Duration.ofSeconds(25))
                .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

        if (response.statusCode() >= 200 && response.statusCode() < 300) {
            JsonNode rootNode = objectMapper.readTree(response.body());
            JsonNode contentNode = rootNode.path("choices").path(0).path("message").path("content");
            if (!contentNode.isMissingNode()) {
                return contentNode.asText();
            }
            throw new RuntimeException("Unexpected OpenAI API response structure");
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
                .timeout(Duration.ofSeconds(25))
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
