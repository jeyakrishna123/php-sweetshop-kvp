import axios from "axios";

const instance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || (process.env.NODE_ENV === 'production' ? 'https://skbakers.com/api' : 'http://localhost:8000'), // Production or development backend
});

// Debug: Log the base URL being used
console.log('🔧 Axios instance created with baseURL:', import.meta.env.VITE_API_URL || (process.env.NODE_ENV === 'production' ? 'https://skbakers.com/api' : 'http://localhost:8000'));
console.log('🔧 Environment variables:', {
  VITE_API_URL: import.meta.env.VITE_API_URL,
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
