import apiClient from './apiClient.js';

export const wargaService = {
  // Get all warga with pagination and filters
  getAll: async (params = {}) => {
    const defaultParams = {
      page: 1,
      per_page: 15,
      ...params
    };
    return apiClient.get('/wargas', defaultParams);
  },

  // Get warga by ID
  getById: async (id) => {
    return apiClient.get(`/wargas/${id}`);
  },

  // Create new warga
  create: async (data) => {
    return apiClient.post('/wargas', data);
  },

  // Update warga
  update: async (id, data) => {
    return apiClient.put(`/wargas/${id}`, data);
  },

  // Delete warga
  delete: async (id) => {
    return apiClient.delete(`/wargas/${id}`);
  },

  // Search warga by NIK
  searchByNIK: async (nik) => {
    return apiClient.post('/wargas/search-nik', { nik });
  },

  // Search warga by KK number
  searchByKK: async (noKK) => {
    return apiClient.post('/wargas/search-kk', { no_kk: noKK });
  },

  // Search warga with general query
  search: async (params) => {
    return apiClient.get('/wargas', {
      search: params.search,
      page: params.page || 1,
      per_page: params.per_page || 15
    });
  },

  // Get warga statistics
  getStatistics: async () => {
    return apiClient.get('/wargas/statistics');
  },

  // Get warga by filters
  getByFilters: async (filters) => {
    return apiClient.get('/wargas', filters);
  },

  // Export warga data
  export: async (filters = {}, format = 'xlsx') => {
    const params = { ...filters, format };
    return apiClient.get('/wargas/export', params);
  },

  // Bulk import warga
  bulkImport: async (file, onProgress = null) => {
    return apiClient.upload('/wargas/import', file, onProgress);
  },

  // Get warga by jorong
  getByJorong: async (jorong, params = {}) => {
    return apiClient.get('/wargas', {
      jorong,
      ...params
    });
  },

  // Get warga by RT/RW
  getByRTRW: async (rt, rw, params = {}) => {
    return apiClient.get('/wargas', {
      rt,
      rw,
      ...params
    });
  },

  // Validate NIK
  validateNIK: async (nik, excludeId = null) => {
    return apiClient.post('/wargas/validate-nik', { 
      nik, 
      exclude_id: excludeId 
    });
  },

  // Get age statistics
  getAgeStatistics: async () => {
    return apiClient.get('/wargas/age-statistics');
  },

  // Get gender statistics  
  getGenderStatistics: async () => {
    return apiClient.get('/wargas/gender-statistics');
  },

  // Get education statistics
  getEducationStatistics: async () => {
    return apiClient.get('/wargas/education-statistics');
  },

  // Get profession statistics
  getProfessionStatistics: async () => {
    return apiClient.get('/wargas/profession-statistics');
  },

  // Get marital status statistics
  getMaritalStatusStatistics: async () => {
    return apiClient.get('/wargas/marital-status-statistics');
  }
};