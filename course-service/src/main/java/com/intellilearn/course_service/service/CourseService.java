package com.intellilearn.course_service.service;

import com.intellilearn.course_service.dto.CreateCourseRequest;
import com.intellilearn.course_service.dto.EnrollRequest;
import com.intellilearn.course_service.dto.UpdateCourseRequest;
import com.intellilearn.course_service.exception.CourseNotFoundException;
import com.intellilearn.course_service.exception.DuplicateEnrollmentException;
import com.intellilearn.course_service.model.Course;
import com.intellilearn.course_service.model.Enrollment;
import com.intellilearn.course_service.repository.CourseRepository;
import com.intellilearn.course_service.repository.EnrollmentRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class CourseService {

    private final CourseRepository courseRepository;
    private final EnrollmentRepository enrollmentRepository;

    public CourseService(CourseRepository courseRepository, EnrollmentRepository enrollmentRepository) {
        this.courseRepository = courseRepository;
        this.enrollmentRepository = enrollmentRepository;
    }

    public Course createCourse(CreateCourseRequest request) {
        Course course = new Course();
        course.setTitle(request.getTitle());
        course.setDescription(request.getDescription());
        course.setInstructorId(request.getInstructorId());
        course.setMaterials(request.getMaterials() != null ? request.getMaterials() : new ArrayList<>());
        course.setCreatedAt(LocalDateTime.now());
        return courseRepository.save(course);
    }

    public List<Course> getAllCourses() {
        return courseRepository.findAll();
    }

    public Course getCourseById(String id) {
        return courseRepository.findById(id)
                .orElseThrow(() -> new CourseNotFoundException("Course not found with id: " + id));
    }

    public Course updateCourse(String id, UpdateCourseRequest request) {
        Course course = getCourseById(id);

        if (request.getTitle() != null && !request.getTitle().isBlank()) {
            course.setTitle(request.getTitle());
        }
        if (request.getDescription() != null && !request.getDescription().isBlank()) {
            course.setDescription(request.getDescription());
        }
        if (request.getInstructorId() != null) {
            course.setInstructorId(request.getInstructorId());
        }
        if (request.getMaterials() != null) {
            course.setMaterials(request.getMaterials());
        }

        return courseRepository.save(course);
    }

    public void deleteCourse(String id) {
        if (!courseRepository.existsById(id)) {
            throw new CourseNotFoundException("Course not found with id: " + id);
        }
        courseRepository.deleteById(id);
    }

    public Enrollment enrollUser(String courseId, EnrollRequest request) {
        // Ensure course exists
        getCourseById(courseId);

        String userId = request.getUserId();
        if (enrollmentRepository.existsByUserIdAndCourseId(userId, courseId)) {
            throw new DuplicateEnrollmentException("User '" + userId + "' is already enrolled in course '" + courseId + "'");
        }

        Enrollment enrollment = new Enrollment();
        enrollment.setCourseId(courseId);
        enrollment.setUserId(userId);
        enrollment.setEnrolledAt(LocalDateTime.now());

        return enrollmentRepository.save(enrollment);
    }

    public List<Enrollment> getCourseEnrollments(String courseId) {
        // Ensure course exists
        getCourseById(courseId);
        return enrollmentRepository.findByCourseId(courseId);
    }
}
