import React from 'react';
import { useAuth } from '../context/AuthContext';

const ProfilePage = () => {
  const { user, token } = useAuth();

  return (
    <div className="profile-container">
      <div className="profile-card glass-card">
        <div className="profile-header">
          <div className="profile-avatar">👤</div>
          <h2>{user?.username || 'User Profile'}</h2>
          <p className="profile-email">{user?.email}</p>
        </div>

        <div className="profile-details">
          <div className="detail-row">
            <span className="detail-label">User ID:</span>
            <span className="detail-value mono">{user?.id || 'N/A'}</span>
          </div>

          <div className="detail-row">
            <span className="detail-label">Username:</span>
            <span className="detail-value">{user?.username || 'N/A'}</span>
          </div>

          <div className="detail-row">
            <span className="detail-label">Email:</span>
            <span className="detail-value">{user?.email || 'N/A'}</span>
          </div>

          <div className="detail-row">
            <span className="detail-label">Assigned Roles:</span>
            <div className="roles-list">
              {user?.roles && user.roles.length > 0 ? (
                user.roles.map((role) => (
                  <span key={role} className="badge badge-primary me-1">
                    {role}
                  </span>
                ))
              ) : (
                <span className="badge badge-secondary">Standard User</span>
              )}
            </div>
          </div>

          <div className="detail-row">
            <span className="detail-label">Token Status:</span>
            <span className="badge badge-success">
              Active in Memory ({token ? 'Authenticated' : 'No Token'})
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
