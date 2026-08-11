package com.intellilearn.tutorservice.controller;

import com.intellilearn.tutorservice.dto.AskQuestionRequest;
import com.intellilearn.tutorservice.dto.TutorResponse;
import com.intellilearn.tutorservice.service.RagService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Collections;
import java.util.Map;

@RestController
@RequestMapping("/tutor")
@Tag(name = "AI Tutor", description = "RAG-powered intelligent learning assistant endpoints")
@SecurityRequirement(name = "apiKey")
public class TutorController {

    private final RagService ragService;

    public TutorController(RagService ragService) {
        this.ragService = ragService;
    }

    @PostMapping("/ask")
    @Operation(summary = "Ask AI Tutor a question", description = "Retrieves grounded answers from course materials using Retrieval-Augmented Generation (RAG).")
    public TutorResponse askQuestion(@Valid @RequestBody AskQuestionRequest request) {
        return ragService.processQuestion(request);
    }

    @PostMapping("/summarize")
    @Operation(summary = "Summarize course material", description = "Generates a structured summary of specified course topics.")
    public TutorResponse summarizeTopic(@Valid @RequestBody AskQuestionRequest request) {
        if (request.getQuestion() == null || request.getQuestion().isBlank()) {
            request.setQuestion("Summarize core concepts for course " + request.getCourseId());
        } else {
            request.setQuestion("Summarize " + request.getQuestion());
        }
        return ragService.processQuestion(request);
    }

    @PostMapping("/recommend")
    @Operation(summary = "Get personalized study recommendations", description = "Provides AI-generated learning guidance based on student performance.")
    public TutorResponse getRecommendations(@Valid @RequestBody AskQuestionRequest request) {
        return ragService.getRecommendations(request);
    }

    @GetMapping("/health")
    @Operation(summary = "Tutor Service Health Check")
    public Map<String, String> health() {
        return Collections.singletonMap("status", "Tutor Service RAG Engine is running");
    }
}
