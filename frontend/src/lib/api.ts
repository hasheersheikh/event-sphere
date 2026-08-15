import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5001/api',
});

api.interceptors.request.use((config) => {
  const user = localStorage.getItem('user');
  if (user) {
    try {
      const { token } = JSON.parse(user);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (parseErr) {
      // If localStorage.user is corrupted, treat as logged-out and let the user re-auth
      console.warn('Failed to parse user from localStorage, treating as logged-out', parseErr);
      localStorage.removeItem('user');
    }
  }
  return config;
});

export default api;
