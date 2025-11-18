import axios from "axios";

// Force production URL for production builds
const getBaseURL = () => {
  // Check for window flag set by index.html script (runs before React)
  if (typeof window !== 'undefined' && window.__PRODUCTION_API_URL__) {
    return window.__PRODUCTION_API_URL__;
  }
  // Check for explicit VITE_API_URL
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  // Check if we're on production domain
  if (typeof window !== 'undefined' && window.location.hostname === 'skbakers.com') {
    return 'https://skbakers.com';
  }
  // Check if we're in production mode
  if (import.meta.env.PROD || import.meta.env.MODE === 'production') {
    return 'https://skbakers.com';
  }
  // Default to localhost for development
  return 'http://localhost:8000';
};

const instance = axios.create({
  baseURL: getBaseURL(), // Production or development backend
});

// Debug: Log the base URL being used
const baseURL = getBaseURL();
console.log('🔧 Axios instance created with baseURL:', baseURL);
console.log('🔧 Environment variables:', {
  VITE_API_URL: import.meta.env.VITE_API_URL,
  PROD: import.meta.env.PROD,
  MODE: import.meta.env.MODE,
  VITE_ENV: import.meta.env.VITE_ENV
});

// Add request interceptor to include token in all requests
instance.interceptors.request.use(
  (config) => {
    console.log('🔍 Axios Request:', config.method?.toUpperCase(), config.url);
    console.log('🔍 Axios Base URL:', config.baseURL);
    console.log('🔍 Axios Full URL:', `${config.baseURL}${config.url}`);
    console.log('🔍 Axios Headers:', config.headers);
    
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('❌ Axios Request Error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor to handle token expiration
instance.interceptors.response.use(
  (response) => {
    console.log('✅ Axios Response:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error('❌ Axios Response Error:', error.response?.status, error.config?.url);
    console.error('❌ Axios Error Details:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      config: error.config
    });
    // Let AuthContext handle 401 errors and redirects
    // This prevents double redirects and conflicts
    return Promise.reject(error);
  }
);

export default instance;
