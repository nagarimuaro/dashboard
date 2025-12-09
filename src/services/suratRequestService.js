import apiClient from './apiClient.js';
import API_CONFIG from '../config/api.js';

const suratRequestService = {
  // Get all surat requests with optional filters
  getAll: async (params = {}) => {
    const response = await apiClient.get('/surat-requests', { params });
    return response;
  },

  // Get statistics
  getStats: async () => {
    const response = await apiClient.get('/surat-requests/stats');
    return response;
  },

  // Get detailed report (stats per template)
  getReport: async () => {
    const response = await apiClient.get('/surat-requests/report');
    return response;
  },

  // Get single request by ID
  getById: async (id) => {
    const response = await apiClient.get(`/surat-requests/${id}`);
    return response;
  },

  // Create manual request (from dashboard)
  createManual: async (data) => {
    const response = await apiClient.post('/surat-requests/manual', data, {
      timeout: API_CONFIG.LONG_TIMEOUT // 2 minutes for document generation
    });
    return response.data;
  },

  // Staff: Approve and forward to Wali Nagari
  staffApprove: async (id, notes = '') => {
    const response = await apiClient.post(`/surat-requests/${id}/staff-approve`, { notes });
    return response.data;
  },

  // Staff: Reject
  staffReject: async (id, notes) => {
    const response = await apiClient.post(`/surat-requests/${id}/staff-reject`, { notes });
    return response.data;
  },

  // Wali Nagari: Sign (includes PDF generation)
  waliSign: async (id, signatureImage = null) => {
    const response = await apiClient.post(`/surat-requests/${id}/wali-sign`, { signature_image: signatureImage }, {
      timeout: API_CONFIG.LONG_TIMEOUT // 2 minutes for PDF generation
    });
    return response.data;
  },

  // Wali Nagari: Reject
  waliReject: async (id, notes) => {
    const response = await apiClient.post(`/surat-requests/${id}/wali-reject`, { notes });
    return response.data;
  },

  // Send PDF to user via WhatsApp (heavy operation)
  sendToUser: async (id) => {
    const response = await apiClient.post(`/surat-requests/${id}/send`, {}, {
      timeout: API_CONFIG.LONG_TIMEOUT // 2 minutes for WhatsApp sending
    });
    return response.data;
  },
};

export default suratRequestService;
