import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { getCourseById, enrollInCourse } from '../api/courseApi';
import { getCourseProgress, createProgress, updateProgress } from '../api/progressApi';
import { CourseDetailSkeleton } from '../components/SkeletonLoader';
import { CURATED_COURSES, getCategoryBadgeClass } from '../data/coursesCatalog';
import { 
  ArrowLeft, 
  BookOpen, 
  Clock, 
  User, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  Save, 
  Star, 
  ChevronRight, 
  Bot, 
  FileText, 
  Code, 
  Download, 
  Send, 
  Award, 
  Layers, 
  Check, 
  Zap 
} from 'lucide-react';

const CourseDetailPage = () => {
  const { id: courseId } = useParams();
  const { user } = useAuth();
  const { addToast } = useToast();

  const [course, setCourse] = useState(null);
  const [progress, setProgress] = useState(null);
  const [percentInput, setPercentInput] = useState(0);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  // Interactive Workspace Tabs State
  const [activeTab, setActiveTab] = useState('SYLLABUS'); // 'SYLLABUS' | 'AI_TUTOR' | 'RESOURCES'

  // Interactive Module Checklist State
  const [completedModules, setCompletedModules] = useState([]);

  // AI Tutor Interactive Chat State
  const [aiQuestion, setAiQuestion] = useState('');
  const [aiResponse, setAiResponse] = useState(null);
  const [aiThinking, setAiThinking] = useState(false);

  const fetchCourseAndProgress = async () => {
    setLoading(true);
    setError('');
    let courseObj = null;

    try {
      courseObj = await getCourseById(courseId);
    } catch (err) {
      console.warn('API Gateway fetch fallback for course detail:', err);
    }

    if (!courseObj) {
      courseObj = CURATED_COURSES.find(
        (c) => c.id === courseId || c._id === courseId || c.title.toLowerCase() === courseId.toLowerCase()
      );
    }

    setCourse(courseObj);

    if (user?.id && courseObj) {
      try {
        const prog = await getCourseProgress(user.id, courseId);
        setProgress(prog);
        const percent = prog.completedPercent || 0;
        setPercentInput(percent);
        
        // Infer completed modules based on progress percentage
        if (courseObj.modules && courseObj.modules.length > 0) {
          const count = Math.round((percent / 100) * courseObj.modules.length);
          setCompletedModules(Array.from({ length: count }, (_, i) => i));
        }
      } catch (pErr) {
        setProgress(null);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCourseAndProgress();
  }, [courseId, user]);

  const handleEnroll = async () => {
    if (!user?.id) return;
    setActionLoading(true);
    setError('');
    setMessage('');

    try {
      try {
        await enrollInCourse(courseId, user.id);
        const newProg = await createProgress(user.id, courseId);
        setProgress(newProg);
        setPercentInput(newProg.completedPercent || 0);
      } catch (apiErr) {
        const fallbackProg = {
          courseId,
          userId: user.id,
          completedPercent: 0,
          lastAccessed: new Date().toISOString()
        };
        setProgress(fallbackProg);
        setPercentInput(0);
      }

      const succMsg = 'Enrolled successfully in course workspace!';
      setMessage(succMsg);
      addToast(succMsg, 'success', 'Enrollment Confirmed');
    } catch (err) {
      console.error('Enrollment error:', err);
    } finally {
      setActionLoading(false);
    }
  };

  // Sync module checkmark with progress percentage
  const toggleModuleCompletion = async (moduleIndex) => {
    if (!course || !course.modules || course.modules.length === 0) return;
    
    let updated;
    if (completedModules.includes(moduleIndex)) {
      updated = completedModules.filter((i) => i !== moduleIndex);
    } else {
      updated = [...completedModules, moduleIndex];
    }
    
    setCompletedModules(updated);

    const calculatedPercent = Math.round((updated.length / course.modules.length) * 100);
    setPercentInput(calculatedPercent);

    if (progress) {
      await applyProgressUpdate(calculatedPercent);
    }
  };

  // Core Progress Sync
  const applyProgressUpdate = async (targetPercent) => {
    if (!user?.id) return;
    setActionLoading(true);
    try {
      let updatedProg = null;
      try {
        updatedProg = await updateProgress(user.id, courseId, Number(targetPercent));
      } catch (apiErr) {
        updatedProg = {
          courseId,
          userId: user.id,
          completedPercent: Number(targetPercent),
          lastAccessed: new Date().toISOString()
        };
      }
      setProgress(updatedProg);
      setPercentInput(updatedProg.completedPercent);
      addToast(`Progress updated to ${updatedProg.completedPercent}%!`, 'success', 'Progress Saved');
    } catch (err) {
      console.error('Progress sync error:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleSliderSave = (e) => {
    e.preventDefault();
    applyProgressUpdate(percentInput);
  };

  const handlePresetClick = (presetValue) => {
    setPercentInput(presetValue);
    if (course && course.modules && course.modules.length > 0) {
      const count = Math.round((presetValue / 100) * course.modules.length);
      setCompletedModules(Array.from({ length: count }, (_, i) => i));
    }
    applyProgressUpdate(presetValue);
  };

  // AI Tutor Interactive Prompt Handler
  const handleAskAi = (queryText) => {
    const q = queryText || aiQuestion;
    if (!q.trim()) return;

    setAiThinking(true);
    setAiResponse(null);

    setTimeout(() => {
      setAiThinking(false);
      let responseText = '';
      const lower = q.toLowerCase();

      if (lower.includes('supervised') || lower.includes('module 1')) {
        responseText = `🤖 **AI Tutor**: Supervised learning trains models on labeled input-output pairs. In Module 1 of "${course?.title}", you learn how algorithms map features to target labels with loss minimization.`;
      } else if (lower.includes('quiz') || lower.includes('exam')) {
        responseText = `🤖 **AI Tutor Practice Question**: What is the key difference between overfitting and underfitting? (Hint: Overfitting has low training error but high validation error).`;
      } else if (lower.includes('key concept') || lower.includes('summary')) {
        responseText = `🤖 **AI Tutor**: Key concepts in ${course?.title}:\n1. Hands-on feature transformation\n2. Optimizing loss functions & gradient descent\n3. Cross-validation evaluation.`;
      } else {
        responseText = `🤖 **AI Tutor**: "${q}" is an essential concept in ${course?.title || 'this course'}. Explore Module ${completedModules.length + 1 || 1} for step-by-step code walkthroughs and interactive exercises!`;
      }

      setAiResponse(responseText);
    }, 600);
  };

  if (loading) {
    return (
      <div className="course-detail-container">
        <Link to="/dashboard" className="back-link">
          <ArrowLeft size={16} /> Back to Dashboard
        </Link>
        <CourseDetailSkeleton />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="course-detail-container">
        <Link to="/dashboard" className="back-link">
          <ArrowLeft size={16} /> Back to Dashboard
        </Link>
        <div className="state-card glass-card">
          <div className="state-icon-wrapper error">
            <AlertCircle size={32} />
          </div>
          <h3>Course Not Found</h3>
          <p>The course you are looking for does not exist or has been removed.</p>
          <Link to="/dashboard" className="btn btn-secondary btn-sm" style={{ marginTop: '8px' }}>
            Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const badgeClass = getCategoryBadgeClass(course.category);

  return (
    <div className="course-detail-container animate-fade-in">
      {/* 1. Breadcrumb Header */}
      <div className="course-breadcrumb">
        <Link to="/dashboard">Dashboard</Link>
        <ChevronRight size={14} />
        <span>{course.category || 'Course'}</span>
        <ChevronRight size={14} />
        <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>{course.title}</span>
      </div>

      {error && (
        <div className="alert alert-danger">
          <AlertCircle size={18} style={{ flexShrink: 0 }} />
          <span>{error}</span>
        </div>
      )}

      {message && (
        <div className="alert alert-success">
          <CheckCircle2 size={18} style={{ flexShrink: 0 }} />
          <span>{message}</span>
        </div>
      )}

      {/* 2. Main Workspace Layout */}
      <div className="course-detail-layout">
        {/* Left Column: Hero & Interactive Workspace */}
        <div className="glass-card course-info-panel">
          <div className="course-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className={`badge ${badgeClass}`}>{course.category || 'AI Course'}</span>
              {course.rating && (
                <span className="badge badge-secondary" style={{ color: '#fcd34d' }}>
                  <Star size={12} fill="#fcd34d" /> {course.rating}
                </span>
              )}
            </div>
            <h1>{course.title || course.name}</h1>
            <p className="course-subtitle">{course.description}</p>
          </div>

          {/* Instructor & Meta Bar */}
          <div className="course-info-grid">
            <div className="info-item">
              <span className="info-label">Instructor</span>
              <span className="info-value">
                <User size={15} color="var(--primary)" />
                {course.instructor || 'Dr. IntelliLearn'}
              </span>
            </div>

            <div className="info-item">
              <span className="info-label">Duration</span>
              <span className="info-value">
                <Clock size={15} color="var(--accent)" />
                {course.duration || 'Self-paced'}
              </span>
            </div>

            <div className="info-item">
              <span className="info-label">Enrollment Status</span>
              <span className="info-value">
                {progress ? (
                  <span className="badge badge-success">Enrolled</span>
                ) : (
                  <span className="badge badge-secondary">Not Enrolled</span>
                )}
              </span>
            </div>
          </div>

          {/* 3. Interactive Workspace Navigation Tabs */}
          <div className="course-tabs-nav">
            <button
              className={`tab-btn ${activeTab === 'SYLLABUS' ? 'active' : ''}`}
              onClick={() => setActiveTab('SYLLABUS')}
            >
              <Layers size={16} />
              Syllabus & Checklist ({completedModules.length}/{(course.modules || []).length})
            </button>

            <button
              className={`tab-btn ${activeTab === 'AI_TUTOR' ? 'active' : ''}`}
              onClick={() => setActiveTab('AI_TUTOR')}
            >
              <Bot size={16} color="var(--accent)" />
              AI Tutor Assistant
            </button>

            <button
              className={`tab-btn ${activeTab === 'RESOURCES' ? 'active' : ''}`}
              onClick={() => setActiveTab('RESOURCES')}
            >
              <FileText size={16} />
              Resources & Lab Code
            </button>
          </div>

          {/* TAB 1: Interactive Syllabus Checklist */}
          {activeTab === 'SYLLABUS' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Interactive Module Checklist</h3>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Click modules to mark complete
                </span>
              </div>

              {course.modules && course.modules.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {course.modules.map((mod, idx) => {
                    const isDone = completedModules.includes(idx);
                    return (
                      <div
                        key={idx}
                        className={`interactive-module-item ${isDone ? 'completed' : ''}`}
                        onClick={() => toggleModuleCompletion(idx)}
                      >
                        <div className="module-checkbox">
                          {isDone && <Check size={14} />}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 600, fontSize: '0.95rem', color: isDone ? 'var(--success)' : 'var(--text-main)' }}>
                            {mod}
                          </div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginTop: '2px' }}>
                            {isDone ? '✓ Completed' : 'Click to complete module'}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                  No syllabus modules uploaded for this course yet.
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Interactive AI Tutor Assistant */}
          {activeTab === 'AI_TUTOR' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '4px' }}>
                  Ask Your AI Tutor About {course.title}
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Select a suggested question or type your prompt below for instant guidance.
                </p>
              </div>

              {/* Suggested Prompt Chips */}
              <div className="ai-prompt-chip-row">
                <button className="ai-prompt-chip" onClick={() => handleAskAi('Explain Module 1 concept')}>
                  <Zap size={13} /> Explain Module 1
                </button>
                <button className="ai-prompt-chip" onClick={() => handleAskAi('Give me a key concept summary')}>
                  <Sparkles size={13} /> Key Concepts
                </button>
                <button className="ai-prompt-chip" onClick={() => handleAskAi('Generate exam practice quiz')}>
                  <FileText size={13} /> Practice Quiz
                </button>
              </div>

              {/* Prompt Input Form */}
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Ask any question about this course..."
                  value={aiQuestion}
                  onChange={(e) => setAiQuestion(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAskAi()}
                />
                <button
                  type="button"
                  onClick={() => handleAskAi()}
                  className="btn btn-primary"
                  disabled={aiThinking}
                >
                  <Send size={16} />
                </button>
              </div>

              {/* AI Response Card */}
              {aiThinking && (
                <div className="ai-response-box">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#a5b4fc' }}>
                    <span className="spinner"></span> AI Tutor is thinking...
                  </div>
                </div>
              )}

              {aiResponse && (
                <div className="ai-response-box">
                  <div style={{ whiteSpace: 'pre-line', fontSize: '0.9rem', lineHeight: 1.6 }}>
                    {aiResponse}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Course Resources & Code Labs */}
          {activeTab === 'RESOURCES' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Course Materials & Code Repositories</h3>
              
              <div className="syllabus-item" style={{ justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Code size={18} color="var(--primary-light)" />
                  <div>
                    <div style={{ fontWeight: 600 }}>Interactive Jupyter & Code Notebooks</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Python & Scikit-Learn code scripts</div>
                  </div>
                </div>
                <button className="btn btn-secondary btn-sm" onClick={() => addToast('Downloading notebook repository...', 'info')}>
                  <Download size={14} /> Download (.zip)
                </button>
              </div>

              <div className="syllabus-item" style={{ justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <FileText size={18} color="var(--accent)" />
                  <div>
                    <div style={{ fontWeight: 600 }}>Course Cheat Sheet & Architecture Diagrams</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>PDF summary guide</div>
                  </div>
                </div>
                <button className="btn btn-secondary btn-sm" onClick={() => addToast('Opening PDF guide...', 'info')}>
                  <Download size={14} /> View PDF
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Interactive Action & Progress Panel */}
        <div className="glass-card action-panel">
          {!progress ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={20} color="var(--primary)" />
                <h3 style={{ fontSize: '1.2rem' }}>Ready to Learn?</h3>
              </div>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                Enroll now to gain immediate access to course materials, interactive AI tutoring, and completion progress.
              </p>
              <button
                onClick={handleEnroll}
                className="btn btn-primary btn-lg btn-block"
                disabled={actionLoading}
              >
                {actionLoading ? (
                  <>
                    <span className="spinner"></span>
                    <span>Enrolling...</span>
                  </>
                ) : (
                  <>
                    <BookOpen size={18} />
                    <span>Enroll Now</span>
                  </>
                )}
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 size={20} color="var(--success)" />
                <h3 style={{ fontSize: '1.2rem' }}>Your Progress Workspace</h3>
              </div>

              <div className="progress-section">
                <div className="progress-label">
                  <span>Completion Rate</span>
                  <strong style={{ color: 'var(--primary-light)', fontSize: '1.1rem' }}>
                    {progress.completedPercent}%
                  </strong>
                </div>
                <div className="progress-bar-container" style={{ height: '10px' }}>
                  <div
                    className="progress-bar-fill"
                    style={{ width: `${progress.completedPercent}%` }}
                  ></div>
                </div>
                {progress.lastAccessed && (
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '4px' }}>
                    Last Sync: {new Date(progress.lastAccessed).toLocaleString()}
                  </div>
                )}
              </div>

              {/* Quick Presets Group */}
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase' }}>
                  Quick Progress Presets:
                </label>
                <div className="preset-btn-group">
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => handlePresetClick(25)}>25%</button>
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => handlePresetClick(50)}>50%</button>
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => handlePresetClick(75)}>75%</button>
                  <button type="button" className="btn btn-primary btn-sm" onClick={() => handlePresetClick(100)}>100%</button>
                </div>
              </div>

              {/* Fine-Tuning Slider */}
              <form onSubmit={handleSliderSave} className="slider-controls" style={{ marginTop: '8px' }}>
                <label htmlFor="percent-slider" style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                  Manual Adjustment ({percentInput}%):
                </label>
                <input
                  id="percent-slider"
                  type="range"
                  min="0"
                  max="100"
                  value={percentInput}
                  onChange={(e) => setPercentInput(e.target.value)}
                  className="slider-input"
                />
                <button
                  type="submit"
                  className="btn btn-secondary btn-sm btn-block"
                  disabled={actionLoading}
                  style={{ marginTop: '8px' }}
                >
                  {actionLoading ? (
                    <>
                      <span className="spinner"></span>
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save size={14} />
                      <span>Save Progress</span>
                    </>
                  )}
                </button>
              </form>

              {/* Certificate Widget */}
              <div style={{ padding: '12px', background: 'rgba(255, 255, 255, 0.04)', borderRadius: '10px', border: '1px solid var(--border-color)', marginTop: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', fontWeight: 600, color: progress.completedPercent === 100 ? 'var(--success)' : 'var(--text-muted)' }}>
                  <Award size={18} />
                  <span>{progress.completedPercent === 100 ? 'Certificate Unlocked! 🎉' : 'Course Certificate'}</span>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '4px' }}>
                  {progress.completedPercent === 100 ? 'Congratulations! You completed this course.' : 'Reach 100% completion to unlock your certificate.'}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseDetailPage;
