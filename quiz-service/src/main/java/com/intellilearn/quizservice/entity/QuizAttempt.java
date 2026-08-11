package com.intellilearn.quizservice.entity;

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
@Document(collection = "quiz_attempts")
public class QuizAttempt {

    @Id
    private String id;
    private String quizId;
    private String userId;
    private int score;
    private int correctAnswersCount;
    private int totalQuestions;
    private String feedback;
    private List<String> recommendations;
    private LocalDateTime submittedAt;
}
