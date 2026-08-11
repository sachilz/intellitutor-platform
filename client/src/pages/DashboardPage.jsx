import React, { useEffect, useState, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { getCourses, enrollInCourse } from '../api/courseApi';
import { getUserProgress, updateProgress, createProgress } from '../api/progressApi';
import { askTutor } from '../api/tutorApi';
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
  Play
} from 'lucide-react';

const DashboardPage = () => {
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { addToast } = useToast();
  const [courses, setCourses] = useState([]);
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

  // AI Assistant Sandbox Terminal State
  const [aiSandboxPrompt, setAiSandboxPrompt] = useState('');
  const [aiSandboxResponse, setAiSandboxResponse] = useState(null);
  const [aiSandboxLoading, setAiSandboxLoading] = useState(false);

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
      try {
        apiCourses = await getCourses();
      } catch (err) {
        console.warn('API Gateway fetch warning:', err);
      }

      // Merge API courses with Curated Catalog (prevent duplicates by title or id)
      const mergedMap = new Map();
      CURATED_COURSES.forEach((c) => mergedMap.set(c.id, c));
      
      if (Array.isArray(apiCourses) && apiCourses.length > 0) {
        apiCourses.forEach((c) => {
          const key = c.id || c._id || c.title;
          mergedMap.set(key, { ...mergedMap.get(key), ...c });
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
      setCourses(CURATED_COURSES);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

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

  // AI Assistant Sandbox Terminal Handler
  const handleAiSandboxPrompt = async (promptText) => {
    const q = promptText || aiSandboxPrompt;
    if (!q.trim()) return;

    setAiSandboxPrompt(q);
    setAiSandboxLoading(true);
    setAiSandboxResponse(null);

    try {
      const userId = user?.email || user?.username || 'student1@intellilearn.com';
      const res = await askTutor('general', q, userId);
      let output = res.answer;
      if (res.sources && res.sources.length > 0) {
        output += `\n\n📌 **Sources:** ${res.sources.join(', ')}`;
      }
      setAiSandboxResponse(output);
    } catch (err) {
      console.warn('RAG API offline, using fallback response:', err);
      setAiSandboxResponse(`🤖 **AI Tutor Response**: "${q}" is an important learning concept. Ask about polymorphism, Spring Boot, or microservices for grounded retrieval answers!`);
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
      setFabMessages((prev) => [...prev, { sender: 'ai', text: `I analyzed your request about "${currentQ}". Check out our courses or ask about Java/Spring concepts!` }]);
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

            <div style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(16px)',
              border: '1px solid rgba(255,255,255,0.06)', padding: '6px 14px', borderRadius: '12px',
              animation: 'dashFadeSlideIn 0.6s ease',
            }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 8px #22c55e', animation: 'dashPulse 2s ease-in-out infinite' }} />
              <span style={{ fontSize: '0.78rem', color: '#e2e8f0', fontWeight: 700 }}>AI Tutor Online</span>
              <span style={{
                fontSize: '0.68rem', color: '#94a3b8',
                background: 'rgba(255,255,255,0.05)', padding: '2px 8px', borderRadius: '6px',
              }}>GPT-4o / Claude 3.5</span>
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

          {/* ── AI COMMAND TERMINAL ── */}
          <div style={{
            background: 'rgba(0,0,0,0.25)', backdropFilter: 'blur(20px)',
            border: '1px solid rgba(99,102,241,0.15)', borderRadius: '18px',
            padding: '20px 24px',
            animation: 'dashFadeSlideIn 0.8s ease',
          }}>
            {/* Terminal header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '32px', height: '32px', borderRadius: '10px',
                  background: 'linear-gradient(135deg, #6366f1, #06b6d4)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 4px 15px rgba(99,102,241,0.3)',
                }}>
                  <Bot size={17} color="#fff" />
                </div>
                <div>
                  <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#e2e8f0' }}>AI Command Terminal</span>
                  <div style={{ display: 'flex', gap: '6px', marginTop: '2px' }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#ef4444' }} />
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#f59e0b' }} />
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22c55e' }} />
                  </div>
                </div>
              </div>
              <span style={{ fontSize: '0.72rem', color: '#475569', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Zap size={11} color="#f59e0b" /> Instant AI Insights
              </span>
            </div>

            {/* Quick prompt chips */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '14px' }}>
              {[
                { label: 'Recommend Course', icon: Target, color: '#6366f1', prompt: 'Recommend a course for my goals' },
                { label: 'In-Demand Skills', icon: Zap, color: '#f59e0b', prompt: 'What AI skills are in demand?' },
                { label: 'My Roadmap', icon: Flame, color: '#ef4444', prompt: 'Show my learning roadmap' },
                { label: 'Explain Transformers', icon: HelpCircle, color: '#06b6d4', prompt: 'Explain Transformer self-attention' },
              ].map((chip, i) => (
                <button
                  key={i}
                  onClick={() => handleAiSandboxPrompt(chip.prompt)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    padding: '7px 14px', borderRadius: '10px',
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
                  placeholder="Ask AI tutor anything about courses, skills, or concepts..."
                  value={aiSandboxPrompt}
                  onChange={(e) => setAiSandboxPrompt(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAiSandboxPrompt()}
                  style={{
                    width: '100%', padding: '12px 40px 12px 16px', borderRadius: '12px',
                    background: 'rgba(0,0,0,0.35)', border: '1px solid rgba(255,255,255,0.08)',
                    color: '#e2e8f0', fontSize: '0.88rem', fontWeight: 500,
                    outline: 'none', transition: 'all 0.2s ease', boxSizing: 'border-box',
                  }}
                  onFocus={e => { e.target.style.borderColor = 'rgba(99,102,241,0.5)'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.1)'; }}
                  onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; e.target.style.boxShadow = 'none'; }}
                />
                {aiSandboxPrompt && (
                  <button
                    onClick={() => { setAiSandboxPrompt(''); setAiSandboxResponse(null); }}
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
                disabled={aiSandboxLoading}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  width: '48px', height: '48px', borderRadius: '12px',
                  background: 'linear-gradient(135deg, #6366f1, #a855f7)',
                  border: 'none', color: '#fff', cursor: 'pointer',
                  transition: 'all 0.2s ease', flexShrink: 0,
                  boxShadow: '0 4px 20px rgba(99,102,241,0.3)',
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.05)'; e.currentTarget.style.boxShadow = '0 6px 25px rgba(99,102,241,0.4)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(99,102,241,0.3)'; }}
              >
                {aiSandboxLoading ? <span className="spinner"></span> : <Send size={17} />}
              </button>
            </div>

            {/* Loading state */}
            {aiSandboxLoading && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '12px', fontSize: '0.82rem', color: '#a5b4fc' }}>
                <span className="spinner"></span> Generating insights...
              </div>
            )}

            {/* Response card */}
            {aiSandboxResponse && (
              <div style={{
                marginTop: '14px', padding: '16px 20px', borderRadius: '14px',
                background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.15)',
                fontSize: '0.88rem', lineHeight: 1.65, whiteSpace: 'pre-line', color: '#cbd5e1',
                position: 'relative', animation: 'dashFadeSlideIn 0.3s ease',
              }}>
                <button
                  onClick={() => setAiSandboxResponse(null)}
                  style={{
                    position: 'absolute', top: '10px', right: '10px',
                    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '6px', padding: '4px', color: '#64748b', cursor: 'pointer',
                    display: 'flex',
                  }}
                >
                  <X size={12} />
                </button>
                {aiSandboxResponse}
              </div>
            )}
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

      {/* 5. SECTION HEADER */}
      <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <h2>Interactive AI Courses</h2>
        </div>
        {!loading && (
          <span className="badge badge-info">{filteredCourses.length} Courses Found</span>
        )}
      </div>

      {/* 6. ERROR ALERT */}
      {error && (
        <div className="alert alert-info">
          <AlertCircle size={18} style={{ flexShrink: 0 }} />
          <span>{error} Showing offline interactive catalog.</span>
        </div>
      )}

      {/* 7. LOADING SKELETON */}
      {loading && <CourseGridSkeleton count={6} />}

      {/* 8. EMPTY STATE */}
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

      {/* 9. GRID VIEW MODE */}
      {!loading && filteredCourses.length > 0 && viewMode === 'GRID' && (
        <div className="courses-grid">
          {filteredCourses.map((course) => {
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
                  background: 'rgba(255,255,255,0.02)',
                  border: `1px solid rgba(255,255,255,0.06)`,
                  borderRadius: '18px',
                  overflow: 'hidden',
                  display: 'flex', flexDirection: 'column',
                  transition: 'all 0.3s ease',
                  cursor: 'default',
                  position: 'relative',
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.boxShadow = `0 20px 50px ${colors.accent}18`; e.currentTarget.style.borderColor = `${colors.accent}40`; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; }}
              >
                {/* Top accent gradient bar */}
                <div style={{ height: '3px', background: `linear-gradient(90deg, ${colors.accent}, ${colors.accent}60)` }} />

                <div style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
                  {/* Header: badges + rating + bookmark */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                      <span className={`badge ${badgeClass}`} style={{ fontSize: '0.7rem' }}>{course.category}</span>
                      <span style={{
                        background: course.platform === 'Coursera' ? 'rgba(59,130,246,0.12)' : course.platform === 'edX' ? 'rgba(239,68,68,0.12)' : 'rgba(168,85,247,0.12)',
                        color: course.platform === 'Coursera' ? '#60a5fa' : course.platform === 'edX' ? '#fca5a5' : '#c084fc',
                        border: `1px solid ${course.platform === 'Coursera' ? 'rgba(59,130,246,0.25)' : course.platform === 'edX' ? 'rgba(239,68,68,0.25)' : 'rgba(168,85,247,0.25)'}`,
                        borderRadius: '6px', padding: '2px 8px', fontSize: '0.68rem', fontWeight: 700,
                      }}>
                        {course.platform}
                      </span>
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
                      background: `linear-gradient(135deg, ${colors.accent}, ${colors.accent}cc)`,
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
      )}

      {/* 10. COMPACT VIEW MODE */}
      {!loading && filteredCourses.length > 0 && viewMode === 'COMPACT' && (
        <div className="courses-compact-view">
          {filteredCourses.map((course) => {
            const courseId = course.id || course._id;
            const progress = userProgressMap[courseId];
            const isEnrolled = progress !== undefined;
            const isFav = favorites.includes(courseId);

            return (
              <div key={courseId} className="compact-course-card glass-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <span className={`badge ${getCategoryBadgeClass(course.category)}`} style={{ fontSize: '0.7rem' }}>
                    {course.category || 'AI'}
                  </span>
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
      )}

      {/* 11. LIST VIEW MODE */}
      {!loading && filteredCourses.length > 0 && viewMode === 'LIST' && (
        <div className="courses-list-view">
          {filteredCourses.map((course) => {
            const courseId = course.id || course._id;
            const progress = userProgressMap[courseId];
            const isEnrolled = progress !== undefined;
            const badgeClass = getCategoryBadgeClass(course.category);

            return (
              <div key={courseId} className="glass-card course-list-item glass-card-hover">
                <div style={{ flex: 2, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className={`badge ${badgeClass}`}>{course.category || 'AI & ML'}</span>
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
      )}

      {/* 12. COURSE DETAILS MODAL */}
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

      {/* 13. STREAK REWARD CELEBRATION MODAL */}
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

      {/* 14. FLOATING AI ASSISTANT FAB & DRAWER */}
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

      {/* 13. INTERACTIVE TIME SPENDING ANALYTICS MODAL WITH LIVE PIE CHART */}
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

    </div>
  );
};

export default DashboardPage;
