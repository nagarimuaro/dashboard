# 📚 Dokumentasi Lengkap CMS API Dashboard

## Overview

Dokumentasi ini menjelaskan integrasi antara Dashboard Admin dengan Backend API untuk mengelola konten website secara dinamis.

**Tanggal Update**: 21 Desember 2025  
**Backend Base URL**: `https://cilandak.sintanagari.cloud/api`  
**Dashboard**: `/var/www/dashboard`  
**Backend**: `/var/www/backend`

---

## 🔐 Autentikasi

### Login
```
POST /login
Content-Type: application/json

{
  "email": "admin@nagari.id",
  "password": "password"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": { "id": 1, "nama": "Admin", "email": "admin@nagari.id" },
    "token": "1|abcdef123456...",
    "tenant": { "id": 1, "name": "Cilandak" }
  }
}
```

### Header Authorization
Semua endpoint admin memerlukan Bearer Token:
```
Authorization: Bearer {token}
```

---

## 📡 CMS Public API (Tanpa Auth)

Endpoint publik untuk frontend website. Hanya perlu tenant resolution via subdomain.

### Site Settings
```
GET /cms/public/site-settings

Response:
{
  "success": true,
  "data": {
    "site_name": "Nagari Sungai Pinang",
    "site_tagline": "Portal Resmi Nagari",
    "site_description": "...",
    "site_logo": "https://...",
    "contact_address": "Jl. Raya Nagari No. 1",
    "contact_phone": "0751123456",
    "contact_email": "info@nagari.id",
    "contact_whatsapp": "6281234567890",
    "social_facebook": "https://facebook.com/...",
    "social_instagram": "https://instagram.com/...",
    "social_youtube": "https://youtube.com/...",
    "social_twitter": "https://twitter.com/..."
  }
}
```

### Hero Banners
```
GET /cms/public/hero-banners

Response:
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "Selamat Datang di Portal Nagari",
      "subtitle": "Membangun Nagari Yang Maju",
      "description": "Portal resmi menyediakan...",
      "image_url": "https://.../banner.png",
      "button_text": "Pelajari Lebih Lanjut",
      "button_url": "/profil",
      "overlay_color": "rgba(0,0,0,0.4)",
      "text_position": "center",
      "text_align": "center",
      "is_active": true,
      "sort_order": 1
    }
  ]
}
```

### News/Berita
```
GET /cms/public/news
GET /cms/public/news?category=pengumuman
GET /cms/public/news?featured=true
GET /cms/public/news?search=pembangunan
GET /cms/public/news?per_page=10

Response:
{
  "success": true,
  "data": [...],
  "meta": {
    "current_page": 1,
    "total": 25,
    "per_page": 10,
    "last_page": 3
  }
}
```

### News Detail
```
GET /cms/public/news/{slug}
```

### Staff/Aparatur
```
GET /cms/public/staff

Response:
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "H. Ahmad",
      "position": "Wali Nagari",
      "department": "Pemerintahan",
      "photo_url": "https://.../photo.jpg",
      "is_leadership": true,
      "sort_order": 1
    }
  ]
}
```

### Services/Layanan
```
GET /cms/public/services
```

### Documents
```
GET /cms/public/documents
GET /cms/public/documents?type=peraturan
GET /cms/public/documents?category=apbd
GET /cms/public/documents/{slug}/download
```

### Categories
```
GET /cms/public/categories
GET /cms/public/categories?type=news
```

### Kata Sambutan
```
GET /cms/public/kata-sambutan
```

### Pages
```
GET /cms/public/pages/{slug}
```

---

## 🔧 CMS Admin API (Memerlukan Auth)

Semua endpoint admin menggunakan format:
```
/cms/admin/tenant/{tenantId}/...
```

### Mendapatkan Tenant ID
```javascript
// Di frontend, ambil dari localStorage setelah login
const tenant = JSON.parse(localStorage.getItem('current_tenant'));
const tenantId = tenant?.id || 1;
```

---

## 📰 News Management

### List News
```
GET /cms/admin/tenant/{tenantId}/news
GET /cms/admin/tenant/{tenantId}/news?status=published
GET /cms/admin/tenant/{tenantId}/news?category=pengumuman
GET /cms/admin/tenant/{tenantId}/news?search=keyword
GET /cms/admin/tenant/{tenantId}/news?per_page=15
```

### Create News
```
POST /cms/admin/tenant/{tenantId}/news
Content-Type: multipart/form-data

{
  "title": "Judul Berita",
  "slug": "judul-berita",          // Optional, auto-generate
  "excerpt": "Ringkasan berita...",
  "content": "<p>Isi berita lengkap...</p>",
  "category_id": 1,
  "status": "published",           // draft, published, archived
  "is_featured": false,
  "tags": ["tag1", "tag2"],
  "published_at": "2025-12-21",
  "featured_image": [File]         // Optional
}

Response:
{
  "success": true,
  "data": { ...created_news },
  "message": "News created successfully"
}
```

### Update News
```
PUT /cms/admin/tenant/{tenantId}/news/{id}
Content-Type: multipart/form-data

{
  "title": "Judul Berita Update",
  ...
}
```

### Delete News
```
DELETE /cms/admin/tenant/{tenantId}/news/{id}
```

### Bulk Operations
```
POST /cms/admin/tenant/{tenantId}/news/bulk-delete
{
  "ids": [1, 2, 3]
}

PUT /cms/admin/tenant/{tenantId}/news/bulk-status
{
  "ids": [1, 2, 3],
  "status": "archived"
}
```

---

## 🖼️ Hero Banners Management

### List Banners
```
GET /cms/admin/tenant/{tenantId}/hero-banners
GET /cms/admin/tenant/{tenantId}/hero-banners?is_active=true
```

### Create Banner
```
POST /cms/admin/tenant/{tenantId}/hero-banners
Content-Type: multipart/form-data

{
  "title": "Selamat Datang",
  "subtitle": "Di Portal Nagari",
  "description": "Deskripsi lengkap...",
  "button_text": "Pelajari",
  "button_url": "/profil",
  "button_target": "_self",         // _self, _blank
  "overlay_color": "rgba(0,0,0,0.4)",
  "text_position": "center",        // left, center, right
  "text_align": "center",           // left, center, right
  "is_active": true,
  "sort_order": 1,
  "start_date": "2025-01-01",       // Optional
  "end_date": "2025-12-31",         // Optional
  "image": [File],                  // Max 5MB
  "mobile_image": [File]            // Optional, Max 5MB
}
```

### Update Banner
```
PUT /cms/admin/tenant/{tenantId}/hero-banners/{id}
```

### Delete Banner
```
DELETE /cms/admin/tenant/{tenantId}/hero-banners/{id}
```

### Update Order
```
PUT /cms/admin/tenant/{tenantId}/hero-banners/order
{
  "order": [3, 1, 2]  // Array of IDs in desired order
}
```

### Upload Image
```
POST /cms/admin/tenant/{tenantId}/hero-banners/upload-image
Content-Type: multipart/form-data

{
  "image": [File],
  "banner_id": 1,          // Optional
  "type": "image"          // image atau mobile_image
}

Response:
{
  "success": true,
  "data": {
    "url": "https://.../image.jpg",
    "filename": "banner.jpg",
    "size": 245760
  }
}
```

---

## 👥 Staff Management

### List Staff
```
GET /cms/admin/tenant/{tenantId}/staff
GET /cms/admin/tenant/{tenantId}/staff?status=active
GET /cms/admin/tenant/{tenantId}/staff?department=Pemerintahan
GET /cms/admin/tenant/{tenantId}/staff?is_leadership=true
GET /cms/admin/tenant/{tenantId}/staff?search=ahmad
```

### Get Departments
```
GET /cms/admin/tenant/{tenantId}/staff-departments

Response:
{
  "success": true,
  "data": ["Pemerintahan", "Kesejahteraan", "Pembangunan"]
}
```

### Create Staff
```
POST /cms/admin/tenant/{tenantId}/staff
Content-Type: multipart/form-data

{
  "name": "H. Ahmad",
  "position": "Wali Nagari",
  "department": "Pemerintahan",
  "description": "Biografi singkat...",
  "phone": "081234567890",
  "email": "ahmad@nagari.id",
  "whatsapp": "6281234567890",
  "social_media_links": {
    "facebook": "https://facebook.com/ahmad",
    "instagram": "https://instagram.com/ahmad"
  },
  "is_leadership": true,
  "status": "active",              // active, inactive
  "sort_order": 1,
  "start_date": "2020-01-01",
  "end_date": null,
  "photo": [File]                  // Max 2MB
}
```

### Update Staff
```
PUT /cms/admin/tenant/{tenantId}/staff/{id}
```

### Delete Staff
```
DELETE /cms/admin/tenant/{tenantId}/staff/{id}
```

### Update Order
```
PUT /cms/admin/tenant/{tenantId}/staff/order
{
  "order": [1, 3, 2]
}
```

### Upload Photo
```
POST /cms/admin/tenant/{tenantId}/staff/upload-photo
Content-Type: multipart/form-data

{
  "photo": [File],
  "staff_id": 1          // Optional
}
```

---

## 📄 Documents Management

### List Documents
```
GET /cms/admin/tenant/{tenantId}/documents
GET /cms/admin/tenant/{tenantId}/documents?status=active
GET /cms/admin/tenant/{tenantId}/documents?document_type=peraturan
GET /cms/admin/tenant/{tenantId}/documents?category_id=1
GET /cms/admin/tenant/{tenantId}/documents?year=2025
GET /cms/admin/tenant/{tenantId}/documents?is_public=true
GET /cms/admin/tenant/{tenantId}/documents?search=apbd
```

### Get Document Types
```
GET /cms/admin/tenant/{tenantId}/document-types

Response:
{
  "success": true,
  "data": ["peraturan", "laporan", "sk", "pengumuman"]
}
```

### Get Years
```
GET /cms/admin/tenant/{tenantId}/document-years

Response:
{
  "success": true,
  "data": [2025, 2024, 2023]
}
```

### Create Document
```
POST /cms/admin/tenant/{tenantId}/documents
Content-Type: multipart/form-data

{
  "title": "Peraturan Nagari No. 1 Tahun 2025",
  "slug": "pernag-1-2025",         // Optional, auto-generate
  "description": "Tentang...",
  "category_id": 1,
  "document_type": "peraturan",
  "year": 2025,
  "status": "active",              // active, inactive, archived
  "is_public": true,
  "file": [File]                   // Required, max 10MB, pdf/doc/docx/xls/xlsx
}
```

### Update Document
```
PUT /cms/admin/tenant/{tenantId}/documents/{id}
```

### Delete Document
```
DELETE /cms/admin/tenant/{tenantId}/documents/{id}
```

### Upload Document (Quick Upload)
```
POST /cms/admin/tenant/{tenantId}/documents/upload
Content-Type: multipart/form-data

{
  "file": [File],
  "title": "Dokumen Baru",         // Optional, use filename
  "description": "...",            // Optional
  "document_type": "laporan",      // Optional
  "category_id": 1                 // Optional
}
```

### Download Document
```
GET /cms/admin/tenant/{tenantId}/documents/{id}/download
```

---

## 🏷️ Categories Management

### List Categories
```
GET /cms/admin/tenant/{tenantId}/categories
GET /cms/admin/tenant/{tenantId}/categories?type=news
```

### Create Category
```
POST /cms/admin/tenant/{tenantId}/categories
{
  "name": "Pengumuman",
  "slug": "pengumuman",            // Optional
  "description": "Kategori untuk pengumuman",
  "type": "news",                  // news, document, service
  "color": "#EF4444",
  "icon": "heroicon-o-megaphone",
  "is_active": true
}
```

### Update Category
```
PUT /cms/admin/tenant/{tenantId}/categories/{id}
```

### Delete Category
```
DELETE /cms/admin/tenant/{tenantId}/categories/{id}
```

### Update Order
```
PUT /cms/admin/tenant/{tenantId}/categories/order
{
  "order": [1, 3, 2]
}
```

---

## 📝 Pages Management

### List Pages
```
GET /cms/admin/tenant/{tenantId}/pages
```

### Create Page
```
POST /cms/admin/tenant/{tenantId}/pages
{
  "title": "Visi dan Misi",
  "slug": "visi-misi",
  "content": "<h1>Visi</h1><p>...</p>",
  "excerpt": "Halaman visi dan misi nagari",
  "status": "published",
  "page_template": "default",
  "show_in_menu": true,
  "menu_title": "Visi Misi",
  "menu_order": 1
}
```

### Update Page
```
PUT /cms/admin/tenant/{tenantId}/pages/{id}
```

### Delete Page
```
DELETE /cms/admin/tenant/{tenantId}/pages/{id}
```

---

## 🎨 Services Management

### List Services
```
GET /cms/admin/tenant/{tenantId}/services
```

### Create Service
```
POST /cms/admin/tenant/{tenantId}/services
{
  "name": "Surat Keterangan Domisili",
  "slug": "surat-domisili",
  "description": "Layanan pembuatan surat keterangan domisili",
  "requirements": ["KTP", "KK", "Surat Pengantar RT"],
  "process_time": "1-2 hari kerja",
  "cost": 0,
  "is_online": true,
  "status": "active",
  "icon": "heroicon-o-document",
  "sort_order": 1
}
```

### Update Service
```
PUT /cms/admin/tenant/{tenantId}/services/{id}
```

### Delete Service
```
DELETE /cms/admin/tenant/{tenantId}/services/{id}
```

### Update Order
```
PUT /cms/admin/tenant/{tenantId}/services/order
{
  "order": [1, 3, 2]
}
```

---

## ⚙️ Site Settings Management

### Get All Settings
```
GET /cms/admin/tenant/{tenantId}/site-settings

Response:
{
  "success": true,
  "data": {
    "site_name": "Nagari Sungai Pinang",
    "site_tagline": "Portal Resmi",
    "site_description": "...",
    "site_logo": "https://.../logo.png",
    "site_favicon": "https://.../favicon.ico",
    "contact_address": "...",
    "contact_phone": "...",
    "contact_email": "...",
    "contact_whatsapp": "...",
    "social_facebook": "...",
    "social_instagram": "...",
    "social_youtube": "...",
    "social_twitter": "...",
    "social_tiktok": "...",
    "seo_meta_title": "...",
    "seo_meta_description": "...",
    "seo_keywords": "..."
  }
}
```

### Update All Settings
```
PUT /cms/admin/tenant/{tenantId}/site-settings
{
  "settings": [
    { "key": "site_name", "value": "Nagari Baru" },
    { "key": "contact_phone", "value": "0751999999" }
  ]
}
```

### Update Single Setting
```
PUT /cms/admin/tenant/{tenantId}/site-settings/{key}
{
  "value": "New Value"
}
```

### Upload Logo
```
POST /cms/admin/tenant/{tenantId}/site-settings/upload-logo
Content-Type: multipart/form-data

{
  "logo": [File],
  "type": "site_logo"      // site_logo atau site_favicon
}

Response:
{
  "success": true,
  "data": {
    "url": "https://.../logo.png",
    "filename": "logo.png",
    "size": 51200
  }
}
```

---

## 🔄 Menggunakan Service di Dashboard

### Import Service
```javascript
import cmsService from '../services/cmsService-fixed';
```

### Contoh Penggunaan

#### Get Data
```javascript
const tenantId = JSON.parse(localStorage.getItem('current_tenant'))?.id || 1;

// Get hero banners
const result = await cmsService.getHeroBanners(tenantId);
if (result.success) {
  console.log(result.data);
}

// Get news with filters
const newsResult = await cmsService.getAdminNews(tenantId, {
  status: 'published',
  per_page: 10
});

// Get staff
const staffResult = await cmsService.getStaff(tenantId, {
  is_leadership: true
});
```

#### Create Data
```javascript
// Create banner
const bannerResult = await cmsService.createHeroBanner(tenantId, {
  title: 'Banner Baru',
  subtitle: 'Subtitle',
  is_active: true
});

// Create news
const newsResult = await cmsService.createNews(tenantId, {
  title: 'Berita Baru',
  excerpt: 'Ringkasan...',
  content: '<p>Isi berita...</p>',
  status: 'draft'
});
```

#### Update Data
```javascript
// Update banner
await cmsService.updateHeroBanner(tenantId, bannerId, {
  title: 'Judul Baru'
});

// Update staff
await cmsService.updateStaff(tenantId, staffId, {
  position: 'Jabatan Baru'
});
```

#### Delete Data
```javascript
await cmsService.deleteHeroBanner(tenantId, bannerId);
await cmsService.deleteNews(tenantId, newsId);
await cmsService.deleteStaff(tenantId, staffId);
```

#### Upload Files
```javascript
// Upload banner image
const file = document.getElementById('imageInput').files[0];
const uploadResult = await cmsService.uploadBannerImage(tenantId, file);

// Upload staff photo
const photoResult = await cmsService.uploadStaffPhoto(tenantId, photoFile);

// Upload document
const docResult = await cmsService.uploadDocument(tenantId, docFile, {
  title: 'Dokumen Baru',
  document_type: 'laporan'
});
```

---

## 🚨 Error Handling

### Standard Error Response
```json
{
  "success": false,
  "message": "Validation error",
  "errors": {
    "title": ["The title field is required."],
    "file": ["The file must be a PDF or DOC file."]
  }
}
```

### HTTP Status Codes
| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthenticated |
| 403 | Forbidden |
| 404 | Not Found |
| 422 | Validation Error |
| 500 | Server Error |

### Handling di Frontend
```javascript
const result = await cmsService.createNews(tenantId, data);

if (!result.success) {
  if (result.errors) {
    // Validation errors
    Object.keys(result.errors).forEach(field => {
      toast.error(result.errors[field][0]);
    });
  } else {
    toast.error(result.error || 'Terjadi kesalahan');
  }
  return;
}

toast.success(result.message || 'Berhasil!');
```

---

## 📁 File Structure

```
dashboard/src/
├── config/
│   └── api.js              # API endpoints configuration
├── services/
│   ├── apiClient.js        # HTTP client with auth
│   ├── cmsService-fixed.js # CMS API service
│   └── index.js            # Service exports
├── components/
│   ├── cms-settings.tsx    # Site settings UI
│   ├── cms-news.tsx        # News management UI
│   ├── cms-categories.tsx  # Categories UI
│   ├── cms-services.tsx    # Services UI
│   ├── cms-pages.tsx       # Pages UI
│   └── cms-staff.tsx       # Staff UI
└── context/
    └── AuthContext.tsx     # Authentication context

backend/app/Http/Controllers/Api/Admin/
├── SiteSettingsController.php
├── CmsNewsController.php
├── CmsPagesController.php
├── CmsServicesController.php
├── CmsCategoriesController.php
├── CmsHeroBannerController.php   # NEW
├── CmsStaffController.php        # NEW
└── CmsDocumentController.php     # NEW
```

---

## ✅ Checklist Integrasi

| Feature | Public API | Admin API | Dashboard UI |
|---------|------------|-----------|--------------|
| Site Settings | ✅ | ✅ | ✅ |
| Hero Banners | ✅ | ✅ | 🔄 |
| News | ✅ | ✅ | ✅ |
| Staff | ✅ | ✅ | ✅ |
| Services | ✅ | ✅ | ✅ |
| Documents | ✅ | ✅ | 🔄 |
| Categories | ✅ | ✅ | ✅ |
| Pages | ✅ | ✅ | ✅ |

Keterangan:
- ✅ = Selesai
- 🔄 = API Ready, UI perlu dibuat/update

---

## 🔗 Quick Reference

### Base URLs
```
Production API: https://cilandak.sintanagari.cloud/api
Dashboard: https://cilandak.sintanagari.cloud/dashboard
Frontend: https://nagarimuaro.id
```

### Tenant Resolution
Backend otomatis resolve tenant dari:
1. Subdomain: `cilandak.sintanagari.cloud` → tenant: cilandak
2. Header: `X-Tenant-Domain: cilandak`

### File Limits
| Type | Max Size |
|------|----------|
| Images (banner, photo) | 5 MB |
| Staff Photo | 2 MB |
| Documents (PDF, DOC) | 10 MB |
| Logo/Favicon | 2 MB |

### Supported File Types
- **Images**: jpeg, png, webp
- **Documents**: pdf, doc, docx, xls, xlsx

---

*Dokumentasi ini dibuat pada 21 Desember 2025*
