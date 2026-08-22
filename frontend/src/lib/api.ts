import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5001/api',
});

api.interceptors.request.use((config) => {
  // Never override an explicit per-request Authorization header (e.g. the store-owner
  // portal passes its own token) — the main-app session must not win that fight.
  if (config.headers.Authorization) {
    return config;
  }
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
