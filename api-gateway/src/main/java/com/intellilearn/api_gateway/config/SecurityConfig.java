package com.intellilearn.api_gateway.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.buffer.DataBuffer;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.security.config.annotation.web.reactive.EnableWebFluxSecurity;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.web.server.SecurityWebFilterChain;
import org.springframework.security.web.server.ServerAuthenticationEntryPoint;
import reactor.core.publisher.Mono;

import java.nio.charset.StandardCharsets;

@Configuration
@EnableWebFluxSecurity
public class SecurityConfig {

    @Bean
    public SecurityWebFilterChain securityWebFilterChain(ServerHttpSecurity http) {
        ServerAuthenticationEntryPoint entryPoint = customAuthenticationEntryPoint();

        http
                .csrf(ServerHttpSecurity.CsrfSpec::disable)
                .authorizeExchange(exchanges -> exchanges
                        .pathMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        .pathMatchers(
                                "/gateway/health",
                                "/swagger-ui.html",
                                "/swagger-ui/**",
                                "/v3/api-docs/**",
                                "/v3/api-docs",
                                "/webjars/**",
                                "/user-service/**",
                                "/course-service/**",
                                "/quiz-service/**",
                                "/progress-service/**",
                                "/tutor-service/**",
                                "/api/auth/**",
                                "/api/courses/**",
                                "/api/progress/**",
                                "/api/quizzes/**",
                                "/api/tutor/**"
                        ).permitAll()
                        .pathMatchers("/api/**").authenticated()
                        .anyExchange().authenticated())
                .oauth2ResourceServer(oauth2 -> oauth2
                        .jwt(jwt -> {
                        })
                        .authenticationEntryPoint(entryPoint))
                .exceptionHandling(exceptionHandling -> exceptionHandling
                        .authenticationEntryPoint(entryPoint));

        return http.build();
    }

    private ServerAuthenticationEntryPoint customAuthenticationEntryPoint() {
        return (exchange, ex) -> {
            String path = exchange.getRequest().getURI().getPath();
            if (path.startsWith("/api/auth/") || path.startsWith("/api/courses") || path.startsWith("/api/progress")
                    || path.startsWith("/api/quizzes") || path.startsWith("/api/tutor") || path.equals("/gateway/health")
                    || path.startsWith("/swagger-ui") || path.startsWith("/v3/api-docs") || path.startsWith("/webjars")
                    || path.startsWith("/user-service") || path.startsWith("/course-service")
                    || path.startsWith("/quiz-service") || path.startsWith("/progress-service")
                    || path.startsWith("/tutor-service")) {
                return Mono.empty();
            }

            ServerHttpResponse response = exchange.getResponse();
            response.setStatusCode(HttpStatus.UNAUTHORIZED);
            response.getHeaders().setContentType(MediaType.APPLICATION_JSON);

            String body = "{\"error\":\"Unauthorized\",\"message\":\"Authentication token is missing or invalid\"}";
            byte[] bytes = body.getBytes(StandardCharsets.UTF_8);
            DataBuffer buffer = response.bufferFactory().wrap(bytes);
            return response.writeWith(Mono.just(buffer));
        };
    }
}