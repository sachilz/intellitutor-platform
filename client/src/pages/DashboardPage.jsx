import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { getCourses, enrollInCourse } from '../api/courseApi';
import { getUserProgress, updateProgress, createProgress } from '../api/progressApi';
import { CourseGridSkeleton } from '../components/SkeletonLoader';
import { CURATED_COURSES, getCategoryBadgeClass } from '../data/coursesCatalog';
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
  Check
} from 'lucide-react';

const DashboardPage = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [courses, setCourses] = useState([]);
  const [userProgressMap, setUserProgressMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Interactive Filter & Layout States
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [sortBy, setSortBy] = useState('RECOMMENDED');
  const [viewMode, setViewMode] = useState('GRID'); // 'GRID' | 'LIST' | 'COMPACT'
  const [previewCourse, setPreviewCourse] = useState(null);
  const [previewTab, setPreviewTab] = useState('overview'); // 'overview' | 'syllabus' | 'skills'
  const [actionLoadingId, setActionLoadingId] = useState(null);

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

  // Interactive Study Goal Tracker (in hours)
  const [loggedHours, setLoggedHours] = useState(3.5);
  const targetHours = 5.0;

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

      if (user?.id) {
        try {
          const progressList = await getUserProgress(user.id);
          const map = {};
          if (Array.isArray(progressList)) {
            progressList.forEach((p) => {
              map[p.courseId] = p.completedPercent;
            });
          }
          setUserProgressMap(map);
        } catch (pErr) {
          console.warn('Could not fetch user progress:', pErr);
        }
      }
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

  const avgProgress = useMemo(() => {
    const values = Object.values(userProgressMap);
    if (values.length === 0) return 0;
    const total = values.reduce((sum, val) => sum + (Number(val) || 0), 0);
    return Math.round(total / values.length);
  }, [userProgressMap]);

  // Quick Progress Increment Handler (+10%)
  const handleQuickProgressBump = async (courseId, currentPercent = 0) => {
    if (!user?.id) return;
    const newPercent = Math.min(100, (Number(currentPercent) || 0) + 10);
    setActionLoadingId(courseId);
    try {
      const updated = await updateProgress(user.id, courseId, newPercent);
      setUserProgressMap((prev) => ({ ...prev, [courseId]: updated.completedPercent }));
      addToast(`Progress boosted to ${updated.completedPercent}%! 🚀`, 'success', 'Keep it up!');
    } catch (err) {
      setUserProgressMap((prev) => ({ ...prev, [courseId]: newPercent }));
      addToast(`Progress updated to ${newPercent}%!`, 'info', 'Progress Saved');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Quick Enroll Handler from Modal
  const handleModalEnroll = async (courseId) => {
    if (!user?.id) return;
    setActionLoadingId(courseId);
    try {
      await enrollInCourse(courseId, user.id);
      try {
        await createProgress(user.id, courseId);
      } catch (pErr) {
        console.warn('Progress creation fallback', pErr);
      }
      setUserProgressMap((prev) => ({ ...prev, [courseId]: 0 }));
      addToast('Enrolled successfully! Welcome aboard 🎓', 'success', 'Registration Confirmed');
      setPreviewCourse(null);
    } catch (err) {
      setUserProgressMap((prev) => ({ ...prev, [courseId]: 0 }));
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
  const handleAiSandboxPrompt = (promptText) => {
    const q = promptText || aiSandboxPrompt;
    if (!q.trim()) return;

    setAiSandboxPrompt(q);
    setAiSandboxLoading(true);
    setAiSandboxResponse(null);

    setTimeout(() => {
      setAiSandboxLoading(false);
      let res = '';
      const lower = q.toLowerCase();

      if (lower.includes('recommend') || lower.includes('goal')) {
        res = `🤖 **AI Tutor Recommendation**:
Based on market demand and your current active learning stats:
1. **Generative AI & LLM Engineering** by Dr. Andrew Ng (Top Rated)
2. **Machine Learning Foundations** (Best for core mathematical foundations)
3. **Full-Stack React & Next.js Masterclass** (Great for building AI apps)`;
      } else if (lower.includes('skill') || lower.includes('demand')) {
        res = `⚡ **Top In-Demand AI Skills for 2026**:
• **Transformer Architectures & RAG Pipeline Design**
• **PyTorch & Deep Neural Network Optimization**
• **Multi-Agent Orchestration & LangChain/LangGraph**
• **Full-Stack Next.js AI SDK Integration**`;
      } else if (lower.includes('roadmap') || lower.includes('path') || lower.includes('progress')) {
        res = `🔥 **Your Personalized Learning Roadmap**:
You currently have **${enrolledCount} active enrolled courses** with an average completion rate of **${avgProgress}%**.
Complete your enrolled modules to unlock your **Verified AI Certifications**!`;
      } else if (lower.includes('transformer') || lower.includes('explain')) {
        res = `💡 **AI Core Concept Breakdown**:
Transformers rely on **Self-Attention mechanisms** to weigh the importance of input tokens regardless of distance in sequence. Key building blocks include Multi-Head Attention, Feedforward Neural Networks, and Positional Embeddings. Check out our **NLP with Transformers** course below!`;
      } else {
        res = `🤖 **AI Tutor Response**:
"${q}" is a great topic to explore! We have ${courses.length} specialized AI & Engineering courses in our catalog below to help you master this step by step.`;
      }

      setAiSandboxResponse(res);
    }, 600);
  };

  // Floating FAB AI Chat Handler
  const handleSendFabMessage = () => {
    if (!fabPrompt.trim()) return;
    const userMsg = { sender: 'user', text: fabPrompt };
    setFabMessages((prev) => [...prev, userMsg]);
    const currentQ = fabPrompt;
    setFabPrompt('');

    setTimeout(() => {
      let aiText = `I analyzed your request about "${currentQ}". You can search our ${courses.length} courses or click "Recommend Course" in the top hero terminal for instant guidance!`;
      const lower = currentQ.toLowerCase();
      if (lower.includes('hi') || lower.includes('hello')) {
        aiText = `Hello ${user?.username || 'Learner'}! How can I assist your AI learning journey today?`;
      } else if (lower.includes('certificate') || lower.includes('cert')) {
        aiText = `You earn a shareable Verified Certificate as soon as you reach 100% progress on any enrolled course!`;
      }
      setFabMessages((prev) => [...prev, { sender: 'ai', text: aiText }]);
    }, 500);
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

      // Category filter
      if (selectedCategory === 'ENROLLED' && !isEnrolled) return false;
      if (selectedCategory === 'FAVORITES' && !isFav) return false;
      if (
        selectedCategory !== 'ALL' &&
        selectedCategory !== 'ENROLLED' &&
        selectedCategory !== 'FAVORITES' &&
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
      
      {/* 1. HERO BANNER WITH AMBIENT MESH GRADIENT & AI COMMAND TERMINAL */}
      <div 
        className="welcome-banner glass-card" 
        style={{ 
          background: 'linear-gradient(135deg, rgba(13, 19, 36, 0.96) 0%, rgba(21, 30, 54, 0.92) 100%)', 
          border: '1px solid rgba(6, 182, 212, 0.35)', 
          boxShadow: '0 0 40px rgba(6, 182, 212, 0.15)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <div className="hero-mesh-bg"></div>

        <div className="banner-content" style={{ display: 'flex', flexDirection: 'column', gap: '20px', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(6, 182, 212, 0.15)', border: '1px solid rgba(6, 182, 212, 0.4)', padding: '5px 16px', borderRadius: '20px', fontSize: '0.8rem', color: '#67e8f9', fontWeight: 600, marginBottom: '12px' }}>
                <Sparkles size={14} color="var(--neon-cyan)" /> Intelligent AI Learning Hub & Assistant
              </div>
              <h1 style={{ fontSize: '2.5rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
                {timeGreeting.text}, {user?.username || 'Learner'}! {timeGreeting.emoji}
              </h1>
              <p style={{ maxWidth: '750px', color: 'var(--text-muted)', fontSize: '1rem', marginTop: '4px' }}>
                Master cutting-edge AI technologies, prompt your AI tutor, track real-time progress, and earn verified skill credentials.
              </p>
            </div>

            {/* AI Engine Status Badge */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(15, 23, 42, 0.8)', border: '1px solid var(--border-color)', padding: '8px 14px', borderRadius: 'var(--radius-lg)' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 10px #10b981' }}></div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-main)', fontWeight: 700 }}>AI Tutor Online</span>
                <span style={{ fontSize: '0.68rem', color: 'var(--text-dim)' }}>GPT-4o / Claude 3.5 Hybrid</span>
              </div>
            </div>
          </div>

          {/* Interactive AI Sandbox Prompt Command Bar */}
          <div className="ai-sandbox-card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, fontSize: '0.95rem', color: '#67e8f9' }}>
                <Bot size={20} color="var(--neon-cyan)" /> AI Tutor Command Terminal
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Zap size={12} color="var(--neon-amber)" /> Instant AI Recommendations & Insights
              </span>
            </div>

            {/* Quick Prompt Chips */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              <button
                type="button"
                className="ai-sandbox-chip"
                onClick={() => handleAiSandboxPrompt('Recommend a course for my goals')}
              >
                <Target size={13} /> Recommend Course
              </button>

              <button
                type="button"
                className="ai-sandbox-chip"
                onClick={() => handleAiSandboxPrompt('What AI skills are in demand?')}
              >
                <Zap size={13} /> In-Demand AI Skills
              </button>

              <button
                type="button"
                className="ai-sandbox-chip"
                onClick={() => handleAiSandboxPrompt('Show my learning roadmap')}
              >
                <Flame size={13} /> My Roadmap
              </button>

              <button
                type="button"
                className="ai-sandbox-chip"
                onClick={() => handleAiSandboxPrompt('Explain Transformer self-attention')}
              >
                <HelpCircle size={13} /> Explain Transformers
              </button>
            </div>

            {/* Custom Prompt Input */}
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                className="form-control"
                style={{ background: 'rgba(11, 17, 32, 0.85)', border: '1px solid rgba(6, 182, 212, 0.25)', fontSize: '0.9rem' }}
                placeholder="Ask AI tutor anything about course recommendations, skills, or concepts..."
                value={aiSandboxPrompt}
                onChange={(e) => setAiSandboxPrompt(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAiSandboxPrompt()}
              />
              {aiSandboxPrompt && (
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => { setAiSandboxPrompt(''); setAiSandboxResponse(null); }}
                  title="Clear prompt"
                >
                  <X size={16} />
                </button>
              )}
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => handleAiSandboxPrompt()}
                disabled={aiSandboxLoading}
                style={{ padding: '0.65rem 1.25rem' }}
              >
                {aiSandboxLoading ? <span className="spinner"></span> : <Send size={16} />}
              </button>
            </div>

            {/* Live Response Card */}
            {aiSandboxLoading && (
              <div style={{ fontSize: '0.85rem', color: '#a5b4fc', display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 0' }}>
                <span className="spinner"></span> AI Tutor is generating custom insights...
              </div>
            )}

            {aiSandboxResponse && (
              <div style={{ padding: '16px', background: 'rgba(11, 17, 32, 0.95)', border: '1px solid rgba(6, 182, 212, 0.35)', borderRadius: '12px', fontSize: '0.9rem', lineHeight: 1.6, whiteSpace: 'pre-line', animation: 'slideUp 0.25s ease', position: 'relative' }}>
                <button 
                  onClick={() => setAiSandboxResponse(null)} 
                  style={{ position: 'absolute', top: '10px', right: '10px', background: 'transparent', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}
                >
                  <X size={14} />
                </button>
                {aiSandboxResponse}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. CONTINUE LEARNING BANNER (If Enrolled Courses Exist) */}
      {enrolledCoursesList.length > 0 && (
        <div className="continue-learning-section">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <PlayCircle size={20} color="var(--success)" /> Continue Learning
            </h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
              {enrolledCoursesList.length} Active {enrolledCoursesList.length === 1 ? 'Course' : 'Courses'}
            </span>
          </div>

          <div className="continue-learning-card glass-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1, minWidth: '260px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6ee7b7', flexShrink: 0 }}>
                <GraduationCap size={24} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span className={`badge ${getCategoryBadgeClass(enrolledCoursesList[0].category)}`} style={{ width: 'fit-content', fontSize: '0.7rem' }}>
                  {enrolledCoursesList[0].category || 'In Progress'}
                </span>
                <h4 style={{ fontSize: '1.1rem', fontWeight: 700 }}>{enrolledCoursesList[0].title}</h4>
              </div>
            </div>

            <div style={{ flex: 1, minWidth: '200px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Progress</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <strong style={{ color: '#6ee7b7' }}>{userProgressMap[enrolledCoursesList[0].id || enrolledCoursesList[0]._id] || 0}%</strong>
                  {(userProgressMap[enrolledCoursesList[0].id || enrolledCoursesList[0]._id] || 0) < 100 && (
                    <button
                      type="button"
                      onClick={() => handleQuickProgressBump(enrolledCoursesList[0].id || enrolledCoursesList[0]._id, userProgressMap[enrolledCoursesList[0].id || enrolledCoursesList[0]._id])}
                      disabled={actionLoadingId === (enrolledCoursesList[0].id || enrolledCoursesList[0]._id)}
                      className="btn btn-secondary btn-sm"
                      style={{ padding: '2px 8px', fontSize: '0.7rem' }}
                      title="Add 10% progress bump"
                    >
                      +10%
                    </button>
                  )}
                </div>
              </div>
              <div className="progress-bar-container" style={{ height: '8px' }}>
                <div className="progress-bar-fill" style={{ width: `${userProgressMap[enrolledCoursesList[0].id || enrolledCoursesList[0]._id] || 0}%`, background: 'var(--accent-gradient)' }}></div>
              </div>
            </div>

            <Link to={`/courses/${enrolledCoursesList[0].id || enrolledCoursesList[0]._id}`} className="btn btn-primary" style={{ flexShrink: 0 }}>
              <span>Resume Lesson</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      )}

      {/* 3. KEY METRIC OVERVIEW CARDS & GAMIFIED GOAL TRACKER */}
      <div className="stats-overview-grid">
        {/* Available Courses */}
        <button
          type="button"
          className={`stat-card clickable ${selectedCategory === 'ALL' && sortBy !== 'PROGRESS' ? 'active' : ''}`}
          onClick={() => {
            setSelectedCategory('ALL');
            setSearchTerm('');
            setSortBy('RECOMMENDED');
            addToast('Showing all available courses in catalog', 'info', 'Catalog View');
          }}
          title="Show all available courses"
        >
          <div className="stat-icon-box" style={{ background: 'rgba(99, 102, 241, 0.18)', color: '#818cf8' }}>
            <BookOpen size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{courses.length}</span>
            <span className="stat-label">Available Courses</span>
          </div>
        </button>

        {/* Enrolled Courses */}
        <button
          type="button"
          className={`stat-card clickable ${selectedCategory === 'ENROLLED' ? 'active' : ''}`}
          onClick={() => {
            setSelectedCategory('ENROLLED');
            setSearchTerm('');
            addToast(
              enrolledCount > 0 
                ? `Filtered to your ${enrolledCount} enrolled courses`
                : 'No enrolled courses yet. Click "View & Enroll" on any course card!',
              enrolledCount > 0 ? 'info' : 'warning',
              'Enrollments Filter'
            );
          }}
          title="Filter by enrolled courses"
        >
          <div className="stat-icon-box" style={{ background: 'rgba(6, 182, 212, 0.18)', color: '#67e8f9' }}>
            <GraduationCap size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{enrolledCount}</span>
            <span className="stat-label">Enrolled Courses</span>
          </div>
        </button>

        {/* Average Mastery / Progress */}
        <button
          type="button"
          className={`stat-card clickable ${sortBy === 'PROGRESS' ? 'active' : ''}`}
          onClick={() => {
            setSortBy('PROGRESS');
            setSelectedCategory('ALL');
            setSearchTerm('');
            addToast('Courses sorted by highest completion percentage', 'success', 'Sorted by Progress');
          }}
          title="Sort courses by completion progress"
        >
          <div className="stat-icon-box" style={{ background: 'rgba(16, 185, 129, 0.18)', color: '#6ee7b7' }}>
            <TrendingUp size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{avgProgress}%</span>
            <span className="stat-label">Sort by Progress</span>
          </div>
        </button>

        {/* Daily Streak & XP Claim */}
        <button
          type="button"
          className={`stat-card clickable ${streakCheckedIn ? 'active' : ''}`}
          onClick={handleStreakCheckIn}
          title="Claim daily learning streak reward"
        >
          <div className="stat-icon-box" style={{ background: 'rgba(245, 158, 11, 0.18)', color: '#fcd34d' }}>
            <Flame size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-value" style={{ fontSize: '1.2rem', color: '#fcd34d' }}>
              {streakCheckedIn ? '3-Day 🔥' : 'Claim Streak'}
            </span>
            <span className="stat-label">{userXp} XP Points</span>
          </div>
        </button>

        {/* Interactive Weekly Goal Tracker */}
        <div className="stat-card" style={{ cursor: 'default' }}>
          <div className="stat-icon-box" style={{ background: 'rgba(168, 85, 247, 0.18)', color: '#c084fc' }}>
            <BarChart2 size={24} />
          </div>
          <div className="stat-info" style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="stat-value" style={{ fontSize: '1.1rem' }}>{loggedHours}h / {targetHours}h</span>
              <button
                type="button"
                onClick={handleLogStudyTime}
                className="btn btn-secondary btn-sm"
                style={{ padding: '2px 6px', fontSize: '0.68rem' }}
                title="Log 30 mins learning session"
              >
                +30m
              </button>
            </div>
            <span className="stat-label">Weekly Target Goal</span>
            <div className="progress-bar-container" style={{ height: '4px', marginTop: '4px' }}>
              <div className="progress-bar-fill" style={{ width: `${(loggedHours / targetHours) * 100}%`, background: 'var(--neon-violet)' }}></div>
            </div>
          </div>
        </div>
      </div>

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

          {enrolledCount > 0 && (
            <button
              type="button"
              className={`category-pill ${selectedCategory === 'ENROLLED' ? 'active' : ''}`}
              onClick={() => setSelectedCategory('ENROLLED')}
            >
              Enrolled ({enrolledCount})
            </button>
          )}

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

            return (
              <div 
                key={courseId} 
                className="course-card glass-card glass-card-hover" 
                style={{ borderTop: `3px solid ${course.category === 'GenAI' ? '#c084fc' : course.category === 'Web Dev' ? '#6ee7b7' : course.category === 'DevOps & Cloud' ? '#fcd34d' : 'var(--primary)'}` }}
              >
                <div className="course-card-body" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className={`badge ${badgeClass}`}>
                      {course.category || 'AI & ML'}
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {course.rating && (
                        <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#fcd34d', display: 'flex', alignItems: 'center', gap: '3px' }}>
                          <Star size={12} fill="#fcd34d" /> {course.rating}
                        </span>
                      )}
                      {isEnrolled && (
                        <span className="badge badge-success" style={{ gap: '3px' }}>
                          <CheckCircle2 size={11} /> Enrolled
                        </span>
                      )}
                      <button
                        type="button"
                        className={`bookmark-btn ${isFav ? 'bookmarked' : ''}`}
                        onClick={(e) => { e.preventDefault(); toggleFavorite(courseId); }}
                        title={isFav ? 'Remove Bookmark' : 'Bookmark Course'}
                      >
                        <Star size={14} fill={isFav ? '#fcd34d' : 'none'} />
                      </button>
                    </div>
                  </div>

                  <h3 className="course-title" style={{ fontSize: '1.25rem' }}>{course.title || course.name}</h3>
                  <p className="course-description">{course.description}</p>

                  {/* Skill tags */}
                  <div className="skill-tags-row">
                    {skillTags.map((tag) => (
                      <span key={tag} className="skill-tag-pill">{tag}</span>
                    ))}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', color: 'var(--text-dim)', marginTop: '4px' }}>
                    {course.instructor && (
                      <div className="course-meta">
                        <User size={13} />
                        <span>{course.instructor}</span>
                      </div>
                    )}
                    {course.duration && (
                      <div className="course-meta">
                        <Clock size={13} />
                        <span>{course.duration}</span>
                      </div>
                    )}
                  </div>

                  {isEnrolled && (
                    <div className="progress-section" style={{ marginTop: '4px' }}>
                      <div className="progress-label">
                        <span>Completion Progress</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <strong>{progress}%</strong>
                          {progress < 100 && (
                            <button
                              type="button"
                              onClick={(e) => { e.preventDefault(); handleQuickProgressBump(courseId, progress); }}
                              disabled={actionLoadingId === courseId}
                              className="btn btn-secondary btn-sm"
                              style={{ padding: '2px 6px', fontSize: '0.7rem' }}
                              title="Add 10% progress"
                            >
                              +10%
                            </button>
                          )}
                        </div>
                      </div>
                      <div className="progress-bar-container">
                        <div className="progress-bar-fill" style={{ width: `${progress}%` }}></div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="course-card-footer" style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                  <button
                    type="button"
                    onClick={() => { setPreviewCourse(course); setPreviewTab('overview'); }}
                    className="btn btn-secondary btn-sm"
                    title="Quick preview course syllabus"
                  >
                    <Eye size={15} />
                  </button>
                  
                  <Link to={`/courses/${courseId}`} className="btn btn-primary btn-block">
                    <span>{isEnrolled ? 'Continue Course' : 'View & Enroll'}</span>
                    <ArrowRight size={16} />
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

      {/* 12. INTERACTIVE COURSE PREVIEW MODAL */}
      {previewCourse && (
        <div className="modal-overlay" onClick={() => setPreviewCourse(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button
              className="modal-close-btn"
              onClick={() => setPreviewCourse(null)}
              aria-label="Close modal"
            >
              <X size={18} />
            </button>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <span className={`badge ${getCategoryBadgeClass(previewCourse.category)}`} style={{ width: 'fit-content' }}>
                {previewCourse.category || 'AI Course'}
              </span>
              <h2 style={{ fontSize: '1.6rem', fontWeight: 800 }}>{previewCourse.title}</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>{previewCourse.description}</p>
            </div>

            {/* Modal Tabs */}
            <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
              <button
                className={`btn btn-sm ${previewTab === 'overview' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setPreviewTab('overview')}
              >
                Overview
              </button>
              <button
                className={`btn btn-sm ${previewTab === 'syllabus' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setPreviewTab('syllabus')}
              >
                Syllabus Modules
              </button>
              <button
                className={`btn btn-sm ${previewTab === 'skills' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setPreviewTab('skills')}
              >
                AI Skills Gained
              </button>
            </div>

            {previewTab === 'overview' && (
              <div className="course-info-grid">
                <div className="info-item">
                  <span className="info-label">Instructor</span>
                  <span className="info-value"><User size={14} color="var(--primary)" /> {previewCourse.instructor || 'N/A'}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Duration</span>
                  <span className="info-value"><Clock size={14} color="var(--accent)" /> {previewCourse.duration || 'Self-paced'}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Prerequisites</span>
                  <span className="info-value">{previewCourse.prerequisites || 'Basic Programming'}</span>
                </div>
              </div>
            )}

            {previewTab === 'syllabus' && previewCourse.modules && (
              <div className="modal-syllabus-list">
                {previewCourse.modules.map((mod, idx) => (
                  <div key={idx} className="syllabus-item">
                    <CheckCircle2 size={16} color="var(--success)" />
                    <span>{mod}</span>
                  </div>
                ))}
              </div>
            )}

            {previewTab === 'skills' && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', padding: '8px 0' }}>
                {getSkillTags(previewCourse.category).map((s) => (
                  <span key={s} className="badge badge-info" style={{ padding: '6px 12px', fontSize: '0.85rem' }}>
                    <Zap size={13} /> {s}
                  </span>
                ))}
              </div>
            )}

            <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
              {userProgressMap[previewCourse.id || previewCourse._id] !== undefined ? (
                <Link
                  to={`/courses/${previewCourse.id || previewCourse._id}`}
                  className="btn btn-primary btn-block btn-lg"
                  onClick={() => setPreviewCourse(null)}
                >
                  Go to Course Workspace
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={() => handleModalEnroll(previewCourse.id || previewCourse._id)}
                  disabled={actionLoadingId === (previewCourse.id || previewCourse._id)}
                  className="btn btn-primary btn-block btn-lg"
                >
                  {actionLoadingId === (previewCourse.id || previewCourse._id) ? (
                    <>
                      <span className="spinner"></span>
                      <span>Enrolling...</span>
                    </>
                  ) : (
                    <>
                      <PlusCircle size={18} />
                      <span>Enroll in Course</span>
                    </>
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

    </div>
  );
};

export default DashboardPage;
