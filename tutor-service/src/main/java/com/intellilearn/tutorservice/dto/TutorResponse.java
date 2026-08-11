package com.intellilearn.tutorservice.dto;

import java.util.List;

public class TutorResponse {

    private String courseId;
    private String question;
    private String answer;
    private boolean grounded;
    private List<String> sources;

    public TutorResponse() {
    }

    public TutorResponse(String courseId, String question, String answer, boolean grounded, List<String> sources) {
        this.courseId = courseId;
        this.question = question;
        this.answer = answer;
        this.grounded = grounded;
        this.sources = sources;
    }

    public String getCourseId() {
        return courseId;
    }

    public void setCourseId(String courseId) {
        this.courseId = courseId;
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

    public static TutorResponseBuilder builder() {
        return new TutorResponseBuilder();
    }

    public static class TutorResponseBuilder {
        private String courseId;
        private String question;
        private String answer;
        private boolean grounded;
        private List<String> sources;

        public TutorResponseBuilder courseId(String courseId) {
            this.courseId = courseId;
            return this;
        }

        public TutorResponseBuilder question(String question) {
            this.question = question;
            return this;
        }

        public TutorResponseBuilder answer(String answer) {
            this.answer = answer;
            return this;
        }

        public TutorResponseBuilder grounded(boolean grounded) {
            this.grounded = grounded;
            return this;
        }

        public TutorResponseBuilder sources(List<String> sources) {
            this.sources = sources;
            return this;
        }

        public TutorResponse build() {
            return new TutorResponse(courseId, question, answer, grounded, sources);
        }
    }
}
