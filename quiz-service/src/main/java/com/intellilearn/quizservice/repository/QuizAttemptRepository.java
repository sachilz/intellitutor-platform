package com.intellilearn.quizservice.repository;

import com.intellilearn.quizservice.entity.QuizAttempt;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuizAttemptRepository extends MongoRepository<QuizAttempt, String> {
    List<QuizAttempt> findByQuizIdAndUserId(String quizId, String userId);
    List<QuizAttempt> findByUserId(String userId);
}
