package com.intellilearn.course_service.security;

import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SecurityConfig {

    private final ApiKeyAuthFilter apiKeyAuthFilter;

    public SecurityConfig(ApiKeyAuthFilter apiKeyAuthFilter) {
        this.apiKeyAuthFilter = apiKeyAuthFilter;
    }

    @Bean
    public FilterRegistrationBean<ApiKeyAuthFilter> apiKeyFilterRegistration() {
        FilterRegistrationBean<ApiKeyAuthFilter> registration = new FilterRegistrationBean<>();
        registration.setFilter(apiKeyAuthFilter);
        registration.addUrlPatterns("/courses/*", "/courses");
        registration.setOrder(1);
        return registration;
    }
}
