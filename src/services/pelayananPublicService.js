import apiClient from './apiClient.js';
import API_CONFIG from '../config/api.js';

/**
 * Pelayanan Public Service - API untuk pengajuan dan pelacakan layanan publik
 * Digunakan oleh masyarakat untuk mengajukan permohonan layanan
 */
class PelayananPublicService {
  constructor() {
    this.endpoints = API_CONFIG.ENDPOINTS.PELAYANAN;
  }

  /**
   * Mengajukan permohonan layanan dari masyarakat
   * @param {Object} requestData - Data permohonan
   * @param {number} requestData.pelayanan_jenis_id - ID jenis pelayanan
   * @param {string} requestData.nama_pemohon - Nama pemohon
   * @param {string} requestData.nik_pemohon - NIK pemohon (16 digit)
   * @param {string} requestData.no_hp_pemohon - Nomor HP pemohon
   * @param {string} requestData.email_pemohon - Email pemohon (optional)
   * @param {string} requestData.alamat_pemohon - Alamat pemohon
   * @param {string} requestData.keterangan_pemohon - Keterangan tambahan (optional)
   * @param {File[]} attachments - File lampiran (jpg, jpeg, png, pdf, max 2MB each)
   * @param {string} tenantSlug - Slug tenant
   */
  async submitServiceRequest(requestData, attachments = [], tenantSlug) {
    try {
      // Validate required fields
      const requiredFields = [
        'pelayanan_jenis_id',
        'nama_pemohon', 
        'nik_pemohon',
        'no_hp_pemohon',
        'alamat_pemohon'
      ];

      for (const field of requiredFields) {
        if (!requestData[field]) {
          throw new Error(`Field ${field} is required`);
        }
      }

      // Validate NIK (must be 16 digits)
      if (requestData.nik_pemohon.length !== 16) {
        throw new Error('NIK must be exactly 16 digits');
      }

      // Validate phone number (Indonesian format)
      const phoneRegex = /^(\+62|62|0)8[1-9][0-9]{6,9}$/;
      if (!phoneRegex.test(requestData.no_hp_pemohon)) {
        throw new Error('Invalid Indonesian phone number format');
      }

      // Validate email if provided
      if (requestData.email_pemohon) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(requestData.email_pemohon)) {
          throw new Error('Invalid email format');
        }
      }

      // Create FormData for multipart request
      const formData = new FormData();
      
      // Add form fields
      Object.keys(requestData).forEach(key => {
        if (requestData[key] !== undefined && requestData[key] !== null) {
          formData.append(key, requestData[key]);
        }
      });

      // Add file attachments
      if (attachments && attachments.length > 0) {
        attachments.forEach((file, index) => {
          // Validate file type
          if (!API_CONFIG.SUPPORTED_FILE_TYPES.includes(file.type)) {
            throw new Error(`File type ${file.type} is not supported. Supported types: JPG, JPEG, PNG, PDF`);
          }

          // Validate file size (max 2MB)
          if (file.size > API_CONFIG.UPLOAD_MAX_SIZE) {
            throw new Error(`File ${file.name} exceeds maximum size of 2MB`);
          }

          formData.append('attachments[]', file);
        });
      }

      const response = await apiClient.postPublic(
        this.endpoints.SUBMIT,
        formData,
        tenantSlug
      );

      return {
        success: true,
        message: response.message,
        data: response.data
      };
    } catch (error) {
      console.error('Error submitting service request:', error);
      
      // Handle validation errors specifically
      if (error.name === 'ValidationError') {
        return {
          success: false,
          message: 'Validation error',
          errors: error.errors,
          data: null
        };
      }

      return {
        success: false,
        error: error.message,
        message: 'Failed to submit service request',
        data: null
      };
    }
  }

  /**
   * Mendapatkan daftar layanan publik yang tersedia
   * @param {string} tenantSlug - Slug tenant
   */
  async getPublicServices(tenantSlug) {
    try {
      const response = await apiClient.getPublic(
        this.endpoints.PUBLIC_SERVICES || '/public-services',
        {},
        tenantSlug
      );

      return {
        success: true,
        data: response.data,
        message: response.message
      };
    } catch (error) {
      console.error('Error fetching public services:', error);
      return {
        success: false,
        error: error.message,
        message: 'Failed to fetch public services',
        data: null
      };
    }
  }

  /**
   * Melacak status permohonan layanan berdasarkan kode pelacakan
   * @param {string} trackingCode - Kode pelacakan (format: REQ-XXXXXXXXX)
   * @param {string} tenantSlug - Slug tenant
   */
  async trackServiceRequest(trackingCode, tenantSlug) {
    try {
      // Validate tracking code format
      if (!trackingCode || typeof trackingCode !== 'string') {
        throw new Error('Tracking code is required');
      }

      // Basic format validation for tracking code
      const trackingCodeRegex = /^REQ-[A-Z0-9]+$/;
      if (!trackingCodeRegex.test(trackingCode)) {
        throw new Error('Invalid tracking code format. Expected format: REQ-XXXXXXXXX');
      }

      const response = await apiClient.getPublic(
        `${this.endpoints.TRACK}/${trackingCode}`,
        {},
        tenantSlug
      );

      return {
        success: true,
        data: response.data,
        message: response.message
      };
    } catch (error) {
      console.error('Error tracking service request:', error);
      return {
        success: false,
        error: error.message,
        message: 'Failed to track service request',
        data: null
      };
    }
  }

  /**
   * Mendapatkan status label yang user-friendly
   * @param {string} status - Status dari API
   */
  getStatusLabel(status) {
    const statusLabels = {
      'pending': 'Menunggu Diproses',
      'diproses': 'Sedang Diproses', 
      'selesai': 'Selesai/Siap Diambil',
      'ditolak': 'Ditolak'
    };

    return statusLabels[status] || 'Status Tidak Dikenal';
  }

  /**
   * Mendapatkan warna badge untuk status
   * @param {string} status - Status dari API
   */
  getStatusBadgeVariant(status) {
    const statusVariants = {
      'pending': 'secondary',
      'diproses': 'default',
      'selesai': 'success', 
      'ditolak': 'destructive'
    };

    return statusVariants[status] || 'outline';
  }

  /**
   * Format tanggal untuk display
   * @param {string} dateString - Date string dari API
   */
  formatDate(dateString) {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return dateString; // Fallback ke string asli jika parsing gagal
    }
  }

  /**
   * Validate file before upload
   * @param {File} file - File to validate
   */
  validateFile(file) {
    const errors = [];

    // Check file type
    if (!API_CONFIG.SUPPORTED_FILE_TYPES.includes(file.type)) {
      errors.push(`File type ${file.type} is not supported. Supported types: JPG, JPEG, PNG, PDF`);
    }

    // Check file size
    if (file.size > API_CONFIG.UPLOAD_MAX_SIZE) {
      errors.push(`File ${file.name} exceeds maximum size of 2MB`);
    }

    // Check file name
    if (file.name.length > 255) {
      errors.push(`File name too long. Maximum 255 characters`);
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Format file size for display
   * @param {number} bytes - File size in bytes
   */
  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

// Create singleton instance
const pelayananPublicService = new PelayananPublicService();

export default pelayananPublicService;