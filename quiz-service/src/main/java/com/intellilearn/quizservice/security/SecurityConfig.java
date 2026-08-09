package com.intellilearn.quizservice.security;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

/**
 * Spring Security configuration for the Quiz service.
 *
 * <p>This service is stateless and does not use sessions or user passwords.
 * Authentication is delegated to the API Gateway; here we only enforce the
 * {@link ApiKeyFilter} gatekeeper. Every request except the Swagger/OpenAPI
 * and H2 console paths must carry a valid {@code X-API-Key} header.</p>
 */
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    /** Paths that must be reachable without an API key (Swagger UI / OpenAPI docs and their static assets). */
    public static final String[] SWAGGER_WHITELIST = {
            "/v3/api-docs/**",
            "/swagger-ui.html",
            "/swagger-ui/**",
            "/webjars/**"
    };

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http, ApiKeyFilter apiKeyFilter) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .cors(Customizer.withDefaults())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                // Allow the H2 console to render inside its own iframe.
                .headers(headers -> headers.frameOptions(frame -> frame.sameOrigin()))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(SWAGGER_WHITELIST).permitAll()
                        .requestMatchers("/error").permitAll()
                        // Everything else is open to the security chain: the
                        // ApiKeyFilter (added below) is the one that enforces
                        // the API key and returns 401 when it is missing.
                        .anyRequest().permitAll())
                .addFilterBefore(apiKeyFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }

    @Bean
    public ApiKeyFilter apiKeyFilter(@Value("${intellilearn.api-key:INTELLILEARN-QUIZ-KEY-2026}") String apiKey) {
        return new ApiKeyFilter(apiKey);
    }

    /**
     * Permissive CORS for local development. In production the API Gateway is
     * the central CORS owner, so this service can keep a permissive policy
     * without exposing anything that the gateway does not already allow.
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOriginPatterns(List.of("*"));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setExposedHeaders(List.of(ApiKeyFilter.API_KEY_HEADER, "Location"));
        config.setAllowCredentials(false);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}
