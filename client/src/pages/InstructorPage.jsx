import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { createCourse, getCourses, deleteCourse } from '../api/courseApi';
import { createQuiz, getQuizzes, getQuizAttempts } from '../api/quizApi';
import {
  Award,
  BookOpen,
  Plus,
  Layers,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Trash2,
  Tag,
  User,
  FileText,
  BarChart3,
  Package,
  X,
  MinusCircle,
  Eye,
  Clock,
  HelpCircle,
  Users,
} from 'lucide-react';

// ─── INSTRUCTOR DASHBOARD ─────────────────────────────────────────
const InstructorPage = () => {
  const { user } = useAuth();
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState('COURSES');
  const [loading, setLoading] = useState(false);

  // ── Data state ──
  const [courses, setCourses] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [coursesLoading, setCoursesLoading] = useState(true);

  // ── Create Course form ──
  const [showCourseForm, setShowCourseForm] = useState(false);
  const [courseForm, setCourseForm] = useState({
    title: '',
    description: '',
    category: 'Computer Science',
    instructor: user?.username || '',
  });

  // ── Create Quiz form ──
  const [showQuizForm, setShowQuizForm] = useState(false);
  const [quizTitle, setQuizTitle] = useState('');
  const [quizDescription, setQuizDescription] = useState('');
  const [quizQuestions, setQuizQuestions] = useState([
    { text: '', options: ['', ''], correctOptionIndex: 0 },
  ]);

  // ── View Submissions modal ──
  const [submissionsModal, setSubmissionsModal] = useState(null); // { quiz, attempts }

  // ─── FETCH DATA ─────────────────────────────────────────────────
  const fetchData = useCallback(async () => {
    setCoursesLoading(true);
    try {
      const [courseData, quizData] = await Promise.all([
        getCourses().catch(() => []),
        getQuizzes().catch(() => []),
      ]);
      const allCourses = Array.isArray(courseData) ? courseData : courseData?.courses || [];
      setCourses(allCourses);
      setQuizzes(Array.isArray(quizData) ? quizData : []);
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setCoursesLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ─── HELPERS ────────────────────────────────────────────────────
  const switchTab = (tab) => setActiveTab(tab);

  const getQuizzesForCourse = (courseId) => {
    // Backend doesn't filter by courseId yet — show all quizzes for now
    return quizzes;
  };

  // ─── CREATE COURSE ──────────────────────────────────────────────
  const handleCreateCourse = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createCourse({
        title: courseForm.title,
        description: courseForm.description,
        category: courseForm.category,
        instructor: courseForm.instructor,
        modules: [
          { title: 'Module 1: Foundations', completedPercent: 0 },
          { title: 'Module 2: Advanced Topics', completedPercent: 0 },
        ],
      });
      addToast('Course published successfully!', 'success', 'Course Created');
      setCourseForm({ title: '', description: '', category: 'Computer Science', instructor: user?.username || '' });
      setShowCourseForm(false);
      fetchData();
    } catch (err) {
      console.error('Course creation error:', err);
      addToast('Failed to publish course.', 'error', 'Error');
    } finally {
      setLoading(false);
    }
  };

  // ─── CREATE QUIZ ────────────────────────────────────────────────
  const addQuestion = () => {
    setQuizQuestions([...quizQuestions, { text: '', options: ['', ''], correctOptionIndex: 0 }]);
  };

  const removeQuestion = (idx) => {
    if (quizQuestions.length <= 1) return;
    setQuizQuestions(quizQuestions.filter((_, i) => i !== idx));
  };

  const updateQuestion = (idx, field, value) => {
    const updated = [...quizQuestions];
    updated[idx] = { ...updated[idx], [field]: value };
    setQuizQuestions(updated);
  };

  const addOption = (qIdx) => {
    const updated = [...quizQuestions];
    updated[qIdx] = { ...updated[qIdx], options: [...updated[qIdx].options, ''] };
    setQuizQuestions(updated);
  };

  const removeOption = (qIdx, optIdx) => {
    const updated = [...quizQuestions];
    const opts = updated[qIdx].options.filter((_, i) => i !== optIdx);
    if (opts.length < 2) return;
    let correct = updated[qIdx].correctOptionIndex;
    if (correct >= opts.length) correct = 0;
    updated[qIdx] = { ...updated[qIdx], options: opts, correctOptionIndex: correct };
    setQuizQuestions(updated);
  };

  const updateOption = (qIdx, optIdx, value) => {
    const updated = [...quizQuestions];
    const opts = [...updated[qIdx].options];
    opts[optIdx] = value;
    updated[qIdx] = { ...updated[qIdx], options: opts };
    setQuizQuestions(updated);
  };

  const handleCreateQuiz = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createQuiz({
        title: quizTitle,
        description: quizDescription,
        questions: quizQuestions,
      });
      addToast('Quiz published successfully!', 'success', 'Quiz Created');
      setQuizTitle('');
      setQuizDescription('');
      setQuizQuestions([{ text: '', options: ['', ''], correctOptionIndex: 0 }]);
      setShowQuizForm(false);
      fetchData();
    } catch (err) {
      console.error('Quiz creation error:', err);
      addToast('Failed to create quiz. Ensure the Quiz Service is running.', 'error', 'Error');
    } finally {
      setLoading(false);
    }
  };

  // ─── DELETE COURSE ──────────────────────────────────────────────
  const handleDeleteCourse = async (courseId, title) => {
    if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) return;
    try {
      await deleteCourse(courseId);
      addToast(`"${title}" removed.`, 'success', 'Deleted');
      fetchData();
    } catch (err) {
      addToast('Failed to delete course.', 'error', 'Error');
    }
  };

  // ─── VIEW SUBMISSIONS ──────────────────────────────────────────
  const handleViewSubmissions = async (quiz) => {
    try {
      // Backend only supports per-user attempts — fetch for common demo user
      const attempts = await getQuizAttempts(quiz.id, 'student1@intellilearn.com').catch(() => []);
      setSubmissionsModal({ quiz, attempts: Array.isArray(attempts) ? attempts : [] });
    } catch {
      setSubmissionsModal({ quiz, attempts: [] });
    }
  };

  // ─── RENDER ─────────────────────────────────────────────────────
  return (
    <div className="instructor-container">
      <div className="instructor-split-wrapper">
        {/* ── Left Branding Sidebar ── */}
        <aside className="instructor-branding-panel">
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(168,85,247,0.15)', border: '1px solid rgba(168,85,247,0.35)', padding: '4px 14px', borderRadius: '20px', fontSize: '0.8rem', color: '#d8b4fe', fontWeight: 600, marginBottom: '16px' }}>
              <Sparkles size={14} color="var(--neon-violet)" /> Instructor Console
            </div>
            <h1 style={{ fontSize: '1.65rem', fontWeight: 800, lineHeight: 1.2, marginBottom: '8px' }}>
              Welcome, {user?.username || 'Instructor'}
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: 1.6 }}>
              Manage your courses, create assessments, and track student performance.
            </p>
          </div>

          {/* Stat Cards */}
          <div className="instructor-stat-cards">
            <div className="instructor-stat-card">
              <div className="instructor-stat-icon" style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)' }}>
                <BookOpen size={20} color="#818cf8" />
              </div>
              <div className="instructor-stat-info">
                <span className="instructor-stat-value" style={{ color: '#a5b4fc' }}>{courses.length}</span>
                <span className="instructor-stat-label">Courses</span>
              </div>
            </div>
            <div className="instructor-stat-card">
              <div className="instructor-stat-icon" style={{ background: 'rgba(6,182,212,0.15)', border: '1px solid rgba(6,182,212,0.3)' }}>
                <FileText size={20} color="#67e8f9" />
              </div>
              <div className="instructor-stat-info">
                <span className="instructor-stat-value" style={{ color: '#67e8f9' }}>{quizzes.length}</span>
                <span className="instructor-stat-label">Quizzes</span>
              </div>
            </div>
            <div className="instructor-stat-card">
              <div className="instructor-stat-icon" style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)' }}>
                <BarChart3 size={20} color="#6ee7b7" />
              </div>
              <div className="instructor-stat-info">
                <span className="instructor-stat-value" style={{ color: '#6ee7b7' }}>Active</span>
                <span className="instructor-stat-label">Status</span>
              </div>
            </div>
          </div>

          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', borderTop: '1px solid var(--border-color)', paddingTop: '12px' }}>
            IntelliLearn Platform © 2026 • Instructor Tools v2.0
          </div>
        </aside>

        {/* ── Right Content Panel ── */}
        <div className="instructor-content-panel">
          {/* Header */}
          <div className="instructor-content-header">
            <div style={{ display: 'inline-flex', padding: '10px', background: 'var(--primary-soft)', border: '1px solid var(--primary-border)', borderRadius: '14px' }}>
              <Award size={24} color="var(--primary-light)" />
            </div>
            <h2>Instructor Dashboard</h2>
          </div>

          {/* Tabs */}
          <div className="instructor-tabs">
            <button className={`instructor-tab-btn ${activeTab === 'COURSES' ? 'active' : ''}`} onClick={() => switchTab('COURSES')}>
              <BookOpen size={15} /> My Courses
            </button>
            <button className={`instructor-tab-btn ${activeTab === 'QUIZZES' ? 'active' : ''}`} onClick={() => switchTab('QUIZZES')}>
              <FileText size={15} /> Quizzes
            </button>
          </div>

          {/* ════════════ TAB: MY COURSES ════════════ */}
          {activeTab === 'COURSES' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', animation: 'fadeIn var(--transition-normal)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>{courses.length} course{courses.length !== 1 ? 's' : ''} published</span>
                <button className="btn btn-primary btn-sm" onClick={() => setShowCourseForm(!showCourseForm)}>
                  <Plus size={14} /> {showCourseForm ? 'Cancel' : 'Create Course'}
                </button>
              </div>

              {/* Create Course Form */}
              {showCourseForm && (
                <form onSubmit={handleCreateCourse} className="instructor-form" style={{ background: 'rgba(15,23,42,0.5)', padding: 'var(--space-5)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
                  <div className="form-group">
                    <label><span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><BookOpen size={12} /> Course Title</span></label>
                    <input type="text" className="form-control" required value={courseForm.title} onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })} placeholder="e.g. Microservices Architecture" />
                  </div>
                  <div className="form-group">
                    <label><span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><FileText size={12} /> Description</span></label>
                    <textarea className="form-control" rows={3} required value={courseForm.description} onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })} placeholder="Course description..." style={{ resize: 'vertical' }} />
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label><span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><Tag size={12} /> Category</span></label>
                      <select className="form-control" value={courseForm.category} onChange={(e) => setCourseForm({ ...courseForm, category: e.target.value })}>
                        <option value="Computer Science">Computer Science</option>
                        <option value="Artificial Intelligence">Artificial Intelligence</option>
                        <option value="Web Development">Web Development</option>
                        <option value="Data Science">Data Science</option>
                        <option value="Cybersecurity">Cybersecurity</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label><span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><User size={12} /> Instructor Name</span></label>
                      <input type="text" className="form-control" required value={courseForm.instructor} onChange={(e) => setCourseForm({ ...courseForm, instructor: e.target.value })} />
                    </div>
                  </div>
                  <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
                    {loading ? <><span className="spinner" /> Publishing...</> : <><BookOpen size={15} /> Publish Course</>}
                  </button>
                </form>
              )}

              {/* Course List */}
              {coursesLoading ? (
                <div className="instructor-empty-state"><span className="spinner" /><p>Loading courses...</p></div>
              ) : courses.length === 0 ? (
                <div className="instructor-empty-state">
                  <Package size={44} />
                  <p style={{ fontWeight: 600, color: 'var(--text-muted)' }}>You haven't created any courses yet</p>
                  <p>Click "Create Course" above to publish your first course.</p>
                </div>
              ) : (
                <div className="instructor-courses-grid">
                  {courses.map((course) => {
                    const courseQuizzes = getQuizzesForCourse(course._id || course.id);
                    return (
                      <div key={course._id || course.id} className="instructor-course-card">
                        <div className="instructor-course-card-header">
                          <span className="instructor-course-card-title">{course.title}</span>
                        </div>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                          {course.description}
                        </p>
                        <div className="instructor-course-card-meta">
                          <span className="badge badge-primary"><Tag size={10} /> {course.category || 'General'}</span>
                          <span className="badge badge-secondary"><FileText size={10} /> {courseQuizzes.length} quiz{courseQuizzes.length !== 1 ? 'zes' : ''}</span>
                        </div>
                        <button className="instructor-delete-btn" onClick={() => handleDeleteCourse(course._id || course.id, course.title)}>
                          <Trash2 size={13} /> Remove
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ════════════ TAB: QUIZZES ════════════ */}
          {activeTab === 'QUIZZES' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', animation: 'fadeIn var(--transition-normal)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>{quizzes.length} quiz{quizzes.length !== 1 ? 'zes' : ''} published</span>
                <button className="btn btn-primary btn-sm" onClick={() => setShowQuizForm(!showQuizForm)}>
                  <Plus size={14} /> {showQuizForm ? 'Cancel' : 'Create New Quiz'}
                </button>
              </div>

              {/* ── Create Quiz Form ── */}
              {showQuizForm && (
                <form onSubmit={handleCreateQuiz} className="instructor-form" style={{ background: 'rgba(15,23,42,0.5)', padding: 'var(--space-5)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
                  <div className="form-group">
                    <label><span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><Award size={12} /> Quiz Title</span></label>
                    <input type="text" className="form-control" required value={quizTitle} onChange={(e) => setQuizTitle(e.target.value)} placeholder="e.g. Java Fundamentals Assessment" />
                  </div>
                  <div className="form-group">
                    <label><span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><FileText size={12} /> Description</span></label>
                    <input type="text" className="form-control" value={quizDescription} onChange={(e) => setQuizDescription(e.target.value)} placeholder="Brief description (optional)" />
                  </div>

                  {/* Dynamic Questions */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <label style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        <HelpCircle size={12} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                        Questions ({quizQuestions.length})
                      </label>
                      <button type="button" className="btn btn-secondary btn-sm" onClick={addQuestion}>
                        <Plus size={13} /> Add Question
                      </button>
                    </div>

                    {quizQuestions.map((q, qIdx) => (
                      <div key={qIdx} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: 'var(--space-4)', display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--text-muted)' }}>Question {qIdx + 1}</span>
                          {quizQuestions.length > 1 && (
                            <button type="button" onClick={() => removeQuestion(qIdx)} style={{ background: 'none', border: 'none', color: '#fca5a5', cursor: 'pointer', padding: '2px' }} title="Remove question">
                              <MinusCircle size={16} />
                            </button>
                          )}
                        </div>
                        <input type="text" className="form-control" required value={q.text} onChange={(e) => updateQuestion(qIdx, 'text', e.target.value)} placeholder="Enter question text" />

                        {/* Options */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          {q.options.map((opt, optIdx) => (
                            <div key={optIdx} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <input
                                type="radio"
                                name={`correct_${qIdx}`}
                                checked={q.correctOptionIndex === optIdx}
                                onChange={() => updateQuestion(qIdx, 'correctOptionIndex', optIdx)}
                                title="Mark as correct answer"
                                style={{ accentColor: '#6366f1', flexShrink: 0 }}
                              />
                              <input type="text" className="form-control" required value={opt} onChange={(e) => updateOption(qIdx, optIdx, e.target.value)} placeholder={`Option ${optIdx + 1}`} style={{ fontSize: '0.85rem' }} />
                              {q.options.length > 2 && (
                                <button type="button" onClick={() => removeOption(qIdx, optIdx)} style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', padding: '2px', flexShrink: 0 }} title="Remove option">
                                  <X size={14} />
                                </button>
                              )}
                            </div>
                          ))}
                          <button type="button" onClick={() => addOption(qIdx)} style={{ alignSelf: 'flex-start', background: 'none', border: '1px dashed var(--border-color)', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px 10px', borderRadius: 'var(--radius-sm)', fontSize: '0.75rem', fontWeight: 600 }}>
                            + Add Option
                          </button>
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
                          <CheckCircle2 size={11} style={{ color: '#4ade80', verticalAlign: 'middle', marginRight: '3px' }} />
                          Correct answer: Option {q.correctOptionIndex + 1}
                        </div>
                      </div>
                    ))}
                  </div>

                  <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
                    {loading ? <><span className="spinner" /> Publishing...</> : <><Award size={15} /> Publish Quiz</>}
                  </button>
                </form>
              )}

              {/* Quiz List */}
              {quizzes.length === 0 ? (
                <div className="instructor-empty-state">
                  <FileText size={44} />
                  <p style={{ fontWeight: 600, color: 'var(--text-muted)' }}>No quizzes yet</p>
                  <p>Click "Create New Quiz" to build your first assessment.</p>
                </div>
              ) : (
                <div className="instructor-courses-grid">
                  {quizzes.map((quiz) => (
                    <div key={quiz.id} className="instructor-course-card">
                      <div className="instructor-course-card-header">
                        <span className="instructor-course-card-title">{quiz.title}</span>
                      </div>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                        {quiz.description || 'No description'}
                      </p>
                      <div className="instructor-course-card-meta">
                        <span className="badge badge-info">
                          <HelpCircle size={10} /> {quiz.questions?.length || 0} question{(quiz.questions?.length || 0) !== 1 ? 's' : ''}
                        </span>
                      </div>
                      <button className="btn btn-secondary btn-sm" onClick={() => handleViewSubmissions(quiz)} style={{ alignSelf: 'flex-start', fontSize: '0.78rem' }}>
                        <Eye size={13} /> View Submissions
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Submissions Modal ── */}
      {submissionsModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(15,23,42,0.85)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ width: '100%', maxWidth: '600px', background: '#0f172a', border: '1px solid rgba(99,102,241,0.3)', borderRadius: '16px', padding: '1.75rem', color: '#f8fafc', maxHeight: '80vh', overflow: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Users size={20} color="#818cf8" />
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>Submissions — {submissionsModal.quiz.title}</h3>
              </div>
              <button onClick={() => setSubmissionsModal(null)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            {submissionsModal.attempts.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-dim)' }}>
                <Users size={36} style={{ opacity: 0.4, marginBottom: '8px' }} />
                <p>No submissions received yet for this quiz.</p>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '8px' }}>
                  Note: The backend currently only supports viewing attempts per user. A full submissions endpoint is needed for comprehensive analytics.
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {submissionsModal.attempts.map((att, idx) => (
                  <div key={att.id || idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1rem', background: 'rgba(255,255,255,0.04)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <User size={14} color="var(--text-muted)" />
                      <span style={{ fontSize: '0.85rem' }}>{att.userId || 'Student'}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.82rem' }}>
                      <span style={{ fontWeight: 700, color: att.score >= 70 ? '#4ade80' : att.score >= 40 ? '#fbbf24' : '#f87171' }}>
                        {att.score}% ({att.correctAnswersCount}/{att.totalQuestions})
                      </span>
                      <span style={{ color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={12} /> {att.submittedAt ? new Date(att.submittedAt).toLocaleDateString() : '—'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default InstructorPage;
