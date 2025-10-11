import axios from '../axios';
import axiosBase from 'axios';
import { getApiConfig } from '../config/api.js';

// Create axios instance for admin routes
const adminAPI = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL || "http://localhost:3001"}/api/admin`,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Create axios instance for product routes
const productAxios = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL || "http://localhost:3001"}/api/products`,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Create axios instance for order routes
const orderAxios = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL || "http://localhost:3001"}/api/orders`,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Create axios instance for user routes
const userAxios = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL || "http://localhost:3001"}/api/users`,
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
      
      // Create a new axios instance specifically for file uploads
      const uploadAPI = axiosBase.create({
        baseURL: `${getApiConfig().BASE_URL}/api/admin`,
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
      const response = await adminAPI.get('/orders');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch orders');
    }
  },

  // Update order status
  updateOrderStatus: async (id, status) => {
    try {
      const response = await adminAPI.put(`/order/${id}/status`, { status });
      return response.data;
    } catch (error) {
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
      const response = await adminAPI.post(`/order/${id}/send-bill`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to send bill email');
    }
  }
};

// User Management API
export const userAPI = {
  // Get all users
  getAllUsers: async () => {
    try {
      const response = await adminAPI.get('/users');
      return response.data;
    } catch (error) {
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
      
      const response = await adminAPI.get(url);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch dashboard stats');
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

// Banner Management API
export const bannerAPI = {
  // Get all banners
  getAllBanners: async () => {
    try {
      const response = await adminAPI.get('/banners');
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
      const response = await adminAPI.post('/banners', bannerData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to create banner');
    }
  },

  // Update banner
  updateBanner: async (id, bannerData) => {
    try {
      const response = await adminAPI.put(`/banners/${id}`, bannerData, {
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
      const response = await adminAPI.delete(`/banners/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to delete banner');
    }
  },

  // Toggle banner status
  toggleBannerStatus: async (id) => {
    try {
      const response = await adminAPI.patch(`/banners/${id}/toggle`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to toggle banner status');
    }
  },

  // Reorder banners
  reorderBanners: async (bannerIds) => {
    try {
      const response = await adminAPI.post('/banners/reorder', { bannerIds });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to reorder banners');
    }
  }
};



export default adminAPI;
