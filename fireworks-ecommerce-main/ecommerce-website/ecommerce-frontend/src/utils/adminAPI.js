import axios from '../axios';
import axiosBase from 'axios';
import { getApiConfig } from '../config/api.js';

// Get base URL using same logic as axios.js (checks window variables, domain, etc.)
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

// Create axios instance for admin routes (PHP Backend)
const adminAPI = axios.create({
  baseURL: `${getBaseURL()}/api/admin`,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Create axios instance for product routes (PHP Backend)
const productAxios = axios.create({
  baseURL: `${getBaseURL()}/api/products`,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Create axios instance for order routes (PHP Backend)
const orderAxios = axios.create({
  baseURL: `${getBaseURL()}/api/orders`,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Create axios instance for user routes (PHP Backend)
const userAxios = axios.create({
  baseURL: `${getBaseURL()}/api/users`,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to add auth token for all API instances
const addAuthInterceptor = (apiInstance) => {
  apiInstance.interceptors.request.use(
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

  // Response interceptor to handle errors
  apiInstance.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        // Unauthorized - redirect to admin login
        localStorage.removeItem('token');
        localStorage.removeItem('userInfo');
        window.location.href = '/admin/login';
      } else if (error.response?.status === 403) {
        // Forbidden - admin access denied
        console.error('Admin access denied');
      } else if (error.code === 'ECONNREFUSED' || error.message.includes('Network Error')) {
        // Backend not available
        console.warn('Backend server is not available');
      }
      return Promise.reject(error);
    }
  );
};

// Add interceptors to all API instances
addAuthInterceptor(adminAPI);
addAuthInterceptor(productAxios);
addAuthInterceptor(orderAxios);
addAuthInterceptor(userAxios);

// Product Management API
export const productAPI = {
  // Get all products
  getAllProducts: async () => {
    try {
      const response = await productAxios.get('/?limit=1000'); // Get all products
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch products');
    }
  },

  // Get single product
  getProduct: async (id) => {
    try {
      const response = await productAxios.get(`/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch product');
    }
  },

  // Create new product
  createProduct: async (productData) => {
    try {
      console.log('🚀 productAPI: Creating product with data:', productData);
      const response = await productAxios.post('/', productData);
      console.log('🚀 productAPI: Create product response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ productAPI: Create product error:', error);
      console.error('❌ productAPI: Error response:', error.response?.data);
      throw new Error(error.response?.data?.message || 'Failed to create product');
    }
  },

  // Update product
  updateProduct: async (id, productData) => {
    try {
      const response = await productAxios.put(`/${id}`, productData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update product');
    }
  },

  // Delete product
  deleteProduct: async (id) => {
    try {
      const response = await productAxios.delete(`/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to delete product');
    }
  },

  // Upload product images
  uploadImages: async (images) => {
    try {
      console.log('📤 productAPI.uploadImages called with:', images.length, 'files');
      
      const formData = new FormData();
      images.forEach((image, index) => {
        console.log(`📎 Appending image ${index + 1}:`, image.name, image.size, 'bytes');
        formData.append('images', image);
      });

      console.log('📤 Sending FormData to /upload-images...');
      
      // Get base URL - use same logic as adminAPI instance
      const baseURL = getBaseURL();
      
      console.log('🔍 Upload API Base URL:', baseURL);
      
      // Create a new axios instance specifically for file uploads
      const uploadAPI = axiosBase.create({
        baseURL: `${baseURL}/api/admin`,
        timeout: 30000, // Longer timeout for uploads
      });
      
      // Add auth token
      const token = localStorage.getItem('token');
      
      const response = await uploadAPI.post('/upload-images', formData, {
        headers: {
          'Authorization': `Bearer ${token}`
          // Don't set Content-Type - let browser set it with boundary
        }
      });
      
      console.log('✅ Upload response received:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Upload error details:', error);
      console.error('❌ Error response:', error.response?.data);
      throw new Error(error.response?.data?.message || 'Failed to upload images');
    }
  },

  // Remove duplicate products
  removeDuplicates: async () => {
    try {
      console.log('🧹 productAPI.removeDuplicates called');
      
      const token = localStorage.getItem('token');
      console.log('🔑 Token available:', !!token);
      console.log('🌐 API Base URL:', getApiConfig().BASE_URL);
      
      // Use the main API endpoint (not admin sub-route)
      const response = await axiosBase.delete(`${getApiConfig().BASE_URL}/api/products/duplicates`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('✅ Remove duplicates response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Remove duplicates error:', error);
      console.error('❌ Error response:', error.response?.data);
      console.error('❌ Error status:', error.response?.status);
      console.error('❌ Error headers:', error.response?.headers);
      
      if (error.response?.status === 401) {
        throw new Error('Authentication failed. Please log in again.');
      } else if (error.response?.status === 403) {
        throw new Error('Access denied. Admin privileges required.');
      } else {
        throw new Error(error.response?.data?.message || 'Failed to remove duplicate products');
      }
    }
  }
};

// Order Management API
export const orderAPI = {
  // Get all orders
  getAllOrders: async () => {
    try {
      console.log('📡 orderAPI: Fetching all orders from /api/orders/all');
      // Use the correct orders endpoint instead of admin endpoint
      const response = await orderAxios.get('/all');
      console.log('✅ orderAPI: Get all orders response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ orderAPI: Get all orders error:', error);
      console.error('❌ orderAPI: Error response:', error.response);
      console.error('❌ orderAPI: Error message:', error.message);
      console.error('❌ orderAPI: Error code:', error.code);
      
      // Handle network errors
      if (!error.response) {
        const networkError = new Error('Network error: Unable to connect to server. Please check your internet connection.');
        networkError.isNetworkError = true;
        networkError.originalError = error;
        throw networkError;
      }
      
      // Handle HTTP errors
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch orders';
      const detailedError = new Error(errorMessage);
      detailedError.response = error.response;
      detailedError.status = error.response?.status;
      detailedError.data = error.response?.data;
      throw detailedError;
    }
  },

  // Update order status
  updateOrderStatus: async (id, status) => {
    try {
      console.log('🔄 Calling API to update order:', { id, status, endpoint: `/api/orders/${id}` });
      const response = await orderAxios.put(`/${id}`, { status });
      console.log('✅ API Response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ API Error:', error);
      console.error('❌ Error response:', error.response);
      console.error('❌ Error data:', error.response?.data);
      console.error('❌ Error status:', error.response?.status);
      throw new Error(error.response?.data?.message || 'Failed to update order status');
    }
  },

  // Update order
  updateOrder: async (id, orderData) => {
    try {
      const response = await adminAPI.put(`/order/${id}`, orderData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update order');
    }
  },

  // Send bill email to customer
  sendBillEmail: async (id) => {
    try {
      // Use orderAxios instead of adminAPI since the endpoint is /api/orders/{id}/send-bill
      const response = await orderAxios.post(`/${id}/send-bill`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to send bill email');
    }
  },

  // Send bill email with PDF attachment to customer
  sendBillEmailWithPDF: async (id, pdfBase64, filename) => {
    try {
      // Get current base URL dynamically (in case it changed)
      const baseURL = getBaseURL();
      const fullURL = `${baseURL}/api/orders/${id}/send-bill-pdf`;
      
      console.log('📧 sendBillEmailWithPDF - Starting request');
      console.log('📧 sendBillEmailWithPDF - Order ID:', id);
      console.log('📧 sendBillEmailWithPDF - Filename:', filename);
      console.log('📧 sendBillEmailWithPDF - PDF Base64 length:', pdfBase64?.length || 0);
      console.log('📧 sendBillEmailWithPDF - Base URL:', baseURL);
      console.log('📧 sendBillEmailWithPDF - Full API URL:', fullURL);
      console.log('📧 sendBillEmailWithPDF - Current hostname:', typeof window !== 'undefined' ? window.location.hostname : 'N/A');
      console.log('📧 sendBillEmailWithPDF - Current URL:', typeof window !== 'undefined' ? window.location.href : 'N/A');
      
      // Validate inputs
      if (!id || !pdfBase64) {
        throw new Error('Order ID and PDF data are required');
      }
      
      // Use axiosBase (raw axios) with dynamic baseURL to ensure correct URL
      // This prevents issues with stale baseURL in orderAxios instance
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token is missing. Please log in again.');
      }
      
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      };
      
      console.log('📧 sendBillEmailWithPDF - Request headers:', { ...headers, Authorization: 'Bearer ***' });
      console.log('📧 sendBillEmailWithPDF - Token exists:', !!token);
      console.log('📧 sendBillEmailWithPDF - Request payload size (approx):', (pdfBase64?.length || 0) + (filename?.length || 0));
      
      // Prepare request payload
      const payload = {
        pdf: pdfBase64,
        filename: filename || 'Bill_of_Supply.pdf'
      };
      
      console.log('📧 sendBillEmailWithPDF - Sending POST request to:', fullURL);
      console.log('📧 sendBillEmailWithPDF - Payload keys:', Object.keys(payload));
      
      // Use axiosBase with full URL and longer timeout for large PDFs
      // Increased to 180 seconds (3 minutes) to handle large PDF uploads and email processing
      const startTime = Date.now();
      const response = await axiosBase.post(fullURL, payload, {
        headers: headers,
        timeout: 180000, // 180 seconds (3 minutes) for large PDFs and email processing
        validateStatus: function (status) {
          // Accept all status codes - we'll handle errors in catch block
          return true;
        },
        // Add onUploadProgress to track upload progress
        onUploadProgress: function (progressEvent) {
          if (progressEvent.total) {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            console.log(`📧 Upload progress: ${percentCompleted}% (${(progressEvent.loaded / 1024 / 1024).toFixed(2)} MB / ${(progressEvent.total / 1024 / 1024).toFixed(2)} MB)`);
          } else {
            console.log(`📧 Upload progress: ${(progressEvent.loaded / 1024 / 1024).toFixed(2)} MB uploaded`);
          }
        },
        // Add maxContentLength and maxBodyLength to handle large PDFs
        maxContentLength: Infinity,
        maxBodyLength: Infinity
      });
      
      const duration = Date.now() - startTime;
      console.log(`✅ sendBillEmailWithPDF - Response received in ${duration}ms`);
      console.log('✅ sendBillEmailWithPDF - Response status:', response.status);
      console.log('✅ sendBillEmailWithPDF - Response headers:', response.headers);
      console.log('✅ sendBillEmailWithPDF - Success response:', response.data);
      
      // Check if response indicates success
      if (response.status >= 200 && response.status < 300) {
        if (response.data && response.data.success !== false) {
          return response.data;
        } else {
          // Response was 2xx but indicates failure
          const errorMsg = response.data?.message || 'Email sending failed';
          throw new Error(errorMsg);
        }
      } else {
        // Non-2xx status code
        const errorMsg = response.data?.message || `Server returned status ${response.status}`;
        throw new Error(errorMsg);
      }
    } catch (error) {
      // Log full error for debugging
      console.error('❌ Email send error - Full error object:', error);
      console.error('❌ Email send error - Error type:', error.constructor.name);
      console.error('❌ Email send error - Error message:', error.message);
      console.error('❌ Email send error - Error code:', error.code);
      console.error('❌ Email send error - Response exists:', !!error.response);
      console.error('❌ Email send error - Response:', error.response);
      console.error('❌ Email send error - Response status:', error.response?.status);
      console.error('❌ Email send error - Response headers:', error.response?.headers);
      console.error('❌ Email send error - Response data:', error.response?.data);
      console.error('❌ Email send error - Request config:', error.config);
      console.error('❌ Email send error - Request URL:', error.config?.url || error.request?.responseURL || 'Unknown');
      console.error('❌ Email send error - Request method:', error.config?.method || 'Unknown');
      
      // Check if it's a network error (no response)
      if (!error.response) {
        // Check for specific error types
        let errorMessage = 'Network error: Unable to connect to server.';
        let isTimeout = false;
        
        if (error.code === 'ECONNABORTED' || error.message.includes('timeout') || error.message.includes('Timeout')) {
          errorMessage = 'Request timeout: The server took too long to respond. The PDF might be too large or the server is processing. Please try again in a moment.';
          isTimeout = true;
        } else if (error.code === 'ERR_NETWORK' || error.message.includes('Network Error') || error.message.includes('network')) {
          errorMessage = 'Network error: Unable to connect to server. Please check your internet connection and try again.';
        } else if (error.code === 'ERR_CANCELED' || error.message.includes('cancel')) {
          errorMessage = 'Request was cancelled. Please try again.';
        } else if (error.request) {
          // Request was made but no response received
          errorMessage = 'Server did not respond. The request may have timed out or the server is busy. Please try again.';
        } else {
          // Request was not made at all
          errorMessage = 'Failed to send request. Please check your connection and try again.';
        }
        
        console.error('❌ Email send error - Network error detected (no response from server)');
        console.error('❌ Email send error - Error code:', error.code);
        console.error('❌ Email send error - Error message:', error.message);
        console.error('❌ Email send error - Request URL:', fullURL);
        console.error('❌ Email send error - Request object:', error.request);
        console.error('❌ Email send error - Is timeout:', isTimeout);
        
        const networkError = new Error(errorMessage);
        networkError.isNetworkError = true;
        networkError.isTimeout = isTimeout;
        networkError.originalError = error;
        networkError.code = error.code;
        networkError.requestURL = fullURL;
        throw networkError;
      }
      
      // Extract detailed error information from backend
      const errorData = error.response?.data || {};
      console.error('📧 Email send error - Raw errorData:', JSON.stringify(errorData, null, 2));
      
      // The backend sends errors in this format:
      // { success: false, message: "...", errors: {...}, data: {...} }
      // OR sometimes just { message: "...", error: "..." }
      
      // Extract the main error message - prioritize backend message
      let errorMessage = 'Failed to send bill email with PDF';
      
      if (errorData?.message) {
        errorMessage = errorData.message;
      } else if (errorData?.error) {
        errorMessage = errorData.error;
      } else if (typeof errorData === 'string') {
        errorMessage = errorData;
      } else if (error.message && !error.message.includes('Request failed')) {
        errorMessage = error.message;
      }
      
      console.error('📧 Email send error - Extracted message:', errorMessage);
      
      // Check both 'data' and 'errors' keys for error details (backend uses both for compatibility)
      // Backend sends details in both 'errors' and 'data' keys
      const details = errorData?.data || errorData?.errors || {};
      console.error('📧 Email send error - Extracted details:', JSON.stringify(details, null, 2));
      
      // Build detailed error message
      const hints = [];
      
      // Add PHPMailer error if available (most important)
      if (details.phpmailer_error && details.phpmailer_error !== 'No detailed error available') {
        const phpmailerError = String(details.phpmailer_error);
        // Truncate very long errors
        if (phpmailerError.length > 150) {
          hints.push(`PHPMailer: ${phpmailerError.substring(0, 150)}...`);
        } else {
          hints.push(`PHPMailer: ${phpmailerError}`);
        }
      }
      
      if (details.phpmailer_status === 'not_installed') {
        hints.push('PHPMailer is not installed');
      }
      
      if (details.smtp_config) {
        const smtp = details.smtp_config;
        if (smtp.host === 'not_configured') hints.push('SMTP host not configured');
        if (smtp.port === 'not_configured') hints.push('SMTP port not configured');
        if (smtp.username === 'not_configured' || smtp.username === 'empty') {
          hints.push('SMTP username not configured');
        }
        if (smtp.password === 'not_configured' || smtp.password === 'empty') {
          hints.push('SMTP password not configured');
        }
      }
      
      if (details.hint) {
        hints.push(details.hint);
      }
      
      if (details.troubleshooting && Array.isArray(details.troubleshooting)) {
        hints.push(...details.troubleshooting);
      }
      
      // Build the final error message with all details
      // Start with the base message (already extracted above)
      
      // Add hints to error message
      if (hints.length > 0) {
        // If we have hints, append them
        errorMessage = errorMessage + ' - ' + hints.join(', ');
      } else {
        // If no hints but we have error details, try to extract useful info
        if (details.error && typeof details.error === 'string' && !errorMessage.includes(details.error)) {
          errorMessage = errorMessage + ' - ' + details.error;
        }
        
        // Always show HTTP status if available
        if (error.response?.status) {
          const statusText = error.response.status === 400 ? 'Bad Request' :
                            error.response.status === 401 ? 'Unauthorized' :
                            error.response.status === 404 ? 'Not Found' :
                            error.response.status === 500 ? 'Server Error' :
                            'Error';
          errorMessage += ` (HTTP ${error.response.status} - ${statusText})`;
        }
      }
      
      // If the backend message already contains details (separated by |), use it as-is
      if (errorData?.message && errorData.message.includes('|')) {
        errorMessage = errorData.message;
      }
      
      // Final fallback: if we still have the generic message, try to get ANY useful info
      if (errorMessage === 'Failed to send bill email with PDF' && error.response?.data) {
        // Try to extract any string value from the response
        const responseStr = JSON.stringify(error.response.data);
        if (responseStr.length < 500) {
          errorMessage = errorMessage + ' - Response: ' + responseStr;
        } else {
          // Try to extract just the message field
          if (error.response.data.message) {
            errorMessage = String(error.response.data.message);
          } else {
            errorMessage = errorMessage + ' - Check console for full error details (HTTP ' + (error.response?.status || 'unknown') + ')';
          }
        }
      }
      
      // Ensure we have a non-generic message
      if (errorMessage === 'Failed to send bill email with PDF' && error.response?.status) {
        errorMessage = `Failed to send bill email with PDF (HTTP ${error.response.status})`;
      }
      
      // Create error with detailed message and full details
      // Use a more descriptive error that won't crash the app
      const detailedError = new Error(errorMessage);
      detailedError.name = 'EmailSendError'; // Set error name for better identification
      detailedError.details = details;
      detailedError.response = error.response;
      detailedError.originalError = error;
      detailedError.statusCode = error.response?.status;
      
      // Add error code for easier debugging
      if (error.code) {
        detailedError.code = error.code;
      }
      
      console.error('📧 Email send error - Final error message:', errorMessage);
      console.error('📧 Email send error - Error details:', details);
      console.error('📧 Email send error - Status code:', error.response?.status);
      console.error('📧 Email send error - Full response data:', JSON.stringify(error.response?.data, null, 2));
      console.error('📧 Email send error - Will throw error with message:', errorMessage);
      console.error('📧 Email send error - Error stack:', error.stack);
      
      // Re-throw with all context preserved
      throw detailedError;
    }
  }
};

// User Management API
export const userAPI = {
  // Get all users
  getAllUsers: async () => {
    try {
      console.log('📡 userAPI: Fetching all users from /users/all');
      const response = await adminAPI.get('/users/all');
      console.log('✅ userAPI: Get all users response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ userAPI: Get all users error:', error);
      console.error('❌ userAPI: Error response:', error.response?.data);
      throw new Error(error.response?.data?.message || 'Failed to fetch users');
    }
  },

  // Get single user
  getUser: async (id) => {
    try {
      const response = await adminAPI.get(`/users/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch user');
    }
  },

  // Update user
  updateUser: async (id, userData) => {
    try {
      const response = await adminAPI.put(`/users/${id}`, userData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update user');
    }
  },

  // Delete user
  deleteUser: async (id) => {
    try {
      const response = await adminAPI.delete(`/users/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to delete user');
    }
  },

  // Toggle user status
  toggleUserStatus: async (id) => {
    try {
      const response = await adminAPI.patch(`/users/${id}/toggle`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to toggle user status');
    }
  }
};

// Analytics API
export const analyticsAPI = {
  // Get dashboard stats
  getDashboardStats: async (dateFilter = null) => {
    try {
      let url = '/dashboard';
      if (dateFilter && dateFilter.type !== 'all') {
        const params = new URLSearchParams();

        if (dateFilter.type === 'custom' && dateFilter.startDate && dateFilter.endDate) {
          params.append('startDate', dateFilter.startDate);
          params.append('endDate', dateFilter.endDate);
        } else if (dateFilter.type !== 'custom') {
          params.append('dateRange', dateFilter.type);
        }

        if (params.toString()) {
          url += `?${params.toString()}`;
        }
      }

      console.log('📡 Calling dashboard API:', url);
      console.log('🔑 Auth token exists:', !!localStorage.getItem('token'));
      console.log('🔑 Token value:', localStorage.getItem('token')?.substring(0, 50) + '...');

      const response = await adminAPI.get(url);

      console.log('📊 Dashboard API raw response:', response);
      console.log('📊 Dashboard API response.data:', response.data);

      // Ensure we return the data in the expected format
      if (response.data && response.data.success) {
        // Handle nested data structure: response.data.data.stats
        if (response.data.data) {
          return {
            success: response.data.success,
            message: response.data.message,
            stats: response.data.data.stats,
            recentOrders: response.data.data.recentOrders
          };
        }
        return response.data;
      } else {
        console.warn('⚠️ Dashboard API returned unexpected format:', response.data);
        // Return mock data if API fails but don't throw error
        return {
          success: true,
          stats: {
            totalUsers: 0,
            totalProducts: 0,
            totalOrders: 0,
            totalRevenue: 0,
            pendingOrders: 0,
            processingOrders: 0,
            shippedOrders: 0,
            deliveredOrders: 0,
            lowStockProducts: 0,
            outOfStockProducts: 0
          },
          recentOrders: []
        };
      }
    } catch (error) {
      console.error('❌ Dashboard API error:', error);
      console.error('❌ Error response:', error.response);
      console.error('❌ Error status:', error.response?.status);
      console.error('❌ Error data:', error.response?.data);

      // If it's a 401 error, the user needs to login again
      if (error.response?.status === 401) {
        console.log('🔐 Authentication failed, redirecting to login');
        localStorage.removeItem('token');
        localStorage.removeItem('userInfo');
        window.location.href = '/admin/login';
        return;
      }

      // For other errors, return empty data instead of throwing
      console.warn('⚠️ Returning empty dashboard data due to API error');
      return {
        success: true,
        stats: {
          totalUsers: 0,
          totalProducts: 0,
          totalOrders: 0,
          totalRevenue: 0,
          pendingOrders: 0,
          processingOrders: 0,
          shippedOrders: 0,
          deliveredOrders: 0,
          lowStockProducts: 0,
          outOfStockProducts: 0
        },
        recentOrders: []
      };
    }
  },

  // Get analytics
  getAnalytics: async (range = 30) => {
    try {
      const response = await adminAPI.get(`/analytics?range=${range}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch analytics');
    }
  },

  // Get inventory status
  getInventoryStatus: async () => {
    try {
      const response = await adminAPI.get('/inventory');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch inventory status');
    }
  },

  // Get reports
  getReports: async () => {
    try {
      const response = await adminAPI.get('/reports');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch reports');
    }
  },

  // Generate report
  generateReport: async (reportData) => {
    try {
      const response = await adminAPI.post('/reports/generate', reportData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to generate report');
    }
  }
};

// Create axios instance for categories (uses /api/categories, not /api/admin/categories)
const categoryAPIInstance = axios.create({
  baseURL: `${getApiConfig().BASE_URL}/api/categories`,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to add auth token for categories
categoryAPIInstance.interceptors.request.use(
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

// Response interceptor to handle errors for categories
categoryAPIInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('userInfo');
      window.location.href = '/admin/login';
    }
    return Promise.reject(error);
  }
);

// Category Management API
export const categoryAPI = {
  // Get all categories
  getAllCategories: async () => {
    try {
      const response = await categoryAPIInstance.get('/');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch categories');
    }
  },

  // Create new category
  createCategory: async (categoryData) => {
    try {
      const response = await categoryAPIInstance.post('/', categoryData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to create category');
    }
  },

  // Update category
  updateCategory: async (id, categoryData) => {
    try {
      const response = await categoryAPIInstance.put(`/${id}`, categoryData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update category');
    }
  },

  // Delete category
  deleteCategory: async (id) => {
    try {
      const response = await categoryAPIInstance.delete(`/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to delete category');
    }
  }
};

// Banner Management API - Uses /api/banners endpoint directly
const bannerAxios = axiosBase.create({
  baseURL: `${getBaseURL()}/api/banners`,
  timeout: 30000, // Longer timeout for uploads
});

// Add auth interceptor to banner axios
addAuthInterceptor(bannerAxios);

export const bannerAPI = {
  // Get all banners
  getAllBanners: async () => {
    try {
      const response = await bannerAxios.get('/');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch banners');
    }
  },

  // Get active banners (public)
  getActiveBanners: async () => {
    try {
      const response = await axios.get('/api/banners/active');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch active banners');
    }
  },

  // Create new banner
  createBanner: async (bannerData) => {
    try {
      console.log('📤 Creating banner with FormData');
      const response = await bannerAxios.post('/', bannerData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      console.log('✅ Banner created:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Banner creation failed:', error.response?.data);
      throw new Error(error.response?.data?.message || 'Failed to create banner');
    }
  },

  // Update banner
  updateBanner: async (id, bannerData) => {
    try {
      const response = await bannerAxios.put(`/${id}`, bannerData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update banner');
    }
  },

  // Delete banner
  deleteBanner: async (id) => {
    try {
      const response = await bannerAxios.delete(`/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to delete banner');
    }
  },

  // Toggle banner status
  toggleBannerStatus: async (id) => {
    try {
      const response = await bannerAxios.patch(`/${id}/toggle`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to toggle banner status');
    }
  },

  // Reorder banners
  reorderBanners: async (bannerIds) => {
    try {
      const response = await bannerAxios.post('/reorder', { bannerIds });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to reorder banners');
    }
  }
};

// Offer Popup Management API - Uses /api/offer-popups endpoint directly (same pattern as Banner)
const offerPopupAxios = axiosBase.create({
  baseURL: `${getBaseURL()}/api/offer-popups`,
  timeout: 30000, // Longer timeout for uploads
});

// Add auth interceptor to offer popup axios (same as Banner)
addAuthInterceptor(offerPopupAxios);

export const offerPopupAPI = {
  // Get all offer popups
  getAllOfferPopups: async () => {
    try {
      const response = await offerPopupAxios.get('/');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch offer popups');
    }
  },

  // Create new offer popup (sends JSON with imageUrl field)
  createOfferPopup: async (popupData) => {
    try {
      console.log('📤 Creating offer popup with JSON data');
      const response = await offerPopupAxios.post('/', popupData, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      console.log('✅ Offer popup created:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Offer popup creation failed:', error.response?.data);
      throw new Error(error.response?.data?.message || 'Failed to create offer popup');
    }
  },

  // Update offer popup
  updateOfferPopup: async (id, popupData) => {
    try {
      const response = await offerPopupAxios.put(`/${id}`, popupData, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update offer popup');
    }
  },

  // Delete offer popup
  deleteOfferPopup: async (id) => {
    try {
      const response = await offerPopupAxios.delete(`/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to delete offer popup');
    }
  },

  // Toggle offer popup status
  toggleOfferPopupStatus: async (id) => {
    try {
      const response = await offerPopupAxios.patch(`/${id}/toggle`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to toggle offer popup status');
    }
  }
};

export default adminAPI;
