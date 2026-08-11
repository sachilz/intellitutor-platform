package com.intellilearn.tutorservice.service;

import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

@Component
public class CommandSafetyFilter {

    public static class SafetyResult {
        private final String riskLevel;
        private final boolean requiresConfirmation;
        private final List<String> warningFlags;

        public SafetyResult(String riskLevel, boolean requiresConfirmation, List<String> warningFlags) {
            this.riskLevel = riskLevel;
            this.requiresConfirmation = requiresConfirmation;
            this.warningFlags = warningFlags;
        }

        public String getRiskLevel() { return riskLevel; }
        public boolean isRequiresConfirmation() { return requiresConfirmation; }
        public List<String> getWarningFlags() { return warningFlags; }
    }

    public SafetyResult evaluateRisk(String command) {
        if (command == null || command.isBlank()) {
            return new SafetyResult("LOW", false, List.of());
        }

        String cmd = command.toLowerCase(Locale.ROOT).trim();
        List<String> warnings = new ArrayList<>();

        // Critical destructive commands
        if (cmd.contains("rm -rf /") || cmd.contains("mkfs") || cmd.contains("dd if=") || cmd.contains(":(){ :|:& };:")) {
            warnings.add("Destructive command targeting root system or partition formatting!");
            return new SafetyResult("CRITICAL", true, warnings);
        }

        if (cmd.contains("rm -rf") || cmd.contains("rm -f") || cmd.contains("drop database") || cmd.contains("systemctl stop")) {
            warnings.add("Forceful deletion or service shutdown command detected!");
            return new SafetyResult("HIGH", true, warnings);
        }

        if (cmd.contains("sudo") || cmd.contains("chmod 777") || cmd.contains("chown") || cmd.contains("docker prune") || cmd.contains("docker kill")) {
            warnings.add("Administrative privilege modification or Docker cleanup action.");
            return new SafetyResult("MEDIUM", true, warnings);
        }

        return new SafetyResult("LOW", false, warnings);
    }
}
