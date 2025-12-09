import apiClient from './apiClient.js';

export const suratTemplateService = {
  // Get all templates
  getAll: async (params = {}) => {
    const queryParams = new URLSearchParams();
    // Always send active param - 'all' will show all templates including inactive
    if (params.active) {
      queryParams.append('active', params.active);
    }
    if (params.kategori) {
      queryParams.append('kategori', params.kategori);
    }
    if (params.search) {
      queryParams.append('search', params.search);
    }
    const query = queryParams.toString();
    const response = await apiClient.get(`/surat-templates${query ? '?' + query : ''}`);
    return Array.isArray(response) ? response : (response.data || response.templates || []);
  },

  // Get template by ID with variables
  getById: async (id) => {
    const response = await apiClient.get(`/surat-templates/${id}`);
    return response.data || response;
  },

  // Upload template .docx
  upload: async (formData) => {
    // Don't set Content-Type for FormData - browser will set it with boundary
    const response = await apiClient.post('/surat-templates/upload', formData);
    return response.data || response;
  },

  // Update template - use POST with _method=PUT for FormData (Laravel requirement)
  update: async (id, formData) => {
    // If FormData, use POST with method spoofing (Laravel can't parse PUT with files)
    if (formData instanceof FormData) {
      formData.append('_method', 'PUT');
      // Don't set Content-Type for FormData - browser will set it with boundary
      const response = await apiClient.post(`/surat-templates/${id}`, formData);
      return response.data || response;
    }
    // Regular JSON update
    const response = await apiClient.put(`/surat-templates/${id}`, formData);
    return response.data || response;
  },

  // Generate surat dari template
  generate: async (templateId, data) => {
    const response = await apiClient.post(`/surat-templates/${templateId}/generate`, data);
    return response.data || response;
  },

  // Get available system variables
  getVariables: async () => {
    const response = await apiClient.get('/surat-templates/variables');
    return response.data || response;
  },

  // Extract variables from specific template
  extractVariables: async (id) => {
    const response = await apiClient.get(`/surat-templates/${id}/variables`);
    return response.data || response;
  },

  // Get categories
  getCategories: async () => {
    const response = await apiClient.get('/surat-templates/categories');
    return response.data || response;
  },

  // Get statistics
  getStatistics: async () => {
    const response = await apiClient.get('/surat-templates/statistics');
    return response.data || response;
  },

  // Download template
  download: async (templateId) => {
    const blob = await apiClient.downloadBlob(`/surat-templates/${templateId}/download`);
    return blob;
  },

  // Preview template - get file URL and variables
  preview: async (templateId) => {
    const response = await apiClient.get(`/surat-templates/${templateId}/preview`);
    return response.data || response;
  },

  // Test generate with random warga
  testGenerate: async (templateId) => {
    const response = await apiClient.post(`/surat-templates/${templateId}/test-generate`);
    return response.data || response;
  },

  // Generate surat with specific warga
  generate: async (templateId, wargaId, customData = {}) => {
    const response = await apiClient.post(`/surat-templates/${templateId}/generate`, {
      warga_id: wargaId,
      custom_data: customData
    });
    return response.data || response;
  },

  // Duplicate template
  duplicate: async (id) => {
    const response = await apiClient.post(`/surat-templates/${id}/duplicate`);
    return response.data || response;
  },

  // Toggle active status
  toggleActive: async (id) => {
    const response = await apiClient.post(`/surat-templates/${id}/toggle-active`);
    return response.data || response;
  },

  // Delete template
  delete: async (templateId) => {
    const response = await apiClient.delete(`/surat-templates/${templateId}`);
    return response.data || response;
  },
};
