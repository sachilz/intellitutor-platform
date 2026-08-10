const STORAGE_KEY = 'intellilearn_progress_map';

export const getStoredProgressMap = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : {};
  } catch (e) {
    console.warn('Failed to load progress map from localStorage', e);
    return {};
  }
};

export const saveStoredProgressMap = (map) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
    window.dispatchEvent(new Event('progress_updated'));
  } catch (e) {
    console.warn('Failed to save progress map to localStorage', e);
  }
};

export const setStoredCourseProgress = (courseId, percent) => {
  if (!courseId) return;
  const map = getStoredProgressMap();
  map[courseId] = Number(percent) || 0;
  saveStoredProgressMap(map);
};

export const removeStoredCourseProgress = (courseId) => {
  if (!courseId) return;
  const map = getStoredProgressMap();
  delete map[courseId];
  saveStoredProgressMap(map);
};
