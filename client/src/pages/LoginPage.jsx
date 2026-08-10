import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { 
  LogIn, 
  AlertCircle, 
  Sparkles, 
  UserCheck, 
  Lock, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  Zap, 
  BookOpen, 
  CheckCircle2, 
  User 
} from 'lucide-react';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const { login, loading, isAuthenticated } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!username || !password) {
      setError('Please enter both username/email and password.');
      return;
    }

    try {
      const userInfo = await login(username, password);
      addToast(`Welcome back, ${userInfo.username || 'Learner'}!`, 'success', 'Signed In');
      navigate('/dashboard');
    } catch (err) {
      console.error('Login error:', err);
      const message =
        err.response?.data?.error_description ||
        err.response?.data?.message ||
        'Authentication failed. Please verify your credentials and Keycloak server.';
      setError(message);
      addToast(message, 'error', 'Login Failed');
    }
  };

  // Quick Demo Account Auto-Filler
  const handleFillDemo = (demoUser, demoPass) => {
    setUsername(demoUser);
    setPassword(demoPass);
    addToast(`Loaded ${demoUser} credentials! Click Sign In to test.`, 'info', 'Demo Credentials Loaded');
  };

  return (
    <div className="auth-container">
      <div className="auth-split-wrapper">
        {/* Left Branding Panel (Desktop) */}
        <div className="auth-branding-panel">
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(6, 182, 212, 0.15)', border: '1px solid rgba(6, 182, 212, 0.35)', padding: '4px 14px', borderRadius: '20px', fontSize: '0.8rem', color: '#67e8f9', fontWeight: 600, marginBottom: '16px' }}>
              <Sparkles size={14} color="var(--neon-cyan)" /> Next-Gen AI Learning Platform
            </div>
            <h1 style={{ fontSize: '2.2rem', fontWeight: 800, lineHeight: 1.2, marginBottom: '12px' }}>
              Master AI & Software Engineering
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.6 }}>
              Interactive courses, intelligent AI tutoring, real-time progress tracking, and Keycloak SSO security.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem' }}>
              <Zap size={18} color="var(--neon-cyan)" />
              <span>11+ Interactive AI & Software Engineering Courses</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem' }}>
              <ShieldCheck size={18} color="var(--neon-emerald)" />
              <span>Enterprise Keycloak SSO & API Gateway Integration</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem' }}>
              <BookOpen size={18} color="var(--neon-violet)" />
              <span>Personalized Syllabus Progress Tracking</span>
            </div>
          </div>

          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', borderTop: '1px solid var(--border-color)', paddingTop: '12px' }}>
            IntelliLearn Platform © 2026 • AI-Powered Learning Hub
          </div>
        </div>

        {/* Right Form Card */}
        <div className="auth-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div className="auth-header">
            <div style={{ display: 'inline-flex', padding: '12px', background: 'var(--primary-soft)', border: '1px solid var(--primary-border)', borderRadius: '16px', marginBottom: '12px' }}>
              <Sparkles size={26} color="var(--primary-light)" />
            </div>
            <h2>Welcome Back</h2>
            <p>Sign in to continue your intelligent learning journey</p>
          </div>

          {/* Quick Demo Fillers */}
          <div style={{ marginBottom: '16px' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '6px' }}>
              Quick Demo Accounts:
            </div>
            <div className="demo-pill-row">
              <button
                type="button"
                className="demo-pill"
                onClick={() => handleFillDemo('student1@intellilearn.com', 'password123')}
              >
                <User size={12} /> Student Account
              </button>
              <button
                type="button"
                className="demo-pill"
                onClick={() => handleFillDemo('instructor1@intellilearn.com', 'password123')}
              >
                <ShieldCheck size={12} /> Instructor Account
              </button>
            </div>
          </div>

          {error && (
            <div className="alert alert-danger">
              <AlertCircle size={18} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="username">
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <UserCheck size={12} /> Username or Email
                </span>
              </label>
              <input
                id="username"
                type="text"
                className="form-control"
                placeholder="e.g. student1@intellilearn.com"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <Lock size={12} /> Password
                </span>
              </label>
              <div className="password-input-wrapper">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  className="form-control"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowPassword((prev) => !prev)}
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={loading} style={{ marginTop: '8px' }}>
              {loading ? (
                <>
                  <span className="spinner"></span>
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <LogIn size={18} />
                  <span>Sign In</span>
                </>
              )}
            </button>
          </form>

          <div className="auth-footer">
            <p>
              Don't have an account?{' '}
              <Link to="/register" style={{ fontWeight: 600 }}>
                Register here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
