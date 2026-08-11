package com.intellilearn.tutorservice.service;

import com.intellilearn.tutorservice.dto.ExecuteRequest;
import com.intellilearn.tutorservice.dto.ExecuteResponse;
import com.intellilearn.tutorservice.entity.CommandHistory;
import com.intellilearn.tutorservice.repository.CommandHistoryRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.util.Optional;
import java.util.concurrent.TimeUnit;

@Service
public class ControlledExecutorService {

    private static final Logger log = LoggerFactory.getLogger(ControlledExecutorService.class);

    private final CommandSafetyFilter safetyFilter;
    private final CommandHistoryRepository historyRepository;

    public ControlledExecutorService(CommandSafetyFilter safetyFilter, CommandHistoryRepository historyRepository) {
        this.safetyFilter = safetyFilter;
        this.historyRepository = historyRepository;
    }

    public ExecuteResponse executeCommand(ExecuteRequest request) {
        String command = request.getCommand();
        long startTime = System.currentTimeMillis();

        CommandSafetyFilter.SafetyResult safety = safetyFilter.evaluateRisk(command);
        if ("HIGH".equals(safety.getRiskLevel()) || "CRITICAL".equals(safety.getRiskLevel())) {
            log.warn("Blocked high-risk command execution attempt: {}", command);
            return new ExecuteResponse(
                    command,
                    "BLOCKED_HIGH_RISK",
                    -1,
                    "",
                    "Execution blocked by Command Safety Engine. Command is classified as HIGH/CRITICAL risk.",
                    System.currentTimeMillis() - startTime
            );
        }

        StringBuilder stdout = new StringBuilder();
        StringBuilder stderr = new StringBuilder();
        int exitCode = -1;
        String status = "SUCCESS";

        try {
            ProcessBuilder pb = new ProcessBuilder("sh", "-c", command);
            pb.redirectErrorStream(false);
            Process process = pb.start();

            try (BufferedReader stdOutReader = new BufferedReader(new InputStreamReader(process.getInputStream()));
                 BufferedReader stdErrReader = new BufferedReader(new InputStreamReader(process.getErrorStream()))) {

                String line;
                while ((line = stdOutReader.readLine()) != null) {
                    stdout.append(line).append("\n");
                }
                while ((line = stdErrReader.readLine()) != null) {
                    stderr.append(line).append("\n");
                }
            }

            boolean completed = process.waitFor(5, TimeUnit.SECONDS);
            if (!completed) {
                process.destroyForcibly();
                status = "FAILED";
                stderr.append("Execution timed out after 5 seconds.\n");
            } else {
                exitCode = process.exitValue();
                if (exitCode != 0) {
                    status = "FAILED";
                }
            }
        } catch (Exception e) {
            log.error("Execution error for command '{}': {}", command, e.getMessage());
            status = "FAILED";
            stderr.append("Process execution error: ").append(e.getMessage()).append("\n");
        }

        long duration = System.currentTimeMillis() - startTime;
        String outputSummary = stdout.length() > 0 ? stdout.toString().trim() : stderr.toString().trim();

        // Update MongoDB history record if historyId is present
        if (request.getHistoryId() != null && !request.getHistoryId().isBlank()) {
            try {
                Optional<CommandHistory> optionalHistory = historyRepository.findById(request.getHistoryId());
                if (optionalHistory.isPresent()) {
                    CommandHistory history = optionalHistory.get();
                    history.setExecuted(true);
                    history.setExecutionOutput(outputSummary);
                    historyRepository.save(history);
                }
            } catch (Exception e) {
                log.warn("Could not update execution output in MongoDB: {}", e.getMessage());
            }
        }

        return new ExecuteResponse(command, status, exitCode, stdout.toString().trim(), stderr.toString().trim(), duration);
    }
}
