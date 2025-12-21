/**
 * UMKM Service
 * Service untuk mengelola data UMKM (Usaha Mikro Kecil Menengah)
 */

import apiClient from './apiClient';

// Types
export interface UmkmPemilik {
  id: number;
  nik: string;
  nama: string;
  alamat?: string;
  no_hp?: string;
}

export interface Umkm {
  id: number;
  tenant_id: number;
  nama_usaha: string;
  pemilik_id: number | null;
  pemilik?: UmkmPemilik | null;
  produk: string | null;
  omzet: string | null;
  alamat: string | null;
  no_hp: string | null;
  jenis_usaha: string | null;
  status: 'Aktif' | 'Tidak Aktif';
  tanggal_mulai: string | null;
  created_at: string;
  updated_at: string;
}

export interface UmkmFormData {
  nama_usaha: string;
  pemilik_id?: number | null;
  produk?: string;
  omzet?: number;
  alamat?: string;
  no_hp?: string;
  jenis_usaha?: string;
  status?: 'Aktif' | 'Tidak Aktif';
  tanggal_mulai?: string;
}

export interface UmkmListParams {
  search?: string;
  jenis_usaha?: string;
  status?: string;
  per_page?: number;
  page?: number;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
  };
}

export interface SingleResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

// Kategori UMKM yang umum
export const JENIS_USAHA_OPTIONS = [
  'Kuliner',
  'Fashion',
  'Kerajinan',
  'Jasa',
  'Perdagangan',
  'Pertanian',
  'Peternakan',
  'Perikanan',
  'Industri Rumah Tangga',
  'Lainnya',
];

const ENDPOINT = '/umkms';

/**
 * UMKM Service Class
 */
class UmkmService {
  /**
   * Get list of UMKMs with pagination
   */
  async getList(params: UmkmListParams = {}): Promise<PaginatedResponse<Umkm>> {
    const response = await apiClient.get(ENDPOINT, params);
    return response.data;
  }

  /**
   * Get all UMKMs (for dropdowns)
   */
  async getAll(): Promise<Umkm[]> {
    const response = await apiClient.get(ENDPOINT, { per_page: 500 });
    return response.data?.data?.data || [];
  }

  /**
   * Get single UMKM by ID
   */
  async getById(id: number): Promise<SingleResponse<Umkm>> {
    const response = await apiClient.get(`${ENDPOINT}/${id}`);
    return response.data;
  }

  /**
   * Create new UMKM
   */
  async create(data: UmkmFormData): Promise<SingleResponse<Umkm>> {
    const response = await apiClient.post(ENDPOINT, data);
    return response.data;
  }

  /**
   * Update existing UMKM
   */
  async update(id: number, data: Partial<UmkmFormData>): Promise<SingleResponse<Umkm>> {
    const response = await apiClient.put(`${ENDPOINT}/${id}`, data);
    return response.data;
  }

  /**
   * Delete UMKM
   */
  async delete(id: number): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.delete(`${ENDPOINT}/${id}`);
    return response.data;
  }

  /**
   * Toggle UMKM active status
   */
  async toggleStatus(id: number, status: 'Aktif' | 'Tidak Aktif'): Promise<SingleResponse<Umkm>> {
    return this.update(id, { status });
  }

  /**
   * Get UMKM statistics
   */
  async getStatistics(): Promise<{
    total: number;
    aktif: number;
    tidak_aktif: number;
    by_jenis: Record<string, number>;
  }> {
    try {
      const all = await this.getAll();
      const aktif = all.filter(u => u.status === 'Aktif').length;
      const byJenis: Record<string, number> = {};
      
      all.forEach(u => {
        const jenis = u.jenis_usaha || 'Lainnya';
        byJenis[jenis] = (byJenis[jenis] || 0) + 1;
      });

      return {
        total: all.length,
        aktif,
        tidak_aktif: all.length - aktif,
        by_jenis: byJenis,
      };
    } catch {
      return { total: 0, aktif: 0, tidak_aktif: 0, by_jenis: {} };
    }
  }
}

export const umkmService = new UmkmService();
export default umkmService;
