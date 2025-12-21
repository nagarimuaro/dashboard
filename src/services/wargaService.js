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

  // Export warga data to PDF/CSV with download
  exportWithDownload: async (filters = {}, format = 'pdf', onProgress = null) => {
    const params = { ...filters, format };
    return apiClient.downloadBlobWithProgress('/wargas/export', params, onProgress);
  },

  // Bulk import warga from Excel/CSV with progress callback
  bulkImport: async (file, onProgress = null) => {
    return new Promise((resolve, reject) => {
      const formData = new FormData();
      formData.append('file', file);
      
      const xhr = new XMLHttpRequest();
      
      // Progress event
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable && onProgress) {
          const progress = Math.round((event.loaded * 100) / event.total);
          onProgress(progress);
        }
      });
      
      // Load event (success)
      xhr.addEventListener('load', () => {
        try {
          const response = JSON.parse(xhr.responseText);
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(response);
          } else {
            reject(new Error(response.message || `Upload failed: ${xhr.status}`));
          }
        } catch (e) {
          reject(new Error('Invalid response from server'));
        }
      });
      
      // Error event
      xhr.addEventListener('error', () => {
        reject(new Error('Network error during upload'));
      });
      
      // Timeout event
      xhr.addEventListener('timeout', () => {
        reject(new Error('Upload timeout - file mungkin terlalu besar'));
      });
      
      // Get API URL and token
      const baseUrl = apiClient.baseURL || 'https://cilandak.sintanagari.cloud/api';
      const token = localStorage.getItem('auth_token');
      const tenant = window.location.hostname.split('.')[0] || 'cilandak';
      
      xhr.open('POST', `${baseUrl}/wargas/import`);
      xhr.timeout = 300000; // 5 minutes timeout
      
      // Set headers
      if (token) {
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      }
      xhr.setRequestHeader('Accept', 'application/json');
      xhr.setRequestHeader('X-Tenant-Domain', tenant);
      
      xhr.send(formData);
    });
  },

  // Download import template
  downloadTemplate: async () => {
    return apiClient.downloadBlob('/wargas/template/download');
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