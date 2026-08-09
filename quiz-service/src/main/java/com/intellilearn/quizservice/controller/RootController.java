package com.intellilearn.quizservice.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

/**
 * Root path handler: redirects a browser hitting {@code GET /} to the Swagger
 * UI documentation. The root is exempt from the API key (see
 * {@code ApiKeyFilter#shouldNotFilter}) because a browser cannot send the
 * {@code X-API-Key} header.
 */
@Controller
public class RootController {

    @GetMapping("/")
    public String redirectToSwagger() {
        return "redirect:/swagger-ui.html";
    }
}
