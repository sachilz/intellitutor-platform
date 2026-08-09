package com.intellilearn.course_service.repository;

import com.intellilearn.course_service.model.Enrollment;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EnrollmentRepository extends MongoRepository<Enrollment, String> {
    List<Enrollment> findByCourseId(String courseId);
    boolean existsByUserIdAndCourseId(String userId, String courseId);
}
