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
  Bot,
  Zap,
  Target,
  Send
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
  const [viewMode, setViewMode] = useState('GRID'); // 'GRID' | 'LIST'
  const [previewCourse, setPreviewCourse] = useState(null);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  // Daily Streak Check-In State
  const [streakCheckedIn, setStreakCheckedIn] = useState(false);

  // AI Assistant Sandbox State
  const [aiSandboxPrompt, setAiSandboxPrompt] = useState('');
  const [aiSandboxResponse, setAiSandboxResponse] = useState(null);
  const [aiSandboxLoading, setAiSandboxLoading] = useState(false);

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

  // Derived Category Pills List
  const categories = useMemo(() => {
    const set = new Set();
    courses.forEach((c) => {
      if (c.category) set.add(c.category);
    });
    return Array.from(set);
  }, [courses]);

  // Derived Metrics
  const enrolledCount = useMemo(() => Object.keys(userProgressMap).length, [userProgressMap]);
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
      addToast(`Progress boosted to ${updated.completedPercent}%!`, 'success', 'Keep it up!');
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
      addToast('Enrolled successfully!', 'success', 'Registration Confirmed');
      setPreviewCourse(null);
    } catch (err) {
      setUserProgressMap((prev) => ({ ...prev, [courseId]: 0 }));
      addToast('Enrolled in course catalog!', 'success', 'Course Enrolled');
      setPreviewCourse(null);
    } finally {
      setActionLoadingId(null);
    }
  };

  // Streak Check-In Handler
  const handleStreakCheckIn = () => {
    setStreakCheckedIn(true);
    addToast('🔥 Daily Streak Claimed! You gained +50 AI Tutor XP.', 'success', 'Daily Streak Claimed');
  };

  // AI Assistant Sandbox Quick Prompt Handler
  const handleAiSandboxPrompt = (promptText) => {
    const q = promptText || aiSandboxPrompt;
    if (!q.trim()) return;

    setAiSandboxLoading(true);
    setAiSandboxResponse(null);

    setTimeout(() => {
      setAiSandboxLoading(false);
      let res = '';
      const lower = q.toLowerCase();

      if (lower.includes('recommend') || lower.includes('goal')) {
        res = `🤖 **AI Tutor Recommendation**: Based on market demand, start with **"Generative AI & LLM Engineering"** by Dr. Andrew Ng or **"Machine Learning Foundations"**!`;
      } else if (lower.includes('skill') || lower.includes('demand')) {
        res = `⚡ **Top In-Demand AI Skills**:
1. Transformer Architectures & RAG
2. PyTorch Deep Learning
3. Next.js Full-Stack App Engineering
4. Multi-Agent Prompt Orchestration.`;
      } else if (lower.includes('roadmap') || lower.includes('path') || lower.includes('progress')) {
        res = `🔥 **Your Learning Roadmap**:
You have **${enrolledCount} active enrolled courses** with an average completion rate of **${avgProgress}%**. Finish your remaining modules to claim your certificates!`;
      } else {
        res = `🤖 **AI Tutor**: "${q}" is an excellent focus topic. Check out our curated catalog of ${courses.length} courses below to dive deep!`;
      }

      setAiSandboxResponse(res);
    }, 550);
  };

  // Filtered & Sorted Courses Calculation
  const filteredCourses = useMemo(() => {
    let list = courses.filter((course) => {
      const courseId = course.id || course._id;
      const isEnrolled = userProgressMap[courseId] !== undefined;

      // Category filter
      if (selectedCategory === 'ENROLLED' && !isEnrolled) return false;
      if (
        selectedCategory !== 'ALL' &&
        selectedCategory !== 'ENROLLED' &&
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
        if (!titleMatch && !descMatch && !instructorMatch) return false;
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
    }

    return list;
  }, [courses, userProgressMap, selectedCategory, searchTerm, sortBy]);

  return (
    <div className="dashboard-container animate-fade-in">
      {/* 1. Hero Banner with Interactive AI Assistant Sandbox */}
      <div className="welcome-banner glass-card" style={{ background: 'linear-gradient(135deg, rgba(13, 19, 36, 0.95) 0%, rgba(21, 30, 54, 0.9) 100%)', border: '1px solid rgba(6, 182, 212, 0.35)', boxShadow: '0 0 35px rgba(6, 182, 212, 0.15)' }}>
        <div className="banner-content" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(6, 182, 212, 0.15)', border: '1px solid rgba(6, 182, 212, 0.4)', padding: '4px 14px', borderRadius: '20px', fontSize: '0.8rem', color: '#67e8f9', fontWeight: 600, marginBottom: '10px' }}>
              <Sparkles size={14} color="var(--neon-cyan)" /> Intelligent AI Learning Hub
            </div>
            <h1 style={{ fontSize: '2.4rem', fontWeight: 800 }}>Welcome back, {user?.username || 'Learner'}! 👋</h1>
            <p style={{ maxWidth: '720px', color: 'var(--text-muted)' }}>
              Explore 11+ cutting-edge AI courses, track real-time progress, and prompt your personal AI tutor assistant below.
            </p>
          </div>

          {/* Interactive AI Sandbox Prompt Widget */}
          <div className="ai-sandbox-card" style={{ marginTop: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, fontSize: '0.95rem', color: '#67e8f9' }}>
                <Bot size={18} color="var(--neon-cyan)" /> Quick AI Tutor Assistant
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Instant AI Guidance</span>
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
            </div>

            {/* Custom Prompt Bar */}
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                className="form-control"
                style={{ background: 'rgba(11, 17, 32, 0.8)', border: '1px solid rgba(255, 255, 255, 0.12)' }}
                placeholder="Ask AI tutor anything about course recommendations or skills..."
                value={aiSandboxPrompt}
                onChange={(e) => setAiSandboxPrompt(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAiSandboxPrompt()}
              />
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => handleAiSandboxPrompt()}
                disabled={aiSandboxLoading}
              >
                {aiSandboxLoading ? <span className="spinner"></span> : <Send size={16} />}
              </button>
            </div>

            {/* Live Response Box */}
            {aiSandboxLoading && (
              <div style={{ fontSize: '0.85rem', color: '#a5b4fc', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="spinner"></span> AI Tutor is generating insights...
              </div>
            )}

            {aiSandboxResponse && (
              <div style={{ padding: '14px', background: 'rgba(11, 17, 32, 0.9)', border: '1px solid var(--primary-border)', borderRadius: '12px', fontSize: '0.9rem', lineHeight: 1.6, whiteSpace: 'pre-line', animation: 'slideUp 0.25s ease' }}>
                {aiSandboxResponse}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. Key Metric Overview Cards */}
      <div className="stats-overview-grid">
        <button
          type="button"
          className={`stat-card clickable ${selectedCategory === 'ALL' && sortBy !== 'PROGRESS' ? 'active' : ''}`}
          onClick={() => {
            setSelectedCategory('ALL');
            setSearchTerm('');
            setSortBy('RECOMMENDED');
            addToast('Showing all available courses', 'info', 'Catalog View');
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

        <button
          type="button"
          className={`stat-card clickable ${streakCheckedIn ? 'active' : ''}`}
          onClick={handleStreakCheckIn}
          title="Claim daily learning streak"
        >
          <div className="stat-icon-box" style={{ background: 'rgba(245, 158, 11, 0.18)', color: '#fcd34d' }}>
            <Flame size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-value" style={{ fontSize: '1.2rem', color: '#fcd34d' }}>
              {streakCheckedIn ? 'Checked In ✓' : 'Claim Streak'}
            </span>
            <span className="stat-label">Daily Streak</span>
          </div>
        </button>
      </div>

      {/* 3. Search, Filter & View Mode Bar */}
      <div className="search-filter-container">
        <div style={{ display: 'flex', gap: '12px', width: '100%', flexWrap: 'wrap', alignItems: 'center' }}>
          <div className="search-input-wrapper" style={{ flex: 1, minWidth: '240px' }}>
            <Search size={18} className="search-icon-pos" />
            <input
              type="text"
              className="form-control search-input"
              placeholder="Search by title, AI model, or instructor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Sort Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <SlidersHorizontal size={16} color="var(--text-dim)" />
            <select
              className="form-control"
              style={{ width: 'auto', padding: '0.65rem 2rem 0.65rem 0.85rem', fontSize: '0.85rem' }}
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="RECOMMENDED">Sort: Recommended</option>
              <option value="TITLE">Sort: Title (A-Z)</option>
              <option value="PROGRESS">Sort: Highest Progress</option>
            </select>
          </div>

          {/* Grid vs List View Mode Toggle */}
          <div className="view-mode-toggle">
            <button
              type="button"
              className={`view-btn ${viewMode === 'GRID' ? 'active' : ''}`}
              onClick={() => setViewMode('GRID')}
              title="Grid View"
            >
              <LayoutGrid size={16} />
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

        {/* Category Filter Pills */}
        <div className="category-pills-row">
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: 'var(--text-dim)', marginRight: '4px' }}>
            <Filter size={14} /> Category:
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

      {/* 4. Section Header */}
      <div className="section-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <h2>Interactive AI Courses</h2>
        </div>
        {!loading && (
          <span className="badge badge-info">{filteredCourses.length} Courses Found</span>
        )}
      </div>

      {/* 5. Error Alert */}
      {error && (
        <div className="alert alert-info">
          <AlertCircle size={18} style={{ flexShrink: 0 }} />
          <span>{error} Showing offline interactive catalog.</span>
        </div>
      )}

      {/* 6. Loading Skeleton State */}
      {loading && <CourseGridSkeleton count={6} />}

      {/* 7. Empty State */}
      {!loading && filteredCourses.length === 0 && (
        <div className="state-card glass-card">
          <div className="state-icon-wrapper">
            <BookOpen size={32} />
          </div>
          <h3>No Courses Match Your Filter</h3>
          <p>Try searching for a different keyword or resetting your category filter.</p>
          <button
            type="button"
            onClick={() => { setSearchTerm(''); setSelectedCategory('ALL'); }}
            className="btn btn-secondary btn-sm"
            style={{ marginTop: '8px' }}
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* 8. GRID VIEW MODE */}
      {!loading && filteredCourses.length > 0 && viewMode === 'GRID' && (
        <div className="courses-grid">
          {filteredCourses.map((course) => {
            const courseId = course.id || course._id;
            const progress = userProgressMap[courseId];
            const isEnrolled = progress !== undefined;
            const badgeClass = getCategoryBadgeClass(course.category);

            return (
              <div key={courseId} className="course-card glass-card glass-card-hover" style={{ borderTop: '3px solid var(--primary)' }}>
                <div className="course-card-body">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className={`badge ${badgeClass}`}>
                      {course.category || 'AI & ML'}
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {course.rating && (
                        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#fcd34d' }}>
                          {course.rating}
                        </span>
                      )}
                      {isEnrolled && (
                        <span className="badge badge-success" style={{ gap: '3px' }}>
                          <CheckCircle2 size={11} /> Enrolled
                        </span>
                      )}
                    </div>
                  </div>

                  <h3 className="course-title">{course.title || course.name}</h3>
                  <p className="course-description">{course.description}</p>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', color: 'var(--text-dim)' }}>
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
                    <div className="progress-section">
                      <div className="progress-label">
                        <span>Progress</span>
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
                        <div
                          className="progress-bar-fill"
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="course-card-footer" style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => setPreviewCourse(course)}
                    className="btn btn-secondary btn-sm"
                    title="Quick preview syllabus"
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

      {/* 8. LIST VIEW MODE */}
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
                    <span style={{ fontSize: '0.75rem', color: '#fcd34d', fontWeight: 600 }}>{course.rating}</span>
                    {isEnrolled && <span className="badge badge-success">Enrolled</span>}
                  </div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>{course.title}</h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineClamp: 2 }}>{course.description}</p>
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
                    onClick={() => setPreviewCourse(course)}
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

      {/* 9. Interactive Quick Preview Modal */}
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

            {previewCourse.modules && previewCourse.modules.length > 0 && (
              <div>
                <h4 style={{ fontSize: '0.9rem', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: '8px' }}>
                  Course Syllabus Highlights
                </h4>
                <div className="modal-syllabus-list">
                  {previewCourse.modules.map((mod, idx) => (
                    <div key={idx} className="syllabus-item">
                      <CheckCircle2 size={16} color="var(--success)" />
                      <span>{mod}</span>
                    </div>
                  ))}
                </div>
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
    </div>
  );
};

export default DashboardPage;
