import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api', // Adjust base URL as needed
  timeout: 10000,
});

// Request interceptor for adding authentication token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling common errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear local storage and redirect to login on token expiry
      console.warn('Session expired or unauthorized. Redirecting to login...');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Only redirect if not already on the login page to avoid infinite loops
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
