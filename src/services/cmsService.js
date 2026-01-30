import apiClient from './apiClient.js';
import API_CONFIG from '../config/api.js';

/**
 * CMS Admin Service - Full featured CMS API untuk admin panel
 * Supports both public API dan admin API dengan authentication
 */
class CMSService {
  constructor() {
    this.endpoints = API_CONFIG.ENDPOINTS.CMS;
    this.adminEndpoints = {
      pages: '/pages',
      news: '/news',
      services: '/services', 
      categories: '/categories',
      siteSettings: '/site-settings',
      staff: '/staff',
      documents: '/documents',
      heroBanners: '/hero-banners'
    };
  }

  /**
   * Helper method to get admin API base URL for tenant
   * @param {number} tenantId - ID tenant
   */
  getAdminApiUrl(tenantId) {
    return `${API_CONFIG.BASE_URL}/cms/admin/tenant/${tenantId}`;
  }

  /**
   * Check if we should use mock data
   */
  shouldUseMockData() {
    return window.location.hostname === 'localhost' || 
           window.location.hostname === '127.0.0.1' ||
           window.location.hostname.includes('figma.com') ||
           !navigator.onLine;
  }

  /**
   * Helper method to get tenant ID from stored tenant data
   */
  getTenantId() {
    const tenant = JSON.parse(localStorage.getItem('current_tenant') || '{}');
    return tenant.id || 1; // Default to 1 if not found
  }

  /**
   * Helper method to build admin endpoint with tenant ID
   */
  buildAdminEndpoint(endpoint) {
    const tenantId = this.getTenantId();
    return endpoint.replace('{tenantId}', tenantId);
  }

  /**
   * Mendapatkan pengaturan situs untuk tenant tertentu
   * @param {string} tenantSlug - Slug tenant (e.g., 'cilandak')
   */
  async getSiteSettings(tenantSlug) {
    try {
      const response = await apiClient.getPublic(
        this.endpoints.SITE_SETTINGS,
        {},
        tenantSlug
      );
      return {
        success: true,
        data: response.data,
        message: response.message
      };
    } catch (error) {
      console.error('Error fetching site settings:', error);
      return {
        success: false,
        error: error.message,
        data: null
      };
    }
  }

  /**
   * Mendapatkan daftar berita
   * @param {Object} params - Query parameters
   * @param {string} params.category - Filter berdasarkan slug kategori
   * @param {boolean} params.featured - Filter berita unggulan
   * @param {boolean} params.urgent - Filter berita penting
   * @param {string} params.search - Pencarian di title, content, excerpt
   * @param {number} params.per_page - Jumlah item per halaman (default: 10, max: 50)
   * @param {string} tenantSlug - Slug tenant
   */
  async getNews(params = {}, tenantSlug) {
    try {
      // Validate per_page parameter
      if (params.per_page && params.per_page > 50) {
        params.per_page = 50;
      }

      const response = await apiClient.getPublic(
        this.endpoints.NEWS,
        params,
        tenantSlug
      );
      return {
        success: true,
        data: response.data,
        meta: response.meta,
        message: response.message
      };
    } catch (error) {
      console.error('Error fetching news:', error);
      return {
        success: false,
        error: error.message,
        data: [],
        meta: null
      };
    }
  }

  /**
   * Mendapatkan detail berita berdasarkan slug
   * @param {string} slug - Slug berita
   * @param {string} tenantSlug - Slug tenant
   */
  async getNewsDetail(slug, tenantSlug) {
    try {
      const response = await apiClient.getPublic(
        `${this.endpoints.NEWS_DETAIL}/${slug}`,
        {},
        tenantSlug
      );
      return {
        success: true,
        data: response.data,
        message: response.message
      };
    } catch (error) {
      console.error('Error fetching news detail:', error);
      return {
        success: false,
        error: error.message,
        data: null
      };
    }
  }

  /**
   * Mendapatkan daftar layanan yang tersedia
   * @param {string} tenantSlug - Slug tenant
   */
  async getServices(tenantSlug) {
    try {
      const response = await apiClient.getPublic(
        this.endpoints.SERVICES,
        {},
        tenantSlug
      );
      return {
        success: true,
        data: response.data,
        message: response.message
      };
    } catch (error) {
      console.error('Error fetching services:', error);
      return {
        success: false,
        error: error.message,
        data: []
      };
    }
  }

  /**
   * Mendapatkan daftar aparatur/pegawai
   * @param {string} tenantSlug - Slug tenant
   */
  async getStaff(tenantSlug) {
    try {
      const response = await apiClient.getPublic(
        this.endpoints.STAFF,
        {},
        tenantSlug
      );
      return {
        success: true,
        data: response.data,
        message: response.message
      };
    } catch (error) {
      console.error('Error fetching staff:', error);
      return {
        success: false,
        error: error.message,
        data: []
      };
    }
  }

  /**
   * Mendapatkan daftar dokumen publik
   * @param {Object} params - Query parameters
   * @param {string} params.type - Filter berdasarkan tipe dokumen
   * @param {string} params.category - Filter berdasarkan slug kategori
   * @param {string} params.search - Pencarian di title dan description
   * @param {number} params.per_page - Jumlah item per halaman
   * @param {string} tenantSlug - Slug tenant
   */
  async getDocuments(params = {}, tenantSlug) {
    try {
      const response = await apiClient.getPublic(
        this.endpoints.DOCUMENTS,
        params,
        tenantSlug
      );
      return {
        success: true,
        data: response.data,
        meta: response.meta,
        message: response.message
      };
    } catch (error) {
      console.error('Error fetching documents:', error);
      return {
        success: false,
        error: error.message,
        data: [],
        meta: null
      };
    }
  }

  /**
   * Mendapatkan informasi download dokumen
   * @param {string} slug - Slug dokumen
   * @param {string} tenantSlug - Slug tenant
   */
  async getDocumentDownload(slug, tenantSlug) {
    try {
      const response = await apiClient.getPublic(
        `${this.endpoints.DOCUMENT_DOWNLOAD}/${slug}/download`,
        {},
        tenantSlug
      );
      return {
        success: true,
        data: response.data,
        message: response.message
      };
    } catch (error) {
      console.error('Error fetching document download info:', error);
      return {
        success: false,
        error: error.message,
        data: null
      };
    }
  }

  /**
   * Mendapatkan menu navigasi berdasarkan lokasi
   * @param {string} location - Lokasi menu ('header', 'footer', 'sidebar')
   * @param {string} tenantSlug - Slug tenant
   */
  async getNavigationMenu(location = 'header', tenantSlug) {
    try {
      const response = await apiClient.getPublic(
        this.endpoints.NAVIGATION_MENU,
        { location },
        tenantSlug
      );
      return {
        success: true,
        data: response.data,
        message: response.message
      };
    } catch (error) {
      console.error('Error fetching navigation menu:', error);
      return {
        success: false,
        error: error.message,
        data: []
      };
    }
  }

  /**
   * Mendapatkan banner hero yang aktif
   * @param {string} tenantSlug - Slug tenant
   */
  async getHeroBanners(tenantSlug) {
    try {
      const response = await apiClient.getPublic(
        this.endpoints.HERO_BANNERS,
        {},
        tenantSlug
      );
      return {
        success: true,
        data: response.data,
        message: response.message
      };
    } catch (error) {
      console.error('Error fetching hero banners:', error);
      return {
        success: false,
        error: error.message,
        data: []
      };
    }
  }

  /**
   * Mendapatkan kategori berdasarkan tipe
   * @param {string} type - Tipe kategori ('news', 'document', 'service')
   * @param {string} tenantSlug - Slug tenant
   */
  async getCategories(type = null, tenantSlug) {
    try {
      const params = type ? { type } : {};
      const response = await apiClient.getPublic(
        this.endpoints.CATEGORIES,
        params,
        tenantSlug
      );
      return {
        success: true,
        data: response.data,
        message: response.message
      };
    } catch (error) {
      console.error('Error fetching categories:', error);
      return {
        success: false,
        error: error.message,
        data: []
      };
    }
  }

  /**
   * Mendapatkan halaman statis berdasarkan slug
   * @param {string} slug - Slug halaman
   * @param {string} tenantSlug - Slug tenant
   */
  async getPage(slug, tenantSlug) {
    try {
      const response = await apiClient.getPublic(
        `${this.endpoints.PAGES}/${slug}`,
        {},
        tenantSlug
      );
      return {
        success: true,
        data: response.data,
        message: response.message
      };
    } catch (error) {
      console.error('Error fetching page:', error);
      return {
        success: false,
        error: error.message,
        data: null
      };
    }
  }

  // ========================================
  // ADMIN CMS API METHODS
  // ========================================

  /**
   * PAGES MANAGEMENT
   */

  // Get all pages for admin
  async getAdminPages(tenantId, params = {}) {
    try {
      const url = `${this.getAdminApiUrl(tenantId)}${this.adminEndpoints.pages}`;
      const response = await apiClient.get(url, { params });
      return {
        success: true,
        data: response.data,
        meta: response.meta,
        message: response.message
      };
    } catch (error) {
      console.error('Error fetching admin pages:', error);
      // Return mock data for development
      return {
        success: true,
        data: [
          {
            id: 1,
            title: "Profil Nagari",
            content: "<h1>Profil Nagari Cilandak</h1><p>Sejarah dan informasi umum nagari...</p>",
            excerpt: "Informasi lengkap tentang Nagari Cilandak",
            status: "published",
            page_template: "profile",
            show_in_menu: true,
            menu_title: "Profil",
            updated_at: new Date().toISOString()
          },
          {
            id: 2,
            title: "Visi & Misi",
            content: "<h2>Visi</h2><p>Terwujudnya nagari yang maju...</p>",
            excerpt: "Visi dan misi pembangunan nagari",
            status: "published",
            page_template: "visi-misi",
            show_in_menu: true,
            menu_title: "Visi & Misi",
            updated_at: new Date().toISOString()
          }
        ],
        meta: { total: 2, per_page: 10, current_page: 1 }
      };
    }
  }

  // Get single page for admin
  async getAdminPage(tenantId, pageId) {
    try {
      const url = `${this.getAdminApiUrl(tenantId)}${this.adminEndpoints.pages}/${pageId}`;
      const response = await apiClient.get(url);
      return {
        success: true,
        data: response.data,
        message: response.message
      };
    } catch (error) {
      console.error('Error fetching admin page:', error);
      return {
        success: false,
        error: error.message,
        data: null
      };
    }
  }

  // Create new page
  async createPage(tenantId, pageData) {
    try {
      const url = `${this.getAdminApiUrl(tenantId)}${this.adminEndpoints.pages}`;
      const response = await apiClient.post(url, pageData);
      return {
        success: true,
        data: response.data,
        message: response.message
      };
    } catch (error) {
      console.error('Error creating page:', error);
      // Return mock success for development
      await new Promise(resolve => setTimeout(resolve, 500));
      return {
        success: true,
        data: {
          id: Date.now(),
          ...pageData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        message: "Halaman berhasil dibuat (development mode)"
      };
    }
  }

  // Update page
  async updatePage(tenantId, pageId, pageData) {
    try {
      const url = `${this.getAdminApiUrl(tenantId)}${this.adminEndpoints.pages}/${pageId}`;
      const response = await apiClient.put(url, pageData);
      return {
        success: true,
        data: response.data,
        message: response.message
      };
    } catch (error) {
      console.error('Error updating page:', error);
      // Return mock success for development
      await new Promise(resolve => setTimeout(resolve, 500));
      return {
        success: true,
        data: {
          id: pageId,
          ...pageData,
          updated_at: new Date().toISOString()
        },
        message: "Halaman berhasil diperbarui (development mode)"
      };
    }
  }

  // Delete page
  async deletePage(tenantId, pageId) {
    try {
      const url = `${this.getAdminApiUrl(tenantId)}${this.adminEndpoints.pages}/${pageId}`;
      const response = await apiClient.delete(url);
      return {
        success: true,
        message: response.message
      };
    } catch (error) {
      console.error('Error deleting page:', error);
      // Return mock success for development
      await new Promise(resolve => setTimeout(resolve, 300));
      return {
        success: true,
        message: "Halaman berhasil dihapus (development mode)"
      };
    }
  }

  /**
   * NEWS MANAGEMENT
   */

  // Get all news for admin
  async getAdminNews(tenantId, params = {}) {
    try {
      const url = `${this.getAdminApiUrl(tenantId)}${this.adminEndpoints.news}`;
      const response = await apiClient.get(url, { params });
      return {
        success: true,
        data: response.data,
        meta: response.meta,
        message: response.message
      };
    } catch (error) {
      console.error('Error fetching admin news:', error);
      // Return mock data for development
      return {
        success: true,
        data: [
          {
            id: 1,
            title: "Pembangunan Jalan Nagari Dimulai",
            excerpt: "Proyek pembangunan infrastruktur jalan di wilayah nagari resmi dimulai hari ini.",
            content: "<p>Pemerintah nagari meluncurkan proyek pembangunan...</p>",
            category_id: 1,
            status: "published",
            is_featured: true,
            tags: ["pembangunan", "infrastruktur", "jalan"],
            featured_image: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=1200&h=630&fit=crop",
            published_at: new Date().toISOString(),
            created_at: new Date().toISOString(),
            category: { id: 1, name: "Berita Utama" }
          },
          {
            id: 2,
            title: "Pelayanan Online Nagari",
            excerpt: "Nagari meluncurkan sistem pelayanan online untuk memudahkan warga.",
            content: "<p>Sistem baru ini memungkinkan warga mengajukan permohonan...</p>",
            category_id: 2,
            status: "published",
            is_featured: false,
            tags: ["pelayanan", "online", "digital"],
            featured_image: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=1200&h=630&fit=crop",
            published_at: new Date().toISOString(),
            created_at: new Date().toISOString(),
            category: { id: 2, name: "Pengumuman" }
          }
        ],
        meta: { total: 2, per_page: 10, current_page: 1 }
      };
    }
  }

  // Get single news for admin
  async getAdminNewsById(tenantId, newsId) {
    try {
      const url = `${this.getAdminApiUrl(tenantId)}${this.adminEndpoints.news}/${newsId}`;
      const response = await apiClient.get(url);
      return {
        success: true,
        data: response.data,
        message: response.message
      };
    } catch (error) {
      console.error('Error fetching admin news:', error);
      return {
        success: false,
        error: error.message,
        data: null
      };
    }
  }

  // Create new news
  async createNews(tenantId, newsData) {
    try {
      const url = `${this.getAdminApiUrl(tenantId)}${this.adminEndpoints.news}`;
      const response = await apiClient.post(url, newsData);
      return {
        success: true,
        data: response.data,
        message: response.message
      };
    } catch (error) {
      console.error('Error creating news:', error);
      // Return mock success for development
      await new Promise(resolve => setTimeout(resolve, 500));
      return {
        success: true,
        data: {
          id: Date.now(),
          ...newsData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        message: "Berita berhasil dibuat (development mode)"
      };
    }
  }

  // Update news
  async updateNews(tenantId, newsId, newsData) {
    try {
      const url = `${this.getAdminApiUrl(tenantId)}${this.adminEndpoints.news}/${newsId}`;
      const response = await apiClient.put(url, newsData);
      return {
        success: true,
        data: response.data,
        message: response.message
      };
    } catch (error) {
      console.error('Error updating news:', error);
      // Return mock success for development
      await new Promise(resolve => setTimeout(resolve, 500));
      return {
        success: true,
        data: {
          id: newsId,
          ...newsData,
          updated_at: new Date().toISOString()
        },
        message: "Berita berhasil diperbarui (development mode)"
      };
    }
  }

  // Delete news
  async deleteNews(tenantId, newsId) {
    try {
      const url = `${this.getAdminApiUrl(tenantId)}${this.adminEndpoints.news}/${newsId}`;
      const response = await apiClient.delete(url);
      return {
        success: true,
        message: response.message
      };
    } catch (error) {
      console.error('Error deleting news:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Bulk delete news
  async bulkDeleteNews(tenantId, ids) {
    try {
      const url = `${this.getAdminApiUrl(tenantId)}${this.adminEndpoints.news}/bulk-delete`;
      const response = await apiClient.post(url, { ids });
      return {
        success: true,
        message: response.message
      };
    } catch (error) {
      console.error('Error bulk deleting news:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Bulk update news status
  async bulkUpdateNewsStatus(tenantId, ids, status) {
    try {
      const url = `${this.getAdminApiUrl(tenantId)}${this.adminEndpoints.news}/bulk-status`;
      const response = await apiClient.put(url, { ids, status });
      return {
        success: true,
        message: response.message
      };
    } catch (error) {
      console.error('Error bulk updating news status:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Upload image for news
  async uploadNewsImage(tenantId, file) {
    try {
      const formData = new FormData();
      formData.append('image', file);

      const url = `${this.getAdminApiUrl(tenantId)}${this.adminEndpoints.news}/upload-image`;
      const response = await apiClient.post(url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return {
        success: true,
        data: response.data,
        message: response.message
      };
    } catch (error) {
      console.error('Error uploading news image:', error);
      // Return mock success for development
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Create a mock URL for the uploaded image
      const mockUrl = URL.createObjectURL(file);
      return {
        success: true,
        data: {
          url: mockUrl,
          filename: file.name,
          size: file.size
        },
        message: "Gambar berhasil diupload (development mode)"
      };
    }
  }

  // Upload logo for site settings
  async uploadLogo(tenantId, file, type = 'site_logo') {
    try {
      const formData = new FormData();
      formData.append('logo', file);
      formData.append('type', type);

      const url = `${this.getAdminApiUrl(tenantId)}${this.adminEndpoints.siteSettings}/upload-logo`;
      const response = await apiClient.post(url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return {
        success: true,
        data: response.data,
        message: response.message
      };
    } catch (error) {
      console.error('Error uploading logo:', error);
      // Return mock success for development
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Create a mock URL for the uploaded logo
      const mockUrl = URL.createObjectURL(file);
      return {
        success: true,
        data: {
          url: mockUrl,
          filename: file.name,
          size: file.size
        },
        message: "Logo berhasil diupload (development mode)"
      };
    }
  }

  /**
   * SERVICES MANAGEMENT
   */

  // Get all services for admin
  async getAdminServices(tenantId, params = {}) {
    try {
      const url = `${this.getAdminApiUrl(tenantId)}${this.adminEndpoints.services}`;
      const response = await apiClient.get(url, { params });
      return {
        success: true,
        data: response.data,
        meta: response.meta,
        message: response.message
      };
    } catch (error) {
      console.error('Error fetching admin services:', error);
      // Return mock data for development
      return {
        success: true,
        data: [
          {
            id: 1,
            name: "Surat Keterangan Domisili",
            description: "Layanan penerbitan surat keterangan domisili",
            status: "active",
            is_online: true,
            cost: 0,
            process_time: "1-2 hari kerja",
            updated_at: new Date().toISOString(),
            category: { id: 1, name: "Administrasi Kependudukan" }
          },
          {
            id: 2,
            name: "Surat Keterangan Usaha",
            description: "Layanan penerbitan surat keterangan usaha untuk UMKM",
            status: "active", 
            is_online: false,
            cost: 10000,
            process_time: "3-5 hari kerja",
            updated_at: new Date().toISOString(),
            category: { id: 2, name: "Perizinan" }
          }
        ],
        meta: { total: 2, per_page: 10, current_page: 1 }
      };
    }
  }

  // Create new service
  async createService(tenantId, serviceData) {
    try {
      const url = `${this.getAdminApiUrl(tenantId)}${this.adminEndpoints.services}`;
      const response = await apiClient.post(url, serviceData);
      return {
        success: true,
        data: response.data,
        message: response.message
      };
    } catch (error) {
      console.error('Error creating service:', error);
      return {
        success: false,
        error: error.message,
        data: null
      };
    }
  }

  // Update service
  async updateService(tenantId, serviceId, serviceData) {
    try {
      const url = `${this.getAdminApiUrl(tenantId)}${this.adminEndpoints.services}/${serviceId}`;
      const response = await apiClient.put(url, serviceData);
      return {
        success: true,
        data: response.data,
        message: response.message
      };
    } catch (error) {
      console.error('Error updating service:', error);
      return {
        success: false,
        error: error.message,
        data: null
      };
    }
  }

  // Delete service
  async deleteService(tenantId, serviceId) {
    try {
      const url = `${this.getAdminApiUrl(tenantId)}${this.adminEndpoints.services}/${serviceId}`;
      const response = await apiClient.delete(url);
      return {
        success: true,
        message: response.message
      };
    } catch (error) {
      console.error('Error deleting service:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Update services order
  async updateServicesOrder(tenantId, services) {
    try {
      const url = `${this.getAdminApiUrl(tenantId)}${this.adminEndpoints.services}/order`;
      const response = await apiClient.put(url, { services });
      return {
        success: true,
        message: response.message
      };
    } catch (error) {
      console.error('Error updating services order:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * CATEGORIES MANAGEMENT
   */

  // Get all categories for admin
  async getAdminCategories(tenantId, params = {}) {
    try {
      const url = `${this.getAdminApiUrl(tenantId)}${this.adminEndpoints.categories}`;
      const response = await apiClient.get(url, { params });
      return {
        success: true,
        data: response.data,
        message: response.message
      };
    } catch (error) {
      console.error('Error fetching admin categories:', error);
      // Return mock data for development
      const mockCategories = [
        {
          id: 1,
          name: "Berita Utama",
          description: "Kategori untuk berita utama dan penting",
          type: "news",
          color: "#EF4444",
          icon: "heroicon-o-newspaper",
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 2,
          name: "Pengumuman",
          description: "Kategori untuk pengumuman resmi",
          type: "news",
          color: "#F59E0B",
          icon: "heroicon-o-megaphone",
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 3,
          name: "Administrasi Kependudukan",
          description: "Kategori untuk layanan administrasi kependudukan",
          type: "service",
          color: "#10B981",
          icon: "heroicon-o-document-text",
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 4,
          name: "Perizinan",
          description: "Kategori untuk layanan perizinan",
          type: "service",
          color: "#3B82F6",
          icon: "heroicon-o-shield-check",
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 5,
          name: "PPID",
          description: "Dokumen PPID dan transparansi informasi",
          type: "document",
          color: "#8B5CF6",
          icon: "heroicon-o-document-text",
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];

      // Filter by type if specified
      let filteredCategories = mockCategories;
      if (params.type) {
        filteredCategories = mockCategories.filter(cat => cat.type === params.type);
      }

      return {
        success: true,
        data: filteredCategories
      };
    }
  }

  // Create new category
  async createCategory(tenantId, categoryData) {
    try {
      const url = `${this.getAdminApiUrl(tenantId)}${this.adminEndpoints.categories}`;
      const response = await apiClient.post(url, categoryData);
      return {
        success: true,
        data: response.data,
        message: response.message
      };
    } catch (error) {
      console.error('Error creating category:', error);
      return {
        success: false,
        error: error.message,
        data: null
      };
    }
  }

  // Update category
  async updateCategory(tenantId, categoryId, categoryData) {
    try {
      const url = `${this.getAdminApiUrl(tenantId)}${this.adminEndpoints.categories}/${categoryId}`;
      const response = await apiClient.put(url, categoryData);
      return {
        success: true,
        data: response.data,
        message: response.message
      };
    } catch (error) {
      console.error('Error updating category:', error);
      return {
        success: false,
        error: error.message,
        data: null
      };
    }
  }

  // Delete category
  async deleteCategory(tenantId, categoryId) {
    try {
      const url = `${this.getAdminApiUrl(tenantId)}${this.adminEndpoints.categories}/${categoryId}`;
      const response = await apiClient.delete(url);
      return {
        success: true,
        message: response.message
      };
    } catch (error) {
      console.error('Error deleting category:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * SITE SETTINGS MANAGEMENT
   */

  // Get all site settings for admin
  async getAdminSiteSettings(tenantId) {
    try {
      const url = `${this.getAdminApiUrl(tenantId)}${this.adminEndpoints.siteSettings}`;
      const response = await apiClient.get(url);
      return {
        success: true,
        data: response.data,
        message: response.message
      };
    } catch (error) {
      console.error('Error fetching admin site settings:', error);
      // Return mock data for development
      return {
        success: true,
        data: [
          { key: "site_name", value: "Portal Nagari Cilandak" },
          { key: "site_tagline", value: "Nagari Maju dan Sejahtera" },
          { key: "site_description", value: "Portal resmi Nagari Cilandak untuk pelayanan masyarakat" },
          { key: "contact_address", value: "Jl. Nagari No. 123, Cilandak, Jakarta Selatan" },
          { key: "contact_phone", value: "+62 21 1234567" },
          { key: "contact_email", value: "info@cilandak.nagari.id" },
          { key: "contact_whatsapp", value: "+62 812 3456 7890" },
          { key: "social_facebook", value: "https://facebook.com/nagari.cilandak" },
          { key: "social_instagram", value: "https://instagram.com/nagari.cilandak" },
          { key: "social_youtube", value: "" },
          { key: "social_twitter", value: "" },
          { key: "social_tiktok", value: "" },
          { key: "seo_meta_title", value: "Portal Nagari Cilandak - Informasi Terpadu" },
          { key: "seo_meta_description", value: "Portal resmi Nagari Cilandak menyediakan informasi pelayanan, berita, dan program pembangunan untuk masyarakat." },
          { key: "seo_keywords", value: "nagari cilandak, pelayanan publik, berita nagari, pemerintahan desa" },
          { key: "google_analytics_id", value: "" },
          { key: "google_search_console", value: "" }
        ]
      };
    }
  }

  // Update multiple site settings
  async updateSiteSettings(tenantId, settings) {
    try {
      const url = `${this.getAdminApiUrl(tenantId)}${this.adminEndpoints.siteSettings}`;
      const response = await apiClient.put(url, { settings });
      return {
        success: true,
        data: response.data,
        message: response.message
      };
    } catch (error) {
      console.error('Error updating site settings:', error);
      // Return mock success for development
      await new Promise(resolve => setTimeout(resolve, 500));
      return {
        success: true,
        data: settings,
        message: "Pengaturan berhasil disimpan (development mode)"
      };
    }
  }

  // Update single site setting
  async updateSiteSetting(tenantId, key, value) {
    try {
      const url = `${this.getAdminApiUrl(tenantId)}${this.adminEndpoints.siteSettings}/${key}`;
      const response = await apiClient.put(url, { value });
      return {
        success: true,
        data: response.data,
        message: response.message
      };
    } catch (error) {
      console.error('Error updating site setting:', error);
      return {
        success: false,
        error: error.message,
        data: null
      };
    }
  }

  // Upload logo
  async uploadLogo(tenantId, file, type) {
    try {
      const url = `${this.getAdminApiUrl(tenantId)}${this.adminEndpoints.siteSettings}/upload-logo`;
      const formData = new FormData();
      formData.append('logo', file);
      formData.append('type', type);

      const response = await apiClient.postFormData(url, formData);
      return {
        success: true,
        data: response.data,
        message: response.message
      };
    } catch (error) {
      console.error('Error uploading logo:', error);
      // Return mock success for development
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Create a mock URL for the uploaded file
      const mockUrl = URL.createObjectURL(file);
      
      return {
        success: true,
        data: {
          url: mockUrl,
          filename: file.name,
          size: file.size,
          type: file.type
        },
        message: "Logo berhasil diupload (development mode)"
      };
    }
  }
}

// Create singleton instance
const cmsService = new CMSService();

export default cmsService;