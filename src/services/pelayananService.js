import apiClient from './apiClient.js';

export const pelayananService = {
  // JENIS PELAYANAN (SURAT TEMPLATES)
  jenisLayanan: {
    // Get all jenis layanan for sidebar
    getAll: async () => {
      return apiClient.get('/pelayanan-jenis');
    },

    // Get jenis layanan by ID
    getById: async (id) => {
      return apiClient.get(`/pelayanan-jenis/${id}`);
    },

    // Create new jenis layanan (admin only)
    create: async (data) => {
      return apiClient.post('/pelayanan-jenis', data);
    },

    // Update jenis layanan
    update: async (id, data) => {
      return apiClient.put(`/pelayanan-jenis/${id}`, data);
    },

    // Delete jenis layanan
    delete: async (id) => {
      return apiClient.delete(`/pelayanan-jenis/${id}`);
    },

    // Get by category
    getByCategory: async (kategori) => {
      return apiClient.get('/pelayanan-jenis', { kategori });
    }
  },

  // PELAYANAN REQUESTS
  permohonan: {
    // Get all permohonan with pagination and filters
    getAll: async (params = {}) => {
      const defaultParams = {
        page: 1,
        per_page: 15,
        ...params
      };
      return apiClient.get('/pelayanan', defaultParams);
    },

    // Get permohonan by ID
    getById: async (id) => {
      return apiClient.get(`/pelayanan/${id}`);
    },

    // Create new permohonan
    create: async (data) => {
      return apiClient.post('/pelayanan', data);
    },

    // Update permohonan status
    updateStatus: async (id, status, keterangan = '') => {
      return apiClient.put(`/pelayanan/${id}`, {
        status,
        keterangan
      });
    },

    // Update permohonan data
    update: async (id, data) => {
      return apiClient.put(`/pelayanan/${id}`, data);
    },

    // Delete permohonan
    delete: async (id) => {
      return apiClient.delete(`/pelayanan/${id}`);
    },

    // Generate PDF surat
    generateSurat: async (id) => {
      return apiClient.post(`/pelayanan/${id}/generate`);
    },

    // Get by status
    getByStatus: async (status, params = {}) => {
      return apiClient.get('/pelayanan', {
        status,
        ...params
      });
    },

    // Get by jenis layanan
    getByJenis: async (jenisLayananId, params = {}) => {
      return apiClient.get('/pelayanan', {
        jenis_layanan_id: jenisLayananId,
        ...params
      });
    },

    // Get permohonan statistics
    getStatistics: async (startDate = null, endDate = null) => {
      const params = {};
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;
      return apiClient.get('/pelayanan/statistics', params);
    },

    // Search permohonan
    search: async (query, params = {}) => {
      return apiClient.get('/pelayanan', {
        search: query,
        ...params
      });
    },

    // Export permohonan data
    export: async (filters = {}, format = 'xlsx') => {
      const params = { ...filters, format };
      return apiClient.get('/pelayanan/export', params);
    },

    // Get my permohonan (for warga)
    getMy: async (params = {}) => {
      return apiClient.get('/pelayanan/my', params);
    },

    // Cancel permohonan
    cancel: async (id, alasan) => {
      return apiClient.post(`/pelayanan/${id}/cancel`, { alasan });
    },

    // Approve permohonan
    approve: async (id, keterangan = '') => {
      return apiClient.post(`/pelayanan/${id}/approve`, { keterangan });
    },

    // Reject permohonan
    reject: async (id, alasan) => {
      return apiClient.post(`/pelayanan/${id}/reject`, { alasan });
    },

    // Process permohonan
    process: async (id, keterangan = '') => {
      return apiClient.post(`/pelayanan/${id}/process`, { keterangan });
    },

    // Complete permohonan
    complete: async (id, keterangan = '') => {
      return apiClient.post(`/pelayanan/${id}/complete`, { keterangan });
    }
  },

  // TEMPLATE MANAGEMENT
  template: {
    // Get all templates
    getAll: async () => {
      return apiClient.get('/surat-templates');
    },

    // Get template by ID
    getById: async (id) => {
      return apiClient.get(`/surat-templates/${id}`);
    },

    // Create new template
    create: async (data) => {
      return apiClient.post('/surat-templates', data);
    },

    // Update template
    update: async (id, data) => {
      return apiClient.put(`/surat-templates/${id}`, data);
    },

    // Delete template
    delete: async (id) => {
      return apiClient.delete(`/surat-templates/${id}`);
    },

    // Duplicate template
    duplicate: async (id, newName) => {
      return apiClient.post(`/surat-templates/${id}/duplicate`, {
        nama: newName
      });
    },

    // Preview template
    preview: async (id, data = {}) => {
      return apiClient.post(`/surat-templates/${id}/preview`, data);
    }
  },

  // LETTERHEAD & SIGNATURE
  letterhead: {
    // Get letterhead settings
    getSettings: async () => {
      return apiClient.get('/letterhead-settings');
    },

    // Update letterhead settings
    updateSettings: async (data) => {
      return apiClient.post('/letterhead-settings', data);
    },

    // Upload letterhead logo
    uploadLogo: async (file, onProgress = null) => {
      return apiClient.upload('/letterhead-settings/logo', file, onProgress);
    }
  },

  signature: {
    // Get all signatures
    getAll: async () => {
      return apiClient.get('/signatures');
    },

    // Upload signature
    upload: async (file, nama, jabatan, onProgress = null) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('nama', nama);
      formData.append('jabatan', jabatan);
      
      return apiClient.upload('/signatures', formData, onProgress);
    },

    // Delete signature
    delete: async (id) => {
      return apiClient.delete(`/signatures/${id}`);
    },

    // Set as default
    setDefault: async (id) => {
      return apiClient.post(`/signatures/${id}/set-default`);
    }
  }
};