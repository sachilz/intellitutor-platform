package com.intellilearn.progress_service.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;

public class UpdateProgressRequest {

    @Min(value = 0, message = "completedPercent must be at least 0")
    @Max(value = 100, message = "completedPercent must be at most 100")
    private int completedPercent;

    public UpdateProgressRequest() {
    }

    public UpdateProgressRequest(int completedPercent) {
        this.completedPercent = completedPercent;
    }

    public int getCompletedPercent() {
        return completedPercent;
    }

    public void setCompletedPercent(int completedPercent) {
        this.completedPercent = completedPercent;
    }
}
