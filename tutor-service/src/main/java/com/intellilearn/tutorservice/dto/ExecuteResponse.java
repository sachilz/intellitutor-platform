package com.intellilearn.tutorservice.dto;

public class ExecuteResponse {
    private String command;
    private String status; // SUCCESS, FAILED, BLOCKED_HIGH_RISK
    private int exitCode;
    private String stdout;
    private String stderr;
    private long durationMs;

    public ExecuteResponse() {}

    public ExecuteResponse(String command, String status, int exitCode, String stdout, String stderr, long durationMs) {
        this.command = command;
        this.status = status;
        this.exitCode = exitCode;
        this.stdout = stdout;
        this.stderr = stderr;
        this.durationMs = durationMs;
    }

    public String getCommand() { return command; }
    public void setCommand(String command) { this.command = command; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public int getExitCode() { return exitCode; }
    public void setExitCode(int exitCode) { this.exitCode = exitCode; }
    public String getStdout() { return stdout; }
    public void setStdout(String stdout) { this.stdout = stdout; }
    public String getStderr() { return stderr; }
    public void setStderr(String stderr) { this.stderr = stderr; }
    public long getDurationMs() { return durationMs; }
    public void setDurationMs(long durationMs) { this.durationMs = durationMs; }
}
