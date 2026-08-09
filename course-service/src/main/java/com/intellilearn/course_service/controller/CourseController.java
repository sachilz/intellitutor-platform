package com.intellilearn.course_service.controller;

import com.intellilearn.course_service.dto.CreateCourseRequest;
import com.intellilearn.course_service.dto.EnrollRequest;
import com.intellilearn.course_service.dto.UpdateCourseRequest;
import com.intellilearn.course_service.model.Course;
import com.intellilearn.course_service.model.Enrollment;
import com.intellilearn.course_service.service.CourseService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/courses")
@Tag(name = "Course Management", description = "Endpoints for course creation, management, and user enrollments")
public class CourseController {

    private final CourseService courseService;

    public CourseController(CourseService courseService) {
        this.courseService = courseService;
    }

    @PostMapping
    @Operation(summary = "Create a new course", description = "Creates a new course with title, description, instructor ID, and materials (Requires X-API-KEY)")
    public ResponseEntity<Course> createCourse(@Valid @RequestBody CreateCourseRequest request) {
        Course course = courseService.createCourse(request);
        return new ResponseEntity<>(course, HttpStatus.CREATED);
    }

    @GetMapping
    @Operation(summary = "List all courses", description = "Retrieves a list of all available courses (Requires X-API-KEY)")
    public ResponseEntity<List<Course>> getAllCourses() {
        List<Course> courses = courseService.getAllCourses();
        return ResponseEntity.ok(courses);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get course by ID", description = "Retrieves details of a single course by ID (Requires X-API-KEY)")
    public ResponseEntity<Course> getCourseById(@PathVariable String id) {
        Course course = courseService.getCourseById(id);
        return ResponseEntity.ok(course);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update course", description = "Updates details of an existing course by ID (Requires X-API-KEY)")
    public ResponseEntity<Course> updateCourse(@PathVariable String id, @RequestBody UpdateCourseRequest request) {
        Course updatedCourse = courseService.updateCourse(id, request);
        return ResponseEntity.ok(updatedCourse);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete course", description = "Deletes a course by ID (Requires X-API-KEY)")
    public ResponseEntity<Void> deleteCourse(@PathVariable String id) {
        courseService.deleteCourse(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/enroll")
    @Operation(summary = "Enroll a user in a course", description = "Enrolls a user into the specified course if not already enrolled (Requires X-API-KEY)")
    public ResponseEntity<Enrollment> enrollUser(@PathVariable("id") String courseId, @Valid @RequestBody EnrollRequest request) {
        Enrollment enrollment = courseService.enrollUser(courseId, request);
        return new ResponseEntity<>(enrollment, HttpStatus.CREATED);
    }

    @GetMapping("/{id}/enrollments")
    @Operation(summary = "List course enrollments", description = "Retrieves all user enrollments for the specified course (Requires X-API-KEY)")
    public ResponseEntity<List<Enrollment>> getCourseEnrollments(@PathVariable("id") String courseId) {
        List<Enrollment> enrollments = courseService.getCourseEnrollments(courseId);
        return ResponseEntity.ok(enrollments);
    }
}
