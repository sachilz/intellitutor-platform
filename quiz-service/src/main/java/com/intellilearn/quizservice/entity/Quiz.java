package com.intellilearn.quizservice.entity;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OrderBy;
import jakarta.persistence.Table;

import java.util.ArrayList;
import java.util.List;

/**
 * A quiz (assessment) in the IntelliLearn platform. A quiz owns an ordered
 * list of {@link Question}s.
 */
@Entity
@Table(name = "quizzes")
public class Quiz {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(length = 1000)
    private String description;

    @Column(name = "course_id", length = 100)
    private String courseId;

    @OneToMany(mappedBy = "quiz", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @OrderBy("id ASC")
    private List<Question> questions = new ArrayList<>();

    public Quiz() {
    }

    public Quiz(Long id, String title, String description, List<Question> questions) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.questions = questions != null ? questions : new ArrayList<>();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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

    public String getCourseId() {
        return courseId;
    }

    public void setCourseId(String courseId) {
        this.courseId = courseId;
    }

    public List<Question> getQuestions() {
        return questions;
    }

    public void setQuestions(List<Question> questions) {
        this.questions = questions;
    }

    /**
     * Convenience helper that keeps both sides of the bidirectional
     * relationship in sync: adds the question and sets its {@code quiz} back-reference.
     */
    public void addQuestion(Question question) {
        questions.add(question);
        question.setQuiz(this);
    }

    public static QuizBuilder builder() {
        return new QuizBuilder();
    }

    public static class QuizBuilder {
        private Long id;
        private String title;
        private String description;
        private String courseId;
        private List<Question> questions = new ArrayList<>();

        public QuizBuilder id(Long id) {
            this.id = id;
            return this;
        }

        public QuizBuilder title(String title) {
            this.title = title;
            return this;
        }

        public QuizBuilder description(String description) {
            this.description = description;
            return this;
        }

        public QuizBuilder courseId(String courseId) {
            this.courseId = courseId;
            return this;
        }

        public QuizBuilder questions(List<Question> questions) {
            this.questions = questions;
            return this;
        }

        public Quiz build() {
            Quiz quiz = new Quiz(id, title, description, questions);
            quiz.setCourseId(courseId);
            return quiz;
        }
    }
}
