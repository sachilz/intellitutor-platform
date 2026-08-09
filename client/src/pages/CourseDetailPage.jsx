import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getCourseById, enrollInCourse } from '../api/courseApi';
import { getCourseProgress, createProgress, updateProgress } from '../api/progressApi';

const CourseDetailPage = () => {
  const { id: courseId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [progress, setProgress] = useState(null);
  const [percentInput, setPercentInput] = useState(0);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchCourseAndProgress = async () => {
      setLoading(true);
      setError('');
      try {
        const courseData = await getCourseById(courseId);
        setCourse(courseData);

        if (user?.id) {
          try {
            const prog = await getCourseProgress(user.id, courseId);
            setProgress(prog);
            setPercentInput(prog.completedPercent || 0);
          } catch (pErr) {
            // Not enrolled or no progress record yet
            setProgress(null);
          }
        }
      } catch (err) {
        console.error('Failed to load course details:', err);
        setError('Failed to load course details.');
      } finally {
        setLoading(false);
      }
    };

    fetchCourseAndProgress();
  }, [courseId, user]);

  const handleEnroll = async () => {
    if (!user?.id) return;
    setActionLoading(true);
    setError('');
    setMessage('');

    try {
      await enrollInCourse(courseId, user.id);
      
      // Initialize progress in Progress Service
      try {
        const newProg = await createProgress(user.id, courseId);
        setProgress(newProg);
        setPercentInput(newProg.completedPercent || 0);
      } catch (progErr) {
        console.warn('Could not initialize progress record:', progErr);
      }

      setMessage('Successfully enrolled in course!');
    } catch (err) {
      console.error('Enrollment failed:', err);
      setError(err.response?.data?.message || 'Enrollment failed.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateProgress = async (e) => {
    e.preventDefault();
    if (!user?.id) return;
    setActionLoading(true);
    setError('');
    setMessage('');

    try {
      const updated = await updateProgress(user.id, courseId, Number(percentInput));
      setProgress(updated);
      setMessage(`Progress updated to ${updated.completedPercent}%!`);
    } catch (err) {
      console.error('Progress update failed:', err);
      setError(err.response?.data?.message || 'Failed to update progress.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return <div className="loading-spinner">Loading course details...</div>;
  }

  if (!course) {
    return (
      <div className="empty-state glass-card">
        <p>Course not found.</p>
        <Link to="/dashboard" className="btn btn-secondary">Back to Dashboard</Link>
      </div>
    );
  }

  return (
    <div className="course-detail-container">
      <Link to="/dashboard" className="back-link">← Back to Dashboard</Link>

      {error && <div className="alert alert-danger">{error}</div>}
      {message && <div className="alert alert-success">{message}</div>}

      <div className="course-detail-card glass-card">
        <div className="course-header">
          <span className="badge badge-primary">{course.category || 'Course'}</span>
          <h1>{course.title || course.name}</h1>
          <p className="course-subtitle">{course.description}</p>
        </div>

        <div className="course-info-grid">
          <div className="info-item">
            <span className="info-label">Instructor</span>
            <span className="info-value">{course.instructor || 'N/A'}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Duration</span>
            <span className="info-value">{course.duration || 'Self-paced'}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Status</span>
            <span className="info-value">
              {progress ? 'Enrolled' : 'Not Enrolled'}
            </span>
          </div>
        </div>

        {!progress ? (
          <div className="enroll-section">
            <button
              onClick={handleEnroll}
              className="btn btn-primary btn-lg"
              disabled={actionLoading}
            >
              {actionLoading ? 'Enrolling...' : 'Enroll Now'}
            </button>
          </div>
        ) : (
          <div className="enrolled-progress-box glass-card">
            <h3>Your Learning Progress</h3>
            
            <div className="progress-section">
              <div className="progress-label">
                <span>Completion Percentage</span>
                <strong>{progress.completedPercent}%</strong>
              </div>
              <div className="progress-bar-container">
                <div
                  className="progress-bar-fill"
                  style={{ width: `${progress.completedPercent}%` }}
                ></div>
              </div>
              {progress.lastAccessed && (
                <div className="last-accessed">
                  Last Updated: {new Date(progress.lastAccessed).toLocaleString()}
                </div>
              )}
            </div>

            <form onSubmit={handleUpdateProgress} className="progress-update-form">
              <label htmlFor="percent-slider">Update Progress ({percentInput}%):</label>
              <div className="slider-controls">
                <input
                  id="percent-slider"
                  type="range"
                  min="0"
                  max="100"
                  value={percentInput}
                  onChange={(e) => setPercentInput(e.target.value)}
                  className="slider-input"
                />
                <button
                  type="submit"
                  className="btn btn-secondary btn-sm"
                  disabled={actionLoading}
                >
                  Save Progress
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseDetailPage;
