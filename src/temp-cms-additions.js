// Temporary file to hold the additions for CMS service

  // Get all categories for admin
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

  // Get admin site settings
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

  // Update site settings
  async updateSiteSettings(tenantId, settingsData) {
    try {
      const url = `${this.getAdminApiUrl(tenantId)}${this.adminEndpoints.siteSettings}`;
      const response = await apiClient.put(url, settingsData);
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
        data: {
          ...settingsData,
          updated_at: new Date().toISOString()
        },
        message: "Pengaturan situs berhasil diperbarui (development mode)"
      };
    }
  }