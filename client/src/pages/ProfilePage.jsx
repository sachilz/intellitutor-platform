import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { isInstructor, getDefaultDashboard } from '../utils/roleUtils';
import Avatar from '../components/Avatar';
import {
  User,
  Mail,
  ShieldCheck,
  Key,
  Hash,
  CheckCircle2,
  Copy,
  Award,
  Flame,
  Sparkles,
  Shield,
  Zap,
  Lock,
  Camera,
  Upload,
  Edit3,
  Check,
  X,
  Trash2,
  Target,
  ArrowLeft,
  Image as ImageIcon,
  Globe,
  BookOpen,
  Clock,
  TrendingUp,
  Star,
  ChevronRight,
  Activity,
  Eye,
  EyeOff,
  Settings,
  Bell,
  GraduationCap,
  FileText,
  Users,
  Briefcase,
} from 'lucide-react';

const PRESET_AVATARS = [
  { id: 'av1', label: 'Cyber AI', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80' },
  { id: 'av2', label: 'Tech Dev', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80' },
  { id: 'av3', label: 'AI Architect', url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80' },
  { id: 'av4', label: 'Data Specialist', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80' },
  { id: 'av5', label: 'ML Lead', url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80' },
  { id: 'av6', label: 'Quantum Scholar', url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=300&q=80' },
];

const PRESET_COVERS = [
  { id: 'c1', label: 'Cosmic Aurora', style: 'linear-gradient(135deg, rgba(88, 28, 135, 0.9) 0%, rgba(15, 23, 42, 0.95) 50%, rgba(6, 182, 212, 0.8) 100%)' },
  { id: 'c2', label: 'Cyberpunk Neon', style: 'linear-gradient(135deg, rgba(236, 72, 153, 0.85) 0%, rgba(15, 23, 42, 0.95) 50%, rgba(99, 102, 241, 0.9) 100%)' },
  { id: 'c3', label: 'Emerald Matrix', style: 'linear-gradient(135deg, rgba(16, 185, 129, 0.85) 0%, rgba(15, 23, 42, 0.95) 50%, rgba(6, 182, 212, 0.8) 100%)' },
  { id: 'c4', label: 'Deep Space AI', style: 'linear-gradient(135deg, rgba(15, 23, 42, 0.98) 0%, rgba(30, 41, 59, 0.95) 100%)' },
  { id: 'c5', label: 'Solar Flare', style: 'linear-gradient(135deg, rgba(245, 158, 11, 0.85) 0%, rgba(15, 23, 42, 0.95) 50%, rgba(239, 68, 68, 0.8) 100%)' },
  { id: 'c6', label: 'Vanguard Violet', style: 'linear-gradient(135deg, rgba(168, 85, 247, 0.85) 0%, rgba(15, 23, 42, 0.95) 50%, rgba(59, 130, 246, 0.8) 100%)' },
];

const AI_TRACKS = [
  'GenAI & Prompting',
  'Machine Learning',
  'Data Science & Analytics',
  'Full Stack & Cloud',
  'Cybersecurity & Auth',
];

const TEACHING_SPECIALTIES = [
  'Computer Science',
  'Artificial Intelligence',
  'Web Development',
  'Data Science',
  'Cybersecurity',
  'Software Engineering',
];

const ProfilePage = () => {
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const { addToast } = useToast();
  const isInstructorUser = isInstructor(user);
  const [activeSection, setActiveSection] = useState('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const coverRef = useRef(null);

  // Persisted profile data
  const [profileData, setProfileData] = useState(() => {
    try {
      const saved = localStorage.getItem('intellilearn_profile_data');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Always keep role in sync with auth state
        parsed.role = isInstructor(user) ? 'Instructor' : 'Standard Learner';
        return parsed;
      }
      return {
        username: user?.username || 'student1',
        email: user?.email || 'student1@example.com',
        bio: isInstructor(user)
          ? 'Experienced Educator & Course Creator on IntelliLearn.'
          : 'Passionate AI Learner & Prompt Engineering Enthusiast.',
        track: isInstructor(user) ? 'Computer Science' : 'GenAI & Prompting',
        role: isInstructor(user) ? 'Instructor' : 'Standard Learner'
      };
    } catch {
      return {
        username: user?.username || 'student1',
        email: user?.email || 'student1@example.com',
        bio: isInstructor(user)
          ? 'Experienced Educator & Course Creator on IntelliLearn.'
          : 'Passionate AI Learner & Prompt Engineering Enthusiast.',
        track: isInstructor(user) ? 'Computer Science' : 'GenAI & Prompting',
        role: isInstructor(user) ? 'Instructor' : 'Standard Learner'
      };
    }
  });

  const [currentAvatar, setCurrentAvatar] = useState(() => localStorage.getItem('intellilearn_user_avatar') || '');
  const [currentCover, setCurrentCover] = useState(() => localStorage.getItem('intellilearn_cover_photo') || PRESET_COVERS[0].style);
  const [editForm, setEditForm] = useState({ ...profileData });
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [showCoverModal, setShowCoverModal] = useState(false);
  const [showTokenPreview, setShowTokenPreview] = useState(false);

  // Parallax cover effect
  const handleCoverMouseMove = (e) => {
    if (!coverRef.current) return;
    const rect = coverRef.current.getBoundingClientRect();
    setMousePos({
      x: ((e.clientX - rect.left) / rect.width - 0.5) * 20,
      y: ((e.clientY - rect.top) / rect.height - 0.5) * 20,
    });
  };

  // Achievement data — role-aware
  const studentAchievements = [
    { icon: '🏆', title: 'First Enrollment', desc: 'Registered for your first AI course', unlocked: true, color: '#06b6d4' },
    { icon: '⚡', title: 'AI Explorer', desc: 'Asked your first AI tutor question', unlocked: true, color: '#a855f7' },
    { icon: '🔥', title: 'Streak Master', desc: '7-day consecutive learning streak', unlocked: true, color: '#f59e0b' },
    { icon: '🎯', title: 'Course Mastery', desc: 'Complete all modules in any course', unlocked: false, color: '#6b7280' },
    { icon: '🌟', title: 'Top Performer', desc: 'Score 100% in a course assessment', unlocked: false, color: '#6b7280' },
    { icon: '💎', title: 'Diamond Scholar', desc: 'Complete 5 courses with mastery', unlocked: false, color: '#6b7280' },
  ];

  const instructorAchievements = [
    { icon: '🎓', title: 'Course Creator', desc: 'Published your first course', unlocked: true, color: '#6366f1' },
    { icon: '📝', title: 'Quiz Master', desc: 'Created your first quiz assessment', unlocked: true, color: '#06b6d4' },
    { icon: '🔥', title: 'Active Educator', desc: 'Maintained an active teaching streak', unlocked: true, color: '#f59e0b' },
    { icon: '👥', title: 'Student Magnet', desc: 'Attract 50+ enrolled students', unlocked: false, color: '#6b7280' },
    { icon: '⭐', title: 'Top Rated', desc: 'Receive a 4.5+ average course rating', unlocked: false, color: '#6b7280' },
    { icon: '💎', title: 'Platform Expert', desc: 'Publish 10+ courses with high completion', unlocked: false, color: '#6b7280' },
  ];

  const achievements = isInstructorUser ? instructorAchievements : studentAchievements;

  // Save profile
  const handleSaveProfile = (e) => {
    if (e) e.preventDefault();
    setProfileData({ ...editForm });
    try {
      localStorage.setItem('intellilearn_profile_data', JSON.stringify(editForm));
      window.dispatchEvent(new Event('profile_updated'));
      addToast('Profile updated successfully! 🎉', 'success', 'Profile Updated');
      setIsEditing(false);
    } catch {
      addToast('Failed to save profile updates', 'error', 'Error');
    }
  };

  // Upload handlers
  const handleImageFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      addToast('Please select an image smaller than 5MB', 'warning', 'File Too Large');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64Data = e.target.result;
      setCurrentAvatar(base64Data);
      localStorage.setItem('intellilearn_user_avatar', base64Data);
      window.dispatchEvent(new Event('avatar_updated'));
      addToast('Profile picture uploaded! 📸', 'success', 'Avatar Updated');
      setShowAvatarModal(false);
    };
    reader.readAsDataURL(file);
  };

  const handleCoverFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      addToast('Image must be under 5MB', 'warning', 'File Too Large');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const bgStyle = `url("${e.target.result}") center/cover no-repeat`;
      setCurrentCover(bgStyle);
      localStorage.setItem('intellilearn_cover_photo', bgStyle);
      addToast('Cover photo updated! 🎨', 'success', 'Cover Updated');
      setShowCoverModal(false);
    };
    reader.readAsDataURL(file);
  };

  const handleSelectPresetAvatar = (url) => {
    setCurrentAvatar(url);
    localStorage.setItem('intellilearn_user_avatar', url);
    window.dispatchEvent(new Event('avatar_updated'));
    addToast('Avatar updated! ✨', 'success', 'Avatar Updated');
    setShowAvatarModal(false);
  };

  const handleSelectPresetCover = (style) => {
    setCurrentCover(style);
    localStorage.setItem('intellilearn_cover_photo', style);
    addToast('Cover theme updated! 🎨', 'success', 'Cover Updated');
    setShowCoverModal(false);
  };

  const handleRemoveAvatar = () => {
    setCurrentAvatar('');
    localStorage.removeItem('intellilearn_user_avatar');
    window.dispatchEvent(new Event('avatar_updated'));
    addToast('Profile picture removed', 'info', 'Avatar Reset');
    setShowAvatarModal(false);
  };

  const handleCopy = (text, label) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    addToast(`Copied ${label}!`, 'success', 'Copied');
  };

  const navItems = [
    { id: 'overview', label: 'Overview', icon: User },
    { id: 'edit', label: 'Edit Profile', icon: Edit3 },
    { id: 'badges', label: isInstructorUser ? 'Milestones' : 'Achievements', icon: Award },
    { id: 'security', label: 'Security', icon: Shield },
  ];

  const unlockedCount = achievements.filter(a => a.unlocked).length;

  return (
    <div style={{ width: '100%', maxWidth: '1200px', margin: '0 auto', padding: '0 16px 40px' }}>

      {/* ── FLOATING TOP BAR ── */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '12px 0', marginBottom: '8px'
      }}>
        <button
          onClick={() => navigate(getDefaultDashboard(user))}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
            color: '#94a3b8', padding: '8px 16px', borderRadius: '12px', cursor: 'pointer',
            fontSize: '0.85rem', fontWeight: 600, transition: 'all 0.2s ease',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(99,102,241,0.15)'; e.currentTarget.style.color = '#c7d2fe'; e.currentTarget.style.borderColor = 'rgba(99,102,241,0.4)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = '#94a3b8'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }}
        >
          <ArrowLeft size={16} /> {isInstructorUser ? 'Back to Instructor Dashboard' : 'Back to Dashboard'}
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: '#64748b' }}>
          <Activity size={14} color="#06b6d4" />
          <span style={{ color: '#22d3ee' }}>Online</span>
          <span>•</span>
          <span>{isInstructorUser ? 'Instructor Profile' : 'Member Profile'}</span>
        </div>
      </div>

      {/* ── COVER BANNER WITH PARALLAX ── */}
      <div
        ref={coverRef}
        onMouseMove={handleCoverMouseMove}
        onMouseLeave={() => setMousePos({ x: 0, y: 0 })}
        style={{
          height: '240px',
          background: currentCover,
          borderRadius: '24px 24px 0 0',
          position: 'relative',
          overflow: 'hidden',
          cursor: 'pointer',
          transition: 'background 0.4s ease',
        }}
      >
        {/* Animated floating orbs */}
        <div style={{
          position: 'absolute', width: '300px', height: '300px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)',
          top: -100 + mousePos.y, left: -50 + mousePos.x,
          transition: 'top 0.3s ease, left 0.3s ease', pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', width: '200px', height: '200px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(6,182,212,0.12) 0%, transparent 70%)',
          bottom: -60 - mousePos.y * 0.5, right: -30 - mousePos.x * 0.5,
          transition: 'bottom 0.3s ease, right 0.3s ease', pointerEvents: 'none',
        }} />

        {/* Cover actions */}
        <div style={{ position: 'absolute', top: '16px', right: '16px', display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setShowCoverModal(true)}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(16px)',
              border: '1px solid rgba(255,255,255,0.15)', borderRadius: '10px',
              color: '#e2e8f0', padding: '7px 14px', fontSize: '0.8rem', fontWeight: 600,
              cursor: 'pointer', transition: 'all 0.2s ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(99,102,241,0.4)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(0,0,0,0.45)'; }}
          >
            <ImageIcon size={14} /> Edit Cover
          </button>
        </div>

        {/* Gradient fade at bottom */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: '80px',
          background: 'linear-gradient(to top, rgba(11,15,25,1) 0%, transparent 100%)',
          pointerEvents: 'none',
        }} />
      </div>

      {/* ── MAIN PROFILE CARD ── */}
      <div style={{
        background: 'rgba(11,15,25,0.95)',
        border: '1px solid rgba(255,255,255,0.06)',
        borderTop: 'none',
        borderRadius: '0 0 24px 24px',
        padding: '0 0 32px 0',
      }}>

        {/* ── AVATAR + INFO HEADER ── */}
        <div style={{ padding: '0 32px', marginTop: '-56px', position: 'relative', zIndex: 10 }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '24px', flexWrap: 'wrap' }}>

            {/* Avatar with glow ring */}
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <div style={{
                width: '120px', height: '120px', borderRadius: '50%',
                background: 'conic-gradient(from 0deg, #6366f1, #06b6d4, #a855f7, #ec4899, #6366f1)',
                padding: '3px', boxShadow: '0 0 40px rgba(99,102,241,0.4)',
                animation: 'profileRingSpin 6s linear infinite',
              }}>
                <div style={{
                  width: '100%', height: '100%', borderRadius: '50%',
                  overflow: 'hidden', background: '#0b0f19',
                  border: '3px solid #0b0f19',
                }}>
                  <Avatar name={profileData.username} src={currentAvatar} size={108} />
                </div>
              </div>

              {/* Camera button */}
              <button
                onClick={() => setShowAvatarModal(true)}
                style={{
                  position: 'absolute', bottom: '2px', right: '2px',
                  width: '36px', height: '36px', borderRadius: '50%',
                  background: 'linear-gradient(135deg, #6366f1, #a855f7)',
                  border: '3px solid #0b0f19', color: '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', transition: 'transform 0.2s ease',
                  boxShadow: '0 4px 15px rgba(99,102,241,0.5)',
                }}
                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.15)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                title="Change Profile Picture"
              >
                <Camera size={15} />
              </button>

              {/* Online indicator */}
              <div style={{
                position: 'absolute', top: '8px', right: '8px',
                width: '14px', height: '14px', borderRadius: '50%',
                background: '#22c55e', border: '3px solid #0b0f19',
                boxShadow: '0 0 10px rgba(34,197,94,0.6)',
                animation: 'pulseOnline 2s ease-in-out infinite',
              }} />
            </div>

            {/* Name & Info */}
            <div style={{ flex: 1, minWidth: '200px', paddingBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                <h1 style={{
                  fontSize: '2rem', fontWeight: 900, margin: 0,
                  background: 'linear-gradient(135deg, #e2e8f0 0%, #c7d2fe 50%, #a5b4fc 100%)',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                  letterSpacing: '-0.02em',
                }}>
                  {profileData.username}
                </h1>
                <span style={{
                  background: isInstructorUser
                    ? 'linear-gradient(135deg, rgba(16,185,129,0.2), rgba(6,182,212,0.2))'
                    : 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(168,85,247,0.2))',
                  border: isInstructorUser
                    ? '1px solid rgba(16,185,129,0.4)'
                    : '1px solid rgba(99,102,241,0.3)',
                  borderRadius: '8px',
                  padding: '4px 12px', fontSize: '0.75rem', fontWeight: 700,
                  color: isInstructorUser ? '#6ee7b7' : '#a5b4fc',
                  letterSpacing: '0.02em',
                }}>
                  {isInstructorUser ? '✦ Instructor' : profileData.role}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '8px', flexWrap: 'wrap' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: '#94a3b8' }}>
                  <Mail size={14} color="#64748b" /> {profileData.email}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: '#22d3ee' }}>
                  {isInstructorUser
                    ? <><Briefcase size={14} color="#06b6d4" /> {profileData.track}</>
                    : <><Sparkles size={14} color="#06b6d4" /> {profileData.track}</>}
                </span>
              </div>

              {profileData.bio && (
                <p style={{ margin: '10px 0 0 0', fontSize: '0.88rem', color: '#64748b', lineHeight: 1.5, maxWidth: '480px' }}>
                  {profileData.bio}
                </p>
              )}
            </div>

            {/* Quick action buttons */}
            <div style={{ display: 'flex', gap: '8px', paddingBottom: '8px' }}>
              <button
                onClick={() => { setEditForm({ ...profileData }); setActiveSection('edit'); setIsEditing(true); }}
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  background: 'linear-gradient(135deg, #6366f1, #a855f7)',
                  border: 'none', borderRadius: '12px', color: '#fff',
                  padding: '10px 20px', fontSize: '0.85rem', fontWeight: 700,
                  cursor: 'pointer', transition: 'all 0.2s ease',
                  boxShadow: '0 4px 20px rgba(99,102,241,0.4)',
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 30px rgba(99,102,241,0.5)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(99,102,241,0.4)'; }}
              >
                <Edit3 size={15} /> Edit Profile
              </button>
            </div>
          </div>
        </div>

        {/* ── STATS ROW ── */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: '12px', padding: '24px 32px 0',
        }}>
          {(isInstructorUser ? [
            { label: 'Milestones', value: `${unlockedCount}/${achievements.length}`, icon: Award, color: '#a855f7', bg: 'rgba(168,85,247,0.1)', border: 'rgba(168,85,247,0.25)' },
            { label: 'Teaching Role', value: 'Instructor', icon: GraduationCap, color: '#6366f1', bg: 'rgba(99,102,241,0.1)', border: 'rgba(99,102,241,0.25)' },
            { label: 'Auth Provider', value: 'Keycloak SSO', icon: ShieldCheck, color: '#22d3ee', bg: 'rgba(6,182,212,0.1)', border: 'rgba(6,182,212,0.25)' },
            { label: 'Session Status', value: 'Active', icon: Activity, color: '#22c55e', bg: 'rgba(34,197,94,0.1)', border: 'rgba(34,197,94,0.25)' },
          ] : [
            { label: 'Achievements', value: `${unlockedCount}/${achievements.length}`, icon: Award, color: '#a855f7', bg: 'rgba(168,85,247,0.1)', border: 'rgba(168,85,247,0.25)' },
            { label: 'Learning Streak', value: '7 Days', icon: Flame, color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.25)' },
            { label: 'Auth Provider', value: 'Keycloak SSO', icon: ShieldCheck, color: '#22d3ee', bg: 'rgba(6,182,212,0.1)', border: 'rgba(6,182,212,0.25)' },
            { label: 'Session Status', value: 'Active', icon: Activity, color: '#22c55e', bg: 'rgba(34,197,94,0.1)', border: 'rgba(34,197,94,0.25)' },
          ]).map((stat, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: '14px',
              background: stat.bg, border: `1px solid ${stat.border}`,
              borderRadius: '16px', padding: '16px 18px',
              transition: 'all 0.25s ease', cursor: 'default',
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = `0 8px 25px ${stat.border}`; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
            >
              <div style={{
                width: '42px', height: '42px', borderRadius: '12px',
                background: stat.bg, display: 'flex', alignItems: 'center',
                justifyContent: 'center', border: `1px solid ${stat.border}`,
              }}>
                <stat.icon size={20} color={stat.color} />
              </div>
              <div>
                <div style={{ fontSize: '1.05rem', fontWeight: 800, color: stat.color }}>{stat.value}</div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>{stat.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* ── NAVIGATION TABS ── */}
        <div style={{
          display: 'flex', gap: '4px', padding: '24px 32px 0',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}>
          {navItems.map(item => {
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => { setActiveSection(item.id); if (item.id === 'edit') { setEditForm({ ...profileData }); setIsEditing(true); } }}
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  padding: '12px 20px', borderRadius: '12px 12px 0 0',
                  background: isActive ? 'rgba(99,102,241,0.1)' : 'transparent',
                  border: 'none', borderBottom: isActive ? '2px solid #6366f1' : '2px solid transparent',
                  color: isActive ? '#a5b4fc' : '#64748b',
                  fontSize: '0.85rem', fontWeight: isActive ? 700 : 600,
                  cursor: 'pointer', transition: 'all 0.2s ease',
                }}
                onMouseEnter={e => { if (!isActive) e.currentTarget.style.color = '#94a3b8'; }}
                onMouseLeave={e => { if (!isActive) e.currentTarget.style.color = '#64748b'; }}
              >
                <item.icon size={16} />
                {item.label}
              </button>
            );
          })}
        </div>

        {/* ── SECTION CONTENT ── */}
        <div style={{ padding: '24px 32px' }}>

          {/* OVERVIEW */}
          {activeSection === 'overview' && (
            <div style={{ animation: 'profileFadeIn 0.35s ease' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#e2e8f0', margin: '0 0 20px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <User size={18} color="#a5b4fc" /> Account Information
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', borderRadius: '16px', overflow: 'hidden' }}>
                {[
                  { icon: Hash, label: 'User ID', value: user?.id || '6a78a860f4df8c05bf35f77f', mono: true, copyable: true },
                  { icon: User, label: 'Display Name', value: profileData.username },
                  { icon: Mail, label: 'Email Address', value: profileData.email },
                  { icon: isInstructorUser ? Briefcase : Target, label: isInstructorUser ? 'Professional Bio' : 'Learning Bio', value: profileData.bio, muted: true },
                  { icon: isInstructorUser ? GraduationCap : Sparkles, label: isInstructorUser ? 'Teaching Specialty' : 'AI Track', value: profileData.track, badge: true },
                  { icon: Globe, label: 'Role', value: isInstructorUser ? 'Instructor' : profileData.role },
                ].map((row, i) => (
                  <div key={i} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '16px 20px',
                    background: i % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.04)',
                    transition: 'background 0.2s ease',
                  }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(99,102,241,0.06)'}
                    onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.04)'}
                  >
                    <span style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#94a3b8', fontSize: '0.88rem', fontWeight: 600 }}>
                      <row.icon size={16} color="#6366f1" /> {row.label}
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {row.badge ? (
                        <span style={{
                          background: 'linear-gradient(135deg, rgba(6,182,212,0.15), rgba(99,102,241,0.15))',
                          border: '1px solid rgba(6,182,212,0.3)', borderRadius: '8px',
                          padding: '4px 12px', fontSize: '0.82rem', fontWeight: 700, color: '#22d3ee',
                        }}>
                          {row.value}
                        </span>
                      ) : (
                        <span style={{
                          fontSize: '0.88rem', fontWeight: row.mono ? 500 : 700,
                          color: row.muted ? '#64748b' : '#e2e8f0',
                          fontFamily: row.mono ? "'JetBrains Mono', monospace" : 'inherit',
                          maxWidth: '400px', overflow: 'hidden', textOverflow: 'ellipsis',
                        }}>
                          {row.value}
                        </span>
                      )}
                      {row.copyable && (
                        <button
                          onClick={() => handleCopy(row.value, row.label)}
                          style={{
                            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '6px', padding: '4px 8px', cursor: 'pointer',
                            color: '#94a3b8', transition: 'all 0.15s ease', display: 'flex',
                          }}
                          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(99,102,241,0.2)'; e.currentTarget.style.color = '#c7d2fe'; }}
                          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = '#94a3b8'; }}
                        >
                          <Copy size={12} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* EDIT PROFILE */}
          {activeSection === 'edit' && (
            <form onSubmit={handleSaveProfile} style={{ animation: 'profileFadeIn 0.35s ease' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#e2e8f0', margin: '0 0 20px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Edit3 size={18} color="#a5b4fc" /> Edit Profile Details
              </h3>

              <div style={{
                display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '16px',
              }}>
                {/* Display Name */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#94a3b8', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Display Name
                  </label>
                  <input
                    type="text"
                    value={editForm.username}
                    onChange={e => setEditForm({ ...editForm, username: e.target.value })}
                    required
                    style={{
                      width: '100%', padding: '12px 16px', borderRadius: '12px',
                      background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
                      color: '#e2e8f0', fontSize: '0.9rem', fontWeight: 600,
                      outline: 'none', transition: 'all 0.2s ease', boxSizing: 'border-box',
                    }}
                    onFocus={e => { e.target.style.borderColor = '#6366f1'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.15)'; }}
                    onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; e.target.style.boxShadow = 'none'; }}
                  />
                </div>

                {/* Email */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#94a3b8', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={e => setEditForm({ ...editForm, email: e.target.value })}
                    required
                    style={{
                      width: '100%', padding: '12px 16px', borderRadius: '12px',
                      background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
                      color: '#e2e8f0', fontSize: '0.9rem', fontWeight: 600,
                      outline: 'none', transition: 'all 0.2s ease', boxSizing: 'border-box',
                    }}
                    onFocus={e => { e.target.style.borderColor = '#6366f1'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.15)'; }}
                    onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; e.target.style.boxShadow = 'none'; }}
                  />
                </div>
              </div>

              {/* Bio */}
              <div style={{ marginTop: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#94a3b8', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {isInstructorUser ? 'Professional Bio' : 'Learning Bio'}
                </label>
                <textarea
                  rows={3}
                  value={editForm.bio}
                  onChange={e => setEditForm({ ...editForm, bio: e.target.value })}
                  style={{
                    width: '100%', padding: '12px 16px', borderRadius: '12px',
                    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
                    color: '#e2e8f0', fontSize: '0.9rem', fontWeight: 500, resize: 'vertical',
                    outline: 'none', transition: 'all 0.2s ease', fontFamily: 'inherit', boxSizing: 'border-box',
                  }}
                  onFocus={e => { e.target.style.borderColor = '#6366f1'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.15)'; }}
                  onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; e.target.style.boxShadow = 'none'; }}
                />
              </div>

              {/* Track */}
              <div style={{ marginTop: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#94a3b8', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {isInstructorUser ? 'Teaching Specialty' : 'AI Specialization Track'}
                </label>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {(isInstructorUser ? TEACHING_SPECIALTIES : AI_TRACKS).map(track => {
                    const isSelected = editForm.track === track;
                    return (
                      <button
                        key={track}
                        type="button"
                        onClick={() => setEditForm({ ...editForm, track })}
                        style={{
                          padding: '10px 18px', borderRadius: '12px',
                          background: isSelected ? 'linear-gradient(135deg, rgba(99,102,241,0.25), rgba(168,85,247,0.2))' : 'rgba(255,255,255,0.03)',
                          border: isSelected ? '1px solid rgba(99,102,241,0.5)' : '1px solid rgba(255,255,255,0.08)',
                          color: isSelected ? '#a5b4fc' : '#64748b',
                          fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer',
                          transition: 'all 0.2s ease',
                        }}
                        onMouseEnter={e => { if (!isSelected) { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; e.currentTarget.style.color = '#94a3b8'; }}}
                        onMouseLeave={e => { if (!isSelected) { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = '#64748b'; }}}
                      >
                        {isSelected && <Check size={14} style={{ marginRight: '6px', verticalAlign: 'middle' }} />}
                        {track}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Save / Cancel */}
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '28px', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <button
                  type="button"
                  onClick={() => setActiveSection('overview')}
                  style={{
                    padding: '10px 24px', borderRadius: '12px',
                    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
                    color: '#94a3b8', fontSize: '0.85rem', fontWeight: 700,
                    cursor: 'pointer', transition: 'all 0.2s ease',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    display: 'flex', alignItems: 'center', gap: '8px',
                    padding: '10px 28px', borderRadius: '12px',
                    background: 'linear-gradient(135deg, #6366f1, #a855f7)',
                    border: 'none', color: '#fff', fontSize: '0.85rem', fontWeight: 700,
                    cursor: 'pointer', transition: 'all 0.2s ease',
                    boxShadow: '0 4px 20px rgba(99,102,241,0.4)',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 30px rgba(99,102,241,0.5)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(99,102,241,0.4)'; }}
                >
                  <Check size={16} /> Save Changes
                </button>
              </div>
            </form>
          )}

          {/* ACHIEVEMENTS */}
          {activeSection === 'badges' && (
            <div style={{ animation: 'profileFadeIn 0.35s ease' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#e2e8f0', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Award size={18} color="#a5b4fc" /> {isInstructorUser ? 'Teaching Milestones' : 'Learning Achievements'}
                </h3>
                <span style={{
                  background: 'linear-gradient(135deg, rgba(168,85,247,0.15), rgba(99,102,241,0.15))',
                  border: '1px solid rgba(168,85,247,0.3)', borderRadius: '20px',
                  padding: '4px 14px', fontSize: '0.8rem', fontWeight: 700, color: '#c084fc',
                }}>
                  {unlockedCount} of {achievements.length} Unlocked
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '14px' }}>
                {achievements.map((ach, i) => (
                  <div key={i} style={{
                    padding: '20px', borderRadius: '16px',
                    background: ach.unlocked ? `linear-gradient(135deg, ${ach.color}10, ${ach.color}05)` : 'rgba(255,255,255,0.02)',
                    border: `1px solid ${ach.unlocked ? ach.color + '40' : 'rgba(255,255,255,0.06)'}`,
                    transition: 'all 0.25s ease', cursor: 'default',
                    opacity: ach.unlocked ? 1 : 0.5,
                    position: 'relative', overflow: 'hidden',
                  }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = `0 12px 30px ${ach.color}25`; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
                  >
                    <div style={{ fontSize: '2rem', marginBottom: '10px' }}>{ach.icon}</div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 800, color: ach.unlocked ? '#e2e8f0' : '#475569', marginBottom: '4px' }}>
                      {ach.title}
                    </div>
                    <p style={{ fontSize: '0.78rem', color: '#64748b', margin: 0, lineHeight: 1.4 }}>
                      {ach.desc}
                    </p>
                    {ach.unlocked && (
                      <div style={{
                        position: 'absolute', top: '12px', right: '12px',
                        display: 'flex', alignItems: 'center', gap: '4px',
                        fontSize: '0.7rem', fontWeight: 700, color: ach.color,
                      }}>
                        <CheckCircle2 size={12} /> Unlocked
                      </div>
                    )}
                    {!ach.unlocked && (
                      <div style={{
                        position: 'absolute', top: '12px', right: '12px',
                        display: 'flex', alignItems: 'center', gap: '4px',
                        fontSize: '0.7rem', fontWeight: 700, color: '#475569',
                      }}>
                        <Lock size={11} /> Locked
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECURITY */}
          {activeSection === 'security' && (
            <div style={{ animation: 'profileFadeIn 0.35s ease' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#e2e8f0', margin: '0 0 20px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Shield size={18} color="#a5b4fc" /> Security & Session
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {/* Session State */}
                <div style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '18px 22px', borderRadius: '14px',
                  background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.2)',
                }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#94a3b8', fontSize: '0.88rem', fontWeight: 600 }}>
                    <Key size={16} color="#22c55e" /> Session Status
                  </span>
                  <span style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)',
                    borderRadius: '8px', padding: '5px 14px', fontSize: '0.82rem', fontWeight: 700, color: '#4ade80',
                  }}>
                    <CheckCircle2 size={13} /> {token ? 'Active JWT Session' : 'No Active Token'}
                  </span>
                </div>

                {/* Token Inspector */}
                <div style={{
                  padding: '18px 22px', borderRadius: '14px',
                  background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#94a3b8', fontSize: '0.88rem', fontWeight: 600 }}>
                      <Lock size={16} color="#f59e0b" /> Auth Token Signature
                    </span>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        onClick={() => setShowTokenPreview(!showTokenPreview)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '4px',
                          background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: '6px', padding: '4px 10px', cursor: 'pointer',
                          color: '#94a3b8', fontSize: '0.75rem', fontWeight: 600, transition: 'all 0.15s ease',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(99,102,241,0.15)'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
                      >
                        {showTokenPreview ? <EyeOff size={12} /> : <Eye size={12} />}
                        {showTokenPreview ? 'Hide' : 'Reveal'}
                      </button>
                      {token && (
                        <button
                          onClick={() => handleCopy(token, 'Token')}
                          style={{
                            display: 'flex', alignItems: 'center', gap: '4px',
                            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '6px', padding: '4px 10px', cursor: 'pointer',
                            color: '#94a3b8', fontSize: '0.75rem', fontWeight: 600, transition: 'all 0.15s ease',
                          }}
                          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(99,102,241,0.15)'; }}
                          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
                        >
                          <Copy size={12} /> Copy
                        </button>
                      )}
                    </div>
                  </div>
                  <div style={{
                    padding: '12px 16px', borderRadius: '10px',
                    background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.05)',
                    fontFamily: "'JetBrains Mono', monospace", fontSize: '0.75rem',
                    color: '#64748b', wordBreak: 'break-all', lineHeight: 1.5,
                  }}>
                    {showTokenPreview
                      ? (token || 'No token available')
                      : (token ? '•'.repeat(Math.min(token.length, 60)) + '...' : 'Unauthenticated')
                    }
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── AVATAR PICKER MODAL ── */}
      {showAvatarModal && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 999999,
          background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '16px', animation: 'profileFadeIn 0.2s ease',
        }}
          onClick={e => { if (e.target === e.currentTarget) setShowAvatarModal(false); }}
        >
          <div style={{
            maxWidth: '520px', width: '100%', padding: '28px',
            background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)',
            border: '1px solid rgba(99,102,241,0.3)', borderRadius: '24px',
            boxShadow: '0 25px 60px rgba(0,0,0,0.7)',
            animation: 'profileSlideUp 0.3s ease',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '40px', height: '40px', borderRadius: '12px',
                  background: 'linear-gradient(135deg, #6366f1, #a855f7)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Camera size={20} color="#fff" />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, color: '#e2e8f0' }}>Profile Picture</h3>
                  <p style={{ fontSize: '0.75rem', color: '#64748b', margin: 0 }}>Choose or upload your avatar</p>
                </div>
              </div>
              <button
                onClick={() => setShowAvatarModal(false)}
                style={{
                  width: '32px', height: '32px', borderRadius: '8px',
                  background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                  color: '#94a3b8', cursor: 'pointer', display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Upload zone */}
            <label style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px',
              padding: '24px', borderRadius: '16px', cursor: 'pointer',
              border: '2px dashed rgba(99,102,241,0.3)',
              background: 'rgba(99,102,241,0.05)', marginBottom: '20px',
              transition: 'all 0.2s ease',
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(99,102,241,0.6)'; e.currentTarget.style.background = 'rgba(99,102,241,0.1)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(99,102,241,0.3)'; e.currentTarget.style.background = 'rgba(99,102,241,0.05)'; }}
            >
              <Upload size={28} color="#6366f1" />
              <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#c7d2fe' }}>Upload from Computer</span>
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>PNG, JPG, WEBP • Max 5MB</span>
              <input type="file" accept="image/*" onChange={handleImageFileUpload} style={{ display: 'none' }} />
            </label>

            {/* Preset grid */}
            <div style={{ marginBottom: '20px' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                AI Preset Avatars
              </span>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                {PRESET_AVATARS.map(item => (
                  <button
                    key={item.id}
                    onClick={() => handleSelectPresetAvatar(item.url)}
                    style={{
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
                      padding: '12px', borderRadius: '14px', cursor: 'pointer',
                      background: currentAvatar === item.url ? 'rgba(99,102,241,0.15)' : 'rgba(255,255,255,0.03)',
                      border: currentAvatar === item.url ? '2px solid #6366f1' : '1px solid rgba(255,255,255,0.06)',
                      transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={e => { if (currentAvatar !== item.url) e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}
                    onMouseLeave={e => { if (currentAvatar !== item.url) e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
                  >
                    <img src={item.url} alt={item.label} style={{ width: '52px', height: '52px', borderRadius: '50%', objectFit: 'cover' }} />
                    <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 600 }}>{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '16px' }}>
              {currentAvatar ? (
                <button
                  onClick={handleRemoveAvatar}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
                    borderRadius: '10px', padding: '8px 16px', cursor: 'pointer',
                    color: '#fca5a5', fontSize: '0.82rem', fontWeight: 700, transition: 'all 0.2s ease',
                  }}
                >
                  <Trash2 size={14} /> Remove
                </button>
              ) : <div />}
              <button
                onClick={() => setShowAvatarModal(false)}
                style={{
                  padding: '8px 20px', borderRadius: '10px',
                  background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                  color: '#94a3b8', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer',
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── COVER PICKER MODAL ── */}
      {showCoverModal && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 999999,
          background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '16px', animation: 'profileFadeIn 0.2s ease',
        }}
          onClick={e => { if (e.target === e.currentTarget) setShowCoverModal(false); }}
        >
          <div style={{
            maxWidth: '560px', width: '100%', padding: '28px',
            background: 'linear-gradient(135deg, #0f172a 0%, #0c1e3a 100%)',
            border: '1px solid rgba(6,182,212,0.3)', borderRadius: '24px',
            boxShadow: '0 25px 60px rgba(0,0,0,0.7)',
            animation: 'profileSlideUp 0.3s ease',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '40px', height: '40px', borderRadius: '12px',
                  background: 'linear-gradient(135deg, #06b6d4, #3b82f6)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <ImageIcon size={20} color="#fff" />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, color: '#e2e8f0' }}>Cover Banner</h3>
                  <p style={{ fontSize: '0.75rem', color: '#64748b', margin: 0 }}>Customize your profile banner</p>
                </div>
              </div>
              <button
                onClick={() => setShowCoverModal(false)}
                style={{
                  width: '32px', height: '32px', borderRadius: '8px',
                  background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                  color: '#94a3b8', cursor: 'pointer', display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Upload zone */}
            <label style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px',
              padding: '24px', borderRadius: '16px', cursor: 'pointer',
              border: '2px dashed rgba(6,182,212,0.3)',
              background: 'rgba(6,182,212,0.05)', marginBottom: '20px',
              transition: 'all 0.2s ease',
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(6,182,212,0.6)'; e.currentTarget.style.background = 'rgba(6,182,212,0.1)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(6,182,212,0.3)'; e.currentTarget.style.background = 'rgba(6,182,212,0.05)'; }}
            >
              <Upload size={28} color="#06b6d4" />
              <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#67e8f9' }}>Upload Custom Cover Image</span>
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>High-res PNG, JPG, WEBP • Max 5MB</span>
              <input type="file" accept="image/*" onChange={handleCoverFileUpload} style={{ display: 'none' }} />
            </label>

            {/* Preset covers */}
            <div style={{ marginBottom: '20px' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Gradient Themes
              </span>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                {PRESET_COVERS.map(item => (
                  <button
                    key={item.id}
                    onClick={() => handleSelectPresetCover(item.style)}
                    style={{
                      background: item.style, height: '72px', borderRadius: '14px',
                      border: currentCover === item.style ? '3px solid #22d3ee' : '1px solid rgba(255,255,255,0.1)',
                      cursor: 'pointer', display: 'flex', alignItems: 'flex-end',
                      padding: '10px 14px', transition: 'all 0.2s ease',
                      boxShadow: currentCover === item.style ? '0 0 20px rgba(6,182,212,0.3)' : 'none',
                    }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                  >
                    <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#fff', textShadow: '0 2px 6px rgba(0,0,0,0.8)' }}>
                      {item.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '16px' }}>
              <button
                onClick={() => setShowCoverModal(false)}
                style={{
                  padding: '8px 20px', borderRadius: '10px',
                  background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                  color: '#94a3b8', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer',
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── INLINE KEYFRAMES ── */}
      <style>{`
        @keyframes profileRingSpin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes pulseOnline {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(0.85); }
        }
        @keyframes profileFadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes profileSlideUp {
          from { opacity: 0; transform: translateY(24px) scale(0.96); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
};

export default ProfilePage;
