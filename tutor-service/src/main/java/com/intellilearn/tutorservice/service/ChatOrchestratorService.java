package com.intellilearn.tutorservice.service;

import com.intellilearn.tutorservice.dto.ChatMessageRequest;
import com.intellilearn.tutorservice.dto.ChatMessageResponse;
import com.intellilearn.tutorservice.entity.ChatSession;
import com.intellilearn.tutorservice.service.llm.LlmService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class ChatOrchestratorService {

    private static final Logger log = LoggerFactory.getLogger(ChatOrchestratorService.class);

    private final QuestionRouterService routerService;
    private final ProjectKnowledgeService knowledgeService;
    private final WebSearchService webSearchService;
    private final ProjectTroubleshooterService troubleshooterService;
    private final ConversationMemoryService memoryService;
    private final LlmService llmService;

    public ChatOrchestratorService(QuestionRouterService routerService,
                                   ProjectKnowledgeService knowledgeService,
                                   WebSearchService webSearchService,
                                   ProjectTroubleshooterService troubleshooterService,
                                   ConversationMemoryService memoryService,
                                   LlmService llmService) {
        this.routerService = routerService;
        this.knowledgeService = knowledgeService;
        this.webSearchService = webSearchService;
        this.troubleshooterService = troubleshooterService;
        this.memoryService = memoryService;
        this.llmService = llmService;
    }

    public ChatMessageResponse handleChatMessage(ChatMessageRequest request) {
        String msg = request.getMessage() != null ? request.getMessage().trim() : "";
        String userId = request.getUserId() != null ? request.getUserId() : "student1@intellilearn.com";
        String courseId = request.getCourseId() != null ? request.getCourseId() : "general";

        ChatSession session = memoryService.getOrCreateSession(request.getSessionId(), userId, courseId);
        String category = routerService.classifyQuestion(msg);

        log.info("Processing chatbot request for user '{}', session '{}'. Category: {}", userId, session.getId(), category);

        memoryService.addMessage(session, "USER", msg, category);
        String historyContext = memoryService.buildConversationContext(session);

        String sourceType = "GENERAL";
        boolean webSearchUsed = false;
        List<ChatMessageResponse.SourceItem> sources = new ArrayList<>();
        ChatMessageResponse.TroubleshootingDetail troubleshooting = null;
        StringBuilder promptBuilder = new StringBuilder();

        promptBuilder.append("You are the IntelliTutor AI Assistant for IntelliLearn Platform.\n");
        promptBuilder.append("User Question: ").append(msg).append("\n");
        promptBuilder.append(historyContext).append("\n");

        if ("PROJECT_SPECIFIC".equals(category) || "MIXED".equals(category) || "PROJECT_TROUBLESHOOTING".equals(category)) {
            ProjectKnowledgeService.KnowledgeResult knowledge = knowledgeService.retrieveProjectContext(msg);
            promptBuilder.append("\nRETRIEVED PROJECT KNOWLEDGE CONTEXT:\n").append(knowledge.getContext()).append("\n");
            for (String src : knowledge.getSources()) {
                sources.add(new ChatMessageResponse.SourceItem("Project Documentation (" + src + ")", "doc://" + src));
            }
            sourceType = "PROJECT";
        }

        if ("CURRENT_WEB_INFORMATION".equals(category) || "MIXED".equals(category)) {
            WebSearchService.SearchResult searchResult = webSearchService.performWebSearch(msg);
            promptBuilder.append("\nRETRIEVED WEB SEARCH CONTEXT:\n").append(searchResult.getSummary()).append("\n");
            sources.addAll(searchResult.getSources());
            webSearchUsed = true;
            sourceType = "PROJECT_SPECIFIC".equals(category) ? "MIXED" : "WEB";
        }

        if ("PROJECT_TROUBLESHOOTING".equals(category)) {
            troubleshooting = troubleshooterService.diagnoseProjectIssue(msg);
            promptBuilder.append("\nTROUBLESHOOTING DIAGNOSIS CONTEXT:\n");
            promptBuilder.append("Likely Cause: ").append(troubleshooting.getLikelyCause()).append("\n");
            promptBuilder.append("Recommended Checks: ").append(String.join("; ", troubleshooting.getRecommendedChecks())).append("\n");
            sourceType = "TROUBLESHOOTING";
        }

        promptBuilder.append("\nINSTRUCTIONS: Answer the user question concisely, accurately, and naturally. ");
        promptBuilder.append("If this is a project question and project knowledge context is insufficient, explicitly state that required project details are not available in knowledge base.");

        String rawAnswer = llmService.generateCompletion(promptBuilder.toString());
        String finalAnswer = formatLlmAnswer(rawAnswer, category, msg, troubleshooting);

        memoryService.addMessage(session, "AI", finalAnswer, category);

        return new ChatMessageResponse(
                session.getId(),
                finalAnswer,
                category,
                sourceType,
                webSearchUsed,
                sources,
                troubleshooting,
                llmService.getActiveProviderName()
        );
    }

    private String formatLlmAnswer(String raw, String category, String query, ChatMessageResponse.TroubleshootingDetail troubles) {
        if (raw != null && !raw.isBlank() && !raw.startsWith("{")) {
            return raw;
        }

        if ("PROJECT_TROUBLESHOOTING".equals(category) && troubles != null) {
            return "🔧 **Project Troubleshooting Analysis**\n\n" +
                    "**Likely Cause:** " + troubles.getLikelyCause() + "\n\n" +
                    "**Recommended Diagnostic Checks:**\n" +
                    String.join("\n", troubles.getRecommendedChecks().stream().map(c -> "• " + c).toList()) + "\n\n" +
                    "**Suggested Terminal Commands:**\n`" + String.join("`\n`", troubles.getSuggestedCommands()) + "`";
        }

        if ("PROJECT_SPECIFIC".equals(category)) {
            return "🟢 **IntelliTutor Project Knowledge**\n\n" +
                    "IntelliTutor is an educational cloud-native LMS platform built with 5 Spring Boot microservices:\n" +
                    "• **api-gateway** (Port 8080): Centralized routing, Keycloak OAuth2 JWT security, & Redis rate limiting.\n" +
                    "• **user-service** (Port 8081): Auth & profile management.\n" +
                    "• **course-service** (Port 8082): Syllabus & course enrollments.\n" +
                    "• **quiz-service** (Port 8083): Practice assessments & attempt score logging.\n" +
                    "• **progress-service** (Port 8084): Module completion tracking.\n" +
                    "• **tutor-service** (Port 8085): AI Chatbot RAG engine & AI Command Terminal.";
        }

        return "The IntelliTutor Platform provides interactive microservices learning materials and AI assistance. How else can I assist you with your courses?";
    }
}
