import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from '../axios'; // Use the configured axios instance with production URL detection
import { API_CONFIG } from '../config/api';
import { jwtDecode } from 'jwt-decode';

// Note: axios.defaults.baseURL is already set in ../axios.js with production URL detection
// No need to override it here - the axios instance from axios.js already has the correct baseURL

// Set up axios interceptor to include token in all requests
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle token expiration
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      console.log('🔐 Token expired or invalid, clearing session');
      
      // Check if user was admin before clearing
      const userInfo = localStorage.getItem('userInfo');
      let wasAdmin = false;
      try {
        const user = JSON.parse(userInfo);
        wasAdmin = user?.role === 'admin' || user?.role === 'superadmin';
      } catch (e) {
        // Ignore parsing errors
      }
      
      // Don't clear session immediately for admin users to prevent redirect loops
      const currentPath = window.location.pathname;
      
      // Only redirect if we're not already on a login page and not in an admin route
      // AND if the user was actually logged in (has a token)
      const hasToken = localStorage.getItem('token');
      
      if (!currentPath.includes('/login') && !currentPath.includes('/admin/') && hasToken) {
        if (wasAdmin || currentPath.includes('/admin')) {
          console.log('🔐 Redirecting admin to admin login');
          // Use navigate instead of window.location.href for better React routing
          window.location.href = '/admin/login';
        } else {
          console.log('🔐 Redirecting user to regular login');
          window.location.href = '/login';
        }
        
        // Clear session after redirect
        localStorage.removeItem('token');
        localStorage.removeItem('userInfo');
      } else {
        console.log('🔐 Already on login page, admin route, or no token - not redirecting');
      }
    }
    return Promise.reject(error);
  }
);

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sessionValid, setSessionValid] = useState(false);

  // Check if token is expired
  const isTokenExpired = useCallback((token) => {
    if (!token) return true;
    
    try {
      const decoded = jwtDecode(token);
      const currentTime = Date.now() / 1000;
      
      // Only consider expired if actually past expiration (no buffer for admin)
      return decoded.exp < currentTime;
    } catch (error) {
      console.error('Token decode error:', error);
      return true;
    }
  }, []);

  // Check if token needs refresh (within 1 hour of expiry) - disabled for admin users
  const shouldRefreshToken = useCallback((token) => {
    if (!token) return false;
    
    // Don't auto-refresh admin tokens to prevent logout issues
    const userInfo = localStorage.getItem('userInfo');
    try {
      const user = JSON.parse(userInfo);
      if (user?.role === 'admin' || user?.role === 'superadmin') {
        return false;
      }
    } catch (e) {
      // Ignore parsing errors
    }
    
    try {
      const decoded = jwtDecode(token);
      const currentTime = Date.now() / 1000;
      
      // Refresh if token expires within 1 hour
      return decoded.exp < (currentTime + 3600);
    } catch (error) {
      console.error('Token refresh check error:', error);
      return false;
    }
  }, []);

  // Enhanced session validation with less frequent checks
  const validateSession = useCallback(async () => {
    const token = localStorage.getItem('token');
    const userInfo = localStorage.getItem('userInfo');

    if (!token || !userInfo) {
      setSessionValid(false);
      setUser(null);
      return false;
    }

    // Only check token expiration, don't make unnecessary API calls
    if (isTokenExpired(token)) {
      console.log('Token expired, clearing session');
      setSessionValid(false);
      setUser(null);
      localStorage.removeItem('token');
      localStorage.removeItem('userInfo');
      return false;
    }

    // If token is valid and we have user info, set session as valid
    try {
      const user = JSON.parse(userInfo);
      setUser(user);
      setSessionValid(true);
      return true;
    } catch (error) {
      console.error('Error parsing user info:', error);
      setSessionValid(false);
      setUser(null);
      return false;
    }
  }, [isTokenExpired]);

  // Validate session on app start
  useEffect(() => {
    const loadSession = async () => {
      try {
        await validateSession();
        setLoading(false);
      } catch (error) {
        console.error('❌ Session validation error:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('userInfo');
        setLoading(false);
      }
    };

    loadSession();
  }, [validateSession]);

  // Auto-refresh token if it's about to expire (disabled for admin stability)
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    // Disable automatic token refresh for admin users to prevent logout loops
    const userInfo = localStorage.getItem('userInfo');
    try {
      const user = JSON.parse(userInfo);
      if (user?.role === 'admin' || user?.role === 'superadmin') {
        console.log('🔐 Admin user detected - skipping automatic token refresh');
        return;
      }
    } catch (e) {
      // Continue with refresh for non-admin users
    }

    const checkTokenExpiry = () => {
      if (shouldRefreshToken(token)) {
        console.log('🔄 Token needs refresh, attempting to extend session...');
        // Try to refresh by making a simple API call
        axios.get('/api/auth/verify', {
          headers: { Authorization: `Bearer ${token}` }
        }).then(response => {
          if (response.data.success) {
            console.log('✅ Token refreshed successfully');
            // Update user info if needed
            if (response.data.user) {
              setUser(response.data.user);
              localStorage.setItem('userInfo', JSON.stringify(response.data.user));
            }
          }
        }).catch(error => {
          console.warn('⚠️ Token refresh failed:', error.message);
        });
      }
    };

    // Check every 30 minutes (only for regular users)
    const interval = setInterval(checkTokenExpiry, 30 * 60 * 1000);

    return () => clearInterval(interval);
  }, [shouldRefreshToken]);

  const login = useCallback(async (email, password) => {
    try {
      setError(null);
      setLoading(true);

      console.log('🔐 Attempting regular login for:', email);

      const response = await axios.post(API_CONFIG.ENDPOINTS.AUTH.LOGIN,
        { email, password }
      );

      if (response.data.success) {
        // PHP API returns data in response.data.data
        const userData = response.data.data?.user || response.data.user;
        const token = response.data.data?.token || response.data.token;

        if (!userData || !token) {
          throw new Error('Invalid response from server');
        }

        console.log('✅ Regular login successful:', userData.email);

        localStorage.setItem("userInfo", JSON.stringify(userData));
        localStorage.setItem("token", token);
        setUser(userData);
        setSessionValid(true);

        return userData;
      } else {
        throw new Error(response.data.message || 'Login failed');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Login failed. Please try again.';
      console.error('❌ Regular login failed:', errorMessage);

      if (error.code === 'ECONNREFUSED' || error.message.includes('Network Error')) {
        setError('Backend server is not available. Please try again later.');
      } else {
        setError(errorMessage);
      }
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const adminLogin = useCallback(async (email, password) => {
    try {
      setError(null);
      setLoading(true);

      console.log('🔐 Attempting admin login for:', email);

      const response = await axios.post(API_CONFIG.ENDPOINTS.AUTH.ADMIN_LOGIN,
        { email, password }
      );

      if (response.data.success) {
        // PHP API returns data in response.data.data
        const userData = response.data.data?.user || response.data.user;
        const token = response.data.data?.token || response.data.token;

        if (!userData || !token) {
          throw new Error('Invalid response from server');
        }

        if (userData.role !== 'admin' && userData.role !== 'superadmin') {
          throw new Error('Access denied. Admin privileges required.');
        }

        console.log('✅ Admin login successful:', userData.email, 'Role:', userData.role);

        localStorage.setItem("userInfo", JSON.stringify(userData));
        localStorage.setItem("token", token);

        // Update state synchronously
        setUser(userData);
        setSessionValid(true);

        console.log('🔐 AuthContext: User state updated:', userData);
        console.log('🔐 AuthContext: Session valid:', true);

        return userData;
      } else {
        throw new Error(response.data.message || 'Admin login failed');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Admin login failed. Please try again.';
      console.error('❌ Admin login failed:', errorMessage);

      if (error.code === 'ECONNREFUSED' || error.message.includes('Network Error')) {
        setError('Backend server is not available. Please try again later.');
      } else {
        setError(errorMessage);
      }
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (name, email, phone, password) => {
    try {
      setError(null);
      setLoading(true);

      console.log('🔐 Attempting user registration for:', email);

      const userData = { name, email, phone, password };
      const response = await axios.post(API_CONFIG.ENDPOINTS.AUTH.REGISTER, userData);

      if (response.data.success) {
        // For signup, we don't need user data or token immediately
        // The user will be created as inactive and needs OTP verification
        console.log('✅ Registration successful:', email);
        console.log('📧 OTP sent to:', email);
        
        // Return basic user info for OTP modal
        return {
          email: email,
          name: name,
          phone: phone
        };
      } else {
        throw new Error(response.data.message || 'Registration failed');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Registration failed. Please try again.';
      console.error('❌ Registration failed:', errorMessage);
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      setError(null);
      
      console.log('🔐 Logging out user:', user?.email);
      
      // Call logout endpoint to invalidate token on server
      try {
        await axios.post(API_CONFIG.ENDPOINTS.AUTH.LOGOUT);
        console.log('✅ Server logout successful');
      } catch (error) {
        console.warn('⚠️ Server logout failed, continuing with client logout:', error.message);
      }
      
      // Clear local storage
      localStorage.removeItem("userInfo");
      localStorage.removeItem("token");
      setUser(null);
      setSessionValid(false);
      
      console.log('✅ Client logout successful');
    } catch (error) {
      console.error('❌ Logout error:', error);
      setError('Logout failed. Please try again.');
    }
  }, [user]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const value = {
    user,
    loading,
    error,
    sessionValid,
    login,
    adminLogin,
    register,
    logout,
    clearError,
    isAuthenticated: !!user && sessionValid,
    isAdmin: user?.role === 'admin' || user?.role === 'superadmin'
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 