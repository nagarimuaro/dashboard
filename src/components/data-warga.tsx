import React, { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Badge } from "./ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table"
import { Label } from "./ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { 
  Search, 
  Eye, 
  Trash2, 
  Loader2,
  Plus,
  UserPlus,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Upload,
  Download,
  FileSpreadsheet,
  CheckCircle,
  XCircle,
  AlertCircle,
  Filter,
  ChevronDown,
  ChevronUp,
  FileText,
  RotateCcw
} from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "./ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu"
import { wargaService } from "../services/wargaService.js"
import { Progress } from "./ui/progress"

interface DataWargaProps {
  userRole: 'admin_global' | 'admin_nagari' | 'staff_nagari' | 'warga'
  onNavigateToDetail?: (wargaId: string | number) => void
}

interface ImportResult {
  total: number;
  success: number;
  failed: number;
  skipped: number;
  keluarga_created: number;
  errors: Array<{
    row: number;
    nik?: string;
    nama?: string;
    message: string;
  }>;
}

// Filter options
const AGAMA_OPTIONS = ['Islam', 'Kristen', 'Katolik', 'Hindu', 'Buddha', 'Konghucu', 'Kepercayaan'];
const PENDIDIKAN_OPTIONS = ['Tidak/Belum Sekolah', 'Tidak Tamat SD', 'Tamat SD/Sederajat', 'SLTP/Sederajat', 'SLTA/Sederajat', 'Diploma I/II', 'Akademi/Diploma III/S.Muda', 'Diploma IV/Strata I', 'Strata II', 'Strata III'];
const PEKERJAAN_OPTIONS = ['Belum/Tidak Bekerja', 'Mengurus Rumah Tangga', 'Pelajar/Mahasiswa', 'Pensiunan', 'PNS', 'TNI', 'POLRI', 'Petani/Pekebun', 'Nelayan', 'Pedagang', 'Wiraswasta', 'Karyawan Swasta', 'Karyawan BUMN', 'Karyawan BUMD', 'Karyawan Honorer', 'Buruh Harian Lepas', 'Buruh Tani/Perkebunan', 'Pembantu Rumah Tangga', 'Tukang Batu', 'Sopir', 'Guru', 'Dokter', 'Perawat', 'Bidan', 'Lainnya'];
const SHDK_OPTIONS = ['Kepala Keluarga', 'Istri', 'Anak', 'Menantu', 'Cucu', 'Orang Tua', 'Mertua', 'Famili Lain', 'Pembantu', 'Lainnya'];

export function DataWarga({ userRole, onNavigateToDetail }: DataWargaProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedGender, setSelectedGender] = useState("all")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [wargaData, setWargaData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({
    page: 1,
    per_page: 15,
    total: 0,
    total_pages: 0
  })

  // Advanced filter states
  const [showAdvancedFilter, setShowAdvancedFilter] = useState(false)
  const [filterAgama, setFilterAgama] = useState("all")
  const [filterPendidikan, setFilterPendidikan] = useState("all")
  const [filterPekerjaan, setFilterPekerjaan] = useState("all")
  const [filterJorong, setFilterJorong] = useState("all")
  const [filterRT, setFilterRT] = useState("")
  const [filterRW, setFilterRW] = useState("")
  const [filterShdk, setFilterShdk] = useState("all")
  const [filterUmurMin, setFilterUmurMin] = useState("")
  const [filterUmurMax, setFilterUmurMax] = useState("")
  const [exportLoading, setExportLoading] = useState(false)
  const [exportProgress, setExportProgress] = useState(0)
  const [jorongOptions, setJorongOptions] = useState<string[]>([])
  
  // State for Import Dialog
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false)
  const [importFile, setImportFile] = useState<File | null>(null)
  const [importLoading, setImportLoading] = useState(false)
  const [importProgress, setImportProgress] = useState(0)
  const [importResult, setImportResult] = useState<ImportResult | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // State for Add Warga Dialog
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    nik: '',
    no_kk: '',
    nama: '',
    nama_ayah: '',
    nama_ibu: '',
    tempat_lahir: '',
    tanggal_lahir: '',
    jenis_kelamin: 'L',
    status_perkawinan: 'Belum Kawin',
    shdk: '',
    pendidikan: '',
    pekerjaan: '',
    agama: 'Islam',
    alamat: '',
    rt: '',
    rw: '',
    jorong: '',
    kecamatan: '',
    status_domisili: 'Tetap',
    no_hp: '',
    email: ''
  })
  const [formError, setFormError] = useState('')

  // Build filter parameters
  const buildFilterParams = () => {
    const params: any = {}
    if (searchTerm) params.search = searchTerm
    if (selectedGender !== 'all') params.jenis_kelamin = selectedGender
    if (selectedStatus !== 'all') params.status_perkawinan = selectedStatus
    if (filterAgama !== 'all') params.agama = filterAgama
    if (filterPendidikan !== 'all') params.pendidikan = filterPendidikan
    if (filterPekerjaan !== 'all') params.pekerjaan = filterPekerjaan
    if (filterJorong !== 'all') params.jorong = filterJorong
    if (filterRT) params.rt = filterRT
    if (filterRW) params.rw = filterRW
    if (filterShdk !== 'all') params.shdk = filterShdk
    if (filterUmurMin) params.umur_min = filterUmurMin
    if (filterUmurMax) params.umur_max = filterUmurMax
    return params
  }

  // Load warga data from API
  const loadWargaData = async (params = {}) => {
    try {
      setLoading(true)
      const filterParams = buildFilterParams()
      const requestParams = {
        page: pagination.page,
        per_page: pagination.per_page,
        ...filterParams,
        ...params
      }
      
      const response = await wargaService.getAll(requestParams)
      
      if (response && response.data) {
        // Handle direct Laravel pagination response structure
        const wargaList = Array.isArray(response.data) ? response.data : []
        const meta = response.meta || {}
        
        setWargaData(wargaList)
        
        // Extract unique jorong for filter options
        if (jorongOptions.length === 0 && wargaList.length > 0) {
          const uniqueJorong = [...new Set(wargaList.map((w: any) => w.jorong).filter(Boolean))] as string[]
          if (uniqueJorong.length > 0) {
            setJorongOptions(uniqueJorong)
          }
        }
        
        // Update pagination info from Laravel meta
        setPagination({
          page: meta.current_page || 1,
          per_page: meta.per_page || 15,
          total: meta.total || wargaList.length,
          total_pages: meta.last_page || 1
        })
      } else {
        console.error('Failed to load warga data:', response?.message || 'No data received')
        setWargaData([])
      }
    } catch (error) {
      console.error('Error loading warga data:', error)
      setWargaData([])
    } finally {
      setLoading(false)
    }
  }

  // Handle export with filters
  const handleExport = async (format: 'pdf' | 'csv') => {
    try {
      setExportLoading(true)
      setExportProgress(0)
      const filterParams = buildFilterParams()
      
      const blob = await wargaService.exportWithDownload(filterParams, format, (progress: number) => {
        if (progress >= 0) {
          setExportProgress(progress)
        }
      })
      
      // Set to 100% before download
      setExportProgress(100)
      
      // Create download link
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `data_warga_${new Date().toISOString().slice(0, 10)}.${format}`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Export failed:', error)
      alert('Gagal mengekspor data. Silakan coba lagi.')
    } finally {
      // Keep 100% for a moment before hiding
      setTimeout(() => {
        setExportLoading(false)
        setExportProgress(0)
      }, 500)
    }
  }

  // Reset all filters
  const handleResetFilters = () => {
    setSearchTerm("")
    setSelectedGender("all")
    setSelectedStatus("all")
    setFilterAgama("all")
    setFilterPendidikan("all")
    setFilterPekerjaan("all")
    setFilterJorong("all")
    setFilterRT("")
    setFilterRW("")
    setFilterShdk("all")
    setFilterUmurMin("")
    setFilterUmurMax("")
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  // Apply filters
  const handleApplyFilters = () => {
    setPagination(prev => ({ ...prev, page: 1 }))
    loadWargaData({ page: 1 })
  }

  // Load data on component mount and when filters change
  useEffect(() => {
    loadWargaData()
  }, [pagination.page, selectedGender, selectedStatus, filterAgama, filterPendidikan, filterPekerjaan, filterJorong, filterRT, filterRW, filterShdk, filterUmurMin, filterUmurMax])

  // Handle search with debounce
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (searchTerm !== '') {
        loadWargaData({ search: searchTerm, page: 1 })
      } else {
        loadWargaData({ page: 1 })
      }
    }, 500)

    return () => clearTimeout(debounceTimer)
  }, [searchTerm])

  // Handle view warga detail
  const handleViewDetail = (warga: any) => {
    console.log('Navigating to detail for warga:', warga)
    console.log('onNavigateToDetail function available:', !!onNavigateToDetail)
    if (onNavigateToDetail) {
      onNavigateToDetail(warga.id || warga.nik)
    } else {
      console.error('onNavigateToDetail function not provided')
    }
  }

  // Handle add warga
  const handleAddWarga = async () => {
    try {
      setFormError('')
      
      // Validate required fields
      if (!formData.nik || !formData.nama) {
        setFormError('NIK dan Nama wajib diisi!')
        return
      }
      
      console.log('📤 Submitting warga data:', formData)
      const response = await wargaService.create(formData)
      
      console.log('✅ Warga created successfully:', response)
      alert('Data warga berhasil ditambahkan!')
      
      // Close dialog and reset form
      setIsAddDialogOpen(false)
      setFormData({
        nik: '',
        no_kk: '',
        nama: '',
        nama_ayah: '',
        nama_ibu: '',
        tempat_lahir: '',
        tanggal_lahir: '',
        jenis_kelamin: 'L',
        status_perkawinan: 'Belum Kawin',
        shdk: '',
        pendidikan: '',
        pekerjaan: '',
        agama: 'Islam',
        alamat: '',
        rt: '',
        rw: '',
        jorong: '',
        kecamatan: '',
        status_domisili: 'Tetap',
        no_hp: '',
        email: ''
      })
      setFormError('')
      
      // Reload data
      loadWargaData()
    } catch (error: any) {
      console.error('❌ Error creating warga:', error)
      
      // Handle specific error messages
      if (error.response?.data?.message) {
        setFormError(error.response.data.message)
      } else if (error.response?.data?.errors) {
        const errors = Object.values(error.response.data.errors).flat()
        setFormError(errors.join(', '))
      } else {
        setFormError('Gagal menambahkan warga: ' + (error.message || 'Terjadi kesalahan'))
      }
    }
  }

  // Handle import file select
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type
      const allowedTypes = [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // xlsx
        'application/vnd.ms-excel', // xls
        'text/csv',
      ]
      const allowedExtensions = ['.xlsx', '.xls', '.csv']
      const fileExtension = file.name.toLowerCase().slice(file.name.lastIndexOf('.'))
      
      if (!allowedTypes.includes(file.type) && !allowedExtensions.includes(fileExtension)) {
        alert('Format file tidak didukung. Gunakan file .xlsx, .xls, atau .csv')
        return
      }
      
      setImportFile(file)
      setImportResult(null)
    }
  }

  // Handle import
  const handleImport = async () => {
    if (!importFile) {
      alert('Pilih file terlebih dahulu')
      return
    }

    try {
      setImportLoading(true)
      setImportProgress(0)
      setImportResult(null)

      // Use progress callback for upload progress
      const response = await wargaService.bulkImport(importFile, (progress) => {
        setImportProgress(progress)
      })

      console.log('Import response:', response)

      if (response.success) {
        setImportResult(response.data)
        // Reload data after successful import
        loadWargaData()
      } else {
        alert('Import gagal: ' + (response.message || 'Terjadi kesalahan'))
      }
    } catch (error: any) {
      console.error('Import error:', error)
      alert('Import gagal: ' + (error.message || 'Terjadi kesalahan'))
    } finally {
      setImportLoading(false)
    }
  }

  // Handle download template
  const handleDownloadTemplate = async () => {
    try {
      const blob = await wargaService.downloadTemplate()
      
      // Create download link from blob
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'template_import_warga.csv'
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Download template error:', error)
      alert('Gagal download template')
    }
  }

  // Reset import dialog
  const resetImportDialog = () => {
    setImportFile(null)
    setImportResult(null)
    setImportProgress(0)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // Handle delete warga
  const handleDeleteWarga = async (id: string | number) => {
    if (confirm('Apakah Anda yakin ingin menghapus data warga ini?')) {
      try {
        const response = await wargaService.delete(id)
        
        // Check if deletion was successful
        if (response && (response.success !== false || response.data)) {
          console.log('Warga deleted successfully')
          loadWargaData() // Reload data to reflect deletion
          alert('Data warga berhasil dihapus')
        } else {
          console.error('Failed to delete warga:', response?.message || 'Unknown error')
          alert('Gagal menghapus data warga. Silakan coba lagi.')
        }
      } catch (error) {
        console.error('Error deleting warga:', error)
        alert('Terjadi error saat menghapus data warga. Silakan coba lagi.')
      }
    }
  }

  return (
    <div className="space-y-6">
      {/* Export Progress Dialog */}
      {exportLoading && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-80 p-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
                <span className="font-medium">
                  {exportProgress === 100 ? 'Download selesai!' : 'Mengekspor data...'}
                </span>
              </div>
              <Progress value={exportProgress} className="h-2" />
              <p className="text-sm text-muted-foreground text-center">
                {exportProgress}%
              </p>
            </div>
          </Card>
        </div>
      )}

      {/* Data Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle>Data Warga</CardTitle>
              <CardDescription>
                {loading ? 'Memuat data...' : `Menampilkan ${wargaData.length} dari ${pagination.total} warga`}
              </CardDescription>
            </div>
            <div className="flex gap-2 items-center flex-wrap">
              <div className="relative flex items-center h-9 px-3 border border-input bg-background rounded-md hover:bg-accent hover:text-accent-foreground">
                <Search className="h-4 w-4 text-muted-foreground mr-2" />
                <Input
                  placeholder="Cari nama atau NIK..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="border-0 p-0 h-auto w-[150px] focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent"
                />
              </div>
              <Button 
                variant="outline" 
                onClick={() => setShowAdvancedFilter(!showAdvancedFilter)}
                className="gap-2"
              >
                <Filter className="h-4 w-4" />
                Filter
                {showAdvancedFilter ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
              {userRole !== 'warga' && (
                <>
                  {/* Export Button with Dropdown */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" disabled={exportLoading}>
                        {exportLoading ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Download className="h-4 w-4 mr-2" />
                        )}
                        Export
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleExport('pdf')}>
                        <FileText className="h-4 w-4 mr-2 text-red-600" />
                        PDF
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleExport('csv')}>
                        <FileSpreadsheet className="h-4 w-4 mr-2 text-green-600" />
                        CSV
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  {/* Import Button */}
                  <Dialog open={isImportDialogOpen} onOpenChange={(open: boolean) => {
                    setIsImportDialogOpen(open)
                    if (!open) resetImportDialog()
                  }}>
                    <DialogTrigger asChild>
                      <Button variant="outline">
                        <Upload className="h-4 w-4 mr-2" />
                        Import
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Import Data Warga</DialogTitle>
                        <DialogDescription>
                          Upload file Excel (.xlsx) atau CSV untuk import data warga secara massal.
                          Data keluarga akan otomatis dibuat berdasarkan No. KK.
                        </DialogDescription>
                      </DialogHeader>
                      
                      <div className="space-y-4 py-4">
                        {/* Download Template */}
                        <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
                          <div className="flex items-center gap-3">
                            <FileSpreadsheet className="h-8 w-8 text-blue-600" />
                            <div>
                              <p className="font-medium text-blue-900">Template Import</p>
                              <p className="text-sm text-blue-700">Download template untuk format data yang benar</p>
                            </div>
                          </div>
                          <Button variant="outline" size="sm" onClick={handleDownloadTemplate}>
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </Button>
                        </div>

                        {/* File Upload */}
                        <div className="space-y-2">
                          <Label>Pilih File</Label>
                          <div className="flex gap-2">
                            <Input
                              ref={fileInputRef}
                              type="file"
                              accept=".xlsx,.xls,.csv"
                              onChange={handleFileSelect}
                              disabled={importLoading}
                            />
                          </div>
                          {importFile && (
                            <p className="text-sm text-muted-foreground">
                              File: {importFile.name} ({(importFile.size / 1024 / 1024).toFixed(2)} MB)
                            </p>
                          )}
                        </div>

                        {/* Progress */}
                        {importLoading && (
                          <div className="space-y-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                                <span className="text-sm font-medium text-blue-900">
                                  {importProgress < 100 ? 'Mengupload file...' : 'Memproses data...'}
                                </span>
                              </div>
                              <span className="text-sm font-bold text-blue-700">{importProgress}%</span>
                            </div>
                            <Progress value={importProgress} className="h-3" />
                            <p className="text-xs text-blue-600">
                              {importProgress < 100 
                                ? 'Mohon tunggu, jangan tutup halaman ini...' 
                                : 'Upload selesai, sedang memproses data di server...'}
                            </p>
                          </div>
                        )}

                        {/* Import Result */}
                        {importResult && (
                          <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
                            <h4 className="font-semibold">Hasil Import</h4>
                            
                            <div className="grid grid-cols-2 gap-3">
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-muted-foreground">Total Data:</span>
                                <Badge variant="secondary">{importResult.total}</Badge>
                              </div>
                              <div className="flex items-center gap-2">
                                <CheckCircle className="h-4 w-4 text-green-600" />
                                <span className="text-sm">Berhasil: {importResult.success}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <AlertCircle className="h-4 w-4 text-yellow-600" />
                                <span className="text-sm">Dilewati: {importResult.skipped}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <XCircle className="h-4 w-4 text-red-600" />
                                <span className="text-sm">Gagal: {importResult.failed}</span>
                              </div>
                            </div>

                            {importResult.keluarga_created > 0 && (
                              <div className="flex items-center gap-2 pt-2 border-t">
                                <span className="text-sm text-green-700">
                                  ✓ {importResult.keluarga_created} Kartu Keluarga baru dibuat
                                </span>
                              </div>
                            )}

                            {/* Error Details */}
                            {importResult.errors && importResult.errors.length > 0 && (
                              <div className="mt-3">
                                <p className="text-sm font-medium text-red-700 mb-2">
                                  Detail Error ({importResult.errors.length} baris):
                                </p>
                                <div className="max-h-40 overflow-y-auto space-y-1">
                                  {importResult.errors.slice(0, 20).map((err, idx) => (
                                    <div key={idx} className="text-xs p-2 bg-red-50 rounded">
                                      <span className="font-medium">Baris {err.row}:</span>{' '}
                                      {err.nama && <span>{err.nama} - </span>}
                                      {err.message}
                                    </div>
                                  ))}
                                  {importResult.errors.length > 20 && (
                                    <p className="text-xs text-muted-foreground">
                                      ...dan {importResult.errors.length - 20} error lainnya
                                    </p>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsImportDialogOpen(false)}>
                          {importResult ? 'Tutup' : 'Batal'}
                        </Button>
                        {!importResult && (
                          <Button onClick={handleImport} disabled={!importFile || importLoading}>
                            {importLoading ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Mengimport...
                              </>
                            ) : (
                              <>
                                <Upload className="h-4 w-4 mr-2" />
                                Import Data
                              </>
                            )}
                          </Button>
                        )}
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>

                  {/* Add Warga Button */}
                  <Button 
                    onClick={() => window.location.href = '/kependudukan/data-warga/add'}
                    style={{ backgroundColor: '#2563eb', color: 'white' }}
                    className="hover:bg-blue-700"
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Tambah Warga
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Advanced Filter Panel */}
          {showAdvancedFilter && (
            <div className="mb-4 p-4 border rounded-lg bg-muted/30 space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {/* Jenis Kelamin */}
                <div className="space-y-2">
                  <Label>Jenis Kelamin</Label>
                  <Select value={selectedGender} onValueChange={setSelectedGender}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua</SelectItem>
                      <SelectItem value="L">Laki-laki</SelectItem>
                      <SelectItem value="P">Perempuan</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Status Perkawinan */}
                <div className="space-y-2">
                  <Label>Status Perkawinan</Label>
                  <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua</SelectItem>
                      <SelectItem value="Belum Kawin">Belum Kawin</SelectItem>
                      <SelectItem value="Kawin">Kawin</SelectItem>
                      <SelectItem value="Cerai Hidup">Cerai Hidup</SelectItem>
                      <SelectItem value="Cerai Mati">Cerai Mati</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Agama */}
                <div className="space-y-2">
                  <Label>Agama</Label>
                  <Select value={filterAgama} onValueChange={setFilterAgama}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih Agama" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua</SelectItem>
                      {AGAMA_OPTIONS.map(agama => (
                        <SelectItem key={agama} value={agama}>{agama}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Pendidikan */}
                <div className="space-y-2">
                  <Label>Pendidikan</Label>
                  <Select value={filterPendidikan} onValueChange={setFilterPendidikan}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih Pendidikan" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua</SelectItem>
                      {PENDIDIKAN_OPTIONS.map(pend => (
                        <SelectItem key={pend} value={pend}>{pend}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Pekerjaan */}
                <div className="space-y-2">
                  <Label>Pekerjaan</Label>
                  <Select value={filterPekerjaan} onValueChange={setFilterPekerjaan}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih Pekerjaan" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua</SelectItem>
                      {PEKERJAAN_OPTIONS.map(pek => (
                        <SelectItem key={pek} value={pek}>{pek}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* SHDK */}
                <div className="space-y-2">
                  <Label>SHDK</Label>
                  <Select value={filterShdk} onValueChange={setFilterShdk}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih SHDK" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua</SelectItem>
                      {SHDK_OPTIONS.map(shdk => (
                        <SelectItem key={shdk} value={shdk}>{shdk}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Jorong */}
                <div className="space-y-2">
                  <Label>Jorong</Label>
                  <Select value={filterJorong} onValueChange={setFilterJorong}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih Jorong" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua</SelectItem>
                      {jorongOptions.map(jorong => (
                        <SelectItem key={jorong} value={jorong}>{jorong}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* RT */}
                <div className="space-y-2">
                  <Label>RT</Label>
                  <Input 
                    placeholder="RT" 
                    value={filterRT} 
                    onChange={(e) => setFilterRT(e.target.value)}
                    type="number"
                    min="1"
                  />
                </div>

                {/* RW */}
                <div className="space-y-2">
                  <Label>RW</Label>
                  <Input 
                    placeholder="RW" 
                    value={filterRW} 
                    onChange={(e) => setFilterRW(e.target.value)}
                    type="number"
                    min="1"
                  />
                </div>

                {/* Umur Min */}
                <div className="space-y-2">
                  <Label>Umur Min</Label>
                  <Input 
                    placeholder="Min" 
                    value={filterUmurMin} 
                    onChange={(e) => setFilterUmurMin(e.target.value)}
                    type="number"
                    min="0"
                    max="150"
                  />
                </div>

                {/* Umur Max */}
                <div className="space-y-2">
                  <Label>Umur Max</Label>
                  <Input 
                    placeholder="Max" 
                    value={filterUmurMax} 
                    onChange={(e) => setFilterUmurMax(e.target.value)}
                    type="number"
                    min="0"
                    max="150"
                  />
                </div>
              </div>

              {/* Filter Action Buttons */}
              <div className="flex gap-2 justify-end pt-2 border-t">
                <Button variant="outline" onClick={handleResetFilters} className="gap-2">
                  <RotateCcw className="h-4 w-4" />
                  Reset Filter
                </Button>
                <Button onClick={handleApplyFilters} className="gap-2">
                  <Filter className="h-4 w-4" />
                  Terapkan Filter
                </Button>
              </div>
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="ml-2">Memuat data warga...</span>
            </div>
          ) : (
            <div className="rounded-md border max-h-[600px] overflow-y-auto">
              <Table>
                <TableHeader className="sticky top-0 bg-background z-10">
                  <TableRow>
                    <TableHead className="w-[50px]">No</TableHead>
                    <TableHead className="w-[120px]">NIK</TableHead>
                    <TableHead>Nama</TableHead>
                    <TableHead className="w-[50px] text-center">JK</TableHead>
                    <TableHead>TTL</TableHead>
                    <TableHead className="w-[60px] text-center">Umur</TableHead>
                    <TableHead>Pendidikan</TableHead>
                    <TableHead>Pekerjaan</TableHead>
                    <TableHead>Alamat</TableHead>
                    <TableHead className="w-[80px]">RT/RW</TableHead>
                    <TableHead>Jorong</TableHead>
                    <TableHead className="w-[100px] text-center">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {wargaData.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={12} className="text-center py-8 text-muted-foreground">
                        Tidak ada data warga
                      </TableCell>
                    </TableRow>
                  ) : (
                    wargaData.map((warga, index) => (
                      <TableRow key={warga.id || `warga-${index}`}>
                        <TableCell className="text-center font-medium">{((pagination.page - 1) * pagination.per_page) + index + 1}</TableCell>
                        <TableCell className="font-mono text-xs">
                          {warga.nik || <span className="text-muted-foreground italic">-</span>}
                        </TableCell>
                        <TableCell className="font-medium">{warga.nama}</TableCell>
                        <TableCell className="text-center">
                          <Badge variant={(warga.jenisKelamin || warga.jenis_kelamin) === 'L' ? 'default' : 'secondary'} className="w-6 h-6 p-0 flex items-center justify-center">
                            {(warga.jenisKelamin || warga.jenis_kelamin) === 'L' ? 'L' : 'P'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">
                          {(warga.tempatLahir || warga.tempat_lahir)}, {(warga.tanggalLahir || warga.tanggal_lahir)}
                        </TableCell>
                        <TableCell className="text-center">
                          {warga.umur ? `${warga.umur} th` : '-'}
                        </TableCell>
                        <TableCell className="text-sm">{warga.pendidikan || '-'}</TableCell>
                        <TableCell className="text-sm">{warga.pekerjaan || '-'}</TableCell>
                        <TableCell className="max-w-[200px] truncate text-sm">{warga.alamat || '-'}</TableCell>
                        <TableCell className="text-sm whitespace-nowrap">
                          {warga.rt && warga.rw ? `${warga.rt}/${warga.rw}` : '-'}
                        </TableCell>
                        <TableCell className="text-sm">{warga.jorong || warga.dusun || '-'}</TableCell>
                        <TableCell>
                          <div className="flex gap-1 justify-center">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleViewDetail(warga)}
                              title="Lihat Detail"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            {userRole !== 'warga' && (
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => handleDeleteWarga(warga.id || warga.nik)}
                                title="Hapus Data"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
          
          {/* Pagination */}
          {pagination.total_pages > 1 && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t">
              <div className="text-sm text-muted-foreground">
                Menampilkan {((pagination.page - 1) * pagination.per_page) + 1} - {Math.min(pagination.page * pagination.per_page, pagination.total)} dari {pagination.total} warga
              </div>
              <div className="flex items-center gap-1">
                {/* First Page */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPagination(prev => ({ ...prev, page: 1 }))}
                  disabled={pagination.page === 1 || loading}
                  className="h-8 w-8 p-0"
                >
                  <ChevronsLeft className="h-4 w-4" />
                </Button>
                {/* Previous Page */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                  disabled={pagination.page === 1 || loading}
                  className="h-8 w-8 p-0"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                
                {/* Page Numbers */}
                <div className="flex items-center gap-1 mx-2">
                  {Array.from({ length: Math.min(5, pagination.total_pages) }, (_, i) => {
                    let pageNum: number;
                    if (pagination.total_pages <= 5) {
                      pageNum = i + 1;
                    } else if (pagination.page <= 3) {
                      pageNum = i + 1;
                    } else if (pagination.page >= pagination.total_pages - 2) {
                      pageNum = pagination.total_pages - 4 + i;
                    } else {
                      pageNum = pagination.page - 2 + i;
                    }
                    return (
                      <Button
                        key={pageNum}
                        variant={pagination.page === pageNum ? "default" : "outline"}
                        size="sm"
                        onClick={() => setPagination(prev => ({ ...prev, page: pageNum }))}
                        disabled={loading}
                        className="h-8 w-8 p-0"
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>
                
                {/* Next Page */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPagination(prev => ({ ...prev, page: Math.min(prev.total_pages, prev.page + 1) }))}
                  disabled={pagination.page === pagination.total_pages || loading}
                  className="h-8 w-8 p-0"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                {/* Last Page */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.total_pages }))}
                  disabled={pagination.page === pagination.total_pages || loading}
                  className="h-8 w-8 p-0"
                >
                  <ChevronsRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}