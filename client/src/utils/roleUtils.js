/**
 * Role helper utilities for IntelliLearn platform.
 * Normalises the various shapes the role data can take
 * (roles array, single role string) and provides consistent checks.
 */

/**
 * Returns the primary role string ('INSTRUCTOR' | 'STUDENT').
 * Handles both `user.roles` (array) and `user.role` (string) shapes.
 */
export const getUserRole = (user) => {
  if (!user) return 'STUDENT';

  // roles array from AuthContext
  const roles = user.roles || [];
  if (roles.some((r) => r?.toUpperCase() === 'INSTRUCTOR' || r?.toUpperCase() === 'ADMIN')) {
    return 'INSTRUCTOR';
  }

  // single role field (from user-service response)
  if (typeof user.role === 'string') {
    const r = user.role.toUpperCase();
    if (r === 'INSTRUCTOR' || r === 'ADMIN') return 'INSTRUCTOR';
  }

  return 'STUDENT';
};

export const isInstructor = (user) => getUserRole(user) === 'INSTRUCTOR';
export const isStudent = (user) => getUserRole(user) === 'STUDENT';

/**
 * Returns the default dashboard path for a given user's role.
 */
export const getDefaultDashboard = (user) =>
  isInstructor(user) ? '/instructor/dashboard' : '/dashboard';
