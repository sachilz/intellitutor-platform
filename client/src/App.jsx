import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import ToastContainer from './components/ToastContainer';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import { InstructorRoute } from './components/RoleRoute';
import { getDefaultDashboard } from './utils/roleUtils';

import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import CourseDetailPage from './pages/CourseDetailPage';
import ProfilePage from './pages/ProfilePage';
import InstructorPage from './pages/InstructorPage';

import './index.css';

const RootRedirect = () => {
  const { isAuthenticated, user } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <Navigate to={getDefaultDashboard(user)} replace />;
};

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Router>
          <div className="app-container">
            <Navbar />
            <ToastContainer />
            <main className="main-content">
              <Routes>
                {/* Root Route — role-based redirect */}
                <Route path="/" element={<RootRedirect />} />

                {/* Public Routes */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />

                {/* Protected Routes (any authenticated user) */}
                <Route element={<ProtectedRoute />}>
                  <Route path="/dashboard" element={<DashboardPage />} />
                  <Route path="/courses/:id" element={<CourseDetailPage />} />
                  <Route path="/profile" element={<ProfilePage />} />
                </Route>

                {/* Instructor-Only Routes */}
                <Route element={<InstructorRoute />}>
                  <Route path="/instructor/dashboard" element={<InstructorPage />} />
                </Route>

                {/* Fallback Route */}
                <Route path="*" element={<RootRedirect />} />
              </Routes>
            </main>
          </div>
        </Router>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
