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
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

/**
 * A single multiple-choice question belonging to a {@link Quiz}. The answer
 * options are stored in order ({@link OrderColumn}) because clients reference
 * them by their 0-based index when submitting an attempt.
 */
@Entity
@Table(name = "questions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
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
    @Builder.Default
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
}
