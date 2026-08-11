package com.intellilearn.tutorservice.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.List;

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

    public TutorInteraction() {
    }

    public TutorInteraction(String id, String courseId, String userId, String question, String answer, boolean grounded, List<String> sources, LocalDateTime timestamp) {
        this.id = id;
        this.courseId = courseId;
        this.userId = userId;
        this.question = question;
        this.answer = answer;
        this.grounded = grounded;
        this.sources = sources;
        this.timestamp = timestamp;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getCourseId() {
        return courseId;
    }

    public void setCourseId(String courseId) {
        this.courseId = courseId;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getQuestion() {
        return question;
    }

    public void setQuestion(String question) {
        this.question = question;
    }

    public String getAnswer() {
        return answer;
    }

    public void setAnswer(String answer) {
        this.answer = answer;
    }

    public boolean isGrounded() {
        return grounded;
    }

    public void setGrounded(boolean grounded) {
        this.grounded = grounded;
    }

    public List<String> getSources() {
        return sources;
    }

    public void setSources(List<String> sources) {
        this.sources = sources;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }

    public static TutorInteractionBuilder builder() {
        return new TutorInteractionBuilder();
    }

    public static class TutorInteractionBuilder {
        private String id;
        private String courseId;
        private String userId;
        private String question;
        private String answer;
        private boolean grounded;
        private List<String> sources;
        private LocalDateTime timestamp;

        public TutorInteractionBuilder id(String id) {
            this.id = id;
            return this;
        }

        public TutorInteractionBuilder courseId(String courseId) {
            this.courseId = courseId;
            return this;
        }

        public TutorInteractionBuilder userId(String userId) {
            this.userId = userId;
            return this;
        }

        public TutorInteractionBuilder question(String question) {
            this.question = question;
            return this;
        }

        public TutorInteractionBuilder answer(String answer) {
            this.answer = answer;
            return this;
        }

        public TutorInteractionBuilder grounded(boolean grounded) {
            this.grounded = grounded;
            return this;
        }

        public TutorInteractionBuilder sources(List<String> sources) {
            this.sources = sources;
            return this;
        }

        public TutorInteractionBuilder timestamp(LocalDateTime timestamp) {
            this.timestamp = timestamp;
            return this;
        }

        public TutorInteraction build() {
            return new TutorInteraction(id, courseId, userId, question, answer, grounded, sources, timestamp);
        }
    }
}
