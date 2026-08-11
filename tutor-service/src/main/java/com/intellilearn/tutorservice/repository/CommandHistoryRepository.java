package com.intellilearn.tutorservice.repository;

import com.intellilearn.tutorservice.entity.CommandHistory;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommandHistoryRepository extends MongoRepository<CommandHistory, String> {
    List<CommandHistory> findByUserIdOrderByTimestampDesc(String userId);
    List<CommandHistory> findTop10ByOrderByTimestampDesc();
}
