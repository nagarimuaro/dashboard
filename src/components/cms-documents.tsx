import React, { useState, useEffect, useRef } from "react"
import { 
  Plus, 
  Search, 
  FileText,
  Eye,
  Edit,
  Trash2,
  MoreVertical,
  ChevronLeft,
  Save,
  Upload,
  Download,
  Calendar,
  FolderOpen,
  File,
  FileImage,
  FileSpreadsheet,
  X,
  ExternalLink
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Badge } from "./ui/badge"
import { Textarea } from "./ui/textarea"
import { Label } from "./ui/label"
import { Switch } from "./ui/switch"
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog"
import { toast } from "sonner"
import cmsService from "../services/cmsService-fixed"

interface CMSDocumentsProps {
  userRole: string
  onModuleChange: (module: string) => void
}

interface Document {
  id: number
  title: string
  slug?: string
  description?: string
  category_id?: number
  category?: {
    id: number
    name: string
  }
  document_type: string
  year: number
  file_url?: string
  file_name?: string
  file_size?: number
  file_type?: string
  status: string
  is_public: boolean
  download_count?: number
  created_at: string
  updated_at: string
}

const DOCUMENT_TYPES = [
  { value: "peraturan", label: "Peraturan Nagari" },
  { value: "laporan", label: "Laporan" },
  { value: "sk", label: "Surat Keputusan" },
  { value: "pengumuman", label: "Pengumuman" },
  { value: "apbd", label: "APBD/Keuangan" },
  { value: "lainnya", label: "Lainnya" }
]

const DOCUMENT_STATUS = [
  { value: "active", label: "Aktif" },
  { value: "inactive", label: "Nonaktif" },
  { value: "archived", label: "Arsip" }
]

// Generate year options
const currentYear = new Date().getFullYear()
const YEARS = Array.from({ length: 10 }, (_, i) => currentYear - i)

export function CMSDocuments({ userRole, onModuleChange }: CMSDocumentsProps) {
  const [documents, setDocuments] = useState<Document[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [yearFilter, setYearFilter] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [showForm, setShowForm] = useState(false)
  const [editingDocument, setEditingDocument] = useState<Document | null>(null)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category_id: "",
    document_type: "peraturan",
    year: currentYear,
    status: "active",
    is_public: true,
    file_url: "",
    file_name: "",
    file_size: 0,
    file_type: ""
  })
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [documentToDelete, setDocumentToDelete] = useState<Document | null>(null)
  const [uploadingFile, setUploadingFile] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Get tenant ID from localStorage
  const tenantId = JSON.parse(localStorage.getItem('current_tenant') || '{}')?.id || 1

  useEffect(() => {
    fetchDocuments()
    fetchCategories()
  }, [currentPage, searchQuery, statusFilter, typeFilter, yearFilter])

  const fetchDocuments = async () => {
    setLoading(true)
    try {
      const params = {
        page: currentPage,
        per_page: 10,
        ...(searchQuery && { search: searchQuery }),
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(typeFilter !== 'all' && { document_type: typeFilter }),
        ...(yearFilter !== 'all' && { year: yearFilter })
      }

      const response = await cmsService.getDocuments(tenantId, params)
      
      if (response.success && response.data) {
        setDocuments(response.data)
        setTotalPages(Math.ceil((response.meta?.total || 0) / 10))
      } else {
        // Fallback mock data
        const mockDocuments: Document[] = [
          {
            id: 1,
            title: "Peraturan Nagari No. 1 Tahun 2025",
            description: "Tentang Anggaran Pendapatan dan Belanja Nagari",
            document_type: "peraturan",
            year: 2025,
            file_name: "pernag-1-2025.pdf",
            file_size: 1024000,
            file_type: "application/pdf",
            status: "active",
            is_public: true,
            download_count: 45,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: 2,
            title: "Laporan Keuangan Semester I 2025",
            description: "Laporan realisasi anggaran semester pertama",
            document_type: "laporan",
            year: 2025,
            file_name: "lapkeu-sem1-2025.pdf",
            file_size: 2048000,
            file_type: "application/pdf",
            status: "active",
            is_public: true,
            download_count: 32,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: 3,
            title: "SK Pengangkatan Perangkat Nagari",
            description: "Surat keputusan pengangkatan perangkat nagari periode 2024-2029",
            document_type: "sk",
            year: 2024,
            file_name: "sk-perangkat-2024.pdf",
            file_size: 512000,
            file_type: "application/pdf",
            status: "active",
            is_public: false,
            download_count: 12,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ]
        setDocuments(mockDocuments)
      }
    } catch (error) {
      console.error('Error fetching documents:', error)
      toast.error("Gagal memuat data dokumen")
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await cmsService.getAdminCategories(tenantId, { type: 'document' })
      if (response.success) {
        setCategories(response.data)
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const handleFileSelect = (file: File) => {
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ]
    
    if (!allowedTypes.includes(file.type)) {
      toast.error("Format file tidak didukung. Gunakan PDF, DOC, DOCX, XLS, atau XLSX")
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("Ukuran file maksimal 10MB")
      return
    }

    setSelectedFile(file)
    setFormData(prev => ({
      ...prev,
      file_name: file.name,
      file_size: file.size,
      file_type: file.type
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title.trim()) {
      toast.error("Judul dokumen wajib diisi")
      return
    }

    if (!editingDocument && !selectedFile && !formData.file_url) {
      toast.error("File dokumen wajib diupload")
      return
    }

    setUploadingFile(true)
    try {
      let fileUrl = formData.file_url

      // Upload file if selected
      if (selectedFile) {
        const uploadResponse = await cmsService.uploadDocument(tenantId, selectedFile, {
          title: formData.title,
          document_type: formData.document_type
        })
        
        if (uploadResponse.success && uploadResponse.data?.url) {
          fileUrl = uploadResponse.data.url
        } else {
          // Mock URL for development
          fileUrl = URL.createObjectURL(selectedFile)
        }
      }

      const documentData = {
        ...formData,
        file_url: fileUrl,
        category_id: formData.category_id ? parseInt(formData.category_id) : null
      }

      let response
      if (editingDocument) {
        response = await cmsService.updateDocument(tenantId, editingDocument.id, documentData)
      } else {
        response = await cmsService.createDocument(tenantId, documentData)
      }

      if (response.success) {
        toast.success(editingDocument ? "Dokumen berhasil diperbarui" : "Dokumen berhasil ditambahkan")
        resetForm()
        fetchDocuments()
      } else {
        toast.error(response.error || "Gagal menyimpan dokumen")
      }
    } catch (error) {
      console.error('Error saving document:', error)
      toast.error("Gagal menyimpan dokumen")
    } finally {
      setUploadingFile(false)
    }
  }

  const handleDelete = async () => {
    if (!documentToDelete) return

    try {
      const response = await cmsService.deleteDocument(tenantId, documentToDelete.id)
      
      if (response.success) {
        toast.success("Dokumen berhasil dihapus")
        setDeleteDialogOpen(false)
        setDocumentToDelete(null)
        fetchDocuments()
      } else {
        toast.error(response.error || "Gagal menghapus dokumen")
      }
    } catch (error) {
      console.error('Error deleting document:', error)
      toast.error("Gagal menghapus dokumen")
    }
  }

  const handleEdit = (document: Document) => {
    setEditingDocument(document)
    setFormData({
      title: document.title,
      description: document.description || "",
      category_id: document.category_id?.toString() || "",
      document_type: document.document_type,
      year: document.year,
      status: document.status,
      is_public: document.is_public,
      file_url: document.file_url || "",
      file_name: document.file_name || "",
      file_size: document.file_size || 0,
      file_type: document.file_type || ""
    })
    setShowForm(true)
  }

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      category_id: "",
      document_type: "peraturan",
      year: currentYear,
      status: "active",
      is_public: true,
      file_url: "",
      file_name: "",
      file_size: 0,
      file_type: ""
    })
    setSelectedFile(null)
    setEditingDocument(null)
    setShowForm(false)
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getFileIcon = (fileType?: string) => {
    if (!fileType) return <File className="h-5 w-5" />
    if (fileType.includes('pdf')) return <FileText className="h-5 w-5 text-red-500" />
    if (fileType.includes('word') || fileType.includes('document')) return <FileText className="h-5 w-5 text-blue-500" />
    if (fileType.includes('excel') || fileType.includes('sheet')) return <FileSpreadsheet className="h-5 w-5 text-green-500" />
    if (fileType.includes('image')) return <FileImage className="h-5 w-5 text-purple-500" />
    return <File className="h-5 w-5" />
  }

  const getTypeLabel = (type: string) => {
    return DOCUMENT_TYPES.find(t => t.value === type)?.label || type
  }

  // Stats
  const totalDocuments = documents.length
  const publicDocuments = documents.filter(d => d.is_public).length
  const totalDownloads = documents.reduce((sum, d) => sum + (d.download_count || 0), 0)

  if (showForm) {
    return (
      <div className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="sm" onClick={resetForm}>
            <ChevronLeft className="h-4 w-4 mr-1" />
            Kembali
          </Button>
          <div>
            <h1 className="text-2xl font-bold">
              {editingDocument ? "Edit Dokumen" : "Tambah Dokumen Baru"}
            </h1>
            <p className="text-muted-foreground">
              {editingDocument ? "Perbarui informasi dokumen" : "Upload dokumen baru ke portal"}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Main Form */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Informasi Dokumen</CardTitle>
                  <CardDescription>Detail dokumen yang akan diupload</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Judul Dokumen *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                      placeholder="Contoh: Peraturan Nagari No. 1 Tahun 2025"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Deskripsi</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      placeholder="Deskripsi singkat tentang dokumen..."
                      rows={3}
                    />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Tipe Dokumen</Label>
                      <Select 
                        value={formData.document_type} 
                        onValueChange={(value: string) => setFormData({...formData, document_type: value})}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {DOCUMENT_TYPES.map(type => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Tahun</Label>
                      <Select 
                        value={formData.year.toString()} 
                        onValueChange={(value: string) => setFormData({...formData, year: parseInt(value)})}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {YEARS.map(year => (
                            <SelectItem key={year} value={year.toString()}>
                              {year}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {categories.length > 0 && (
                    <div className="space-y-2">
                      <Label>Kategori</Label>
                      <Select 
                        value={formData.category_id} 
                        onValueChange={(value: string) => setFormData({...formData, category_id: value})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih kategori (opsional)" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">Tanpa Kategori</SelectItem>
                          {categories.map(cat => (
                            <SelectItem key={cat.id} value={cat.id.toString()}>
                              {cat.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Upload File</CardTitle>
                  <CardDescription>Upload file dokumen (PDF, DOC, DOCX, XLS, XLSX - Max 10MB)</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {selectedFile || formData.file_name ? (
                    <div className="flex items-center gap-4 p-4 border rounded-lg bg-muted/50">
                      {getFileIcon(selectedFile?.type || formData.file_type)}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{selectedFile?.name || formData.file_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatFileSize(selectedFile?.size || formData.file_size)}
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setSelectedFile(null)
                          setFormData(prev => ({
                            ...prev,
                            file_url: "",
                            file_name: "",
                            file_size: 0,
                            file_type: ""
                          }))
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div 
                      className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="h-10 w-10 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-lg font-medium">Klik untuk upload file</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        atau drag and drop file ke sini
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        PDF, DOC, DOCX, XLS, XLSX (Max 10MB)
                      </p>
                    </div>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.doc,.docx,.xls,.xlsx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) handleFileSelect(file)
                    }}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Status & Visibilitas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select 
                      value={formData.status} 
                      onValueChange={(value: string) => setFormData({...formData, status: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {DOCUMENT_STATUS.map(status => (
                          <SelectItem key={status.value} value={status.value}>
                            {status.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="is_public">Dokumen Publik</Label>
                      <p className="text-xs text-muted-foreground">
                        Dapat diakses tanpa login
                      </p>
                    </div>
                    <Switch
                      id="is_public"
                      checked={formData.is_public}
                      onCheckedChange={(checked: boolean) => setFormData({...formData, is_public: checked})}
                    />
                  </div>
                </CardContent>
              </Card>

              <div className="flex gap-2">
                <Button type="button" variant="outline" className="flex-1" onClick={resetForm}>
                  Batal
                </Button>
                <Button type="submit" className="flex-1" disabled={uploadingFile}>
                  {uploadingFile ? (
                    <>
                      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                      Mengupload...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      {editingDocument ? "Simpan" : "Tambah"}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </form>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Dokumen</h1>
          <p className="text-muted-foreground">Kelola dokumen publik dan arsip nagari</p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Tambah Dokumen
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Dokumen</p>
                <p className="text-2xl font-bold">{totalDocuments}</p>
              </div>
              <FolderOpen className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Dokumen Publik</p>
                <p className="text-2xl font-bold text-green-600">{publicDocuments}</p>
              </div>
              <Eye className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Download</p>
                <p className="text-2xl font-bold text-blue-600">{totalDownloads}</p>
              </div>
              <Download className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari dokumen..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full lg:w-[180px]">
                <SelectValue placeholder="Tipe Dokumen" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Tipe</SelectItem>
                {DOCUMENT_TYPES.map(type => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={yearFilter} onValueChange={setYearFilter}>
              <SelectTrigger className="w-full lg:w-[120px]">
                <SelectValue placeholder="Tahun" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Tahun</SelectItem>
                {YEARS.map(year => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full lg:w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                {DOCUMENT_STATUS.map(status => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Document List */}
      <Card>
        <CardContent className="pt-6">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
              <p className="mt-2 text-muted-foreground">Memuat data...</p>
            </div>
          ) : documents.length === 0 ? (
            <div className="text-center py-8">
              <FolderOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Belum ada dokumen</p>
              <Button className="mt-4" onClick={() => setShowForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Tambah Dokumen Pertama
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Dokumen</TableHead>
                  <TableHead>Tipe</TableHead>
                  <TableHead>Tahun</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-center">Download</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {documents.map(document => (
                  <TableRow key={document.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {getFileIcon(document.file_type)}
                        <div>
                          <p className="font-medium">{document.title}</p>
                          {document.file_name && (
                            <p className="text-xs text-muted-foreground">
                              {document.file_name} • {formatFileSize(document.file_size || 0)}
                            </p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {getTypeLabel(document.document_type)}
                      </Badge>
                    </TableCell>
                    <TableCell>{document.year}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Badge variant={document.status === 'active' ? 'default' : 'secondary'}>
                          {DOCUMENT_STATUS.find(s => s.value === document.status)?.label}
                        </Badge>
                        {document.is_public && (
                          <Badge variant="outline" className="text-green-600">
                            <Eye className="h-3 w-3 mr-1" />
                            Publik
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="text-muted-foreground">{document.download_count || 0}</span>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {document.file_url && (
                            <DropdownMenuItem onClick={() => window.open(document.file_url, '_blank')}>
                              <Download className="h-4 w-4 mr-2" />
                              Download
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem onClick={() => handleEdit(document)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-red-600"
                            onClick={() => {
                              setDocumentToDelete(document)
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
                ))}
              </TableBody>
            </Table>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                Sebelumnya
              </Button>
              <span className="text-sm text-muted-foreground">
                Halaman {currentPage} dari {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                Selanjutnya
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Dokumen?</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus dokumen "{documentToDelete?.title}"? 
              Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
