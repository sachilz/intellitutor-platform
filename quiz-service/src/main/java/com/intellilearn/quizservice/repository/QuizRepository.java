package com.intellilearn.quizservice.repository;

import com.intellilearn.quizservice.entity.Quiz;
import org.springframework.data.jpa.repository.JpaRepository;

/**
 * Spring Data repository for {@link Quiz}. The default {@code findAll()},
 * {@code findById()} and {@code save()} are sufficient because the {@code Quiz}
 * &rarr; {@code Question} &rarr; {@code options} associations are mapped
 * {@code EAGER}, so the full object graph is always loaded before the
 * transaction closes (no lazy-loading exceptions during JSON serialisation).
 */
public interface QuizRepository extends JpaRepository<Quiz, Long> {
}
