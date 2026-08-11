import axiosInstance from './axiosInstance';

export const generateCommand = async (prompt, userId, courseId) => {
  const response = await axiosInstance.post('/api/tutor/command/generate', {
    prompt,
    userId,
    courseId,
  });
  return response.data;
};

export const diagnoseError = async (command, error, userId) => {
  const response = await axiosInstance.post('/api/tutor/command/diagnose', {
    command,
    error,
    userId,
  });
  return response.data;
};

export const getCommandHistory = async (userId) => {
  const response = await axiosInstance.get('/api/tutor/command/history', {
    params: { userId },
  });
  return response.data;
};

export const clearCommandHistory = async () => {
  const response = await axiosInstance.delete('/api/tutor/command/history');
  return response.data;
};
