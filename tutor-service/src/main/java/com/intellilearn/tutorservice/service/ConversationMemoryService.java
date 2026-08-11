package com.intellilearn.tutorservice.service;

import com.intellilearn.tutorservice.entity.ChatSession;
import com.intellilearn.tutorservice.repository.ChatSessionRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class ConversationMemoryService {

    private static final Logger log = LoggerFactory.getLogger(ConversationMemoryService.class);

    private final ChatSessionRepository sessionRepository;

    public ConversationMemoryService(ChatSessionRepository sessionRepository) {
        this.sessionRepository = sessionRepository;
    }

    public ChatSession getOrCreateSession(String sessionId, String userId, String courseId) {
        if (sessionId != null && !sessionId.isBlank()) {
            Optional<ChatSession> opt = sessionRepository.findById(sessionId);
            if (opt.isPresent()) {
                return opt.get();
            }
        }

        String newId = (sessionId != null && !sessionId.isBlank()) ? sessionId : UUID.randomUUID().toString();
        ChatSession session = new ChatSession(
                newId,
                userId != null ? userId : "student1@intellilearn.com",
                courseId != null ? courseId : "general",
                new ArrayList<>(),
                LocalDateTime.now(),
                LocalDateTime.now()
        );
        return sessionRepository.save(session);
    }

    public void addMessage(ChatSession session, String sender, String content, String category) {
        if (session == null) return;
        ChatSession.MessageItem item = new ChatSession.MessageItem(sender, content, category, LocalDateTime.now());
        session.getMessages().add(item);
        session.setUpdatedAt(LocalDateTime.now());
        try {
            sessionRepository.save(session);
        } catch (Exception e) {
            log.warn("Could not persist chat message to MongoDB: {}", e.getMessage());
        }
    }

    public String buildConversationContext(ChatSession session) {
        if (session == null || session.getMessages() == null || session.getMessages().isEmpty()) {
            return "";
        }

        StringBuilder context = new StringBuilder("\n--- PREVIOUS CONVERSATION HISTORY ---\n");
        List<ChatSession.MessageItem> msgs = session.getMessages();
        int start = Math.max(0, msgs.size() - 6);
        for (int i = start; i < msgs.size(); i++) {
            ChatSession.MessageItem m = msgs.get(i);
            context.append(m.getSender()).append(": ").append(m.getContent()).append("\n");
        }
        return context.toString();
    }
}
