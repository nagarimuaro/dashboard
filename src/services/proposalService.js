import apiClient from './apiClient.js';

export const proposalService = {
  // Get all proposals with pagination and filters
  getAll: async (params = {}) => {
    const defaultParams = {
      page: 1,
      per_page: 15,
      ...params
    };
    return apiClient.get('/proposals', defaultParams);
  },

  // Get proposal by ID
  getById: async (id) => {
    return apiClient.get(`/proposals/${id}`);
  },

  // Create new proposal
  create: async (data) => {
    return apiClient.post('/proposals', data);
  },

  // Update proposal
  update: async (id, data) => {
    return apiClient.put(`/proposals/${id}`, data);
  },

  // Delete proposal
  delete: async (id) => {
    return apiClient.delete(`/proposals/${id}`);
  },

  // Update proposal status
  updateStatus: async (id, status, catatan = null) => {
    return apiClient.post(`/proposals/${id}/status`, { status, catatan });
  },

  // Get proposal statistics
  getStatistics: async () => {
    return apiClient.get('/proposals/statistics');
  },

  // Export proposals
  export: async (params = {}) => {
    return apiClient.get('/proposals/export', params);
  }
};
