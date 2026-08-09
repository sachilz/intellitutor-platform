package com.intellilearn.quizservice.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Registers the OpenAPI (Swagger 3) documentation metadata for this service,
 * including the {@code X-API-Key} security scheme so the "Authorize" button in
 * Swagger UI can be used to send the header on every request.
 */
@Configuration
public class OpenApiConfig {

    public static final String SECURITY_SCHEME_NAME = "apiKey";

    @Bean
    public OpenAPI quizServiceOpenApi() {
        return new OpenAPI()
                .info(new Info()
                        .title("Quiz & Assessment Service API")
                        .description("""
                                Quiz and assessment microservice of the IntelliLearn platform
                                (Intelligent Tutor with AI).

                                All endpoints except Swagger UI / OpenAPI docs are protected by
                                the X-API-Key header. The key value is not exposed here - see the
                                service README or the intellilearn.api-key property.
                                """)
                        .version("v1.0.0")
                        .contact(new Contact()
                                .name("ITBIN-2313-0007")
                                .email("itbin23130007@intellilearn.dev"))
                        .license(new License()
                                .name("Apache 2.0")
                                .url("https://www.apache.org/licenses/LICENSE-2.0")))
                .components(new Components()
                        .addSecuritySchemes(SECURITY_SCHEME_NAME,
                                new SecurityScheme()
                                        .type(SecurityScheme.Type.APIKEY)
                                        .in(SecurityScheme.In.HEADER)
                                        .name("X-API-Key")
                                        .description("API key required to access protected endpoints")))
                .addSecurityItem(new SecurityRequirement().addList(SECURITY_SCHEME_NAME));
    }
}
