import React, { useState, useEffect } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { isInstructor, getDefaultDashboard } from '../utils/roleUtils';
import Avatar from './Avatar';
import LogoIcon from './LogoIcon';
import { 
  Sparkles, 
  LayoutDashboard, 
  User, 
  LogOut, 
  LogIn, 
  UserPlus, 
  Menu, 
  X, 
  ShieldCheck, 
  Zap 
} from 'lucide-react';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const userIsInstructor = isAuthenticated && isInstructor(user);
  const dashboardPath = getDefaultDashboard(user);

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

  const displayUsername = profileData?.username || user?.username || user?.email || 'User';

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
    navigate('/login');
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen((prev) => !prev);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <header className="navbar">
      <div className="navbar-container">
        {/* Brand Logo & Version Pill */}
        <Link to={isAuthenticated ? dashboardPath : '/login'} className="navbar-brand" onClick={closeMobileMenu}>
          <span className="brand-icon-wrapper">
            <LogoIcon size={34} />
          </span>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span style={{ fontWeight: 800, fontSize: '1.25rem', letterSpacing: '-0.02em' }}>IntelliLearn</span>
            <span className="nav-brand-badge">AI Platform</span>
          </div>
        </Link>

        {/* Unauthenticated Center Feature Highlights (Desktop) */}
        {!isAuthenticated && (
          <div className="navbar-center-highlights">
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              <Zap size={14} color="var(--neon-cyan)" />
              <span>11+ Interactive Courses</span>
            </div>
            <span style={{ color: 'var(--border-color)' }}>•</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              <ShieldCheck size={14} color="var(--neon-emerald)" />
              <span>Keycloak SSO Protected</span>
            </div>
          </div>
        )}

        {/* Desktop Navigation Links / Actions */}
        <nav className="navbar-links desktop-nav">
          {isAuthenticated ? (
            <>
              {/* Role-based dashboard link */}
              {userIsInstructor ? (
                <NavLink
                  to="/instructor/dashboard"
                  className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
                >
                  <ShieldCheck size={16} />
                  Instructor Dashboard
                </NavLink>
              ) : (
                <NavLink
                  to="/dashboard"
                  className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
                >
                  <LayoutDashboard size={16} />
                  Dashboard
                </NavLink>
              )}



              <NavLink
                to="/profile"
                className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
              >
                <User size={16} />
                Profile
              </NavLink>

              <div className="user-badge-container">
                <Avatar name={displayUsername} size={28} />
                <span className="user-name-text">{displayUsername}</span>
              </div>

              <button onClick={handleLogout} className="btn btn-secondary btn-sm" title="Sign out">
                <LogOut size={14} />
                Logout
              </button>
            </>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <NavLink
                to="/login"
                className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
                style={{ padding: '0.5rem 1rem' }}
              >
                <LogIn size={15} />
                Sign In
              </NavLink>

              <Link to="/register" className="btn btn-primary btn-sm" style={{ boxShadow: 'var(--shadow-glow-cyan)' }}>
                <UserPlus size={15} />
                Create Account
              </Link>
            </div>
          )}
        </nav>

        {/* Mobile Hamburger Toggle */}
        <button
          className="mobile-toggle-btn"
          onClick={toggleMobileMenu}
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="mobile-menu-drawer animate-fade-in">
          {isAuthenticated ? (
            <>
              <div className="user-badge-container" style={{ justifyContent: 'flex-start', margin: '0 8px' }}>
                <Avatar name={user?.username || user?.email || 'User'} size={32} />
                <span className="user-name-text" style={{ maxWidth: 'none' }}>
                  {user?.username || user?.email}
                </span>
              </div>

              {userIsInstructor ? (
                <NavLink
                  to="/instructor/dashboard"
                  onClick={closeMobileMenu}
                  className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
                >
                  <ShieldCheck size={18} />
                  Instructor Dashboard
                </NavLink>
              ) : (
                <NavLink
                  to="/dashboard"
                  onClick={closeMobileMenu}
                  className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
                >
                  <LayoutDashboard size={18} />
                  Dashboard
                </NavLink>
              )}



              <NavLink
                to="/profile"
                onClick={closeMobileMenu}
                className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
              >
                <User size={18} />
                Profile
              </NavLink>

              <button onClick={handleLogout} className="btn btn-secondary btn-block" style={{ marginTop: '8px' }}>
                <LogOut size={16} />
                Logout
              </button>
            </>
          ) : (
            <>
              <NavLink
                to="/login"
                onClick={closeMobileMenu}
                className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
              >
                <LogIn size={18} />
                Sign In
              </NavLink>

              <Link to="/register" onClick={closeMobileMenu} className="btn btn-primary btn-block">
                <UserPlus size={16} />
                Create Account
              </Link>
            </>
          )}
        </div>
      )}

    </header>
  );
};

export default Navbar;
