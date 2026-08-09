import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getCourses } from '../api/courseApi';
import { getUserProgress } from '../api/progressApi';

const DashboardPage = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [userProgressMap, setUserProgressMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');
      try {
        const coursesData = await getCourses();
        setCourses(coursesData || []);

        if (user?.id) {
          try {
            const progressList = await getUserProgress(user.id);
            const map = {};
            if (Array.isArray(progressList)) {
              progressList.forEach((p) => {
                map[p.courseId] = p.completedPercent;
              });
            }
            setUserProgressMap(map);
          } catch (pErr) {
            console.warn('Could not fetch user progress:', pErr);
          }
        }
      } catch (err) {
        console.error('Failed to fetch courses:', err);
        setError('Failed to load courses from API Gateway. Ensure services are running.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  return (
    <div className="dashboard-container">
      <div className="welcome-banner glass-card">
        <div className="banner-content">
          <h1>Welcome back, {user?.username || 'Learner'}! 👋</h1>
          <p>Track your learning progress, discover courses, and master new skills.</p>
        </div>
      </div>

      <div className="section-header">
        <h2>Available Courses</h2>
        <span className="badge badge-info">{courses.length} Courses</span>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {loading ? (
        <div className="loading-spinner">Loading courses...</div>
      ) : courses.length === 0 ? (
        <div className="empty-state glass-card">
          <p>No courses available right now. Check back soon!</p>
        </div>
      ) : (
        <div className="courses-grid">
          {courses.map((course) => {
            const courseId = course.id || course._id;
            const progress = userProgressMap[courseId];
            const isEnrolled = progress !== undefined;

            return (
              <div key={courseId} className="course-card glass-card">
                <div className="course-card-body">
                  <div className="course-category">{course.category || 'General'}</div>
                  <h3 className="course-title">{course.title || course.name}</h3>
                  <p className="course-description">{course.description}</p>
                  
                  {course.instructor && (
                    <div className="course-instructor">
                      <span>Instructor:</span> {course.instructor}
                    </div>
                  )}

                  {isEnrolled && (
                    <div className="progress-section">
                      <div className="progress-label">
                        <span>Progress</span>
                        <span>{progress}%</span>
                      </div>
                      <div className="progress-bar-container">
                        <div
                          className="progress-bar-fill"
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="course-card-footer">
                  <Link to={`/courses/${courseId}`} className="btn btn-primary btn-block">
                    {isEnrolled ? 'Continue Course' : 'View Details'}
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
