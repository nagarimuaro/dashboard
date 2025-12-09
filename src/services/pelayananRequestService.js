import apiClient from './apiClient.js';

const pelayananRequestService = {
  /**
   * Get all pelayanan requests (for monitoring)
   */
  getAll: async (filters = {}) => {
    const params = {};
    if (filters.status) params.status = filters.status;
    if (filters.jenis) params.jenis = filters.jenis;
    if (filters.from_date) params.from_date = filters.from_date;
    if (filters.to_date) params.to_date = filters.to_date;

    const response = await apiClient.get('/pelayanan-requests', params);
    // Handle both array and object responses
    return Array.isArray(response) ? response : (response.data || response.requests || []);
  },

  /**
   * Get single pelayanan request by ID
   */
  getById: async (id) => {
    const response = await apiClient.get(`/pelayanan-requests/${id}`);
    return response.data || response;
  },

  /**
   * Create new pelayanan request (from WhatsApp or manual)
   */
  create: async (data) => {
    const response = await apiClient.post('/pelayanan-requests', data);
    return response.data || response;
  },

  /**
   * Update pelayanan request status
   */
  updateStatus: async (id, status, keterangan) => {
    const response = await apiClient.put(`/pelayanan-requests/${id}/status`, {
      status,
      keterangan: keterangan || null
    });
    return response.data || response;
  },

  /**
   * Generate surat for pelayanan request
   */
  generateSurat: async (id, customData = {}) => {
    const response = await apiClient.post(`/pelayanan-requests/${id}/generate`, {
      custom_data: customData
    });
    return response.data || response;
  },

  /**
   * Download generated surat
   */
  downloadSurat: async (id) => {
    const response = await apiClient.get(`/pelayanan-requests/${id}/download`);
    return response;
  },

  /**
   * Delete pelayanan request
   */
  delete: async (id) => {
    const response = await apiClient.delete(`/pelayanan-requests/${id}`);
    return response.data || response;
  },

  /**
   * Get statistics for dashboard
   */
  getStatistics: async () => {
    try {
      const response = await apiClient.get('/pelayanan-requests/statistics');
      return response.data || response || {
        total: 0,
        pending: 0,
        processing: 0,
        completed: 0,
        rejected: 0,
        today: 0
      };
    } catch (error) {
      console.error('Error getting statistics:', error);
      return {
        total: 0,
        pending: 0,
        processing: 0,
        completed: 0,
        rejected: 0,
        today: 0
      };
    }
  }
};

export { pelayananRequestService };
