import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import LogoIcon from '../components/LogoIcon';
import { 
  UserPlus, 
  AlertCircle, 
  CheckCircle2, 
  User, 
  Mail, 
  Lock, 
  ShieldCheck, 
  Eye, 
  EyeOff, 
  Sparkles, 
  BookOpen, 
  GraduationCap 
} from 'lucide-react';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'STUDENT',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
      });
      const msg = 'Account registered successfully! Redirecting to login...';
      setSuccess(msg);
      addToast(msg, 'success', 'Welcome Aboard');
      setTimeout(() => {
        navigate('/login');
      }, 1400);
    } catch (err) {
      console.error('Registration error:', err);
      const serverMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        'Registration failed. Ensure API Gateway and User Service are running.';
      setError(serverMessage);
      addToast(serverMessage, 'error', 'Registration Failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-split-wrapper">
        {/* Left Branding Panel (Desktop) */}
        <div className="auth-branding-panel">
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(6, 182, 212, 0.15)', border: '1px solid rgba(6, 182, 212, 0.35)', padding: '4px 14px', borderRadius: '20px', fontSize: '0.8rem', color: '#67e8f9', fontWeight: 600, marginBottom: '16px' }}>
              <LogoIcon size={18} /> Join IntelliLearn AI Hub
            </div>
            <h1 style={{ fontSize: '2.2rem', fontWeight: 800, lineHeight: 1.2, marginBottom: '12px' }}>
              Create Your AI Student Profile
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.6 }}>
              Unlock 11+ interactive courses, instant AI tutoring assistance, and progress tracking credentials.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem' }}>
              <GraduationCap size={18} color="var(--neon-cyan)" />
              <span>Free Access to Interactive AI Course Workspaces</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem' }}>
              <Sparkles size={18} color="var(--neon-violet)" />
              <span>Real-Time AI Tutor Assistant Q&A Prompting</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem' }}>
              <CheckCircle2 size={18} color="var(--neon-emerald)" />
              <span>Verified Certificate Credentials & Badges</span>
            </div>
          </div>

          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', borderTop: '1px solid var(--border-color)', paddingTop: '12px' }}>
            IntelliLearn Platform © 2026 • AI-Powered Learning Hub
          </div>
        </div>

        {/* Right Form Card */}
        <div className="auth-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div className="auth-header">
            <div style={{ display: 'inline-flex', padding: '2px', background: 'transparent', borderRadius: '16px', marginBottom: '12px' }}>
              <LogoIcon size={52} />
            </div>
            <h2>Create Account</h2>
            <p>Join the IntelliLearn AI Platform</p>
          </div>

          {error && (
            <div className="alert alert-danger">
              <AlertCircle size={18} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="alert alert-success">
              <CheckCircle2 size={18} style={{ flexShrink: 0 }} />
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="name">
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <User size={12} /> Full Name
                </span>
              </label>
              <input
                id="name"
                name="name"
                type="text"
                className="form-control"
                placeholder="e.g. Sachintha Dilshan"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <Mail size={12} /> Email Address
                </span>
              </label>
              <input
                id="email"
                name="email"
                type="email"
                className="form-control"
                placeholder="sachintha@example.com"
                value={formData.email}
                onChange={handleChange}
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
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  className="form-control"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
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

            {/* Interactive Role Card Selector */}
            <div className="form-group">
              <label>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <ShieldCheck size={12} /> Account Role
                </span>
              </label>
              <div className="role-selector-group">
                <div
                  className={`role-card ${formData.role === 'STUDENT' ? 'active' : ''}`}
                  onClick={() => setFormData({ ...formData, role: 'STUDENT' })}
                >
                  <GraduationCap size={18} color={formData.role === 'STUDENT' ? 'var(--neon-cyan)' : 'var(--text-muted)'} />
                  <span>Student</span>
                </div>
                <div
                  className={`role-card ${formData.role === 'INSTRUCTOR' ? 'active' : ''}`}
                  onClick={() => setFormData({ ...formData, role: 'INSTRUCTOR' })}
                >
                  <BookOpen size={18} color={formData.role === 'INSTRUCTOR' ? 'var(--neon-violet)' : 'var(--text-muted)'} />
                  <span>Instructor</span>
                </div>
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={loading} style={{ marginTop: '8px' }}>
              {loading ? (
                <>
                  <span className="spinner"></span>
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <UserPlus size={18} />
                  <span>Register Now</span>
                </>
              )}
            </button>
          </form>

          <div className="auth-footer">
            <p>
              Already have an account?{' '}
              <Link to="/login" style={{ fontWeight: 600 }}>
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
