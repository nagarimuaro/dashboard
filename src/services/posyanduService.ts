/**
 * Posyandu Service
 * API client untuk data posyandu: kehamilan, persalinan, dan imunisasi
 */

import apiClient from './apiClient';

// =====================
// TYPE DEFINITIONS
// =====================

export interface Kehamilan {
  id: number;
  warga_id: number;
  nama_ibu?: string;
  nik_ibu?: string;
  nik?: string; // alias for nik_ibu
  tanggal_lahir_ibu?: string;
  tanggal_hpht: string;
  tanggal_hpl?: string;
  tanggal_taksiran_lahir?: string; // alias for tanggal_hpl
  usia_kehamilan_minggu?: number;
  usia_kehamilan?: number; // alias
  trimester?: number;
  kehamilan_ke?: number;
  gravida: number;
  paritas?: number;
  para?: number; // alias for paritas
  abortus: number;
  status_risiko: 'Rendah' | 'Tinggi' | 'Sangat Tinggi' | 'rendah' | 'sedang' | 'tinggi';
  faktor_risiko?: string[] | string;
  status: 'Hamil' | 'Melahirkan' | 'Batal' | 'aktif' | 'selesai' | 'batal';
  alamat?: string;
  jorong?: string;
  rt?: string;
  rw?: string;
  posyandu?: string;
  bidan_penanggung_jawab?: string;
  riwayat_persalinan?: string;
  tahun_data?: number;
  keterangan?: string;
  catatan?: string; // alias for keterangan
  tanggal_pendaftaran?: string;
  petugas_id?: number;
  created_at: string;
  updated_at: string;
  anc_count?: number;
  warga?: {
    id: number;
    nama: string;
    nik: string;
    tanggal_lahir: string;
    alamat?: string;
    jorong?: string;
  };
}

export interface AncRecord {
  id: number;
  kehamilan_id: number;
  tanggal_pemeriksaan: string;
  usia_kehamilan: number;
  trimester: number;
  kunjungan_ke: number;
  berat_badan?: number;
  tekanan_darah_sistolik?: number;
  tekanan_darah_diastolik?: number;
  tinggi_fundus?: number;
  lingkar_lengan_atas?: number;
  denyut_jantung_janin?: number;
  posisi_janin?: string;
  keluhan?: string;
  tindakan?: string;
  pemberian_tablet_fe?: boolean;
  petugas?: string;
  catatan?: string;
  created_at: string;
}

export interface Persalinan {
  id: number;
  data_kehamilan_id?: number;
  kehamilan_id?: number; // alias for data_kehamilan_id
  ibu_warga_id?: number;
  warga_id?: number; // alias for ibu_warga_id
  bayi_warga_id?: number;
  nama_ibu?: string;
  tanggal_persalinan: string;
  jam_persalinan?: string;
  usia_kehamilan_saat_lahir?: number;
  tempat_persalinan: string;
  nama_fasilitas?: string;
  jenis_persalinan: 'Spontan/Normal' | 'SC' | 'Vakum' | 'Forsep' | 'Lainnya' | 'normal' | 'vakum' | 'forcep' | 'sectio_caesaria';
  penolong_persalinan?: string;
  penolong?: string; // alias for penolong_persalinan
  nama_penolong?: string;
  komplikasi_ibu?: string;
  komplikasi_persalinan?: string;
  tindakan_komplikasi?: string;
  rujukan?: boolean;
  tempat_rujukan?: string;
  kondisi_ibu: 'Baik' | 'Komplikasi' | 'Meninggal' | 'sehat' | 'komplikasi';
  kondisi_bayi: 'Hidup Sehat' | 'Hidup dengan Kelainan' | 'Meninggal' | 'sehat' | 'perlu_perawatan' | 'meninggal';
  nama_bayi?: string;
  jenis_kelamin_bayi: 'L' | 'P' | 'Laki-laki' | 'Perempuan';
  berat_lahir_gram?: number;
  berat_bayi?: number; // alias for berat_lahir_gram
  panjang_lahir_cm?: number;
  panjang_bayi?: number; // alias for panjang_lahir_cm
  lingkar_kepala_cm?: number;
  apgar_score_1?: number;
  apgar_score_5?: number;
  kelainan_bawaan?: string;
  is_bblr?: boolean;
  is_prematur?: boolean;
  imd_dilakukan?: boolean;
  waktu_imd_menit?: number;
  vit_k_diberikan?: boolean;
  hb0_diberikan?: boolean;
  salep_mata_diberikan?: boolean;
  kf1_tanggal?: string;
  kf2_tanggal?: string;
  kf3_tanggal?: string;
  kf4_tanggal?: string;
  tanggal_kf1?: string; // alias
  tanggal_kf2?: string; // alias
  tanggal_kf3?: string; // alias
  petugas_id?: number;
  catatan?: string;
  created_at: string;
  updated_at: string;
  kehamilan?: Kehamilan;
  dataKehamilan?: Kehamilan;
  ibu?: {
    id: number;
    nama: string;
    nik?: string;
    tanggal_lahir?: string;
  };
  bayi?: {
    id: number;
    nama: string;
    nik?: string;
    tanggal_lahir?: string;
  };
  warga?: any;
}

export interface Imunisasi {
  id: number;
  warga_id: number;
  nama_anak?: string;
  nik_anak?: string;
  tanggal_lahir?: string;
  usia_bulan?: number;
  usia_saat_imunisasi_bulan?: number;
  jenis_imunisasi: string;
  kategori?: string;
  tanggal_pemberian: string;
  tanggal_imunisasi?: string; // deprecated, alias for tanggal_pemberian
  posyandu?: string;
  tempat_pemberian?: string;
  nama_petugas?: string;
  batch_vaksin?: string;
  produsen_vaksin?: string;
  status?: string;
  alasan_tidak_diberikan?: string;
  ada_kipi?: boolean;
  kipi_jenis?: string;
  kipi_tindakan?: string;
  catatan?: string;
  created_at: string;
  updated_at: string;
  warga?: {
    id: number;
    nama: string;
    nik: string;
    tanggal_lahir: string;
  };
  histori?: Imunisasi[];
}

export interface ImunisasiStatus {
  warga_id: number;
  nama: string;
  tanggal_lahir: string;
  usia_bulan: number;
  imunisasi_lengkap: boolean;
  imunisasi_diberikan: string[];
  imunisasi_belum: string[];
  riwayat: Imunisasi[];
}

export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface StatisticsResponse {
  total: number;
  by_status?: Record<string, number>;
  by_jorong?: Record<string, number>;
  [key: string]: any;
}

// =====================
// ENDPOINTS
// =====================

const ENDPOINTS = {
  // Kehamilan
  KEHAMILAN: '/kehamilan',
  KEHAMILAN_AKTIF: '/kehamilan/aktif',
  KEHAMILAN_RISIKO_TINGGI: '/kehamilan/risiko-tinggi',
  KEHAMILAN_STATISTICS: '/kehamilan/statistics',
  KEHAMILAN_ELIGIBLE_IBU: '/kehamilan/eligible-ibu',
  
  // ANC
  ANC_COVERAGE: '/anc/coverage',
  ANC_BELUM_K1: '/anc/belum-k1',
  ANC_PERLU_K4: '/anc/perlu-k4',
  
  // Persalinan
  PERSALINAN: '/persalinan',
  PERSALINAN_STATISTICS: '/persalinan/statistics',
  
  // Imunisasi
  IMUNISASI: '/imunisasi',
  IMUNISASI_BATCH: '/imunisasi/batch',
  IMUNISASI_SASARAN: '/imunisasi/sasaran',
  IMUNISASI_JADWAL: '/imunisasi/jadwal',
  IMUNISASI_STATISTICS: '/imunisasi/statistics',
  
  // Dashboard
  POSYANDU_DASHBOARD: '/posyandu/dashboard',
  POSYANDU_RISK_SUMMARY: '/posyandu/risk-summary',
  POSYANDU_ANC_COVERAGE: '/posyandu/anc-coverage',
  POSYANDU_IMUNISASI_COVERAGE: '/posyandu/imunisasi-coverage',
  POSYANDU_PERSALINAN_REPORT: '/posyandu/persalinan-report',
  POSYANDU_EXPORT: '/posyandu/export',
  
  // Export Format Resmi (Format 3 Posyandu)
  POSYANDU_EXPORT_FORMATS: '/posyandu/export/formats',
  POSYANDU_EXPORT_LIST: '/posyandu/export/posyandu-list',
  POSYANDU_EXPORT_FORMAT3_PDF: '/posyandu/export/format3/pdf',
  POSYANDU_EXPORT_FORMAT3_EXCEL: '/posyandu/export/format3/excel',
};

// =====================
// POSYANDU SERVICE
// =====================

class PosyanduService {
  // ==================
  // KEHAMILAN
  // ==================

  /**
   * Get list kehamilan dengan pagination dan filter
   */
  async getKehamilan(params: {
    page?: number;
    per_page?: number;
    search?: string;
    status?: string;
    status_risiko?: string;
    jorong?: string;
    trimester?: number;
  } = {}): Promise<PaginatedResponse<Kehamilan>> {
    const response = await apiClient.get(ENDPOINTS.KEHAMILAN, params);
    return response.data || response;
  }

  /**
   * Get kehamilan aktif
   */
  async getKehamilanAktif(params: {
    page?: number;
    per_page?: number;
    jorong?: string;
    trimester?: number;
  } = {}): Promise<PaginatedResponse<Kehamilan>> {
    const response = await apiClient.get(ENDPOINTS.KEHAMILAN_AKTIF, params);
    return response.data || response;
  }

  /**
   * Get kehamilan risiko tinggi
   */
  async getKehamilanRisikoTinggi(params: {
    page?: number;
    per_page?: number;
    jorong?: string;
  } = {}): Promise<PaginatedResponse<Kehamilan>> {
    const response = await apiClient.get(ENDPOINTS.KEHAMILAN_RISIKO_TINGGI, params);
    return response.data || response;
  }

  /**
   * Get detail kehamilan by ID
   */
  async getKehamilanById(id: number): Promise<Kehamilan> {
    const response = await apiClient.get(`${ENDPOINTS.KEHAMILAN}/${id}`);
    return response.data || response;
  }

  /**
   * Create new kehamilan record
   */
  async createKehamilan(data: Partial<Kehamilan>): Promise<Kehamilan> {
    const response = await apiClient.post(ENDPOINTS.KEHAMILAN, data);
    return response.data || response;
  }

  /**
   * Update kehamilan record
   */
  async updateKehamilan(id: number, data: Partial<Kehamilan>): Promise<Kehamilan> {
    const response = await apiClient.put(`${ENDPOINTS.KEHAMILAN}/${id}`, data);
    return response.data || response;
  }

  /**
   * Delete kehamilan record
   */
  async deleteKehamilan(id: number): Promise<void> {
    await apiClient.delete(`${ENDPOINTS.KEHAMILAN}/${id}`);
  }

  /**
   * Update status kehamilan
   */
  async updateKehamilanStatus(id: number, status: string, catatan?: string): Promise<Kehamilan> {
    const response = await apiClient.put(`${ENDPOINTS.KEHAMILAN}/${id}/status`, { status, catatan });
    return response.data || response;
  }

  /**
   * Get risk assessment for kehamilan
   */
  async getKehamilanRiskAssessment(id: number): Promise<any> {
    const response = await apiClient.get(`${ENDPOINTS.KEHAMILAN}/${id}/risk-assessment`);
    return response.data || response;
  }

  /**
   * Get kehamilan statistics
   */
  async getKehamilanStatistics(params: { tahun?: number; jorong?: string } = {}): Promise<StatisticsResponse> {
    const response = await apiClient.get(ENDPOINTS.KEHAMILAN_STATISTICS, params);
    return response.data || response;
  }

  /**
   * Get eligible ibu for new kehamilan
   */
  async getEligibleIbu(search?: string): Promise<any[]> {
    const response = await apiClient.get(ENDPOINTS.KEHAMILAN_ELIGIBLE_IBU, { search });
    return response.data || response;
  }

  // ==================
  // ANC (Antenatal Care)
  // ==================

  /**
   * Get ANC records for kehamilan
   */
  async getAncRecords(kehamilanId: number): Promise<AncRecord[]> {
    const response = await apiClient.get(`${ENDPOINTS.KEHAMILAN}/${kehamilanId}/anc`);
    return response.data || response;
  }

  /**
   * Create new ANC record
   */
  async createAncRecord(kehamilanId: number, data: Partial<AncRecord>): Promise<AncRecord> {
    const response = await apiClient.post(`${ENDPOINTS.KEHAMILAN}/${kehamilanId}/anc`, data);
    return response.data || response;
  }

  /**
   * Update ANC record
   */
  async updateAncRecord(id: number, data: Partial<AncRecord>): Promise<AncRecord> {
    const response = await apiClient.put(`/anc/${id}`, data);
    return response.data || response;
  }

  /**
   * Delete ANC record
   */
  async deleteAncRecord(id: number): Promise<void> {
    await apiClient.delete(`/anc/${id}`);
  }

  /**
   * Get ANC coverage report
   */
  async getAncCoverage(params: { tahun?: number; jorong?: string } = {}): Promise<any> {
    const response = await apiClient.get(ENDPOINTS.ANC_COVERAGE, params);
    return response.data || response;
  }

  /**
   * Get list ibu belum K1
   */
  async getIbuBelumK1(): Promise<Kehamilan[]> {
    const response = await apiClient.get(ENDPOINTS.ANC_BELUM_K1);
    return response.data || response;
  }

  /**
   * Get list ibu perlu K4
   */
  async getIbuPerluK4(): Promise<Kehamilan[]> {
    const response = await apiClient.get(ENDPOINTS.ANC_PERLU_K4);
    return response.data || response;
  }

  // ==================
  // PERSALINAN
  // ==================

  /**
   * Get list persalinan dengan pagination dan filter
   */
  async getPersalinan(params: {
    page?: number;
    per_page?: number;
    search?: string;
    jenis_persalinan?: string;
    kondisi_ibu?: string;
    kondisi_bayi?: string;
    status_nifas?: string;
    jorong?: string;
    tahun?: number;
    bulan?: number;
  } = {}): Promise<PaginatedResponse<Persalinan>> {
    const response = await apiClient.get(ENDPOINTS.PERSALINAN, params);
    return response.data || response;
  }

  /**
   * Get detail persalinan by ID
   */
  async getPersalinanById(id: number): Promise<Persalinan> {
    const response = await apiClient.get(`${ENDPOINTS.PERSALINAN}/${id}`);
    return response.data || response;
  }

  /**
   * Create new persalinan record
   */
  async createPersalinan(data: Partial<Persalinan>): Promise<Persalinan> {
    const response = await apiClient.post(ENDPOINTS.PERSALINAN, data);
    return response.data || response;
  }

  /**
   * Update persalinan record
   */
  async updatePersalinan(id: number, data: Partial<Persalinan>): Promise<Persalinan> {
    const response = await apiClient.put(`${ENDPOINTS.PERSALINAN}/${id}`, data);
    return response.data || response;
  }

  /**
   * Delete persalinan record
   */
  async deletePersalinan(id: number): Promise<void> {
    await apiClient.delete(`${ENDPOINTS.PERSALINAN}/${id}`);
  }

  /**
   * Update nifas status
   */
  async updateNifas(id: number, data: { status_nifas: string; tanggal?: string; catatan?: string }): Promise<Persalinan> {
    const response = await apiClient.put(`${ENDPOINTS.PERSALINAN}/${id}/nifas`, data);
    return response.data || response;
  }

  /**
   * Create bayi record from persalinan
   */
  async createBayi(persalinanId: number, data: { nama: string; nik?: string }): Promise<any> {
    const response = await apiClient.post(`${ENDPOINTS.PERSALINAN}/${persalinanId}/create-bayi`, data);
    return response.data || response;
  }

  /**
   * Get persalinan statistics
   */
  async getPersalinanStatistics(params: { tahun?: number; jorong?: string } = {}): Promise<StatisticsResponse> {
    const response = await apiClient.get(ENDPOINTS.PERSALINAN_STATISTICS, params);
    return response.data || response;
  }

  // ==================
  // IMUNISASI
  // ==================

  /**
   * Get list imunisasi dengan pagination dan filter
   */
  async getImunisasi(params: {
    page?: number;
    per_page?: number;
    search?: string;
    jenis_imunisasi?: string;
    jorong?: string;
    tanggal_dari?: string;
    tanggal_sampai?: string;
  } = {}): Promise<PaginatedResponse<Imunisasi>> {
    const response = await apiClient.get(ENDPOINTS.IMUNISASI, params);
    return response.data || response;
  }

  /**
   * Get detail imunisasi by ID
   */
  async getImunisasiById(id: number): Promise<Imunisasi> {
    const response = await apiClient.get(`${ENDPOINTS.IMUNISASI}/${id}`);
    return response.data || response;
  }

  /**
   * Create new imunisasi record
   */
  async createImunisasi(data: Partial<Imunisasi>): Promise<Imunisasi> {
    const response = await apiClient.post(ENDPOINTS.IMUNISASI, data);
    return response.data || response;
  }

  /**
   * Create batch imunisasi records (untuk kegiatan posyandu)
   */
  async createImunisasiBatch(data: { imunisasi: Partial<Imunisasi>[] }): Promise<Imunisasi[]> {
    const response = await apiClient.post(ENDPOINTS.IMUNISASI_BATCH, data);
    return response.data || response;
  }

  /**
   * Update imunisasi record
   */
  async updateImunisasi(id: number, data: Partial<Imunisasi>): Promise<Imunisasi> {
    const response = await apiClient.put(`${ENDPOINTS.IMUNISASI}/${id}`, data);
    return response.data || response;
  }

  /**
   * Delete imunisasi record
   */
  async deleteImunisasi(id: number): Promise<void> {
    await apiClient.delete(`${ENDPOINTS.IMUNISASI}/${id}`);
  }

  /**
   * Get imunisasi status for warga
   */
  async getImunisasiStatusWarga(wargaId: number): Promise<ImunisasiStatus> {
    const response = await apiClient.get(`${ENDPOINTS.IMUNISASI}/warga/${wargaId}/status`);
    return response.data || response;
  }

  /**
   * Get sasaran imunisasi (target children)
   */
  async getImunisasiSasaran(params: { jorong?: string; usia_max_bulan?: number } = {}): Promise<any[]> {
    const response = await apiClient.get(ENDPOINTS.IMUNISASI_SASARAN, params);
    return response.data || response;
  }

  /**
   * Get jadwal imunisasi (schedule by age)
   */
  async getJadwalImunisasi(): Promise<any> {
    const response = await apiClient.get(ENDPOINTS.IMUNISASI_JADWAL);
    return response.data || response;
  }

  /**
   * Get imunisasi statistics
   */
  async getImunisasiStatistics(params: { tahun?: number; jorong?: string } = {}): Promise<StatisticsResponse> {
    const response = await apiClient.get(ENDPOINTS.IMUNISASI_STATISTICS, params);
    return response.data || response;
  }

  // ==================
  // DASHBOARD & REPORTS
  // ==================

  /**
   * Get posyandu dashboard (KIA overview)
   */
  async getDashboard(params: { tahun?: number; bulan?: number; jorong?: string } = {}): Promise<any> {
    const response = await apiClient.get(ENDPOINTS.POSYANDU_DASHBOARD, params);
    return response.data || response;
  }

  /**
   * Get risk summary (high risk cases)
   */
  async getRiskSummary(params: { jorong?: string } = {}): Promise<any> {
    const response = await apiClient.get(ENDPOINTS.POSYANDU_RISK_SUMMARY, params);
    return response.data || response;
  }

  /**
   * Get ANC coverage report
   */
  async getAncCoverageReport(params: { tahun?: number; jorong?: string } = {}): Promise<any> {
    const response = await apiClient.get(ENDPOINTS.POSYANDU_ANC_COVERAGE, params);
    return response.data || response;
  }

  /**
   * Get imunisasi coverage report
   */
  async getImunisasiCoverageReport(params: { tahun?: number; jorong?: string } = {}): Promise<any> {
    const response = await apiClient.get(ENDPOINTS.POSYANDU_IMUNISASI_COVERAGE, params);
    return response.data || response;
  }

  /**
   * Get persalinan report
   */
  async getPersalinanReport(params: { tahun?: number; bulan?: number; jorong?: string } = {}): Promise<any> {
    const response = await apiClient.get(ENDPOINTS.POSYANDU_PERSALINAN_REPORT, params);
    return response.data || response;
  }

  /**
   * Export posyandu data
   */
  async exportData(params: { type: 'kehamilan' | 'persalinan' | 'imunisasi'; format?: 'xlsx' | 'pdf'; jorong?: string; tahun?: number }): Promise<Blob> {
    const url = ENDPOINTS.POSYANDU_EXPORT;
    return apiClient.downloadBlob(url, params);
  }

  // =====================
  // EXPORT FORMAT RESMI (Format 3 Posyandu)
  // =====================

  /**
   * Get available export formats
   */
  async getExportFormats(): Promise<any> {
    const response = await apiClient.get(ENDPOINTS.POSYANDU_EXPORT_FORMATS);
    return response.data || response;
  }

  /**
   * Get list of posyandu for filter
   */
  async getPosyanduList(): Promise<string[]> {
    const response = await apiClient.get(ENDPOINTS.POSYANDU_EXPORT_LIST);
    return response.data || [];
  }

  /**
   * Export Format 3 - Isian Data Kegiatan Posyandu to PDF
   * Format resmi pelaporan posyandu bulanan
   */
  async exportFormat3ToPdf(params: { tahun?: number; posyandu?: string } = {}): Promise<Blob> {
    return apiClient.downloadBlob(ENDPOINTS.POSYANDU_EXPORT_FORMAT3_PDF, params);
  }

  /**
   * Export Format 3 - Isian Data Kegiatan Posyandu to Excel
   * Format resmi pelaporan posyandu bulanan
   */
  async exportFormat3ToExcel(params: { tahun?: number; posyandu?: string } = {}): Promise<Blob> {
    return apiClient.downloadBlob(ENDPOINTS.POSYANDU_EXPORT_FORMAT3_EXCEL, params);
  }
}

// Export singleton instance
const posyanduService = new PosyanduService();
export default posyanduService;
