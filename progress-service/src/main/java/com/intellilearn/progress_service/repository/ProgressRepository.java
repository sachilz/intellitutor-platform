package com.intellilearn.progress_service.repository;

import com.intellilearn.progress_service.model.Progress;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProgressRepository extends MongoRepository<Progress, String> {

    List<Progress> findByUserId(String userId);

    Optional<Progress> findByUserIdAndCourseId(String userId, String courseId);
}
