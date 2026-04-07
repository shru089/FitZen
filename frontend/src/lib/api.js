const viteEnv = typeof import.meta !== 'undefined' ? import.meta.env : undefined;
const API_BASE_URL = viteEnv?.VITE_API_BASE_URL ?? 'http://127.0.0.1:8000';
const TOKEN_STORAGE_KEY = 'sanctuary_access_token';

export const getStoredToken = () => window.localStorage.getItem(TOKEN_STORAGE_KEY);

export const storeToken = (token) => {
  window.localStorage.setItem(TOKEN_STORAGE_KEY, token);
};

export const clearStoredToken = () => {
  window.localStorage.removeItem(TOKEN_STORAGE_KEY);
};

export const apiRequest = async (path, options = {}) => {
  const token = getStoredToken();
  const headers = new Headers(options.headers ?? {});

  if (!headers.has('Content-Type') && options.body) {
    headers.set('Content-Type', 'application/json');
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  const rawText = await response.text();
  const data = rawText ? JSON.parse(rawText) : null;

  if (!response.ok) {
    const message = data?.detail ?? data?.message ?? 'Request failed';
    throw new Error(message);
  }

  return data;
};

export const loginUser = (payload) =>
  apiRequest('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

export const registerUser = (payload) =>
  apiRequest('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
export const getDashboardData = (date) => 
  apiRequest(`/api/coaching/dashboard${date ? `?log_date=${date}` : ''}`);

export const getMeals = (date) => 
  apiRequest(`/api/nutrition/meals${date ? `?log_date=${date}` : ''}`);

export const logMeal = (payload) => 
  apiRequest('/api/nutrition/meals', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

export const deleteMeal = (id) => 
  apiRequest(`/api/nutrition/meals/${id}`, {
    method: 'DELETE',
  });

export const getWorkouts = (date) => 
  apiRequest(`/api/activity/workouts${date ? `?log_date=${date}` : ''}`);

export const logWorkout = (payload) => 
  apiRequest('/api/activity/workouts', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

export const toggleWorkoutComplete = (id) => 
  apiRequest(`/api/activity/workouts/${id}/complete`, {
    method: 'PATCH',
  });
