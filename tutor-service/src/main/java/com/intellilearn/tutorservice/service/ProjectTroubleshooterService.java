package com.intellilearn.tutorservice.service;

import com.intellilearn.tutorservice.dto.ChatMessageResponse;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.List;
import java.util.Locale;

@Service
public class ProjectTroubleshooterService {

    public ChatMessageResponse.TroubleshootingDetail diagnoseProjectIssue(String message) {
        String q = message != null ? message.toLowerCase(Locale.ROOT) : "";

        if (q.contains("401") || q.contains("unauthorized") || q.contains("token") || q.contains("keycloak")) {
            return new ChatMessageResponse.TroubleshootingDetail(
                    "Missing or invalid Keycloak OAuth2 Bearer token, or missing X-API-KEY microservice header in Gateway route filter.",
                    Arrays.asList(
                            "Verify Keycloak realm container status at http://localhost:8180/realms/intellilearn",
                            "Check Gateway SecurityConfig path matchers for /api/tutor/** or /api/quizzes/**",
                            "Ensure React Axios client passes Bearer Authorization header in requests"
                    ),
                    Arrays.asList(
                            "curl -i http://localhost:8080/gateway/health",
                            "docker logs keycloak",
                            "docker logs api-gateway"
                    )
            );
        } else if (q.contains("cors")) {
            return new ChatMessageResponse.TroubleshootingDetail(
                    "CORS preflight OPTIONS request rejected by API Gateway global CORS policy.",
                    Arrays.asList(
                            "Ensure http://localhost:3000 is allowed in api-gateway application.yml allowedOrigins",
                            "Verify SecurityConfig allows HttpMethod.OPTIONS for /** without authentication"
                    ),
                    Arrays.asList(
                            "curl -i -X OPTIONS http://localhost:8080/api/courses -H 'Origin: http://localhost:3000' -H 'Access-Control-Request-Method: GET'"
                    )
            );
        } else if (q.contains("connection refused") || q.contains("port") || q.contains("netty") || q.contains("500")) {
            return new ChatMessageResponse.TroubleshootingDetail(
                    "Target microservice container is stopped, restarting, or netty socket connection was refused.",
                    Arrays.asList(
                            "Check docker container health statuses via docker compose ps",
                            "Verify database connection string MONGODB_URI=mongodb://mongodb:27017/tutordb",
                            "Allow 3-5 seconds for Spring Boot JVM context initialization after container restart"
                    ),
                    Arrays.asList(
                            "docker compose ps",
                            "docker logs tutor-service",
                            "docker compose restart tutor-service"
                    )
            );
        }

        return new ChatMessageResponse.TroubleshootingDetail(
                "General platform configuration anomaly or missing container dependency.",
                Arrays.asList(
                        "Inspect Docker container logs for exception stack traces",
                        "Verify API Gateway route mapping for downstream microservice target port"
                ),
                Arrays.asList(
                        "docker compose ps",
                        "docker logs api-gateway"
                )
        );
    }
}
