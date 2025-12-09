/**
 * Social Data Constants
 * Konstanta untuk modul data sosial
 */

// Status colors for charts
export const STATUS_COLORS: Record<string, string> = {
  // Kemiskinan
  "Sangat Miskin": "#dc2626",
  "Miskin": "#f97316",
  "Rentan Miskin": "#eab308",
  "Hampir Miskin": "#84cc16",
  // Stunting
  "Stunting Berat": "#dc2626",
  "Stunting Ringan": "#f97316",
  "Risiko Stunting": "#eab308",
  "Normal": "#22c55e",
  "Dalam Pemantauan": "#3b82f6",
  // KB
  "Aktif": "#22c55e",
  "Drop Out": "#f97316",
  "Tidak Aktif": "#dc2626",
  "Hamil": "#8b5cf6",
  // Disabilitas
  "Fisik": "#3b82f6",
  "Intelektual": "#8b5cf6",
  "Mental": "#f97316",
  "Sensorik": "#06b6d4",
  "Ganda": "#dc2626",
  // RTLH
  "Sangat Tidak Layak": "#dc2626",
  "Tidak Layak": "#f97316",
  "Kurang Layak": "#eab308",
  "Sudah Diperbaiki": "#22c55e",
  // Putus Sekolah
  "SD": "#3b82f6",
  "SMP": "#8b5cf6",
  "SMA": "#f97316",
  "Tidak Sekolah": "#dc2626",
};

export const CHART_COLORS = ["#3b82f6", "#22c55e", "#f97316", "#dc2626", "#8b5cf6", "#06b6d4", "#eab308", "#84cc16"];

// Type configuration untuk setiap jenis data sosial
export const typeConfig = {
  kemiskinan: {
    title: "Data Kemiskinan",
    statusOptions: ["Sangat Miskin", "Miskin", "Rentan Miskin", "Hampir Miskin"],
    fields: ["nama", "nik", "alamat", "jorong", "rt", "rw", "status", "tahun_data", "keterangan"],
  },
  stunting: {
    title: "Data Stunting",
    statusOptions: ["Stunting Berat", "Stunting Ringan", "Normal", "Dalam Pemantauan"],
    fields: ["nama_anak", "nik_anak", "nama_ortu", "alamat", "jorong", "rt", "rw", "status", "usia", "tahun_data", "keterangan"],
  },
  kb: {
    title: "Data KB",
    statusOptions: ["Aktif", "Drop Out", "Tidak Aktif", "Hamil"],
    fields: ["nama", "nik", "alamat", "jorong", "rt", "rw", "status", "jenis_kb", "tahun_data", "keterangan"],
  },
  disabilitas: {
    title: "Data Disabilitas",
    statusOptions: ["Fisik", "Intelektual", "Mental", "Sensorik", "Ganda"],
    fields: ["nama", "nik", "alamat", "jorong", "rt", "rw", "status", "jenis_disabilitas", "tahun_data", "keterangan"],
  },
  rtlh: {
    title: "Data Rumah Tidak Layak Huni",
    statusOptions: ["Sangat Tidak Layak", "Tidak Layak", "Kurang Layak", "Sudah Diperbaiki"],
    fields: ["nama_pemilik", "nik", "alamat", "jorong", "rt", "rw", "status", "kondisi", "tahun_data", "keterangan"],
  },
  "putus-sekolah": {
    title: "Data Putus Sekolah",
    statusOptions: ["SD", "SMP", "SMA", "Tidak Sekolah"],
    fields: ["nama", "nik", "alamat", "jorong", "rt", "rw", "status", "jenjang_terakhir", "alasan", "tahun_data", "keterangan"],
  },
};

// Default lists
export const defaultJorongList = ["Jorong I", "Jorong II", "Jorong III", "Jorong IV", "Jorong V"];
export const rtList = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10"];
export const rwList = ["01", "02", "03", "04", "05"];
export const tahunList = [2025, 2024, 2023, 2022, 2021, 2020];

// Column definitions for table visibility toggle
export const tableColumns = [
  { id: "no", label: "No", default: true },
  { id: "nama", label: "Nama", default: true },
  { id: "nik", label: "NIK", default: true },
  { id: "alamat", label: "Alamat", default: true },
  { id: "jorong", label: "Jorong", default: true },
  { id: "rt_rw", label: "RT/RW", default: true },
  { id: "status", label: "Status", default: true },
  { id: "tahun", label: "Tahun", default: true },
  { id: "keterangan", label: "Keterangan", default: false },
  { id: "aksi", label: "Aksi", default: true },
];

// Column definitions per data type (for table rendering)
export const typeColumns: Record<string, { key: string; label: string }[]> = {
  kemiskinan: [
    { key: "nama", label: "Nama" },
    { key: "nik", label: "NIK" },
    { key: "alamat", label: "Alamat" },
    { key: "jorong", label: "Jorong" },
    { key: "status", label: "Status" },
    { key: "tahun_data", label: "Tahun" },
  ],
  stunting: [
    { key: "nama", label: "Nama Anak" },
    { key: "jenis_kelamin", label: "JK" },
    { key: "usia", label: "Usia" },
    { key: "tinggi_badan", label: "TB" },
    { key: "berat_badan", label: "BB" },
    { key: "jorong", label: "Jorong" },
    { key: "status", label: "Status" },
  ],
  kb: [
    { key: "nama", label: "Nama" },
    { key: "nik", label: "NIK" },
    { key: "jorong", label: "Jorong" },
    { key: "jenis_kb", label: "Jenis KB" },
    { key: "status", label: "Status" },
    { key: "tahun_data", label: "Tahun" },
  ],
  disabilitas: [
    { key: "nama", label: "Nama" },
    { key: "nik", label: "NIK" },
    { key: "jorong", label: "Jorong" },
    { key: "jenis_disabilitas", label: "Jenis" },
    { key: "status", label: "Status" },
    { key: "tahun_data", label: "Tahun" },
  ],
  rtlh: [
    { key: "nama_pemilik", label: "Nama Pemilik" },
    { key: "nik", label: "NIK" },
    { key: "alamat", label: "Alamat" },
    { key: "jorong", label: "Jorong" },
    { key: "kondisi", label: "Kondisi" },
    { key: "status", label: "Status" },
  ],
  "putus-sekolah": [
    { key: "nama", label: "Nama" },
    { key: "nik", label: "NIK" },
    { key: "jorong", label: "Jorong" },
    { key: "jenjang_terakhir", label: "Jenjang" },
    { key: "alasan", label: "Alasan" },
    { key: "status", label: "Status" },
  ],
};

// Get status badge color
export const getStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    // Kemiskinan
    "Sangat Miskin": "bg-red-500",
    "Miskin": "bg-orange-500",
    "Rentan Miskin": "bg-yellow-500",
    "Hampir Miskin": "bg-blue-500",
    // Stunting
    "Stunting Berat": "bg-red-500",
    "Stunting Ringan": "bg-orange-500",
    "Normal": "bg-green-500",
    "Dalam Pemantauan": "bg-blue-500",
    // KB
    "Aktif": "bg-green-500",
    "Drop Out": "bg-red-500",
    "Tidak Aktif": "bg-gray-500",
    "Hamil": "bg-purple-500",
    // Disabilitas
    "Fisik": "bg-blue-500",
    "Intelektual": "bg-purple-500",
    "Mental": "bg-orange-500",
    "Sensorik": "bg-teal-500",
    "Ganda": "bg-red-500",
    // RTLH
    "Sangat Tidak Layak": "bg-red-500",
    "Tidak Layak": "bg-orange-500",
    "Kurang Layak": "bg-yellow-500",
    "Sudah Diperbaiki": "bg-green-500",
    // Putus Sekolah
    "SD": "bg-blue-500",
    "SMP": "bg-purple-500",
    "SMA": "bg-orange-500",
    "Tidak Sekolah": "bg-red-500",
    // Kondisi
    "Baik": "bg-green-500",
    "Rusak Ringan": "bg-yellow-500",
    "Rusak Berat": "bg-red-500",
    // Gizi
    "Gizi Buruk": "bg-red-500",
    "Gizi Kurang": "bg-orange-500",
    "Gizi Baik": "bg-green-500",
    "Gizi Lebih": "bg-yellow-500",
    "Obesitas": "bg-purple-500",
    // Kemandirian
    "Mandiri": "bg-green-500",
    "Perlu Bantuan Sebagian": "bg-yellow-500",
    "Perlu Bantuan Penuh": "bg-red-500",
  };
  return colors[status] || "bg-gray-500";
};

// Detail fields configuration for each type - ALL DATABASE FIELDS
export interface DetailFieldConfig {
  key: string;
  label: string;
  type?: 'text' | 'date' | 'currency' | 'boolean' | 'badge' | 'array' | 'number';
  section?: string;
}

export const detailFieldsConfig: Record<string, DetailFieldConfig[]> = {
  kemiskinan: [
    // Data Utama
    { key: "nama", label: "Nama Lengkap", section: "Data Utama" },
    { key: "nik", label: "NIK", section: "Data Utama" },
    { key: "no_kk", label: "No. Kartu Keluarga", section: "Data Utama" },
    { key: "alamat", label: "Alamat", section: "Data Utama" },
    { key: "jorong", label: "Jorong", section: "Data Utama" },
    { key: "rt", label: "RT", section: "Data Utama" },
    { key: "rw", label: "RW", section: "Data Utama" },
    // Status Kemiskinan
    { key: "status", label: "Status Kemiskinan", type: "badge", section: "Status Kemiskinan" },
    { key: "penghasilan_bulanan", label: "Penghasilan Bulanan", type: "currency", section: "Status Kemiskinan" },
    { key: "jumlah_tanggungan", label: "Jumlah Tanggungan", type: "number", section: "Status Kemiskinan" },
    // Bantuan
    { key: "penerima_bpnt", label: "Penerima BPNT", type: "boolean", section: "Bantuan yang Diterima" },
    { key: "penerima_pkh", label: "Penerima PKH", type: "boolean", section: "Bantuan yang Diterima" },
    { key: "penerima_blt", label: "Penerima BLT", type: "boolean", section: "Bantuan yang Diterima" },
    { key: "bantuan_lainnya", label: "Bantuan Lainnya", type: "array", section: "Bantuan yang Diterima" },
    // Metadata
    { key: "tahun_data", label: "Tahun Data", section: "Metadata" },
    { key: "keterangan", label: "Keterangan", section: "Metadata" },
    { key: "sumber_data", label: "Sumber Data", section: "Metadata" },
    { key: "is_verified", label: "Terverifikasi", type: "boolean", section: "Metadata" },
    { key: "verified_at", label: "Tanggal Verifikasi", type: "date", section: "Metadata" },
  ],
  stunting: [
    // Data Anak
    { key: "nama_anak", label: "Nama Anak", section: "Data Anak" },
    { key: "nik_anak", label: "NIK Anak", section: "Data Anak" },
    { key: "tanggal_lahir", label: "Tanggal Lahir", type: "date", section: "Data Anak" },
    { key: "jenis_kelamin", label: "Jenis Kelamin", section: "Data Anak" },
    { key: "usia_bulan", label: "Usia (Bulan)", type: "number", section: "Data Anak" },
    // Data Orang Tua
    { key: "nama_ibu", label: "Nama Ibu", section: "Data Orang Tua" },
    { key: "nama_ayah", label: "Nama Ayah", section: "Data Orang Tua" },
    { key: "alamat", label: "Alamat", section: "Data Orang Tua" },
    { key: "jorong", label: "Jorong", section: "Data Orang Tua" },
    { key: "rt", label: "RT", section: "Data Orang Tua" },
    { key: "rw", label: "RW", section: "Data Orang Tua" },
    // Data Pengukuran
    { key: "tinggi_badan", label: "Tinggi Badan (cm)", type: "number", section: "Data Pengukuran" },
    { key: "berat_badan", label: "Berat Badan (kg)", type: "number", section: "Data Pengukuran" },
    { key: "lingkar_kepala", label: "Lingkar Kepala (cm)", type: "number", section: "Data Pengukuran" },
    { key: "z_score", label: "Z-Score", type: "number", section: "Data Pengukuran" },
    { key: "tanggal_pengukuran", label: "Tanggal Pengukuran", type: "date", section: "Data Pengukuran" },
    // Status
    { key: "status", label: "Status Stunting", type: "badge", section: "Status" },
    { key: "status_gizi", label: "Status Gizi", type: "badge", section: "Status" },
    // Intervensi
    { key: "dalam_intervensi", label: "Dalam Intervensi", type: "boolean", section: "Intervensi" },
    { key: "jenis_intervensi", label: "Jenis Intervensi", section: "Intervensi" },
    { key: "tanggal_intervensi", label: "Tanggal Intervensi", type: "date", section: "Intervensi" },
    // Metadata
    { key: "tahun_data", label: "Tahun Data", section: "Metadata" },
    { key: "posyandu", label: "Posyandu", section: "Metadata" },
    { key: "keterangan", label: "Keterangan", section: "Metadata" },
  ],
  kb: [
    // Data Peserta
    { key: "nama", label: "Nama Lengkap", section: "Data Peserta" },
    { key: "nik", label: "NIK", section: "Data Peserta" },
    { key: "tanggal_lahir", label: "Tanggal Lahir", type: "date", section: "Data Peserta" },
    { key: "alamat", label: "Alamat", section: "Data Peserta" },
    { key: "jorong", label: "Jorong", section: "Data Peserta" },
    { key: "rt", label: "RT", section: "Data Peserta" },
    { key: "rw", label: "RW", section: "Data Peserta" },
    // Data KB
    { key: "status", label: "Status KB", type: "badge", section: "Data KB" },
    { key: "jenis_kb", label: "Jenis KB", section: "Data KB" },
    { key: "tanggal_mulai_kb", label: "Tanggal Mulai KB", type: "date", section: "Data KB" },
    { key: "tanggal_berhenti_kb", label: "Tanggal Berhenti KB", type: "date", section: "Data KB" },
    { key: "alasan_berhenti", label: "Alasan Berhenti", section: "Data KB" },
    // Data Kehamilan
    { key: "jumlah_anak", label: "Jumlah Anak", type: "number", section: "Data Kehamilan" },
    { key: "sedang_hamil", label: "Sedang Hamil", type: "boolean", section: "Data Kehamilan" },
    { key: "usia_kehamilan_minggu", label: "Usia Kehamilan (Minggu)", type: "number", section: "Data Kehamilan" },
    // Metadata
    { key: "tahun_data", label: "Tahun Data", section: "Metadata" },
    { key: "posyandu", label: "Posyandu", section: "Metadata" },
    { key: "keterangan", label: "Keterangan", section: "Metadata" },
  ],
  disabilitas: [
    // Data Penyandang
    { key: "nama", label: "Nama Lengkap", section: "Data Penyandang" },
    { key: "nik", label: "NIK", section: "Data Penyandang" },
    { key: "tanggal_lahir", label: "Tanggal Lahir", type: "date", section: "Data Penyandang" },
    { key: "jenis_kelamin", label: "Jenis Kelamin", section: "Data Penyandang" },
    { key: "alamat", label: "Alamat", section: "Data Penyandang" },
    { key: "jorong", label: "Jorong", section: "Data Penyandang" },
    { key: "rt", label: "RT", section: "Data Penyandang" },
    { key: "rw", label: "RW", section: "Data Penyandang" },
    // Jenis Disabilitas
    { key: "jenis_disabilitas", label: "Jenis Disabilitas", type: "badge", section: "Jenis Disabilitas" },
    { key: "deskripsi_disabilitas", label: "Deskripsi Disabilitas", section: "Jenis Disabilitas" },
    { key: "tingkat_kemandirian", label: "Tingkat Kemandirian", type: "badge", section: "Jenis Disabilitas" },
    // Bantuan
    { key: "penerima_bantuan", label: "Penerima Bantuan", type: "boolean", section: "Bantuan" },
    { key: "jenis_bantuan", label: "Jenis Bantuan", type: "array", section: "Bantuan" },
    { key: "memiliki_kartu_disabilitas", label: "Memiliki Kartu Disabilitas", type: "boolean", section: "Bantuan" },
    { key: "nomor_kartu_disabilitas", label: "Nomor Kartu Disabilitas", section: "Bantuan" },
    // Pendidikan & Pekerjaan
    { key: "pendidikan_terakhir", label: "Pendidikan Terakhir", section: "Pendidikan & Pekerjaan" },
    { key: "sedang_sekolah", label: "Sedang Sekolah", type: "boolean", section: "Pendidikan & Pekerjaan" },
    { key: "nama_sekolah", label: "Nama Sekolah", section: "Pendidikan & Pekerjaan" },
    { key: "bekerja", label: "Bekerja", type: "boolean", section: "Pendidikan & Pekerjaan" },
    { key: "pekerjaan", label: "Pekerjaan", section: "Pendidikan & Pekerjaan" },
    // Metadata
    { key: "tahun_data", label: "Tahun Data", section: "Metadata" },
    { key: "keterangan", label: "Keterangan", section: "Metadata" },
  ],
  rtlh: [
    // Data Pemilik
    { key: "nama_pemilik", label: "Nama Pemilik", section: "Data Pemilik" },
    { key: "nik", label: "NIK", section: "Data Pemilik" },
    { key: "no_kk", label: "No. Kartu Keluarga", section: "Data Pemilik" },
    { key: "alamat", label: "Alamat", section: "Data Pemilik" },
    { key: "jorong", label: "Jorong", section: "Data Pemilik" },
    { key: "rt", label: "RT", section: "Data Pemilik" },
    { key: "rw", label: "RW", section: "Data Pemilik" },
    { key: "latitude", label: "Latitude", type: "number", section: "Data Pemilik" },
    { key: "longitude", label: "Longitude", type: "number", section: "Data Pemilik" },
    // Kondisi Rumah
    { key: "status", label: "Status", type: "badge", section: "Kondisi Rumah" },
    { key: "kondisi_atap", label: "Kondisi Atap", type: "badge", section: "Kondisi Rumah" },
    { key: "kondisi_dinding", label: "Kondisi Dinding", type: "badge", section: "Kondisi Rumah" },
    { key: "kondisi_lantai", label: "Kondisi Lantai", type: "badge", section: "Kondisi Rumah" },
    { key: "luas_bangunan", label: "Luas Bangunan (m²)", type: "number", section: "Kondisi Rumah" },
    { key: "jumlah_penghuni", label: "Jumlah Penghuni", type: "number", section: "Kondisi Rumah" },
    // Fasilitas
    { key: "akses_air_bersih", label: "Akses Air Bersih", type: "boolean", section: "Fasilitas" },
    { key: "akses_listrik", label: "Akses Listrik", type: "boolean", section: "Fasilitas" },
    { key: "memiliki_jamban", label: "Memiliki Jamban", type: "boolean", section: "Fasilitas" },
    { key: "jenis_jamban", label: "Jenis Jamban", section: "Fasilitas" },
    // Program Perbaikan
    { key: "pernah_dapat_bantuan", label: "Pernah Dapat Bantuan", type: "boolean", section: "Program Perbaikan" },
    { key: "tahun_bantuan", label: "Tahun Bantuan", type: "number", section: "Program Perbaikan" },
    { key: "sumber_bantuan", label: "Sumber Bantuan", section: "Program Perbaikan" },
    { key: "nilai_bantuan", label: "Nilai Bantuan", type: "currency", section: "Program Perbaikan" },
    { key: "sudah_diperbaiki", label: "Sudah Diperbaiki", type: "boolean", section: "Program Perbaikan" },
    { key: "tanggal_perbaikan", label: "Tanggal Perbaikan", type: "date", section: "Program Perbaikan" },
    // Metadata
    { key: "tahun_data", label: "Tahun Data", section: "Metadata" },
    { key: "keterangan", label: "Keterangan", section: "Metadata" },
  ],
  "putus-sekolah": [
    // Data Anak
    { key: "nama", label: "Nama Lengkap", section: "Data Anak" },
    { key: "nik", label: "NIK", section: "Data Anak" },
    { key: "tanggal_lahir", label: "Tanggal Lahir", type: "date", section: "Data Anak" },
    { key: "jenis_kelamin", label: "Jenis Kelamin", section: "Data Anak" },
    { key: "alamat", label: "Alamat", section: "Data Anak" },
    { key: "jorong", label: "Jorong", section: "Data Anak" },
    { key: "rt", label: "RT", section: "Data Anak" },
    { key: "rw", label: "RW", section: "Data Anak" },
    // Data Orang Tua
    { key: "nama_ayah", label: "Nama Ayah", section: "Data Orang Tua" },
    { key: "nama_ibu", label: "Nama Ibu", section: "Data Orang Tua" },
    { key: "pekerjaan_ortu", label: "Pekerjaan Orang Tua", section: "Data Orang Tua" },
    // Data Pendidikan
    { key: "jenjang_terakhir", label: "Jenjang Terakhir", type: "badge", section: "Data Pendidikan" },
    { key: "kelas_terakhir", label: "Kelas Terakhir", type: "number", section: "Data Pendidikan" },
    { key: "nama_sekolah_terakhir", label: "Nama Sekolah Terakhir", section: "Data Pendidikan" },
    { key: "tanggal_putus_sekolah", label: "Tanggal Putus Sekolah", type: "date", section: "Data Pendidikan" },
    { key: "alasan", label: "Alasan", type: "badge", section: "Data Pendidikan" },
    { key: "alasan_detail", label: "Detail Alasan", section: "Data Pendidikan" },
    // Intervensi
    { key: "dalam_program_kejar", label: "Dalam Program Kejar", type: "boolean", section: "Intervensi" },
    { key: "nama_program", label: "Nama Program", section: "Intervensi" },
    { key: "sudah_kembali_sekolah", label: "Sudah Kembali Sekolah", type: "boolean", section: "Intervensi" },
    { key: "tanggal_kembali_sekolah", label: "Tanggal Kembali Sekolah", type: "date", section: "Intervensi" },
    // Metadata
    { key: "tahun_data", label: "Tahun Data", section: "Metadata" },
    { key: "keterangan", label: "Keterangan", section: "Metadata" },
  ],
};

// KB Jenis options
export const jenisKbOptions = [
  'IUD', 'Implant', 'Suntik 1 Bulan', 'Suntik 3 Bulan', 
  'Pil', 'Kondom', 'MOW', 'MOP', 'Lainnya'
];

// Disabilitas jenis options
export const jenisDisabilitasOptions = ['Fisik', 'Intelektual', 'Mental', 'Sensorik', 'Ganda'];

// Tingkat kemandirian options
export const tingkatKemandirianOptions = ['Mandiri', 'Perlu Bantuan Sebagian', 'Perlu Bantuan Penuh'];

// Kondisi options (for RTLH)
export const kondisiOptions = ['Baik', 'Rusak Ringan', 'Rusak Berat'];

// Jenis jamban options
export const jenisJambanOptions = ['Sendiri', 'Bersama', 'Umum', 'Tidak Ada'];

// Jenjang pendidikan options
export const jenjangOptions = ['Tidak Sekolah', 'SD', 'SMP', 'SMA'];

// Alasan putus sekolah options
export const alasanPutusSekolahOptions = [
  'Ekonomi', 'Jarak Sekolah', 'Tidak Minat', 'Bekerja', 
  'Menikah', 'Hamil', 'Sakit', 'Lainnya'
];

// Status gizi options
export const statusGiziOptions = ['Gizi Buruk', 'Gizi Kurang', 'Gizi Baik', 'Gizi Lebih', 'Obesitas'];
