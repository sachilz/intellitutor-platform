// =====================================================================
// IntelliTutor Platform — MongoDB Atlas Database & Collection Initializer
// =====================================================================
// IDEMPOTENT: Safe to re-run. Skips existing collections, ensures indexes.
//
// Usage (mongosh):
//   mongosh "mongodb+srv://sachilz:<password>@cluster0.be9f7gl.mongodb.net/" --file init-mongodb.js
// =====================================================================

function ensureCollection(database, collectionName, validator) {
  var existing = database.getCollectionNames();
  if (existing.indexOf(collectionName) === -1) {
    database.createCollection(collectionName, { validator: validator });
    print("  ✅ Created collection: " + collectionName);
  } else {
    // Update the validator on the existing collection
    database.runCommand({ collMod: collectionName, validator: validator });
    print("  ⏭️  Collection already exists: " + collectionName + " (validator updated)");
  }
}

function ensureIndex(collection, keys, options) {
  try {
    collection.createIndex(keys, options);
    print("    📇 Index: " + options.name);
  } catch (e) {
    print("    ⏭️  Index already exists: " + options.name);
  }
}


// ─────────────────────────────────────────────────────────────────────
// 1. USER SERVICE — Database: userdb
// ─────────────────────────────────────────────────────────────────────
print("\n🔷 userdb");
var userdb = db.getSiblingDB("userdb");

ensureCollection(userdb, "users", {
  $jsonSchema: {
    bsonType: "object",
    required: ["name", "email", "passwordHash", "role", "createdAt"],
    properties: {
      _id:          { bsonType: "objectId" },
      name:         { bsonType: "string", description: "Full name of the user" },
      email:        { bsonType: "string", description: "Unique email address" },
      passwordHash: { bsonType: "string", description: "BCrypt password hash" },
      role:         { bsonType: "string", enum: ["STUDENT", "INSTRUCTOR", "ADMIN"], description: "User role" },
      apiKey:       { bsonType: "string", description: "API key for service authentication" },
      createdAt:    { bsonType: "date",   description: "Account creation timestamp" }
    }
  }
});

ensureIndex(userdb.users, { email: 1 }, { unique: true, name: "idx_users_email_unique" });
ensureIndex(userdb.users, { role: 1 },  { name: "idx_users_role" });


// ─────────────────────────────────────────────────────────────────────
// 2. COURSE SERVICE — Database: coursedb
// ─────────────────────────────────────────────────────────────────────
print("\n🔷 coursedb");
var coursedb = db.getSiblingDB("coursedb");

ensureCollection(coursedb, "courses", {
  $jsonSchema: {
    bsonType: "object",
    required: ["title", "instructorId", "createdAt"],
    properties: {
      _id:          { bsonType: "objectId" },
      title:        { bsonType: "string", description: "Course title" },
      description:  { bsonType: "string", description: "Course description" },
      instructorId: { bsonType: "string", description: "Reference to the instructor (userId)" },
      materials:    { bsonType: "array",  items: { bsonType: "string" }, description: "List of material URLs or references" },
      createdAt:    { bsonType: "date",   description: "Course creation timestamp" }
    }
  }
});

ensureIndex(coursedb.courses, { instructorId: 1 }, { name: "idx_courses_instructorId" });
ensureIndex(coursedb.courses, { title: 1 },        { name: "idx_courses_title" });

ensureCollection(coursedb, "enrollments", {
  $jsonSchema: {
    bsonType: "object",
    required: ["userId", "courseId", "enrolledAt"],
    properties: {
      _id:        { bsonType: "objectId" },
      userId:     { bsonType: "string", description: "Reference to the enrolled user" },
      courseId:   { bsonType: "string", description: "Reference to the course" },
      enrolledAt: { bsonType: "date",   description: "Enrollment timestamp" }
    }
  }
});

ensureIndex(coursedb.enrollments, { userId: 1, courseId: 1 }, { unique: true, name: "idx_enrollments_user_course_unique" });
ensureIndex(coursedb.enrollments, { courseId: 1 },            { name: "idx_enrollments_courseId" });
ensureIndex(coursedb.enrollments, { userId: 1 },              { name: "idx_enrollments_userId" });


// ─────────────────────────────────────────────────────────────────────
// 3. PROGRESS SERVICE — Database: progressdb
// ─────────────────────────────────────────────────────────────────────
print("\n🔷 progressdb");
var progressdb = db.getSiblingDB("progressdb");

ensureCollection(progressdb, "progress", {
  $jsonSchema: {
    bsonType: "object",
    required: ["userId", "courseId", "completedPercent"],
    properties: {
      _id:              { bsonType: "objectId" },
      userId:           { bsonType: "string", description: "Reference to the user" },
      courseId:          { bsonType: "string", description: "Reference to the course" },
      completedPercent: { bsonType: "int",    minimum: 0, maximum: 100, description: "Progress percentage (0-100)" },
      lastAccessed:     { bsonType: "date",   description: "Last access timestamp" }
    }
  }
});

ensureIndex(progressdb.progress, { userId: 1, courseId: 1 }, { unique: true, name: "idx_progress_user_course_unique" });
ensureIndex(progressdb.progress, { userId: 1 },              { name: "idx_progress_userId" });
ensureIndex(progressdb.progress, { courseId: 1 },             { name: "idx_progress_courseId" });


// ─────────────────────────────────────────────────────────────────────
// 4. QUIZ SERVICE — Database: quizdb
//    Note: Quiz & Question entities use H2 (in-memory relational DB).
//    Only QuizAttempt is stored in MongoDB.
// ─────────────────────────────────────────────────────────────────────
print("\n🔷 quizdb");
var quizdb = db.getSiblingDB("quizdb");

ensureCollection(quizdb, "quiz_attempts", {
  $jsonSchema: {
    bsonType: "object",
    required: ["quizId", "userId", "score", "totalQuestions", "submittedAt"],
    properties: {
      _id:                 { bsonType: "objectId" },
      quizId:              { bsonType: "string", description: "Reference to the quiz (H2 quiz ID)" },
      userId:              { bsonType: "string", description: "Reference to the user who attempted" },
      score:               { bsonType: "int",    description: "Score achieved" },
      correctAnswersCount: { bsonType: "int",    description: "Number of correct answers" },
      totalQuestions:      { bsonType: "int",    description: "Total questions in the quiz" },
      feedback:            { bsonType: "string", description: "AI-generated feedback" },
      recommendations:     { bsonType: "array",  items: { bsonType: "string" }, description: "AI-generated study recommendations" },
      submittedAt:         { bsonType: "date",   description: "Submission timestamp" }
    }
  }
});

ensureIndex(quizdb.quiz_attempts, { userId: 1 },              { name: "idx_quiz_attempts_userId" });
ensureIndex(quizdb.quiz_attempts, { quizId: 1 },              { name: "idx_quiz_attempts_quizId" });
ensureIndex(quizdb.quiz_attempts, { userId: 1, quizId: 1 },   { name: "idx_quiz_attempts_user_quiz" });
ensureIndex(quizdb.quiz_attempts, { submittedAt: -1 },         { name: "idx_quiz_attempts_submittedAt" });


// ─────────────────────────────────────────────────────────────────────
// 5. TUTOR SERVICE — Database: tutordb
// ─────────────────────────────────────────────────────────────────────
print("\n🔷 tutordb");
var tutordb = db.getSiblingDB("tutordb");

ensureCollection(tutordb, "tutor_interactions", {
  $jsonSchema: {
    bsonType: "object",
    required: ["courseId", "userId", "question", "timestamp"],
    properties: {
      _id:       { bsonType: "objectId" },
      courseId:   { bsonType: "string",  description: "Reference to the course" },
      userId:    { bsonType: "string",  description: "Reference to the user" },
      question:  { bsonType: "string",  description: "User's question" },
      answer:    { bsonType: "string",  description: "AI tutor's response" },
      grounded:  { bsonType: "bool",    description: "Whether the answer is grounded in source material" },
      sources:   { bsonType: "array",   items: { bsonType: "string" }, description: "Source references used" },
      timestamp: { bsonType: "date",    description: "Interaction timestamp" }
    }
  }
});

ensureIndex(tutordb.tutor_interactions, { userId: 1, courseId: 1 }, { name: "idx_tutor_interactions_user_course" });
ensureIndex(tutordb.tutor_interactions, { courseId: 1 },            { name: "idx_tutor_interactions_courseId" });
ensureIndex(tutordb.tutor_interactions, { userId: 1 },              { name: "idx_tutor_interactions_userId" });
ensureIndex(tutordb.tutor_interactions, { timestamp: -1 },          { name: "idx_tutor_interactions_timestamp" });


// ─────────────────────────────────────────────────────────────────────
// Summary
// ─────────────────────────────────────────────────────────────────────
print("\n══════════════════════════════════════════════════════════════");
print("  IntelliTutor — All databases & collections initialized!");
print("══════════════════════════════════════════════════════════════");
print("  Database      │ Collections");
print("  ──────────────┼──────────────────────────────");
print("  userdb        │ users");
print("  coursedb      │ courses, enrollments");
print("  progressdb    │ progress");
print("  quizdb        │ quiz_attempts");
print("  tutordb       │ tutor_interactions");
print("══════════════════════════════════════════════════════════════\n");
