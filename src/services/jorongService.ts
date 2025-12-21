/**
 * Jorong Service
 * Service untuk mengelola data Jorong/Dusun
 */

import apiClient from './apiClient';

// Types
export interface WaliJorong {
  id: number;
  nik: string;
  nama: string;
  alamat?: string;
  no_hp?: string;
  jenis_kelamin?: string;
  tanggal_lahir?: string;
}

export interface Jorong {
  id: number;
  tenant_id: number;
  nama: string;
  kode: string | null;
  kepala_jorong: string | null;
  wali_jorong_id: number | null;
  wali_jorong?: WaliJorong | null;
  alamat_kantor: string | null;
  telepon: string | null;
  email: string | null;
  tanggal_penetapan: string | null;
  nomor_sk: string | null;
  luas_wilayah: string | null;
  jumlah_rt: number | null;
  jumlah_rw: number | null;
  koordinat_lat: string | null;
  koordinat_lng: string | null;
  batas_utara: string | null;
  batas_selatan: string | null;
  batas_timur: string | null;
  batas_barat: string | null;
  keterangan: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  statistics?: JorongStatistics;
}

export interface JorongStatistics {
  kemiskinan: number;
  stunting: number;
  kb_aktif: number;
  disabilitas: number;
  rtlh: number;
  putus_sekolah: number;
}

export interface JorongFormData {
  nama: string;
  kode?: string;
  kepala_jorong?: string;
  wali_jorong_id?: number | null;
  alamat_kantor?: string;
  telepon?: string;
  email?: string;
  tanggal_penetapan?: string;
  nomor_sk?: string;
  luas_wilayah?: number;
  jumlah_rt?: number;
  jumlah_rw?: number;
  koordinat_lat?: number;
  koordinat_lng?: number;
  batas_utara?: string;
  batas_selatan?: string;
  batas_timur?: string;
  batas_barat?: string;
  keterangan?: string;
  is_active?: boolean;
}

export interface JorongListParams {
  search?: string;
  is_active?: boolean;
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

const ENDPOINT = '/social-data/jorongs';

/**
 * Jorong Service Class
 */
class JorongService {
  /**
   * Get list of jorongs with pagination
   */
  async getList(params: JorongListParams = {}): Promise<PaginatedResponse<Jorong>> {
    const response = await apiClient.get(ENDPOINT, params);
    const data = response.data;
    
    // If response is already in expected format: { success: true, data: { data: [...], current_page: 1, ... } }
    if (data?.success && data?.data?.data) {
      return data;
    }
    
    // If response.data contains paginated data directly (Laravel default): { data: [...], current_page: 1, ... }
    if (data?.data && Array.isArray(data.data) && data?.current_page) {
      return {
        success: true,
        data: data
      };
    }
    
    // If data is paginated at top level (axios unwrapped): { current_page: 1, data: [...], ... }
    if (data?.current_page && Array.isArray(data?.data)) {
      return {
        success: true,
        data: data
      };
    }
    
    // Fallback - wrap in expected format
    return {
      success: true,
      data: {
        data: Array.isArray(data) ? data : [],
        current_page: 1,
        last_page: 1,
        per_page: 15,
        total: Array.isArray(data) ? data.length : 0,
        from: 1,
        to: Array.isArray(data) ? data.length : 0
      }
    };
  }

  /**
   * Get all jorongs (for dropdowns)
   */
  async getAll(): Promise<Jorong[]> {
    const response = await apiClient.get(ENDPOINT, { per_page: 100 });
    const data = response.data;
    
    // Handle different response formats
    if (data?.data?.data && Array.isArray(data.data.data)) {
      return data.data.data;
    }
    if (data?.data && Array.isArray(data.data)) {
      return data.data;
    }
    if (Array.isArray(data)) {
      return data;
    }
    return [];
  }

  /**
   * Get single jorong by ID
   */
  async getById(id: number): Promise<SingleResponse<Jorong>> {
    const response = await apiClient.get(`${ENDPOINT}/${id}`);
    return response.data;
  }

  /**
   * Get jorong statistics
   */
  async getStatistics(id: number): Promise<SingleResponse<{ jorong: Partial<Jorong>; statistics: JorongStatistics }>> {
    const response = await apiClient.get(`${ENDPOINT}/${id}/statistics`);
    return response.data;
  }

  /**
   * Create new jorong
   */
  async create(data: JorongFormData): Promise<SingleResponse<Jorong>> {
    const response = await apiClient.post(ENDPOINT, data);
    return response.data;
  }

  /**
   * Update existing jorong
   */
  async update(id: number, data: Partial<JorongFormData>): Promise<SingleResponse<Jorong>> {
    const response = await apiClient.put(`${ENDPOINT}/${id}`, data);
    return response.data;
  }

  /**
   * Delete jorong
   */
  async delete(id: number): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.delete(`${ENDPOINT}/${id}`);
    return response.data;
  }

  /**
   * Toggle jorong active status
   */
  async toggleActive(id: number, isActive: boolean): Promise<SingleResponse<Jorong>> {
    return this.update(id, { is_active: isActive });
  }
}

export const jorongService = new JorongService();
export default jorongService;
