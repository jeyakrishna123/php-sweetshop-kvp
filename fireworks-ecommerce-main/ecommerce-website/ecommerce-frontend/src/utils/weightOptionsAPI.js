import axios from '../axios';

const weightOptionsAPI = {
  // Get all weight options
  getAllWeightOptions: async (params = {}) => {
    try {
      const response = await axios.get('/api/weight-options', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching weight options:', error);
      throw error;
    }
  },

  // Get weight options by category
  getWeightOptionsByCategory: async (category) => {
    try {
      const response = await axios.get(`/api/weight-options/category/${category}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching weight options for category ${category}:`, error);
      throw error;
    }
  },

  // Get single weight option
  getWeightOption: async (id) => {
    try {
      const response = await axios.get(`/api/weight-options/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching weight option ${id}:`, error);
      throw error;
    }
  },

  // Create weight option (Admin only)
  createWeightOption: async (weightOptionData) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('/api/weight-options', weightOptionData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error creating weight option:', error);
      throw error;
    }
  },

  // Update weight option (Admin only)
  updateWeightOption: async (id, updateData) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(`/api/weight-options/${id}`, updateData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      console.error(`Error updating weight option ${id}:`, error);
      throw error;
    }
  },

  // Delete weight option (Admin only)
  deleteWeightOption: async (id) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.delete(`/api/weight-options/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      console.error(`Error deleting weight option ${id}:`, error);
      throw error;
    }
  },

  // Create default weight options (Admin only)
  createDefaultWeightOptions: async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('/api/weight-options/create-defaults', {}, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error creating default weight options:', error);
      throw error;
    }
  },

  // Toggle weight option status (Admin only)
  toggleWeightOptionStatus: async (id) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.patch(`/api/weight-options/${id}/toggle`, {}, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      console.error(`Error toggling weight option ${id}:`, error);
      throw error;
    }
  }
};

export default weightOptionsAPI;
