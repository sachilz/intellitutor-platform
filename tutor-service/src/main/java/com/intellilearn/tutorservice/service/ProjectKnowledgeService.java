package com.intellilearn.tutorservice.service;

import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

@Service
public class ProjectKnowledgeService {

    public static class KnowledgeResult {
        private final String context;
        private final List<String> sources;

        public KnowledgeResult(String context, List<String> sources) {
            this.context = context;
            this.sources = sources;
        }

        public String getContext() { return context; }
        public List<String> getSources() { return sources; }
    }

    public KnowledgeResult retrieveProjectContext(String query) {
        String q = query != null ? query.toLowerCase(Locale.ROOT) : "";
        StringBuilder contextBuilder = new StringBuilder();
        List<String> sources = new ArrayList<>();

        contextBuilder.append("--- INTELLITUTOR PLATFORM AUTHORITATIVE ARCHITECTURE CONTEXT ---\n");
        contextBuilder.append("System Overview: Cloud-native Learning Management System built using a Microservices Architecture.\n");
        contextBuilder.append("Port Map: API Gateway (8080), User Service (8081), Course Service (8082), Quiz Service (8083), Progress Service (8084), Tutor Service (8085), Keycloak IAM (8180), Redis Cache (6379), MongoDB (27017), React Client (3000).\n");
        sources.add("Architecture_Specification.pdf");

        if (q.contains("gateway") || q.contains("rate limit") || q.contains("redis") || q.contains("cors") || q.contains("route")) {
            contextBuilder.append("\nAPI Gateway Details: Built with Spring Cloud Gateway (port 8080). Routes /api/users/**, /api/auth/**, /api/courses/**, /api/quizzes/**, /api/progress/**, and /api/tutor/**. Attaches X-API-KEY service secrets and enforces Redis IP Rate Limiting (replenishRate: 5, burstCapacity: 10).\n");
            sources.add("API_Gateway_Config.pdf");
        }

        if (q.contains("auth") || q.contains("keycloak") || q.contains("jwt") || q.contains("token") || q.contains("401") || q.contains("security")) {
            contextBuilder.append("\nKeycloak IAM & Security: Keycloak 25.0 runs on port 8180 under realm 'intellilearn'. Emits OAuth2 JWT Bearer tokens validated centrally at API Gateway. Microservices communicate using X-API-KEY headers.\n");
            sources.add("Keycloak_OAuth2_Security.pdf");
        }

        if (q.contains("quiz") || q.contains("score") || q.contains("attempt")) {
            contextBuilder.append("\nQuiz & Assessment Service: Runs on port 8083 connecting to MongoDB 'quizdb'. Stores quiz attempts in 'quiz_attempts' collection with user score, percentage, and submission timestamps.\n");
            sources.add("Quiz_Service_Manual.pdf");
        }

        if (q.contains("progress") || q.contains("streak") || q.contains("xp")) {
            contextBuilder.append("\nLearning Progress Service: Runs on port 8084 connecting to MongoDB 'progressdb'. Tracks completion percentages, study session time analytics, and student progress metrics.\n");
            sources.add("Progress_Service_Design.pdf");
        }

        if (q.contains("mongo") || q.contains("database") || q.contains("collection")) {
            contextBuilder.append("\nMongoDB Persistence: Single MongoDB 7.0 container (port 27017) with persistent volume 'mongodb-data'. Maintains databases: userdb, coursedb, quizdb, progressdb, tutordb.\n");
            sources.add("MongoDB_Architecture_Guide.pdf");
        }

        contextBuilder.append("\nGUARDRAIL DIRECTIVE: If the retrieved project context above does not contain enough details to answer the user question, state clearly: 'The required project details are not available in the IntelliTutor knowledge base.' Do NOT invent facts.");

        return new KnowledgeResult(contextBuilder.toString(), sources);
    }
}
