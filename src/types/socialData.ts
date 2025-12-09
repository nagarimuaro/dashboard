/**
 * Social Data Types
 * TypeScript interfaces untuk modul data sosial
 */

// API Response Types
export interface SocialDataConfigResponse {
  types: Record<string, { statusOptions: string[]; jenisOptions?: string[] }>;
  jorongs: string[];
}

export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface ApiResponse<T> {
  success?: boolean;
  data?: T;
  message?: string;
}

export interface GrowthHistoryResponse {
  success: boolean;
  data: GrowthHistoryItem[] | { data: GrowthHistoryItem[] };
}

export interface GrowthHistoryItem {
  id: number;
  tanggal_pengukuran: string;
  usia_bulan: number;
  berat_kg: number;
  tinggi_cm: number;
  lingkar_kepala_cm?: number;
  zscore_hfa?: number;
  zscore_wfa?: number;
  zscore_wfh?: number;
  status?: string;
}

export interface GrowthStatsResponse {
  success: boolean;
  data: {
    ringkasan?: {
      jumlah_pengukuran?: number;
    };
    height_growth?: number;
    weight_growth?: number;
    total_measurements?: number;
  };
}

// ==================== DATA KEMISKINAN ====================
export interface DataKemiskinan {
  id: number;
  tenant_id: number;
  warga_id?: number;
  keluarga_id?: number;
  nama: string;
  nik?: string;
  no_kk?: string;
  alamat?: string;
  jorong?: string;
  rt?: string;
  rw?: string;
  status: 'Sangat Miskin' | 'Miskin' | 'Rentan Miskin' | 'Hampir Miskin';
  penghasilan_bulanan?: number;
  jumlah_tanggungan: number;
  penerima_bpnt: boolean;
  penerima_pkh: boolean;
  penerima_blt: boolean;
  bantuan_lainnya?: string[];
  tahun_data: number;
  keterangan?: string;
  sumber_data: string;
  is_verified: boolean;
  verified_by?: number;
  verified_at?: string;
  created_at?: string;
  updated_at?: string;
}

// ==================== DATA STUNTING ====================
export interface DataStunting {
  id: number;
  tenant_id: number;
  warga_id?: number;
  ibu_id?: number;
  keluarga_id?: number;
  nama_anak: string;
  nik_anak?: string;
  tanggal_lahir?: string;
  jenis_kelamin: 'L' | 'P';
  usia_bulan?: number;
  nama_ibu?: string;
  nama_ayah?: string;
  alamat?: string;
  jorong?: string;
  rt?: string;
  rw?: string;
  tinggi_badan?: number;
  berat_badan?: number;
  lingkar_kepala?: number;
  z_score?: number;
  status: 'Normal' | 'Risiko Stunting' | 'Stunting Ringan' | 'Stunting Berat';
  status_gizi?: 'Gizi Buruk' | 'Gizi Kurang' | 'Gizi Baik' | 'Gizi Lebih' | 'Obesitas';
  dalam_intervensi: boolean;
  jenis_intervensi?: string;
  tanggal_intervensi?: string;
  tanggal_pengukuran: string;
  tahun_data: number;
  keterangan?: string;
  posyandu?: string;
  petugas_id?: number;
  created_at?: string;
  updated_at?: string;
}

// ==================== DATA KB ====================
export interface DataKB {
  id: number;
  tenant_id: number;
  warga_id?: number;
  keluarga_id?: number;
  nama: string;
  nik?: string;
  tanggal_lahir?: string;
  alamat?: string;
  jorong?: string;
  rt?: string;
  rw?: string;
  status: 'Aktif' | 'Drop Out' | 'Tidak Aktif' | 'Hamil';
  jenis_kb?: 'IUD' | 'Implant' | 'Suntik 1 Bulan' | 'Suntik 3 Bulan' | 'Pil' | 'Kondom' | 'MOW' | 'MOP' | 'Lainnya';
  tanggal_mulai_kb?: string;
  tanggal_berhenti_kb?: string;
  alasan_berhenti?: string;
  jumlah_anak: number;
  sedang_hamil: boolean;
  usia_kehamilan_minggu?: number;
  tahun_data: number;
  keterangan?: string;
  posyandu?: string;
  petugas_id?: number;
  created_at?: string;
  updated_at?: string;
}

// ==================== DATA DISABILITAS ====================
export interface DataDisabilitas {
  id: number;
  tenant_id: number;
  warga_id?: number;
  keluarga_id?: number;
  nama: string;
  nik?: string;
  tanggal_lahir?: string;
  jenis_kelamin: 'L' | 'P';
  alamat?: string;
  jorong?: string;
  rt?: string;
  rw?: string;
  jenis_disabilitas: 'Fisik' | 'Intelektual' | 'Mental' | 'Sensorik' | 'Ganda';
  deskripsi_disabilitas?: string;
  tingkat_kemandirian?: 'Mandiri' | 'Perlu Bantuan Sebagian' | 'Perlu Bantuan Penuh';
  penerima_bantuan: boolean;
  jenis_bantuan?: string[];
  memiliki_kartu_disabilitas: boolean;
  nomor_kartu_disabilitas?: string;
  pendidikan_terakhir?: string;
  sedang_sekolah: boolean;
  nama_sekolah?: string;
  bekerja: boolean;
  pekerjaan?: string;
  tahun_data: number;
  keterangan?: string;
  petugas_id?: number;
  created_at?: string;
  updated_at?: string;
}

// ==================== DATA RTLH ====================
export interface DataRTLH {
  id: number;
  tenant_id: number;
  warga_id?: number;
  keluarga_id?: number;
  nama_pemilik: string;
  nik?: string;
  no_kk?: string;
  alamat: string;
  jorong?: string;
  rt?: string;
  rw?: string;
  latitude?: number;
  longitude?: number;
  status: 'Sangat Tidak Layak' | 'Tidak Layak' | 'Kurang Layak' | 'Sudah Diperbaiki';
  kondisi_atap?: 'Baik' | 'Rusak Ringan' | 'Rusak Berat';
  kondisi_dinding?: 'Baik' | 'Rusak Ringan' | 'Rusak Berat';
  kondisi_lantai?: 'Baik' | 'Rusak Ringan' | 'Rusak Berat';
  luas_bangunan?: number;
  jumlah_penghuni: number;
  akses_air_bersih: boolean;
  akses_listrik: boolean;
  memiliki_jamban: boolean;
  jenis_jamban?: 'Sendiri' | 'Bersama' | 'Umum' | 'Tidak Ada';
  pernah_dapat_bantuan: boolean;
  tahun_bantuan?: number;
  sumber_bantuan?: string;
  nilai_bantuan?: number;
  sudah_diperbaiki: boolean;
  tanggal_perbaikan?: string;
  foto_rumah?: string[];
  tahun_data: number;
  keterangan?: string;
  petugas_id?: number;
  created_at?: string;
  updated_at?: string;
}

// ==================== DATA PUTUS SEKOLAH ====================
export interface DataPutusSekolah {
  id: number;
  tenant_id: number;
  warga_id?: number;
  keluarga_id?: number;
  nama: string;
  nik?: string;
  tanggal_lahir?: string;
  jenis_kelamin: 'L' | 'P';
  alamat?: string;
  jorong?: string;
  rt?: string;
  rw?: string;
  nama_ayah?: string;
  nama_ibu?: string;
  pekerjaan_ortu?: string;
  jenjang_terakhir: 'Tidak Sekolah' | 'SD' | 'SMP' | 'SMA';
  kelas_terakhir?: number;
  nama_sekolah_terakhir?: string;
  tanggal_putus_sekolah?: string;
  alasan?: 'Ekonomi' | 'Jarak Sekolah' | 'Tidak Minat' | 'Bekerja' | 'Menikah' | 'Hamil' | 'Sakit' | 'Lainnya';
  alasan_detail?: string;
  dalam_program_kejar: boolean;
  nama_program?: string;
  sudah_kembali_sekolah: boolean;
  tanggal_kembali_sekolah?: string;
  tahun_data: number;
  keterangan?: string;
  petugas_id?: number;
  created_at?: string;
  updated_at?: string;
}

// Union type untuk semua data sosial
export type DataSosial = DataKemiskinan | DataStunting | DataKB | DataDisabilitas | DataRTLH | DataPutusSekolah;

// Generic interface untuk backwards compatibility
export interface DataSosialGeneric {
  id: number;
  nama?: string;
  nama_anak?: string;
  nama_pemilik?: string;
  nik?: string;
  alamat?: string;
  jorong?: string;
  rt?: string;
  rw?: string;
  status: string;
  tahun_data: number;
  keterangan?: string;
  created_at?: string;
  updated_at?: string;
  [key: string]: string | number | boolean | string[] | undefined;
}

export interface PaginationMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface DataSosialPageProps {
  type: "kemiskinan" | "stunting" | "kb" | "disabilitas" | "rtlh" | "putus-sekolah";
  embedded?: boolean;
}

export interface StatisticsData {
  statusDistribution: { name: string; value: number; color: string }[];
  jorongDistribution: { name: string; value: number }[];
  yearTrend: { tahun: number; jumlah: number }[];
  statusByJorong: Record<string, any>[];
  total: number;
  criticalCount: number;
  criticalPercentage: string;
  criticalStatus: string;
}

// Detail field configuration per type
export interface DetailFieldConfig {
  key: string;
  label: string;
  type?: 'text' | 'date' | 'currency' | 'boolean' | 'badge' | 'array';
  format?: (value: any) => string;
}
