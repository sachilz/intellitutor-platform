package com.intellilearn.quizservice.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OrderColumn;
import jakarta.persistence.Table;

import java.util.ArrayList;
import java.util.List;

/**
 * A single multiple-choice question belonging to a {@link Quiz}. The answer
 * options are stored in order ({@link OrderColumn}) because clients reference
 * them by their 0-based index when submitting an attempt.
 */
@Entity
@Table(name = "questions")
public class Question {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 1000)
    private String text;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "question_options", joinColumns = @JoinColumn(name = "question_id"))
    @Column(name = "option_text", nullable = false, length = 500)
    @OrderColumn(name = "option_index")
    private List<String> options = new ArrayList<>();

    @Column(name = "correct_option_index", nullable = false)
    private int correctOptionIndex;

    /**
     * Back-reference to the owning quiz. {@link JsonIgnore} prevents infinite
     * recursion during JSON (de)serialization and avoids lazy-loading a
     * detached entity when responses are written.
     */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "quiz_id")
    @JsonIgnore
    private Quiz quiz;

    public Question() {
    }

    public Question(Long id, String text, List<String> options, int correctOptionIndex, Quiz quiz) {
        this.id = id;
        this.text = text;
        this.options = options != null ? options : new ArrayList<>();
        this.correctOptionIndex = correctOptionIndex;
        this.quiz = quiz;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getText() {
        return text;
    }

    public void setText(String text) {
        this.text = text;
    }

    public List<String> getOptions() {
        return options;
    }

    public void setOptions(List<String> options) {
        this.options = options;
    }

    public int getCorrectOptionIndex() {
        return correctOptionIndex;
    }

    public void setCorrectOptionIndex(int correctOptionIndex) {
        this.correctOptionIndex = correctOptionIndex;
    }

    public Quiz getQuiz() {
        return quiz;
    }

    public void setQuiz(Quiz quiz) {
        this.quiz = quiz;
    }

    public static QuestionBuilder builder() {
        return new QuestionBuilder();
    }

    public static class QuestionBuilder {
        private Long id;
        private String text;
        private List<String> options = new ArrayList<>();
        private int correctOptionIndex;
        private Quiz quiz;

        public QuestionBuilder id(Long id) {
            this.id = id;
            return this;
        }

        public QuestionBuilder text(String text) {
            this.text = text;
            return this;
        }

        public QuestionBuilder options(List<String> options) {
            this.options = options;
            return this;
        }

        public QuestionBuilder correctOptionIndex(int correctOptionIndex) {
            this.correctOptionIndex = correctOptionIndex;
            return this;
        }

        public QuestionBuilder quiz(Quiz quiz) {
            this.quiz = quiz;
            return this;
        }

        public Question build() {
            return new Question(id, text, options, correctOptionIndex, quiz);
        }
    }
}
