/**
 * Social Data Service
 * Service untuk mengelola data sosial (Kemiskinan, Stunting, KB, Disabilitas, RTLH, Putus Sekolah)
 */

import apiClient from './apiClient';

// API Endpoints
const ENDPOINTS = {
  CONFIG: '/social-data/config',
  SUMMARY: '/social-data/summary',
  STATISTICS_BY_JORONG: '/social-data/statistics-by-jorong',
  POPULATION_STATS: '/social-data/population-stats',
  KEMISKINAN: '/social-data/kemiskinan',
  STUNTING: '/social-data/stunting',
  KB: '/social-data/kb',
  DISABILITAS: '/social-data/disabilitas',
  RTLH: '/social-data/rtlh',
  PUTUS_SEKOLAH: '/social-data/putus-sekolah',
  JORONGS: '/social-data/jorongs',
  // WHO LMS Growth Analysis endpoints
  STUNTING_DASHBOARD: '/stunting/dashboard',
  STUNTING_BATCH_ANALYZE: '/stunting/batch-analyze',
  GROWTH_ANALYZE: '/anak', // /anak/{wargaId}/analyze
  GROWTH_STATS: '/anak', // /anak/{wargaId}/statistik-pertumbuhan
  GROWTH_HISTORY: '/anak', // /anak/{wargaId}/riwayat-pertumbuhan
  GROWTH_CHART: '/growth-chart', // /growth-chart/{indicator}/{gender}
  DASHBOARD_STUNTING: '/dashboard/stunting',
};

/**
 * Social Data Service Class
 */
class SocialDataService {
  /**
   * Get configuration for all social data types
   * @returns {Promise<Object>} Configuration with status options, jenis options, and jorongs
   */
  async getConfig() {
    const response = await apiClient.get(ENDPOINTS.CONFIG);
    return response.data;
  }

  /**
   * Get summary statistics for all social data types
   * @param {number} tahun - Year to filter (default: current year)
   * @returns {Promise<Object>} Summary statistics for all types
   */
  async getSummary(tahun = new Date().getFullYear()) {
    const response = await apiClient.get(ENDPOINTS.SUMMARY, { tahun });
    return response.data;
  }

  /**
   * Get statistics grouped by jorong
   * @param {Object} params - Query parameters
   * @param {number} params.tahun - Year to filter
   * @param {string} params.type - Type filter (all, kemiskinan, stunting, etc.)
   * @returns {Promise<Object>} Statistics by jorong
   */
  async getStatisticsByJorong(params = {}) {
    const response = await apiClient.get(ENDPOINTS.STATISTICS_BY_JORONG, params);
    return response.data;
  }

  /**
   * Get population statistics with social data effects
   * @param {number} tahun - Year to filter (default: current year)
   * @returns {Promise<Object>} Population statistics with social data effects
   */
  async getPopulationStats(tahun = new Date().getFullYear()) {
    const response = await apiClient.get(ENDPOINTS.POPULATION_STATS, { tahun });
    return response.data;
  }

  // =====================
  // KEMISKINAN
  // =====================

  /**
   * Get list of kemiskinan data
   * @param {Object} params - Query parameters (status, jorong, tahun, search, per_page, page)
   * @returns {Promise<Object>} Paginated kemiskinan data
   */
  async getKemiskinan(params = {}) {
    const response = await apiClient.get(ENDPOINTS.KEMISKINAN, params);
    return response.data;
  }

  /**
   * Get single kemiskinan data by ID
   * @param {number} id - Kemiskinan ID
   * @returns {Promise<Object>} Kemiskinan data
   */
  async getKemiskinanById(id) {
    const response = await apiClient.get(`${ENDPOINTS.KEMISKINAN}/${id}`);
    return response.data;
  }

  /**
   * Create new kemiskinan data
   * @param {Object} data - Kemiskinan data to create
   * @returns {Promise<Object>} Created kemiskinan data
   */
  async createKemiskinan(data) {
    const response = await apiClient.post(ENDPOINTS.KEMISKINAN, data);
    return response.data;
  }

  /**
   * Update kemiskinan data
   * @param {number} id - Kemiskinan ID
   * @param {Object} data - Data to update
   * @returns {Promise<Object>} Updated kemiskinan data
   */
  async updateKemiskinan(id, data) {
    const response = await apiClient.put(`${ENDPOINTS.KEMISKINAN}/${id}`, data);
    return response.data;
  }

  /**
   * Delete kemiskinan data
   * @param {number} id - Kemiskinan ID
   * @returns {Promise<Object>} Delete result
   */
  async deleteKemiskinan(id) {
    const response = await apiClient.delete(`${ENDPOINTS.KEMISKINAN}/${id}`);
    return response;
  }

  // =====================
  // STUNTING
  // =====================

  async getStunting(params = {}) {
    const response = await apiClient.get(ENDPOINTS.STUNTING, params);
    return response.data;
  }

  async getStuntingById(id) {
    const response = await apiClient.get(`${ENDPOINTS.STUNTING}/${id}`);
    return response.data;
  }

  async createStunting(data) {
    const response = await apiClient.post(ENDPOINTS.STUNTING, data);
    return response.data;
  }

  async updateStunting(id, data) {
    const response = await apiClient.put(`${ENDPOINTS.STUNTING}/${id}`, data);
    return response.data;
  }

  async deleteStunting(id) {
    const response = await apiClient.delete(`${ENDPOINTS.STUNTING}/${id}`);
    return response;
  }

  // =====================
  // STUNTING ANALYSIS (WHO LMS)
  // Analisis pertumbuhan anak menggunakan standar WHO
  // Output mirip Buku Pink KIA
  // =====================

  /**
   * Get stunting dashboard statistics
   * @returns {Promise<Object>} Dashboard statistics with charts data
   */
  async getStuntingDashboard() {
    const response = await apiClient.get(ENDPOINTS.DASHBOARD_STUNTING);
    return response.data;
  }

  /**
   * Analyze child growth using WHO LMS standards
   * @param {number} wargaId - Warga (child) ID
   * @param {Object} data - Measurement data
   * @param {number} data.berat_kg - Weight in kg
   * @param {number} data.tinggi_cm - Height in cm
   * @param {string} data.tanggal_pengukuran - Measurement date (YYYY-MM-DD)
   * @param {number} data.lingkar_kepala_cm - Head circumference (optional)
   * @param {string} data.posyandu - Posyandu name (optional)
   * @param {boolean} data.simpan - Save to database (default: true)
   * @returns {Promise<Object>} Analysis result with z-scores, status, recommendations
   */
  async analyzeChildGrowth(wargaId, data) {
    const response = await apiClient.post(`${ENDPOINTS.GROWTH_ANALYZE}/${wargaId}/analyze`, data);
    return response.data;
  }

  /**
   * Get child growth statistics (for charts)
   * @param {number} wargaId - Warga (child) ID
   * @returns {Promise<Object>} Growth statistics with chart data
   */
  async getChildGrowthStats(wargaId) {
    const response = await apiClient.get(`${ENDPOINTS.GROWTH_STATS}/${wargaId}/statistik-pertumbuhan`);
    return response.data;
  }

  /**
   * Get child growth history
   * @param {number} wargaId - Warga (child) ID
   * @param {Object} params - Query params (start_date, end_date, per_page)
   * @returns {Promise<Object>} Paginated growth history
   */
  async getChildGrowthHistory(wargaId, params = {}) {
    const response = await apiClient.get(`${ENDPOINTS.GROWTH_HISTORY}/${wargaId}/riwayat-pertumbuhan`, params);
    return response.data;
  }

  /**
   * Batch analyze multiple children (for Posyandu sessions)
   * @param {Object} data - Batch data
   * @param {Array} data.measurements - Array of measurements {warga_id, berat_kg, tinggi_cm, ...}
   * @param {string} data.posyandu - Posyandu name
   * @returns {Promise<Object>} Batch analysis results
   */
  async batchAnalyzeGrowth(data) {
    const response = await apiClient.post(ENDPOINTS.STUNTING_BATCH_ANALYZE, data);
    return response.data;
  }

  /**
   * Get WHO growth chart reference curves
   * @param {string} indicator - height_for_age, weight_for_age, weight_for_height, bmi_for_age
   * @param {string} gender - male/female or L/P
   * @param {number} maxMonth - Maximum month to include (default: 60)
   * @returns {Promise<Object>} Reference curves for chart
   */
  async getGrowthChartReference(indicator, gender, maxMonth = 60) {
    const response = await apiClient.get(`${ENDPOINTS.GROWTH_CHART}/${indicator}/${gender}`, { max_month: maxMonth });
    return response.data;
  }

  /**
   * Export KMS (Kartu Menuju Sehat) data for a child
   * @param {number} wargaId - Warga (child) ID
   * @returns {Promise<Object>} KMS export data
   */
  async exportKMS(wargaId) {
    const response = await apiClient.get(`${ENDPOINTS.GROWTH_ANALYZE}/${wargaId}/export-kms`);
    return response.data;
  }

  // =====================
  // KB (Keluarga Berencana)
  // =====================

  async getKb(params = {}) {
    const response = await apiClient.get(ENDPOINTS.KB, params);
    return response.data;
  }

  async getKbById(id) {
    const response = await apiClient.get(`${ENDPOINTS.KB}/${id}`);
    return response.data;
  }

  async createKb(data) {
    const response = await apiClient.post(ENDPOINTS.KB, data);
    return response.data;
  }

  async updateKb(id, data) {
    const response = await apiClient.put(`${ENDPOINTS.KB}/${id}`, data);
    return response.data;
  }

  async deleteKb(id) {
    const response = await apiClient.delete(`${ENDPOINTS.KB}/${id}`);
    return response;
  }

  // =====================
  // DISABILITAS
  // =====================

  async getDisabilitas(params = {}) {
    const response = await apiClient.get(ENDPOINTS.DISABILITAS, params);
    return response.data;
  }

  async getDisabilitasById(id) {
    const response = await apiClient.get(`${ENDPOINTS.DISABILITAS}/${id}`);
    return response.data;
  }

  async createDisabilitas(data) {
    const response = await apiClient.post(ENDPOINTS.DISABILITAS, data);
    return response.data;
  }

  async updateDisabilitas(id, data) {
    const response = await apiClient.put(`${ENDPOINTS.DISABILITAS}/${id}`, data);
    return response.data;
  }

  async deleteDisabilitas(id) {
    const response = await apiClient.delete(`${ENDPOINTS.DISABILITAS}/${id}`);
    return response;
  }

  // =====================
  // RTLH (Rumah Tidak Layak Huni)
  // =====================

  async getRtlh(params = {}) {
    const response = await apiClient.get(ENDPOINTS.RTLH, params);
    return response.data;
  }

  async getRtlhById(id) {
    const response = await apiClient.get(`${ENDPOINTS.RTLH}/${id}`);
    return response.data;
  }

  async createRtlh(data) {
    const response = await apiClient.post(ENDPOINTS.RTLH, data);
    return response.data;
  }

  async updateRtlh(id, data) {
    const response = await apiClient.put(`${ENDPOINTS.RTLH}/${id}`, data);
    return response.data;
  }

  async deleteRtlh(id) {
    const response = await apiClient.delete(`${ENDPOINTS.RTLH}/${id}`);
    return response;
  }

  // =====================
  // PUTUS SEKOLAH
  // =====================

  async getPutusSekolah(params = {}) {
    const response = await apiClient.get(ENDPOINTS.PUTUS_SEKOLAH, params);
    return response.data;
  }

  async getPutusSekolahById(id) {
    const response = await apiClient.get(`${ENDPOINTS.PUTUS_SEKOLAH}/${id}`);
    return response.data;
  }

  async createPutusSekolah(data) {
    const response = await apiClient.post(ENDPOINTS.PUTUS_SEKOLAH, data);
    return response.data;
  }

  async updatePutusSekolah(id, data) {
    const response = await apiClient.put(`${ENDPOINTS.PUTUS_SEKOLAH}/${id}`, data);
    return response.data;
  }

  async deletePutusSekolah(id) {
    const response = await apiClient.delete(`${ENDPOINTS.PUTUS_SEKOLAH}/${id}`);
    return response;
  }

  // =====================
  // JORONG
  // =====================

  async getJorongs(params = {}) {
    const response = await apiClient.get(ENDPOINTS.JORONGS, params);
    return response.data;
  }

  async getJorongById(id) {
    const response = await apiClient.get(`${ENDPOINTS.JORONGS}/${id}`);
    return response.data;
  }

  async createJorong(data) {
    const response = await apiClient.post(ENDPOINTS.JORONGS, data);
    return response.data;
  }

  async updateJorong(id, data) {
    const response = await apiClient.put(`${ENDPOINTS.JORONGS}/${id}`, data);
    return response.data;
  }

  async deleteJorong(id) {
    const response = await apiClient.delete(`${ENDPOINTS.JORONGS}/${id}`);
    return response;
  }

  // =====================
  // HELPER METHODS
  // =====================

  /**
   * Get data by type (generic method)
   * @param {string} type - Data type (kemiskinan, stunting, kb, disabilitas, rtlh, putus-sekolah)
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} Paginated data
   */
  async getByType(type, params = {}) {
    const typeMapping = {
      'kemiskinan': this.getKemiskinan.bind(this),
      'stunting': this.getStunting.bind(this),
      'kb': this.getKb.bind(this),
      'disabilitas': this.getDisabilitas.bind(this),
      'rtlh': this.getRtlh.bind(this),
      'putus-sekolah': this.getPutusSekolah.bind(this),
    };

    const method = typeMapping[type];
    if (!method) {
      throw new Error(`Unknown social data type: ${type}`);
    }

    return method(params);
  }

  /**
   * Create data by type (generic method)
   * @param {string} type - Data type
   * @param {Object} data - Data to create
   * @returns {Promise<Object>} Created data
   */
  async createByType(type, data) {
    const typeMapping = {
      'kemiskinan': this.createKemiskinan.bind(this),
      'stunting': this.createStunting.bind(this),
      'kb': this.createKb.bind(this),
      'disabilitas': this.createDisabilitas.bind(this),
      'rtlh': this.createRtlh.bind(this),
      'putus-sekolah': this.createPutusSekolah.bind(this),
    };

    const method = typeMapping[type];
    if (!method) {
      throw new Error(`Unknown social data type: ${type}`);
    }

    return method(data);
  }

  /**
   * Update data by type (generic method)
   * @param {string} type - Data type
   * @param {number} id - Data ID
   * @param {Object} data - Data to update
   * @returns {Promise<Object>} Updated data
   */
  async updateByType(type, id, data) {
    const typeMapping = {
      'kemiskinan': this.updateKemiskinan.bind(this),
      'stunting': this.updateStunting.bind(this),
      'kb': this.updateKb.bind(this),
      'disabilitas': this.updateDisabilitas.bind(this),
      'rtlh': this.updateRtlh.bind(this),
      'putus-sekolah': this.updatePutusSekolah.bind(this),
    };

    const method = typeMapping[type];
    if (!method) {
      throw new Error(`Unknown social data type: ${type}`);
    }

    return method(id, data);
  }

  /**
   * Delete data by type (generic method)
   * @param {string} type - Data type
   * @param {number} id - Data ID
   * @returns {Promise<Object>} Delete result
   */
  async deleteByType(type, id) {
    const typeMapping = {
      'kemiskinan': this.deleteKemiskinan.bind(this),
      'stunting': this.deleteStunting.bind(this),
      'kb': this.deleteKb.bind(this),
      'disabilitas': this.deleteDisabilitas.bind(this),
      'rtlh': this.deleteRtlh.bind(this),
      'putus-sekolah': this.deletePutusSekolah.bind(this),
    };

    const method = typeMapping[type];
    if (!method) {
      throw new Error(`Unknown social data type: ${type}`);
    }

    return method(id);
  }

  /**
   * Get data by ID and type (generic method)
   * @param {string} type - Data type
   * @param {number} id - Data ID
   * @returns {Promise<Object>} Data detail
   */
  async getByIdAndType(type, id) {
    const typeMapping = {
      'kemiskinan': this.getKemiskinanById.bind(this),
      'stunting': this.getStuntingById.bind(this),
      'kb': this.getKbById.bind(this),
      'disabilitas': this.getDisabilitasById.bind(this),
      'rtlh': this.getRtlhById.bind(this),
      'putus-sekolah': this.getPutusSekolahById.bind(this),
    };

    const method = typeMapping[type];
    if (!method) {
      throw new Error(`Unknown social data type: ${type}`);
    }

    return method(id);
  }

  /**
   * Get growth history by stunting data ID
   * @param {number} id - Stunting data ID
   * @returns {Promise<Object>} Growth history
   */
  async getGrowthHistory(id) {
    // Alias for getChildGrowthHistory using the stunting record's warga_id
    // First get the stunting data to get the warga_id
    try {
      const stuntingData = await this.getStuntingById(id);
      // stuntingData is already response.data
      if (stuntingData?.warga_id) {
        return this.getChildGrowthHistory(stuntingData.warga_id);
      }
      // If no warga_id, return empty history
      return { data: [] };
    } catch (error) {
      console.error('Failed to get growth history:', error);
      return { data: [] };
    }
  }
}

// Export singleton instance
const socialDataService = new SocialDataService();
export default socialDataService;

// Named exports for convenience
export {
  socialDataService,
  ENDPOINTS as SOCIAL_DATA_ENDPOINTS,
};
