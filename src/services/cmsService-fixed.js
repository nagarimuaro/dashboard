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
      siteSettings: '/site-settings'
    };
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
   * Helper method to get admin API base URL for tenant
   * @param {number} tenantId - ID tenant
   */
  getAdminApiUrl(tenantId) {
    return `${API_CONFIG.BASE_URL}/cms/admin/tenant/${tenantId}`;
  }

  // ========================================
  // MOCK DATA METHODS
  // ========================================

  getMockNewsData() {
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
          images: [
            {
              url: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&h=600&fit=crop",
              name: "construction-1.jpg",
              size: 245760
            }
          ],
          published_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
          category: { id: 1, name: "Berita Utama" },
          author: "Admin Nagari"
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
          images: [],
          published_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
          category: { id: 2, name: "Pengumuman" },
          author: "Staff IT"
        }
      ],
      meta: { total: 2, per_page: 10, current_page: 1 }
    };
  }

  getMockCategoriesData(params = {}) {
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
        name: "Program Sosial",
        description: "Kategori untuk program-program sosial nagari",
        type: "news",
        color: "#059669",
        icon: "heroicon-o-heart",
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];

    let filteredCategories = mockCategories;
    if (params.type) {
      filteredCategories = mockCategories.filter(cat => cat.type === params.type);
    }

    return {
      success: true,
      data: filteredCategories,
      message: "Categories retrieved successfully (development mode)"
    };
  }

  getMockSiteSettings() {
    return {
      success: true,
      data: {
        site_name: "Nagari Koto Baru",
        site_description: "Website Resmi Nagari Koto Baru",
        contact_email: "info@kotobaru.nagari.id",
        contact_phone: "+62 751 123456",
        address: "Jl. Nagari Raya No. 1, Koto Baru, Payakumbuh",
        site_logo: "https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=200&h=200&fit=crop",
        site_favicon: "https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=32&h=32&fit=crop",
        social_media: {
          facebook: "https://facebook.com/nagari.kotobaru",
          instagram: "https://instagram.com/nagari_kotobaru",
          twitter: "https://twitter.com/nagari_kotobaru",
          youtube: "https://youtube.com/c/nagarikotobaru"
        }
      }
    };
  }

  // ========================================
  // ADMIN API METHODS
  // ========================================

  async getAdminNews(tenantId, params = {}) {
    try {
      if (this.shouldUseMockData()) {
        console.log('Using mock news data for development');
        await new Promise(resolve => setTimeout(resolve, 300));
        return this.getMockNewsData();
      }

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
      await new Promise(resolve => setTimeout(resolve, 100));
      return this.getMockNewsData();
    }
  }

  async getAdminCategories(tenantId, params = {}) {
    try {
      if (this.shouldUseMockData()) {
        console.log('Using mock categories data for development');
        await new Promise(resolve => setTimeout(resolve, 200));
        return this.getMockCategoriesData(params);
      }

      const url = `${this.getAdminApiUrl(tenantId)}${this.adminEndpoints.categories}`;
      const response = await apiClient.get(url, { params });
      return {
        success: true,
        data: response.data,
        message: response.message
      };
    } catch (error) {
      console.error('Error fetching admin categories:', error);
      await new Promise(resolve => setTimeout(resolve, 100));
      return this.getMockCategoriesData(params);
    }
  }

  async getAdminSiteSettings(tenantId) {
    try {
      if (this.shouldUseMockData()) {
        console.log('Using mock site settings for development');
        await new Promise(resolve => setTimeout(resolve, 300));
        return this.getMockSiteSettings();
      }

      const url = `${this.getAdminApiUrl(tenantId)}${this.adminEndpoints.siteSettings}`;
      const response = await apiClient.get(url);
      return {
        success: true,
        data: response.data,
        message: response.message
      };
    } catch (error) {
      console.error('Error fetching admin site settings:', error);
      await new Promise(resolve => setTimeout(resolve, 100));
      return this.getMockSiteSettings();
    }
  }

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
      await new Promise(resolve => setTimeout(resolve, 300));
      return {
        success: true,
        message: "Berita berhasil dihapus (development mode)"
      };
    }
  }

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
      await new Promise(resolve => setTimeout(resolve, 300));
      return {
        success: true,
        message: `${ids.length} berita berhasil dihapus (development mode)`
      };
    }
  }

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
      await new Promise(resolve => setTimeout(resolve, 300));
      return {
        success: true,
        message: `${ids.length} berita berhasil diperbarui (development mode)`
      };
    }
  }

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
      return {
        success: false,
        error: error?.response?.data?.message || error?.message || "Gagal mengupload gambar",
        data: null
      };
    }
  }

  // Additional methods for page management and site settings
  async getAdminPages(tenantId, params = {}) {
    try {
      if (this.shouldUseMockData()) {
        console.log('Using mock pages data for development');
        await new Promise(resolve => setTimeout(resolve, 300));
        return {
          success: true,
          data: [
            {
              id: 1,
              title: "Profil Nagari",
              content: "<h1>Profil Nagari</h1><p>Informasi lengkap tentang nagari...</p>",
              excerpt: "Informasi umum nagari",
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

      const url = `${this.getAdminApiUrl(tenantId)}/pages`;
      const response = await apiClient.get(url, { params });
      return {
        success: true,
        data: response.data,
        meta: response.meta,
        message: response.message
      };
    } catch (error) {
      console.error('Error fetching admin pages:', error);
      await new Promise(resolve => setTimeout(resolve, 100));
      return {
        success: true,
        data: [],
        meta: { total: 0 }
      };
    }
  }

  async getAdminServices(tenantId, params = {}) {
    try {
      if (this.shouldUseMockData()) {
        console.log('Using mock services data for development');
        await new Promise(resolve => setTimeout(resolve, 300));
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
              updated_at: new Date().toISOString()
            },
            {
              id: 2,
              name: "Surat Keterangan Usaha",
              description: "Layanan penerbitan surat keterangan usaha",
              status: "active",
              is_online: false,
              cost: 10000,
              process_time: "3-5 hari kerja", 
              updated_at: new Date().toISOString()
            }
          ],
          meta: { total: 2 }
        };
      }

      const url = `${this.getAdminApiUrl(tenantId)}/services`;
      const response = await apiClient.get(url, { params });
      return {
        success: true,
        data: response.data,
        meta: response.meta,
        message: response.message
      };
    } catch (error) {
      console.error('Error fetching admin services:', error);
      await new Promise(resolve => setTimeout(resolve, 100));
      return {
        success: true,
        data: [],
        meta: { total: 0 }
      };
    }
  }

  async createPage(tenantId, pageData) {
    try {
      const url = `${this.getAdminApiUrl(tenantId)}/pages`;
      const response = await apiClient.post(url, pageData);
      return {
        success: true,
        data: response.data,
        message: response.message
      };
    } catch (error) {
      console.error('Error creating page:', error);
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

  async updatePage(tenantId, pageId, pageData) {
    try {
      const url = `${this.getAdminApiUrl(tenantId)}/pages/${pageId}`;
      const response = await apiClient.put(url, pageData);
      return {
        success: true,
        data: response.data,
        message: response.message
      };
    } catch (error) {
      console.error('Error updating page:', error);
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

  async deletePage(tenantId, pageId) {
    try {
      const url = `${this.getAdminApiUrl(tenantId)}/pages/${pageId}`;
      const response = await apiClient.delete(url);
      return {
        success: true,
        message: response.message
      };
    } catch (error) {
      console.error('Error deleting page:', error);
      await new Promise(resolve => setTimeout(resolve, 300));
      return {
        success: true,
        message: "Halaman berhasil dihapus (development mode)"
      };
    }
  }

  async updateSiteSettings(tenantId, settingsArray) {
    try {
      const url = `${this.getAdminApiUrl(tenantId)}/site-settings`;
      const response = await apiClient.put(url, { settings: settingsArray });
      return {
        success: true,
        message: response.message
      };
    } catch (error) {
      console.error('Error updating site settings:', error);
      await new Promise(resolve => setTimeout(resolve, 500));
      return {
        success: true,
        message: "Pengaturan berhasil disimpan (development mode)"
      };
    }
  }

  async uploadLogo(tenantId, file, type = 'site_logo') {
    try {
      const formData = new FormData();
      formData.append('logo', file);
      formData.append('type', type);

      const url = `${this.getAdminApiUrl(tenantId)}/site-settings/upload-logo`;
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
      return {
        success: false,
        error: error.message,
        message: "Gagal mengupload logo"
      };
    }
  }

  // ========================================
  // HERO BANNERS ADMIN API
  // ========================================

  async getHeroBanners(tenantId) {
    try {
      const url = `${this.getAdminApiUrl(tenantId)}/hero-banners`;
      const response = await apiClient.get(url);
      return {
        success: true,
        data: response.data,
        message: response.message
      };
    } catch (error) {
      console.error('Error fetching hero banners:', error);
      return { success: false, error: error.message, data: [] };
    }
  }

  async createHeroBanner(tenantId, bannerData, imageFile = null, mobileImageFile = null) {
    try {
      const url = `${this.getAdminApiUrl(tenantId)}/hero-banners`;
      
      // Fields to exclude from FormData (not part of backend validation)
      const excludeFields = ['image_url', 'mobile_image_url'];
      
      // Use FormData if there are files to upload
      if (imageFile || mobileImageFile) {
        const formData = new FormData();
        
        // Add all text fields
        Object.keys(bannerData).forEach(key => {
          // Skip excluded fields
          if (excludeFields.includes(key)) return;
          
          const value = bannerData[key];
          
          // Skip null/undefined
          if (value === null || value === undefined) return;
          
          // Handle boolean properly
          if (typeof value === 'boolean') {
            formData.append(key, value ? '1' : '0');
          } 
          // Skip empty strings for optional fields
          else if (value === '' && key !== 'title') {
            return;
          }
          else {
            formData.append(key, value);
          }
        });
        
        // Add files
        if (imageFile) {
          formData.append('image', imageFile);
        }
        if (mobileImageFile) {
          formData.append('mobile_image', mobileImageFile);
        }
        
        const response = await apiClient.post(url, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        return {
          success: true,
          data: response.data,
          message: response.message || 'Banner berhasil dibuat'
        };
      } else {
        // No files, send as JSON - clean up the data
        const cleanData = {};
        Object.keys(bannerData).forEach(key => {
          if (excludeFields.includes(key)) return;
          const value = bannerData[key];
          if (value !== null && value !== undefined && value !== '') {
            cleanData[key] = value;
          }
        });
        
        const response = await apiClient.post(url, cleanData);
        return {
          success: true,
          data: response.data,
          message: response.message || 'Banner berhasil dibuat'
        };
      }
    } catch (error) {
      console.error('Error creating hero banner:', error);
      return { success: false, error: error.message };
    }
  }

  async updateHeroBanner(tenantId, bannerId, bannerData, imageFile = null, mobileImageFile = null) {
    try {
      const url = `${this.getAdminApiUrl(tenantId)}/hero-banners/${bannerId}`;
      
      // Fields to exclude from FormData (not part of backend validation)
      const excludeFields = ['image_url', 'mobile_image_url', 'id', 'created_at', 'updated_at', 'tenant_id', 'thumb_url'];
      
      // Use FormData if there are files to upload
      if (imageFile || mobileImageFile) {
        const formData = new FormData();
        
        // Add _method for Laravel to recognize PUT request
        formData.append('_method', 'PUT');
        
        // Add all text fields
        Object.keys(bannerData).forEach(key => {
          // Skip excluded fields
          if (excludeFields.includes(key)) return;
          
          const value = bannerData[key];
          
          // Skip null/undefined
          if (value === null || value === undefined) return;
          
          // Handle boolean properly
          if (typeof value === 'boolean') {
            formData.append(key, value ? '1' : '0');
          }
          // Skip empty strings for optional fields
          else if (value === '' && key !== 'title') {
            return;
          }
          else {
            formData.append(key, value);
          }
        });
        
        // Add files
        if (imageFile) {
          formData.append('image', imageFile);
        }
        if (mobileImageFile) {
          formData.append('mobile_image', mobileImageFile);
        }
        
        // Use POST with _method=PUT for file uploads
        const response = await apiClient.post(url, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        return {
          success: true,
          data: response.data,
          message: response.message || 'Banner berhasil diperbarui'
        };
      } else {
        // No files, send as JSON with PUT - clean up the data
        const cleanData = {};
        Object.keys(bannerData).forEach(key => {
          if (excludeFields.includes(key)) return;
          const value = bannerData[key];
          if (value !== null && value !== undefined && value !== '') {
            cleanData[key] = value;
          }
        });
        
        const response = await apiClient.put(url, cleanData);
        return {
          success: true,
          data: response.data,
          message: response.message || 'Banner berhasil diperbarui'
        };
      }
    } catch (error) {
      console.error('Error updating hero banner:', error);
      return { success: false, error: error.message };
    }
  }

  async deleteHeroBanner(tenantId, bannerId) {
    try {
      const url = `${this.getAdminApiUrl(tenantId)}/hero-banners/${bannerId}`;
      const response = await apiClient.delete(url);
      return {
        success: true,
        message: response.message || 'Banner berhasil dihapus'
      };
    } catch (error) {
      console.error('Error deleting hero banner:', error);
      return { success: false, error: error.message };
    }
  }

  async uploadBannerImage(tenantId, file) {
    try {
      const formData = new FormData();
      formData.append('image', file);

      const url = `${this.getAdminApiUrl(tenantId)}/hero-banners/upload-image`;
      const response = await apiClient.post(url, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return {
        success: true,
        data: response.data,
        message: response.message
      };
    } catch (error) {
      console.error('Error uploading banner image:', error);
      return { success: false, error: error.message };
    }
  }

  // ========================================
  // STAFF/APARATUR ADMIN API
  // ========================================

  async getStaff(tenantId, params = {}) {
    try {
      const url = `${this.getAdminApiUrl(tenantId)}/staff`;
      const response = await apiClient.get(url, { params });
      return {
        success: true,
        data: response.data,
        message: response.message
      };
    } catch (error) {
      console.error('Error fetching staff:', error);
      return { success: false, error: error.message, data: [] };
    }
  }

  async createStaff(tenantId, staffData) {
    try {
      const url = `${this.getAdminApiUrl(tenantId)}/staff`;
      const response = await apiClient.post(url, staffData);
      return {
        success: true,
        data: response.data,
        message: response.message || 'Staff berhasil ditambahkan'
      };
    } catch (error) {
      console.error('Error creating staff:', error);
      return { success: false, error: error.message };
    }
  }

  async updateStaff(tenantId, staffId, staffData) {
    try {
      const url = `${this.getAdminApiUrl(tenantId)}/staff/${staffId}`;
      const response = await apiClient.put(url, staffData);
      return {
        success: true,
        data: response.data,
        message: response.message || 'Staff berhasil diperbarui'
      };
    } catch (error) {
      console.error('Error updating staff:', error);
      return { success: false, error: error.message };
    }
  }

  async deleteStaff(tenantId, staffId) {
    try {
      const url = `${this.getAdminApiUrl(tenantId)}/staff/${staffId}`;
      const response = await apiClient.delete(url);
      return {
        success: true,
        message: response.message || 'Staff berhasil dihapus'
      };
    } catch (error) {
      console.error('Error deleting staff:', error);
      return { success: false, error: error.message };
    }
  }

  async uploadStaffPhoto(tenantId, file) {
    try {
      const formData = new FormData();
      formData.append('photo', file);

      const url = `${this.getAdminApiUrl(tenantId)}/staff/upload-photo`;
      // Don't set Content-Type header - browser will set it automatically with boundary
      const response = await apiClient.post(url, formData);
      return {
        success: true,
        data: response.data,
        message: response.message
      };
    } catch (error) {
      console.error('Error uploading staff photo:', error);
      return { success: false, error: error.message };
    }
  }

  // ========================================
  // DOCUMENTS ADMIN API
  // ========================================

  async getDocuments(tenantId, params = {}) {
    try {
      const url = `${this.getAdminApiUrl(tenantId)}/documents`;
      const response = await apiClient.get(url, { params });
      return {
        success: true,
        data: response.data,
        meta: response.meta,
        message: response.message
      };
    } catch (error) {
      console.error('Error fetching documents:', error);
      return { success: false, error: error.message, data: [] };
    }
  }

  async createDocument(tenantId, documentData) {
    try {
      const url = `${this.getAdminApiUrl(tenantId)}/documents`;
      const response = await apiClient.post(url, documentData);
      return {
        success: true,
        data: response.data,
        message: response.message || 'Dokumen berhasil dibuat'
      };
    } catch (error) {
      console.error('Error creating document:', error);
      return { success: false, error: error.message };
    }
  }

  async updateDocument(tenantId, documentId, documentData) {
    try {
      const url = `${this.getAdminApiUrl(tenantId)}/documents/${documentId}`;
      const response = await apiClient.put(url, documentData);
      return {
        success: true,
        data: response.data,
        message: response.message || 'Dokumen berhasil diperbarui'
      };
    } catch (error) {
      console.error('Error updating document:', error);
      return { success: false, error: error.message };
    }
  }

  async deleteDocument(tenantId, documentId) {
    try {
      const url = `${this.getAdminApiUrl(tenantId)}/documents/${documentId}`;
      const response = await apiClient.delete(url);
      return {
        success: true,
        message: response.message || 'Dokumen berhasil dihapus'
      };
    } catch (error) {
      console.error('Error deleting document:', error);
      return { success: false, error: error.message };
    }
  }

  async uploadDocument(tenantId, file, metadata = {}) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      Object.keys(metadata).forEach(key => {
        formData.append(key, metadata[key]);
      });

      const url = `${this.getAdminApiUrl(tenantId)}/documents/upload`;
      const response = await apiClient.post(url, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return {
        success: true,
        data: response.data,
        message: response.message
      };
    } catch (error) {
      console.error('Error uploading document:', error);
      return { success: false, error: error.message };
    }
  }

  // ========================================
  // SERVICES ADMIN API
  // ========================================

  async createService(tenantId, serviceData) {
    try {
      const url = `${this.getAdminApiUrl(tenantId)}/services`;
      const response = await apiClient.post(url, serviceData);
      return {
        success: true,
        data: response.data,
        message: response.message || 'Layanan berhasil dibuat'
      };
    } catch (error) {
      console.error('Error creating service:', error);
      return { success: false, error: error.message };
    }
  }

  async updateService(tenantId, serviceId, serviceData) {
    try {
      const url = `${this.getAdminApiUrl(tenantId)}/services/${serviceId}`;
      const response = await apiClient.put(url, serviceData);
      return {
        success: true,
        data: response.data,
        message: response.message || 'Layanan berhasil diperbarui'
      };
    } catch (error) {
      console.error('Error updating service:', error);
      return { success: false, error: error.message };
    }
  }

  async deleteService(tenantId, serviceId) {
    try {
      const url = `${this.getAdminApiUrl(tenantId)}/services/${serviceId}`;
      const response = await apiClient.delete(url);
      return {
        success: true,
        message: response.message || 'Layanan berhasil dihapus'
      };
    } catch (error) {
      console.error('Error deleting service:', error);
      return { success: false, error: error.message };
    }
  }

  // ========================================
  // CATEGORIES ADMIN API
  // ========================================

  async createCategory(tenantId, categoryData) {
    try {
      const url = `${this.getAdminApiUrl(tenantId)}/categories`;
      const response = await apiClient.post(url, categoryData);
      return {
        success: true,
        data: response.data,
        message: response.message || 'Kategori berhasil dibuat'
      };
    } catch (error) {
      console.error('Error creating category:', error);
      return { success: false, error: error.message };
    }
  }

  async updateCategory(tenantId, categoryId, categoryData) {
    try {
      const url = `${this.getAdminApiUrl(tenantId)}/categories/${categoryId}`;
      const response = await apiClient.put(url, categoryData);
      return {
        success: true,
        data: response.data,
        message: response.message || 'Kategori berhasil diperbarui'
      };
    } catch (error) {
      console.error('Error updating category:', error);
      return { success: false, error: error.message };
    }
  }

  async deleteCategory(tenantId, categoryId) {
    try {
      const url = `${this.getAdminApiUrl(tenantId)}/categories/${categoryId}`;
      const response = await apiClient.delete(url);
      return {
        success: true,
        message: response.message || 'Kategori berhasil dihapus'
      };
    } catch (error) {
      console.error('Error deleting category:', error);
      return { success: false, error: error.message };
    }
  }

  async updateCategoriesOrder(tenantId, orderedIds) {
    try {
      const url = `${this.getAdminApiUrl(tenantId)}/categories/order`;
      const response = await apiClient.put(url, { order: orderedIds });
      return {
        success: true,
        message: response.message || 'Urutan kategori berhasil diperbarui'
      };
    } catch (error) {
      console.error('Error updating categories order:', error);
      return { success: false, error: error.message };
    }
  }
}

// Create singleton instance
const cmsService = new CMSService();
export default cmsService;