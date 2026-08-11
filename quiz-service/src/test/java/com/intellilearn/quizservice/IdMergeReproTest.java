package com.intellilearn.quizservice;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.intellilearn.quizservice.entity.Question;
import com.intellilearn.quizservice.entity.Quiz;
import com.intellilearn.quizservice.repository.QuizRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Regression tests for the create-quiz id handling.
 *
 * <p>A {@code POST /api/quizzes} must ALWAYS insert a brand-new quiz: any
 * client-supplied ids are ignored ({@code QuizService#createQuiz} nulls them).
 * This prevents the "id merge" hazard where echoing a fetched quiz back through
 * the write endpoint would silently overwrite, or orphan-remove questions from,
 * existing rows.</p>
 */
@SpringBootTest
@AutoConfigureMockMvc
class IdMergeReproTest {

    @Autowired MockMvc mvc;
    @Autowired QuizRepository quizRepository;
    @Autowired JdbcTemplate jdbcTemplate;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Test
    void postingQuizBackWithForgedIdCreatesANewQuizInsteadOfOverwriting() throws Exception {
        // Sanity: the seed runner should have created quizzes 1 and 2. Order of the
        // two test methods is not guaranteed, so assert existence rather than a total.
        assertThat(quizRepository.existsById(1L)).isTrue();
        assertThat(quizRepository.existsById(2L)).isTrue();
        long before = quizRepository.count();

        // GET /api/quizzes/1 -> the exact JSON the API hands to clients.
        JsonNode node = objectMapper.readTree(getQuiz(1).getResponse().getContentAsString());
        assertThat(node.get("id").asLong()).isEqualTo(1L);
        assertThat(node.get("questions").size()).isEqualTo(3);

        // Client edits the title and POSTs it back with the same id in the body.
        ((ObjectNode) node).put("title", "Hacked Fundamentals");

        MvcResult post = mvc.perform(post("/quizzes")
                        .header("X-API-Key", "INTELLILEARN-QUIZ-KEY-2026")
                        .header("X-User-Role", "ADMIN")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(node)))
                .andExpect(status().isCreated())
                .andReturn();

        // A "create" must ADD a row with a fresh id, not merge over quiz 1.
        assertThat(quizRepository.count()).isEqualTo(before + 1L);
        JsonNode created = objectMapper.readTree(post.getResponse().getContentAsString());
        assertThat(created.get("id").asLong()).isNotEqualTo(1L);
        assertThat(created.get("title").asText()).isEqualTo("Hacked Fundamentals");
        // Original quiz 1 must be untouched.
        assertThat(quizRepository.findById(1L).orElseThrow().getTitle()).isEqualTo("Java Fundamentals");
    }

    @Test
    void postingQuizBackWithFewerQuestionsDoesNotDeleteTheOriginalOnes() throws Exception {
        long before = quizRepository.count();

        // Create a brand-new quiz with 3 questions so we have full control.
        Quiz q = Quiz.builder().title("Baseline").build();
        q.addQuestion(question("q1"));
        q.addQuestion(question("q2"));
        q.addQuestion(question("q3"));
        quizRepository.save(q);
        long qid = q.getId();
        assertThat(jdbcTemplate.queryForObject(
                "select count(*) from questions where quiz_id = ?", Integer.class, qid)).isEqualTo(3);

        // GET it, drop one question, POST back with the same id in the body.
        JsonNode node = objectMapper.readTree(getQuiz(qid).getResponse().getContentAsString());
        assertThat(node.get("questions").size()).isEqualTo(3);
        ((ObjectNode) node).put("title", "Baseline edited");
        ArrayNode questions = (ArrayNode) node.get("questions");
        questions.remove(questions.size() - 1);

        mvc.perform(post("/quizzes")
                        .header("X-API-Key", "INTELLILEARN-QUIZ-KEY-2026")
                        .header("X-User-Role", "ADMIN")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(node)))
                .andExpect(status().isCreated())
                .andReturn();

        // The POST created a NEW quiz; the original must still have all 3
        // questions (a merge would have orphan-removed the dropped q3).
        assertThat(jdbcTemplate.queryForObject(
                "select count(*) from questions where quiz_id = ?", Integer.class, qid)).isEqualTo(3);
        assertThat(jdbcTemplate.queryForObject(
                "select count(*) from questions where text = 'q3'", Integer.class)).isEqualTo(1);
        // Baseline above + the newly created one (order-independent baseline).
        assertThat(quizRepository.count()).isEqualTo(before + 2L);
    }

    private MvcResult getQuiz(long id) throws Exception {
        return mvc.perform(get("/quizzes/" + id)
                        .header("X-API-Key", "INTELLILEARN-QUIZ-KEY-2026"))
                .andExpect(status().isOk())
                .andReturn();
    }

    private Question question(String text) {
        return Question.builder()
                .text(text)
                .options(List.of("a", "b"))
                .correctOptionIndex(0)
                .build();
    }
}
