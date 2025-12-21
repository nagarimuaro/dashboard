import apiClient from './apiClient.js';

/**
 * Keuangan Nagari Service
 * API service for Village Financial Management (Permendagri 20/2018)
 */

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// =================== TAHUN ANGGARAN ===================

export const getTahunAnggaran = async (): Promise<ApiResponse> => {
  return apiClient.get('/keuangan/tahun-anggaran');
};

export const getTahunAnggaranAktif = async (): Promise<ApiResponse> => {
  return apiClient.get('/keuangan/tahun-anggaran/aktif');
};

export const getTahunAnggaranById = async (id: number): Promise<ApiResponse> => {
  return apiClient.get(`/keuangan/tahun-anggaran/${id}`);
};

export const createTahunAnggaran = async (data: any): Promise<ApiResponse> => {
  return apiClient.post('/keuangan/tahun-anggaran', data);
};

export const updateTahunAnggaran = async (id: number, data: any): Promise<ApiResponse> => {
  return apiClient.put(`/keuangan/tahun-anggaran/${id}`, data);
};

export const setTahunAnggaranAktif = async (id: number): Promise<ApiResponse> => {
  return apiClient.post(`/keuangan/tahun-anggaran/${id}/aktifkan`);
};

// =================== BIDANG ===================

export const getBidang = async (): Promise<ApiResponse> => {
  return apiClient.get('/keuangan/bidang');
};

export const getBidangById = async (id: number): Promise<ApiResponse> => {
  return apiClient.get(`/keuangan/bidang/${id}`);
};

export const createBidang = async (data: any): Promise<ApiResponse> => {
  return apiClient.post('/keuangan/bidang', data);
};

export const updateBidang = async (id: number, data: any): Promise<ApiResponse> => {
  return apiClient.put(`/keuangan/bidang/${id}`, data);
};

export const deleteBidang = async (id: number): Promise<ApiResponse> => {
  return apiClient.delete(`/keuangan/bidang/${id}`);
};

// =================== SUB BIDANG ===================

export const getSubBidang = async (bidangId: number | null = null): Promise<ApiResponse> => {
  const params = bidangId ? `?bidang_id=${bidangId}` : '';
  return apiClient.get(`/keuangan/sub-bidang${params}`);
};

export const getSubBidangById = async (id: number): Promise<ApiResponse> => {
  return apiClient.get(`/keuangan/sub-bidang/${id}`);
};

export const createSubBidang = async (data: any): Promise<ApiResponse> => {
  return apiClient.post('/keuangan/sub-bidang', data);
};

export const updateSubBidang = async (id: number, data: any): Promise<ApiResponse> => {
  return apiClient.put(`/keuangan/sub-bidang/${id}`, data);
};

export const deleteSubBidang = async (id: number): Promise<ApiResponse> => {
  return apiClient.delete(`/keuangan/sub-bidang/${id}`);
};

// =================== KEGIATAN ===================

export const getKegiatan = async (params: Record<string, any> = {}): Promise<ApiResponse> => {
  const queryString = new URLSearchParams(params).toString();
  return apiClient.get(`/keuangan/kegiatan${queryString ? `?${queryString}` : ''}`);
};

export const getKegiatanById = async (id: number): Promise<ApiResponse> => {
  return apiClient.get(`/keuangan/kegiatan/${id}`);
};

export const createKegiatan = async (data: any): Promise<ApiResponse> => {
  return apiClient.post('/keuangan/kegiatan', data);
};

export const updateKegiatan = async (id: number, data: any): Promise<ApiResponse> => {
  return apiClient.put(`/keuangan/kegiatan/${id}`, data);
};

export const deleteKegiatan = async (id: number): Promise<ApiResponse> => {
  return apiClient.delete(`/keuangan/kegiatan/${id}`);
};

// =================== AKUN BELANJA ===================

export const getAkunBelanja = async (jenis: string | null = null): Promise<ApiResponse> => {
  const params = jenis ? `?jenis=${jenis}` : '';
  return apiClient.get(`/keuangan/akun-belanja${params}`);
};

export const getAkunBelanjaById = async (id: number): Promise<ApiResponse> => {
  return apiClient.get(`/keuangan/akun-belanja/${id}`);
};

export const createAkunBelanja = async (data: any): Promise<ApiResponse> => {
  return apiClient.post('/keuangan/akun-belanja', data);
};

export const updateAkunBelanja = async (id: number, data: any): Promise<ApiResponse> => {
  return apiClient.put(`/keuangan/akun-belanja/${id}`, data);
};

export const deleteAkunBelanja = async (id: number): Promise<ApiResponse> => {
  return apiClient.delete(`/keuangan/akun-belanja/${id}`);
};

// =================== ANGGARAN PENDAPATAN ===================

export const getPendapatan = async (tahunAnggaranId: number | null = null): Promise<ApiResponse> => {
  const params = tahunAnggaranId ? `?tahun_anggaran_id=${tahunAnggaranId}` : '';
  return apiClient.get(`/keuangan/pendapatan${params}`);
};

export const getPendapatanById = async (id: number): Promise<ApiResponse> => {
  return apiClient.get(`/keuangan/pendapatan/${id}`);
};

export const createPendapatan = async (data: any): Promise<ApiResponse> => {
  return apiClient.post('/keuangan/pendapatan', data);
};

export const updatePendapatan = async (id: number, data: any): Promise<ApiResponse> => {
  return apiClient.put(`/keuangan/pendapatan/${id}`, data);
};

export const deletePendapatan = async (id: number): Promise<ApiResponse> => {
  return apiClient.delete(`/keuangan/pendapatan/${id}`);
};

// =================== ANGGARAN BELANJA ===================

export const getBelanja = async (params: Record<string, any> = {}): Promise<ApiResponse> => {
  const queryString = new URLSearchParams(params).toString();
  return apiClient.get(`/keuangan/belanja${queryString ? `?${queryString}` : ''}`);
};

export const getBelanjaById = async (id: number): Promise<ApiResponse> => {
  return apiClient.get(`/keuangan/belanja/${id}`);
};

export const createBelanja = async (data: any): Promise<ApiResponse> => {
  return apiClient.post('/keuangan/belanja', data);
};

export const updateBelanja = async (id: number, data: any): Promise<ApiResponse> => {
  return apiClient.put(`/keuangan/belanja/${id}`, data);
};

export const deleteBelanja = async (id: number): Promise<ApiResponse> => {
  return apiClient.delete(`/keuangan/belanja/${id}`);
};

// =================== ANGGARAN PEMBIAYAAN ===================

export const getPembiayaan = async (params: Record<string, any> = {}): Promise<ApiResponse> => {
  const queryString = new URLSearchParams(params).toString();
  return apiClient.get(`/keuangan/pembiayaan${queryString ? `?${queryString}` : ''}`);
};

export const getPembiayaanById = async (id: number): Promise<ApiResponse> => {
  return apiClient.get(`/keuangan/pembiayaan/${id}`);
};

export const createPembiayaan = async (data: any): Promise<ApiResponse> => {
  return apiClient.post('/keuangan/pembiayaan', data);
};

export const updatePembiayaan = async (id: number, data: any): Promise<ApiResponse> => {
  return apiClient.put(`/keuangan/pembiayaan/${id}`, data);
};

export const deletePembiayaan = async (id: number): Promise<ApiResponse> => {
  return apiClient.delete(`/keuangan/pembiayaan/${id}`);
};

// =================== APBNagari SUMMARY ===================

export const getAPBNagari = async (tahunAnggaranId: number | null = null): Promise<ApiResponse> => {
  const params = tahunAnggaranId ? `?tahun_anggaran_id=${tahunAnggaranId}` : '';
  return apiClient.get(`/keuangan/apbnagari${params}`);
};

// =================== TRANSAKSI ===================

export const getTransaksi = async (tahunAnggaranId: number, params: Record<string, any> = {}): Promise<ApiResponse> => {
  const queryString = new URLSearchParams(params).toString();
  return apiClient.get(`/keuangan/tahun-anggaran/${tahunAnggaranId}/transaksi${queryString ? `?${queryString}` : ''}`);
};

export const getTransaksiById = async (tahunAnggaranId: number, id: number): Promise<ApiResponse> => {
  return apiClient.get(`/keuangan/tahun-anggaran/${tahunAnggaranId}/transaksi/${id}`);
};

export const createTransaksi = async (tahunAnggaranId: number, data: any): Promise<ApiResponse> => {
  return apiClient.post(`/keuangan/tahun-anggaran/${tahunAnggaranId}/transaksi`, data);
};

export const updateTransaksi = async (tahunAnggaranId: number, id: number, data: any): Promise<ApiResponse> => {
  return apiClient.put(`/keuangan/tahun-anggaran/${tahunAnggaranId}/transaksi/${id}`, data);
};

export const deleteTransaksi = async (tahunAnggaranId: number, id: number): Promise<ApiResponse> => {
  return apiClient.delete(`/keuangan/tahun-anggaran/${tahunAnggaranId}/transaksi/${id}`);
};

export const verifyTransaksi = async (tahunAnggaranId: number, id: number): Promise<ApiResponse> => {
  return apiClient.post(`/keuangan/tahun-anggaran/${tahunAnggaranId}/transaksi/${id}/verify`);
};

export const postTransaksi = async (tahunAnggaranId: number, id: number): Promise<ApiResponse> => {
  return apiClient.post(`/keuangan/tahun-anggaran/${tahunAnggaranId}/transaksi/${id}/post`);
};

export const voidTransaksi = async (tahunAnggaranId: number, id: number, keterangan: string = ''): Promise<ApiResponse> => {
  return apiClient.post(`/keuangan/tahun-anggaran/${tahunAnggaranId}/transaksi/${id}/void`, { keterangan });
};

// =================== LAPORAN ===================

export const getLaporanAPBNagari = async (tahunAnggaranId: number): Promise<ApiResponse> => {
  return apiClient.get(`/keuangan/tahun-anggaran/${tahunAnggaranId}/laporan/apbnagari`);
};

export const getRealisasiPendapatan = async (tahunAnggaranId: number, bulan: number | null = null): Promise<ApiResponse> => {
  const params = bulan ? `?bulan=${bulan}` : '';
  return apiClient.get(`/keuangan/tahun-anggaran/${tahunAnggaranId}/laporan/realisasi-pendapatan${params}`);
};

export const getRealisasiBelanja = async (tahunAnggaranId: number, bulan: number | null = null): Promise<ApiResponse> => {
  const params = bulan ? `?bulan=${bulan}` : '';
  return apiClient.get(`/keuangan/tahun-anggaran/${tahunAnggaranId}/laporan/realisasi-belanja${params}`);
};

export const getRekapBidang = async (tahunAnggaranId: number): Promise<ApiResponse> => {
  return apiClient.get(`/keuangan/tahun-anggaran/${tahunAnggaranId}/laporan/rekap-bidang`);
};

export const getSILPA = async (tahunAnggaranId: number): Promise<ApiResponse> => {
  return apiClient.get(`/keuangan/tahun-anggaran/${tahunAnggaranId}/laporan/silpa`);
};

export const getBukuKasUmum = async (tahunAnggaranId: number, params: Record<string, any> = {}): Promise<ApiResponse> => {
  const queryString = new URLSearchParams(params).toString();
  return apiClient.get(`/keuangan/tahun-anggaran/${tahunAnggaranId}/laporan/bku${queryString ? `?${queryString}` : ''}`);
};

export const getBukuBank = async (tahunAnggaranId: number, params: Record<string, any> = {}): Promise<ApiResponse> => {
  const queryString = new URLSearchParams(params).toString();
  return apiClient.get(`/keuangan/tahun-anggaran/${tahunAnggaranId}/laporan/buku-bank${queryString ? `?${queryString}` : ''}`);
};

export const getBukuPajak = async (tahunAnggaranId: number, params: Record<string, any> = {}): Promise<ApiResponse> => {
  const queryString = new URLSearchParams(params).toString();
  return apiClient.get(`/keuangan/tahun-anggaran/${tahunAnggaranId}/laporan/buku-pajak${queryString ? `?${queryString}` : ''}`);
};

export const getBukuPanjar = async (tahunAnggaranId: number, params: Record<string, any> = {}): Promise<ApiResponse> => {
  const queryString = new URLSearchParams(params).toString();
  return apiClient.get(`/keuangan/tahun-anggaran/${tahunAnggaranId}/laporan/buku-panjar${queryString ? `?${queryString}` : ''}`);
};

// =================== ASET ===================

export const getAset = async (params: Record<string, any> = {}): Promise<ApiResponse> => {
  const queryString = new URLSearchParams(params).toString();
  return apiClient.get(`/keuangan/aset${queryString ? `?${queryString}` : ''}`);
};

export const getAsetById = async (id: number): Promise<ApiResponse> => {
  return apiClient.get(`/keuangan/aset/${id}`);
};

export const createAset = async (data: any): Promise<ApiResponse> => {
  return apiClient.post('/keuangan/aset', data);
};

export const updateAset = async (id: number, data: any): Promise<ApiResponse> => {
  return apiClient.put(`/keuangan/aset/${id}`, data);
};

export const deleteAset = async (id: number): Promise<ApiResponse> => {
  return apiClient.delete(`/keuangan/aset/${id}`);
};

export const getAsetSummary = async (): Promise<ApiResponse> => {
  return apiClient.get('/keuangan/aset/summary');
};

export const getAsetMutasi = async (asetId: number): Promise<ApiResponse> => {
  return apiClient.get(`/keuangan/aset/${asetId}/mutasi`);
};

export const createAsetMutasi = async (asetId: number, data: any): Promise<ApiResponse> => {
  return apiClient.post(`/keuangan/aset/${asetId}/mutasi`, data);
};

// Default export
export default {
  // Tahun Anggaran
  getTahunAnggaran,
  getTahunAnggaranAktif,
  getTahunAnggaranById,
  createTahunAnggaran,
  updateTahunAnggaran,
  setTahunAnggaranAktif,
  // Bidang
  getBidang,
  getBidangById,
  createBidang,
  updateBidang,
  deleteBidang,
  // Sub Bidang
  getSubBidang,
  getSubBidangById,
  createSubBidang,
  updateSubBidang,
  deleteSubBidang,
  // Kegiatan
  getKegiatan,
  getKegiatanById,
  createKegiatan,
  updateKegiatan,
  deleteKegiatan,
  // Akun Belanja
  getAkunBelanja,
  getAkunBelanjaById,
  createAkunBelanja,
  updateAkunBelanja,
  deleteAkunBelanja,
  // Pendapatan
  getPendapatan,
  getPendapatanById,
  createPendapatan,
  updatePendapatan,
  deletePendapatan,
  // Belanja
  getBelanja,
  getBelanjaById,
  createBelanja,
  updateBelanja,
  deleteBelanja,
  // Pembiayaan
  getPembiayaan,
  getPembiayaanById,
  createPembiayaan,
  updatePembiayaan,
  deletePembiayaan,
  // APBNagari
  getAPBNagari,
  // Transaksi
  getTransaksi,
  getTransaksiById,
  createTransaksi,
  updateTransaksi,
  deleteTransaksi,
  verifyTransaksi,
  postTransaksi,
  voidTransaksi,
  // Laporan
  getLaporanAPBNagari,
  getRealisasiPendapatan,
  getRealisasiBelanja,
  getRekapBidang,
  getSILPA,
  getBukuKasUmum,
  getBukuBank,
  getBukuPajak,
  getBukuPanjar,
  // Aset
  getAset,
  getAsetById,
  createAset,
  updateAset,
  deleteAset,
  getAsetSummary,
  getAsetMutasi,
  createAsetMutasi,
};
