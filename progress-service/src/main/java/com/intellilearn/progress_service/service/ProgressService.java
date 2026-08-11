package com.intellilearn.progress_service.service;

import com.intellilearn.progress_service.exception.ProgressNotFoundException;
import com.intellilearn.progress_service.model.Progress;
import com.intellilearn.progress_service.repository.ProgressRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ProgressService {

    private final ProgressRepository progressRepository;

    public ProgressService(ProgressRepository progressRepository) {
        this.progressRepository = progressRepository;
    }

    public List<Progress> getAllProgress() {
        return progressRepository.findAll();
    }

    public Progress createProgress(String userId, String courseId) {
        Progress progress = progressRepository.findByUserIdAndCourseId(userId, courseId)
                .orElse(new Progress());

        progress.setUserId(userId);
        progress.setCourseId(courseId);
        progress.setCompletedPercent(0);
        progress.setLastAccessed(LocalDateTime.now());

        return progressRepository.save(progress);
    }

    public List<Progress> getProgressByUserId(String userId) {
        return progressRepository.findByUserId(userId);
    }

    public Progress getProgressByUserIdAndCourseId(String userId, String courseId) {
        return progressRepository.findByUserIdAndCourseId(userId, courseId)
                .orElseThrow(() -> new ProgressNotFoundException(
                        "Progress record not found for userId: " + userId + " and courseId: " + courseId));
    }

    public Progress updateCompletedPercent(String userId, String courseId, int completedPercent) {
        Progress progress = progressRepository.findByUserIdAndCourseId(userId, courseId)
                .orElseThrow(() -> new ProgressNotFoundException(
                        "Progress record not found for userId: " + userId + " and courseId: " + courseId));

        progress.setCompletedPercent(completedPercent);
        progress.setLastAccessed(LocalDateTime.now());

        return progressRepository.save(progress);
    }

    public void deleteProgress(String id) {
        if (!progressRepository.existsById(id)) {
            throw new ProgressNotFoundException("Progress record not found for id: " + id);
        }
        progressRepository.deleteById(id);
    }
}
