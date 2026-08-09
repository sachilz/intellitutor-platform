package com.intellilearn.course_service.dto;

import jakarta.validation.constraints.NotBlank;
import java.util.List;

public class CreateCourseRequest {

    @NotBlank(message = "Title is required")
    private String title;

    @NotBlank(message = "Description is required")
    private String description;

    private String instructorId;
    private List<String> materials;

    public CreateCourseRequest() {
    }

    public CreateCourseRequest(String title, String description, String instructorId, List<String> materials) {
        this.title = title;
        this.description = description;
        this.instructorId = instructorId;
        this.materials = materials;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getInstructorId() {
        return instructorId;
    }

    public void setInstructorId(String instructorId) {
        this.instructorId = instructorId;
    }

    public List<String> getMaterials() {
        return materials;
    }

    public void setMaterials(List<String> materials) {
        this.materials = materials;
    }
}
