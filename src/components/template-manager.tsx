import React, { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Badge } from "./ui/badge"
import { Label } from "./ui/label"
import { Textarea } from "./ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "./ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs"
import { Alert, AlertDescription } from "./ui/alert"
import { 
  FileText, 
  Eye, 
  Trash2, 
  Copy, 
  Download,
  Upload,
  RefreshCw,
  CheckCircle,
  FileUp,
  AlertCircle,
  Search,
  MoreVertical,
  Power,
  Info,
  LayoutTemplate,
  Variable,
} from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "./ui/dropdown-menu"
import { suratTemplateService } from "../services/suratTemplateService"
import { Skeleton } from "./ui/skeleton"

interface Template {
  id: number
  kode: string
  nama: string
  kategori: string
  deskripsi?: string
  file_name?: string
  file_path?: string
  format_nomor?: string
  counter: number
  is_active: boolean
  created_at: string
  updated_at: string
}

interface SystemVariable {
  label: string
  source: string
  required?: boolean
  auto?: boolean
  default?: string
}

interface TemplateManagerProps {
  userRole: 'admin_global' | 'admin_nagari' | 'staff_nagari' | 'warga'
}

export function TemplateManager({ userRole }: TemplateManagerProps) {
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [categories, setCategories] = useState<string[]>([])
  const [systemVariables, setSystemVariables] = useState<Record<string, SystemVariable>>({})
  const [statistics, setStatistics] = useState<any>(null)
  
  // Upload dialog state
  const [isUploadOpen, setIsUploadOpen] = useState(false)
  const [uploadForm, setUploadForm] = useState({
    nama: "",
    kode: "",
    kategori: "",
    deskripsi: "",
    format_nomor: "{nomor}/{kode}/{bulan}/{tahun}",
    file: null as File | null,
  })
  const [uploading, setUploading] = useState(false)

  // Detail dialog state
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null)
  const [templateVariables, setTemplateVariables] = useState<string[]>([])
  const [isDetailOpen, setIsDetailOpen] = useState(false)

  // Load data
  const loadTemplates = useCallback(async () => {
    try {
      setLoading(true)
      const data = await suratTemplateService.getAll({
        kategori: selectedCategory !== "all" ? selectedCategory : undefined,
        search: searchQuery || undefined,
      })
      setTemplates(Array.isArray(data) ? data : data.data || [])
    } catch (err: any) {
      setError(err.message || "Gagal memuat template")
      setTemplates([])
    } finally {
      setLoading(false)
    }
  }, [selectedCategory, searchQuery])

  const loadCategories = async () => {
    try {
      const data = await suratTemplateService.getCategories()
      setCategories(data.used_categories || [])
    } catch (err) {
      console.error("Failed to load categories:", err)
    }
  }

  const loadVariables = async () => {
    try {
      const data = await suratTemplateService.getVariables()
      setSystemVariables(data)
    } catch (err) {
      console.error("Failed to load variables:", err)
    }
  }

  const loadStatistics = async () => {
    try {
      const data = await suratTemplateService.getStatistics()
      setStatistics(data)
    } catch (err) {
      console.error("Failed to load statistics:", err)
    }
  }

  useEffect(() => {
    loadTemplates()
    loadCategories()
    loadVariables()
    loadStatistics()
  }, [loadTemplates])

  // Auto-hide messages
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(null), 3000)
      return () => clearTimeout(timer)
    }
  }, [success])

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000)
      return () => clearTimeout(timer)
    }
  }, [error])

  // Handle upload
  const handleUpload = async () => {
    if (!uploadForm.file || !uploadForm.nama || !uploadForm.kode || !uploadForm.kategori) {
      setError("Mohon lengkapi semua field yang wajib diisi")
      return
    }

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append("file", uploadForm.file)
      formData.append("nama", uploadForm.nama)
      formData.append("kode", uploadForm.kode.toUpperCase())
      formData.append("kategori", uploadForm.kategori)
      formData.append("deskripsi", uploadForm.deskripsi)
      formData.append("format_nomor", uploadForm.format_nomor)

      await suratTemplateService.upload(formData)
      setSuccess("Template berhasil diupload!")
      setIsUploadOpen(false)
      setUploadForm({
        nama: "",
        kode: "",
        kategori: "",
        deskripsi: "",
        format_nomor: "{nomor}/{kode}/{bulan}/{tahun}",
        file: null,
      })
      loadTemplates()
      loadStatistics()
    } catch (err: any) {
      setError(err.message || "Gagal mengupload template")
    } finally {
      setUploading(false)
    }
  }

  // Handle view detail
  const handleViewDetail = async (template: Template) => {
    setSelectedTemplate(template)
    setIsDetailOpen(true)
    try {
      const data = await suratTemplateService.extractVariables(template.id)
      setTemplateVariables(data.template_variables || [])
    } catch (err) {
      console.error("Failed to extract variables:", err)
    }
  }

  // Handle toggle active
  const handleToggleActive = async (template: Template) => {
    try {
      await suratTemplateService.toggleActive(template.id)
      setSuccess(`Template ${template.is_active ? 'dinonaktifkan' : 'diaktifkan'}`)
      loadTemplates()
    } catch (err: any) {
      setError(err.message || "Gagal mengubah status template")
    }
  }

  // Handle duplicate
  const handleDuplicate = async (template: Template) => {
    try {
      await suratTemplateService.duplicate(template.id)
      setSuccess("Template berhasil diduplikasi")
      loadTemplates()
    } catch (err: any) {
      setError(err.message || "Gagal menduplikasi template")
    }
  }

  // Handle download
  const handleDownload = async (template: Template) => {
    try {
      const response = await suratTemplateService.download(template.id)
      const url = window.URL.createObjectURL(new Blob([response]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', template.file_name || `${template.kode}.docx`)
      document.body.appendChild(link)
      link.click()
      link.remove()
    } catch (err: any) {
      setError(err.message || "Gagal mendownload template")
    }
  }

  // Handle delete
  const handleDelete = async (template: Template) => {
    if (!confirm(`Yakin ingin menghapus template "${template.nama}"?`)) return
    
    try {
      await suratTemplateService.delete(template.id)
      setSuccess("Template berhasil dihapus")
      loadTemplates()
      loadStatistics()
    } catch (err: any) {
      setError(err.message || "Gagal menghapus template")
    }
  }

  // Filter templates
  const filteredTemplates = templates.filter(t => {
    const matchSearch = !searchQuery || 
      t.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.kode.toLowerCase().includes(searchQuery.toLowerCase())
    const matchCategory = selectedCategory === "all" || t.kategori === selectedCategory
    return matchSearch && matchCategory
  })

  return (
    <div className="space-y-6">
      {/* Alerts */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {success && (
        <Alert className="border-green-500 bg-green-50 text-green-700">
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Template Surat</h1>
          <p className="text-muted-foreground">Kelola template surat untuk pelayanan nagari</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => { loadTemplates(); loadStatistics(); }}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Upload className="h-4 w-4 mr-2" />
                Upload Template
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Upload Template Baru</DialogTitle>
                <DialogDescription>
                  Upload file template Word (.docx) dengan variable placeholder
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                {/* File upload */}
                <div className="space-y-2">
                  <Label>File Template (.docx) *</Label>
                  <div className="border-2 border-dashed rounded-lg p-6 text-center">
                    <input
                      type="file"
                      accept=".docx,.doc"
                      className="hidden"
                      id="template-file"
                      onChange={(e) => setUploadForm(prev => ({ ...prev, file: e.target.files?.[0] || null }))}
                    />
                    <label htmlFor="template-file" className="cursor-pointer">
                      {uploadForm.file ? (
                        <div className="flex items-center justify-center gap-2 text-green-600">
                          <CheckCircle className="h-5 w-5" />
                          <span>{uploadForm.file.name}</span>
                        </div>
                      ) : (
                        <div className="text-muted-foreground">
                          <FileUp className="h-8 w-8 mx-auto mb-2" />
                          <p>Klik untuk pilih file atau drag & drop</p>
                          <p className="text-xs mt-1">Format: .docx (max 10MB)</p>
                        </div>
                      )}
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Kode Template *</Label>
                    <Input 
                      placeholder="SKD, SKU, SKTM..." 
                      value={uploadForm.kode}
                      onChange={(e) => setUploadForm(prev => ({ ...prev, kode: e.target.value.toUpperCase() }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Kategori *</Label>
                    <Select 
                      value={uploadForm.kategori} 
                      onValueChange={(v) => setUploadForm(prev => ({ ...prev, kategori: v }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih kategori" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Keterangan">Surat Keterangan</SelectItem>
                        <SelectItem value="Pengantar">Surat Pengantar</SelectItem>
                        <SelectItem value="Keputusan">Surat Keputusan</SelectItem>
                        <SelectItem value="Undangan">Surat Undangan</SelectItem>
                        <SelectItem value="Pemberitahuan">Surat Pemberitahuan</SelectItem>
                        <SelectItem value="Lainnya">Lainnya</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Nama Template *</Label>
                  <Input 
                    placeholder="Surat Keterangan Domisili" 
                    value={uploadForm.nama}
                    onChange={(e) => setUploadForm(prev => ({ ...prev, nama: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Deskripsi</Label>
                  <Textarea 
                    placeholder="Deskripsi singkat template ini..."
                    value={uploadForm.deskripsi}
                    onChange={(e) => setUploadForm(prev => ({ ...prev, deskripsi: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Format Nomor Surat</Label>
                  <Input 
                    placeholder="{nomor}/{kode}/{bulan}/{tahun}" 
                    value={uploadForm.format_nomor}
                    onChange={(e) => setUploadForm(prev => ({ ...prev, format_nomor: e.target.value }))}
                  />
                  <p className="text-xs text-muted-foreground">
                    Variable: {"{nomor}"}, {"{kode}"}, {"{bulan}"}, {"{tahun}"}
                  </p>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsUploadOpen(false)}>
                  Batal
                </Button>
                <Button onClick={handleUpload} disabled={uploading}>
                  {uploading ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Mengupload...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Statistics Cards */}
      {statistics && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <LayoutTemplate className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{statistics.total_templates || 0}</p>
                  <p className="text-sm text-muted-foreground">Total Template</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{statistics.active_templates || 0}</p>
                  <p className="text-sm text-muted-foreground">Template Aktif</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <FileText className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{statistics.total_surat_generated || 0}</p>
                  <p className="text-sm text-muted-foreground">Surat Tergenerate</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Variable className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{Object.keys(systemVariables).length}</p>
                  <p className="text-sm text-muted-foreground">System Variables</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Cari template..." 
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Semua Kategori" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Kategori</SelectItem>
            {categories.map(cat => (
              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Templates Table */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Template</CardTitle>
          <CardDescription>
            {filteredTemplates.length} template ditemukan
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : filteredTemplates.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Belum ada template</p>
              <p className="text-sm">Upload template pertama Anda</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Kode</TableHead>
                    <TableHead>Nama Template</TableHead>
                    <TableHead>Kategori</TableHead>
                    <TableHead className="text-center">Digunakan</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTemplates.map((template) => (
                    <TableRow key={template.id}>
                      <TableCell>
                        <Badge variant="outline" className="font-mono">
                          {template.kode}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{template.nama}</p>
                          {template.deskripsi && (
                            <p className="text-sm text-muted-foreground truncate max-w-xs">
                              {template.deskripsi}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{template.kategori}</Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="font-medium">{template.counter || 0}x</span>
                      </TableCell>
                      <TableCell>
                        <Badge variant={template.is_active ? "default" : "secondary"}>
                          {template.is_active ? "Aktif" : "Nonaktif"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleViewDetail(template)}>
                              <Eye className="h-4 w-4 mr-2" />
                              Lihat Detail
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDownload(template)}>
                              <Download className="h-4 w-4 mr-2" />
                              Download
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDuplicate(template)}>
                              <Copy className="h-4 w-4 mr-2" />
                              Duplikasi
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleToggleActive(template)}>
                              <Power className="h-4 w-4 mr-2" />
                              {template.is_active ? "Nonaktifkan" : "Aktifkan"}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className="text-red-600"
                              onClick={() => handleDelete(template)}
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
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detail Template</DialogTitle>
            <DialogDescription>
              Informasi lengkap template surat
            </DialogDescription>
          </DialogHeader>
          
          {selectedTemplate && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Kode</Label>
                  <p className="font-mono font-medium">{selectedTemplate.kode}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Kategori</Label>
                  <p>{selectedTemplate.kategori}</p>
                </div>
                <div className="col-span-2">
                  <Label className="text-muted-foreground">Nama</Label>
                  <p className="font-medium">{selectedTemplate.nama}</p>
                </div>
                {selectedTemplate.deskripsi && (
                  <div className="col-span-2">
                    <Label className="text-muted-foreground">Deskripsi</Label>
                    <p>{selectedTemplate.deskripsi}</p>
                  </div>
                )}
                <div>
                  <Label className="text-muted-foreground">Format Nomor</Label>
                  <p className="font-mono text-sm">{selectedTemplate.format_nomor}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Total Digunakan</Label>
                  <p>{selectedTemplate.counter || 0}x</p>
                </div>
              </div>

              {templateVariables.length > 0 && (
                <div>
                  <Label className="text-muted-foreground mb-2 block">Variables dalam Template</Label>
                  <div className="flex flex-wrap gap-2">
                    {templateVariables.map(v => (
                      <Badge key={v} variant="outline" className="font-mono">
                        {"\${" + v + "}"}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => handleDownload(selectedTemplate)}>
                  <Download className="h-4 w-4 mr-2" />
                  Download Template
                </Button>
                <Button variant="outline" className="flex-1" onClick={() => handleDuplicate(selectedTemplate)}>
                  <Copy className="h-4 w-4 mr-2" />
                  Duplikasi
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Variables Reference */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Variable className="h-5 w-5" />
            Referensi Variables
          </CardTitle>
          <CardDescription>
            Daftar variable yang bisa digunakan dalam template Word
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="warga">
            <TabsList className="mb-4">
              <TabsTrigger value="warga">Data Warga</TabsTrigger>
              <TabsTrigger value="alamat">Alamat</TabsTrigger>
              <TabsTrigger value="surat">Data Surat</TabsTrigger>
              <TabsTrigger value="input">Input User</TabsTrigger>
            </TabsList>
            
            <TabsContent value="warga" className="space-y-2">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {['NIK', 'NAMA', 'TEMPAT_LAHIR', 'TANGGAL_LAHIR', 'JENIS_KELAMIN', 'AGAMA', 'PEKERJAAN', 'PENDIDIKAN'].map(v => (
                  <div key={v} className="p-2 border rounded-md">
                    <code className="text-sm text-blue-600">{"\${" + v + "}"}</code>
                    <p className="text-xs text-muted-foreground mt-1">{systemVariables[v]?.label || v}</p>
                  </div>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="alamat" className="space-y-2">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {['ALAMAT', 'RT', 'RW', 'JORONG', 'NAGARI', 'KECAMATAN', 'KABUPATEN', 'PROVINSI'].map(v => (
                  <div key={v} className="p-2 border rounded-md">
                    <code className="text-sm text-blue-600">{"\${" + v + "}"}</code>
                    <p className="text-xs text-muted-foreground mt-1">{systemVariables[v]?.label || v}</p>
                  </div>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="surat" className="space-y-2">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {['NOMOR_SURAT', 'TANGGAL_SURAT', 'TANGGAL_SURAT_LENGKAP', 'NAMA_NAGARI', 'WALI_NAGARI', 'NIP_WALI_NAGARI'].map(v => (
                  <div key={v} className="p-2 border rounded-md">
                    <code className="text-sm text-blue-600">{"\${" + v + "}"}</code>
                    <p className="text-xs text-muted-foreground mt-1">{systemVariables[v]?.label || v}</p>
                  </div>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="input" className="space-y-2">
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Variable berikut diisi oleh user melalui WhatsApp atau form permohonan
                </AlertDescription>
              </Alert>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {['KEPERLUAN', 'NAMA_USAHA', 'JENIS_USAHA', 'ALAMAT_USAHA', 'TUJUAN_SURAT'].map(v => (
                  <div key={v} className="p-2 border rounded-md">
                    <code className="text-sm text-orange-600">{"\${" + v + "}"}</code>
                    <p className="text-xs text-muted-foreground mt-1">{systemVariables[v]?.label || v}</p>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
