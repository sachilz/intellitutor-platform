package com.intellilearn.tutorservice.controller;

import com.intellilearn.tutorservice.dto.ChatMessageRequest;
import com.intellilearn.tutorservice.dto.ChatMessageResponse;
import com.intellilearn.tutorservice.entity.ChatSession;
import com.intellilearn.tutorservice.repository.ChatSessionRepository;
import com.intellilearn.tutorservice.service.ChatOrchestratorService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/tutor/chat")
@Tag(name = "Project-Aware AI Chatbot", description = "Chatbot orchestration endpoints with RAG, Web Search, Troubleshooting, and Memory")
@SecurityRequirement(name = "apiKey")
public class ChatController {

    private final ChatOrchestratorService chatService;
    private final ChatSessionRepository sessionRepository;

    public ChatController(ChatOrchestratorService chatService, ChatSessionRepository sessionRepository) {
        this.chatService = chatService;
        this.sessionRepository = sessionRepository;
    }

    @PostMapping
    @Operation(summary = "Send message to AI Chatbot", description = "Routes question, retrieves project RAG context / web search, and returns structured answer.")
    public ResponseEntity<ChatMessageResponse> sendChatMessage(@Valid @RequestBody ChatMessageRequest request) {
        return ResponseEntity.ok(chatService.handleChatMessage(request));
    }

    @GetMapping("/session/{sessionId}")
    @Operation(summary = "Fetch chat session history")
    public ResponseEntity<ChatSession> getSessionHistory(@PathVariable String sessionId) {
        Optional<ChatSession> session = sessionRepository.findById(sessionId);
        return session.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/session/{sessionId}")
    @Operation(summary = "Clear chat session history")
    public ResponseEntity<Void> clearSession(@PathVariable String sessionId) {
        sessionRepository.deleteById(sessionId);
        return ResponseEntity.noContent().build();
    }
}
