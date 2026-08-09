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
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

/**
 * A quiz (assessment) in the IntelliLearn platform. A quiz owns an ordered
 * list of {@link Question}s. Questions are persisted through the {@code quiz}
 * relationship ({@link CascadeType#ALL} + orphan removal), so saving a quiz
 * saves its questions automatically.
 */
@Entity
@Table(name = "quizzes")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Quiz {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(length = 1000)
    private String description;

    // EAGER so the questions (and their options) are always loaded when a quiz
    // is fetched - safe at this scale and keeps JSON serialisation simple.
    @OneToMany(mappedBy = "quiz", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @OrderBy("id ASC")
    @Builder.Default
    private List<Question> questions = new ArrayList<>();

    /**
     * Convenience helper that keeps both sides of the bidirectional
     * relationship in sync: adds the question and sets its {@code quiz} back-reference.
     */
    public void addQuestion(Question question) {
        questions.add(question);
        question.setQuiz(this);
    }
}
