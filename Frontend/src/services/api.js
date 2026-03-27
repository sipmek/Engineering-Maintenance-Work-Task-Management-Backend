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
      // Handle unauthorized access (e.g., logout user, redirect to login)
      console.warn('Unauthorized access - please login again.');
      // window.location.href = '/login'; 
    }
    return Promise.reject(error);
  }
);

export default api;
