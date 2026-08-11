package com.intellilearn.progress_service.model;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "progress")
public class Progress {

    @Id
    private String id;

    @NotBlank(message = "userId is required")
    private String userId;

    @NotBlank(message = "courseId is required")
    private String courseId;

    @Min(value = 0, message = "completedPercent must be at least 0")
    @Max(value = 100, message = "completedPercent must be at most 100")
    private int completedPercent;

    private LocalDateTime lastAccessed;

    public Progress() {
    }

    public Progress(String id, String userId, String courseId, int completedPercent, LocalDateTime lastAccessed) {
        this.id = id;
        this.userId = userId;
        this.courseId = courseId;
        this.completedPercent = completedPercent;
        this.lastAccessed = lastAccessed;
    }

    public Progress(String userId, String courseId, int completedPercent, LocalDateTime lastAccessed) {
        this.userId = userId;
        this.courseId = courseId;
        this.completedPercent = completedPercent;
        this.lastAccessed = lastAccessed;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getCourseId() {
        return courseId;
    }

    public void setCourseId(String courseId) {
        this.courseId = courseId;
    }

    public int getCompletedPercent() {
        return completedPercent;
    }

    public void setCompletedPercent(int completedPercent) {
        this.completedPercent = completedPercent;
    }

    public LocalDateTime getLastAccessed() {
        return lastAccessed;
    }

    public void setLastAccessed(LocalDateTime lastAccessed) {
        this.lastAccessed = lastAccessed;
    }
}
