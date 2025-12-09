// Centralized export for all services
export { authService } from './authService.js';
export { default as adminService } from './adminService.js';
export { wargaService } from './wargaService.js';
export { keluargaService } from './keluargaService.js';
export { pelayananService } from './pelayananService.js';
export { dashboardService } from './dashboardService.js';
export { userService } from './userService.js';
export { default as apiClient } from './apiClient.js';
export { default as socialDataService } from './socialDataService.js';

// Legacy inline userService (will be removed)
export const legacyUserService = {
  // Get all users (role-based)
  getAll: async (params = {}) => {
    return apiClient.get('/users', params);
  },

  // Create new user
  create: async (data) => {
    return apiClient.post('/users', data);
  },

  // Get user by ID
  getById: async (id) => {
    return apiClient.get(`/users/${id}`);
  },

  // Update user
  update: async (id, data) => {
    return apiClient.put(`/users/${id}`, data);
  },

  // Delete user
  delete: async (id) => {
    return apiClient.delete(`/users/${id}`);
  },

  // Get global users (super admin only)
  getGlobalUsers: async () => {
    return apiClient.get('/global-users');
  },

  // Create global user
  createGlobalUser: async (data) => {
    return apiClient.post('/global-users', data);
  }
};

export const arsipService = {
  // Get all arsip surat
  getAll: async (params = {}) => {
    return apiClient.get('/arsip-surat', params);
  },

  // Create arsip entry
  create: async (data) => {
    return apiClient.post('/arsip-surat', data);
  },

  // Get arsip by ID
  getById: async (id) => {
    return apiClient.get(`/arsip-surat/${id}`);
  },

  // Delete arsip
  delete: async (id) => {
    return apiClient.delete(`/arsip-surat/${id}`);
  },

  // Search arsip
  search: async (query, params = {}) => {
    return apiClient.get('/arsip-surat', {
      search: query,
      ...params
    });
  }
};

export const reportService = {
  // Export warga data
  exportWarga: async (filters = {}, format = 'xlsx') => {
    const params = new URLSearchParams({ ...filters, format });
    return apiClient.get(`/export/warga?${params}`, {
      responseType: 'blob'
    });
  },

  // Export surat data
  exportSurat: async (filters = {}, format = 'xlsx') => {
    const params = new URLSearchParams({ ...filters, format });
    return apiClient.get(`/export/surat?${params}`, {
      responseType: 'blob'
    });
  },

  // Export keluarga data
  exportKeluarga: async (filters = {}, format = 'xlsx') => {
    const params = new URLSearchParams({ ...filters, format });
    return apiClient.get(`/export/keluarga?${params}`, {
      responseType: 'blob'
    });
  },

  // Generate statistical report
  generateStatReport: async (type, period) => {
    return apiClient.get(`/reports/statistics`, {
      type,
      period
    });
  }
};

export const tenantService = {
  // Get my tenants
  getMyTenants: async () => {
    return apiClient.get('/tenants/my');
  },

  // Get tenant info
  getTenantInfo: async (slug) => {
    return apiClient.get(`/tenants/${slug}`);
  },

  // Update tenant settings
  updateSettings: async (slug, data) => {
    return apiClient.put(`/tenants/${slug}/settings`, data);
  }
};

export const notificationService = {
  // Get notifications
  getAll: async (params = {}) => {
    return apiClient.get('/notifications', params);
  },

  // Mark as read
  markAsRead: async (id) => {
    return apiClient.post(`/notifications/${id}/read`);
  },

  // Mark all as read
  markAllAsRead: async () => {
    return apiClient.post('/notifications/read-all');
  },

  // Delete notification
  delete: async (id) => {
    return apiClient.delete(`/notifications/${id}`);
  }
};