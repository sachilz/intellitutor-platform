package com.intellilearn.quizservice.controller;

import com.intellilearn.quizservice.dto.AssessmentResultDto;
import com.intellilearn.quizservice.dto.QuizSubmissionDto;
import com.intellilearn.quizservice.entity.Quiz;
import com.intellilearn.quizservice.service.QuizService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * REST endpoints for the Quiz &amp; Assessment service. All endpoints require a
 * valid {@code X-API-Key} header (enforced by {@code ApiKeyFilter}); Swagger
 * UI and the OpenAPI docs are the only public exceptions.
 */
@RestController
@RequestMapping("/api/quizzes")
@Tag(name = "Quiz & Assessment", description = "Manage quizzes and submit assessments")
@SecurityRequirement(name = "apiKey")
public class QuizController {

    private final QuizService quizService;

    public QuizController(QuizService quizService) {
        this.quizService = quizService;
    }

    @GetMapping
    @Operation(summary = "Get all quizzes", description = "Returns all available quizzes including their questions.")
    @ApiResponse(responseCode = "200", description = "List of quizzes",
            content = @Content(schema = @Schema(implementation = Quiz.class)))
    public List<Quiz> getAllQuizzes() {
        return quizService.getAllQuizzes();
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get a quiz by id", description = "Returns a single quiz including its questions.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Quiz found",
                    content = @Content(schema = @Schema(implementation = Quiz.class))),
            @ApiResponse(responseCode = "401", description = "Missing or invalid API key"),
            @ApiResponse(responseCode = "404", description = "Quiz not found")
    })
    public Quiz getQuizById(@Parameter(description = "Quiz id", example = "1") @PathVariable Long id) {
        return quizService.getQuizById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Create a quiz", description = "Creates a new quiz with its questions. Requires the ADMIN role.")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Quiz created",
                    content = @Content(schema = @Schema(implementation = Quiz.class))),
            @ApiResponse(responseCode = "400", description = "Invalid quiz payload"),
            @ApiResponse(responseCode = "401", description = "Missing or invalid API key"),
            @ApiResponse(responseCode = "403", description = "Requires X-User-Role: ADMIN")
    })
    public Quiz createQuiz(
            @Parameter(description = "Quiz to create (title, description, questions[])") @RequestBody Quiz quiz,
            @Parameter(description = "Role of the calling user (set by the API Gateway)", example = "ADMIN")
            @RequestHeader(value = "X-User-Role", required = false) String userRole) {
        return quizService.createQuiz(quiz, userRole);
    }

    @PostMapping("/{id}/submit")
    @Operation(summary = "Submit a quiz attempt",
            description = "Evaluates the submitted answers and returns the score with personalised feedback and recommendations.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Assessment result",
                    content = @Content(schema = @Schema(implementation = AssessmentResultDto.class))),
            @ApiResponse(responseCode = "400", description = "Answer count does not match question count"),
            @ApiResponse(responseCode = "401", description = "Missing or invalid API key"),
            @ApiResponse(responseCode = "404", description = "Quiz not found")
    })
    public AssessmentResultDto submitQuiz(
            @Parameter(description = "Quiz id", example = "1") @PathVariable Long id,
            @Parameter(description = "Selected option indices, one per question") @Valid @RequestBody QuizSubmissionDto submission) {
        return quizService.submitQuiz(id, submission);
    }
}
