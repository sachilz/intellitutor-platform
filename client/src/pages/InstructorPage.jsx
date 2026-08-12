import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { createCourse, getCourses, deleteCourse } from '../api/courseApi';
import { createQuiz, getQuizzes, getQuizAttempts } from '../api/quizApi';
import LogoIcon from '../components/LogoIcon';
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
  GraduationCap,
  TrendingUp,
  Activity,
  Settings,
  ChevronRight,
  Search,
  Filter,
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
      const attempts = await getQuizAttempts(quiz.id, 'student1@intellilearn.com').catch(() => []);
      setSubmissionsModal({ quiz, attempts: Array.isArray(attempts) ? attempts : [] });
    } catch {
      setSubmissionsModal({ quiz, attempts: [] });
    }
  };

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return 'Good Morning';
    if (h < 17) return 'Good Afternoon';
    return 'Good Evening';
  })();

  // ─── RENDER ─────────────────────────────────────────────────────
  return (
    <div className="ins-dashboard">
      {/* ── Collapsible Sidebar ── */}
      <aside className="ins-sidebar">
        <div className="ins-sidebar-top">
          <div className="ins-sidebar-brand">
            <LogoIcon size={32} />
            <span className="ins-sidebar-brand-text">IntelliLearn</span>
          </div>

          <nav className="ins-sidebar-nav">
            <button
              className={`ins-nav-item ${activeTab === 'COURSES' ? 'active' : ''}`}
              onClick={() => switchTab('COURSES')}
            >
              <BookOpen size={18} />
              <span>My Courses</span>
              <span className="ins-nav-count">{courses.length}</span>
            </button>
            <button
              className={`ins-nav-item ${activeTab === 'QUIZZES' ? 'active' : ''}`}
              onClick={() => switchTab('QUIZZES')}
            >
              <FileText size={18} />
              <span>Quizzes</span>
              <span className="ins-nav-count">{quizzes.length}</span>
            </button>
          </nav>
        </div>

        <div className="ins-sidebar-bottom">
          <div className="ins-sidebar-footer">
            <div className="ins-sidebar-user">
              <div className="ins-sidebar-avatar">
                {(user?.username || 'I')[0].toUpperCase()}
              </div>
              <div className="ins-sidebar-user-info">
                <span className="ins-sidebar-user-name">{user?.username || 'Instructor'}</span>
                <span className="ins-sidebar-user-role">Instructor</span>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <main className="ins-main">
        {/* Top Header Bar */}
        <header className="ins-header">
          <div className="ins-header-left">
            <div>
              <h1 className="ins-header-greeting">{greeting}, {user?.username || 'Instructor'} ✨</h1>
              <p className="ins-header-subtitle">Manage your courses, create assessments, and track student performance.</p>
            </div>
          </div>
          <div className="ins-header-right">
            <button
              className="ins-create-btn"
              onClick={() => {
                if (activeTab === 'COURSES') setShowCourseForm(!showCourseForm);
                else setShowQuizForm(!showQuizForm);
              }}
            >
              <Plus size={18} />
              {activeTab === 'COURSES'
                ? (showCourseForm ? 'Cancel' : 'New Course')
                : (showQuizForm ? 'Cancel' : 'New Quiz')
              }
            </button>
          </div>
        </header>

        {/* Stat Overview Cards */}
        <div className="ins-stats-row">
          <div className="ins-stat-tile">
            <div className="ins-stat-tile-icon ins-stat-tile-icon--indigo">
              <BookOpen size={22} />
            </div>
            <div className="ins-stat-tile-body">
              <span className="ins-stat-tile-value">{courses.length}</span>
              <span className="ins-stat-tile-label">Total Courses</span>
            </div>
            <div className="ins-stat-tile-trend ins-stat-tile-trend--up">
              <TrendingUp size={14} /> Active
            </div>
          </div>

          <div className="ins-stat-tile">
            <div className="ins-stat-tile-icon ins-stat-tile-icon--cyan">
              <FileText size={22} />
            </div>
            <div className="ins-stat-tile-body">
              <span className="ins-stat-tile-value">{quizzes.length}</span>
              <span className="ins-stat-tile-label">Published Quizzes</span>
            </div>
            <div className="ins-stat-tile-trend ins-stat-tile-trend--up">
              <Activity size={14} /> Live
            </div>
          </div>

          <div className="ins-stat-tile">
            <div className="ins-stat-tile-icon ins-stat-tile-icon--emerald">
              <Users size={22} />
            </div>
            <div className="ins-stat-tile-body">
              <span className="ins-stat-tile-value">—</span>
              <span className="ins-stat-tile-label">Total Students</span>
            </div>
            <div className="ins-stat-tile-trend ins-stat-tile-trend--neutral">
              <BarChart3 size={14} /> N/A
            </div>
          </div>

          <div className="ins-stat-tile">
            <div className="ins-stat-tile-icon ins-stat-tile-icon--violet">
              <Award size={22} />
            </div>
            <div className="ins-stat-tile-body">
              <span className="ins-stat-tile-value">Active</span>
              <span className="ins-stat-tile-label">Account Status</span>
            </div>
            <div className="ins-stat-tile-trend ins-stat-tile-trend--up">
              <CheckCircle2 size={14} /> Verified
            </div>
          </div>
        </div>

        {/* Tab Indicator Bar */}
        <div className="ins-tab-bar">
          <button
            className={`ins-tab ${activeTab === 'COURSES' ? 'ins-tab--active' : ''}`}
            onClick={() => switchTab('COURSES')}
          >
            <BookOpen size={16} /> My Courses
          </button>
          <button
            className={`ins-tab ${activeTab === 'QUIZZES' ? 'ins-tab--active' : ''}`}
            onClick={() => switchTab('QUIZZES')}
          >
            <FileText size={16} /> Quizzes
          </button>
        </div>

        {/* ════════════ TAB: MY COURSES ════════════ */}
        {activeTab === 'COURSES' && (
          <div className="ins-content-area">
            {/* Create Course Form */}
            {showCourseForm && (
              <form onSubmit={handleCreateCourse} className="ins-form-card">
                <div className="ins-form-card-header">
                  <GraduationCap size={20} />
                  <h3>Publish a New Course</h3>
                </div>
                <div className="ins-form-grid">
                  <div className="form-group ins-form-span-2">
                    <label><span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><BookOpen size={12} /> Course Title</span></label>
                    <input type="text" className="form-control" required value={courseForm.title} onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })} placeholder="e.g. Microservices Architecture" />
                  </div>
                  <div className="form-group ins-form-span-2">
                    <label><span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><FileText size={12} /> Description</span></label>
                    <textarea className="form-control" rows={3} required value={courseForm.description} onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })} placeholder="Course description..." style={{ resize: 'vertical' }} />
                  </div>
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
                <button type="submit" className="ins-form-submit" disabled={loading}>
                  {loading ? <><span className="spinner" /> Publishing...</> : <><BookOpen size={16} /> Publish Course</>}
                </button>
              </form>
            )}

            {/* Course Grid */}
            {coursesLoading ? (
              <div className="ins-empty-state"><span className="spinner" /><p>Loading courses...</p></div>
            ) : courses.length === 0 ? (
              <div className="ins-empty-state">
                <div className="ins-empty-icon">
                  <Package size={48} />
                </div>
                <h3>No courses published yet</h3>
                <p>Click "New Course" to create and publish your first course.</p>
              </div>
            ) : (
              <div className="ins-grid">
                {courses.map((course) => {
                  const courseQuizzes = getQuizzesForCourse(course._id || course.id);
                  return (
                    <div key={course._id || course.id} className="ins-card">
                      <div className="ins-card-accent ins-card-accent--indigo" />
                      <div className="ins-card-body">
                        <div className="ins-card-top">
                          <span className="ins-card-badge"><Tag size={10} /> {course.category || 'General'}</span>
                        </div>
                        <h4 className="ins-card-title">{course.title}</h4>
                        <p className="ins-card-desc">{course.description}</p>
                        <div className="ins-card-footer">
                          <div className="ins-card-meta">
                            <span className="ins-card-meta-item"><FileText size={12} /> {courseQuizzes.length} quiz{courseQuizzes.length !== 1 ? 'zes' : ''}</span>
                          </div>
                          <button className="ins-card-delete" onClick={() => handleDeleteCourse(course._id || course.id, course.title)}>
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ════════════ TAB: QUIZZES ════════════ */}
        {activeTab === 'QUIZZES' && (
          <div className="ins-content-area">
            {/* Create Quiz Form */}
            {showQuizForm && (
              <form onSubmit={handleCreateQuiz} className="ins-form-card">
                <div className="ins-form-card-header">
                  <Award size={20} />
                  <h3>Create a New Quiz</h3>
                </div>
                <div className="ins-form-grid">
                  <div className="form-group ins-form-span-2">
                    <label><span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><Award size={12} /> Quiz Title</span></label>
                    <input type="text" className="form-control" required value={quizTitle} onChange={(e) => setQuizTitle(e.target.value)} placeholder="e.g. Java Fundamentals Assessment" />
                  </div>
                  <div className="form-group ins-form-span-2">
                    <label><span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><FileText size={12} /> Description</span></label>
                    <input type="text" className="form-control" value={quizDescription} onChange={(e) => setQuizDescription(e.target.value)} placeholder="Brief description (optional)" />
                  </div>
                </div>

                {/* Dynamic Questions */}
                <div className="ins-questions-section">
                  <div className="ins-questions-header">
                    <label className="ins-questions-label">
                      <HelpCircle size={14} /> Questions ({quizQuestions.length})
                    </label>
                    <button type="button" className="btn btn-secondary btn-sm" onClick={addQuestion}>
                      <Plus size={13} /> Add Question
                    </button>
                  </div>

                  {quizQuestions.map((q, qIdx) => (
                    <div key={qIdx} className="ins-question-block">
                      <div className="ins-question-block-header">
                        <span className="ins-question-number">Q{qIdx + 1}</span>
                        {quizQuestions.length > 1 && (
                          <button type="button" onClick={() => removeQuestion(qIdx)} className="ins-question-remove" title="Remove question">
                            <MinusCircle size={16} />
                          </button>
                        )}
                      </div>
                      <input type="text" className="form-control" required value={q.text} onChange={(e) => updateQuestion(qIdx, 'text', e.target.value)} placeholder="Enter question text" />

                      <div className="ins-options-list">
                        {q.options.map((opt, optIdx) => (
                          <div key={optIdx} className="ins-option-row">
                            <input
                              type="radio"
                              name={`correct_${qIdx}`}
                              checked={q.correctOptionIndex === optIdx}
                              onChange={() => updateQuestion(qIdx, 'correctOptionIndex', optIdx)}
                              title="Mark as correct answer"
                              className="ins-radio"
                            />
                            <input type="text" className="form-control" required value={opt} onChange={(e) => updateOption(qIdx, optIdx, e.target.value)} placeholder={`Option ${optIdx + 1}`} />
                            {q.options.length > 2 && (
                              <button type="button" onClick={() => removeOption(qIdx, optIdx)} className="ins-option-remove" title="Remove option">
                                <X size={14} />
                              </button>
                            )}
                          </div>
                        ))}
                        <button type="button" onClick={() => addOption(qIdx)} className="ins-add-option-btn">
                          + Add Option
                        </button>
                      </div>
                      <div className="ins-correct-indicator">
                        <CheckCircle2 size={12} /> Correct: Option {q.correctOptionIndex + 1}
                      </div>
                    </div>
                  ))}
                </div>

                <button type="submit" className="ins-form-submit" disabled={loading}>
                  {loading ? <><span className="spinner" /> Publishing...</> : <><Award size={16} /> Publish Quiz</>}
                </button>
              </form>
            )}

            {/* Quiz Grid */}
            {quizzes.length === 0 ? (
              <div className="ins-empty-state">
                <div className="ins-empty-icon">
                  <FileText size={48} />
                </div>
                <h3>No quizzes yet</h3>
                <p>Click "New Quiz" to build your first assessment.</p>
              </div>
            ) : (
              <div className="ins-grid">
                {quizzes.map((quiz) => (
                  <div key={quiz.id} className="ins-card">
                    <div className="ins-card-accent ins-card-accent--cyan" />
                    <div className="ins-card-body">
                      <div className="ins-card-top">
                        <span className="ins-card-badge ins-card-badge--cyan"><HelpCircle size={10} /> {quiz.questions?.length || 0} question{(quiz.questions?.length || 0) !== 1 ? 's' : ''}</span>
                      </div>
                      <h4 className="ins-card-title">{quiz.title}</h4>
                      <p className="ins-card-desc">{quiz.description || 'No description'}</p>
                      <div className="ins-card-footer">
                        <button className="ins-view-submissions-btn" onClick={() => handleViewSubmissions(quiz)}>
                          <Eye size={14} /> Submissions
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* ── Submissions Modal ── */}
      {submissionsModal && (
        <div className="ins-modal-overlay" onClick={() => setSubmissionsModal(null)}>
          <div className="ins-modal" onClick={(e) => e.stopPropagation()}>
            <div className="ins-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div className="ins-modal-icon"><Users size={20} /></div>
                <div>
                  <h3>Submissions</h3>
                  <p className="ins-modal-subtitle">{submissionsModal.quiz.title}</p>
                </div>
              </div>
              <button onClick={() => setSubmissionsModal(null)} className="ins-modal-close">
                <X size={20} />
              </button>
            </div>

            <div className="ins-modal-body">
              {submissionsModal.attempts.length === 0 ? (
                <div className="ins-empty-state" style={{ padding: '2.5rem 1rem' }}>
                  <Users size={40} style={{ opacity: 0.3 }} />
                  <p>No submissions received yet for this quiz.</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '6px' }}>
                    Note: The backend currently only supports viewing attempts per user.
                  </p>
                </div>
              ) : (
                <div className="ins-submissions-list">
                  {submissionsModal.attempts.map((att, idx) => (
                    <div key={att.id || idx} className="ins-submission-row">
                      <div className="ins-submission-user">
                        <User size={14} />
                        <span>{att.userId || 'Student'}</span>
                      </div>
                      <div className="ins-submission-score">
                        <span className={`ins-score-pill ${att.score >= 70 ? 'ins-score-pill--good' : att.score >= 40 ? 'ins-score-pill--warn' : 'ins-score-pill--bad'}`}>
                          {att.score}% ({att.correctAnswersCount}/{att.totalQuestions})
                        </span>
                        <span className="ins-submission-date">
                          <Clock size={12} /> {att.submittedAt ? new Date(att.submittedAt).toLocaleDateString() : '—'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InstructorPage;
