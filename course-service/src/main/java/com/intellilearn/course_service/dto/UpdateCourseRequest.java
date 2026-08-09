package com.intellilearn.course_service.dto;

import java.util.List;

public class UpdateCourseRequest {

    private String title;
    private String description;
    private String instructorId;
    private List<String> materials;

    public UpdateCourseRequest() {
    }

    public UpdateCourseRequest(String title, String description, String instructorId, List<String> materials) {
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
