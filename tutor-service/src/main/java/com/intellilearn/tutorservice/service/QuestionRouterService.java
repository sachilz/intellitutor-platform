package com.intellilearn.tutorservice.service;

import org.springframework.stereotype.Service;

import java.util.Locale;

@Service
public class QuestionRouterService {

    public String classifyQuestion(String message) {
        if (message == null || message.isBlank()) {
            return "GENERAL_KNOWLEDGE";
        }

        String q = message.toLowerCase(Locale.ROOT);

        boolean isTroubleshooting = q.contains("401") || q.contains("cors") || q.contains("connection refused") ||
                q.contains("failing") || q.contains("error") || q.contains("bug") || q.contains("exception") ||
                q.contains("unauthorized") || q.contains("cannot connect") || q.contains("timeout");

        boolean isProject = q.contains("intellitutor") || q.contains("intellilearn") || q.contains("user-service") ||
                q.contains("course-service") || q.contains("quiz-service") || q.contains("progress-service") ||
                q.contains("tutor-service") || q.contains("gateway") || q.contains("keycloak") || q.contains("tutordb") ||
                q.contains("coursedb") || q.contains("quizdb") || q.contains("userdb") || q.contains("progressdb") ||
                q.contains("our project") || q.contains("this platform") || q.contains("microservice");

        boolean isWeb = q.contains("latest") || q.contains("current version") || q.contains("recent release") ||
                q.contains("today") || q.contains("news") || q.contains("2026") || q.contains("documentation for") ||
                q.contains("spring boot 3") || q.contains("react 19");

        if (isTroubleshooting && isProject) {
            return "PROJECT_TROUBLESHOOTING";
        }

        if (isProject && isWeb) {
            return "MIXED";
        }

        if (isProject) {
            return "PROJECT_SPECIFIC";
        }

        if (isTroubleshooting) {
            return "PROJECT_TROUBLESHOOTING";
        }

        if (isWeb) {
            return "CURRENT_WEB_INFORMATION";
        }

        return "GENERAL_KNOWLEDGE";
    }
}
