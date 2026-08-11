import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { getCourseById, enrollInCourse } from '../api/courseApi';
import { getCourseProgress, createProgress, updateProgress } from '../api/progressApi';
import { askTutor } from '../api/tutorApi';
import QuizComponent from '../components/QuizComponent';
import { CourseDetailSkeleton } from '../components/SkeletonLoader';
import { CURATED_COURSES, getCategoryBadgeClass } from '../data/coursesCatalog';
import { getStoredProgressMap, setStoredCourseProgress, removeStoredCourseProgress } from '../utils/progressStorage';
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
  Zap,
  ExternalLink,
  Users,
  Globe,
  Trash2,
  Target,
  PlayCircle,
  GraduationCap,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  Shield,
  BarChart3,
  Lock
} from 'lucide-react';

// Category color mapping
const getCategoryColors = (category) => {
  const map = {
    'GenAI': { accent: '#a855f7', gradient: 'linear-gradient(135deg, #7c3aed, #a855f7, #c084fc)', bg: 'rgba(168,85,247,0.08)' },
    'AI & ML': { accent: '#6366f1', gradient: 'linear-gradient(135deg, #4338ca, #6366f1, #818cf8)', bg: 'rgba(99,102,241,0.08)' },
    'Web Dev': { accent: '#22c55e', gradient: 'linear-gradient(135deg, #16a34a, #22c55e, #4ade80)', bg: 'rgba(34,197,94,0.08)' },
    'DevOps & Cloud': { accent: '#f59e0b', gradient: 'linear-gradient(135deg, #d97706, #f59e0b, #fbbf24)', bg: 'rgba(245,158,11,0.08)' },
    'Data Science': { accent: '#06b6d4', gradient: 'linear-gradient(135deg, #0891b2, #06b6d4, #22d3ee)', bg: 'rgba(6,182,212,0.08)' },
    'Security': { accent: '#ef4444', gradient: 'linear-gradient(135deg, #dc2626, #ef4444, #f87171)', bg: 'rgba(239,68,68,0.08)' },
  };
  return map[category] || map['AI & ML'];
};

const CourseDetailPage = () => {
  const { id: courseId } = useParams();
  const navigate = useNavigate();
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
  const [activeTab, setActiveTab] = useState('OVERVIEW');

  // Interactive Module Checklist State
  const [completedModules, setCompletedModules] = useState([]);
  const [expandedModule, setExpandedModule] = useState(null);

  // AI Tutor Interactive Chat State
  const [aiQuestion, setAiQuestion] = useState('');
  const [aiMessages, setAiMessages] = useState([]);
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

    if (courseObj) {
      const localMap = getStoredProgressMap();
      const localPercent = localMap[courseId];
      if (localPercent !== undefined) {
        const localProg = {
          courseId,
          userId: user?.id || 'user',
          completedPercent: Number(localPercent),
          lastAccessed: new Date().toISOString()
        };
        setProgress(localProg);
        setPercentInput(Number(localPercent));
        if (courseObj.modules && courseObj.modules.length > 0) {
          const count = Math.round((Number(localPercent) / 100) * courseObj.modules.length);
          setCompletedModules(Array.from({ length: count }, (_, i) => i));
        }
      }

      if (user?.id) {
        try {
          const prog = await getCourseProgress(user.id, courseId);
          if (prog && prog.completedPercent !== undefined) {
            setProgress(prog);
            const percent = prog.completedPercent || 0;
            setPercentInput(percent);
            setStoredCourseProgress(courseId, percent);
            if (courseObj.modules && courseObj.modules.length > 0) {
              const count = Math.round((percent / 100) * courseObj.modules.length);
              setCompletedModules(Array.from({ length: count }, (_, i) => i));
            }
          }
        } catch (pErr) {
          console.warn('API progress fetch warning:', pErr);
        }
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCourseAndProgress();
  }, [courseId, user]);

  const handleEnroll = async () => {
    setActionLoading(true);
    setError('');
    setMessage('');

    try {
      if (user?.id) {
        try {
          await enrollInCourse(courseId, user.id);
          await createProgress(user.id, courseId);
        } catch (apiErr) {
          console.warn('API Gateway enrollment fallback:', apiErr);
        }
      }

      const newProg = {
        courseId,
        userId: user?.id || 'user',
        completedPercent: 0,
        lastAccessed: new Date().toISOString()
      };
      setProgress(newProg);
      setPercentInput(0);
      setStoredCourseProgress(courseId, 0);

      const succMsg = 'Enrolled successfully! Welcome to the course 🎉';
      setMessage(succMsg);
      addToast(succMsg, 'success', 'Enrollment Confirmed');
    } catch (err) {
      console.error('Enrollment error:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleUnenroll = async () => {
    if (!courseId) return;
    setActionLoading(true);
    try {
      removeStoredCourseProgress(courseId);
      setProgress(null);
      setPercentInput(0);
      setCompletedModules([]);
      const msgText = `Unenrolled from "${course?.title || 'course'}"`;
      setMessage(msgText);
      addToast(msgText, 'info', 'Course Unenrolled');
    } catch (err) {
      console.error('Unenrollment error:', err);
    } finally {
      setActionLoading(false);
    }
  };

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
    await applyProgressUpdate(calculatedPercent);
  };

  const applyProgressUpdate = async (targetPercent) => {
    setActionLoading(true);
    const numPercent = Number(targetPercent) || 0;
    try {
      if (user?.id) {
        try {
          await updateProgress(user.id, courseId, numPercent);
        } catch (apiErr) {
          console.warn('API progress sync warning:', apiErr);
        }
      }
      const updatedProg = {
        courseId,
        userId: user?.id || 'user',
        completedPercent: numPercent,
        lastAccessed: new Date().toISOString()
      };
      setProgress(updatedProg);
      setPercentInput(numPercent);
      setStoredCourseProgress(courseId, numPercent);
      addToast(`Progress updated to ${numPercent}%!`, 'success', 'Progress Saved');
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

  // AI Tutor Interactive Prompt Handler (RAG API Integration)
  const handleAskAi = async (queryText) => {
    const q = queryText || aiQuestion;
    if (!q.trim()) return;

    setAiMessages(prev => [...prev, { sender: 'user', text: q }]);
    setAiQuestion('');
    setAiThinking(true);

    try {
      const targetCourseId = course?.id || id || 'java-101';
      const userId = user?.email || user?.username || 'student1@intellilearn.com';
      const res = await askTutor(targetCourseId, q, userId);

      let formattedAnswer = res.answer;
      if (res.sources && res.sources.length > 0) {
        formattedAnswer += `\n\n📌 Sources: ${res.sources.join(', ')}`;
      }
      setAiMessages(prev => [...prev, {
        sender: 'ai',
        text: formattedAnswer,
        grounded: res.grounded,
        sources: res.sources
      }]);
    } catch (err) {
      console.warn('Backend RAG API offline, using fallback:', err);
      setAiMessages(prev => [...prev, {
        sender: 'ai',
        text: `Regarding "${course?.title || 'this course'}": ${q} is an important concept. Try asking about polymorphism, Spring Boot, or microservices architecture!`,
        grounded: false
      }]);
    } finally {
      setAiThinking(false);
    }
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

  const colors = getCategoryColors(course.category);
  const isEnrolled = progress !== null;
  const progressPercent = progress?.completedPercent || 0;

  // SVG circular progress values
  const circleRadius = 54;
  const circumference = 2 * Math.PI * circleRadius;
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

  const tabs = [
    { id: 'OVERVIEW', label: 'Overview', icon: BookOpen },
    { id: 'SYLLABUS', label: 'Curriculum', icon: Layers, count: `${completedModules.length}/${(course.modules || []).length}` },
    { id: 'QUIZZES', label: 'Quizzes & Practice', icon: Award },
    { id: 'AI_TUTOR', label: 'AI Tutor', icon: Bot },
    { id: 'RESOURCES', label: 'Resources', icon: FileText },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#0a0e1a', overflowX: 'hidden', margin: '-1.5rem -2rem', padding: 0 }}>
      {/* Inline styles for this page */}
      <style>{`
        @keyframes cdpFadeIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes cdpSlideRight { from { opacity: 0; transform: translateX(-16px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes cdpPulse { 0%, 100% { opacity: 0.6; } 50% { opacity: 1; } }
        @keyframes cdpProgressFill { from { stroke-dashoffset: ${circumference}; } }
        @keyframes cdpFloat1 { 0%, 100% { transform: translate(0,0) scale(1); } 50% { transform: translate(-20px, 15px) scale(1.1); } }
        .cdp-main-grid { display: grid; grid-template-columns: 1fr 320px; gap: 20px; max-width: 1140px; margin: 0 auto; padding: 0 20px 60px; margin-top: 8px; }
        @media (max-width: 900px) { .cdp-main-grid { grid-template-columns: 1fr; } }
        @keyframes cdpFloat2 { 0%, 100% { transform: translate(0,0) scale(1); } 50% { transform: translate(15px, -10px) scale(0.95); } }
      `}</style>

      {/* HERO BANNER */}
      <div style={{
        position: 'relative', overflow: 'hidden',
        padding: '32px 0 40px',
        background: `linear-gradient(180deg, ${colors.bg} 0%, transparent 100%)`,
      }}>
        {/* Floating orbs */}
        <div style={{ position: 'absolute', top: '-30%', right: '5%', width: '300px', height: '300px', borderRadius: '50%', background: `radial-gradient(circle, ${colors.accent}12 0%, transparent 70%)`, animation: 'cdpFloat1 12s ease-in-out infinite', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-20%', left: '10%', width: '250px', height: '250px', borderRadius: '50%', background: `radial-gradient(circle, ${colors.accent}08 0%, transparent 70%)`, animation: 'cdpFloat2 15s ease-in-out infinite', pointerEvents: 'none' }} />

        <div style={{ maxWidth: '1140px', margin: '0 auto', padding: '0 20px', position: 'relative', zIndex: 1 }}>
          {/* Breadcrumb */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', color: '#64748b', marginBottom: '20px', animation: 'cdpFadeIn 0.3s ease' }}>
            <Link to="/dashboard" style={{ color: '#818cf8', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <ArrowLeft size={14} /> Dashboard
            </Link>
            <ChevronRight size={12} />
            <span>{course.category}</span>
            <ChevronRight size={12} />
            <span style={{ color: '#94a3b8' }}>{course.title}</span>
          </div>

          {/* Badges row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', flexWrap: 'wrap', animation: 'cdpFadeIn 0.4s ease' }}>
            <span className={`badge ${getCategoryBadgeClass(course.category)}`}>{course.category}</span>
            <span style={{
              fontSize: '0.72rem', fontWeight: 700, padding: '3px 10px', borderRadius: '6px',
              background: course.platform === 'Coursera' ? 'rgba(59,130,246,0.12)' : course.platform === 'edX' ? 'rgba(239,68,68,0.12)' : 'rgba(168,85,247,0.12)',
              color: course.platform === 'Coursera' ? '#60a5fa' : course.platform === 'edX' ? '#fca5a5' : '#c084fc',
              border: `1px solid ${course.platform === 'Coursera' ? 'rgba(59,130,246,0.25)' : course.platform === 'edX' ? 'rgba(239,68,68,0.25)' : 'rgba(168,85,247,0.25)'}`,
            }}>
              {course.platform}
            </span>
            {course.level && (
              <span style={{ fontSize: '0.72rem', fontWeight: 600, padding: '3px 10px', borderRadius: '6px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#94a3b8' }}>
                {course.level}
              </span>
            )}
            {course.rating && (
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#fbbf24', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Star size={13} fill="#fbbf24" color="#fbbf24" /> {course.rating.replace(' ⭐', '')}
                {course.ratingCount && <span style={{ color: '#64748b', fontWeight: 500, fontSize: '0.72rem' }}>({course.ratingCount} reviews)</span>}
              </span>
            )}
            {isEnrolled && (
              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#4ade80', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)', borderRadius: '6px', padding: '3px 10px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <CheckCircle2 size={11} /> Enrolled
              </span>
            )}
          </div>

          {/* Title + description */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '24px', flexWrap: 'wrap', animation: 'cdpFadeIn 0.5s ease' }}>
            <div style={{ flex: 1, minWidth: '300px' }}>
              <h1 style={{ fontSize: '2rem', fontWeight: 900, color: '#f1f5f9', margin: '0 0 12px 0', lineHeight: 1.2 }}>
                {course.title}
              </h1>
              <p style={{ fontSize: '0.95rem', color: '#64748b', margin: '0 0 16px 0', lineHeight: 1.6, maxWidth: '640px' }}>
                {course.description}
              </p>
              {course.provider && (
                <span style={{ fontSize: '0.78rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <Globe size={13} color={colors.accent} /> Offered by <strong style={{ color: '#e2e8f0' }}>{course.provider}</strong>
                </span>
              )}
            </div>

            {(course.courseUrl || course.udemyUrl) && (
              <a
                href={course.courseUrl || course.udemyUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  padding: '12px 22px', borderRadius: '12px', textDecoration: 'none',
                  background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
                  color: course.platform === 'Coursera' ? '#60a5fa' : course.platform === 'edX' ? '#fca5a5' : '#c084fc',
                  fontSize: '0.85rem', fontWeight: 700, transition: 'all 0.2s ease', flexShrink: 0,
                }}
                onMouseEnter={e => { e.currentTarget.style.background = `${colors.accent}15`; e.currentTarget.style.borderColor = `${colors.accent}40`; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}
              >
                <ExternalLink size={16} /> View on {course.platform} ↗
              </a>
            )}
          </div>

          {/* Stats cards row */}
          <div style={{ display: 'flex', gap: '12px', marginTop: '24px', flexWrap: 'wrap', animation: 'cdpFadeIn 0.6s ease' }}>
            {[
              { icon: User, label: 'Instructor', value: course.instructor, color: '#a5b4fc' },
              { icon: Clock, label: 'Duration', value: course.duration, color: '#6ee7b7' },
              { icon: Users, label: 'Students', value: course.students, color: '#818cf8' },
              { icon: Shield, label: 'Prerequisites', value: course.prerequisites || 'None', color: '#fbbf24' },
            ].filter(s => s.value).map((stat, i) => (
              <div key={i} style={{
                padding: '14px 18px', borderRadius: '14px',
                background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
                flex: '1 1 200px', minWidth: '180px',
                transition: 'all 0.2s ease',
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = `${stat.color}30`; e.currentTarget.style.background = `${stat.color}05`; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; }}
              >
                <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <stat.icon size={12} color={stat.color} /> {stat.label}
                </div>
                <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#e2e8f0', lineHeight: 1.3 }}>{stat.value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Alerts */}
      <div style={{ maxWidth: '1140px', margin: '0 auto', padding: '0 20px' }}>
        {error && (
          <div className="alert alert-danger" style={{ marginTop: '16px' }}>
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}
        {message && (
          <div className="alert alert-success" style={{ marginTop: '16px' }}>
            <CheckCircle2 size={18} style={{ flexShrink: 0 }} />
            <span>{message}</span>
          </div>
        )}
      </div>

      {/* MAIN CONTENT */}
      <div className="cdp-main-grid">
        {/* LEFT COLUMN */}
        <div style={{ minWidth: 0, animation: 'cdpFadeIn 0.5s ease' }}>
          {/* Tab navigation */}
          <div style={{
            display: 'flex', gap: '4px', padding: '6px',
            background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: '16px', marginBottom: '24px',
          }}>
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px',
                  padding: '12px 16px', borderRadius: '12px',
                  background: activeTab === tab.id ? `${colors.accent}15` : 'transparent',
                  border: activeTab === tab.id ? `1px solid ${colors.accent}30` : '1px solid transparent',
                  color: activeTab === tab.id ? colors.accent : '#64748b',
                  fontSize: '0.82rem', fontWeight: activeTab === tab.id ? 700 : 600,
                  cursor: 'pointer', transition: 'all 0.2s ease', whiteSpace: 'nowrap',
                }}
              >
                <tab.icon size={15} />
                <span>{tab.label}</span>
                {tab.count && <span style={{ fontSize: '0.68rem', opacity: 0.7 }}>({tab.count})</span>}
              </button>
            ))}
          </div>

          {/* TAB: OVERVIEW */}
          {activeTab === 'OVERVIEW' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', animation: 'cdpFadeIn 0.3s ease' }}>
              {/* What You'll Learn */}
              <div style={{
                padding: '24px', borderRadius: '18px',
                background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
              }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#e2e8f0', margin: '0 0 18px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Sparkles size={18} color={colors.accent} /> What You'll Learn
                </h3>
                {course.whatYouWillLearn && course.whatYouWillLearn.length > 0 ? (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '10px' }}>
                    {course.whatYouWillLearn.map((item, idx) => (
                      <div key={idx} style={{
                        display: 'flex', alignItems: 'flex-start', gap: '10px',
                        padding: '12px 16px', borderRadius: '12px',
                        background: 'rgba(34,197,94,0.04)', border: '1px solid rgba(34,197,94,0.08)',
                        fontSize: '0.85rem', color: '#94a3b8', lineHeight: 1.5,
                        transition: 'all 0.15s ease',
                      }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(34,197,94,0.08)'; e.currentTarget.style.borderColor = 'rgba(34,197,94,0.2)'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(34,197,94,0.04)'; e.currentTarget.style.borderColor = 'rgba(34,197,94,0.08)'; }}
                      >
                        <CheckCircle2 size={15} color="#22c55e" style={{ flexShrink: 0, marginTop: '2px' }} />
                        {item}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ fontSize: '0.88rem', color: '#64748b', margin: 0 }}>{course.description}</p>
                )}
              </div>

              {/* Full Description */}
              <div style={{
                padding: '24px', borderRadius: '18px',
                background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
              }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#e2e8f0', margin: '0 0 14px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <BookOpen size={18} color={colors.accent} /> About This Course
                </h3>
                <div style={{ fontSize: '0.88rem', color: '#94a3b8', lineHeight: 1.75, whiteSpace: 'pre-line' }}>
                  {course.fullDescription || course.description}
                </div>
              </div>

              {/* Requirements & Target Audience */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                <div style={{
                  padding: '22px', borderRadius: '16px',
                  background: 'rgba(168,85,247,0.04)', border: '1px solid rgba(168,85,247,0.1)',
                }}>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#e2e8f0', margin: '0 0 14px 0', display: 'flex', alignItems: 'center', gap: '7px' }}>
                    <Award size={16} color="#a855f7" /> Requirements & Prerequisites
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {(course.requirements || [course.prerequisites || 'Basic Programming']).map((req, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#94a3b8' }}>
                        <ChevronRight size={13} color="#a855f7" style={{ flexShrink: 0 }} /> {req}
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{
                  padding: '22px', borderRadius: '16px',
                  background: 'rgba(6,182,212,0.04)', border: '1px solid rgba(6,182,212,0.1)',
                }}>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#e2e8f0', margin: '0 0 14px 0', display: 'flex', alignItems: 'center', gap: '7px' }}>
                    <Target size={16} color="#06b6d4" /> Who This Course Is For
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {(course.targetAudience || ['Anyone interested in AI and Machine Learning']).map((aud, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#94a3b8' }}>
                        <ChevronRight size={13} color="#22d3ee" style={{ flexShrink: 0 }} /> {aud}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Instructor Bio */}
              <div style={{
                padding: '22px', borderRadius: '16px',
                background: `${colors.accent}06`, border: `1px solid ${colors.accent}15`,
                display: 'flex', alignItems: 'flex-start', gap: '16px',
              }}>
                <div style={{
                  width: '52px', height: '52px', borderRadius: '14px', flexShrink: 0,
                  background: `${colors.accent}12`, border: `1px solid ${colors.accent}25`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <User size={24} color={colors.accent} />
                </div>
                <div>
                  <div style={{ fontSize: '0.78rem', fontWeight: 700, color: colors.accent, marginBottom: '2px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Instructor</div>
                  <div style={{ fontSize: '1rem', fontWeight: 800, color: '#e2e8f0', marginBottom: '6px' }}>{course.instructor}</div>
                  <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: 0, lineHeight: 1.6 }}>
                    {course.instructorBio || `${course.instructor} is a top-rated instructor specializing in ${course.category}.`}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB: SYLLABUS */}
          {activeTab === 'SYLLABUS' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', animation: 'cdpFadeIn 0.3s ease' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#e2e8f0', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <GraduationCap size={18} color={colors.accent} /> Course Curriculum
                </h3>
                <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>
                  {completedModules.length}/{(course.modules || []).length} Completed
                </span>
              </div>

              {/* Progress line */}
              <div style={{ height: '4px', borderRadius: '2px', background: 'rgba(255,255,255,0.06)', overflow: 'hidden', marginBottom: '8px' }}>
                <div style={{
                  height: '100%', borderRadius: '2px',
                  width: course.modules ? `${(completedModules.length / course.modules.length) * 100}%` : '0%',
                  background: colors.gradient, transition: 'width 0.4s ease',
                }} />
              </div>

              {course.modules && course.modules.length > 0 ? (
                course.modules.map((mod, idx) => {
                  const isDone = completedModules.includes(idx);
                  const isExpanded = expandedModule === idx;
                  return (
                    <div key={idx} style={{
                      borderRadius: '14px', overflow: 'hidden',
                      background: isDone ? `${colors.accent}06` : 'rgba(255,255,255,0.02)',
                      border: `1px solid ${isDone ? `${colors.accent}20` : 'rgba(255,255,255,0.06)'}`,
                      transition: 'all 0.2s ease',
                    }}>
                      <div
                        style={{
                          display: 'flex', alignItems: 'center', gap: '14px',
                          padding: '16px 20px', cursor: 'pointer',
                          transition: 'all 0.15s ease',
                        }}
                        onClick={() => setExpandedModule(isExpanded ? null : idx)}
                        onMouseEnter={e => { e.currentTarget.style.background = `${colors.accent}08`; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                      >
                        {/* Module number */}
                        <div style={{
                          width: '36px', height: '36px', borderRadius: '10px', flexShrink: 0,
                          background: isDone ? `${colors.accent}20` : 'rgba(255,255,255,0.04)',
                          border: `1px solid ${isDone ? `${colors.accent}35` : 'rgba(255,255,255,0.08)'}`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '0.78rem', fontWeight: 800,
                          color: isDone ? colors.accent : '#64748b',
                          transition: 'all 0.2s ease',
                        }}>
                          {isDone ? <Check size={16} /> : idx + 1}
                        </div>

                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '0.9rem', fontWeight: 700, color: isDone ? colors.accent : '#e2e8f0', transition: 'color 0.2s ease' }}>
                            {mod}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: '#475569', marginTop: '2px' }}>
                            {isDone ? '✓ Completed' : `Module ${idx + 1} of ${course.modules.length}`}
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          {isEnrolled && (
                            <button
                              onClick={(e) => { e.stopPropagation(); toggleModuleCompletion(idx); }}
                              style={{
                                width: '32px', height: '32px', borderRadius: '8px',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                background: isDone ? `${colors.accent}15` : 'rgba(255,255,255,0.04)',
                                border: `1px solid ${isDone ? `${colors.accent}30` : 'rgba(255,255,255,0.08)'}`,
                                color: isDone ? colors.accent : '#64748b',
                                cursor: 'pointer', transition: 'all 0.15s ease',
                              }}
                              title={isDone ? 'Mark as incomplete' : 'Mark as complete'}
                            >
                              {isDone ? <CheckCircle2 size={14} /> : <div style={{ width: '12px', height: '12px', borderRadius: '3px', border: '2px solid #475569' }} />}
                            </button>
                          )}
                          {isExpanded ? <ChevronUp size={16} color="#64748b" /> : <ChevronDown size={16} color="#64748b" />}
                        </div>
                      </div>

                      {isExpanded && (
                        <div style={{ padding: '0 20px 16px', borderTop: '1px solid rgba(255,255,255,0.04)', animation: 'cdpFadeIn 0.2s ease' }}>
                          <div style={{ padding: '14px 0', fontSize: '0.85rem', color: '#64748b', lineHeight: 1.6 }}>
                            This module covers the core concepts of <strong style={{ color: '#94a3b8' }}>{mod.replace(/^(Module|Course|Week)\s*\d+[:\s]*/i, '')}</strong>. Complete the module content and exercises to mark this as done.
                          </div>
                          {!isEnrolled && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: '#fbbf24', padding: '8px 12px', borderRadius: '8px', background: 'rgba(251,191,36,0.06)', border: '1px solid rgba(251,191,36,0.15)' }}>
                              <Lock size={13} /> Enroll to track module completion
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <div style={{ padding: '32px', textAlign: 'center', color: '#64748b', fontSize: '0.88rem', background: 'rgba(255,255,255,0.02)', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.06)' }}>
                  No syllabus modules available for this course yet.
                </div>
              )}
            </div>
          )}

          {/* TAB: QUIZZES */}
          {activeTab === 'QUIZZES' && (
            <div style={{ animation: 'cdpFadeIn 0.3s ease' }}>
              <QuizComponent courseId={course?.id || id} />
            </div>
          )}

          {/* TAB: AI TUTOR */}
          {activeTab === 'AI_TUTOR' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', animation: 'cdpFadeIn 0.3s ease' }}>
              <div style={{
                padding: '24px', borderRadius: '18px',
                background: 'rgba(99,102,241,0.04)', border: '1px solid rgba(99,102,241,0.12)',
              }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#e2e8f0', margin: '0 0 6px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Bot size={18} color="#818cf8" /> AI Tutor for {course.title}
                </h3>
                <p style={{ fontSize: '0.82rem', color: '#64748b', margin: 0 }}>
                  Ask questions about course concepts, get practice quizzes, or request summaries.
                </p>
              </div>

              {/* Suggested prompts */}
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {[
                  { text: 'Explain Module 1', icon: Zap },
                  { text: 'Key concepts summary', icon: Sparkles },
                  { text: 'Practice quiz', icon: FileText },
                  { text: 'Study tips', icon: BarChart3 },
                ].map((chip, i) => (
                  <button
                    key={i}
                    onClick={() => handleAskAi(chip.text)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '6px',
                      padding: '8px 14px', borderRadius: '10px',
                      background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
                      color: '#94a3b8', fontSize: '0.78rem', fontWeight: 600,
                      cursor: 'pointer', transition: 'all 0.15s ease',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = `${colors.accent}30`; e.currentTarget.style.color = colors.accent; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = '#94a3b8'; }}
                  >
                    <chip.icon size={13} /> {chip.text}
                  </button>
                ))}
              </div>

              {/* Chat messages */}
              <div style={{
                padding: '20px', borderRadius: '16px',
                background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
                minHeight: '200px', maxHeight: '400px', overflowY: 'auto',
                display: 'flex', flexDirection: 'column', gap: '12px',
              }}>
                {aiMessages.length === 0 && !aiThinking && (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', color: '#475569', textAlign: 'center' }}>
                    <Bot size={36} style={{ opacity: 0.3, marginBottom: '12px' }} />
                    <div style={{ fontSize: '0.88rem', fontWeight: 600 }}>No messages yet</div>
                    <div style={{ fontSize: '0.78rem', marginTop: '4px' }}>Ask a question or click a suggestion above to start</div>
                  </div>
                )}

                {aiMessages.map((msg, i) => (
                  <div key={i} style={{
                    alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                    maxWidth: '85%', padding: '12px 16px', borderRadius: '14px',
                    background: msg.sender === 'user'
                      ? `linear-gradient(135deg, ${colors.accent}, ${colors.accent}cc)`
                      : 'rgba(255,255,255,0.04)',
                    border: msg.sender === 'user' ? 'none' : '1px solid rgba(255,255,255,0.06)',
                    color: msg.sender === 'user' ? '#fff' : '#cbd5e1',
                    fontSize: '0.85rem', lineHeight: 1.6, whiteSpace: 'pre-line',
                    animation: 'cdpSlideRight 0.3s ease',
                  }}>
                    {msg.sender === 'ai' && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.72rem', fontWeight: 700, color: '#818cf8', marginBottom: '6px' }}>
                        <Bot size={12} /> AI Tutor
                      </div>
                    )}
                    {msg.text}
                  </div>
                ))}

                {aiThinking && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 16px', borderRadius: '14px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', alignSelf: 'flex-start', color: '#818cf8', fontSize: '0.82rem' }}>
                    <span className="spinner" style={{ width: '14px', height: '14px' }}></span> Thinking...
                  </div>
                )}
              </div>

              {/* Input */}
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Ask anything about this course..."
                  value={aiQuestion}
                  onChange={(e) => setAiQuestion(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAskAi()}
                  style={{ borderRadius: '12px' }}
                />
                <button
                  onClick={() => handleAskAi()}
                  disabled={aiThinking || !aiQuestion.trim()}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    width: '48px', height: '48px', borderRadius: '12px', border: 'none',
                    background: colors.gradient, color: '#fff', cursor: 'pointer',
                    transition: 'all 0.15s ease', flexShrink: 0,
                    opacity: aiThinking || !aiQuestion.trim() ? 0.5 : 1,
                  }}
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
          )}

          {/* TAB: RESOURCES */}
          {activeTab === 'RESOURCES' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', animation: 'cdpFadeIn 0.3s ease' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#e2e8f0', margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileText size={18} color={colors.accent} /> Course Materials & Resources
              </h3>

              {[
                { icon: Code, title: 'Interactive Code Notebooks', desc: 'Python, Jupyter & hands-on lab exercises', color: '#818cf8', action: 'Download .zip' },
                { icon: FileText, title: 'Course Cheat Sheet & Diagrams', desc: 'PDF summary guide with architecture visualizations', color: '#6ee7b7', action: 'View PDF' },
                { icon: Download, title: 'Lecture Slides & Notes', desc: 'Downloadable presentation slides for all modules', color: '#fbbf24', action: 'Download' },
                { icon: MessageSquare, title: 'Discussion Forum', desc: 'Join the community and ask questions to peers', color: '#f87171', action: 'Open Forum' },
              ].map((resource, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: '16px',
                  padding: '18px 20px', borderRadius: '14px',
                  background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
                  transition: 'all 0.2s ease', cursor: 'pointer',
                }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = `${resource.color}30`; e.currentTarget.style.background = `${resource.color}05`; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; }}
                >
                  <div style={{
                    width: '44px', height: '44px', borderRadius: '12px', flexShrink: 0,
                    background: `${resource.color}12`, border: `1px solid ${resource.color}20`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <resource.icon size={20} color={resource.color} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#e2e8f0' }}>{resource.title}</div>
                    <div style={{ fontSize: '0.78rem', color: '#475569', marginTop: '2px' }}>{resource.desc}</div>
                  </div>
                  <button
                    onClick={() => addToast(`Opening ${resource.title}...`, 'info')}
                    style={{
                      padding: '8px 16px', borderRadius: '10px',
                      background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
                      color: resource.color, fontSize: '0.78rem', fontWeight: 700,
                      cursor: 'pointer', transition: 'all 0.15s ease', whiteSpace: 'nowrap',
                    }}
                  >
                    {resource.action}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT SIDEBAR */}
        <div style={{ animation: 'cdpFadeIn 0.6s ease' }}>
          <div style={{
            position: 'sticky', top: '24px',
            borderRadius: '20px', overflow: 'hidden',
            background: 'linear-gradient(180deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)',
            border: '1px solid rgba(255,255,255,0.06)',
          }}>
            {!isEnrolled ? (
              /* NOT ENROLLED STATE */
              <div style={{ padding: '28px 24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{
                    width: '64px', height: '64px', borderRadius: '18px', margin: '0 auto 14px',
                    background: `${colors.accent}12`, border: `1px solid ${colors.accent}20`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <PlayCircle size={28} color={colors.accent} />
                  </div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 900, color: '#e2e8f0', margin: '0 0 6px 0' }}>Ready to Start?</h3>
                  <p style={{ fontSize: '0.82rem', color: '#64748b', margin: 0, lineHeight: 1.5 }}>
                    Enroll to access course materials, track progress, and get AI tutoring.
                  </p>
                </div>

                <button
                  onClick={handleEnroll}
                  disabled={actionLoading}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                    padding: '14px 24px', borderRadius: '14px', border: 'none',
                    background: colors.gradient, color: '#fff',
                    fontSize: '0.95rem', fontWeight: 800, cursor: 'pointer',
                    boxShadow: `0 6px 25px ${colors.accent}35`,
                    transition: 'all 0.2s ease',
                    opacity: actionLoading ? 0.7 : 1,
                  }}
                  onMouseEnter={e => { if (!actionLoading) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = `0 10px 35px ${colors.accent}50`; }}}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = `0 6px 25px ${colors.accent}35`; }}
                >
                  {actionLoading ? <><span className="spinner"></span> Enrolling...</> : <><BookOpen size={18} /> Enroll Now — Free</>}
                </button>

                {/* Features list */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {[
                    { icon: Layers, text: `${(course.modules || []).length} modules of content` },
                    { icon: Bot, text: 'AI-powered tutor assistant' },
                    { icon: Award, text: 'Completion certificate' },
                    { icon: BarChart3, text: 'Progress tracking' },
                  ].map((feature, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.82rem', color: '#94a3b8' }}>
                      <feature.icon size={15} color={colors.accent} style={{ flexShrink: 0 }} />
                      {feature.text}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              /* ENROLLED STATE */
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {/* Circular progress */}
                <div style={{ padding: '28px 24px 20px', textAlign: 'center' }}>
                  <svg width="130" height="130" style={{ margin: '0 auto', display: 'block' }}>
                    <circle cx="65" cy="65" r={circleRadius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
                    <circle
                      cx="65" cy="65" r={circleRadius} fill="none"
                      stroke={`url(#progressGrad_${courseId})`}
                      strokeWidth="8" strokeLinecap="round"
                      strokeDasharray={circumference}
                      strokeDashoffset={strokeDashoffset}
                      style={{ transform: 'rotate(-90deg)', transformOrigin: 'center', transition: 'stroke-dashoffset 0.6s ease', animation: 'cdpProgressFill 1s ease forwards' }}
                    />
                    <defs>
                      <linearGradient id={`progressGrad_${courseId}`} x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor={colors.accent} />
                        <stop offset="100%" stopColor="#22c55e" />
                      </linearGradient>
                    </defs>
                    <text x="65" y="60" textAnchor="middle" style={{ fontSize: '1.8rem', fontWeight: 900, fill: '#e2e8f0' }}>{progressPercent}%</text>
                    <text x="65" y="80" textAnchor="middle" style={{ fontSize: '0.65rem', fontWeight: 600, fill: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Complete</text>
                  </svg>
                  {progress?.lastAccessed && (
                    <div style={{ fontSize: '0.72rem', color: '#475569', marginTop: '8px' }}>
                      Last activity: {new Date(progress.lastAccessed).toLocaleDateString()}
                    </div>
                  )}
                </div>

                {/* Quick presets */}
                <div style={{ padding: '0 24px 16px' }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
                    Quick Progress
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
                    {[25, 50, 75, 100].map(val => (
                      <button
                        key={val}
                        onClick={() => handlePresetClick(val)}
                        style={{
                          padding: '8px 4px', borderRadius: '8px',
                          background: percentInput >= val ? `${colors.accent}15` : 'rgba(255,255,255,0.03)',
                          border: `1px solid ${percentInput >= val ? `${colors.accent}30` : 'rgba(255,255,255,0.06)'}`,
                          color: percentInput >= val ? colors.accent : '#64748b',
                          fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        {val}%
                      </button>
                    ))}
                  </div>
                </div>

                {/* Slider */}
                <div style={{ padding: '0 24px 16px' }}>
                  <form onSubmit={handleSliderSave}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Manual adjustment</span>
                      <span style={{ fontSize: '0.82rem', fontWeight: 700, color: colors.accent }}>{percentInput}%</span>
                    </div>
                    <input
                      type="range" min="0" max="100"
                      value={percentInput}
                      onChange={(e) => setPercentInput(e.target.value)}
                      className="slider-input"
                      style={{ width: '100%' }}
                    />
                    <button
                      type="submit"
                      disabled={actionLoading}
                      style={{
                        width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                        padding: '10px', borderRadius: '10px', marginTop: '8px',
                        background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                        color: '#94a3b8', fontSize: '0.82rem', fontWeight: 600,
                        cursor: 'pointer', transition: 'all 0.15s ease',
                      }}
                    >
                      {actionLoading ? <><span className="spinner" style={{ width: '14px', height: '14px' }}></span> Saving...</> : <><Save size={14} /> Save Progress</>}
                    </button>
                  </form>
                </div>

                {/* Certificate */}
                <div style={{
                  margin: '0 24px', padding: '14px 16px', borderRadius: '12px',
                  background: progressPercent === 100 ? 'rgba(34,197,94,0.08)' : 'rgba(255,255,255,0.02)',
                  border: `1px solid ${progressPercent === 100 ? 'rgba(34,197,94,0.2)' : 'rgba(255,255,255,0.06)'}`,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', fontWeight: 700, color: progressPercent === 100 ? '#4ade80' : '#64748b' }}>
                    <Award size={16} />
                    {progressPercent === 100 ? 'Certificate Unlocked! 🎉' : 'Course Certificate'}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#475569', marginTop: '4px' }}>
                    {progressPercent === 100 ? 'Congratulations! You completed this course.' : `Complete ${100 - progressPercent}% more to unlock.`}
                  </div>
                </div>

                {/* Unenroll */}
                <div style={{ padding: '16px 24px 24px' }}>
                  <button
                    onClick={handleUnenroll}
                    disabled={actionLoading}
                    style={{
                      width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                      padding: '10px', borderRadius: '10px',
                      background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.15)',
                      color: '#f87171', fontSize: '0.82rem', fontWeight: 600,
                      cursor: 'pointer', transition: 'all 0.15s ease',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.05)'; }}
                  >
                    <Trash2 size={14} /> Unenroll from Course
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetailPage;
