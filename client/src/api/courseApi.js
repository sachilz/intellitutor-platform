import axios from 'axios';
import axiosInstance from './axiosInstance';

const COURSE_SERVICE_API_KEY = 'course-service-secret-key-456';

// Direct URL to course-service (bypasses API gateway)
const COURSE_SERVICE_DIRECT_URL =
  import.meta.env.VITE_COURSE_SERVICE_URL || 'http://localhost:8082';

/**
 * Helper: try the API gateway first, fall back to direct course-service if gateway is down.
 */
const courseRequest = async (method, path, data = null, extraHeaders = {}) => {
  const headers = {
    'X-API-KEY': COURSE_SERVICE_API_KEY,
    'Content-Type': 'application/json',
    ...extraHeaders,
  };

  // Attempt 1: via API Gateway (/api/courses/...)
  try {
    const response = await axiosInstance({ method, url: `/api/courses${path}`, data, headers });
    return response.data;
  } catch (gatewayErr) {
    const isNetworkError =
      !gatewayErr.response ||
      gatewayErr.code === 'ERR_NETWORK' ||
      gatewayErr.code === 'ECONNREFUSED' ||
      gatewayErr.message?.includes('Network Error');

    if (!isNetworkError) {
      // Gateway responded with an actual HTTP error — don't retry
      throw gatewayErr;
    }

    console.warn('[courseApi] Gateway unreachable, falling back to direct course-service…');
  }

  // Attempt 2: direct to course-service (/courses/...)
  const response = await axios({ method, url: `${COURSE_SERVICE_DIRECT_URL}/courses${path}`, data, headers });
  return response.data;
};

export const getCourses = async () => {
  return courseRequest('get', '');
};

export const getCourseById = async (courseId) => {
  return courseRequest('get', `/${courseId}`);
};

export const enrollInCourse = async (courseId, userId) => {
  return courseRequest('post', `/${courseId}/enroll`, { userId });
};

export const createCourse = async (courseData) => {
  // Map frontend fields to backend DTO (CreateCourseRequest)
  // Backend expects: title, description, instructorId, materials
  const payload = {
    title: courseData.title,
    description: courseData.description,
    instructorId: courseData.instructor || courseData.instructorId || '',
    materials: courseData.materials || [],
  };

  return courseRequest('post', '', payload, { 'X-User-Role': 'INSTRUCTOR' });
};

export const deleteCourse = async (courseId) => {
  return courseRequest('delete', `/${courseId}`, null, { 'X-User-Role': 'INSTRUCTOR' });
};
