import React, { useState, useEffect } from "react"
import { 
  Settings,
  Upload,
  Save,
  Image,
  Globe,
  Phone,
  Mail,
  MapPin,
  Facebook,
  Instagram,
  Youtube,
  Twitter,
  Search,
  Eye,
  Monitor,
  Smartphone,
  Upload as UploadIcon,
  FileText,
  Plus,
  Edit,
  Trash2,
  MoreVertical,
  ChevronLeft
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Textarea } from "./ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs"
import { Switch } from "./ui/switch"
import { Badge } from "./ui/badge"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "./ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog"
import { toast } from "sonner"
import cmsService from "../services/cmsService-fixed"

interface CMSSettingsProps {
  userRole: string
  onModuleChange: (module: string) => void
}

export function CMSSettings({ userRole, onModuleChange }: CMSSettingsProps) {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [settings, setSettings] = useState({
    // General Settings
    site_name: "",
    site_tagline: "",
    site_description: "",
    site_logo: "",
    site_favicon: "",
    
    // Contact Information
    contact_address: "",
    contact_phone: "",
    contact_email: "",
    contact_whatsapp: "",
    
    // Social Media
    social_facebook: "",
    social_instagram: "",
    social_youtube: "",
    social_twitter: "",
    social_tiktok: "",
    
    // SEO Settings
    seo_meta_title: "",
    seo_meta_description: "",
    seo_keywords: "",
    google_analytics_id: "",
    google_search_console: ""
  })

  // Page Management State
  const [pages, setPages] = useState([])
  const [pagesLoading, setPagesLoading] = useState(true)
  const [showPageForm, setShowPageForm] = useState(false)
  const [editingPage, setEditingPage] = useState(null)
  const [pageFormData, setPageFormData] = useState({
    title: "",
    content: "",
    excerpt: "",
    status: "draft",
    show_in_menu: false,
    menu_title: "",
    page_template: "",
    seo_title: "",
    seo_description: "",
    seo_keywords: ""
  })
  const [deletePageDialogOpen, setDeletePageDialogOpen] = useState(false)
  const [pageToDelete, setPageToDelete] = useState(null)

  // Mock tenant ID
  const tenantId = 1

  useEffect(() => {
    fetchSettings()
    fetchPages()
  }, [])

  const fetchSettings = async () => {
    setLoading(true)
    try {
      const response = await cmsService.getAdminSiteSettings(tenantId)
      if (response.success) {
        // Convert array of settings to object
        const settingsObj = {}
        if (Array.isArray(response.data)) {
          response.data.forEach(setting => {
            settingsObj[setting.key] = setting.value || ""
          })
        } else if (typeof response.data === 'object') {
          Object.assign(settingsObj, response.data)
        }
        
        setSettings(prevSettings => ({
          ...prevSettings,
          ...settingsObj
        }))
      } else {
        toast.error("Gagal memuat pengaturan")
      }
    } catch (error) {
      console.error('Error fetching settings:', error)
      toast.error("Terjadi kesalahan saat memuat pengaturan")
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (key: string, value: string) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const handleSaveSettings = async (settingsGroup: string[]) => {
    setSaving(true)
    try {
      // Prepare settings array for API
      const settingsToUpdate = settingsGroup.map(key => ({
        key,
        value: settings[key] || ""
      }))

      const response = await cmsService.updateSiteSettings(tenantId, settingsToUpdate)
      if (response.success) {
        toast.success("Pengaturan berhasil disimpan")
      } else {
        toast.error(response.error || "Gagal menyimpan pengaturan")
      }
    } catch (error) {
      console.error('Error saving settings:', error)
      toast.error("Terjadi kesalahan saat menyimpan pengaturan")
    } finally {
      setSaving(false)
    }
  }

  const handleLogoUpload = async (file: File, type: 'site_logo' | 'site_favicon') => {
    if (!file) return

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      toast.error("Format file tidak didukung. Gunakan JPG, PNG, GIF, atau WebP")
      return
    }

    // Validate file size (max 2MB)
    const maxSize = 2 * 1024 * 1024 // 2MB
    if (file.size > maxSize) {
      toast.error("Ukuran file terlalu besar. Maksimal 2MB")
      return
    }

    setUploadingLogo(true)
    try {
      const response = await cmsService.uploadLogo(tenantId, file, type)
      if (response.success) {
        setSettings(prev => ({
          ...prev,
          [type]: response.data.url
        }))
        toast.success("Logo berhasil diupload")
      } else {
        toast.error(response.error || "Gagal mengupload logo")
      }
    } catch (error) {
      console.error('Error uploading logo:', error)
      toast.error("Terjadi kesalahan saat mengupload logo")
    } finally {
      setUploadingLogo(false)
    }
  }

  const handleFileSelect = (type: 'site_logo' | 'site_favicon') => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        handleLogoUpload(file, type)
      }
    }
    input.click()
  }

  // Page Management Functions
  const fetchPages = async () => {
    setPagesLoading(true)
    try {
      const response = await cmsService.getAdminPages(tenantId, { per_page: 100 })
      if (response.success) {
        setPages(response.data)
      } else {
        toast.error("Gagal memuat halaman")
      }
    } catch (error) {
      console.error('Error fetching pages:', error)
      toast.error("Terjadi kesalahan saat memuat halaman")
    } finally {
      setPagesLoading(false)
    }
  }

  const handlePageSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!pageFormData.title.trim() || !pageFormData.content.trim()) {
      toast.error("Judul dan konten wajib diisi")
      return
    }

    try {
      const pageData = {
        ...pageFormData,
        menu_title: pageFormData.menu_title || pageFormData.title
      }

      let response
      if (editingPage) {
        response = await cmsService.updatePage(tenantId, editingPage.id, pageData)
      } else {
        response = await cmsService.createPage(tenantId, pageData)
      }

      if (response.success) {
        toast.success(editingPage ? "Halaman berhasil diperbarui" : "Halaman berhasil dibuat")
        setShowPageForm(false)
        setEditingPage(null)
        resetPageForm()
        fetchPages()
      } else {
        toast.error(response.error || "Gagal menyimpan halaman")
      }
    } catch (error) {
      console.error('Error saving page:', error)
      toast.error("Terjadi kesalahan saat menyimpan halaman")
    }
  }

  const handlePageEdit = (page: any) => {
    setEditingPage(page)
    setPageFormData({
      title: page.title || "",
      content: page.content || "",
      excerpt: page.excerpt || "",
      status: page.status || "draft",
      show_in_menu: page.show_in_menu || false,
      menu_title: page.menu_title || "",
      page_template: page.page_template || "default",
      seo_title: page.seo_title || "",
      seo_description: page.seo_description || "",
      seo_keywords: page.seo_keywords || ""
    })
    setShowPageForm(true)
  }

  const handlePageDelete = async () => {
    if (!pageToDelete) return

    try {
      const response = await cmsService.deletePage(tenantId, pageToDelete.id)
      if (response.success) {
        toast.success("Halaman berhasil dihapus")
        setDeletePageDialogOpen(false)
        setPageToDelete(null)
        fetchPages()
      } else {
        toast.error(response.error || "Gagal menghapus halaman")
      }
    } catch (error) {
      console.error('Error deleting page:', error)
      toast.error("Terjadi kesalahan saat menghapus halaman")
    }
  }

  const resetPageForm = () => {
    setPageFormData({
      title: "",
      content: "",
      excerpt: "",
      status: "draft",
      show_in_menu: false,
      menu_title: "",
      page_template: "default",
      seo_title: "",
      seo_description: "",
      seo_keywords: ""
    })
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-800'
      case 'draft':
        return 'bg-yellow-100 text-yellow-800'
      case 'archived':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Pengaturan Website</h1>
            <p className="text-muted-foreground mt-1">
              Kelola pengaturan dan konfigurasi website nagari
            </p>
          </div>
        </div>
        
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="space-y-2">
                  <div className="h-4 bg-muted rounded animate-pulse w-32" />
                  <div className="h-10 bg-muted rounded animate-pulse" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Pengaturan Website</h1>
          <p className="text-muted-foreground mt-1">
            Kelola pengaturan dan konfigurasi website nagari
          </p>
        </div>
      </div>

      {/* Show Page Form */}
      {showPageForm ? (
        <div className="space-y-6">
          {/* Form Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                onClick={() => {
                  setShowPageForm(false)
                  setEditingPage(null)
                  resetPageForm()
                }}
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Kembali
              </Button>
              <div>
                <h2 className="text-xl font-semibold">
                  {editingPage ? 'Edit Halaman' : 'Tambah Halaman Baru'}
                </h2>
                <p className="text-muted-foreground text-sm">
                  {editingPage ? 'Perbarui informasi halaman' : 'Buat halaman statis baru untuk website'}
                </p>
              </div>
            </div>
          </div>

          {/* Page Form */}
          <form onSubmit={handlePageSubmit} className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-3">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Konten Utama</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="page_title">Judul Halaman *</Label>
                      <Input
                        id="page_title"
                        value={pageFormData.title}
                        onChange={(e) => setPageFormData(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="Masukkan judul halaman"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="page_excerpt">Ringkasan</Label>
                      <Textarea
                        id="page_excerpt"
                        value={pageFormData.excerpt}
                        onChange={(e) => setPageFormData(prev => ({ ...prev, excerpt: e.target.value }))}
                        placeholder="Ringkasan singkat tentang halaman ini"
                        rows={3}
                      />
                    </div>

                    <div>
                      <Label htmlFor="page_content">Konten Halaman *</Label>
                      <Textarea
                        id="page_content"
                        value={pageFormData.content}
                        onChange={(e) => setPageFormData(prev => ({ ...prev, content: e.target.value }))}
                        placeholder="Tulis konten halaman dalam format HTML atau Markdown"
                        rows={12}
                        required
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Anda dapat menggunakan HTML tags untuk formatting
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* SEO Settings */}
                <Card>
                  <CardHeader>
                    <CardTitle>Pengaturan SEO</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="page_seo_title">SEO Title</Label>
                      <Input
                        id="page_seo_title"
                        value={pageFormData.seo_title}
                        onChange={(e) => setPageFormData(prev => ({ ...prev, seo_title: e.target.value }))}
                        placeholder="Judul untuk mesin pencari (kosong = gunakan judul halaman)"
                      />
                    </div>

                    <div>
                      <Label htmlFor="page_seo_description">SEO Description</Label>
                      <Textarea
                        id="page_seo_description"
                        value={pageFormData.seo_description}
                        onChange={(e) => setPageFormData(prev => ({ ...prev, seo_description: e.target.value }))}
                        placeholder="Deskripsi halaman untuk mesin pencari"
                        rows={3}
                      />
                    </div>

                    <div>
                      <Label htmlFor="page_seo_keywords">SEO Keywords</Label>
                      <Input
                        id="page_seo_keywords"
                        value={pageFormData.seo_keywords}
                        onChange={(e) => setPageFormData(prev => ({ ...prev, seo_keywords: e.target.value }))}
                        placeholder="Kata kunci, pisahkan dengan koma"
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Publish Settings */}
                <Card>
                  <CardHeader>
                    <CardTitle>Pengaturan Publikasi</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="page_status">Status</Label>
                      <Select 
                        value={pageFormData.status} 
                        onValueChange={(value) => setPageFormData(prev => ({ ...prev, status: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="draft">Draft</SelectItem>
                          <SelectItem value="published">Published</SelectItem>
                          <SelectItem value="archived">Archived</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="page_template">Template</Label>
                      <Select 
                        value={pageFormData.page_template} 
                        onValueChange={(value) => setPageFormData(prev => ({ ...prev, page_template: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih template" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="default">Default</SelectItem>
                          <SelectItem value="profile">Profile</SelectItem>
                          <SelectItem value="contact">Contact</SelectItem>
                          <SelectItem value="visi-misi">Visi & Misi</SelectItem>
                          <SelectItem value="sejarah">Sejarah</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>

                {/* Navigation Settings */}
                <Card>
                  <CardHeader>
                    <CardTitle>Pengaturan Menu</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="page_show_in_menu">Tampilkan di Menu</Label>
                      <Switch
                        id="page_show_in_menu"
                        checked={pageFormData.show_in_menu}
                        onCheckedChange={(checked) => setPageFormData(prev => ({ ...prev, show_in_menu: checked }))}
                      />
                    </div>

                    {pageFormData.show_in_menu && (
                      <div>
                        <Label htmlFor="page_menu_title">Judul di Menu</Label>
                        <Input
                          id="page_menu_title"
                          value={pageFormData.menu_title}
                          onChange={(e) => setPageFormData(prev => ({ ...prev, menu_title: e.target.value }))}
                          placeholder="Kosong = gunakan judul halaman"
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Action Buttons */}
                <div className="space-y-2">
                  <Button type="submit" className="w-full">
                    <Save className="h-4 w-4 mr-2" />
                    {editingPage ? 'Perbarui Halaman' : 'Simpan Halaman'}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="w-full"
                    onClick={() => {
                      setShowPageForm(false)
                      setEditingPage(null)
                      resetPageForm()
                    }}
                  >
                    Batal
                  </Button>
                </div>
              </div>
            </div>
          </form>
        </div>
      ) : (
        /* Settings Tabs */
        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="general">Umum</TabsTrigger>
            <TabsTrigger value="pages">Halaman</TabsTrigger>
            <TabsTrigger value="contact">Kontak</TabsTrigger>
            <TabsTrigger value="social">Media Sosial</TabsTrigger>
            <TabsTrigger value="seo">SEO</TabsTrigger>
          </TabsList>

        {/* General Settings */}
        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Informasi Umum Website
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="site_name">Nama Website</Label>
                  <Input
                    id="site_name"
                    value={settings.site_name}
                    onChange={(e) => handleInputChange('site_name', e.target.value)}
                    placeholder="Portal Nagari Sungai Pinang"
                  />
                </div>
                <div>
                  <Label htmlFor="site_tagline">Tagline</Label>
                  <Input
                    id="site_tagline"
                    value={settings.site_tagline}
                    onChange={(e) => handleInputChange('site_tagline', e.target.value)}
                    placeholder="Nagari Maju dan Sejahtera"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="site_description">Deskripsi Website</Label>
                <Textarea
                  id="site_description"
                  value={settings.site_description}
                  onChange={(e) => handleInputChange('site_description', e.target.value)}
                  placeholder="Deskripsi singkat tentang website nagari"
                  rows={3}
                />
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                {/* Logo Upload */}
                <div>
                  <Label>Logo Website</Label>
                  <div className="mt-2 space-y-4">
                    {settings.site_logo && (
                      <div className="flex items-center gap-4 p-4 border rounded-lg">
                        <img 
                          src={settings.site_logo} 
                          alt="Logo" 
                          className="h-16 w-16 object-contain bg-gray-50 rounded"
                        />
                        <div className="flex-1">
                          <p className="text-sm font-medium">Logo saat ini</p>
                          <p className="text-xs text-muted-foreground">Rekomendasi: 200x200px, format PNG/SVG</p>
                        </div>
                      </div>
                    )}
                    <Button 
                      variant="outline" 
                      onClick={() => handleFileSelect('site_logo')}
                      disabled={uploadingLogo}
                      className="w-full"
                    >
                      <UploadIcon className="h-4 w-4 mr-2" />
                      {uploadingLogo ? 'Mengupload...' : 'Upload Logo'}
                    </Button>
                  </div>
                </div>

                {/* Favicon Upload */}
                <div>
                  <Label>Favicon</Label>
                  <div className="mt-2 space-y-4">
                    {settings.site_favicon && (
                      <div className="flex items-center gap-4 p-4 border rounded-lg">
                        <img 
                          src={settings.site_favicon} 
                          alt="Favicon" 
                          className="h-8 w-8 object-contain bg-gray-50 rounded"
                        />
                        <div className="flex-1">
                          <p className="text-sm font-medium">Favicon saat ini</p>
                          <p className="text-xs text-muted-foreground">Rekomendasi: 32x32px, format ICO/PNG</p>
                        </div>
                      </div>
                    )}
                    <Button 
                      variant="outline" 
                      onClick={() => handleFileSelect('site_favicon')}
                      disabled={uploadingLogo}
                      className="w-full"
                    >
                      <UploadIcon className="h-4 w-4 mr-2" />
                      {uploadingLogo ? 'Mengupload...' : 'Upload Favicon'}
                    </Button>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button 
                  onClick={() => handleSaveSettings(['site_name', 'site_tagline', 'site_description'])}
                  disabled={saving}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? 'Menyimpan...' : 'Simpan Pengaturan'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pages Management */}
        <TabsContent value="pages" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Kelola Halaman
                </CardTitle>
                <Button onClick={() => setShowPageForm(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Tambah Halaman
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Judul</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Template</TableHead>
                    <TableHead>Menu</TableHead>
                    <TableHead>Terakhir Diupdate</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pagesLoading ? (
                    Array.from({ length: 3 }).map((_, index) => (
                      <TableRow key={index}>
                        <TableCell><div className="h-4 bg-muted rounded animate-pulse w-48" /></TableCell>
                        <TableCell><div className="h-6 bg-muted rounded animate-pulse w-20" /></TableCell>
                        <TableCell><div className="h-4 bg-muted rounded animate-pulse w-24" /></TableCell>
                        <TableCell><div className="h-4 bg-muted rounded animate-pulse w-16" /></TableCell>
                        <TableCell><div className="h-4 bg-muted rounded animate-pulse w-32" /></TableCell>
                        <TableCell><div className="h-8 bg-muted rounded animate-pulse w-8" /></TableCell>
                      </TableRow>
                    ))
                  ) : pages.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        <div className="flex flex-col items-center gap-2">
                          <FileText className="h-12 w-12 text-muted-foreground opacity-50" />
                          <p className="text-muted-foreground">Belum ada halaman</p>
                          <Button variant="outline" size="sm" onClick={() => setShowPageForm(true)}>
                            Buat halaman pertama
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    pages.map((page: any) => (
                      <TableRow key={page.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{page.title}</p>
                            {page.excerpt && (
                              <p className="text-sm text-muted-foreground truncate max-w-96">
                                {page.excerpt}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(page.status)}>
                            {page.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">
                            {page.page_template || 'Default'}
                          </span>
                        </TableCell>
                        <TableCell>
                          {page.show_in_menu ? (
                            <Badge variant="outline">Ya</Badge>
                          ) : (
                            <span className="text-muted-foreground text-sm">Tidak</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">
                            {formatDate(page.updated_at)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handlePageEdit(page)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                className="text-destructive"
                                onClick={() => {
                                  setPageToDelete(page)
                                  setDeletePageDialogOpen(true)
                                }}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Hapus
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Contact Settings */}
        <TabsContent value="contact" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="h-5 w-5" />
                Informasi Kontak
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="contact_address">Alamat Lengkap</Label>
                <Textarea
                  id="contact_address"
                  value={settings.contact_address}
                  onChange={(e) => handleInputChange('contact_address', e.target.value)}
                  placeholder="Jl. Raya Nagari No. 123, Kec. Sungai Pinang..."
                  rows={3}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="contact_phone">Nomor Telepon</Label>
                  <Input
                    id="contact_phone"
                    value={settings.contact_phone}
                    onChange={(e) => handleInputChange('contact_phone', e.target.value)}
                    placeholder="+62 756 123456"
                  />
                </div>
                <div>
                  <Label htmlFor="contact_whatsapp">Nomor WhatsApp</Label>
                  <Input
                    id="contact_whatsapp"
                    value={settings.contact_whatsapp}
                    onChange={(e) => handleInputChange('contact_whatsapp', e.target.value)}
                    placeholder="+62 812 3456 7890"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="contact_email">Email Resmi</Label>
                <Input
                  id="contact_email"
                  type="email"
                  value={settings.contact_email}
                  onChange={(e) => handleInputChange('contact_email', e.target.value)}
                  placeholder="info@sungaipinang.nagari.id"
                />
              </div>

              <div className="flex justify-end">
                <Button 
                  onClick={() => handleSaveSettings(['contact_address', 'contact_phone', 'contact_whatsapp', 'contact_email'])}
                  disabled={saving}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? 'Menyimpan...' : 'Simpan Kontak'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Social Media Settings */}
        <TabsContent value="social" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Facebook className="h-5 w-5" />
                Media Sosial
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="social_facebook" className="flex items-center gap-2">
                    <Facebook className="h-4 w-4 text-blue-600" />
                    Facebook
                  </Label>
                  <Input
                    id="social_facebook"
                    value={settings.social_facebook}
                    onChange={(e) => handleInputChange('social_facebook', e.target.value)}
                    placeholder="https://facebook.com/nagari.sungaipinang"
                  />
                </div>
                <div>
                  <Label htmlFor="social_instagram" className="flex items-center gap-2">
                    <Instagram className="h-4 w-4 text-pink-600" />
                    Instagram
                  </Label>
                  <Input
                    id="social_instagram"
                    value={settings.social_instagram}
                    onChange={(e) => handleInputChange('social_instagram', e.target.value)}
                    placeholder="https://instagram.com/nagari.sungaipinang"
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="social_youtube" className="flex items-center gap-2">
                    <Youtube className="h-4 w-4 text-red-600" />
                    YouTube
                  </Label>
                  <Input
                    id="social_youtube"
                    value={settings.social_youtube}
                    onChange={(e) => handleInputChange('social_youtube', e.target.value)}
                    placeholder="https://youtube.com/@nagari.sungaipinang"
                  />
                </div>
                <div>
                  <Label htmlFor="social_twitter" className="flex items-center gap-2">
                    <Twitter className="h-4 w-4 text-blue-400" />
                    Twitter
                  </Label>
                  <Input
                    id="social_twitter"
                    value={settings.social_twitter}
                    onChange={(e) => handleInputChange('social_twitter', e.target.value)}
                    placeholder="https://twitter.com/nagari_sp"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="social_tiktok">TikTok</Label>
                <Input
                  id="social_tiktok"
                  value={settings.social_tiktok}
                  onChange={(e) => handleInputChange('social_tiktok', e.target.value)}
                  placeholder="https://tiktok.com/@nagari.sungaipinang"
                />
              </div>

              <div className="flex justify-end">
                <Button 
                  onClick={() => handleSaveSettings(['social_facebook', 'social_instagram', 'social_youtube', 'social_twitter', 'social_tiktok'])}
                  disabled={saving}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? 'Menyimpan...' : 'Simpan Media Sosial'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SEO Settings */}
        <TabsContent value="seo" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Pengaturan SEO
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="seo_meta_title">Meta Title</Label>
                <Input
                  id="seo_meta_title"
                  value={settings.seo_meta_title}
                  onChange={(e) => handleInputChange('seo_meta_title', e.target.value)}
                  placeholder="Portal Nagari Sungai Pinang - Informasi Terpadu"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Maksimal 60 karakter, muncul di hasil pencarian Google
                </p>
              </div>

              <div>
                <Label htmlFor="seo_meta_description">Meta Description</Label>
                <Textarea
                  id="seo_meta_description"
                  value={settings.seo_meta_description}
                  onChange={(e) => handleInputChange('seo_meta_description', e.target.value)}
                  placeholder="Portal resmi Nagari Sungai Pinang menyediakan informasi pelayanan, berita, dan program pembangunan untuk masyarakat."
                  rows={3}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Maksimal 160 karakter, muncul di snippet hasil pencarian
                </p>
              </div>

              <div>
                <Label htmlFor="seo_keywords">Keywords</Label>
                <Input
                  id="seo_keywords"
                  value={settings.seo_keywords}
                  onChange={(e) => handleInputChange('seo_keywords', e.target.value)}
                  placeholder="nagari sungai pinang, pelayanan publik, berita nagari, pemerintahan desa"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Pisahkan dengan koma, maksimal 10 keywords
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="google_analytics_id">Google Analytics ID</Label>
                  <Input
                    id="google_analytics_id"
                    value={settings.google_analytics_id}
                    onChange={(e) => handleInputChange('google_analytics_id', e.target.value)}
                    placeholder="G-XXXXXXXXXX"
                  />
                </div>
                <div>
                  <Label htmlFor="google_search_console">Google Search Console</Label>
                  <Input
                    id="google_search_console"
                    value={settings.google_search_console}
                    onChange={(e) => handleInputChange('google_search_console', e.target.value)}
                    placeholder="Meta tag verification code"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button 
                  onClick={() => handleSaveSettings(['seo_meta_title', 'seo_meta_description', 'seo_keywords', 'google_analytics_id', 'google_search_console'])}
                  disabled={saving}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? 'Menyimpan...' : 'Simpan SEO'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      )}

      {/* Delete Page Confirmation Dialog */}
      <Dialog open={deletePageDialogOpen} onOpenChange={setDeletePageDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hapus Halaman</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus halaman "{pageToDelete?.title}"? 
              Tindakan ini tidak dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeletePageDialogOpen(false)}>
              Batal
            </Button>
            <Button variant="destructive" onClick={handlePageDelete}>
              Hapus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}