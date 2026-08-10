import React, { useState, useEffect } from 'react';

const COLORS = [
  'linear-gradient(135deg, #6366f1, #8b5cf6)',
  'linear-gradient(135deg, #06b6d4, #3b82f6)',
  'linear-gradient(135deg, #10b981, #059669)',
  'linear-gradient(135deg, #f59e0b, #d97706)',
  'linear-gradient(135deg, #ec4899, #8b5cf6)',
];

const getInitials = (nameOrEmail) => {
  if (!nameOrEmail) return 'U';
  const clean = nameOrEmail.trim();
  if (clean.includes('@')) {
    return clean.substring(0, 2).toUpperCase();
  }
  const parts = clean.split(' ').filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return clean.substring(0, 2).toUpperCase();
};

const getColorIndex = (str) => {
  if (!str) return 0;
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash) % COLORS.length;
};

const Avatar = ({ name, src, size = 36, className = '' }) => {
  const [storedSrc, setStoredSrc] = useState(() => localStorage.getItem('intellilearn_user_avatar'));

  useEffect(() => {
    const handleAvatarUpdate = () => {
      setStoredSrc(localStorage.getItem('intellilearn_user_avatar'));
    };
    window.addEventListener('avatar_updated', handleAvatarUpdate);
    window.addEventListener('storage', handleAvatarUpdate);
    return () => {
      window.removeEventListener('avatar_updated', handleAvatarUpdate);
      window.removeEventListener('storage', handleAvatarUpdate);
    };
  }, []);

  const imageToDisplay = src || storedSrc;

  if (imageToDisplay) {
    return (
      <img
        src={imageToDisplay}
        alt={name || 'User Avatar'}
        className={`avatar-circle ${className}`}
        style={{
          width: `${size}px`,
          height: `${size}px`,
          objectFit: 'cover',
          borderRadius: '50%',
          border: '2px solid rgba(168, 85, 247, 0.5)',
          boxShadow: '0 0 10px rgba(168, 85, 247, 0.3)',
        }}
        title={name}
      />
    );
  }

  const initials = getInitials(name);
  const background = COLORS[getColorIndex(name)];

  return (
    <div
      className={`avatar-circle ${className}`}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        fontSize: `${Math.max(12, Math.floor(size * 0.38))}px`,
        background,
      }}
      title={name}
    >
      {initials}
    </div>
  );
};

export default Avatar;
