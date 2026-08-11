import axiosInstance from './axiosInstance';

const COURSE_SERVICE_API_KEY = 'course-service-secret-key-456';

export const getCourses = async () => {
  const response = await axiosInstance.get('/api/courses', {
    headers: {
      'X-API-KEY': COURSE_SERVICE_API_KEY,
    },
  });
  return response.data;
};

export const getCourseById = async (courseId) => {
  const response = await axiosInstance.get(`/api/courses/${courseId}`, {
    headers: {
      'X-API-KEY': COURSE_SERVICE_API_KEY,
    },
  });
  return response.data;
};

export const enrollInCourse = async (courseId, userId) => {
  const response = await axiosInstance.post(
    `/api/courses/${courseId}/enroll`,
    { userId },
    {
      headers: {
        'X-API-KEY': COURSE_SERVICE_API_KEY,
        'Content-Type': 'application/json',
      },
    }
  );
  return response.data;
};

export const createCourse = async (courseData) => {
  const response = await axiosInstance.post('/api/courses', courseData, {
    headers: {
      'X-API-KEY': COURSE_SERVICE_API_KEY,
      'X-User-Role': 'INSTRUCTOR',
      'Content-Type': 'application/json',
    },
  });
  return response.data;
};
