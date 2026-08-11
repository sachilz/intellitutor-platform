package com.intellilearn.tutorservice.controller;

import com.intellilearn.tutorservice.dto.CommandRequest;
import com.intellilearn.tutorservice.dto.CommandResponse;
import com.intellilearn.tutorservice.dto.DiagnoseRequest;
import com.intellilearn.tutorservice.dto.DiagnoseResponse;
import com.intellilearn.tutorservice.entity.CommandHistory;
import com.intellilearn.tutorservice.repository.CommandHistoryRepository;
import com.intellilearn.tutorservice.service.CommandGenerationService;
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
    private final CommandHistoryRepository historyRepository;

    public CommandController(CommandGenerationService commandService, CommandHistoryRepository historyRepository) {
        this.commandService = commandService;
        this.historyRepository = historyRepository;
    }

    @PostMapping("/generate")
    @Operation(summary = "Generate CLI command from natural language prompt")
    public ResponseEntity<CommandResponse> generateCommand(@Valid @RequestBody CommandRequest request) {
        return ResponseEntity.ok(commandService.generateCommand(request));
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
}
