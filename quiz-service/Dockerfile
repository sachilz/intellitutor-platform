# =====================================================================
# IntelliLearn - Quiz & Assessment Service
# Build:    docker build -t intellilearn/quiz-service .
# Run:      docker run -p 8081:8081 intellilearn/quiz-service
# =====================================================================

# ---- Build stage: compile and package the application -----------------
FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /workspace

# Cache dependencies first (layer only invalidated when pom.xml changes)
COPY pom.xml .
RUN mvn -B -q dependency:go-offline

COPY src ./src
RUN mvn -B clean package -DskipTests

# ---- Runtime stage: minimal JRE ----------------------------------------
FROM eclipse-temurin:17-jre
WORKDIR /app

# Run as a non-root user
RUN useradd --system --uid 10001 --create-home appuser

COPY --from=build /workspace/target/quiz-service-*.jar /app/app.jar

USER appuser
EXPOSE 8081

ENTRYPOINT ["java", "-jar", "/app/app.jar"]
