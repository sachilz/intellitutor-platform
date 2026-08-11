package com.intellilearn.tutorservice.service.llm;

import org.springframework.stereotype.Component;

import java.util.Locale;

@Component
public class MockLlmProvider implements LlmProvider {

    @Override
    public String generateCompletion(String prompt) {
        String p = prompt != null ? prompt.toLowerCase(Locale.ROOT) : "";

        if (p.contains("large file") || p.contains("size")) {
            return "{\"command\": \"find ~ -type f -size +100M\", \"explanation\": \"Scans the home directory (~) for regular files (-type f) exceeding 100 Megabytes (+100M).\", \"riskLevel\": \"LOW\"}";
        } else if (p.contains("docker container") || p.contains("running container")) {
            return "{\"command\": \"docker ps -a\", \"explanation\": \"Lists all Docker containers on the host system, including running, exited, and stopped containers.\", \"riskLevel\": \"LOW\"}";
        } else if (p.contains("port 8080") || p.contains("port")) {
            return "{\"command\": \"lsof -i :8080\", \"explanation\": \"Displays process details and PIDs currently listening or transmitting on network port 8080.\", \"riskLevel\": \"LOW\"}";
        } else if (p.contains("disk usage") || p.contains("space")) {
            return "{\"command\": \"df -h\", \"explanation\": \"Displays human-readable (-h) summary of file system disk space usage across all mounted drives.\", \"riskLevel\": \"LOW\"}";
        } else if (p.contains("modified today") || p.contains("recent file")) {
            return "{\"command\": \"find . -mtime 0\", \"explanation\": \"Finds all files in the current working directory modified within the last 24 hours.\", \"riskLevel\": \"LOW\"}";
        } else if (p.contains("restart nginx") || p.contains("nginx")) {
            return "{\"command\": \"sudo systemctl restart nginx\", \"explanation\": \"Restarts the Nginx reverse-proxy service using systemctl with administrative privileges.\", \"riskLevel\": \"HIGH\"}";
        } else if (p.contains("delete") || p.contains("remove") || p.contains("rm -rf")) {
            return "{\"command\": \"rm -rf /tmp/scratch_data\", \"explanation\": \"Recursively and forcefully deletes the target directory and all contained files without prompting.\", \"riskLevel\": \"CRITICAL\"}";
        } else {
            return "{\"command\": \"echo 'Processing query: " + prompt.replaceAll("[\"\\\\]", "") + "'\", \"explanation\": \"Executes standard command analysis for query.\", \"riskLevel\": \"LOW\"}";
        }
    }

    @Override
    public String getProviderName() {
        return "Local-Mock-Engine";
    }

    @Override
    public boolean isAvailable() {
        return true;
    }
}
