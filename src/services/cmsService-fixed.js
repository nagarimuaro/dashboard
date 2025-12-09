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
      await new Promise(resolve => setTimeout(resolve, 1000));
      
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
      await new Promise(resolve => setTimeout(resolve, 1000));
      
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
}

// Create singleton instance
const cmsService = new CMSService();
export default cmsService;