import apiClient from './apiClient.js';

export const keluargaService = {
  // Get all keluarga with pagination and filters
  getAll: async (params = {}) => {
    const defaultParams = {
      page: 1,
      per_page: 15,
      ...params
    };
    return apiClient.get('/keluargas', defaultParams);
  },

  // Get keluarga by ID
  getById: async (id) => {
    return apiClient.get(`/keluargas/${id}`);
  },

  // Create new keluarga
  create: async (data) => {
    return apiClient.post('/keluargas', data);
  },

  // Update keluarga
  update: async (id, data) => {
    return apiClient.put(`/keluargas/${id}`, data);
  },

  // Delete keluarga
  delete: async (id) => {
    return apiClient.delete(`/keluargas/${id}`);
  },

  // Add family member
  addMember: async (keluargaId, wargaId, hubungan) => {
    return apiClient.post(`/keluargas/${keluargaId}/add-anggota`, {
      warga_id: wargaId,
      hubungan_keluarga: hubungan
    });
  },

  // Remove family member
  removeMember: async (keluargaId, wargaId) => {
    return apiClient.post(`/keluargas/${keluargaId}/remove-anggota`, {
      warga_id: wargaId
    });
  },

  // Get family members
  getMembers: async (keluargaId) => {
    return apiClient.get(`/keluargas/${keluargaId}/anggota`);
  },

  // Search keluarga by KK number
  searchByKK: async (noKK) => {
    return apiClient.get('/keluargas', {
      search: noKK,
      search_type: 'no_kk'
    });
  },

  // Search keluarga by head name
  searchByKepala: async (namaKepala) => {
    return apiClient.get('/keluargas', {
      search: namaKepala,
      search_type: 'kepala_keluarga'
    });
  },

  // Get keluarga statistics
  getStatistics: async () => {
    return apiClient.get('/keluargas/statistics');
  },

  // Get keluarga by filters
  getByFilters: async (filters) => {
    return apiClient.get('/keluargas', filters);
  },

  // Export keluarga data
  export: async (filters = {}, format = 'pdf') => {
    const params = { ...filters, format };
    return apiClient.get('/keluargas/export', params);
  },

  // Export keluarga with download and progress
  exportWithDownload: async (filters = {}, format = 'pdf', onProgress = null) => {
    const params = { ...filters, format };
    return apiClient.downloadBlobWithProgress('/keluargas/export', params, onProgress);
  },

  // Bulk import keluarga
  bulkImport: async (file, onProgress = null) => {
    return apiClient.upload('/keluargas/import', file, onProgress);
  },

  // Get keluarga by jorong
  getByJorong: async (jorong, params = {}) => {
    return apiClient.get('/keluargas', {
      jorong,
      ...params
    });
  },

  // Get keluarga by RT/RW
  getByRTRW: async (rt, rw, params = {}) => {
    return apiClient.get('/keluargas', {
      rt,
      rw,
      ...params
    });
  },

  // Validate KK number
  validateKK: async (noKK, excludeId = null) => {
    return apiClient.post('/keluargas/validate-kk', { 
      no_kk: noKK, 
      exclude_id: excludeId 
    });
  },

  // Get family size statistics
  getFamilySizeStatistics: async () => {
    return apiClient.get('/keluargas/size-statistics');
  },

  // Get families without head
  getFamiliesWithoutHead: async () => {
    return apiClient.get('/keluargas/without-head');
  },

  // Set family head
  setFamilyHead: async (keluargaId, wargaId) => {
    return apiClient.post(`/keluargas/${keluargaId}/set-head`, {
      warga_id: wargaId
    });
  },

  // Get orphaned family members (no family assigned)
  getOrphanedMembers: async () => {
    return apiClient.get('/keluargas/orphaned-members');
  },

  // Transfer family member to another family
  transferMember: async (fromKeluargaId, toKeluargaId, wargaId, hubungan) => {
    return apiClient.post(`/keluargas/${fromKeluargaId}/transfer-member`, {
      to_keluarga_id: toKeluargaId,
      warga_id: wargaId,
      hubungan_keluarga: hubungan
    });
  },

  // Merge two families
  mergeFamilies: async (mainKeluargaId, mergeKeluargaId) => {
    return apiClient.post(`/keluargas/${mainKeluargaId}/merge`, {
      merge_keluarga_id: mergeKeluargaId
    });
  },

  // Split family
  splitFamily: async (keluargaId, newFamilyData, memberIds) => {
    return apiClient.post(`/keluargas/${keluargaId}/split`, {
      new_family: newFamilyData,
      member_ids: memberIds
    });
  }
};