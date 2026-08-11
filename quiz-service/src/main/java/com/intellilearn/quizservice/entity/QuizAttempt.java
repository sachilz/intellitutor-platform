package com.intellilearn.quizservice.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.List;

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

    public QuizAttempt() {
    }

    public QuizAttempt(String id, String quizId, String userId, int score, int correctAnswersCount, int totalQuestions, String feedback, List<String> recommendations, LocalDateTime submittedAt) {
        this.id = id;
        this.quizId = quizId;
        this.userId = userId;
        this.score = score;
        this.correctAnswersCount = correctAnswersCount;
        this.totalQuestions = totalQuestions;
        this.feedback = feedback;
        this.recommendations = recommendations;
        this.submittedAt = submittedAt;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getQuizId() {
        return quizId;
    }

    public void setQuizId(String quizId) {
        this.quizId = quizId;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public int getScore() {
        return score;
    }

    public void setScore(int score) {
        this.score = score;
    }

    public int getCorrectAnswersCount() {
        return correctAnswersCount;
    }

    public void setCorrectAnswersCount(int correctAnswersCount) {
        this.correctAnswersCount = correctAnswersCount;
    }

    public int getTotalQuestions() {
        return totalQuestions;
    }

    public void setTotalQuestions(int totalQuestions) {
        this.totalQuestions = totalQuestions;
    }

    public String getFeedback() {
        return feedback;
    }

    public void setFeedback(String feedback) {
        this.feedback = feedback;
    }

    public List<String> getRecommendations() {
        return recommendations;
    }

    public void setRecommendations(List<String> recommendations) {
        this.recommendations = recommendations;
    }

    public LocalDateTime getSubmittedAt() {
        return submittedAt;
    }

    public void setSubmittedAt(LocalDateTime submittedAt) {
        this.submittedAt = submittedAt;
    }

    public static QuizAttemptBuilder builder() {
        return new QuizAttemptBuilder();
    }

    public static class QuizAttemptBuilder {
        private String id;
        private String quizId;
        private String userId;
        private int score;
        private int correctAnswersCount;
        private int totalQuestions;
        private String feedback;
        private List<String> recommendations;
        private LocalDateTime submittedAt;

        public QuizAttemptBuilder id(String id) {
            this.id = id;
            return this;
        }

        public QuizAttemptBuilder quizId(String quizId) {
            this.quizId = quizId;
            return this;
        }

        public QuizAttemptBuilder userId(String userId) {
            this.userId = userId;
            return this;
        }

        public QuizAttemptBuilder score(int score) {
            this.score = score;
            return this;
        }

        public QuizAttemptBuilder correctAnswersCount(int correctAnswersCount) {
            this.correctAnswersCount = correctAnswersCount;
            return this;
        }

        public QuizAttemptBuilder totalQuestions(int totalQuestions) {
            this.totalQuestions = totalQuestions;
            return this;
        }

        public QuizAttemptBuilder feedback(String feedback) {
            this.feedback = feedback;
            return this;
        }

        public QuizAttemptBuilder recommendations(List<String> recommendations) {
            this.recommendations = recommendations;
            return this;
        }

        public QuizAttemptBuilder submittedAt(LocalDateTime submittedAt) {
            this.submittedAt = submittedAt;
            return this;
        }

        public QuizAttempt build() {
            return new QuizAttempt(id, quizId, userId, score, correctAnswersCount, totalQuestions, feedback, recommendations, submittedAt);
        }
    }
}
