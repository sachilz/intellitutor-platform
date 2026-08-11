package com.intellilearn.quizservice.service;

import com.intellilearn.quizservice.dto.AssessmentResultDto;
import com.intellilearn.quizservice.dto.QuizSubmissionDto;
import com.intellilearn.quizservice.entity.Question;
import com.intellilearn.quizservice.entity.Quiz;
import com.intellilearn.quizservice.entity.QuizAttempt;
import com.intellilearn.quizservice.exception.ForbiddenException;
import com.intellilearn.quizservice.exception.InvalidSubmissionException;
import com.intellilearn.quizservice.exception.QuizNotFoundException;
import com.intellilearn.quizservice.repository.QuizAttemptRepository;
import com.intellilearn.quizservice.repository.QuizRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Business logic for quizzes and assessments.
 */
@Service
public class QuizService implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(QuizService.class);

    public static final String ADMIN_ROLE = "ADMIN";

    private final QuizRepository quizRepository;
    private final QuizAttemptRepository quizAttemptRepository;

    public QuizService(QuizRepository quizRepository, QuizAttemptRepository quizAttemptRepository) {
        this.quizRepository = quizRepository;
        this.quizAttemptRepository = quizAttemptRepository;
    }

    public List<Quiz> getAllQuizzes() {
        return quizRepository.findAll();
    }

    public Quiz getQuizById(Long id) {
        return quizRepository.findById(id)
                .orElseThrow(() -> new QuizNotFoundException(id));
    }

    /**
     * Creates a quiz (including its nested questions).
     */
    @Transactional
    public Quiz createQuiz(Quiz quiz, String userRole) {
        requireAdmin(userRole);

        if (quiz == null) {
            throw new InvalidSubmissionException("Request body is required");
        }
        if (quiz.getTitle() == null || quiz.getTitle().isBlank()) {
            throw new InvalidSubmissionException("Quiz title is required");
        }
        if (quiz.getQuestions() == null || quiz.getQuestions().isEmpty()) {
            throw new InvalidSubmissionException("A quiz must contain at least one question");
        }

        quiz.setId(null);

        quiz.getQuestions().forEach(q -> {
            q.setId(null);
            if (q.getText() == null || q.getText().isBlank()) {
                throw new InvalidSubmissionException("Every question needs a text");
            }
            if (q.getOptions() == null || q.getOptions().size() < 2) {
                throw new InvalidSubmissionException("Every question needs at least two options");
            }
            if (q.getOptions().stream().anyMatch(o -> o == null || o.isBlank())) {
                throw new InvalidSubmissionException("Option text cannot be blank");
            }
            if (q.getCorrectOptionIndex() < 0 || q.getCorrectOptionIndex() >= q.getOptions().size()) {
                throw new InvalidSubmissionException("correctOptionIndex must point to a valid option");
            }
            q.setQuiz(quiz);
        });

        return quizRepository.save(quiz);
    }

    /**
     * Evaluates a quiz attempt: compares each submitted option index with the
     * correct one, computes score, builds feedback, and PERSISTS the attempt to MongoDB.
     */
    public AssessmentResultDto submitQuiz(Long quizId, QuizSubmissionDto submission) {
        if (submission == null) {
            throw new InvalidSubmissionException("Request body is required");
        }
        Quiz quiz = getQuizById(quizId);
        List<Question> questions = quiz.getQuestions();

        int answerCount = submission.selectedOptions() == null ? 0 : submission.selectedOptions().size();
        if (answerCount != questions.size()) {
            throw new InvalidSubmissionException("Answer count (" + answerCount
                    + ") does not match question count (" + questions.size() + ")");
        }

        int correct = 0;
        List<String> recommendations = new ArrayList<>();
        for (int i = 0; i < questions.size(); i++) {
            Integer selected = submission.selectedOptions().get(i);
            Question question = questions.get(i);
            if (selected != null && selected == question.getCorrectOptionIndex()) {
                correct++;
            } else {
                recommendations.add("Review question " + (i + 1) + ": \"" + question.getText() + "\"");
            }
        }

        int total = questions.size();
        int score = total == 0 ? 0 : Math.round((correct * 100f) / total);
        String feedback = buildFeedback(score);
        String userId = (submission.userId() != null && !submission.userId().isBlank()) 
                ? submission.userId() : "student1@intellilearn.com";

        // PERSIST QUIZ ATTEMPT TO MONGODB
        try {
            QuizAttempt attempt = QuizAttempt.builder()
                    .quizId(String.valueOf(quizId))
                    .userId(userId)
                    .score(score)
                    .correctAnswersCount(correct)
                    .totalQuestions(total)
                    .feedback(feedback)
                    .recommendations(recommendations)
                    .submittedAt(LocalDateTime.now())
                    .build();

            quizAttemptRepository.save(attempt);
            log.info("Persisted quiz attempt to MongoDB collection 'quiz_attempts' for quizId={}, userId={}, score={}",
                    quizId, userId, score);
        } catch (Exception e) {
            log.error("Failed to persist quiz attempt to MongoDB: {}", e.getMessage(), e);
        }

        return new AssessmentResultDto(quizId, score, correct, total, feedback, recommendations);
    }

    public List<QuizAttempt> getQuizAttempts(Long quizId, String userId) {
        return quizAttemptRepository.findByQuizIdAndUserId(String.valueOf(quizId), userId);
    }

    public List<QuizAttempt> getUserAttempts(String userId) {
        return quizAttemptRepository.findByUserId(userId);
    }

    private String buildFeedback(int score) {
        if (score >= 80) {
            return "Excellent work! You have a strong grasp of the material.";
        }
        if (score >= 60) {
            return "Good effort! You understand most concepts - a little more review will get you to mastery.";
        }
        if (score >= 40) {
            return "Fair attempt. You have a basic understanding, but several areas need more study.";
        }
        return "Needs improvement. We recommend going back through the learning material and trying again.";
    }

    private void requireAdmin(String userRole) {
        if (userRole == null || !ADMIN_ROLE.equalsIgnoreCase(userRole)) {
            throw new ForbiddenException("This operation requires the ADMIN role (X-User-Role: ADMIN)");
        }
    }

    @Override
    @Transactional
    public void run(String... args) {
        if (quizRepository.count() > 0) {
            return;
        }
        log.info("Seeding 2 sample quizzes...");

        Quiz javaQuiz = Quiz.builder()
                .title("Java Fundamentals")
                .description("Core Java concepts: classes, primitives and the entry point of a program.")
                .build();
        javaQuiz.addQuestion(question("Which keyword is used to declare a class in Java?",
                List.of("class", "struct", "type", "object"), 0));
        javaQuiz.addQuestion(question("Which of the following is a valid Java primitive type?",
                List.of("String", "int", "Integer", "ArrayList"), 1));
        javaQuiz.addQuestion(question("What is the signature of the entry point of a Java application?",
                List.of("public static void run()", "public void main(String[] args)",
                        "public static void main(String[] args)", "static int main(String[] args)"), 2));

        Quiz bootQuiz = Quiz.builder()
                .title("Spring Boot Basics")
                .description("Annotations, embedded servers and configuration of a Spring Boot application.")
                .build();
        bootQuiz.addQuestion(question("Which annotation marks a class as a Spring configuration class?",
                List.of("@Configuration", "@ComponentScan", "@Bean", "@Autowired"), 0));
        bootQuiz.addQuestion(question("Which embedded HTTP server does Spring Boot use by default for web applications?",
                List.of("Jetty", "Tomcat", "Undertow", "Netty"), 1));
        bootQuiz.addQuestion(question("Which Spring Boot property sets the port the HTTP server listens on?",
                List.of("server.port", "spring.port", "http.port", "application.port"), 0));

        quizRepository.save(javaQuiz);
        quizRepository.save(bootQuiz);
        log.info("Sample quizzes seeded: '{}' (id=1) and '{}' (id=2)", javaQuiz.getTitle(), bootQuiz.getTitle());
    }

    private Question question(String text, List<String> options, int correctIndex) {
        return Question.builder().text(text).options(options).correctOptionIndex(correctIndex).build();
    }
}
