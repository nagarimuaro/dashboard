// Column definitions (for column visibility feature)
export const allColumns = [
  { id: "no", label: "No", default: true },
  { id: "nama", label: "Nama", default: true },
  { id: "nik", label: "NIK", default: true },
  { id: "usia", label: "Usia", default: true }, // For balita
  { id: "jenis_kelamin", label: "L/P", default: true }, // For balita
  { id: "alamat", label: "Alamat", default: true },
  { id: "jorong", label: "Jorong", default: true },
  { id: "rt_rw", label: "RT/RW", default: true },
  { id: "status", label: "Status", default: true },
  { id: "tahun", label: "Tahun", default: true },
  { id: "keterangan", label: "Keterangan", default: false },
  { id: "aksi", label: "Aksi", default: true },
];

// Balita status options
export const balitaStatusOptions = ['Normal', 'Stunting Ringan', 'Stunting Berat', 'Belum Diukur'];

export const balitaStatusColors: Record<string, string> = {
  'Normal': '#22c55e',
  'Stunting Ringan': '#f97316', 
  'Stunting Berat': '#ef4444',
  'Belum Diukur': '#9ca3af'
};

// KB status colors
export const kbStatusColors: Record<string, string> = {
  'Sudah KB': '#22c55e',
  'Belum KB': '#ef4444',
};

// KB Jenis options
export const jenisKbOptions = [
  'Pil',
  'Suntik 1 Bulan',
  'Suntik 3 Bulan',
  'Implant',
  'IUD',
  'Kondom',
  'MOW',
  'MOP',
  'MAL',
  'Lainnya'
];
