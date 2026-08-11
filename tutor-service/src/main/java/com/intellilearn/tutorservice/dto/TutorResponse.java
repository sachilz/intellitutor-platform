package com.intellilearn.tutorservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TutorResponse {

    private String courseId;
    private String question;
    private String answer;
    private boolean grounded;
    private List<String> sources;
}
