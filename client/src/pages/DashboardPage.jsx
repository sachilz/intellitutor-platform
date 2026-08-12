import React, { useEffect, useState, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { getCourses, enrollInCourse } from '../api/courseApi';
import { getUserProgress, updateProgress, createProgress } from '../api/progressApi';
import { askTutor } from '../api/tutorApi';
import { getQuizzes, submitQuiz, getQuizAttempts } from '../api/quizApi';
import { CourseGridSkeleton } from '../components/SkeletonLoader';
import { CURATED_COURSES, getCategoryBadgeClass } from '../data/coursesCatalog';
import { getStoredProgressMap, saveStoredProgressMap, setStoredCourseProgress, removeStoredCourseProgress } from '../utils/progressStorage';
import TimeAnalyticsModal from '../components/TimeAnalyticsModal';

import { 
  BookOpen, 
  GraduationCap, 
  TrendingUp, 
  Sparkles, 
  Search, 
  User, 
  ArrowRight, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle2,
  Filter,
  Flame,
  Clock,
  Star,
  Eye,
  X,
  PlusCircle,
  SlidersHorizontal,
  LayoutGrid,
  List,
  Grid2x2,
  Bot,
  Zap,
  Target,
  Send,
  Bookmark,
  Heart,
  Award,
  ChevronRight,
  PlayCircle,
  MessageSquare,
  HelpCircle,
  BarChart2,
  Check,
  ExternalLink,
  Users,
  Globe,
  PieChart,
  Trash2,
  Pause,
  Play,
  ShieldCheck,
  RotateCcw,
  Settings,

  Copy,
  Cpu,
  Layers,
  Code
} from 'lucide-react';

const DashboardPage = () => {
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { addToast } = useToast();
  const [courses, setCourses] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [activeQuizModal, setActiveQuizModal] = useState(null);
  const [userProgressMap, setUserProgressMap] = useState(() => getStoredProgressMap());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Synchronize progress map with local storage updates across windows/pages
  useEffect(() => {
    const handleProgressUpdate = () => {
      setUserProgressMap(getStoredProgressMap());
    };
    window.addEventListener('progress_updated', handleProgressUpdate);
    window.addEventListener('storage', handleProgressUpdate);
    return () => {
      window.removeEventListener('progress_updated', handleProgressUpdate);
      window.removeEventListener('storage', handleProgressUpdate);
    };
  }, []);

  // Interactive Filter & Layout States
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [sortBy, setSortBy] = useState('RECOMMENDED');
  const [viewMode, setViewMode] = useState('GRID'); // 'GRID' | 'LIST' | 'COMPACT'
  const [previewCourse, setPreviewCourse] = useState(null);
  const [previewTab, setPreviewTab] = useState('overview'); // 'overview' | 'syllabus' | 'skills'
  const [actionLoadingId, setActionLoadingId] = useState(null);

  // Synchronize category filter from URL search parameters (e.g. ?filter=ENROLLED)
  useEffect(() => {
    const filterParam = searchParams.get('filter');
    if (filterParam) {
      const upper = filterParam.toUpperCase();
      const currentEnrolledCount = Object.keys(getStoredProgressMap()).length;
      if (upper === 'ENROLLED' && currentEnrolledCount === 0) {
        setSelectedCategory('ALL');
      } else {
        setSelectedCategory(upper);
      }
    } else {
      setSelectedCategory('ALL');
    }
  }, [searchParams]);

  // Unenroll Course Handler
  const handleUnenrollCourse = (courseId) => {
    if (!courseId) return;
    removeStoredCourseProgress(courseId);
    addToast('Unenrolled course successfully.', 'info', 'Course Removed');
  };

  // Bookmarked / Favorite Courses (Persisted in localStorage)
  const [favorites, setFavorites] = useState(() => {
    try {
      const saved = localStorage.getItem('intellilearn_favorites');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Daily Streak Check-In & XP State
  const [streakCheckedIn, setStreakCheckedIn] = useState(false);
  const [showStreakModal, setShowStreakModal] = useState(false);
  const [userXp, setUserXp] = useState(350);

  // Interactive Profile Data Sync
  const [profileData, setProfileData] = useState(() => {
    try {
      const saved = localStorage.getItem('intellilearn_profile_data');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    const handleProfileUpdate = () => {
      try {
        const saved = localStorage.getItem('intellilearn_profile_data');
        if (saved) setProfileData(JSON.parse(saved));
      } catch (e) {
        console.warn('Could not parse profile data', e);
      }
    };
    window.addEventListener('profile_updated', handleProfileUpdate);
    window.addEventListener('storage', handleProfileUpdate);
    return () => {
      window.removeEventListener('profile_updated', handleProfileUpdate);
      window.removeEventListener('storage', handleProfileUpdate);
    };
  }, []);

  const displayUsername = profileData?.username || user?.username || 'Learner';

  // Interactive Study Goal Tracker & Time Analytics Modal (in hours)
  const [loggedHours, setLoggedHours] = useState(3.5);
  const [showTimeAnalyticsModal, setShowTimeAnalyticsModal] = useState(false);
  const targetHours = 5.0;

  // Global Live Study Stopwatch State (Syncs with Top Banner & Modal)
  const [timerRunning, setTimerRunning] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Interval Ticking Effect
  useEffect(() => {
    let interval = null;
    if (timerRunning) {
      interval = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerRunning]);

  // Helper to format timer as HH:MM:SS or MM:SS
  const formatTimer = (totalSec) => {
    const hrs = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;
    return `${hrs > 0 ? `${hrs.toString().padStart(2, '0')}:` : ''}${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Copy message state
  const [copiedMsgIndex, setCopiedMsgIndex] = useState(null);

  // Multi-turn Interactive AI Chat Terminal State
  const [aiSandboxPrompt, setAiSandboxPrompt] = useState('');
  const [aiSandboxLoading, setAiSandboxLoading] = useState(false);
  const [terminalChat, setTerminalChat] = useState([
    {
      sender: 'ai',
      text: '👋 Welcome to your **AI Command Terminal**! I am your real-time AI Tutor for the IntelliLearn Platform. Ask me anything about Java OOP, Spring Boot, Microservices, React, Databases, or software engineering concepts!',
      time: 'Just now',
      sources: ['Knowledge Base Engine']
    }
  ]);

  // Floating AI Assistant Drawer Toggle
  const [fabOpen, setFabOpen] = useState(false);
  const [fabPrompt, setFabPrompt] = useState('');
  const [fabMessages, setFabMessages] = useState([
    { sender: 'ai', text: 'Hi! I am your IntelliLearn AI Tutor. Ask me anything about course recommendations, learning paths, or technical skills!' }
  ]);

  // Persist favorites when changed
  useEffect(() => {
    try {
      localStorage.setItem('intellilearn_favorites', JSON.stringify(favorites));
    } catch (e) {
      console.warn('Could not save favorites to localStorage', e);
    }
  }, [favorites]);

  const toggleFavorite = (courseId) => {
    setFavorites((prev) => {
      const exists = prev.includes(courseId);
      const updated = exists ? prev.filter((id) => id !== courseId) : [...prev, courseId];
      addToast(
        exists ? 'Course removed from bookmarks' : 'Course saved to your bookmarks! ⭐',
        exists ? 'info' : 'success',
        exists ? 'Bookmark Removed' : 'Bookmarked'
      );
      return updated;
    });
  };

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      let apiCourses = [];
      let apiQuizzes = [];
      try {
        const [cRes, qRes] = await Promise.all([
          getCourses().catch(() => []),
          getQuizzes().catch(() => []),
        ]);
        apiCourses = Array.isArray(cRes) ? cRes : cRes?.courses || [];
        apiQuizzes = Array.isArray(qRes) ? qRes : [];
      } catch (err) {
        console.warn('API Gateway fetch warning:', err);
      }

      setQuizzes(apiQuizzes);

      // Identify curated catalog IDs to separate instructor-uploaded courses
      const curatedIds = new Set(CURATED_COURSES.map((c) => c.id));
      const mergedMap = new Map();

      // Seed curated courses with isInstructorCourse: false
      CURATED_COURSES.forEach((c) => {
        mergedMap.set(c.id, { ...c, isInstructorCourse: false });
      });

      if (Array.isArray(apiCourses) && apiCourses.length > 0) {
        apiCourses.forEach((c) => {
          const key = c.id || c._id || c.title;
          const isCuratedMatch = curatedIds.has(key);
          if (isCuratedMatch) {
            mergedMap.set(key, { ...mergedMap.get(key), ...c, isInstructorCourse: false });
          } else {
            // This is an instructor-uploaded course!
            mergedMap.set(key, {
              ...c,
              id: key,
              isInstructorCourse: true,
              platform: c.platform || 'IntelliLearn',
              category: c.category || 'Computer Science',
              instructor: c.instructor || c.instructorId || 'Instructor',
              duration: c.duration || 'Self-paced',
              rating: c.rating || '5.0 ⭐',
              students: c.students || '10+ Enrolled',
            });
          }
        });
      }

      setCourses(Array.from(mergedMap.values()));

      // Load local progress map & combine with API progress
      const localMap = getStoredProgressMap();
      let apiMap = {};
      if (user?.id) {
        try {
          const progressList = await getUserProgress(user.id);
          if (Array.isArray(progressList)) {
            progressList.forEach((p) => {
              apiMap[p.courseId] = p.completedPercent;
            });
          }
        } catch (pErr) {
          console.warn('Could not fetch user progress:', pErr);
        }
      }

      const combinedMap = { ...localMap, ...apiMap };
      setUserProgressMap(combinedMap);
      saveStoredProgressMap(combinedMap);
    } catch (err) {
      console.error('Failed to fetch courses:', err);
      setError('Failed to load courses from API. Showing curated catalog.');
      setCourses(CURATED_COURSES.map((c) => ({ ...c, isInstructorCourse: false })));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  // Quiz Modal Handlers
  const handleStartQuiz = async (quiz) => {
    try {
      const userId = user?.email || user?.username || 'student1@intellilearn.com';
      const attempts = await getQuizAttempts(quiz.id, userId).catch(() => []);
      setActiveQuizModal({
        quiz,
        selectedAnswers: {},
        result: null,
        submitting: false,
        attempts: Array.isArray(attempts) ? attempts : [],
      });
    } catch {
      setActiveQuizModal({
        quiz,
        selectedAnswers: {},
        result: null,
        submitting: false,
        attempts: [],
      });
    }
  };

  const handleQuizOptionSelect = (questionIndex, optionIndex) => {
    if (!activeQuizModal) return;
    setActiveQuizModal((prev) => ({
      ...prev,
      selectedAnswers: {
        ...prev.selectedAnswers,
        [questionIndex]: optionIndex,
      },
    }));
  };

  const handleQuizSubmit = async (e) => {
    e.preventDefault();
    if (!activeQuizModal) return;
    const { quiz, selectedAnswers } = activeQuizModal;
    const questionsCount = quiz.questions?.length || 0;
    const answeredCount = Object.keys(selectedAnswers).length;

    if (answeredCount < questionsCount) {
      addToast(`Please answer all ${questionsCount} questions before submitting.`, 'warning', 'Incomplete Quiz');
      return;
    }

    setActiveQuizModal((prev) => ({ ...prev, submitting: true }));
    try {
      const selectedOptions = quiz.questions.map((_, idx) => selectedAnswers[idx] ?? 0);
      const userId = user?.email || user?.username || 'student1@intellilearn.com';
      const res = await submitQuiz(quiz.id, selectedOptions, userId);
      setActiveQuizModal((prev) => ({
        ...prev,
        result: res,
        submitting: false,
      }));
      setUserXp((prev) => prev + 40);
      addToast(`Quiz submitted! Score: ${res.score}% (+40 XP) 🎉`, 'success', 'Assessment Complete');
    } catch (err) {
      console.error('Quiz submission error:', err);
      addToast('Failed to submit quiz attempt.', 'error', 'Error');
      setActiveQuizModal((prev) => ({ ...prev, submitting: false }));
    }
  };

  // Derived Categories & Counts
  const categories = useMemo(() => {
    const set = new Set();
    courses.forEach((c) => {
      if (c.category) set.add(c.category);
    });
    return Array.from(set);
  }, [courses]);

  const enrolledCoursesList = useMemo(() => {
    return courses.filter((c) => userProgressMap[c.id || c._id] !== undefined);
  }, [courses, userProgressMap]);

  const enrolledCount = enrolledCoursesList.length;
  const courseraCount = useMemo(() => courses.filter((c) => c.platform === 'Coursera').length, [courses]);
  const udemyCount = useMemo(() => courses.filter((c) => c.platform === 'Udemy').length, [courses]);
  const edxCount = useMemo(() => courses.filter((c) => c.platform === 'edX').length, [courses]);

  const avgProgress = useMemo(() => {
    const values = Object.values(userProgressMap);
    if (values.length === 0) return 0;
    const total = values.reduce((sum, val) => sum + (Number(val) || 0), 0);
    return Math.round(total / values.length);
  }, [userProgressMap]);

  // Quick Progress Increment Handler (+10%)
  const handleQuickProgressBump = async (courseId, currentPercent = 0) => {
    const newPercent = Math.min(100, (Number(currentPercent) || 0) + 10);
    setActionLoadingId(courseId);
    try {
      if (user?.id) {
        try {
          const updated = await updateProgress(user.id, courseId, newPercent);
          setStoredCourseProgress(courseId, updated.completedPercent);
          addToast(`Progress boosted to ${updated.completedPercent}%! 🚀`, 'success', 'Keep it up!');
        } catch (apiErr) {
          setStoredCourseProgress(courseId, newPercent);
          addToast(`Progress updated to ${newPercent}%!`, 'info', 'Progress Saved');
        }
      } else {
        setStoredCourseProgress(courseId, newPercent);
        addToast(`Progress updated to ${newPercent}%!`, 'info', 'Progress Saved');
      }
    } finally {
      setActionLoadingId(null);
    }
  };

  // Quick Enroll Handler from Modal
  const handleModalEnroll = async (courseId) => {
    setActionLoadingId(courseId);
    try {
      if (user?.id) {
        try {
          await enrollInCourse(courseId, user.id);
          await createProgress(user.id, courseId);
        } catch (apiErr) {
          console.warn('API Gateway enrollment fallback:', apiErr);
        }
      }
      setStoredCourseProgress(courseId, 0);
      addToast('Enrolled successfully! Welcome aboard 🎓', 'success', 'Registration Confirmed');
      setPreviewCourse(null);
    } catch (err) {
      setStoredCourseProgress(courseId, 0);
      addToast('Enrolled in course catalog!', 'success', 'Course Enrolled');
      setPreviewCourse(null);
    } finally {
      setActionLoadingId(null);
    }
  };

  // Daily Streak Check-In Handler
  const handleStreakCheckIn = () => {
    if (!streakCheckedIn) {
      setStreakCheckedIn(true);
      setUserXp((prev) => prev + 50);
      setShowStreakModal(true);
      addToast('🔥 Daily Streak Claimed! You gained +50 AI Tutor XP.', 'success', 'Streak Reward');
    } else {
      setShowStreakModal(true);
    }
  };

  // Log +30 mins study session simulator
  const handleLogStudyTime = () => {
    setLoggedHours((prev) => Math.min(targetHours, Math.round((prev + 0.5) * 10) / 10));
    setUserXp((prev) => prev + 25);
    addToast('⏱️ Logged +30 mins of AI learning! +25 XP added.', 'success', 'Study Time Logged');
  };



  // Render markdown text to styled JSX
  const renderMarkdown = (text) => {
    if (!text) return null;
    const lines = text.split('\n');
    const elements = [];
    let codeBlock = null;
    let listItems = [];
    let listType = null; // 'ul' or 'ol'

    const flushList = () => {
      if (listItems.length > 0) {
        const Tag = listType === 'ol' ? 'ol' : 'ul';
        elements.push(
          <Tag key={`list-${elements.length}`} style={{
            margin: '8px 0', paddingLeft: '20px', color: '#cbd5e1',
            listStyleType: listType === 'ol' ? 'decimal' : 'disc'
          }}>
            {listItems.map((li, j) => (
              <li key={j} style={{ margin: '4px 0', lineHeight: 1.6, fontSize: '0.86rem' }}>
                {renderInline(li)}
              </li>
            ))}
          </Tag>
        );
        listItems = [];
        listType = null;
      }
    };

    const renderInline = (str) => {
      if (!str) return str;
      // Process inline markdown: bold, italic, inline code
      const parts = [];
      let remaining = str;
      let key = 0;
      // Process backtick code first, then bold, then italic
      const regex = /(`[^`]+`)|\*\*\*([^*]+)\*\*\*|\*\*([^*]+)\*\*|\*([^*]+)\*/g;
      let lastIndex = 0;
      let match;
      while ((match = regex.exec(remaining)) !== null) {
        if (match.index > lastIndex) {
          parts.push(<span key={key++}>{remaining.slice(lastIndex, match.index)}</span>);
        }
        if (match[1]) {
          // Inline code
          parts.push(
            <code key={key++} style={{
              background: 'rgba(99,102,241,0.15)', color: '#a5b4fc',
              padding: '1px 6px', borderRadius: '4px', fontSize: '0.82em',
              fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
              border: '1px solid rgba(99,102,241,0.2)'
            }}>{match[1].slice(1, -1)}</code>
          );
        } else if (match[2]) {
          // Bold italic
          parts.push(<strong key={key++} style={{ fontWeight: 700, fontStyle: 'italic', color: '#f1f5f9' }}>{match[2]}</strong>);
        } else if (match[3]) {
          // Bold
          parts.push(<strong key={key++} style={{ fontWeight: 700, color: '#f1f5f9' }}>{match[3]}</strong>);
        } else if (match[4]) {
          // Italic
          parts.push(<em key={key++} style={{ fontStyle: 'italic', color: '#e2e8f0' }}>{match[4]}</em>);
        }
        lastIndex = match.index + match[0].length;
      }
      if (lastIndex < remaining.length) {
        parts.push(<span key={key++}>{remaining.slice(lastIndex)}</span>);
      }
      return parts.length > 0 ? parts : str;
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Code block start/end
      if (line.trim().startsWith('```')) {
        flushList();
        if (codeBlock === null) {
          const lang = line.trim().slice(3).trim();
          codeBlock = { lang, lines: [] };
          continue;
        } else {
          elements.push(
            <div key={`code-${i}`} style={{
              margin: '10px 0', borderRadius: '10px', overflow: 'hidden',
              border: '1px solid rgba(99,102,241,0.2)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
            }}>
              {codeBlock.lang && (
                <div style={{
                  padding: '6px 14px', background: 'rgba(99,102,241,0.12)',
                  borderBottom: '1px solid rgba(99,102,241,0.15)',
                  fontSize: '0.7rem', color: '#818cf8', fontWeight: 700,
                  textTransform: 'uppercase', letterSpacing: '0.05em'
                }}>{codeBlock.lang}</div>
              )}
              <pre style={{
                margin: 0, padding: '14px 16px', background: '#020617',
                overflowX: 'auto', fontSize: '0.82rem', lineHeight: 1.65,
                fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
                color: '#e2e8f0'
              }}><code>{codeBlock.lines.join('\n')}</code></pre>
            </div>
          );
          codeBlock = null;
          continue;
        }
      }
      if (codeBlock !== null) {
        codeBlock.lines.push(line);
        continue;
      }

      // Horizontal rule
      if (/^(-{3,}|\*{3,}|_{3,})$/.test(line.trim())) {
        flushList();
        elements.push(<hr key={`hr-${i}`} style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.08)', margin: '12px 0' }} />);
        continue;
      }

      // Headings
      const headingMatch = line.match(/^(#{1,4})\s+(.+)/);
      if (headingMatch) {
        flushList();
        const level = headingMatch[1].length;
        const headingStyles = {
          1: { fontSize: '1.15rem', fontWeight: 800, color: '#f8fafc', margin: '16px 0 8px 0', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '6px' },
          2: { fontSize: '1.02rem', fontWeight: 700, color: '#f1f5f9', margin: '14px 0 6px 0' },
          3: { fontSize: '0.92rem', fontWeight: 700, color: '#e2e8f0', margin: '12px 0 5px 0' },
          4: { fontSize: '0.86rem', fontWeight: 600, color: '#cbd5e1', margin: '10px 0 4px 0' },
        };
        elements.push(
          <div key={`h-${i}`} style={headingStyles[level] || headingStyles[4]}>
            {renderInline(headingMatch[2])}
          </div>
        );
        continue;
      }

      // Numbered list items (1. 2. etc.)
      const olMatch = line.match(/^\s*(\d+)\.\s+(.+)/);
      if (olMatch) {
        if (listType !== 'ol') flushList();
        listType = 'ol';
        listItems.push(olMatch[2]);
        continue;
      }

      // Bullet list items
      const ulMatch = line.match(/^\s*[-•*]\s+(.+)/);
      if (ulMatch) {
        if (listType !== 'ul') flushList();
        listType = 'ul';
        listItems.push(ulMatch[1]);
        continue;
      }

      // Regular line / empty line
      flushList();
      if (line.trim() === '') {
        elements.push(<div key={`empty-${i}`} style={{ height: '6px' }} />);
      } else {
        elements.push(
          <div key={`p-${i}`} style={{ margin: '2px 0', lineHeight: 1.65 }}>
            {renderInline(line)}
          </div>
        );
      }
    }

    // Flush remaining
    flushList();
    if (codeBlock !== null) {
      elements.push(
        <pre key="code-end" style={{
          margin: '10px 0', padding: '14px 16px', background: '#020617',
          borderRadius: '10px', overflowX: 'auto', fontSize: '0.82rem',
          lineHeight: 1.65, fontFamily: "'JetBrains Mono', monospace",
          color: '#e2e8f0', border: '1px solid rgba(99,102,241,0.2)'
        }}><code>{codeBlock.lines.join('\n')}</code></pre>
      );
    }

    return elements;
  };

  const handleClearTerminalChat = () => {
    setTerminalChat([
      {
        sender: 'ai',
        text: 'Terminal chat reset. What would you like to learn next?',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        sources: []
      }
    ]);
    addToast('Terminal chat history cleared.', 'info', 'Chat Cleared');
  };

  const copyMessageToClipboard = (text, index) => {
    try {
      navigator.clipboard.writeText(text);
      setCopiedMsgIndex(index);
      addToast('Copied answer to clipboard!', 'success', 'Copied');
      setTimeout(() => setCopiedMsgIndex(null), 2000);
    } catch (e) {
      console.warn('Clipboard write failed:', e);
    }
  };

  // AI Assistant Sandbox Terminal Handler (Multi-turn)
  const handleAiSandboxPrompt = async (promptText) => {
    const q = promptText || aiSandboxPrompt;
    if (!q.trim() || aiSandboxLoading) return;

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg = { sender: 'user', text: q, time: timeStr };

    setTerminalChat((prev) => [...prev, userMsg]);
    setAiSandboxPrompt('');
    setAiSandboxLoading(true);

    try {
      const userId = user?.email || user?.username || 'student1@intellilearn.com';
      const res = await askTutor('general', q, userId);

      setTerminalChat((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: res.answer,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          sources: res.sources || [],
          grounded: res.grounded
        }
      ]);
    } catch (err) {
      console.warn('RAG/LLM API error:', err);
      setTerminalChat((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: `🤖 I encountered an issue processing your request about "${q}". (${err.message || 'Service temporarily unavailable'}). Please try again shortly.`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          sources: ['System']
        }
      ]);
    } finally {
      setAiSandboxLoading(false);
    }
  };

  // Floating FAB AI Chat Handler
  const handleSendFabMessage = async () => {
    if (!fabPrompt.trim()) return;
    const userMsg = { sender: 'user', text: fabPrompt };
    setFabMessages((prev) => [...prev, userMsg]);
    const currentQ = fabPrompt;
    setFabPrompt('');

    try {
      const userId = user?.email || user?.username || 'student1@intellilearn.com';
      const res = await askTutor('general', currentQ, userId);
      let reply = res.answer;
      if (res.sources && res.sources.length > 0) {
        reply += ` (Sources: ${res.sources.join(', ')})`;
      }
      setFabMessages((prev) => [...prev, { sender: 'ai', text: reply }]);
    } catch (err) {
      setFabMessages((prev) => [...prev, { sender: 'ai', text: `I encountered an issue processing your request. Please try again shortly.` }]);
    }
  };

  // Dynamic Greeting based on time
  const timeGreeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return { text: 'Good morning', emoji: '☀️' };
    if (hour < 18) return { text: 'Good afternoon', emoji: '🌤️' };
    return { text: 'Good evening', emoji: '🌙' };
  }, []);

  // Filtered & Sorted Courses Calculation
  const filteredCourses = useMemo(() => {
    let list = courses.filter((course) => {
      const courseId = course.id || course._id;
      const isEnrolled = userProgressMap[courseId] !== undefined;
      const isFav = favorites.includes(courseId);

      // Category & Platform filter
      const totalEnrolledCount = Object.keys(userProgressMap).length;
      if (selectedCategory === 'ENROLLED' && totalEnrolledCount > 0 && !isEnrolled) return false;
      if (selectedCategory === 'FAVORITES' && favorites.length > 0 && !isFav) return false;
      if (selectedCategory === 'COURSERA' && course.platform !== 'Coursera') return false;
      if (selectedCategory === 'UDEMY' && course.platform !== 'Udemy') return false;
      if (selectedCategory === 'EDX' && course.platform !== 'edX') return false;
      if (
        selectedCategory !== 'ALL' &&
        selectedCategory !== 'ENROLLED' &&
        selectedCategory !== 'FAVORITES' &&
        selectedCategory !== 'COURSERA' &&
        selectedCategory !== 'UDEMY' &&
        selectedCategory !== 'EDX' &&
        course.category !== selectedCategory
      ) {
        return false;
      }

      // Search filter
      if (searchTerm.trim() !== '') {
        const query = searchTerm.toLowerCase();
        const titleMatch = (course.title || course.name || '').toLowerCase().includes(query);
        const descMatch = (course.description || '').toLowerCase().includes(query);
        const instructorMatch = (course.instructor || '').toLowerCase().includes(query);
        const categoryMatch = (course.category || '').toLowerCase().includes(query);
        if (!titleMatch && !descMatch && !instructorMatch && !categoryMatch) return false;
      }

      return true;
    });

    // Sorting logic
    if (sortBy === 'TITLE') {
      list.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
    } else if (sortBy === 'PROGRESS') {
      list.sort((a, b) => {
        const pA = userProgressMap[a.id || a._id] || 0;
        const pB = userProgressMap[b.id || b._id] || 0;
        return pB - pA;
      });
    } else if (sortBy === 'RATING') {
      list.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    }

    return list;
  }, [courses, userProgressMap, selectedCategory, searchTerm, sortBy, favorites]);

  // Separate instructor-uploaded courses from real-time catalog
  const filteredInstructorCourses = useMemo(() => {
    return filteredCourses.filter((c) => c.isInstructorCourse);
  }, [filteredCourses]);

  const filteredCuratedCourses = useMemo(() => {
    return filteredCourses.filter((c) => !c.isInstructorCourse);
  }, [filteredCourses]);

  // Skill tags generator helper
  const getSkillTags = (category) => {
    switch (category) {
      case 'GenAI': return ['LLMs', 'Prompt Eng', 'RAG', 'LangChain'];
      case 'AI & ML': return ['PyTorch', 'Neural Nets', 'Scikit-Learn', 'Math'];
      case 'Web Dev': return ['React 19', 'Next.js', 'TypeScript', 'Tailwind'];
      case 'DevOps & Cloud': return ['Docker', 'Kubernetes', 'AWS', 'CI/CD'];
      case 'Data Science': return ['Pandas', 'Python', 'NumPy', 'Visualization'];
      case 'Security': return ['Zero Trust', 'Cybersecurity', 'Auth', 'OAuth2'];
      default: return ['AI', 'Engineering', 'Hands-on'];
    }
  };

  // Course Grid / List Renderer Helper
  const renderCourseGrid = (courseList) => {
    if (viewMode === 'GRID') {
      return (
        <div className="courses-grid">
          {courseList.map((course) => {
            const courseId = course.id || course._id;
            const progress = userProgressMap[courseId];
            const isEnrolled = progress !== undefined;
            const isFav = favorites.includes(courseId);
            const badgeClass = getCategoryBadgeClass(course.category);
            const skillTags = getSkillTags(course.category);

            const categoryColors = {
              'GenAI': { accent: '#a855f7', bg: 'rgba(168,85,247,0.08)', border: 'rgba(168,85,247,0.2)' },
              'AI & ML': { accent: '#6366f1', bg: 'rgba(99,102,241,0.08)', border: 'rgba(99,102,241,0.2)' },
              'Web Dev': { accent: '#22c55e', bg: 'rgba(34,197,94,0.08)', border: 'rgba(34,197,94,0.2)' },
              'DevOps & Cloud': { accent: '#f59e0b', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.2)' },
              'Data Science': { accent: '#06b6d4', bg: 'rgba(6,182,212,0.08)', border: 'rgba(6,182,212,0.2)' },
              'Security': { accent: '#ef4444', bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.2)' },
            };
            const colors = categoryColors[course.category] || categoryColors['AI & ML'];

            return (
              <div
                key={courseId}
                style={{
                  background: course.isInstructorCourse ? 'rgba(168,85,247,0.03)' : 'rgba(255,255,255,0.02)',
                  border: course.isInstructorCourse ? '1px solid rgba(168,85,247,0.25)' : '1px solid rgba(255,255,255,0.06)',
                  borderRadius: '18px',
                  overflow: 'hidden',
                  display: 'flex', flexDirection: 'column',
                  transition: 'all 0.3s ease',
                  cursor: 'default',
                  position: 'relative',
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.boxShadow = `0 20px 50px ${colors.accent}18`; e.currentTarget.style.borderColor = `${colors.accent}40`; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = course.isInstructorCourse ? 'rgba(168,85,247,0.25)' : 'rgba(255,255,255,0.06)'; }}
              >
                {/* Top accent gradient bar */}
                <div style={{ height: '3px', background: course.isInstructorCourse ? 'linear-gradient(90deg, #a855f7, #6366f1)' : `linear-gradient(90deg, ${colors.accent}, ${colors.accent}60)` }} />

                <div style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
                  {/* Header: badges + rating + bookmark */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                      <span className={`badge ${badgeClass}`} style={{ fontSize: '0.7rem' }}>{course.category}</span>
                      {course.isInstructorCourse ? (
                        <span style={{
                          background: 'rgba(168,85,247,0.15)',
                          color: '#d8b4fe',
                          border: '1px solid rgba(168,85,247,0.35)',
                          borderRadius: '6px', padding: '2px 8px', fontSize: '0.68rem', fontWeight: 700,
                          display: 'flex', alignItems: 'center', gap: '4px'
                        }}>
                          <ShieldCheck size={11} /> Instructor Course
                        </span>
                      ) : (
                        <span style={{
                          background: course.platform === 'Coursera' ? 'rgba(59,130,246,0.12)' : course.platform === 'edX' ? 'rgba(239,68,68,0.12)' : 'rgba(168,85,247,0.12)',
                          color: course.platform === 'Coursera' ? '#60a5fa' : course.platform === 'edX' ? '#fca5a5' : '#c084fc',
                          border: `1px solid ${course.platform === 'Coursera' ? 'rgba(59,130,246,0.25)' : course.platform === 'edX' ? 'rgba(239,68,68,0.25)' : 'rgba(168,85,247,0.25)'}`,
                          borderRadius: '6px', padding: '2px 8px', fontSize: '0.68rem', fontWeight: 700,
                        }}>
                          {course.platform}
                        </span>
                      )}
                      {isEnrolled && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '0.68rem', fontWeight: 700, color: '#4ade80', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)', borderRadius: '6px', padding: '2px 8px' }}>
                          <CheckCircle2 size={10} /> Enrolled
                        </span>
                      )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {course.rating && (
                        <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#fbbf24', display: 'flex', alignItems: 'center', gap: '3px' }}>
                          <Star size={12} fill="#fbbf24" color="#fbbf24" /> {course.rating.replace(' ⭐', '')}
                        </span>
                      )}
                      <button
                        onClick={(e) => { e.preventDefault(); toggleFavorite(courseId); }}
                        style={{
                          width: '30px', height: '30px', borderRadius: '8px', display: 'flex',
                          alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                          background: isFav ? 'rgba(251,191,36,0.12)' : 'rgba(255,255,255,0.03)',
                          border: isFav ? '1px solid rgba(251,191,36,0.3)' : '1px solid rgba(255,255,255,0.06)',
                          color: isFav ? '#fbbf24' : '#475569', transition: 'all 0.15s ease',
                        }}
                      >
                        <Star size={13} fill={isFav ? '#fbbf24' : 'none'} />
                      </button>
                    </div>
                  </div>

                  {/* Title */}
                  <h3 style={{ fontSize: '1.12rem', fontWeight: 800, color: '#e2e8f0', margin: 0, lineHeight: 1.3, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {course.title}
                  </h3>

                  {/* Description */}
                  <p style={{ fontSize: '0.82rem', color: '#64748b', margin: 0, lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {course.description}
                  </p>

                  {/* Skill tags */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                    {skillTags.slice(0, 4).map(tag => (
                      <span key={tag} style={{
                        fontSize: '0.68rem', fontWeight: 600, padding: '3px 9px', borderRadius: '6px',
                        background: `${colors.accent}10`, border: `1px solid ${colors.accent}20`,
                        color: `${colors.accent}cc`,
                      }}>
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Metadata row */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '6px', fontSize: '0.75rem', color: '#475569', marginTop: 'auto' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <User size={12} /> <span style={{ maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{course.instructor}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      {course.students && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '3px', color: '#818cf8' }}>
                          <Users size={11} /> {course.students}
                        </span>
                      )}
                      <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                        <Clock size={11} /> {course.duration}
                      </span>
                    </div>
                  </div>

                  {/* Progress bar for enrolled */}
                  {isEnrolled && (
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', marginBottom: '4px' }}>
                        <span style={{ color: '#64748b' }}>Progress</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <strong style={{ color: '#4ade80' }}>{progress}%</strong>
                          {progress < 100 && (
                            <button
                              onClick={(e) => { e.preventDefault(); handleQuickProgressBump(courseId, progress); }}
                              disabled={actionLoadingId === courseId}
                              style={{
                                padding: '1px 6px', borderRadius: '5px', fontSize: '0.65rem', fontWeight: 700,
                                background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)',
                                color: '#4ade80', cursor: 'pointer',
                              }}
                            >
                              +10%
                            </button>
                          )}
                        </div>
                      </div>
                      <div style={{ height: '5px', borderRadius: '3px', background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                        <div style={{ height: '100%', borderRadius: '3px', width: `${progress}%`, background: `linear-gradient(90deg, ${colors.accent}, #22c55e)`, transition: 'width 0.4s ease' }} />
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer actions */}
                <div style={{
                  padding: '14px 22px', borderTop: '1px solid rgba(255,255,255,0.04)',
                  display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(0,0,0,0.15)',
                }}>
                  <button
                    onClick={() => { setPreviewCourse(course); setPreviewTab('overview'); }}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      width: '36px', height: '36px', borderRadius: '10px',
                      background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                      color: '#94a3b8', cursor: 'pointer', transition: 'all 0.15s ease', flexShrink: 0,
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = `${colors.accent}15`; e.currentTarget.style.color = colors.accent; e.currentTarget.style.borderColor = `${colors.accent}40`; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = '#94a3b8'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }}
                    title="Preview course details"
                  >
                    <Eye size={15} />
                  </button>

                  {isEnrolled && (
                    <button
                      onClick={(e) => { e.preventDefault(); handleUnenrollCourse(courseId); }}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        width: '36px', height: '36px', borderRadius: '10px',
                        background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)',
                        color: '#fca5a5', cursor: 'pointer', transition: 'all 0.15s ease', flexShrink: 0,
                      }}
                      title="Unenroll"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}

                  {(course.courseUrl || course.udemyUrl) && (
                    <a
                      href={course.courseUrl || course.udemyUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        width: '36px', height: '36px', borderRadius: '10px',
                        background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                        color: course.platform === 'Coursera' ? '#60a5fa' : course.platform === 'edX' ? '#fca5a5' : '#c084fc',
                        textDecoration: 'none', transition: 'all 0.15s ease', flexShrink: 0,
                      }}
                      title={`View on ${course.platform}`}
                    >
                      <ExternalLink size={14} />
                    </a>
                  )}

                  <Link
                    to={`/courses/${courseId}`}
                    style={{
                      flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                      padding: '9px 16px', borderRadius: '10px', textDecoration: 'none',
                      background: course.isInstructorCourse ? 'linear-gradient(135deg, #a855f7, #6366f1)' : `linear-gradient(135deg, ${colors.accent}, ${colors.accent}cc)`,
                      color: '#fff', fontSize: '0.82rem', fontWeight: 700,
                      transition: 'all 0.2s ease',
                      boxShadow: `0 4px 15px ${colors.accent}30`,
                    }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = `0 6px 20px ${colors.accent}40`; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = `0 4px 15px ${colors.accent}30`; }}
                  >
                    <span>{isEnrolled ? 'Continue' : 'View & Enroll'}</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      );
    }

    if (viewMode === 'COMPACT') {
      return (
        <div className="courses-compact-view">
          {courseList.map((course) => {
            const courseId = course.id || course._id;
            const progress = userProgressMap[courseId];
            const isEnrolled = progress !== undefined;
            const isFav = favorites.includes(courseId);

            return (
              <div key={courseId} className="compact-course-card glass-card" style={course.isInstructorCourse ? { border: '1px solid rgba(168,85,247,0.3)', background: 'rgba(168,85,247,0.03)' } : {}}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span className={`badge ${getCategoryBadgeClass(course.category)}`} style={{ fontSize: '0.7rem' }}>
                      {course.category || 'AI'}
                    </span>
                    {course.isInstructorCourse && (
                      <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#d8b4fe', background: 'rgba(168,85,247,0.2)', padding: '2px 6px', borderRadius: '4px' }}>
                        Instructor
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    className={`bookmark-btn ${isFav ? 'bookmarked' : ''}`}
                    onClick={() => toggleFavorite(courseId)}
                    style={{ width: '26px', height: '26px' }}
                  >
                    <Star size={12} fill={isFav ? '#fcd34d' : 'none'} />
                  </button>
                </div>

                <div>
                  <h4 style={{ fontSize: '1rem', fontWeight: 700, margin: '4px 0' }}>{course.title}</h4>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{course.description}</p>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                  <span style={{ fontSize: '0.75rem', color: '#fcd34d', fontWeight: 600 }}>★ {course.rating || '4.8'}</span>
                  <Link to={`/courses/${courseId}`} className="btn btn-primary btn-sm">
                    <span>{isEnrolled ? 'Open' : 'Enroll'}</span>
                    <ArrowRight size={12} />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      );
    }

    // LIST view mode
    return (
      <div className="courses-list-view">
        {courseList.map((course) => {
          const courseId = course.id || course._id;
          const progress = userProgressMap[courseId];
          const isEnrolled = progress !== undefined;
          const badgeClass = getCategoryBadgeClass(course.category);

          return (
            <div key={courseId} className="glass-card course-list-item glass-card-hover" style={course.isInstructorCourse ? { border: '1px solid rgba(168,85,247,0.3)', background: 'rgba(168,85,247,0.03)' } : {}}>
              <div style={{ flex: 2, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className={`badge ${badgeClass}`}>{course.category || 'AI & ML'}</span>
                  {course.isInstructorCourse && (
                    <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#d8b4fe', background: 'rgba(168,85,247,0.2)', padding: '2px 8px', borderRadius: '4px', border: '1px solid rgba(168,85,247,0.3)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <ShieldCheck size={11} /> Instructor Course
                    </span>
                  )}
                  <span style={{ fontSize: '0.75rem', color: '#fcd34d', fontWeight: 600 }}>★ {course.rating}</span>
                  {isEnrolled && <span className="badge badge-success">Enrolled</span>}
                </div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>{course.title}</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{course.description}</p>
              </div>

              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px', minWidth: '160px' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
                  <User size={12} /> {course.instructor || 'Dr. IntelliLearn'}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
                  <Clock size={12} /> {course.duration || 'Self-paced'}
                </div>
                {isEnrolled && (
                  <div style={{ marginTop: '4px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                      <span>Progress</span>
                      <strong>{progress}%</strong>
                    </div>
                    <div className="progress-bar-container" style={{ height: '6px' }}>
                      <div className="progress-bar-fill" style={{ width: `${progress}%` }}></div>
                    </div>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => { setPreviewCourse(course); setPreviewTab('overview'); }}
                  className="btn btn-secondary btn-sm"
                  title="Quick preview syllabus"
                >
                  <Eye size={15} />
                </button>

                <Link to={`/courses/${courseId}`} className="btn btn-primary btn-sm">
                  <span>{isEnrolled ? 'Continue' : 'Enroll'}</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="dashboard-container animate-fade-in" style={{ position: 'relative' }}>

      {/* ═══ LIVE STUDY SESSION BANNER ═══ */}
      {timerRunning && (
        <div style={{
          marginBottom: '16px', padding: '14px 24px', borderRadius: '16px',
          background: 'linear-gradient(135deg, rgba(16,185,129,0.12) 0%, rgba(99,102,241,0.12) 100%)',
          border: '1px solid rgba(16,185,129,0.35)',
          boxShadow: '0 0 30px rgba(16,185,129,0.15), inset 0 1px 0 rgba(255,255,255,0.05)',
          backdropFilter: 'blur(16px)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          flexWrap: 'wrap', gap: '12px',
          animation: 'dashFadeSlideIn 0.4s ease',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ef4444', boxShadow: '0 0 12px #ef4444', display: 'inline-block', animation: 'dashPulse 1.5s ease-in-out infinite' }} />
              <Clock size={17} color="#6ee7b7" />
              <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#d1d5db', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Study Session:
              </span>
            </div>
            <span style={{
              fontSize: '1.5rem', fontWeight: 900, fontFamily: "'JetBrains Mono', monospace",
              color: '#6ee7b7', background: 'rgba(0,0,0,0.3)', padding: '4px 16px',
              borderRadius: '10px', border: '1px solid rgba(16,185,129,0.3)',
              letterSpacing: '0.05em',
            }}>
              {formatTimer(elapsedSeconds)}
            </span>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => setTimerRunning(false)}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 14px',
                borderRadius: '10px', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer',
                background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)',
                color: '#fca5a5', transition: 'all 0.15s ease',
              }}
            >
              <Pause size={13} /> Pause
            </button>
            <button
              onClick={() => setShowTimeAnalyticsModal(true)}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 14px',
                borderRadius: '10px', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer',
                background: 'rgba(168,85,247,0.12)', border: '1px solid rgba(168,85,247,0.3)',
                color: '#c084fc', transition: 'all 0.15s ease',
              }}
            >
              <PieChart size={13} /> Analytics
            </button>
          </div>
        </div>
      )}

      {/* ═══ HERO SECTION ═══ */}
      <div style={{
        position: 'relative', borderRadius: '24px', overflow: 'hidden',
        background: 'linear-gradient(160deg, rgba(11,15,25,0.98) 0%, rgba(15,23,42,0.95) 40%, rgba(30,27,75,0.4) 100%)',
        border: '1px solid rgba(99,102,241,0.15)',
        boxShadow: '0 4px 60px rgba(0,0,0,0.4)',
        marginBottom: '20px',
      }}>
        {/* Animated mesh background */}
        <div style={{
          position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none',
        }}>
          <div style={{
            position: 'absolute', width: '500px', height: '500px', borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)',
            top: '-200px', right: '-100px', animation: 'dashFloat1 8s ease-in-out infinite',
          }} />
          <div style={{
            position: 'absolute', width: '400px', height: '400px', borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(6,182,212,0.06) 0%, transparent 70%)',
            bottom: '-150px', left: '-80px', animation: 'dashFloat2 10s ease-in-out infinite',
          }} />
          <div style={{
            position: 'absolute', width: '250px', height: '250px', borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(168,85,247,0.07) 0%, transparent 70%)',
            top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
            animation: 'dashFloat3 12s ease-in-out infinite',
          }} />
          {/* Grid lines overlay */}
          <div style={{
            position: 'absolute', inset: 0,
            backgroundImage: 'linear-gradient(rgba(99,102,241,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.03) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }} />
        </div>

        <div style={{ position: 'relative', zIndex: 1, padding: '32px 36px 28px' }}>
          {/* Top badges row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '20px' }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.25)',
              padding: '6px 16px', borderRadius: '20px', fontSize: '0.78rem',
              color: '#a5b4fc', fontWeight: 700, backdropFilter: 'blur(8px)',
              animation: 'dashFadeSlideIn 0.5s ease',
            }}>
              <Sparkles size={14} color="#818cf8" /> AI Learning Hub & Assistant
            </div>
            {/* Top pill */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              background: 'rgba(99,102,241,0.08)', backdropFilter: 'blur(12px)',
              border: '1px solid rgba(99,102,241,0.2)', padding: '6px 14px', borderRadius: '12px',
              animation: 'dashFadeSlideIn 0.6s ease',
            }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 8px #22c55e', animation: 'dashPulse 2s ease-in-out infinite' }} />
              <span style={{ fontSize: '0.78rem', color: '#e2e8f0', fontWeight: 700 }}>AI Tutor Live</span>
              <span style={{
                fontSize: '0.68rem', color: '#a5b4fc',
                background: 'rgba(255,255,255,0.05)', padding: '2px 8px', borderRadius: '6px', fontWeight: 600
              }}>
                Powered by AI
              </span>
            </div>
          </div>

          {/* Greeting */}
          <h1 style={{
            fontSize: 'clamp(1.8rem, 4vw, 2.6rem)', fontWeight: 900, margin: '0 0 8px 0',
            letterSpacing: '-0.03em', lineHeight: 1.15,
            background: 'linear-gradient(135deg, #e2e8f0 0%, #a5b4fc 40%, #c084fc 70%, #22d3ee 100%)',
            backgroundSize: '200% 200%',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            animation: 'dashGradientShift 6s ease infinite',
          }}>
            {timeGreeting.text}, {displayUsername}! {timeGreeting.emoji}
          </h1>

          <p style={{
            maxWidth: '640px', color: '#64748b', fontSize: '0.92rem',
            margin: '0 0 24px 0', lineHeight: 1.6,
            animation: 'dashFadeSlideIn 0.7s ease',
          }}>
            Master cutting-edge AI technologies, prompt your AI tutor, track real-time progress, and earn verified skill credentials.
          </p>

          {/* ── AI COMMAND TERMINAL (REAL AI CHATBOT) ── */}
          <div style={{
            background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(20px)',
            border: '1px solid rgba(99,102,241,0.25)', borderRadius: '20px',
            padding: '20px 24px',
            boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.5), inset 0 1px 1px rgba(255,255,255,0.05)',
            animation: 'dashFadeSlideIn 0.8s ease',
          }}>
            {/* Terminal header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '36px', height: '36px', borderRadius: '12px',
                  background: 'linear-gradient(135deg, #6366f1, #06b6d4)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 4px 15px rgba(99,102,241,0.4)',
                }}>
                  <Bot size={20} color="#fff" />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '0.95rem', fontWeight: 800, color: '#f8fafc', letterSpacing: '-0.01em' }}>AI Command Terminal</span>
                    <span style={{
                      fontSize: '0.68rem', padding: '2px 8px', borderRadius: '20px',
                      background: 'rgba(34,197,94,0.15)', color: '#4ade80',
                      border: '1px solid rgba(34,197,94,0.3)',
                      fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px'
                    }}>
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22c55e' }} />
                      Live AI Assistant
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#ef4444' }} />
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#f59e0b' }} />
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22c55e' }} />
                  </div>
                </div>
              </div>

              {/* Terminal Action Buttons */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {terminalChat.length > 1 && (
                  <button
                    onClick={handleClearTerminalChat}
                    title="Clear Terminal Chat"
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      width: '32px', height: '32px', borderRadius: '10px',
                      background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                      color: '#94a3b8', cursor: 'pointer', transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.2)'; e.currentTarget.style.color = '#ef4444'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = '#94a3b8'; }}
                  >
                    <Trash2 size={13} />
                  </button>
                )}
              </div>
            </div>

            {/* Chat Messages Stream */}
            <div style={{
              maxHeight: '320px', overflowY: 'auto', paddingRight: '6px',
              display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '16px',
              scrollBehavior: 'smooth'
            }}>
              {terminalChat.map((msg, index) => (
                <div
                  key={index}
                  style={{
                    display: 'flex',
                    flexDirection: msg.sender === 'user' ? 'row-reverse' : 'row',
                    gap: '12px', alignItems: 'flex-start'
                  }}
                >
                  {msg.sender === 'ai' && (
                    <div style={{
                      width: '30px', height: '30px', borderRadius: '10px',
                      background: 'linear-gradient(135deg, #6366f1, #3b82f6)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0, marginTop: '2px'
                    }}>
                      <Bot size={15} color="#fff" />
                    </div>
                  )}

                  <div style={{
                    maxWidth: '82%',
                    background: msg.sender === 'user'
                      ? 'linear-gradient(135deg, #6366f1, #8b5cf6)'
                      : 'rgba(30, 41, 59, 0.75)',
                    border: msg.sender === 'user' ? 'none' : '1px solid rgba(255,255,255,0.08)',
                    borderRadius: msg.sender === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                    padding: '12px 16px', color: '#f1f5f9', fontSize: '0.86rem', lineHeight: 1.6,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)', position: 'relative'
                  }}>
                    <div style={{ wordBreak: 'break-word' }}>
                      {msg.sender === 'ai' ? renderMarkdown(msg.text) : msg.text}
                    </div>

                    {/* Sources / Metadata tags */}
                    {msg.sender === 'ai' && (
                      <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '6px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                          {msg.sources && msg.sources.map((src, idx) => (
                            <span key={idx} style={{
                              fontSize: '0.68rem', padding: '2px 8px', borderRadius: '6px',
                              background: 'rgba(99,102,241,0.15)', color: '#a5b4fc',
                              border: '1px solid rgba(99,102,241,0.2)', fontWeight: 600
                            }}>
                              📌 {src}
                            </span>
                          ))}
                        </div>
                        
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: 'auto' }}>
                          <button
                            onClick={() => copyMessageToClipboard(msg.text, index)}
                            title="Copy answer"
                            style={{
                              background: 'none', border: 'none', color: copiedMsgIndex === index ? '#22c55e' : '#64748b',
                              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.72rem'
                            }}
                          >
                            {copiedMsgIndex === index ? <Check size={12} /> : <Copy size={12} />}
                            {copiedMsgIndex === index ? 'Copied' : 'Copy'}
                          </button>
                          <span style={{ fontSize: '0.68rem', color: '#64748b' }}>{msg.time}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {aiSandboxLoading && (
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <div style={{
                    width: '30px', height: '30px', borderRadius: '10px',
                    background: 'linear-gradient(135deg, #6366f1, #3b82f6)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    <Bot size={15} color="#fff" />
                  </div>
                  <div style={{
                    background: 'rgba(30, 41, 59, 0.75)', border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '16px 16px 16px 4px', padding: '12px 18px',
                    display: 'flex', alignItems: 'center', gap: '8px', color: '#a5b4fc', fontSize: '0.84rem'
                  }}>
                    <span className="spinner"></span> AI is thinking...
                  </div>
                </div>
              )}
            </div>

            {/* Quick prompt chips */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '14px' }}>
              {[
                { label: 'Recommend Course', icon: Target, color: '#6366f1', prompt: 'Recommend a personalized course for my learning & career goals' },
                { label: 'In-Demand Skills', icon: Zap, color: '#f59e0b', prompt: 'What AI, Spring Boot & Cloud skills are in highest demand for 2026?' },
                { label: 'My Roadmap', icon: Flame, color: '#ef4444', prompt: 'Show my learning roadmap and recommended next steps for full stack & AI' },
                { label: 'Explain Microservices', icon: HelpCircle, color: '#06b6d4', prompt: 'Explain how Microservices API Gateway routing and rate limiting work' },
                { label: 'Spring Boot + React', icon: Code, color: '#10b981', prompt: 'How do Spring Boot REST APIs communicate with React frontend applications?' },
                { label: 'Java OOP Pillars', icon: BookOpen, color: '#a855f7', prompt: 'Explain the 4 pillars of Object-Oriented Programming with Java examples' },
              ].map((chip, i) => (
                <button
                  key={i}
                  onClick={() => handleAiSandboxPrompt(chip.prompt)}
                  disabled={aiSandboxLoading}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    padding: '6px 12px', borderRadius: '10px',
                    background: `${chip.color}12`, border: `1px solid ${chip.color}30`,
                    color: chip.color, fontSize: '0.78rem', fontWeight: 700,
                    cursor: 'pointer', transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = `${chip.color}25`; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = `${chip.color}12`; e.currentTarget.style.transform = 'translateY(0)'; }}
                >
                  <chip.icon size={13} /> {chip.label}
                </button>
              ))}
            </div>

            {/* Input bar */}
            <div style={{ display: 'flex', gap: '8px' }}>
              <div style={{ flex: 1, position: 'relative' }}>
                <input
                  type="text"
                  placeholder="Ask AI tutor anything about courses, skills, Spring Boot, React, microservices..."
                  value={aiSandboxPrompt}
                  onChange={(e) => setAiSandboxPrompt(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAiSandboxPrompt()}
                  style={{
                    width: '100%', padding: '12px 40px 12px 16px', borderRadius: '12px',
                    background: 'rgba(0,0,0,0.35)', border: '1px solid rgba(255,255,255,0.1)',
                    color: '#e2e8f0', fontSize: '0.88rem', fontWeight: 500,
                    outline: 'none', transition: 'all 0.2s ease', boxSizing: 'border-box',
                  }}
                  onFocus={e => { e.target.style.borderColor = 'rgba(99,102,241,0.5)'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.1)'; }}
                  onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; e.target.style.boxShadow = 'none'; }}
                />
                {aiSandboxPrompt && (
                  <button
                    onClick={() => setAiSandboxPrompt('')}
                    style={{
                      position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)',
                      background: 'none', border: 'none', color: '#475569', cursor: 'pointer',
                      display: 'flex', padding: '4px',
                    }}
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
              <button
                onClick={() => handleAiSandboxPrompt()}
                disabled={aiSandboxLoading || !aiSandboxPrompt.trim()}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  width: '48px', height: '48px', borderRadius: '12px',
                  background: (!aiSandboxPrompt.trim() || aiSandboxLoading)
                    ? 'rgba(99,102,241,0.3)'
                    : 'linear-gradient(135deg, #6366f1, #a855f7)',
                  border: 'none', color: '#fff', cursor: (!aiSandboxPrompt.trim() || aiSandboxLoading) ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease', flexShrink: 0,
                  boxShadow: '0 4px 20px rgba(99,102,241,0.3)',
                }}
                onMouseEnter={e => { if (aiSandboxPrompt.trim()) { e.currentTarget.style.transform = 'scale(1.05)'; } }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
              >
                {aiSandboxLoading ? <span className="spinner"></span> : <Send size={17} />}
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* ═══ CONTINUE LEARNING BANNER ═══ */}
      {enrolledCoursesList.length > 0 && (
        <div style={{ marginBottom: '20px', animation: 'dashFadeSlideIn 0.9s ease' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px', color: '#e2e8f0', margin: 0 }}>
              <PlayCircle size={18} color="#22c55e" /> Continue Learning
            </h3>
            <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>
              {enrolledCoursesList.length} Active {enrolledCoursesList.length === 1 ? 'Course' : 'Courses'}
            </span>
          </div>

          <div style={{
            padding: '18px 24px', borderRadius: '16px',
            background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
            display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap',
            transition: 'all 0.2s ease',
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(34,197,94,0.25)'; e.currentTarget.style.background = 'rgba(34,197,94,0.03)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; }}
          >
            <div style={{
              width: '48px', height: '48px', borderRadius: '14px', flexShrink: 0,
              background: 'linear-gradient(135deg, rgba(34,197,94,0.15), rgba(6,182,212,0.15))',
              border: '1px solid rgba(34,197,94,0.25)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <GraduationCap size={22} color="#6ee7b7" />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1, minWidth: '200px' }}>
              <span className={`badge ${getCategoryBadgeClass(enrolledCoursesList[0].category)}`} style={{ width: 'fit-content', fontSize: '0.68rem' }}>
                {enrolledCoursesList[0].category || 'In Progress'}
              </span>
              <h4 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, color: '#e2e8f0' }}>{enrolledCoursesList[0].title}</h4>
            </div>

            <div style={{ flex: 1, minWidth: '180px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem' }}>
                <span style={{ color: '#64748b' }}>Progress</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <strong style={{ color: '#6ee7b7' }}>{userProgressMap[enrolledCoursesList[0].id || enrolledCoursesList[0]._id] || 0}%</strong>
                  {(userProgressMap[enrolledCoursesList[0].id || enrolledCoursesList[0]._id] || 0) < 100 && (
                    <button
                      onClick={() => handleQuickProgressBump(enrolledCoursesList[0].id || enrolledCoursesList[0]._id, userProgressMap[enrolledCoursesList[0].id || enrolledCoursesList[0]._id])}
                      disabled={actionLoadingId === (enrolledCoursesList[0].id || enrolledCoursesList[0]._id)}
                      style={{
                        padding: '2px 8px', borderRadius: '6px', fontSize: '0.68rem', fontWeight: 700,
                        background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)',
                        color: '#6ee7b7', cursor: 'pointer',
                      }}
                    >
                      +10%
                    </button>
                  )}
                </div>
              </div>
              <div className="progress-bar-container" style={{ height: '6px' }}>
                <div className="progress-bar-fill" style={{ width: `${userProgressMap[enrolledCoursesList[0].id || enrolledCoursesList[0]._id] || 0}%`, background: 'linear-gradient(90deg, #22c55e, #06b6d4)' }}></div>
              </div>
            </div>

            <Link to={`/courses/${enrolledCoursesList[0].id || enrolledCoursesList[0]._id}`} style={{
              display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px',
              borderRadius: '12px', background: 'linear-gradient(135deg, #6366f1, #a855f7)',
              color: '#fff', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 700,
              flexShrink: 0, transition: 'all 0.2s ease',
              boxShadow: '0 4px 15px rgba(99,102,241,0.3)',
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 25px rgba(99,102,241,0.4)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 15px rgba(99,102,241,0.3)'; }}
            >
              Resume <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      )}

      {/* ═══ STATS CARDS ═══ */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '14px', marginBottom: '24px',
      }}>
        {/* Available Courses */}
        <button
          onClick={() => { setSelectedCategory('ALL'); setSearchTerm(''); setSortBy('RECOMMENDED'); addToast('Showing all courses', 'info', 'Catalog'); }}
          style={{
            display: 'flex', alignItems: 'center', gap: '14px',
            padding: '18px 20px', borderRadius: '16px', cursor: 'pointer',
            background: selectedCategory === 'ALL' && sortBy !== 'PROGRESS' ? 'rgba(99,102,241,0.1)' : 'rgba(255,255,255,0.02)',
            border: selectedCategory === 'ALL' && sortBy !== 'PROGRESS' ? '1px solid rgba(99,102,241,0.35)' : '1px solid rgba(255,255,255,0.06)',
            transition: 'all 0.25s ease', textAlign: 'left',
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 30px rgba(99,102,241,0.15)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
        >
          <div style={{
            width: '46px', height: '46px', borderRadius: '14px', flexShrink: 0,
            background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <BookOpen size={22} color="#818cf8" />
          </div>
          <div>
            <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#e2e8f0', lineHeight: 1 }}>{courses.length}</div>
            <div style={{ fontSize: '0.72rem', fontWeight: 600, color: '#64748b', marginTop: '2px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Available Courses</div>
          </div>
        </button>

        {/* Enrolled */}
        <button
          onClick={() => {
            setSelectedCategory('ENROLLED'); setSearchTerm('');
            addToast(enrolledCount > 0 ? `Filtered to ${enrolledCount} enrolled courses` : 'No enrolled courses yet!', enrolledCount > 0 ? 'info' : 'warning', 'Enrollments');
          }}
          style={{
            display: 'flex', alignItems: 'center', gap: '14px',
            padding: '18px 20px', borderRadius: '16px', cursor: 'pointer',
            background: selectedCategory === 'ENROLLED' ? 'rgba(6,182,212,0.1)' : 'rgba(255,255,255,0.02)',
            border: selectedCategory === 'ENROLLED' ? '1px solid rgba(6,182,212,0.35)' : '1px solid rgba(255,255,255,0.06)',
            transition: 'all 0.25s ease', textAlign: 'left',
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 30px rgba(6,182,212,0.15)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
        >
          <div style={{
            width: '46px', height: '46px', borderRadius: '14px', flexShrink: 0,
            background: 'rgba(6,182,212,0.12)', border: '1px solid rgba(6,182,212,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <GraduationCap size={22} color="#22d3ee" />
          </div>
          <div>
            <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#e2e8f0', lineHeight: 1 }}>{enrolledCount}</div>
            <div style={{ fontSize: '0.72rem', fontWeight: 600, color: '#64748b', marginTop: '2px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Enrolled Courses</div>
          </div>
        </button>

        {/* Progress */}
        <button
          onClick={() => { setSortBy('PROGRESS'); setSelectedCategory('ALL'); setSearchTerm(''); addToast('Sorted by progress', 'success', 'Progress Sort'); }}
          style={{
            display: 'flex', alignItems: 'center', gap: '14px',
            padding: '18px 20px', borderRadius: '16px', cursor: 'pointer',
            background: sortBy === 'PROGRESS' ? 'rgba(16,185,129,0.1)' : 'rgba(255,255,255,0.02)',
            border: sortBy === 'PROGRESS' ? '1px solid rgba(16,185,129,0.35)' : '1px solid rgba(255,255,255,0.06)',
            transition: 'all 0.25s ease', textAlign: 'left',
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 30px rgba(16,185,129,0.15)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
        >
          <div style={{
            width: '46px', height: '46px', borderRadius: '14px', flexShrink: 0,
            background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <TrendingUp size={22} color="#6ee7b7" />
          </div>
          <div>
            <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#e2e8f0', lineHeight: 1 }}>{avgProgress}%</div>
            <div style={{ fontSize: '0.72rem', fontWeight: 600, color: '#64748b', marginTop: '2px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Avg Progress</div>
          </div>
        </button>

        {/* Streak */}
        <button
          onClick={handleStreakCheckIn}
          style={{
            display: 'flex', alignItems: 'center', gap: '14px',
            padding: '18px 20px', borderRadius: '16px', cursor: 'pointer',
            background: streakCheckedIn ? 'rgba(245,158,11,0.1)' : 'rgba(255,255,255,0.02)',
            border: streakCheckedIn ? '1px solid rgba(245,158,11,0.35)' : '1px solid rgba(255,255,255,0.06)',
            transition: 'all 0.25s ease', textAlign: 'left',
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 30px rgba(245,158,11,0.15)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
        >
          <div style={{
            width: '46px', height: '46px', borderRadius: '14px', flexShrink: 0,
            background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Flame size={22} color="#fbbf24" />
          </div>
          <div>
            <div style={{ fontSize: '1.15rem', fontWeight: 900, color: '#fbbf24', lineHeight: 1 }}>
              {streakCheckedIn ? '3-Day 🔥' : 'Claim Streak'}
            </div>
            <div style={{ fontSize: '0.72rem', fontWeight: 600, color: '#64748b', marginTop: '2px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{userXp} XP Points</div>
          </div>
        </button>

        {/* Weekly Goal */}
        <button
          onClick={() => setShowTimeAnalyticsModal(true)}
          style={{
            display: 'flex', alignItems: 'center', gap: '14px',
            padding: '18px 20px', borderRadius: '16px', cursor: 'pointer',
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(168,85,247,0.2)',
            transition: 'all 0.25s ease', textAlign: 'left',
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 30px rgba(168,85,247,0.15)'; e.currentTarget.style.borderColor = 'rgba(168,85,247,0.4)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = 'rgba(168,85,247,0.2)'; }}
        >
          <div style={{
            width: '46px', height: '46px', borderRadius: '14px', flexShrink: 0,
            background: 'rgba(168,85,247,0.12)', border: '1px solid rgba(168,85,247,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <PieChart size={22} color="#c084fc" />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '1.1rem', fontWeight: 900, color: '#e2e8f0', lineHeight: 1 }}>{loggedHours}h / {targetHours}h</span>
              <span
                onClick={(e) => { e.stopPropagation(); handleLogStudyTime(); }}
                style={{
                  padding: '2px 8px', borderRadius: '6px', fontSize: '0.68rem', fontWeight: 700,
                  background: 'rgba(168,85,247,0.15)', border: '1px solid rgba(168,85,247,0.3)',
                  color: '#c084fc', cursor: 'pointer',
                }}
              >
                +30m
              </span>
            </div>
            <div style={{ fontSize: '0.72rem', fontWeight: 600, color: '#64748b', marginTop: '4px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Weekly Goal</div>
            <div style={{ height: '4px', borderRadius: '2px', background: 'rgba(255,255,255,0.06)', marginTop: '6px', overflow: 'hidden' }}>
              <div style={{ height: '100%', borderRadius: '2px', width: `${Math.min(100, (loggedHours / targetHours) * 100)}%`, background: 'linear-gradient(90deg, #a855f7, #6366f1)', transition: 'width 0.5s ease' }} />
            </div>
          </div>
        </button>
      </div>

      {/* Inline keyframes for dashboard hero */}
      <style>{`
        @keyframes dashFloat1 {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(-30px, 20px); }
        }
        @keyframes dashFloat2 {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(25px, -15px); }
        }
        @keyframes dashFloat3 {
          0%, 100% { transform: translate(-50%, -50%) scale(1); }
          50% { transform: translate(-50%, -50%) scale(1.2); }
        }
        @keyframes dashGradientShift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        @keyframes dashFadeSlideIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes dashPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>

      {/* 4. SEARCH, FILTER & LAYOUT CONTROL TOOLBAR */}
      <div className="search-filter-container">
        <div style={{ display: 'flex', gap: '12px', width: '100%', flexWrap: 'wrap', alignItems: 'center' }}>
          <div className="search-input-wrapper" style={{ flex: 1, minWidth: '240px' }}>
            <Search size={18} className="search-icon-pos" />
            <input
              type="text"
              className="form-control search-input"
              placeholder="Search by title, AI model, instructor, or skill tag..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Sort Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <SlidersHorizontal size={16} color="var(--text-dim)" />
            <select
              className="form-control"
              style={{ width: 'auto', padding: '0.65rem 2rem 0.65rem 0.85rem', fontSize: '0.85rem' }}
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="RECOMMENDED">Sort: Recommended</option>
              <option value="RATING">Sort: Top Rated ★</option>
              <option value="TITLE">Sort: Title (A-Z)</option>
              <option value="PROGRESS">Sort: Highest Progress</option>
            </select>
          </div>

          {/* View Mode Toggle: Grid vs List vs Compact */}
          <div className="view-mode-toggle">
            <button
              type="button"
              className={`view-btn ${viewMode === 'GRID' ? 'active' : ''}`}
              onClick={() => setViewMode('GRID')}
              title="Grid Cards View"
            >
              <LayoutGrid size={16} />
            </button>
            <button
              type="button"
              className={`view-btn ${viewMode === 'COMPACT' ? 'active' : ''}`}
              onClick={() => setViewMode('COMPACT')}
              title="Compact View"
            >
              <Grid2x2 size={16} />
            </button>
            <button
              type="button"
              className={`view-btn ${viewMode === 'LIST' ? 'active' : ''}`}
              onClick={() => setViewMode('LIST')}
              title="List View"
            >
              <List size={16} />
            </button>
          </div>
        </div>

        {/* Category Pills Row */}
        <div className="category-pills-row">
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: 'var(--text-dim)', marginRight: '4px' }}>
            <Filter size={14} /> Filter:
          </div>

          <button
            type="button"
            className={`category-pill ${selectedCategory === 'ALL' ? 'active' : ''}`}
            onClick={() => setSelectedCategory('ALL')}
          >
            All ({courses.length})
          </button>

          <button
            type="button"
            className={`category-pill ${selectedCategory === 'COURSERA' ? 'active' : ''}`}
            onClick={() => setSelectedCategory('COURSERA')}
            style={selectedCategory === 'COURSERA' ? {} : { color: '#60a5fa', borderColor: 'rgba(0, 86, 210, 0.4)' }}
          >
            <Globe size={12} /> Coursera ({courseraCount})
          </button>

          <button
            type="button"
            className={`category-pill ${selectedCategory === 'UDEMY' ? 'active' : ''}`}
            onClick={() => setSelectedCategory('UDEMY')}
            style={selectedCategory === 'UDEMY' ? {} : { color: '#d1a8ff', borderColor: 'rgba(164, 53, 240, 0.4)' }}
          >
            <BookOpen size={12} /> Udemy ({udemyCount})
          </button>

          <button
            type="button"
            className={`category-pill ${selectedCategory === 'EDX' ? 'active' : ''}`}
            onClick={() => setSelectedCategory('EDX')}
            style={selectedCategory === 'EDX' ? {} : { color: '#fca5a5', borderColor: 'rgba(185, 28, 28, 0.4)' }}
          >
            <Sparkles size={12} /> edX ({edxCount})
          </button>

          <button
            type="button"
            className={`category-pill ${selectedCategory === 'ENROLLED' ? 'active' : ''}`}
            onClick={() => setSelectedCategory('ENROLLED')}
            style={enrolledCount > 0 && selectedCategory !== 'ENROLLED' ? { borderColor: 'rgba(16, 185, 129, 0.4)', color: '#6ee7b7' } : {}}
          >
            🎓 Enrolled ({enrolledCount})
          </button>

          {favorites.length > 0 && (
            <button
              type="button"
              className={`category-pill ${selectedCategory === 'FAVORITES' ? 'active' : ''}`}
              onClick={() => setSelectedCategory('FAVORITES')}
              style={{ color: '#fcd34d' }}
            >
              ★ Bookmarks ({favorites.length})
            </button>
          )}

          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              className={`category-pill ${selectedCategory === cat ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* ERROR ALERT */}
      {error && (
        <div className="alert alert-info">
          <AlertCircle size={18} style={{ flexShrink: 0 }} />
          <span>{error} Showing offline interactive catalog.</span>
        </div>
      )}

      {/* LOADING SKELETON */}
      {loading && <CourseGridSkeleton count={6} />}

      {/* EMPTY STATE */}
      {!loading && filteredCourses.length === 0 && (
        <div className="state-card glass-card">
          <div className="state-icon-wrapper">
            <BookOpen size={32} />
          </div>
          <h3>No Courses Match Your Filter</h3>
          <p>Try searching for a different keyword or resetting your filter criteria.</p>
          <button
            type="button"
            onClick={() => { setSearchTerm(''); setSelectedCategory('ALL'); }}
            className="btn btn-secondary btn-sm"
            style={{ marginTop: '8px' }}
          >
            Reset All Filters
          </button>
        </div>
      )}

      {/* ═══ 1. TOP SECTION: INSTRUCTOR-LED COURSES ═══ */}
      {!loading && filteredInstructorCourses.length > 0 && (
        <div style={{ marginBottom: '36px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                padding: '8px 12px', borderRadius: '12px',
                background: 'rgba(168,85,247,0.12)', border: '1px solid rgba(168,85,247,0.3)',
                color: '#c084fc', display: 'flex', alignItems: 'center', gap: '6px'
              }}>
                <ShieldCheck size={18} />
                <span style={{ fontSize: '0.85rem', fontWeight: 800 }}>Platform Exclusive</span>
              </div>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 800, color: '#e2e8f0' }}>Instructor-Led Courses</h2>
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Custom courses published directly by IntelliLearn instructors</span>
              </div>
            </div>
            <span className="badge" style={{ background: 'rgba(168,85,247,0.18)', color: '#d8b4fe', border: '1px solid rgba(168,85,247,0.35)', padding: '4px 12px', fontSize: '0.78rem', fontWeight: 700 }}>
              {filteredInstructorCourses.length} Instructor Course{filteredInstructorCourses.length !== 1 ? 's' : ''}
            </span>
          </div>
          {renderCourseGrid(filteredInstructorCourses)}
        </div>
      )}

      {/* ═══ 2. MIDDLE SECTION: INSTRUCTOR ASSESSMENTS & QUIZZES ═══ */}
      {!loading && quizzes.length > 0 && (
        <div style={{ marginBottom: '36px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                padding: '8px 12px', borderRadius: '12px',
                background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.3)',
                color: '#818cf8', display: 'flex', alignItems: 'center', gap: '6px'
              }}>
                <Award size={18} />
                <span style={{ fontSize: '0.85rem', fontWeight: 800 }}>Skill Evaluation</span>
              </div>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 800, color: '#e2e8f0' }}>Instructor Assessments & Quizzes</h2>
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Test your skills with custom quizzes created by platform instructors</span>
              </div>
            </div>
            <span className="badge" style={{ background: 'rgba(99,102,241,0.18)', color: '#a5b4fc', border: '1px solid rgba(99,102,241,0.35)', padding: '4px 12px', fontSize: '0.78rem', fontWeight: 700 }}>
              {quizzes.length} Available Quiz{quizzes.length !== 1 ? 'zes' : ''}
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
            {quizzes.map((quiz) => (
              <div
                key={quiz.id}
                style={{
                  background: 'rgba(99,102,241,0.03)',
                  border: '1px solid rgba(99,102,241,0.2)',
                  borderRadius: '16px',
                  padding: '20px',
                  display: 'flex', flexDirection: 'column', gap: '12px',
                  transition: 'all 0.25s ease',
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.borderColor = 'rgba(99,102,241,0.45)'; e.currentTarget.style.boxShadow = '0 12px 30px rgba(99,102,241,0.15)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'rgba(99,102,241,0.2)'; e.currentTarget.style.boxShadow = 'none'; }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#a5b4fc', background: 'rgba(99,102,241,0.15)', padding: '3px 10px', borderRadius: '6px', border: '1px solid rgba(99,102,241,0.3)' }}>
                    Instructor Quiz
                  </span>
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <HelpCircle size={13} /> {quiz.questions?.length || 0} Questions
                  </span>
                </div>

                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#e2e8f0', margin: 0 }}>
                  {quiz.title}
                </h3>

                <p style={{ fontSize: '0.82rem', color: '#64748b', margin: 0, lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {quiz.description || 'No description provided.'}
                </p>

                <button
                  onClick={() => handleStartQuiz(quiz)}
                  style={{
                    marginTop: 'auto',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                    padding: '10px 16px', borderRadius: '10px',
                    background: 'linear-gradient(135deg, #6366f1, #818cf8)',
                    color: '#fff', border: 'none', fontSize: '0.85rem', fontWeight: 700,
                    cursor: 'pointer', transition: 'all 0.2s ease',
                    boxShadow: '0 4px 15px rgba(99,102,241,0.3)',
                  }}
                >
                  <Award size={15} /> Start Assessment
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ═══ 3. BOTTOM SECTION: REAL-TIME ONLINE CATALOG ═══ */}
      {!loading && filteredCuratedCourses.length > 0 && (
        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                padding: '8px 12px', borderRadius: '12px',
                background: 'rgba(6,182,212,0.12)', border: '1px solid rgba(6,182,212,0.3)',
                color: '#67e8f9', display: 'flex', alignItems: 'center', gap: '6px'
              }}>
                <Globe size={18} />
                <span style={{ fontSize: '0.85rem', fontWeight: 800 }}>External Catalog</span>
              </div>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 800, color: '#e2e8f0' }}>Real-Time Online Catalog</h2>
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Curated industry courses from Coursera, Udemy, and edX</span>
              </div>
            </div>
            <span className="badge badge-info" style={{ padding: '4px 12px', fontSize: '0.78rem' }}>
              {filteredCuratedCourses.length} Catalog Course{filteredCuratedCourses.length !== 1 ? 's' : ''}
            </span>
          </div>
          {renderCourseGrid(filteredCuratedCourses)}
        </div>
      )}

      {/* INTERACTIVE INSTRUCTOR QUIZ MODAL */}
      {activeQuizModal && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 999999,
            background: 'rgba(15,23,42,0.85)', backdropFilter: 'blur(8px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px',
            animation: 'dashFadeSlideIn 0.2s ease',
          }}
          onClick={() => setActiveQuizModal(null)}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              width: '100%', maxWidth: '680px', maxHeight: '85vh', overflow: 'auto',
              background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)',
              border: '1px solid rgba(99,102,241,0.3)',
              borderRadius: '24px', padding: '28px', color: '#f8fafc',
              boxShadow: '0 25px 60px rgba(0,0,0,0.7)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  padding: '8px 12px', borderRadius: '12px',
                  background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)',
                  color: '#818cf8', display: 'flex', alignItems: 'center', gap: '6px'
                }}>
                  <Award size={20} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#e2e8f0' }}>{activeQuizModal.quiz.title}</h3>
                  <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Instructor Assessment Module</span>
                </div>
              </div>
              <button
                onClick={() => setActiveQuizModal(null)}
                style={{
                  width: '32px', height: '32px', borderRadius: '8px',
                  background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                  color: '#94a3b8', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}
              >
                <X size={16} />
              </button>
            </div>

            {activeQuizModal.result ? (
              /* Result View */
              <div style={{ background: 'rgba(15, 23, 42, 0.8)', padding: '24px', borderRadius: '16px', border: '1px solid rgba(99,102,241,0.4)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '48px', height: '48px', borderRadius: '14px',
                      background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                      <Award size={26} color="#818cf8" />
                    </div>
                    <div>
                      <h4 style={{ margin: 0, color: '#f8fafc', fontSize: '1.15rem', fontWeight: 800 }}>Assessment Completed!</h4>
                      <span style={{ fontSize: '0.9rem', color: '#6ee7b7', fontWeight: 700 }}>Score: {activeQuizModal.result.score}%</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveQuizModal({ ...activeQuizModal, selectedAnswers: {}, result: null })}
                    style={{
                      padding: '8px 16px', background: 'rgba(99,102,241,0.2)', border: '1px solid rgba(99,102,241,0.4)',
                      color: '#a5b4fc', borderRadius: '10px', fontWeight: 700, cursor: 'pointer',
                      display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem'
                    }}
                  >
                    <RotateCcw size={14} /> Retake Assessment
                  </button>
                </div>

                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '14px 18px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)', marginBottom: '16px' }}>
                  <p style={{ color: '#e2e8f0', fontWeight: 700, margin: '0 0 6px 0', fontSize: '0.88rem' }}>AI Instructor Feedback:</p>
                  <p style={{ color: '#cbd5e1', fontSize: '0.85rem', margin: 0, lineHeight: 1.6 }}>{activeQuizModal.result.feedback}</p>
                </div>

                {activeQuizModal.result.recommendations?.length > 0 && (
                  <div>
                    <p style={{ color: '#e2e8f0', fontWeight: 700, fontSize: '0.85rem', marginBottom: '8px' }}>Recommended Study Topics:</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {activeQuizModal.result.recommendations.map((rec, idx) => (
                        <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', color: '#94a3b8' }}>
                          <ChevronRight size={13} color="#818cf8" /> {rec}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Questions Form */
              <form onSubmit={handleQuizSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {activeQuizModal.quiz.questions?.map((q, qIdx) => (
                  <div key={qIdx} style={{ background: 'rgba(255,255,255,0.02)', padding: '18px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <p style={{ color: '#f8fafc', fontWeight: 700, fontSize: '0.95rem', margin: '0 0 14px 0', lineHeight: 1.4 }}>
                      {qIdx + 1}. {q.text}
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {q.options?.map((opt, optIdx) => (
                        <label
                          key={optIdx}
                          style={{
                            display: 'flex', alignItems: 'center', gap: '12px',
                            padding: '12px 16px', borderRadius: '10px',
                            background: activeQuizModal.selectedAnswers[qIdx] === optIdx ? 'rgba(99, 102, 241, 0.18)' : 'rgba(255,255,255,0.02)',
                            border: activeQuizModal.selectedAnswers[qIdx] === optIdx ? '1px solid rgba(99, 102, 241, 0.45)' : '1px solid rgba(255,255,255,0.05)',
                            color: activeQuizModal.selectedAnswers[qIdx] === optIdx ? '#e2e8f0' : '#94a3b8',
                            cursor: 'pointer', fontSize: '0.88rem', transition: 'all 0.15s ease'
                          }}
                        >
                          <input
                            type="radio"
                            name={`modal_q_${qIdx}`}
                            checked={activeQuizModal.selectedAnswers[qIdx] === optIdx}
                            onChange={() => handleQuizOptionSelect(qIdx, optIdx)}
                            style={{ accentColor: '#6366f1' }}
                          />
                          <span>{opt}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
                <button
                  type="submit"
                  disabled={activeQuizModal.submitting}
                  style={{
                    padding: '12px 24px', background: 'linear-gradient(135deg, #6366f1, #a855f7)',
                    color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 700,
                    fontSize: '0.92rem', cursor: activeQuizModal.submitting ? 'not-allowed' : 'pointer',
                    alignSelf: 'flex-start', boxShadow: '0 4px 20px rgba(99,102,241,0.3)'
                  }}
                >
                  {activeQuizModal.submitting ? 'Submitting Assessment...' : 'Submit Assessment'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* COURSE DETAILS MODAL */}
      {previewCourse && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 999999,
            background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '16px', animation: 'dashFadeSlideIn 0.2s ease',
          }}
          onClick={() => setPreviewCourse(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: '720px', width: '100%', maxHeight: '85vh', overflow: 'auto',
              background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)',
              border: '1px solid rgba(99,102,241,0.2)', borderRadius: '24px',
              boxShadow: '0 25px 60px rgba(0,0,0,0.7)',
              animation: 'profileSlideUp 0.3s ease',
            }}
          >
            {/* Modal header with gradient banner */}
            <div style={{
              padding: '28px 32px 20px',
              background: `linear-gradient(135deg, ${(
                previewCourse.category === 'GenAI' ? 'rgba(168,85,247,0.15)' :
                  previewCourse.category === 'Web Dev' ? 'rgba(34,197,94,0.15)' :
                    previewCourse.category === 'DevOps & Cloud' ? 'rgba(245,158,11,0.15)' :
                      previewCourse.category === 'Security' ? 'rgba(239,68,68,0.15)' :
                        previewCourse.category === 'Data Science' ? 'rgba(6,182,212,0.15)' : 'rgba(99,102,241,0.15)'
              )} 0%, transparent 100%)`,
              borderBottom: '1px solid rgba(255,255,255,0.05)',
              position: 'relative',
            }}>
              <button
                onClick={() => setPreviewCourse(null)}
                style={{
                  position: 'absolute', top: '16px', right: '16px',
                  width: '34px', height: '34px', borderRadius: '10px',
                  background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                  color: '#94a3b8', cursor: 'pointer', display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                }}
              >
                <X size={16} />
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
                <span className={`badge ${getCategoryBadgeClass(previewCourse.category)}`}>{previewCourse.category}</span>
                <span style={{
                  fontSize: '0.72rem', fontWeight: 700, padding: '3px 10px', borderRadius: '6px',
                  background: previewCourse.platform === 'Coursera' ? 'rgba(59,130,246,0.12)' : previewCourse.platform === 'edX' ? 'rgba(239,68,68,0.12)' : 'rgba(168,85,247,0.12)',
                  color: previewCourse.platform === 'Coursera' ? '#60a5fa' : previewCourse.platform === 'edX' ? '#fca5a5' : '#c084fc',
                  border: `1px solid ${previewCourse.platform === 'Coursera' ? 'rgba(59,130,246,0.25)' : previewCourse.platform === 'edX' ? 'rgba(239,68,68,0.25)' : 'rgba(168,85,247,0.25)'}`,
                }}>
                  {previewCourse.platform}
                </span>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', padding: '3px 10px', borderRadius: '6px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  {previewCourse.level}
                </span>
              </div>

              <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#e2e8f0', margin: '0 0 8px 0', lineHeight: 1.25, paddingRight: '40px' }}>
                {previewCourse.title}
              </h2>
              <p style={{ fontSize: '0.88rem', color: '#64748b', margin: 0, lineHeight: 1.5 }}>
                {previewCourse.description}
              </p>

              {/* Quick stats row */}
              <div style={{ display: 'flex', gap: '16px', marginTop: '16px', flexWrap: 'wrap' }}>
                {[
                  { icon: User, label: previewCourse.instructor, color: '#a5b4fc' },
                  { icon: Clock, label: previewCourse.duration, color: '#6ee7b7' },
                  { icon: Star, label: previewCourse.rating?.replace(' ⭐', '') + ' rating', color: '#fbbf24' },
                  { icon: Users, label: previewCourse.students + ' students', color: '#818cf8' },
                ].filter(s => s.label).map((stat, i) => (
                  <span key={i} style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.78rem', color: stat.color, fontWeight: 600 }}>
                    <stat.icon size={13} /> {stat.label}
                  </span>
                ))}
              </div>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '4px', padding: '16px 32px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              {[
                { id: 'overview', label: 'Overview' },
                { id: 'syllabus', label: 'Curriculum' },
                { id: 'skills', label: 'What You\'ll Learn' },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setPreviewTab(tab.id)}
                  style={{
                    padding: '10px 18px', borderRadius: '10px 10px 0 0',
                    background: previewTab === tab.id ? 'rgba(99,102,241,0.1)' : 'transparent',
                    border: 'none', borderBottom: previewTab === tab.id ? '2px solid #6366f1' : '2px solid transparent',
                    color: previewTab === tab.id ? '#a5b4fc' : '#64748b',
                    fontSize: '0.82rem', fontWeight: previewTab === tab.id ? 700 : 600,
                    cursor: 'pointer', transition: 'all 0.15s ease',
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div style={{ padding: '20px 32px 28px' }}>
              {previewTab === 'overview' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', animation: 'dashFadeSlideIn 0.3s ease' }}>
                  {/* Full description */}
                  {previewCourse.fullDescription && (
                    <div>
                      <h4 style={{ fontSize: '0.88rem', fontWeight: 800, color: '#e2e8f0', margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <BookOpen size={15} color="#6366f1" /> About This Course
                      </h4>
                      <p style={{ fontSize: '0.85rem', color: '#94a3b8', lineHeight: 1.7, margin: 0, whiteSpace: 'pre-line' }}>
                        {previewCourse.fullDescription}
                      </p>
                    </div>
                  )}

                  {/* Info grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
                    {[
                      { label: 'Provider', value: previewCourse.provider, icon: Globe },
                      { label: 'Prerequisites', value: previewCourse.prerequisites, icon: Award },
                      { label: 'Reviews', value: previewCourse.ratingCount, icon: MessageSquare },
                    ].filter(i => i.value).map((item, i) => (
                      <div key={i} style={{
                        padding: '14px 16px', borderRadius: '12px',
                        background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
                      }}>
                        <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <item.icon size={12} color="#6366f1" /> {item.label}
                        </div>
                        <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#e2e8f0' }}>{item.value}</div>
                      </div>
                    ))}
                  </div>

                  {/* Target audience */}
                  {previewCourse.targetAudience && previewCourse.targetAudience.length > 0 && (
                    <div>
                      <h4 style={{ fontSize: '0.88rem', fontWeight: 800, color: '#e2e8f0', margin: '0 0 10px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Target size={15} color="#06b6d4" /> Who This Is For
                      </h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {previewCourse.targetAudience.map((item, i) => (
                          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', color: '#94a3b8' }}>
                            <ChevronRight size={13} color="#22d3ee" style={{ flexShrink: 0 }} /> {item}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Instructor bio */}
                  {previewCourse.instructorBio && (
                    <div style={{
                      padding: '16px 18px', borderRadius: '14px',
                      background: 'rgba(99,102,241,0.05)', border: '1px solid rgba(99,102,241,0.15)',
                    }}>
                      <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#a5b4fc', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <User size={13} /> About the Instructor
                      </div>
                      <p style={{ fontSize: '0.82rem', color: '#94a3b8', margin: 0, lineHeight: 1.6 }}>
                        {previewCourse.instructorBio}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {previewTab === 'syllabus' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', animation: 'dashFadeSlideIn 0.3s ease' }}>
                  <h4 style={{ fontSize: '0.88rem', fontWeight: 800, color: '#e2e8f0', margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <GraduationCap size={15} color="#6366f1" /> Course Curriculum ({previewCourse.modules?.length || 0} Modules)
                  </h4>
                  {previewCourse.modules && previewCourse.modules.map((mod, idx) => (
                    <div key={idx} style={{
                      display: 'flex', alignItems: 'center', gap: '12px',
                      padding: '14px 16px', borderRadius: '12px',
                      background: idx % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.04)',
                      transition: 'all 0.15s ease',
                    }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(99,102,241,0.06)'; e.currentTarget.style.borderColor = 'rgba(99,102,241,0.15)'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = idx % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.04)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.04)'; }}
                    >
                      <div style={{
                        width: '32px', height: '32px', borderRadius: '8px', flexShrink: 0,
                        background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.2)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '0.75rem', fontWeight: 800, color: '#a5b4fc',
                      }}>
                        {idx + 1}
                      </div>
                      <span style={{ fontSize: '0.85rem', color: '#cbd5e1', fontWeight: 600 }}>{mod}</span>
                    </div>
                  ))}
                </div>
              )}

              {previewTab === 'skills' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', animation: 'dashFadeSlideIn 0.3s ease' }}>
                  {/* What You'll Learn */}
                  {previewCourse.whatYouWillLearn && previewCourse.whatYouWillLearn.length > 0 && (
                    <div>
                      <h4 style={{ fontSize: '0.88rem', fontWeight: 800, color: '#e2e8f0', margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Zap size={15} color="#f59e0b" /> What You'll Learn
                      </h4>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '8px' }}>
                        {previewCourse.whatYouWillLearn.map((item, i) => (
                          <div key={i} style={{
                            display: 'flex', alignItems: 'flex-start', gap: '8px',
                            padding: '10px 14px', borderRadius: '10px',
                            background: 'rgba(34,197,94,0.04)', border: '1px solid rgba(34,197,94,0.1)',
                            fontSize: '0.82rem', color: '#94a3b8', lineHeight: 1.4,
                          }}>
                            <CheckCircle2 size={14} color="#22c55e" style={{ flexShrink: 0, marginTop: '2px' }} />
                            {item}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Requirements */}
                  {previewCourse.requirements && previewCourse.requirements.length > 0 && (
                    <div>
                      <h4 style={{ fontSize: '0.88rem', fontWeight: 800, color: '#e2e8f0', margin: '0 0 10px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Award size={15} color="#a855f7" /> Requirements
                      </h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {previewCourse.requirements.map((item, i) => (
                          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', color: '#94a3b8' }}>
                            <ChevronRight size={13} color="#a855f7" style={{ flexShrink: 0 }} /> {item}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Skill Tags */}
                  <div>
                    <h4 style={{ fontSize: '0.88rem', fontWeight: 800, color: '#e2e8f0', margin: '0 0 10px 0' }}>
                      Core Skill Tags
                    </h4>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {getSkillTags(previewCourse.category).map((s) => (
                        <span key={s} style={{
                          display: 'flex', alignItems: 'center', gap: '5px',
                          padding: '7px 14px', borderRadius: '10px', fontSize: '0.82rem', fontWeight: 700,
                          background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)',
                          color: '#a5b4fc',
                        }}>
                          <Zap size={12} /> {s}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal footer actions */}
            <div style={{
              padding: '16px 32px 24px', borderTop: '1px solid rgba(255,255,255,0.05)',
              display: 'flex', gap: '12px', flexWrap: 'wrap',
            }}>
              {(previewCourse.courseUrl || previewCourse.udemyUrl) && (
                <a
                  href={previewCourse.courseUrl || previewCourse.udemyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    padding: '11px 20px', borderRadius: '12px', textDecoration: 'none',
                    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
                    color: previewCourse.platform === 'Coursera' ? '#60a5fa' : previewCourse.platform === 'edX' ? '#fca5a5' : '#c084fc',
                    fontSize: '0.85rem', fontWeight: 700, transition: 'all 0.15s ease',
                  }}
                >
                  <ExternalLink size={15} /> View on {previewCourse.platform}
                </a>
              )}

              {userProgressMap[previewCourse.id || previewCourse._id] !== undefined ? (
                <Link
                  to={`/courses/${previewCourse.id || previewCourse._id}`}
                  onClick={() => setPreviewCourse(null)}
                  style={{
                    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                    padding: '11px 24px', borderRadius: '12px', textDecoration: 'none',
                    background: 'linear-gradient(135deg, #6366f1, #a855f7)',
                    color: '#fff', fontSize: '0.88rem', fontWeight: 700,
                    boxShadow: '0 4px 20px rgba(99,102,241,0.3)',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <PlayCircle size={16} /> Go to Course Workspace
                </Link>
              ) : (
                <button
                  onClick={() => handleModalEnroll(previewCourse.id || previewCourse._id)}
                  disabled={actionLoadingId === (previewCourse.id || previewCourse._id)}
                  style={{
                    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                    padding: '11px 24px', borderRadius: '12px', border: 'none',
                    background: 'linear-gradient(135deg, #6366f1, #a855f7)',
                    color: '#fff', fontSize: '0.88rem', fontWeight: 700, cursor: 'pointer',
                    boxShadow: '0 4px 20px rgba(99,102,241,0.3)',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {actionLoadingId === (previewCourse.id || previewCourse._id) ? (
                    <><span className="spinner"></span> Enrolling...</>
                  ) : (
                    <><PlusCircle size={16} /> Enroll in This Course</>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* STREAK REWARD CELEBRATION MODAL */}
      {showStreakModal && (
        <div className="modal-overlay" onClick={() => setShowStreakModal(false)}>
          <div className="streak-celebration-card animate-slide-up" onClick={(e) => e.stopPropagation()}>
            <div className="streak-flame-badge">
              <Flame size={48} color="#f59e0b" />
            </div>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800 }}>Daily Streak Claimed! 🔥</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', maxWidth: '360px' }}>
              You logged in today and earned <strong>+50 AI XP</strong>. Keep up your streak to unlock exclusive tutor badges!
            </p>
            <div className="badge badge-warning" style={{ fontSize: '1rem', padding: '6px 16px' }}>
              Total XP: {userXp} XP
            </div>
            <button
              className="btn btn-primary btn-block"
              onClick={() => setShowStreakModal(false)}
              style={{ marginTop: '12px' }}
            >
              Continue Learning
            </button>
          </div>
        </div>
      )}

      {/* FLOATING AI ASSISTANT FAB & DRAWER */}
      <button
        className="floating-ai-fab"
        onClick={() => setFabOpen((prev) => !prev)}
        title="Open AI Tutor Helper"
      >
        {fabOpen ? <X size={26} /> : <Bot size={26} />}
      </button>

      {fabOpen && (
        <div className="floating-ai-drawer animate-slide-up">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, color: '#67e8f9' }}>
              <Bot size={20} /> AI Tutor Assistant
            </div>
            <button onClick={() => setFabOpen(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}>
              <X size={16} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '240px', overflowY: 'auto' }}>
            {fabMessages.map((msg, i) => (
              <div
                key={i}
                style={{
                  alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                  background: msg.sender === 'user' ? 'var(--primary-gradient)' : 'rgba(255, 255, 255, 0.08)',
                  padding: '8px 12px',
                  borderRadius: '12px',
                  fontSize: '0.85rem',
                  maxWidth: '85%'
                }}
              >
                {msg.text}
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text"
              className="form-control"
              placeholder="Ask AI tutor..."
              value={fabPrompt}
              onChange={(e) => setFabPrompt(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendFabMessage()}
              style={{ fontSize: '0.85rem', padding: '0.5rem 0.75rem' }}
            />
            <button onClick={handleSendFabMessage} className="btn btn-primary btn-sm">
              <Send size={14} />
            </button>
          </div>
        </div>
      )}

      {/* INTERACTIVE TIME SPENDING ANALYTICS MODAL WITH LIVE PIE CHART */}
      <TimeAnalyticsModal
        isOpen={showTimeAnalyticsModal}
        onClose={() => setShowTimeAnalyticsModal(false)}
        loggedHours={loggedHours}
        setLoggedHours={setLoggedHours}
        targetHours={targetHours}
        timerRunning={timerRunning}
        setTimerRunning={setTimerRunning}
        elapsedSeconds={elapsedSeconds}
        setElapsedSeconds={setElapsedSeconds}
        onAddXp={(xpAmount) => {
          setUserXp((prev) => prev + xpAmount);
          addToast(`Logged study time! +${xpAmount} XP added 🚀`, 'success', 'Time Logged');
        }}
      />

      {/* 14. AI TUTOR API KEY CONFIGURATION MODAL */}
    </div>
  );
};

export default DashboardPage;
