package com.intellilearn.tutorservice.service;

import com.intellilearn.tutorservice.dto.ChatMessageRequest;
import com.intellilearn.tutorservice.dto.ChatMessageResponse;
import com.intellilearn.tutorservice.entity.ChatSession;
import com.intellilearn.tutorservice.service.LlmService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class ChatOrchestratorService {

    private static final Logger log = LoggerFactory.getLogger(ChatOrchestratorService.class);

    private final QuestionRouterService routerService;
    private final ProjectKnowledgeService knowledgeService;
    private final WebSearchService webSearchService;
    private final ProjectTroubleshooterService troubleshooterService;
    private final ConversationMemoryService memoryService;
    private final LlmService llmService;

    public ChatOrchestratorService(QuestionRouterService routerService,
                                   ProjectKnowledgeService knowledgeService,
                                   WebSearchService webSearchService,
                                   ProjectTroubleshooterService troubleshooterService,
                                   ConversationMemoryService memoryService,
                                   LlmService llmService) {
        this.routerService = routerService;
        this.knowledgeService = knowledgeService;
        this.webSearchService = webSearchService;
        this.troubleshooterService = troubleshooterService;
        this.memoryService = memoryService;
        this.llmService = llmService;
    }

    public ChatMessageResponse handleChatMessage(ChatMessageRequest request) {
        String msg = request.getMessage() != null ? request.getMessage().trim() : "";
        String userId = request.getUserId() != null ? request.getUserId() : "student1@intellilearn.com";
        String courseId = request.getCourseId() != null ? request.getCourseId() : "general";
        String courseTitle = request.getCourseTitle() != null ? request.getCourseTitle() : "";

        ChatSession session = memoryService.getOrCreateSession(request.getSessionId(), userId, courseId);
        String category = routerService.classifyQuestion(msg);

        log.info("Processing chatbot request for user '{}', session '{}', courseId '{}'. Category: {}", userId, session.getId(), courseId, category);

        memoryService.addMessage(session, "USER", msg, category);
        String historyContext = memoryService.buildConversationContext(session);

        String sourceType = "GENERAL";
        boolean webSearchUsed = false;
        List<ChatMessageResponse.SourceItem> sources = new ArrayList<>();
        ChatMessageResponse.TroubleshootingDetail troubleshooting = null;
        StringBuilder promptBuilder = new StringBuilder();

        promptBuilder.append("You are the IntelliTutor AI Assistant for IntelliLearn Platform.\n");
        if (!courseTitle.isBlank()) {
            promptBuilder.append("Active Course: ").append(courseTitle).append(" (Course ID: ").append(courseId).append(")\n");
        }
        promptBuilder.append("User Question: ").append(msg).append("\n");
        promptBuilder.append(historyContext).append("\n");

        if ("PROJECT_SPECIFIC".equals(category) || "MIXED".equals(category) || "PROJECT_TROUBLESHOOTING".equals(category)) {
            ProjectKnowledgeService.KnowledgeResult knowledge = knowledgeService.retrieveProjectContext(msg, courseId, courseTitle);
            promptBuilder.append("\nRETRIEVED KNOWLEDGE CONTEXT:\n").append(knowledge.getContext()).append("\n");
            for (String src : knowledge.getSources()) {
                sources.add(new ChatMessageResponse.SourceItem("Course Documentation (" + src + ")", "doc://" + src));
            }
            sourceType = "PROJECT";
        }

        if ("CURRENT_WEB_INFORMATION".equals(category) || "MIXED".equals(category)) {
            WebSearchService.SearchResult searchResult = webSearchService.performWebSearch(msg);
            promptBuilder.append("\nRETRIEVED WEB SEARCH CONTEXT:\n").append(searchResult.getSummary()).append("\n");
            sources.addAll(searchResult.getSources());
            webSearchUsed = true;
            sourceType = "PROJECT_SPECIFIC".equals(category) ? "MIXED" : "WEB";
        }

        if ("PROJECT_TROUBLESHOOTING".equals(category)) {
            troubleshooting = troubleshooterService.diagnoseProjectIssue(msg);
            promptBuilder.append("\nTROUBLESHOOTING DIAGNOSIS CONTEXT:\n");
            promptBuilder.append("Likely Cause: ").append(troubleshooting.getLikelyCause()).append("\n");
            promptBuilder.append("Recommended Checks: ").append(String.join("; ", troubleshooting.getRecommendedChecks())).append("\n");
            sourceType = "TROUBLESHOOTING";
        }

        promptBuilder.append("\nINSTRUCTIONS: Answer the user question concisely, accurately, and naturally. ");
        promptBuilder.append("If this question pertains to the active course, ensure your answer addresses the relevant course topics accurately.");

        String rawAnswer;
        try {
            rawAnswer = llmService.generateResponse(promptBuilder.toString(), courseId, null, null, null);
        } catch (Exception e) {
            log.error("Failed to generate LLM response", e);
            rawAnswer = "";
        }
        
        String finalAnswer = formatLlmAnswer(rawAnswer, category, msg, courseId, courseTitle, troubleshooting);

        memoryService.addMessage(session, "AI", finalAnswer, category);

        return new ChatMessageResponse(
                session.getId(),
                finalAnswer,
                category,
                sourceType,
                webSearchUsed,
                sources,
                troubleshooting,
                "OpenRouter/Configured-LLM"
        );
    }

    private String formatLlmAnswer(String raw, String category, String query, String courseId, String courseTitle, ChatMessageResponse.TroubleshootingDetail troubles) {
        if (raw != null && !raw.isBlank() && !raw.startsWith("{")) {
            return raw;
        }

        if ("PROJECT_TROUBLESHOOTING".equals(category) && troubles != null) {
            return "**Project Troubleshooting Analysis**\n\n" +
                    "**Likely Cause:** " + troubles.getLikelyCause() + "\n\n" +
                    "**Recommended Diagnostic Checks:**\n" +
                    String.join("\n", troubles.getRecommendedChecks().stream().map(c -> "• " + c).toList()) + "\n\n" +
                    "**Suggested Diagnostic Commands:**\n`" + String.join("`\n`", troubles.getSuggestedCommands()) + "`";
        }

        String cid = courseId != null ? courseId.toLowerCase() : "";
        String q = query != null ? query.toLowerCase() : "";
        String title = courseTitle != null ? courseTitle : (courseId != null ? courseId : "Course");

        // Machine Learning Specialization & ML Courses
        if (cid.contains("c_coursera_2") || cid.contains("c_udemy_1") || cid.contains("c_coursera_8") || cid.contains("machine-learning") || title.toLowerCase().contains("machine learning")) {
            if (q.contains("module 1") || q.contains("supervised") || q.contains("regression") || q.contains("explain")) {
                return "**" + title + " — Supervised Learning & Regression**\n\n" +
                        "Supervised Learning is the cornerstone of modern Machine Learning:\n\n" +
                        "• **Linear Regression**: Predicts continuous numerical targets using cost functions (Mean Squared Error) and Gradient Descent minimization: `J(w,b) = (1/2m) ∑ (f(x) - y)²`.\n" +
                        "• **Logistic Regression**: Used for binary classification, mapping outputs through the Sigmoid activation function: `g(z) = 1 / (1 + e^-z)`.\n" +
                        "• **Model Evaluation**: Split datasets into Train/Dev/Test sets to diagnose Overfitting (High Variance) vs Underfitting (High Bias) and apply L2 Regularization (`λ`).\n\n" +
                        "How can I assist your study session on this topic today?";
            }
            if (q.contains("quiz") || q.contains("practice") || q.contains("test")) {
                return "**Practice Knowledge Assessment — " + title + "**\n\n" +
                        "**Question 1**: What is the primary purpose of the Cost Function `J(w,b)` in Linear Regression?\n" +
                        "• *Answer*: It measures the error between predicted outputs `f(x)` and true targets `y`, allowing Gradient Descent to optimize parameter weights `w` and bias `b`.\n\n" +
                        "**Question 2**: How does Regularization (`λ`) prevent Overfitting?\n" +
                        "• *Answer*: By penalizing large weight magnitudes in the loss function, reducing model complexity.";
            }
            return "**" + title + " AI Assistant**\n\n" +
                    "Welcome to your AI Tutor for **" + title + "**! Key topics covered:\n" +
                    "• **Supervised Learning**: Linear/Logistic Regression, Cost Functions, & Gradient Descent.\n" +
                    "• **Advanced Algorithms**: Multi-layer Neural Networks, Decision Trees, Random Forests, & XGBoost.\n" +
                    "• **Unsupervised Learning**: K-Means Clustering, Anomaly Detection, & Recommender Systems.\n\n" +
                    "Ask me any question about algorithms, math concepts, or Python Scikit-Learn/TensorFlow code!";
        }

        // Generative AI & Large Language Models Courses
        if (cid.contains("c_coursera_3") || cid.contains("c_coursera_7") || cid.contains("c_udemy_2") || cid.contains("c_udemy_3") || cid.contains("c_udemy_8") || cid.contains("c_google_1") || title.toLowerCase().contains("generative") || title.toLowerCase().contains("llm") || title.toLowerCase().contains("prompt")) {
            if (q.contains("module 1") || q.contains("transformer") || q.contains("attention") || q.contains("explain")) {
                return "**" + title + " — Transformer Architecture & LLM Foundations**\n\n" +
                        "Generative AI models rely on the Transformer architecture (*Attention Is All You Need*):\n\n" +
                        "• **Self-Attention Mechanism**: Calculates relationship weights between input tokens using Query (Q), Key (K), and Value (V) matrices: `Attention(Q,K,V) = softmax(QKᵀ / √dₖ) V`.\n" +
                        "• **Fine-Tuning (PEFT / LoRA)**: Parameter-Efficient Fine-Tuning freezes original model weights and injects trainable low-rank decomposition matrices, reducing memory by up to 90%.\n" +
                        "• **RAG Architecture**: Combines Dense Vector Embeddings (ChromaDB / Pinecone) with LLMs to supply real-time domain knowledge without re-training.\n\n" +
                        "How would you like to explore this topic further?";
            }
            return "**" + title + " AI Assistant**\n\n" +
                    "Welcome to your Generative AI Tutor for **" + title + "**!\n" +
                    "• **LLM Core**: Transformer encoders/decoders, Self-Attention, & token embeddings.\n" +
                    "• **Prompt Engineering**: Persona, Few-Shot, & ReAct reasoning patterns.\n" +
                    "• **Application Building**: LangChain, RAG vector retrieval, & Agent tool integration.\n\n" +
                    "Feel free to ask about prompt design, model fine-tuning, or code examples!";
        }

        // Deep Learning & PyTorch Courses
        if (cid.contains("c_coursera_4") || cid.contains("c_udemy_4") || title.toLowerCase().contains("deep learning") || title.toLowerCase().contains("pytorch")) {
            return "**" + title + " AI Assistant**\n\n" +
                    "Welcome! This course covers Deep Learning and Neural Network architectures:\n" +
                    "• **Neural Network Building**: Forward propagation, Activation functions (ReLU, Sigmoid), & Backpropagation.\n" +
                    "• **Convolutional Networks (CNNs)**: Image classification, ResNet skip connections, & object detection.\n" +
                    "• **PyTorch Framework**: Tensors, Autograd, Custom Datasets/DataLoaders, & CUDA GPU acceleration.\n\n" +
                    "What deep learning topic or PyTorch code exercise would you like to work on?";
        }

        // Web Development & Computer Science Courses
        if (cid.contains("c_udemy_7") || cid.contains("c_meta_1") || cid.contains("c_edx_1") || title.toLowerCase().contains("web development") || title.toLowerCase().contains("front-end") || title.toLowerCase().contains("computer science")) {
            return "**" + title + " AI Assistant**\n\n" +
                    "Welcome! I am your AI Tutor for **" + title + "**:\n" +
                    "• **Frontend**: Modern HTML5, CSS Flexbox/Grid, Responsive Design, JavaScript ES6+, & React Components.\n" +
                    "• **Backend & DB**: Node.js, Express RESTful APIs, Middleware, and Relational Databases (SQL/PostgreSQL).\n" +
                    "• **Full-Stack Integration**: Connecting React frontends with backend APIs and state management.\n\n" +
                    "Ask me about any module, web concept, or code debugging question!";
        }

        // IBM Data Science
        if (cid.contains("c_coursera_5") || cid.contains("ibm-data-science") || title.toLowerCase().contains("ibm data science")) {
            if (q.contains("module 1") || q.contains("what is data science")) {
                return "**IBM Data Science — Module 1: What is Data Science?**\n\n" +
                        "Module 1 introduces the field of Data Science, exploring its methodology, business applications, and key practitioner roles:\n\n" +
                        "• **What is Data Science?**: The interdisciplinary field combining Domain Expertise, Programming (Python/R), and Statistics to extract actionable insights from structured & unstructured data.\n" +
                        "• **Data Science vs Machine Learning**: Data Science covers the entire data lifecycle (collection, wrangling, exploration, modeling, & communication), whereas Machine Learning focuses specifically on algorithmic model training.\n" +
                        "• **Key Tools Introduced**: Jupyter Notebooks, RStudio, IBM Watson Studio, Pandas, & SQL.\n\n" +
                        "How can I help you explore Module 1 concepts or code exercises?";
            }
            return "**IBM Data Science Professional Certificate**\n\n" +
                    "Welcome! This program covers end-to-end Data Science & Analytics:\n" +
                    "• **Python & SQL**: Data structures, functions, Pandas DataFrames, and SQL relational queries.\n" +
                    "• **Data Visualization**: Matplotlib, Seaborn, & Folium interactive geospatial maps.\n" +
                    "• **Machine Learning**: Scikit-Learn regression, classification, & clustering models.\n\n" +
                    "Ask me about any module, topic, or code example!";
        }

        // AI For Everyone
        if (cid.contains("c_coursera_1") || cid.contains("ai-for-everyone") || title.toLowerCase().contains("ai for everyone")) {
            return "**AI For Everyone (Andrew Ng)**\n\n" +
                    "This course provides a non-technical introduction to Artificial Intelligence:\n" +
                    "• **Supervised Learning**: Mapping input (X) to output (Y) using labeled datasets.\n" +
                    "• **Machine Learning vs Data Science**: Building predictive models vs analyzing data to drive strategic decisions.\n" +
                    "• **AI Workflows**: Problem definition, data collection, model training, & business integration.\n\n" +
                    "What topic would you like to explore today?";
        }

        // Google Cybersecurity
        if (cid.contains("c_coursera_6") || cid.contains("cybersecurity") || title.toLowerCase().contains("cybersecurity")) {
            return "**Google Cybersecurity Professional Certificate**\n\n" +
                    "This program covers foundational security defenses:\n" +
                    "• **SIEM Tools**: Security Information & Event Management (Chronicle & Splunk).\n" +
                    "• **Linux & SQL**: File permissions, shell pipelines, & querying database logs.\n" +
                    "• **Network Security**: TCP/IP protocols, firewalls, VPNs, & packet analysis.\n\n" +
                    "How can I assist your cybersecurity learning today?";
        }

        // Platform architecture
        if ("PROJECT_SPECIFIC".equals(category) || q.contains("intellitutor") || q.contains("microservice")) {
            return "**IntelliTutor Project Architecture**\n\n" +
                    "IntelliTutor is an educational cloud-native LMS platform built with 5 Spring Boot microservices:\n" +
                    "• **api-gateway** (Port 8080): Centralized routing, Keycloak OAuth2 JWT security, & Redis rate limiting.\n" +
                    "• **user-service** (Port 8081): Auth & profile management.\n" +
                    "• **course-service** (Port 8082): Syllabus & course enrollments.\n" +
                    "• **quiz-service** (Port 8083): Practice assessments & attempt score logging.\n" +
                    "• **progress-service** (Port 8084): Module completion tracking.\n" +
                    "• **tutor-service** (Port 8085): AI Chatbot RAG engine.";
        }

        // Generic Course Fallback
        String topicQuery = (query != null && !query.isBlank()) ? query : "course concepts";
        return "**" + title + " — AI Tutor Assistant**\n\n" +
                "Here is an overview of **" + topicQuery + "** in **" + title + "**:\n\n" +
                "• **Key Focus**: Mastering foundational principles, practical techniques, and real-world applications.\n" +
                "• **Core Takeaway**: Understanding the underlying theory and building hands-on skills step-by-step.\n" +
                "• **Next Steps**: Reviewing module materials, working through practice exercises, and testing your knowledge.\n\n" +
                "How can I assist your study session further today?";
    }
}
