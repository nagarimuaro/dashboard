import apiClient from './apiClient.js';

/**
 * User Management Service
 * Handles user CRUD operations with tenant scoping
 */
export const userService = {
  // Get all users with pagination and filters
  getAll: async (params = {}) => {
    const defaultParams = {
      page: 1,
      per_page: 15,
      ...params
    };
    return apiClient.get('/users', defaultParams);
  },

  // Get user by ID
  getById: async (id) => {
    return apiClient.get(`/users/${id}`);
  },

  // Create new user
  create: async (data) => {
    return apiClient.post('/users', data);
  },

  // Update user
  update: async (id, data) => {
    return apiClient.put(`/users/${id}`, data);
  },

  // Delete user
  delete: async (id) => {
    return apiClient.delete(`/users/${id}`);
  },

  // Search users
  search: async (params) => {
    return apiClient.get('/users', {
      search: params.search,
      page: params.page || 1,
      per_page: params.per_page || 15,
      role: params.role,
      status: params.status
    });
  },

  // Change user password
  changePassword: async (id, passwordData) => {
    return apiClient.put(`/users/${id}/change-password`, passwordData);
  },

  // Get user roles (if endpoint exists)
  getRoles: async () => {
    try {
      return await apiClient.get('/users/roles');
    } catch (error) {
      // Fallback to predefined roles if endpoint doesn't exist
      return {
        success: true,
        data: [
          { value: 'admin_global', label: 'Super Admin' },
          { value: 'admin_nagari', label: 'Admin Nagari' },
          { value: 'staff_nagari', label: 'Staff Nagari' },
          { value: 'warga', label: 'Warga' }
        ]
      };
    }
  },

  // Bulk operations
  bulkDelete: async (ids) => {
    return apiClient.post('/users/bulk-delete', { ids });
  },

  bulkUpdateStatus: async (ids, status) => {
    return apiClient.put('/users/bulk-status', { ids, status });
  }
};