package com.intellilearn.tutorservice.service;

import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

@Service
public class ProjectKnowledgeService {

    public static class KnowledgeResult {
        private final String context;
        private final List<String> sources;

        public KnowledgeResult(String context, List<String> sources) {
            this.context = context;
            this.sources = sources;
        }

        public String getContext() { return context; }
        public List<String> getSources() { return sources; }
    }

    public KnowledgeResult retrieveProjectContext(String query, String courseId, String courseTitle) {
        String q = query != null ? query.toLowerCase(Locale.ROOT) : "";
        String cid = courseId != null ? courseId.toLowerCase(Locale.ROOT) : "general";
        StringBuilder contextBuilder = new StringBuilder();
        List<String> sources = new ArrayList<>();

        // Check if query is explicitly about IntelliTutor microservices platform architecture
        if (q.contains("intellitutor") || q.contains("gateway") || q.contains("rate limit") || q.contains("redis") || q.contains("keycloak") || q.contains("docker compose")) {
            contextBuilder.append("--- INTELLITUTOR PLATFORM AUTHORITATIVE ARCHITECTURE CONTEXT ---\n");
            contextBuilder.append("System Overview: Cloud-native Learning Management System built using a Microservices Architecture.\n");
            contextBuilder.append("Port Map: API Gateway (8080), User Service (8081), Course Service (8082), Quiz Service (8083), Progress Service (8084), Tutor Service (8085), Keycloak IAM (8180), Redis Cache (6379), MongoDB (27017), React Client (3000).\n");
            sources.add("Architecture_Specification.pdf");

            if (q.contains("gateway") || q.contains("rate limit") || q.contains("redis")) {
                contextBuilder.append("\nAPI Gateway: Spring Cloud Gateway (port 8080) routing /api/users/**, /api/auth/**, /api/courses/**, /api/quizzes/**, /api/progress/**, /api/tutor/** with Redis rate limiting (replenishRate: 5, burstCapacity: 10).\n");
                sources.add("API_Gateway_Config.pdf");
            }
            if (q.contains("keycloak") || q.contains("auth") || q.contains("jwt") || q.contains("401")) {
                contextBuilder.append("\nKeycloak Security: Keycloak 25.0 (port 8180) realm 'intellilearn' issuing OAuth2 JWT Bearer tokens validated centrally.\n");
                sources.add("Keycloak_OAuth2_Security.pdf");
            }
            return new KnowledgeResult(contextBuilder.toString(), sources);
        }

        // --- COURSE-AWARE CURRICULUM CONTEXT RESOLUTION ---
        if (cid.contains("c_coursera_5") || cid.contains("ibm-data-science") || (courseTitle != null && courseTitle.toLowerCase(Locale.ROOT).contains("ibm data science"))) {
            contextBuilder.append("--- COURSE CONTEXT: IBM Data Science Professional Certificate ---\n");
            contextBuilder.append("Course Overview: Job-ready program covering Data Science methodology, Python programming, Jupyter Notebooks, RStudio, SQL databases, Data Wrangling with Pandas/NumPy, Data Visualization, and Machine Learning.\n");
            contextBuilder.append("Module 1: What is Data Science? (Data science methodology, tools, & industry applications).\n");
            contextBuilder.append("Module 2: Tools for Data Science (Jupyter Notebooks, RStudio, IBM Watson Studio).\n");
            contextBuilder.append("Module 3: Data Science Methodology (Problem to approach, requirements to collection, understanding to preparation).\n");
            contextBuilder.append("Module 4: Python for Data Science, AI & Development (Variables, Data Structures, Logic, Functions, Files, Libraries).\n");
            contextBuilder.append("Module 5: Python Project for Data Science (Web scraping & data extraction).\n");
            contextBuilder.append("Module 6: Databases and SQL for Data Science with Python (Relational database concepts, SELECT, WHERE, JOINs, Python DB-API).\n");
            contextBuilder.append("Module 7: Data Analysis with Python (Pandas DataFrames, Data Cleaning, Model Development, Polynomial Regression).\n");
            contextBuilder.append("Module 8: Data Visualization with Python (Matplotlib, Seaborn, Folium geospatial maps).\n");
            contextBuilder.append("Module 9: Machine Learning with Python (Scikit-Learn algorithms: Regression, Classification, K-Means Clustering).\n");
            contextBuilder.append("Module 10: Applied Data Science Capstone (Real-world SpaceX launch analysis).\n");
            sources.add("IBM_Data_Science_Syllabus.pdf");
            sources.add("Python_Data_Analysis_Guide.pdf");

        } else if (cid.contains("c_coursera_1") || cid.contains("ai-for-everyone") || (courseTitle != null && courseTitle.toLowerCase(Locale.ROOT).contains("ai for everyone"))) {
            contextBuilder.append("--- COURSE CONTEXT: AI For Everyone (DeepLearning.AI) ---\n");
            contextBuilder.append("Course Overview: Non-technical guide to Artificial Intelligence taught by Andrew Ng.\n");
            contextBuilder.append("Module 1: What is AI? (Machine Learning vs Data Science, Deep Learning, Supervised Learning).\n");
            contextBuilder.append("Module 2: Building AI Projects & Data Workflows (Technical team roles, dataset requirements, evaluation).\n");
            contextBuilder.append("Module 3: Building AI In Your Company (Selecting pilot projects, enterprise strategy, team structure).\n");
            contextBuilder.append("Module 4: AI and Society (Ethics, bias, discrimination, jobs, automation).\n");
            sources.add("AI_For_Everyone_Guide.pdf");

        } else if (cid.contains("c_coursera_6") || cid.contains("google-cybersecurity") || (courseTitle != null && courseTitle.toLowerCase(Locale.ROOT).contains("cybersecurity"))) {
            contextBuilder.append("--- COURSE CONTEXT: Google Cybersecurity Professional Certificate ---\n");
            contextBuilder.append("Course Overview: Entry-level cybersecurity credential covering threat analysis, Linux CLI, SQL, SIEM (Splunk & Chronicle), and Python security automation.\n");
            contextBuilder.append("Module 1: Foundations of Cybersecurity (Threat landscape, CIA Triad, security controls).\n");
            contextBuilder.append("Module 2: Manage Security Risks (NIST Framework, Playbooks, Risk assessments).\n");
            contextBuilder.append("Module 3: Networks & Network Security (TCP/IP, Firewalls, VPNs, Packet analysis).\n");
            contextBuilder.append("Module 4: Linux and SQL for Security (Linux CLI, file permissions, SQL database queries).\n");
            sources.add("Google_Cybersecurity_Manual.pdf");

        } else if (cid.contains("c_udemy_7") || cid.contains("web-development") || (courseTitle != null && courseTitle.toLowerCase(Locale.ROOT).contains("web development"))) {
            contextBuilder.append("--- COURSE CONTEXT: The Complete Web Development Bootcamp ---\n");
            contextBuilder.append("Course Overview: Full-stack web development program covering HTML5, CSS3, JavaScript ES6, Node.js, Express, React, and PostgreSQL.\n");
            contextBuilder.append("Module 1: Frontend Web Development (HTML5 tags, CSS3 Flexbox & Grid, Responsive UI design).\n");
            contextBuilder.append("Module 2: JavaScript ES6 & DOM Manipulation (Variables, Functions, Event Listeners, Async/Await).\n");
            contextBuilder.append("Module 3: Backend Web Development (Node.js runtime, Express REST APIs, Middleware).\n");
            contextBuilder.append("Module 4: React.js & Full-Stack AI Integration (Components, Hooks, State management).\n");
            sources.add("FullStack_WebDev_Bootcamp.pdf");

        } else if (cid.contains("java") || (courseTitle != null && courseTitle.toLowerCase(Locale.ROOT).contains("java"))) {
            contextBuilder.append("--- COURSE CONTEXT: Java Fundamentals & Object-Oriented Programming ---\n");
            contextBuilder.append("Core Concepts: 4 Pillars of OOP (Encapsulation, Abstraction, Inheritance, Polymorphism).\n");
            contextBuilder.append("Language Features: Strong Typing, Primitives, Classes, Objects, Method Overriding, Interfaces.\n");
            sources.add("Java_OOP_Guide.pdf");

        } else if (cid.contains("spring") || (courseTitle != null && courseTitle.toLowerCase(Locale.ROOT).contains("spring"))) {
            contextBuilder.append("--- COURSE CONTEXT: Spring Boot & Cloud Microservices ---\n");
            contextBuilder.append("Framework Features: Auto-configuration, Starter Dependencies, Embedded Tomcat, Spring Data JPA, Spring Cloud Gateway.\n");
            contextBuilder.append("Annotations: @RestController, @Service, @Autowired, @Configuration, @SpringBootApplication.\n");
            sources.add("Spring_Boot_Guide.pdf");

        } else {
            contextBuilder.append("--- GENERAL COURSE KNOWLEDGE CONTEXT ---\n");
            contextBuilder.append("Topic Overview: General technical and computer science learning material.\n");
            sources.add("IntelliTutor_Learning_Resource.pdf");
        }

        contextBuilder.append("\nGUARDRAIL DIRECTIVE: Answer the user's question accurately based on the active course context above. If course material is insufficient, state clearly: 'I don't have detailed course material for this specific topic yet. Here is a general explanation...'. Do NOT invent facts.");

        return new KnowledgeResult(contextBuilder.toString(), sources);
    }
}
