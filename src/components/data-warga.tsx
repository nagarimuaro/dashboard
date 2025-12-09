import React, { useState, useEffect } from "react"
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
  ChevronsRight
} from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog"
import { wargaService } from "../services/wargaService.js"

interface DataWargaProps {
  userRole: 'admin_global' | 'admin_nagari' | 'staff_nagari' | 'warga'
  onNavigateToDetail?: (wargaId: string | number) => void
}

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

  // Load warga data from API
  const loadWargaData = async (params = {}) => {
    try {
      setLoading(true)
      const requestParams = {
        page: pagination.page,
        per_page: pagination.per_page,
        search: searchTerm,
        gender: selectedGender !== 'all' ? selectedGender : undefined,
        marital_status: selectedStatus !== 'all' ? selectedStatus : undefined,
        ...params
      }
      
      const response = await wargaService.getAll(requestParams)
      
      if (response && response.data) {
        // Handle direct Laravel pagination response structure
        const wargaList = Array.isArray(response.data) ? response.data : []
        const meta = response.meta || {}
        
        setWargaData(wargaList)
        
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

  // Load data on component mount and when filters change
  useEffect(() => {
    loadWargaData()
  }, [pagination.page, selectedGender, selectedStatus])

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
      {/* Header with Actions */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>Data Warga</CardTitle>
              <CardDescription>Kelola data warga Nagari</CardDescription>
            </div>
            {userRole !== 'warga' && (
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Tambah Warga
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-h-[90vh] flex flex-col max-w-3xl">
                  <DialogHeader>
                    <DialogTitle>Tambah Data Warga Baru</DialogTitle>
                    <DialogDescription>
                      Isi form di bawah untuk menambahkan data warga baru
                    </DialogDescription>
                  </DialogHeader>
                  <div className="overflow-y-auto flex-1 pr-2">
                    <div className="space-y-4 py-4">
                      {/* Error message */}
                      {formError && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-800 text-sm">
                          {formError}
                        </div>
                      )}

                      {/* Data Pribadi */}
                      <div className="space-y-3">
                        <h3 className="font-semibold text-sm border-b pb-2">Data Pribadi</h3>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="nik">NIK *</Label>
                            <Input 
                              id="nik" 
                              placeholder="16 digit NIK" 
                              value={formData.nik}
                              onChange={(e) => setFormData({...formData, nik: e.target.value})}
                              maxLength={16}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="no_kk">No. KK</Label>
                            <Input 
                              id="no_kk" 
                              placeholder="16 digit No. KK" 
                              value={formData.no_kk}
                              onChange={(e) => setFormData({...formData, no_kk: e.target.value})}
                              maxLength={16}
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="nama">Nama Lengkap *</Label>
                          <Input 
                            id="nama" 
                            placeholder="Nama lengkap sesuai KTP" 
                            value={formData.nama}
                            onChange={(e) => setFormData({...formData, nama: e.target.value})}
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="nama_ayah">Nama Ayah</Label>
                            <Input 
                              id="nama_ayah" 
                              placeholder="Nama ayah kandung" 
                              value={formData.nama_ayah}
                              onChange={(e) => setFormData({...formData, nama_ayah: e.target.value})}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="nama_ibu">Nama Ibu</Label>
                            <Input 
                              id="nama_ibu" 
                              placeholder="Nama ibu kandung" 
                              value={formData.nama_ibu}
                              onChange={(e) => setFormData({...formData, nama_ibu: e.target.value})}
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="tempat_lahir">Tempat Lahir</Label>
                            <Input 
                              id="tempat_lahir" 
                              placeholder="Kota kelahiran" 
                              value={formData.tempat_lahir}
                              onChange={(e) => setFormData({...formData, tempat_lahir: e.target.value})}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="tanggal_lahir">Tanggal Lahir</Label>
                            <Input 
                              id="tanggal_lahir" 
                              type="date" 
                              value={formData.tanggal_lahir}
                              onChange={(e) => setFormData({...formData, tanggal_lahir: e.target.value})}
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="jenis_kelamin">Jenis Kelamin</Label>
                            <Select 
                              value={formData.jenis_kelamin} 
                              onValueChange={(value: string) => setFormData({...formData, jenis_kelamin: value})}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="L">Laki-laki</SelectItem>
                                <SelectItem value="P">Perempuan</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="agama">Agama</Label>
                            <Select 
                              value={formData.agama} 
                              onValueChange={(value: string) => setFormData({...formData, agama: value})}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Islam">Islam</SelectItem>
                                <SelectItem value="Kristen">Kristen</SelectItem>
                                <SelectItem value="Katolik">Katolik</SelectItem>
                                <SelectItem value="Hindu">Hindu</SelectItem>
                                <SelectItem value="Buddha">Buddha</SelectItem>
                                <SelectItem value="Konghucu">Konghucu</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="status_perkawinan">Status Perkawinan</Label>
                          <Select 
                            value={formData.status_perkawinan} 
                            onValueChange={(value: string) => setFormData({...formData, status_perkawinan: value})}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Belum Kawin">Belum Kawin</SelectItem>
                              <SelectItem value="Kawin">Kawin</SelectItem>
                              <SelectItem value="Cerai Hidup">Cerai Hidup</SelectItem>
                              <SelectItem value="Cerai Mati">Cerai Mati</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="shdk">Status Hubungan Dalam Keluarga (SHDK)</Label>
                          <Select 
                            value={formData.shdk} 
                            onValueChange={(value: string) => setFormData({...formData, shdk: value})}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Pilih SHDK" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Kepala Keluarga">Kepala Keluarga</SelectItem>
                              <SelectItem value="Suami">Suami</SelectItem>
                              <SelectItem value="Istri">Istri</SelectItem>
                              <SelectItem value="Anak">Anak</SelectItem>
                              <SelectItem value="Menantu">Menantu</SelectItem>
                              <SelectItem value="Cucu">Cucu</SelectItem>
                              <SelectItem value="Orang Tua">Orang Tua</SelectItem>
                              <SelectItem value="Mertua">Mertua</SelectItem>
                              <SelectItem value="Famili Lain">Famili Lain</SelectItem>
                              <SelectItem value="Pembantu">Pembantu</SelectItem>
                              <SelectItem value="Lainnya">Lainnya</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {/* Pendidikan & Pekerjaan */}
                      <div className="space-y-3">
                        <h3 className="font-semibold text-sm border-b pb-2">Pendidikan & Pekerjaan</h3>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="pendidikan">Pendidikan Terakhir</Label>
                            <Select 
                              value={formData.pendidikan} 
                              onValueChange={(value: string) => setFormData({...formData, pendidikan: value})}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Pilih pendidikan" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Tidak/Belum Sekolah">Tidak/Belum Sekolah</SelectItem>
                                <SelectItem value="Belum Tamat SD/Sederajat">Belum Tamat SD/Sederajat</SelectItem>
                                <SelectItem value="Tamat SD/Sederajat">Tamat SD/Sederajat</SelectItem>
                                <SelectItem value="SLTP/Sederajat">SLTP/Sederajat</SelectItem>
                                <SelectItem value="SLTA/Sederajat">SLTA/Sederajat</SelectItem>
                                <SelectItem value="Diploma I/II">Diploma I/II</SelectItem>
                                <SelectItem value="Diploma III">Diploma III</SelectItem>
                                <SelectItem value="Diploma IV/Strata I">Diploma IV/Strata I</SelectItem>
                                <SelectItem value="Strata II">Strata II</SelectItem>
                                <SelectItem value="Strata III">Strata III</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="pekerjaan">Pekerjaan</Label>
                            <Input 
                              id="pekerjaan" 
                              placeholder="Pekerjaan utama" 
                              value={formData.pekerjaan}
                              onChange={(e) => setFormData({...formData, pekerjaan: e.target.value})}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Alamat */}
                      <div className="space-y-3">
                        <h3 className="font-semibold text-sm border-b pb-2">Alamat</h3>
                        
                        <div className="space-y-2">
                          <Label htmlFor="alamat">Alamat Lengkap</Label>
                          <Input 
                            id="alamat" 
                            placeholder="Jalan, nomor rumah, dll" 
                            value={formData.alamat}
                            onChange={(e) => setFormData({...formData, alamat: e.target.value})}
                          />
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="rt">RT</Label>
                            <Input 
                              id="rt" 
                              placeholder="RT" 
                              value={formData.rt}
                              onChange={(e) => setFormData({...formData, rt: e.target.value})}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="rw">RW</Label>
                            <Input 
                              id="rw" 
                              placeholder="RW" 
                              value={formData.rw}
                              onChange={(e) => setFormData({...formData, rw: e.target.value})}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="jorong">Jorong/Dusun</Label>
                            <Input 
                              id="jorong" 
                              placeholder="Jorong/Dusun" 
                              value={formData.jorong}
                              onChange={(e) => setFormData({...formData, jorong: e.target.value})}
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="kecamatan">Kecamatan</Label>
                          <Input 
                            id="kecamatan" 
                            placeholder="Nama kecamatan" 
                            value={formData.kecamatan}
                            onChange={(e) => setFormData({...formData, kecamatan: e.target.value})}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="status_domisili">Status Domisili</Label>
                          <Select 
                            value={formData.status_domisili} 
                            onValueChange={(value: string) => setFormData({...formData, status_domisili: value})}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Tetap">Tetap</SelectItem>
                              <SelectItem value="Sementara">Sementara</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {/* Kontak */}
                      <div className="space-y-3">
                        <h3 className="font-semibold text-sm border-b pb-2">Kontak</h3>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="no_hp">No. HP/WA</Label>
                            <Input 
                              id="no_hp" 
                              placeholder="08xxxxxxxxxx" 
                              value={formData.no_hp}
                              onChange={(e) => setFormData({...formData, no_hp: e.target.value})}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input 
                              id="email" 
                              type="email" 
                              placeholder="email@example.com" 
                              value={formData.email}
                              onChange={(e) => setFormData({...formData, email: e.target.value})}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2 pt-4">
                        <Button className="flex-1" onClick={handleAddWarga}>
                          <Plus className="h-4 w-4 mr-2" />
                          Simpan Data Warga
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={() => {
                            setIsAddDialogOpen(false)
                            setFormError('')
                          }}
                        >
                          Batal
                        </Button>
                      </div>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <Label htmlFor="search">Pencarian</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Cari berdasarkan nama atau NIK..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Filter Gender</Label>
              <Select value={selectedGender} onValueChange={setSelectedGender}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Gender</SelectItem>
                  <SelectItem value="L">Laki-laki</SelectItem>
                  <SelectItem value="P">Perempuan</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Filter Status</Label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Status</SelectItem>
                  <SelectItem value="Belum Kawin">Belum Kawin</SelectItem>
                  <SelectItem value="Kawin">Kawin</SelectItem>
                  <SelectItem value="Cerai Hidup">Cerai Hidup</SelectItem>
                  <SelectItem value="Cerai Mati">Cerai Mati</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Table */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Warga</CardTitle>
          <CardDescription>
            {loading ? 'Memuat data...' : `Menampilkan ${wargaData.length} warga`}
          </CardDescription>
        </CardHeader>
        <CardContent>
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