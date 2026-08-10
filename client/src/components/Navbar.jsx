import React, { useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Avatar from './Avatar';
import { Sparkles, LayoutDashboard, User, LogOut, LogIn, UserPlus, Menu, X } from 'lucide-react';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
        <Link to={isAuthenticated ? '/dashboard' : '/login'} className="navbar-brand" onClick={closeMobileMenu}>
          <span className="brand-icon-wrapper">
            <Sparkles size={20} />
          </span>
          <span>IntelliLearn</span>
        </Link>

        {/* Desktop Links */}
        <nav className="navbar-links desktop-nav">
          {isAuthenticated ? (
            <>
              <NavLink
                to="/dashboard"
                className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
              >
                <LayoutDashboard size={16} />
                Dashboard
              </NavLink>

              <NavLink
                to="/profile"
                className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
              >
                <User size={16} />
                Profile
              </NavLink>

              <div className="user-badge-container">
                <Avatar name={user?.username || user?.email || 'User'} size={28} />
                <span className="user-name-text">{user?.username || user?.email}</span>
              </div>

              <button onClick={handleLogout} className="btn btn-secondary btn-sm" title="Sign out">
                <LogOut size={14} />
                Logout
              </button>
            </>
          ) : (
            <>
              <NavLink
                to="/login"
                className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
              >
                <LogIn size={16} />
                Login
              </NavLink>

              <Link to="/register" className="btn btn-primary btn-sm">
                <UserPlus size={14} />
                Register
              </Link>
            </>
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
        <div className="mobile-menu-drawer">
          {isAuthenticated ? (
            <>
              <div className="user-badge-container" style={{ justifyContent: 'flex-start', margin: '0 8px' }}>
                <Avatar name={user?.username || user?.email || 'User'} size={32} />
                <span className="user-name-text" style={{ maxWidth: 'none' }}>
                  {user?.username || user?.email}
                </span>
              </div>

              <NavLink
                to="/dashboard"
                onClick={closeMobileMenu}
                className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
              >
                <LayoutDashboard size={18} />
                Dashboard
              </NavLink>

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
                Login
              </NavLink>

              <Link to="/register" onClick={closeMobileMenu} className="btn btn-primary btn-block">
                <UserPlus size={16} />
                Register Account
              </Link>
            </>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;
