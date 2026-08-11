package com.intellilearn.tutorservice.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "tutor_interactions")
public class TutorInteraction {

    @Id
    private String id;
    private String courseId;
    private String userId;
    private String question;
    private String answer;
    private boolean grounded;
    private List<String> sources;
    private LocalDateTime timestamp;
}
