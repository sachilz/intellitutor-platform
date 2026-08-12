import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { isInstructor, isStudent } from '../utils/roleUtils';

/**
 * Allows only INSTRUCTOR / ADMIN users through.
 * Students are redirected to the student dashboard.
 */
export const InstructorRoute = () => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!isInstructor(user)) return <Navigate to="/dashboard" replace />;

  return <Outlet />;
};

/**
 * Allows only STUDENT users through.
 * Instructors are redirected to the instructor dashboard.
 */
export const StudentRoute = () => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!isStudent(user)) return <Navigate to="/instructor/dashboard" replace />;

  return <Outlet />;
};
