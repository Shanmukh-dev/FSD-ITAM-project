import axios from 'axios';

// Normalize backend API base URL (defaults to production Render backend)
const rawApiUrl = import.meta.env.VITE_API_URL || 'https://fsd-itam-project.onrender.com/api';
const baseURL = rawApiUrl.endsWith('/api')
  ? rawApiUrl
  : `${rawApiUrl.replace(/\/+$/, '')}/api`;

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercept requests to attach JWT Authorization header
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('itam_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Intercept responses to handle 401 Unauthorized globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear token and let state/router handle redirection
      localStorage.removeItem('itam_token');
      localStorage.removeItem('itam_user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
