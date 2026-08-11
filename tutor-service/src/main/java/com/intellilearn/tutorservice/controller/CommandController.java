package com.intellilearn.tutorservice.controller;

import com.intellilearn.tutorservice.dto.*;
import com.intellilearn.tutorservice.entity.CommandHistory;
import com.intellilearn.tutorservice.repository.CommandHistoryRepository;
import com.intellilearn.tutorservice.service.CommandGenerationService;
import com.intellilearn.tutorservice.service.ControlledExecutorService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/tutor/command")
@Tag(name = "AI Command Terminal", description = "AI-powered terminal command generation, diagnosis, and safety engine")
@SecurityRequirement(name = "apiKey")
public class CommandController {

    private final CommandGenerationService commandService;
    private final ControlledExecutorService executorService;
    private final CommandHistoryRepository historyRepository;

    public CommandController(CommandGenerationService commandService, 
                             ControlledExecutorService executorService, 
                             CommandHistoryRepository historyRepository) {
        this.commandService = commandService;
        this.executorService = executorService;
        this.historyRepository = historyRepository;
    }

    @PostMapping("/generate")
    @Operation(summary = "Generate CLI command from natural language prompt")
    public ResponseEntity<CommandResponse> generateCommand(@Valid @RequestBody CommandRequest request) {
        return ResponseEntity.ok(commandService.generateCommand(request));
    }

    @PostMapping("/explain")
    @Operation(summary = "Deconstruct and explain CLI flags line-by-line")
    public ResponseEntity<ExplainResponse> explainCommand(@Valid @RequestBody ExplainRequest request) {
        return ResponseEntity.ok(commandService.explainCommand(request));
    }

    @PostMapping("/execute")
    @Operation(summary = "Execute command safely in controlled sandbox process")
    public ResponseEntity<ExecuteResponse> executeCommand(@Valid @RequestBody ExecuteRequest request) {
        return ResponseEntity.ok(executorService.executeCommand(request));
    }

    @PostMapping("/diagnose")
    @Operation(summary = "Diagnose terminal error traces and suggest fixes")
    public ResponseEntity<DiagnoseResponse> diagnoseError(@Valid @RequestBody DiagnoseRequest request) {
        return ResponseEntity.ok(commandService.diagnoseError(request));
    }

    @GetMapping("/history")
    @Operation(summary = "Fetch command history for user")
    public ResponseEntity<List<CommandHistory>> getHistory(@RequestParam(required = false) String userId) {
        return ResponseEntity.ok(commandService.getUserHistory(userId));
    }

    @DeleteMapping("/history")
    @Operation(summary = "Clear command history")
    public ResponseEntity<Void> clearHistory() {
        historyRepository.deleteAll();
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/history/{id}")
    @Operation(summary = "Delete single command history item")
    public ResponseEntity<Void> deleteHistoryItem(@PathVariable String id) {
        historyRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
