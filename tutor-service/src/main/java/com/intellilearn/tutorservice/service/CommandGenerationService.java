package com.intellilearn.tutorservice.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.intellilearn.tutorservice.dto.CommandRequest;
import com.intellilearn.tutorservice.dto.CommandResponse;
import com.intellilearn.tutorservice.dto.DiagnoseRequest;
import com.intellilearn.tutorservice.dto.DiagnoseResponse;
import com.intellilearn.tutorservice.entity.CommandHistory;
import com.intellilearn.tutorservice.repository.CommandHistoryRepository;
import com.intellilearn.tutorservice.service.llm.LlmService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Map;

@Service
public class CommandGenerationService {

    private static final Logger log = LoggerFactory.getLogger(CommandGenerationService.class);

    private final LlmService llmService;
    private final CommandSafetyFilter safetyFilter;
    private final CommandHistoryRepository historyRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public CommandGenerationService(LlmService llmService, CommandSafetyFilter safetyFilter, CommandHistoryRepository historyRepository) {
        this.llmService = llmService;
        this.safetyFilter = safetyFilter;
        this.historyRepository = historyRepository;
    }

    public CommandResponse generateCommand(CommandRequest request) {
        String prompt = request.getPrompt();
        String rawCompletion = llmService.generateCompletion(prompt);

        String command = "find ~ -type f -size +100M";
        String explanation = "Locates regular files in home directory larger than 100MB.";
        String suggestedRisk = "LOW";

        try {
            if (rawCompletion.startsWith("{") && rawCompletion.endsWith("}")) {
                Map map = objectMapper.readValue(rawCompletion, Map.class);
                if (map.containsKey("command")) command = (String) map.get("command");
                if (map.containsKey("explanation")) explanation = (String) map.get("explanation");
                if (map.containsKey("riskLevel")) suggestedRisk = (String) map.get("riskLevel");
            }
        } catch (Exception e) {
            log.warn("Could not parse JSON completion: {}", e.getMessage());
        }

        CommandSafetyFilter.SafetyResult safety = safetyFilter.evaluateRisk(command);
        String finalRisk = safety.getRiskLevel().equals("LOW") ? suggestedRisk : safety.getRiskLevel();

        CommandHistory history = new CommandHistory(
                null,
                request.getUserId() != null ? request.getUserId() : "student1@intellilearn.com",
                request.getCourseId(),
                prompt,
                command,
                explanation,
                finalRisk,
                false,
                null,
                llmService.getActiveProviderName(),
                LocalDateTime.now()
        );

        CommandHistory saved = historyRepository.save(history);

        return new CommandResponse(
                saved.getId(),
                prompt,
                command,
                explanation,
                finalRisk,
                safety.isRequiresConfirmation(),
                safety.getWarningFlags(),
                llmService.getActiveProviderName()
        );
    }

    public DiagnoseResponse diagnoseError(DiagnoseRequest request) {
        String cmd = request.getCommand();
        String err = request.getError();

        String diagnosis = "Error indicates process or connection issue while running '" + cmd + "'";
        List<String> causes = Arrays.asList(
                "Target process is not listening on the specified port",
                "Docker container daemon is stopped or restarted",
                "Permission denied accessing socket or system file"
        );
        List<String> suggested = Arrays.asList(
                "docker ps -a",
                "sudo systemctl status docker",
                "netstat -tuln | grep 8080"
        );
        String explanation = "Check container status and socket permissions before re-running.";

        return new DiagnoseResponse(cmd, err, diagnosis, causes, suggested, explanation);
    }

    public List<CommandHistory> getUserHistory(String userId) {
        if (userId != null && !userId.isBlank()) {
            return historyRepository.findByUserIdOrderByTimestampDesc(userId);
        }
        return historyRepository.findTop10ByOrderByTimestampDesc();
    }
}
