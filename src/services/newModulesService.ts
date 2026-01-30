/**
 * New Modules Service
 * Service untuk modul-modul data sosial baru:
 * - Pola Asuh
 * - Infrastruktur
 * - Yatim Piatu
 * - Kunjungan Neonatal
 * - Lembaga Keagamaan
 * - Lembaga Pendidikan
 * - Ternak
 * - PBB
 * - Demografi
 */

import apiClient from './apiClient';

// API Endpoints untuk modul baru
const ENDPOINTS = {
  // Demografi
  DEMOGRAFI: '/demografi',
  DEMOGRAFI_BY_JORONG: '/demografi/by-jorong',
  
  // Data Sosial Baru
  POLA_ASUH: '/pola-asuh',
  INFRASTRUKTUR: '/infrastruktur',
  YATIM_PIATU: '/yatim-piatu',
  KUNJUNGAN_NEONATAL: '/kunjungan-neonatal',
  LEMBAGA_KEAGAMAAN: '/lembaga-keagamaan',
  LEMBAGA_PENDIDIKAN: '/lembaga-pendidikan',
  TERNAK: '/ternak',
  PBB: '/pbb',
};

// Types
export interface PaginatedResponse<T> {
  success: boolean;
  data: {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export interface StatisticsResponse<T> {
  success: boolean;
  data: T;
}

// =====================
// DEMOGRAFI
// =====================
export interface KategoriItem {
  label: string;
  count: number;
}

export interface DemografiData {
  total_penduduk: number;
  by_gender: {
    laki_laki: number;
    perempuan: number;
  };
  kategori_usia: Record<string, KategoriItem>;
  kategori_khusus: Record<string, KategoriItem>;
  filter: {
    jorong: string | null;
  };
}

export interface DemografiByJorong {
  jorong: string;
  total: number;
  laki_laki: number;
  perempuan: number;
  lansia: number;
  balita: number;
  usia_sekolah: number;
  usia_produktif: number;
  pus: number;
}

// =====================
// POLA ASUH
// =====================
export interface DataPolaAsuh {
  id: number;
  warga_id: number;
  keluarga_id?: number;
  nama_anak?: string;
  usia_bulan?: number;
  jorong?: string;
  asi_eksklusif: boolean;
  durasi_asi_bulan?: number;
  mpasi_sesuai_usia: boolean;
  jenis_mpasi?: string;
  frekuensi_makan?: number;
  variasi_makanan?: string;
  cuci_tangan_sebelum_makan: boolean;
  cuci_tangan_pakai_sabun: boolean;
  buang_air_besar_di_toilet: boolean;
  mandi_2x_sehari: boolean;
  imunisasi_lengkap: boolean;
  posyandu_rutin: boolean;
  stimulasi_anak?: string;
  pola_tidur_cukup: boolean;
  catatan?: string;
  tahun_data: number;
  is_verified: boolean;
  created_at?: string;
  warga?: any;
  keluarga?: any;
}

export interface PolaAsuhStatistics {
  total: number;
  asi_eksklusif: number;
  mpasi_sesuai: number;
  imunisasi_lengkap: number;
  posyandu_rutin: number;
  by_jorong: Array<{
    jorong: string;
    total: number;
    asi_eksklusif: number;
  }>;
}

// =====================
// INFRASTRUKTUR
// =====================
export interface DataInfrastruktur {
  id: number;
  keluarga_id: number;
  jorong?: string;
  jenis_rumah?: string;
  status_kepemilikan?: string;
  luas_bangunan_m2?: number;
  luas_tanah_m2?: number;
  jumlah_kamar?: number;
  material_dinding?: string;
  material_lantai?: string;
  material_atap?: string;
  kondisi_rumah?: string;
  akses_air_bersih: boolean;
  sumber_air?: string;
  akses_listrik: boolean;
  daya_listrik?: number;
  jamban_sehat: boolean;
  jenis_jamban?: string;
  pembuangan_limbah?: string;
  tempat_sampah: boolean;
  catatan?: string;
  tahun_data: number;
  is_verified: boolean;
  keluarga?: any;
}

export interface InfrastrukturStatistics {
  total: number;
  tanpa_air_bersih: number;
  tanpa_listrik: number;
  tanpa_sanitasi: number;
  by_jenis_rumah: Record<string, number>;
  by_kondisi: Record<string, number>;
  by_jorong: Array<{
    jorong: string;
    total: number;
    tanpa_air: number;
    tanpa_listrik: number;
    tanpa_sanitasi: number;
  }>;
}

// =====================
// YATIM PIATU
// =====================
export interface DataYatimPiatu {
  id: number;
  warga_id: number;
  keluarga_id?: number;
  nama_anak?: string;
  tanggal_lahir?: string;
  jenis_kelamin?: string;
  jorong?: string;
  status_yatim: 'yatim' | 'piatu' | 'yatim_piatu';
  tanggal_menjadi_yatim?: string;
  nama_ayah?: string;
  nama_ibu?: string;
  penyebab_meninggal_ayah?: string;
  penyebab_meninggal_ibu?: string;
  wali_id?: number;
  hubungan_wali?: string;
  status_pendidikan?: string;
  jenjang_pendidikan?: string;
  nama_sekolah?: string;
  penerima_bantuan: boolean;
  jenis_bantuan?: string[];
  catatan?: string;
  tahun_data: number;
  is_verified: boolean;
  warga?: any;
  keluarga?: any;
  wali?: any;
}

export interface YatimPiatuStatistics {
  total: number;
  yatim: number;
  piatu: number;
  yatim_piatu: number;
  penerima_bantuan: number;
  belum_bantuan: number;
  by_jorong: Array<{
    jorong: string;
    total: number;
    yatim: number;
    piatu: number;
    yatim_piatu: number;
  }>;
}

// =====================
// KUNJUNGAN NEONATAL
// =====================
export interface KunjunganNeonatal {
  id: number;
  persalinan_id: number;
  bayi_warga_id: number;
  jenis_kunjungan: 'KN1' | 'KN2' | 'KN3';
  tanggal_kunjungan: string;
  usia_hari?: number;
  berat_badan?: number;
  panjang_badan?: number;
  lingkar_kepala?: number;
  suhu?: number;
  kondisi_umum?: string;
  vitamin_k1: boolean;
  salep_mata: boolean;
  imunisasi_hb0: boolean;
  catatan?: string;
  is_verified: boolean;
  persalinan?: any;
  bayi?: any;
  petugas?: any;
}

export interface KunjunganNeonatalStatistics {
  tahun: number;
  bulan?: number;
  total_bayi_dikunjungi: number;
  kn1: number;
  kn2: number;
  kn3: number;
  kn_lengkap: number;
  persentase_kn1: number;
  persentase_kn_lengkap: number;
  per_bulan: Array<{
    bulan: number;
    kn1: number;
    kn2: number;
    kn3: number;
  }>;
}

// =====================
// LEMBAGA KEAGAMAAN
// =====================
export interface DataLembagaKeagamaan {
  id: number;
  jenis: string;
  nama: string;
  alamat?: string;
  jorong?: string;
  tahun_berdiri?: number;
  status_tanah?: string;
  kapasitas_jamaah?: number;
  jumlah_santri_laki?: number;
  jumlah_santri_perempuan?: number;
  jumlah_pengajar?: number;
  nama_pimpinan?: string;
  no_hp_pimpinan?: string;
  is_active: boolean;
  catatan?: string;
}

export interface LembagaKeagamaanStatistics {
  total: number;
  total_santri: number;
  total_pengajar: number;
  by_jenis: Array<{
    jenis: string;
    total: number;
    total_kapasitas_jamaah: number;
    total_santri: number;
  }>;
  by_jorong: Array<{
    jorong: string;
    total: number;
    masjid: number;
    mushola: number;
    tpq: number;
  }>;
}

// =====================
// LEMBAGA PENDIDIKAN
// =====================
export interface DataLembagaPendidikan {
  id: number;
  jenjang: string;
  status_sekolah: 'negeri' | 'swasta';
  npsn?: string;
  nama: string;
  alamat?: string;
  jorong?: string;
  akreditasi?: string;
  jumlah_siswa_laki?: number;
  jumlah_siswa_perempuan?: number;
  jumlah_guru_pns?: number;
  jumlah_guru_honorer?: number;
  nama_kepala_sekolah?: string;
  no_hp_kepala_sekolah?: string;
  is_active: boolean;
}

export interface LembagaPendidikanStatistics {
  total: number;
  total_siswa: number;
  total_guru: number;
  negeri: number;
  swasta: number;
  by_jenjang: Array<{
    jenjang: string;
    total: number;
    total_siswa: number;
    total_guru: number;
  }>;
  by_jorong: Array<{
    jorong: string;
    total: number;
    paud_tk: number;
    sd: number;
    smp: number;
    sma: number;
  }>;
  by_akreditasi: Array<{
    akreditasi: string;
    total: number;
  }>;
}

// =====================
// TERNAK
// =====================
export interface DataTernak {
  id: number;
  warga_id: number;
  keluarga_id?: number;
  jenis_ternak: string;
  jenis_detail?: string;
  jumlah_jantan: number;
  jumlah_betina: number;
  jumlah_anakan: number;
  tujuan_pemeliharaan?: string;
  jorong?: string;
  sistem_pemeliharaan?: string;
  kondisi_kandang?: string;
  vaksinasi_rutin: boolean;
  penerima_bantuan: boolean;
  sumber_bantuan?: string;
  catatan?: string;
  tahun_data: number;
  is_verified: boolean;
  warga?: any;
}

export interface TernakStatistics {
  tahun: number;
  jumlah_peternak: number;
  total_ternak_besar: number;
  total_ternak_kecil: number;
  total_unggas: number;
  total_populasi: number;
  peternak_dengan_bantuan: number;
  by_jenis: Array<{
    jenis_ternak: string;
    jumlah_peternak: number;
    total_populasi: number;
  }>;
  by_jorong: Array<{
    jorong: string;
    jumlah_peternak: number;
    total_populasi: number;
  }>;
}

// =====================
// PBB
// =====================
export interface DataPbb {
  id: number;
  warga_id?: number;
  keluarga_id?: number;
  nop: string;
  nama_wajib_pajak: string;
  alamat_objek_pajak?: string;
  jorong?: string;
  luas_tanah_m2?: number;
  luas_bangunan_m2?: number;
  njop_total?: number;
  tahun_pajak: number;
  pbb_terhutang?: number;
  tanggal_jatuh_tempo?: string;
  status_bayar: 'belum_bayar' | 'sudah_bayar' | 'sebagian' | 'piutang';
  jumlah_dibayar?: number;
  tanggal_bayar?: string;
  denda?: number;
  sudah_esppt: boolean;
  warga?: any;
}

export interface PbbStatistics {
  tahun: number;
  total_objek: number;
  total_terhutang: number;
  total_denda: number;
  total_tagihan: number;
  total_dibayar: number;
  piutang: number;
  persentase_pembayaran: number;
  lunas: number;
  belum_bayar: number;
  piutang_count: number;
  jatuh_tempo: number;
  belum_esppt: number;
  by_jorong: Array<{
    jorong: string;
    total_objek: number;
    total_terhutang: number;
    total_dibayar: number;
    lunas: number;
    belum_bayar: number;
  }>;
  per_bulan: Array<{
    bulan: number;
    jumlah_transaksi: number;
    total_pembayaran: number;
  }>;
}

/**
 * New Modules Service Class
 */
class NewModulesService {
  // =====================
  // DEMOGRAFI
  // =====================
  async getDemografi(): Promise<DemografiData> {
    const response = await apiClient.get(ENDPOINTS.DEMOGRAFI);
    return response.data;
  }

  async getDemografiByJorong(): Promise<DemografiByJorong[]> {
    const response = await apiClient.get(ENDPOINTS.DEMOGRAFI_BY_JORONG);
    return response.data;
  }

  // =====================
  // POLA ASUH
  // =====================
  async getPolaAsuh(params: Record<string, any> = {}): Promise<PaginatedResponse<DataPolaAsuh>> {
    const response = await apiClient.get(ENDPOINTS.POLA_ASUH, params);
    return response;
  }

  async getPolaAsuhById(id: number): Promise<DataPolaAsuh> {
    const response = await apiClient.get(`${ENDPOINTS.POLA_ASUH}/${id}`);
    return response.data;
  }

  async createPolaAsuh(data: Partial<DataPolaAsuh>): Promise<DataPolaAsuh> {
    const response = await apiClient.post(ENDPOINTS.POLA_ASUH, data);
    return response.data;
  }

  async updatePolaAsuh(id: number, data: Partial<DataPolaAsuh>): Promise<DataPolaAsuh> {
    const response = await apiClient.put(`${ENDPOINTS.POLA_ASUH}/${id}`, data);
    return response.data;
  }

  async deletePolaAsuh(id: number): Promise<void> {
    await apiClient.delete(`${ENDPOINTS.POLA_ASUH}/${id}`);
  }

  async getPolaAsuhStatistics(params: Record<string, any> = {}): Promise<PolaAsuhStatistics> {
    const response = await apiClient.get(`${ENDPOINTS.POLA_ASUH}/statistics`, params);
    return response.data;
  }

  // =====================
  // INFRASTRUKTUR
  // =====================
  async getInfrastruktur(params: Record<string, any> = {}): Promise<PaginatedResponse<DataInfrastruktur>> {
    const response = await apiClient.get(ENDPOINTS.INFRASTRUKTUR, params);
    return response;
  }

  async getInfrastrukturById(id: number): Promise<DataInfrastruktur> {
    const response = await apiClient.get(`${ENDPOINTS.INFRASTRUKTUR}/${id}`);
    return response.data;
  }

  async createInfrastruktur(data: Partial<DataInfrastruktur>): Promise<DataInfrastruktur> {
    const response = await apiClient.post(ENDPOINTS.INFRASTRUKTUR, data);
    return response.data;
  }

  async updateInfrastruktur(id: number, data: Partial<DataInfrastruktur>): Promise<DataInfrastruktur> {
    const response = await apiClient.put(`${ENDPOINTS.INFRASTRUKTUR}/${id}`, data);
    return response.data;
  }

  async deleteInfrastruktur(id: number): Promise<void> {
    await apiClient.delete(`${ENDPOINTS.INFRASTRUKTUR}/${id}`);
  }

  async getInfrastrukturStatistics(params: Record<string, any> = {}): Promise<InfrastrukturStatistics> {
    const response = await apiClient.get(`${ENDPOINTS.INFRASTRUKTUR}/statistics`, params);
    return response.data;
  }

  // =====================
  // YATIM PIATU
  // =====================
  async getYatimPiatu(params: Record<string, any> = {}): Promise<PaginatedResponse<DataYatimPiatu>> {
    const response = await apiClient.get(ENDPOINTS.YATIM_PIATU, params);
    return response;
  }

  async getYatimPiatuById(id: number): Promise<DataYatimPiatu> {
    const response = await apiClient.get(`${ENDPOINTS.YATIM_PIATU}/${id}`);
    return response.data;
  }

  async createYatimPiatu(data: Partial<DataYatimPiatu>): Promise<DataYatimPiatu> {
    const response = await apiClient.post(ENDPOINTS.YATIM_PIATU, data);
    return response.data;
  }

  async updateYatimPiatu(id: number, data: Partial<DataYatimPiatu>): Promise<DataYatimPiatu> {
    const response = await apiClient.put(`${ENDPOINTS.YATIM_PIATU}/${id}`, data);
    return response.data;
  }

  async deleteYatimPiatu(id: number): Promise<void> {
    await apiClient.delete(`${ENDPOINTS.YATIM_PIATU}/${id}`);
  }

  async getYatimPiatuStatistics(params: Record<string, any> = {}): Promise<YatimPiatuStatistics> {
    const response = await apiClient.get(`${ENDPOINTS.YATIM_PIATU}/statistics`, params);
    return response.data;
  }

  // =====================
  // KUNJUNGAN NEONATAL
  // =====================
  async getKunjunganNeonatal(params: Record<string, any> = {}): Promise<PaginatedResponse<KunjunganNeonatal>> {
    const response = await apiClient.get(ENDPOINTS.KUNJUNGAN_NEONATAL, params);
    return response;
  }

  async getKunjunganNeonatalById(id: number): Promise<KunjunganNeonatal> {
    const response = await apiClient.get(`${ENDPOINTS.KUNJUNGAN_NEONATAL}/${id}`);
    return response.data;
  }

  async createKunjunganNeonatal(data: Partial<KunjunganNeonatal>): Promise<KunjunganNeonatal> {
    const response = await apiClient.post(ENDPOINTS.KUNJUNGAN_NEONATAL, data);
    return response.data;
  }

  async updateKunjunganNeonatal(id: number, data: Partial<KunjunganNeonatal>): Promise<KunjunganNeonatal> {
    const response = await apiClient.put(`${ENDPOINTS.KUNJUNGAN_NEONATAL}/${id}`, data);
    return response.data;
  }

  async deleteKunjunganNeonatal(id: number): Promise<void> {
    await apiClient.delete(`${ENDPOINTS.KUNJUNGAN_NEONATAL}/${id}`);
  }

  async getKunjunganNeonatalStatistics(params: Record<string, any> = {}): Promise<KunjunganNeonatalStatistics> {
    const response = await apiClient.get(`${ENDPOINTS.KUNJUNGAN_NEONATAL}/statistics`, params);
    return response.data;
  }

  // =====================
  // LEMBAGA KEAGAMAAN
  // =====================
  async getLembagaKeagamaan(params: Record<string, any> = {}): Promise<PaginatedResponse<DataLembagaKeagamaan>> {
    const response = await apiClient.get(ENDPOINTS.LEMBAGA_KEAGAMAAN, params);
    return response;
  }

  async getLembagaKeagamaanById(id: number): Promise<DataLembagaKeagamaan> {
    const response = await apiClient.get(`${ENDPOINTS.LEMBAGA_KEAGAMAAN}/${id}`);
    return response.data;
  }

  async createLembagaKeagamaan(data: Partial<DataLembagaKeagamaan>): Promise<DataLembagaKeagamaan> {
    const response = await apiClient.post(ENDPOINTS.LEMBAGA_KEAGAMAAN, data);
    return response.data;
  }

  async updateLembagaKeagamaan(id: number, data: Partial<DataLembagaKeagamaan>): Promise<DataLembagaKeagamaan> {
    const response = await apiClient.put(`${ENDPOINTS.LEMBAGA_KEAGAMAAN}/${id}`, data);
    return response.data;
  }

  async deleteLembagaKeagamaan(id: number): Promise<void> {
    await apiClient.delete(`${ENDPOINTS.LEMBAGA_KEAGAMAAN}/${id}`);
  }

  async getLembagaKeagamaanStatistics(params: Record<string, any> = {}): Promise<LembagaKeagamaanStatistics> {
    const response = await apiClient.get(`${ENDPOINTS.LEMBAGA_KEAGAMAAN}/statistics`, params);
    return response.data;
  }

  // =====================
  // LEMBAGA PENDIDIKAN
  // =====================
  async getLembagaPendidikan(params: Record<string, any> = {}): Promise<PaginatedResponse<DataLembagaPendidikan>> {
    const response = await apiClient.get(ENDPOINTS.LEMBAGA_PENDIDIKAN, params);
    return response;
  }

  async getLembagaPendidikanById(id: number): Promise<DataLembagaPendidikan> {
    const response = await apiClient.get(`${ENDPOINTS.LEMBAGA_PENDIDIKAN}/${id}`);
    return response.data;
  }

  async createLembagaPendidikan(data: Partial<DataLembagaPendidikan>): Promise<DataLembagaPendidikan> {
    const response = await apiClient.post(ENDPOINTS.LEMBAGA_PENDIDIKAN, data);
    return response.data;
  }

  async updateLembagaPendidikan(id: number, data: Partial<DataLembagaPendidikan>): Promise<DataLembagaPendidikan> {
    const response = await apiClient.put(`${ENDPOINTS.LEMBAGA_PENDIDIKAN}/${id}`, data);
    return response.data;
  }

  async deleteLembagaPendidikan(id: number): Promise<void> {
    await apiClient.delete(`${ENDPOINTS.LEMBAGA_PENDIDIKAN}/${id}`);
  }

  async getLembagaPendidikanStatistics(params: Record<string, any> = {}): Promise<LembagaPendidikanStatistics> {
    const response = await apiClient.get(`${ENDPOINTS.LEMBAGA_PENDIDIKAN}/statistics`, params);
    return response.data;
  }

  // =====================
  // TERNAK
  // =====================
  async getTernak(params: Record<string, any> = {}): Promise<PaginatedResponse<DataTernak>> {
    const response = await apiClient.get(ENDPOINTS.TERNAK, params);
    return response;
  }

  async getTernakById(id: number): Promise<DataTernak> {
    const response = await apiClient.get(`${ENDPOINTS.TERNAK}/${id}`);
    return response.data;
  }

  async createTernak(data: Partial<DataTernak>): Promise<DataTernak> {
    const response = await apiClient.post(ENDPOINTS.TERNAK, data);
    return response.data;
  }

  async updateTernak(id: number, data: Partial<DataTernak>): Promise<DataTernak> {
    const response = await apiClient.put(`${ENDPOINTS.TERNAK}/${id}`, data);
    return response.data;
  }

  async deleteTernak(id: number): Promise<void> {
    await apiClient.delete(`${ENDPOINTS.TERNAK}/${id}`);
  }

  async getTernakStatistics(params: Record<string, any> = {}): Promise<TernakStatistics> {
    const response = await apiClient.get(`${ENDPOINTS.TERNAK}/statistics`, params);
    return response.data;
  }

  // =====================
  // PBB
  // =====================
  async getPbb(params: Record<string, any> = {}): Promise<PaginatedResponse<DataPbb>> {
    const response = await apiClient.get(ENDPOINTS.PBB, params);
    return response;
  }

  async getPbbById(id: number): Promise<DataPbb> {
    const response = await apiClient.get(`${ENDPOINTS.PBB}/${id}`);
    return response.data;
  }

  async createPbb(data: Partial<DataPbb>): Promise<DataPbb> {
    const response = await apiClient.post(ENDPOINTS.PBB, data);
    return response.data;
  }

  async updatePbb(id: number, data: Partial<DataPbb>): Promise<DataPbb> {
    const response = await apiClient.put(`${ENDPOINTS.PBB}/${id}`, data);
    return response.data;
  }

  async deletePbb(id: number): Promise<void> {
    await apiClient.delete(`${ENDPOINTS.PBB}/${id}`);
  }

  async getPbbStatistics(params: Record<string, any> = {}): Promise<PbbStatistics> {
    const response = await apiClient.get(`${ENDPOINTS.PBB}/statistics`, params);
    return response.data;
  }

  async getPbbPiutang(params: Record<string, any> = {}): Promise<PaginatedResponse<DataPbb>> {
    const response = await apiClient.get(`${ENDPOINTS.PBB}/piutang`, params);
    return response;
  }

  async getPbbJatuhTempo(params: Record<string, any> = {}): Promise<PaginatedResponse<DataPbb>> {
    const response = await apiClient.get(`${ENDPOINTS.PBB}/jatuh-tempo`, params);
    return response;
  }
}

// Export singleton instance
const newModulesService = new NewModulesService();
export default newModulesService;

// Named exports
export { newModulesService, ENDPOINTS as NEW_MODULES_ENDPOINTS };
