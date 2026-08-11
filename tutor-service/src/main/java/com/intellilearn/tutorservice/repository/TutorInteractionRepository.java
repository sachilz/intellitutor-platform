package com.intellilearn.tutorservice.repository;

import com.intellilearn.tutorservice.entity.TutorInteraction;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TutorInteractionRepository extends MongoRepository<TutorInteraction, String> {
    List<TutorInteraction> findByCourseIdAndUserId(String courseId, String userId);
    List<TutorInteraction> findByUserId(String userId);
}
