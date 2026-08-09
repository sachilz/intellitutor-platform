# Quiz & Assessment Service (Port 8081)

Microservice of the **IntelliLearn** platform responsible for quizzes and assessments.

- **Author:** ITBIN-2313-0007
- **Stack:** Spring Boot 3.3.2 · Java 17 · Spring Security 6 · Spring Data JPA · H2 · springdoc 2 (Swagger UI)
- **Port:** `8081`

## Prerequisites

| Tool | Version | Notes |
|------|---------|-------|
| JDK  | 17 | on Arch: `sudo pacman -S jdk17-openjdk` |
| Maven | 3.9+ | `sudo pacman -S maven` |

## Running locally

Use the Maven wrapper (recommended):

```bash
cd quiz-service
./mvnw spring-boot:run
```

or with a system-installed Maven:

```bash
mvn spring-boot:run
```

or package and run the jar:

```bash
./mvnw -DskipTests package
java -jar target/quiz-service-0.0.1-SNAPSHOT.jar
```

The service starts on **http://localhost:8081** and pre-loads two sample quizzes
(*Java Fundamentals*, *Spring Boot Basics*) via a `CommandLineRunner`.

## API key security

Every endpoint except Swagger/OpenAPI is gated by the custom header:

```
X-API-Key: INTELLILEARN-QUIZ-KEY-2026
```

Requests without a valid key are rejected with **HTTP 401**. The key is
configurable via the `intellilearn.api-key` property (override it with an
environment variable in production, never commit real secrets):

```bash
INTELLILEARN_API_KEY=my-secret ./mvnw spring-boot:run
```

> The H2 web console is *not* exempt from the key (per project rule, only
> Swagger bypasses it), so it is not reachable from a browser. Inspect data
> through the API endpoints instead.

## Endpoints

| Method | Path                      | Auth                       | Description                              |
|--------|---------------------------|----------------------------|------------------------------------------|
| GET    | `/`                       | none                       | 302 redirect to Swagger UI               |
| GET    | `/api/quizzes`            | API key                    | List all quizzes (with questions)        |
| GET    | `/api/quizzes/{id}`       | API key                    | Get one quiz                             |
| POST   | `/api/quizzes`            | API key + `X-User-Role: ADMIN` | Create a quiz (admin only)           |
| POST   | `/api/quizzes/{id}/submit`| API key                    | Submit answers, get score + feedback     |
| GET    | `/swagger-ui.html`        | none                       | Swagger UI                               |
| GET    | `/v3/api-docs`            | none                       | OpenAPI 3 JSON                           |

### Example: submit a quiz attempt

```bash
curl -X POST http://localhost:8081/api/quizzes/1/submit \
  -H "X-API-Key: INTELLILEARN-QUIZ-KEY-2026" \
  -H "Content-Type: application/json" \
  -d '{"selectedOptions":[0,1,2]}'
```

Response:

```json
{
  "quizId": 1,
  "score": 100,
  "correctAnswersCount": 3,
  "totalQuestions": 3,
  "feedback": "Excellent work! You have a strong grasp of the material.",
  "recommendations": []
}
```

## Testing with curl

```bash
BASE=http://localhost:8081
KEY="X-API-Key: INTELLILEARN-QUIZ-KEY-2026"

# Root redirects to Swagger UI (no key needed)
curl -s -o /dev/null -w "%{http_code}\n" $BASE/                                     # 302

# Security: rejected without/with wrong key
curl -s -o /dev/null -w "%{http_code}\n" $BASE/api/quizzes                          # 401
curl -s -o /dev/null -w "%{http_code}\n" -H "X-API-Key: nope" $BASE/api/quizzes    # 401

# CRUD
curl -s -H "$KEY" $BASE/api/quizzes                                                 # 200 (2 quizzes)
curl -s -H "$KEY" $BASE/api/quizzes/1                                               # 200
curl -s -H "$KEY" $BASE/api/quizzes/999                                             # 404
curl -s -X POST -H "$KEY" -H "Content-Type: application/json" \
  -d '{"title":"T","questions":[{"text":"q","options":["a","b"],"correctOptionIndex":0}]}' \
  $BASE/api/quizzes                                                                 # 403 (no role)
curl -s -X POST -H "$KEY" -H "X-User-Role: ADMIN" -H "Content-Type: application/json" \
  -d '{"title":"T","questions":[{"text":"q","options":["a","b"],"correctOptionIndex":0}]}' \
  $BASE/api/quizzes                                                                 # 201

# Assessment
curl -s -X POST -H "$KEY" -H "Content-Type: application/json" \
  -d '{"selectedOptions":[0,0,2]}' $BASE/api/quizzes/1/submit                       # 200, score 67
curl -s -X POST -H "$KEY" -H "Content-Type: application/json" \
  -d '{"selectedOptions":[0,1]}' $BASE/api/quizzes/1/submit                         # 400 (count mismatch)

# Swagger (no key needed)
curl -s -o /dev/null -w "%{http_code}\n" $BASE/swagger-ui/index.html                # 200
```

## Swagger UI

Open **http://localhost:8081/swagger-ui.html** in a browser. Use the
**Authorize** button to enter the API key once; every "Try it out" request will
then send the `X-API-Key` header automatically.

## Docker

```bash
cd quiz-service
docker build -t intellilearn/quiz-service .
docker run -p 8081:8081 intellilearn/quiz-service
```

The container runs as a non-root user and exposes port 8081. A root
`docker-compose.yml` will orchestrate all services together later.

## Design notes / known trade-offs

- **`GET` responses expose `correctOptionIndex`** (the answer key). This is
  fine for the current development phase, but before a student-facing release
  the read endpoints should use a DTO that omits the answer key.
- **Admin check** for `POST /api/quizzes` uses the `X-User-Role: ADMIN` header.
  The authoritative role check lives in the API Gateway (partner's
  responsibility); this service-level check is a second line of defence.
- **EAGER fetching** on `Quiz.questions` / `Question.options`: simplest correct
  approach at this data size and avoids lazy-loading exceptions during JSON
  serialisation. Revisit (lazy + entity graphs) if data grows.
- The API key is a shared development secret; rotate and externalise it for
  production via `intellilearn.api-key`.
