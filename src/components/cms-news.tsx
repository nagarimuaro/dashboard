import React, { useState, useEffect, useRef } from "react"
import { 
  Plus, 
  Search, 
  Filter,
  Newspaper,
  Eye,
  Edit,
  Trash2,
  MoreVertical,
  Calendar,
  User,
  TrendingUp,
  ChevronLeft,
  Save,
  ArrowUpDown,
  CheckSquare,
  Square,
  Archive,
  Upload,
  Image as ImageIcon,
  X,
  Bold,
  Italic,
  Underline,
  Link,
  List,
  ListOrdered,
  Quote,
  Code,
  Type,
  ImagePlus,
  ChevronRight,
  ChevronDown
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Badge } from "./ui/badge"
import { Textarea } from "./ui/textarea"
import { Label } from "./ui/label"
import { Switch } from "./ui/switch"
import { Checkbox } from "./ui/checkbox"
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
import { 
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "./ui/collapsible"
import { toast } from "sonner"
import cmsService from "../services/cmsService-fixed"

interface CMSNewsProps {
  userRole: string
  onModuleChange: (module: string) => void
}

interface NewsImage {
  id?: string
  url: string
  name: string
  size: number
}

export function CMSNews({ userRole, onModuleChange }: CMSNewsProps) {
  const [news, setNews] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [showForm, setShowForm] = useState(false)
  const [editingNews, setEditingNews] = useState<any>(null)
  const [selectedItems, setSelectedItems] = useState<number[]>([])
  const [formData, setFormData] = useState({
    title: "",
    excerpt: "",
    content: "",
    category_id: "",
    status: "draft",
    is_featured: false,
    tags: "",
    published_at: "",
    featured_image: "",
    images: [] as NewsImage[]
  })
  const [uploadingImage, setUploadingImage] = useState(false)
  const [uploadingImages, setUploadingImages] = useState(false)
  const contentEditorRef = useRef<HTMLTextAreaElement>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [newsToDelete, setNewsToDelete] = useState<any>(null)
  const [bulkActionDialogOpen, setBulkActionDialogOpen] = useState(false)
  const [bulkAction, setBulkAction] = useState("")
  const [imageGalleryOpen, setImageGalleryOpen] = useState(false)

  // Get tenant ID from localStorage
  const tenantId = JSON.parse(localStorage.getItem('current_tenant') || '{}')?.id || 1

  useEffect(() => {
    fetchNews()
    fetchCategories()
  }, [currentPage, searchQuery, statusFilter, categoryFilter])

  const fetchNews = async () => {
    setLoading(true)
    try {
      const params = {
        page: currentPage,
        per_page: 10,
        ...(searchQuery && { search: searchQuery }),
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(categoryFilter !== 'all' && { category: categoryFilter })
      }

      const response = await cmsService.getAdminNews(tenantId, params)
      if (response.success) {
        setNews(response.data || [])
        setTotalPages(Math.ceil((response.meta?.total || 0) / 10))
      } else {
        console.error("Failed to load news:", response.error)
        setNews([])
      }
    } catch (error) {
      console.error('Error fetching news:', error)
      setNews([])
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await cmsService.getAdminCategories(tenantId, { type: 'news' })
      if (response.success) {
        setCategories(response.data || [])
      } else {
        console.error("Failed to load categories:", response.error)
        setCategories([])
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
      setCategories([])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title.trim() || !formData.excerpt.trim() || !formData.content.trim()) {
      toast.error("Judul, ringkasan, dan konten wajib diisi")
      return
    }

    try {
      const newsData = {
        ...formData,
        category_id: (formData.category_id && formData.category_id !== 'none') ? parseInt(formData.category_id) : null,
        tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()).filter(Boolean) : [],
        published_at: formData.published_at || null,
        images: formData.images.map(img => ({
          url: img.url,
          name: img.name,
          size: img.size
        }))
      }

      let response
      if (editingNews) {
        response = await cmsService.updateNews(tenantId, editingNews.id, newsData)
      } else {
        response = await cmsService.createNews(tenantId, newsData)
      }

      if (response.success) {
        toast.success(editingNews ? "Berita berhasil diperbarui" : "Berita berhasil dibuat")
        setShowForm(false)
        setEditingNews(null)
        resetForm()
        fetchNews()
      } else {
        toast.error(response.error || "Gagal menyimpan berita")
      }
    } catch (error) {
      console.error('Error saving news:', error)
      toast.error("Terjadi kesalahan saat menyimpan berita")
    }
  }

  const handleEdit = (newsItem: any) => {
    setEditingNews(newsItem)
    setFormData({
      title: newsItem.title || "",
      excerpt: newsItem.excerpt || "",
      content: newsItem.content || "",
      category_id: newsItem.category_id?.toString() || "none",
      status: newsItem.status || "draft",
      is_featured: newsItem.is_featured || false,
      tags: newsItem.tags ? (Array.isArray(newsItem.tags) ? newsItem.tags.join(', ') : newsItem.tags) : "",
      published_at: newsItem.published_at ? new Date(newsItem.published_at).toISOString().slice(0, 16) : "",
      featured_image: newsItem.featured_image_url || newsItem.featured_image || "",
      images: newsItem.images || []
    })
    setShowForm(true)
  }

  const handleDelete = async () => {
    if (!newsToDelete) return

    try {
      const response = await cmsService.deleteNews(tenantId, newsToDelete.id)
      if (response.success) {
        toast.success("Berita berhasil dihapus")
        setDeleteDialogOpen(false)
        setNewsToDelete(null)
        fetchNews()
      } else {
        toast.error(response.error || "Gagal menghapus berita")
      }
    } catch (error) {
      console.error('Error deleting news:', error)
      toast.error("Terjadi kesalahan saat menghapus berita")
    }
  }

  const handleBulkAction = async () => {
    if (selectedItems.length === 0) {
      toast.error("Pilih berita terlebih dahulu")
      return
    }

    try {
      let response
      if (bulkAction === 'delete') {
        response = await cmsService.bulkDeleteNews(tenantId, selectedItems)
      } else {
        response = await cmsService.bulkUpdateNewsStatus(tenantId, selectedItems, bulkAction)
      }

      if (response.success) {
        toast.success(
          bulkAction === 'delete' 
            ? `${selectedItems.length} berita berhasil dihapus`
            : `${selectedItems.length} berita berhasil diperbarui`
        )
        setBulkActionDialogOpen(false)
        setSelectedItems([])
        fetchNews()
      } else {
        toast.error(response.error || "Gagal memproses aksi bulk")
      }
    } catch (error) {
      console.error('Error bulk action:', error)
      toast.error("Terjadi kesalahan saat memproses aksi bulk")
    }
  }

  const resetForm = () => {
    setFormData({
      title: "",
      excerpt: "",
      content: "",
      category_id: "none",
      status: "draft",
      is_featured: false,
      tags: "",
      published_at: "",
      featured_image: "",
      images: []
    })
  }

  // Single featured image upload
  const handleImageUpload = async (file: File) => {
    if (!file) return

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      toast.error("Format file tidak didukung. Gunakan JPG, PNG, GIF, atau WebP")
      return
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      toast.error("Ukuran file terlalu besar. Maksimal 5MB")
      return
    }

    setUploadingImage(true)
    try {
      const response = await cmsService.uploadNewsImage(tenantId, file)
      if (response.success) {
        setFormData(prev => ({
          ...prev,
          featured_image: response.data.url
        }))
        toast.success("Gambar berhasil diupload")
      } else {
        toast.error(response.error || "Gagal mengupload gambar")
      }
    } catch (error) {
      console.error('Error uploading image:', error)
      toast.error("Terjadi kesalahan saat mengupload gambar")
    } finally {
      setUploadingImage(false)
    }
  }

  // Multiple images upload
  const handleMultipleImagesUpload = async (files: FileList) => {
    if (!files || files.length === 0) return

    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    const maxSize = 5 * 1024 * 1024 // 5MB
    const maxFiles = 10 // Maximum 10 images

    // Validate number of files
    if (files.length > maxFiles) {
      toast.error(`Maksimal ${maxFiles} gambar dapat diupload sekaligus`)
      return
    }

    // Validate each file
    const validFiles: File[] = []
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      
      if (!allowedTypes.includes(file.type)) {
        toast.error(`File ${file.name} tidak didukung. Gunakan JPG, PNG, GIF, atau WebP`)
        continue
      }
      
      if (file.size > maxSize) {
        toast.error(`File ${file.name} terlalu besar. Maksimal 5MB`)
        continue
      }
      
      validFiles.push(file)
    }

    if (validFiles.length === 0) {
      toast.error("Tidak ada file valid untuk diupload")
      return
    }

    setUploadingImages(true)
    try {
      const uploadPromises = validFiles.map(async (file, index) => {
        try {
          const response = await cmsService.uploadNewsImage(tenantId, file)
          if (response.success) {
            return {
              url: response.data.url,
              name: file.name,
              size: file.size
            }
          }
          throw new Error(`Gagal upload ${file.name}`)
        } catch (error) {
          console.error(`Error uploading ${file.name}:`, error)
          return null
        }
      })

      const uploadResults = await Promise.allSettled(uploadPromises)
      const uploadedImages = uploadResults
        .filter((result): result is PromiseFulfilledResult<NewsImage> => 
          result.status === 'fulfilled' && result.value !== null)
        .map(result => result.value)
      
      if (uploadedImages.length > 0) {
        setFormData(prev => ({
          ...prev,
          images: [...prev.images, ...uploadedImages]
        }))
        
        toast.success(`${uploadedImages.length} dari ${validFiles.length} gambar berhasil diupload`)
      } else {
        toast.error("Tidak ada gambar yang berhasil diupload")
      }
    } catch (error) {
      console.error('Error uploading images:', error)
      toast.error("Terjadi kesalahan saat mengupload gambar")
    } finally {
      setUploadingImages(false)
    }
  }

  const handleImageSelect = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        handleImageUpload(file)
      }
    }
    input.click()
  }

  const handleMultipleImageSelect = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.multiple = true
    input.onchange = (e) => {
      const files = (e.target as HTMLInputElement).files
      if (files) {
        handleMultipleImagesUpload(files)
      }
    }
    input.click()
  }

  const removeImage = () => {
    setFormData(prev => ({
      ...prev,
      featured_image: ""
    }))
  }

  const removeImageFromGallery = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }))
  }

  // WYSIWYG Editor functions
  const insertText = (before: string, after: string = '') => {
    const textarea = contentEditorRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = textarea.value.substring(start, end)
    
    const newText = before + selectedText + after
    const beforeText = textarea.value.substring(0, start)
    const afterText = textarea.value.substring(end)
    
    setFormData(prev => ({
      ...prev,
      content: beforeText + newText + afterText
    }))

    // Restore cursor position
    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(
        start + before.length,
        start + before.length + selectedText.length
      )
    }, 0)
  }

  const insertHeading = (level: number) => {
    const hashes = '#'.repeat(level)
    insertText(`${hashes} `, '')
  }

  const insertLink = () => {
    const url = prompt('Masukkan URL:')
    if (url) {
      insertText('[', `](${url})`)
    }
  }

  const insertImageToContent = () => {
    const url = prompt('Masukkan URL gambar:')
    if (url) {
      const alt = prompt('Masukkan alt text (opsional):') || 'image'
      insertText('', `![${alt}](${url})`)
    }
  }

  const insertImageFromGallery = (imageUrl: string) => {
    const alt = prompt('Masukkan alt text (opsional):') || 'image'
    insertText('', `![${alt}](${imageUrl})`)
    setImageGalleryOpen(false)
  }

  const toggleItemSelection = (id: number) => {
    setSelectedItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    )
  }

  const toggleSelectAll = () => {
    setSelectedItems(
      selectedItems.length === news.length 
        ? [] 
        : news.map((item: any) => item.id)
    )
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return '-'
    try {
      return new Date(dateString).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch (error) {
      return '-'
    }
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

  const getThumbnailImage = (newsItem: any) => {
    // Priority: featured_image_url > featured_image > first image from images array > default
    if (newsItem?.featured_image_url) {
      return newsItem.featured_image_url
    }
    if (newsItem?.featured_image && newsItem.featured_image.startsWith('http')) {
      return newsItem.featured_image
    }
    if (newsItem?.images && Array.isArray(newsItem.images) && newsItem.images.length > 0) {
      return newsItem.images[0]?.url
    }
    return null
  }

  // Safe category name getter
  const getCategoryName = (item: any) => {
    if (!item) return '-'
    if (item.category && typeof item.category === 'object' && item.category.name) {
      return item.category.name
    }
    if (typeof item.category === 'string') {
      return item.category
    }
    return '-'
  }

  if (showForm) {
    return (
      <div className="space-y-6">
        {/* Form Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              onClick={() => {
                setShowForm(false)
                setEditingNews(null)
                resetForm()
              }}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Kembali
            </Button>
            <div>
              <h1 className="text-2xl font-semibold">
                {editingNews ? 'Edit Berita' : 'Tambah Berita Baru'}
              </h1>
              <p className="text-muted-foreground mt-1">
                {editingNews ? 'Perbarui informasi berita' : 'Buat berita atau artikel baru'}
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Konten Berita</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="title">Judul Berita *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Masukkan judul berita"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="excerpt">Ringkasan *</Label>
                    <Textarea
                      id="excerpt"
                      value={formData.excerpt}
                      onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
                      placeholder="Ringkasan singkat berita untuk preview"
                      rows={3}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="content">Konten Berita *</Label>
                    {/* WYSIWYG Toolbar */}
                    <div className="border rounded-t-lg p-2 bg-muted/50 flex flex-wrap gap-1">
                      <div className="flex items-center gap-1 border-r pr-2 mr-2">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => insertHeading(1)}
                          title="Heading 1"
                        >
                          <Type className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => insertHeading(2)}
                          title="Heading 2"
                        >
                          H2
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => insertHeading(3)}
                          title="Heading 3"
                        >
                          H3
                        </Button>
                      </div>
                      
                      <div className="flex items-center gap-1 border-r pr-2 mr-2">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => insertText('**', '**')}
                          title="Bold"
                        >
                          <Bold className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => insertText('*', '*')}
                          title="Italic"
                        >
                          <Italic className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => insertText('<u>', '</u>')}
                          title="Underline"
                        >
                          <Underline className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="flex items-center gap-1 border-r pr-2 mr-2">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => insertText('- ', '')}
                          title="Bullet List"
                        >
                          <List className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => insertText('1. ', '')}
                          title="Numbered List"
                        >
                          <ListOrdered className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => insertText('> ', '')}
                          title="Quote"
                        >
                          <Quote className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="flex items-center gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={insertLink}
                          title="Insert Link"
                        >
                          <Link className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={insertImageToContent}
                          title="Insert Image"
                        >
                          <ImageIcon className="h-4 w-4" />
                        </Button>
                        {formData.images.length > 0 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setImageGalleryOpen(true)}
                            title="Insert from Gallery"
                          >
                            <ImagePlus className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => insertText('`', '`')}
                          title="Code"
                        >
                          <Code className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <Textarea
                      ref={contentEditorRef}
                      id="content"
                      value={formData.content}
                      onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                      placeholder="Tulis konten berita lengkap dalam format Markdown atau HTML"
                      rows={15}
                      required
                      className="rounded-t-none border-t-0"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Gunakan toolbar di atas atau tulis langsung dengan Markdown/HTML
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="tags">Tags</Label>
                    <Input
                      id="tags"
                      value={formData.tags}
                      onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                      placeholder="Tag1, Tag2, Tag3"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Pisahkan dengan koma untuk multiple tags
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Featured Image */}
              <Card>
                <CardHeader>
                  <CardTitle>Gambar Utama</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {formData.featured_image ? (
                    <div className="space-y-4">
                      <div className="relative group">
                        <img 
                          src={formData.featured_image} 
                          alt="Featured" 
                          className="w-full h-48 object-cover rounded-lg border"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={removeImage}
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      <Button 
                        type="button"
                        variant="outline" 
                        onClick={handleImageSelect}
                        disabled={uploadingImage}
                        className="w-full"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Ganti Gambar
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                        <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground mb-4">
                          Pilih gambar utama untuk berita
                        </p>
                        <Button 
                          type="button"
                          variant="outline" 
                          onClick={handleImageSelect}
                          disabled={uploadingImage}
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          {uploadingImage ? 'Mengupload...' : 'Upload Gambar'}
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground text-center">
                        Rekomendasi: 1200x630px, format JPG/PNG, maksimal 5MB
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Image Gallery */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Galeri Gambar</span>
                    <Badge variant="secondary">{formData.images.length}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button 
                    type="button"
                    variant="outline" 
                    onClick={handleMultipleImageSelect}
                    disabled={uploadingImages}
                    className="w-full"
                  >
                    <ImagePlus className="h-4 w-4 mr-2" />
                    {uploadingImages ? 'Mengupload...' : 'Upload Multiple Gambar'}
                  </Button>
                  
                  {formData.images.length > 0 && (
                    <div className="grid grid-cols-2 gap-2">
                      {formData.images.map((image, index) => (
                        <div key={index} className="relative group">
                          <img 
                            src={image.url} 
                            alt={image.name}
                            className="w-full h-20 object-cover rounded border"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={() => removeImageFromGallery(index)}
                            className="absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <p className="text-xs text-muted-foreground">
                    Maksimal 10 gambar, 5MB per file. Gambar dapat digunakan dalam konten artikel.
                  </p>
                </CardContent>
              </Card>

              {/* Publish Settings */}
              <Card>
                <CardHeader>
                  <CardTitle>Pengaturan Publikasi</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="status">Status</Label>
                    <Select 
                      value={formData.status} 
                      onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
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
                    <Label htmlFor="category_id">Kategori</Label>
                    <Select 
                      value={formData.category_id} 
                      onValueChange={(value) => setFormData(prev => ({ ...prev, category_id: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih kategori" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Tanpa kategori</SelectItem>
                        {categories.map((category: any) => (
                          <SelectItem key={category.id} value={category.id.toString()}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="published_at">Jadwal Publikasi</Label>
                    <Input
                      id="published_at"
                      type="datetime-local"
                      value={formData.published_at}
                      onChange={(e) => setFormData(prev => ({ ...prev, published_at: e.target.value }))}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Kosong = publikasi sekarang (jika status published)
                    </p>
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="is_featured">Berita Unggulan</Label>
                    <Switch
                      id="is_featured"
                      checked={formData.is_featured}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_featured: checked }))}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="space-y-2">
                <Button type="submit" className="w-full">
                  <Save className="h-4 w-4 mr-2" />
                  {editingNews ? 'Perbarui Berita' : 'Simpan Berita'}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  className="w-full"
                  onClick={() => {
                    setShowForm(false)
                    setEditingNews(null)
                    resetForm()
                  }}
                >
                  Batal
                </Button>
              </div>
            </div>
          </div>
        </form>

        {/* Image Gallery Dialog */}
        <Dialog open={imageGalleryOpen} onOpenChange={setImageGalleryOpen}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Pilih Gambar dari Galeri</DialogTitle>
              <DialogDescription>
                Klik gambar untuk memasukkan ke dalam konten
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-4 gap-4 max-h-96 overflow-y-auto">
              {formData.images.map((image, index) => (
                <div 
                  key={index} 
                  className="cursor-pointer hover:opacity-75 transition-opacity"
                  onClick={() => insertImageFromGallery(image.url)}
                >
                  <img 
                    src={image.url} 
                    alt={image.name}
                    className="w-full h-24 object-cover rounded border"
                  />
                  <p className="text-xs text-muted-foreground mt-1 truncate">
                    {image.name}
                  </p>
                </div>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Kelola Berita</h1>
          <p className="text-muted-foreground mt-1">
            Kelola berita dan artikel untuk website nagari
          </p>
        </div>
        
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Tambah Berita
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Cari berita..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter Kategori" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Kategori</SelectItem>
                {categories.map((category: any) => (
                  <SelectItem key={category.id} value={category.id.toString()}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {selectedItems.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                {selectedItems.length} item dipilih
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setBulkAction('published')
                    setBulkActionDialogOpen(true)
                  }}
                >
                  Publish
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setBulkAction('draft')
                    setBulkActionDialogOpen(true)
                  }}
                >
                  Draft
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    setBulkAction('delete')
                    setBulkActionDialogOpen(true)
                  }}
                >
                  Hapus
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* News Table */}
      <Card>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedItems.length === news.length && news.length > 0}
                      onCheckedChange={toggleSelectAll}
                    />
                  </TableHead>
                  <TableHead className="w-20">Gambar</TableHead>
                  <TableHead>Judul</TableHead>
                  <TableHead>Kategori</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Penulis</TableHead>
                  <TableHead>Tanggal</TableHead>
                  <TableHead className="w-16">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {news.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      Belum ada berita yang tersedia
                    </TableCell>
                  </TableRow>
                ) : (
                  news.map((item: any) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedItems.includes(item.id)}
                          onCheckedChange={() => toggleItemSelection(item.id)}
                        />
                      </TableCell>
                      <TableCell>
                        {getThumbnailImage(item) ? (
                          <img 
                            src={getThumbnailImage(item)} 
                            alt={item.title}
                            className="w-12 h-12 object-cover rounded border"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-muted rounded border flex items-center justify-center">
                            <ImageIcon className="h-6 w-6 text-muted-foreground" />
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium line-clamp-2">{item.title || 'Untitled'}</p>
                          <p className="text-sm text-muted-foreground line-clamp-1">
                            {item.excerpt || ''}
                          </p>
                          {item.is_featured && (
                            <Badge variant="secondary" className="mt-1">
                              <TrendingUp className="h-3 w-3 mr-1" />
                              Unggulan
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{getCategoryName(item)}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(item.status || 'draft')}>
                          {item.status || 'draft'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{item.author || 'Admin'}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{formatDate(item.created_at)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEdit(item)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Eye className="h-4 w-4 mr-2" />
                              Preview
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => {
                                setNewsToDelete(item)
                                setDeleteDialogOpen(true)
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
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <span className="flex items-center px-4 text-sm">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Konfirmasi Hapus</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus berita "{newsToDelete?.title}"? 
              Tindakan ini tidak dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Batal
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Hapus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Action Confirmation Dialog */}
      <Dialog open={bulkActionDialogOpen} onOpenChange={setBulkActionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Konfirmasi Aksi Bulk</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin {bulkAction === 'delete' ? 'menghapus' : `mengubah status menjadi ${bulkAction}`} {selectedItems.length} berita yang dipilih?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBulkActionDialogOpen(false)}>
              Batal
            </Button>
            <Button 
              variant={bulkAction === 'delete' ? 'destructive' : 'default'} 
              onClick={handleBulkAction}
            >
              Konfirmasi
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}