package com.intellilearn.progress_service.controller;

import com.intellilearn.progress_service.dto.CreateProgressRequest;
import com.intellilearn.progress_service.dto.UpdateProgressRequest;
import com.intellilearn.progress_service.model.Progress;
import com.intellilearn.progress_service.service.ProgressService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/progress")
@Tag(name = "Progress Service", description = "API endpoints for tracking user course progress")
public class ProgressController {

    private final ProgressService progressService;

    public ProgressController(ProgressService progressService) {
        this.progressService = progressService;
    }

    @GetMapping
    @Operation(summary = "Get all progress records", description = "Retrieves all progress records across all users")
    public ResponseEntity<List<Progress>> getAllProgress() {
        return ResponseEntity.ok(progressService.getAllProgress());
    }

    @PostMapping
    @Operation(summary = "Create progress record", description = "Creates a new progress record initialized with 0% completion for a user and course")
    public ResponseEntity<Progress> createProgress(@Valid @RequestBody CreateProgressRequest request) {
        Progress progress = progressService.createProgress(request.getUserId(), request.getCourseId());
        return new ResponseEntity<>(progress, HttpStatus.CREATED);
    }

    @GetMapping("/{userId}")
    @Operation(summary = "Get all progress for a user", description = "Retrieves all progress records associated with a specific user ID")
    public ResponseEntity<List<Progress>> getProgressByUserId(@PathVariable String userId) {
        List<Progress> progressList = progressService.getProgressByUserId(userId);
        return ResponseEntity.ok(progressList);
    }

    @GetMapping("/{userId}/{courseId}")
    @Operation(summary = "Get progress for user and course", description = "Retrieves the progress record for a specific user and course pair")
    public ResponseEntity<Progress> getProgressByUserIdAndCourseId(
            @PathVariable String userId,
            @PathVariable String courseId) {
        Progress progress = progressService.getProgressByUserIdAndCourseId(userId, courseId);
        return ResponseEntity.ok(progress);
    }

    @PutMapping("/{userId}/{courseId}")
    @Operation(summary = "Update completion percentage", description = "Updates the completion percentage (0-100) and last accessed timestamp for a user and course")
    public ResponseEntity<Progress> updateCompletedPercent(
            @PathVariable String userId,
            @PathVariable String courseId,
            @Valid @RequestBody UpdateProgressRequest request) {
        Progress progress = progressService.updateCompletedPercent(userId, courseId, request.getCompletedPercent());
        return ResponseEntity.ok(progress);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete progress record", description = "Deletes a progress record by its unique ID")
    public ResponseEntity<Void> deleteProgress(@PathVariable String id) {
        progressService.deleteProgress(id);
        return ResponseEntity.noContent().build();
    }
}
