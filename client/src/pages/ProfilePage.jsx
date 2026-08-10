import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
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
  Check,
  Shield,
  Zap,
  Lock,
  ExternalLink
} from 'lucide-react';

const ProfilePage = () => {
  const { user, token } = useAuth();
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState('DETAILS'); // 'DETAILS' | 'BADGES' | 'SECURITY'

  const handleCopy = (text, label) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    addToast(`Copied ${label} to clipboard!`, 'success', 'Copied');
  };

  return (
    <div className="profile-container animate-fade-in" style={{ width: '100%', maxWidth: '100%' }}>
      <div className="glass-card" style={{ overflow: 'hidden', padding: 0, width: '100%' }}>
        {/* Cover Gradient Banner */}
        <div className="profile-cover-banner">
          <div style={{ position: 'absolute', top: '16px', right: '16px' }}>
            <span className="badge badge-success" style={{ gap: '6px', backdropFilter: 'blur(8px)' }}>
              <CheckCircle2 size={13} /> Active Session
            </span>
          </div>
        </div>

        {/* Hero Profile Info Header */}
        <div className="profile-hero-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '16px' }}>
              <div style={{ border: '4px solid var(--bg-dark)', borderRadius: '50%', boxShadow: '0 0 25px rgba(99, 102, 241, 0.4)' }}>
                <Avatar name={user?.username || user?.email || 'User'} size={88} />
              </div>
              <div style={{ marginBottom: '4px' }}>
                <h2 style={{ fontSize: '1.8rem', fontWeight: 800 }}>{user?.username || 'Learner Profile'}</h2>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{user?.email || 'No email registered'}</p>
              </div>
            </div>

            <button
              type="button"
              className="copy-btn"
              onClick={() => handleCopy(user?.id, 'User ID')}
              style={{ padding: '6px 12px', fontSize: '0.8rem' }}
            >
              <Copy size={13} /> Copy User ID
            </button>
          </div>

          {/* Quick Metrics Grid */}
          <div className="stats-overview-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', marginTop: '12px' }}>
            <div className="stat-card" style={{ padding: '16px' }}>
              <div className="stat-icon-box" style={{ background: 'rgba(99, 102, 241, 0.18)', color: '#818cf8', width: '40px', height: '40px' }}>
                <Award size={20} />
              </div>
              <div className="stat-info">
                <span className="stat-value" style={{ fontSize: '1.3rem' }}>3 Trophies</span>
                <span className="stat-label">Achievements</span>
              </div>
            </div>

            <div className="stat-card" style={{ padding: '16px' }}>
              <div className="stat-icon-box" style={{ background: 'rgba(6, 182, 212, 0.18)', color: '#67e8f9', width: '40px', height: '40px' }}>
                <ShieldCheck size={20} />
              </div>
              <div className="stat-info">
                <span className="stat-value" style={{ fontSize: '1.1rem', color: '#67e8f9' }}>Keycloak SSO</span>
                <span className="stat-label">Auth Provider</span>
              </div>
            </div>

            <div className="stat-card" style={{ padding: '16px' }}>
              <div className="stat-icon-box" style={{ background: 'rgba(16, 185, 129, 0.18)', color: '#6ee7b7', width: '40px', height: '40px' }}>
                <Flame size={20} />
              </div>
              <div className="stat-info">
                <span className="stat-value" style={{ fontSize: '1.3rem', color: '#6ee7b7' }}>Active</span>
                <span className="stat-label">Learning Status</span>
              </div>
            </div>
          </div>

          {/* Workspace Tabs Nav */}
          <div className="course-tabs-nav" style={{ marginTop: '8px', marginBottom: 0 }}>
            <button
              className={`tab-btn ${activeTab === 'DETAILS' ? 'active' : ''}`}
              onClick={() => setActiveTab('DETAILS')}
            >
              <User size={16} /> Account Details
            </button>

            <button
              className={`tab-btn ${activeTab === 'BADGES' ? 'active' : ''}`}
              onClick={() => setActiveTab('BADGES')}
            >
              <Award size={16} color="var(--accent)" /> Learning Badges (3)
            </button>

            <button
              className={`tab-btn ${activeTab === 'SECURITY' ? 'active' : ''}`}
              onClick={() => setActiveTab('SECURITY')}
            >
              <Lock size={16} /> Security & Token
            </button>
          </div>

          {/* TAB 1: Account Details */}
          {activeTab === 'DETAILS' && (
            <div className="profile-details animate-fade-in" style={{ marginTop: '8px' }}>
              <div className="detail-row">
                <span className="detail-label">
                  <Hash size={16} color="var(--primary-light)" /> User ID
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="detail-value mono">{user?.id || 'N/A'}</span>
                  <button type="button" className="copy-btn" onClick={() => handleCopy(user?.id, 'User ID')}>
                    <Copy size={12} />
                  </button>
                </div>
              </div>

              <div className="detail-row">
                <span className="detail-label">
                  <User size={16} color="var(--primary-light)" /> Display Name
                </span>
                <span className="detail-value">{user?.username || 'N/A'}</span>
              </div>

              <div className="detail-row">
                <span className="detail-label">
                  <Mail size={16} color="var(--primary-light)" /> Email Address
                </span>
                <span className="detail-value">{user?.email || 'N/A'}</span>
              </div>

              <div className="detail-row">
                <span className="detail-label">
                  <ShieldCheck size={16} color="var(--primary-light)" /> Account Role(s)
                </span>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {user?.roles && user.roles.length > 0 ? (
                    user.roles.map((role) => (
                      <span key={role} className="badge badge-primary">
                        {role}
                      </span>
                    ))
                  ) : (
                    <span className="badge badge-secondary">Standard Learner</span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Learning Badges & Achievements */}
          {activeTab === 'BADGES' && (
            <div className="achievement-grid animate-fade-in" style={{ marginTop: '8px' }}>
              <div className="achievement-card unlocked">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Sparkles size={22} color="var(--neon-cyan)" />
                  <span className="badge badge-info">Unlocked</span>
                </div>
                <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>🏆 First Course Enrollment</div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Registered for your first interactive AI course.</p>
              </div>

              <div className="achievement-card unlocked">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Zap size={22} color="var(--neon-violet)" />
                  <span className="badge badge-primary">Unlocked</span>
                </div>
                <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>⚡ AI Tutor Explorer</div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Asked your first question in the AI sandbox workspace.</p>
              </div>

              <div className="achievement-card unlocked">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Flame size={22} color="#fcd34d" />
                  <span className="badge badge-success">Unlocked</span>
                </div>
                <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>🔥 Daily Streak Master</div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Claimed your daily learning streak bonus.</p>
              </div>

              <div className="achievement-card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Award size={22} color="var(--text-dim)" />
                  <span className="badge badge-secondary">In Progress</span>
                </div>
                <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>🎯 100% Course Mastery</div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Complete all syllabus modules to claim certificate.</p>
              </div>
            </div>
          )}

          {/* TAB 3: Security & Session Inspector */}
          {activeTab === 'SECURITY' && (
            <div className="profile-details animate-fade-in" style={{ marginTop: '8px' }}>
              <div className="detail-row">
                <span className="detail-label">
                  <Key size={16} color="var(--primary-light)" /> Session Token State
                </span>
                <span className="badge badge-success" style={{ gap: '6px' }}>
                  <CheckCircle2 size={13} /> {token ? 'Active JWT in Memory' : 'No Token'}
                </span>
              </div>

              <div className="detail-row" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                  <span className="detail-label">
                    <Shield size={16} color="var(--accent)" /> Encrypted Auth Token Signature
                  </span>
                  {token && (
                    <button type="button" className="copy-btn" onClick={() => handleCopy(token, 'Session Token')}>
                      <Copy size={12} /> Copy Signature
                    </button>
                  )}
                </div>
                <div style={{ width: '100%', padding: '10px', background: 'rgba(11, 17, 32, 0.8)', borderRadius: '8px', border: '1px solid var(--border-color)', wordBreak: 'break-all', fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                  {token ? `${token.substring(0, 85)}...` : 'Unauthenticated'}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
