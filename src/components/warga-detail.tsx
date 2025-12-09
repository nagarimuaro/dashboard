import React, { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Badge } from "./ui/badge"
import { Label } from "./ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { Textarea } from "./ui/textarea"
import { 
  ArrowLeft, 
  Edit, 
  Save, 
  X,
  User,
  Calendar,
  MapPin,
  Phone,
  Mail,
  Loader2,
  Users
} from "lucide-react"
import { wargaService } from "../services/wargaService.js"

interface WargaDetailProps {
  wargaId: string | number
  onBack: () => void
  userRole: 'admin_global' | 'admin_nagari' | 'staff_nagari' | 'warga'
}

export function WargaDetail({ wargaId, onBack, userRole }: WargaDetailProps) {
  const [warga, setWarga] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState<any>({})

  // Load warga detail from API
  const loadWargaDetail = async () => {
    try {
      setLoading(true)
      console.log('WargaDetail: Loading details for ID:', wargaId)
      const response = await wargaService.getById(wargaId)
      console.log('WargaDetail: Response received:', response)
      
      if (response && response.data) {
        const wargaData = response.data
        setWarga(wargaData)
        setFormData({
          nik: wargaData.nik || '',
          nama: wargaData.nama || '',
          nama_ayah: wargaData.nama_ayah || '',
          nama_ibu: wargaData.nama_ibu || '',
          jenis_kelamin: wargaData.jenis_kelamin || wargaData.jenisKelamin || '',
          tempat_lahir: wargaData.tempat_lahir || wargaData.tempatLahir || '',
          tanggal_lahir: wargaData.tanggal_lahir || wargaData.tanggalLahir || '',
          status_perkawinan: wargaData.status_perkawinan || wargaData.statusPerkawinan || '',
          shdk: wargaData.shdk || '',
          pendidikan: wargaData.pendidikan || '',
          pekerjaan: wargaData.pekerjaan || '',
          agama: wargaData.agama || 'Islam',
          alamat: wargaData.alamat || '',
          no_hp: wargaData.no_hp || wargaData.noHp || '',
          email: wargaData.email || '',
          no_kk: wargaData.no_kk || wargaData.noKK || '',
          rt: wargaData.rt || '',
          rw: wargaData.rw || '',
          jorong: wargaData.jorong || '',
          kecamatan: wargaData.kecamatan || '',
          status_domisili: wargaData.status_domisili || 'Tetap'
        })
      } else {
        console.error('Failed to load warga detail:', response?.message || 'No data received')
      }
    } catch (error) {
      console.error('Error loading warga detail:', error)
    } finally {
      setLoading(false)
    }
  }

  // Load data on component mount
  useEffect(() => {
    loadWargaDetail()
  }, [wargaId])

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }))
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      const response = await wargaService.update(wargaId, formData)
      
      if (response && (response.data || response.success !== false)) {
        console.log('Warga updated successfully')
        await loadWargaDetail() // Reload data to show changes
        setIsEditing(false)
        alert('Data warga berhasil diupdate')
      } else {
        console.error('Failed to update warga:', response?.message || 'Unknown error')
        alert('Gagal mengupdate data warga. Silakan coba lagi.')
      }
    } catch (error) {
      console.error('Error updating warga:', error)
      alert('Terjadi error saat mengupdate data warga. Silakan coba lagi.')
    } finally {
      setSaving(false)
    }
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    // Reset form data to original values
    if (warga) {
      setFormData({
        nik: warga.nik || '',
        nama: warga.nama || '',
        nama_ayah: warga.nama_ayah || '',
        nama_ibu: warga.nama_ibu || '',
        jenis_kelamin: warga.jenis_kelamin || warga.jenisKelamin || '',
        tempat_lahir: warga.tempat_lahir || warga.tempatLahir || '',
        tanggal_lahir: warga.tanggal_lahir || warga.tanggalLahir || '',
        status_perkawinan: warga.status_perkawinan || warga.statusPerkawinan || '',
        shdk: warga.shdk || '',
        pendidikan: warga.pendidikan || '',
        pekerjaan: warga.pekerjaan || '',
        agama: warga.agama || 'Islam',
        alamat: warga.alamat || '',
        no_hp: warga.no_hp || warga.noHp || '',
        email: warga.email || '',
        no_kk: warga.no_kk || warga.noKK || '',
        rt: warga.rt || '',
        rw: warga.rw || '',
        jorong: warga.jorong || '',
        kecamatan: warga.kecamatan || '',
        status_domisili: warga.status_domisili || 'Tetap'
      })
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali
          </Button>
        </div>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Memuat detail warga...</span>
        </div>
      </div>
    )
  }

  if (!warga) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali
          </Button>
        </div>
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-muted-foreground">Data warga tidak ditemukan</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Kembali ke Data Warga
        </Button>
        
        {userRole !== 'warga' && !isEditing && (
          <Button onClick={() => setIsEditing(true)}>
            <Edit className="h-4 w-4 mr-2" />
            Edit Data
          </Button>
        )}
        
        {isEditing && (
          <div className="flex gap-2">
            <Button onClick={handleSave} disabled={saving}>
              {saving ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              {saving ? 'Menyimpan...' : 'Simpan'}
            </Button>
            <Button variant="outline" onClick={handleCancelEdit}>
              <X className="h-4 w-4 mr-2" />
              Batal
            </Button>
          </div>
        )}
      </div>

      {/* Profile Header */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start gap-6">
            <div className="h-24 w-24 rounded-full bg-muted flex items-center justify-center">
              <User className="h-12 w-12 text-muted-foreground" />
            </div>
            <div className="flex-1">
              {isEditing ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="nama">Nama Lengkap</Label>
                      <Input 
                        id="nama" 
                        value={formData.nama}
                        onChange={(e) => handleInputChange('nama', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="nik">NIK</Label>
                      <Input 
                        id="nik" 
                        value={formData.nik}
                        onChange={(e) => handleInputChange('nik', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <h1 className="text-2xl font-bold">{warga.nama}</h1>
                  <p className="text-muted-foreground text-lg">
                    NIK: {warga.nik || <span className="italic">Belum ada NIK</span>}
                  </p>
                  <div className="flex gap-3 mt-4">
                    <Badge variant={warga.jenisKelamin === 'L' || warga.jenis_kelamin === 'L' ? 'default' : 'secondary'} className="text-sm">
                      {warga.jenisKelamin === 'L' || warga.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan'}
                    </Badge>
                    <Badge variant="outline" className="text-sm">{warga.statusPerkawinan || warga.status_perkawinan}</Badge>
                  </div>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detail Information */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Informasi Pribadi
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isEditing ? (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="tempat_lahir">Tempat Lahir</Label>
                    <Input 
                      id="tempat_lahir" 
                      value={formData.tempat_lahir}
                      onChange={(e) => handleInputChange('tempat_lahir', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tanggal_lahir">Tanggal Lahir</Label>
                    <Input 
                      id="tanggal_lahir" 
                      type="date"
                      value={formData.tanggal_lahir}
                      onChange={(e) => handleInputChange('tanggal_lahir', e.target.value)}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="jenis_kelamin">Jenis Kelamin</Label>
                    <Select value={formData.jenis_kelamin} onValueChange={(value: string) => handleInputChange('jenis_kelamin', value)}>
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
                    <Label htmlFor="status_perkawinan">Status Perkawinan</Label>
                    <Select value={formData.status_perkawinan} onValueChange={(value: string) => handleInputChange('status_perkawinan', value)}>
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
                </div>
                <div className="space-y-2">
                  <Label htmlFor="agama">Agama</Label>
                  <Select value={formData.agama} onValueChange={(value: string) => handleInputChange('agama', value)}>
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
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="pendidikan">Pendidikan</Label>
                    <Select value={formData.pendidikan} onValueChange={(value: string) => handleInputChange('pendidikan', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="SD">SD</SelectItem>
                        <SelectItem value="SMP">SMP</SelectItem>
                        <SelectItem value="SMA">SMA</SelectItem>
                        <SelectItem value="D3">D3</SelectItem>
                        <SelectItem value="S1">S1</SelectItem>
                        <SelectItem value="S2">S2</SelectItem>
                        <SelectItem value="S3">S3</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pekerjaan">Pekerjaan</Label>
                    <Input 
                      id="pekerjaan" 
                      value={formData.pekerjaan}
                      onChange={(e) => handleInputChange('pekerjaan', e.target.value)}
                    />
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="grid grid-cols-3 gap-2">
                  <span className="text-sm font-medium text-muted-foreground">Tempat Lahir:</span>
                  <span className="text-sm col-span-2">{warga.tempatLahir || warga.tempat_lahir || '-'}</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <span className="text-sm font-medium text-muted-foreground">Tanggal Lahir:</span>
                  <span className="text-sm col-span-2">{warga.tanggalLahir || warga.tanggal_lahir || '-'}</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <span className="text-sm font-medium text-muted-foreground">Umur:</span>
                  <span className="text-sm col-span-2">{warga.umur ? `${warga.umur} tahun` : '-'}</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <span className="text-sm font-medium text-muted-foreground">Agama:</span>
                  <span className="text-sm col-span-2">{warga.agama || '-'}</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <span className="text-sm font-medium text-muted-foreground">Pendidikan:</span>
                  <span className="text-sm col-span-2">{warga.pendidikan || '-'}</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <span className="text-sm font-medium text-muted-foreground">Pekerjaan:</span>
                  <span className="text-sm col-span-2">{warga.pekerjaan || '-'}</span>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Address & Domicile */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Alamat & Domisili
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isEditing ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="alamat">Alamat Lengkap</Label>
                  <Textarea 
                    id="alamat" 
                    value={formData.alamat}
                    onChange={(e) => handleInputChange('alamat', e.target.value)}
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="jorong">Jorong</Label>
                    <Input 
                      id="jorong" 
                      value={formData.jorong}
                      onChange={(e) => handleInputChange('jorong', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="no_kk">No. KK</Label>
                    <Input 
                      id="no_kk" 
                      value={formData.no_kk}
                      onChange={(e) => handleInputChange('no_kk', e.target.value)}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="rt">RT</Label>
                    <Input 
                      id="rt" 
                      value={formData.rt}
                      onChange={(e) => handleInputChange('rt', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="rw">RW</Label>
                    <Input 
                      id="rw" 
                      value={formData.rw}
                      onChange={(e) => handleInputChange('rw', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status_domisili">Status Domisili</Label>
                    <Select value={formData.status_domisili} onValueChange={(value: string) => handleInputChange('status_domisili', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Tetap">Tetap</SelectItem>
                        <SelectItem value="Tidak Tetap">Tidak Tetap</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="kecamatan">Kecamatan</Label>
                  <Input 
                    id="kecamatan" 
                    value={formData.kecamatan}
                    onChange={(e) => handleInputChange('kecamatan', e.target.value)}
                  />
                </div>
              </>
            ) : (
              <>
                <div className="grid grid-cols-3 gap-2">
                  <span className="text-sm font-medium text-muted-foreground">Alamat:</span>
                  <span className="text-sm col-span-2">{warga.alamat || '-'}</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <span className="text-sm font-medium text-muted-foreground">Jorong:</span>
                  <span className="text-sm col-span-2">{warga.jorong || '-'}</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <span className="text-sm font-medium text-muted-foreground">RT/RW:</span>
                  <span className="text-sm col-span-2">
                    {warga.rt || '-'} / {warga.rw || '-'}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <span className="text-sm font-medium text-muted-foreground">Kecamatan:</span>
                  <span className="text-sm col-span-2">{warga.kecamatan || '-'}</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <span className="text-sm font-medium text-muted-foreground">Nagari:</span>
                  <span className="text-sm col-span-2">{warga.nagari || '-'}</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <span className="text-sm font-medium text-muted-foreground">Status Domisili:</span>
                  <span className="text-sm col-span-2">{warga.status_domisili || '-'}</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <span className="text-sm font-medium text-muted-foreground">No. KK:</span>
                  <span className="text-sm col-span-2 font-mono">{warga.noKK || warga.no_kk || '-'}</span>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Family Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Informasi Keluarga
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isEditing ? (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nama_ayah">Nama Ayah</Label>
                  <Input 
                    id="nama_ayah" 
                    value={formData.nama_ayah}
                    onChange={(e) => handleInputChange('nama_ayah', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nama_ibu">Nama Ibu</Label>
                  <Input 
                    id="nama_ibu" 
                    value={formData.nama_ibu}
                    onChange={(e) => handleInputChange('nama_ibu', e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="shdk">Status Hubungan Dalam Keluarga (SHDK)</Label>
                <Select value={formData.shdk} onValueChange={(value: string) => handleInputChange('shdk', value)}>
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
                    <SelectItem value="Orangtua">Orangtua</SelectItem>
                    <SelectItem value="Mertua">Mertua</SelectItem>
                    <SelectItem value="Famili Lain">Famili Lain</SelectItem>
                    <SelectItem value="Pembantu">Pembantu</SelectItem>
                    <SelectItem value="Lainnya">Lainnya</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          ) : (
            <>
              <div className="grid grid-cols-3 gap-2">
                <span className="text-sm font-medium text-muted-foreground">Nama Ayah:</span>
                <span className="text-sm col-span-2">{warga.nama_ayah || '-'}</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <span className="text-sm font-medium text-muted-foreground">Nama Ibu:</span>
                <span className="text-sm col-span-2">{warga.nama_ibu || '-'}</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <span className="text-sm font-medium text-muted-foreground">SHDK:</span>
                <span className="text-sm col-span-2">{warga.shdk || '-'}</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <span className="text-sm font-medium text-muted-foreground">Nama Kepala Keluarga:</span>
                <span className="text-sm col-span-2">{warga.nama_kep || '-'}</span>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5" />
            Informasi Kontak
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isEditing ? (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="no_hp">No. HP</Label>
                <Input 
                  id="no_hp" 
                  value={formData.no_hp}
                  onChange={(e) => handleInputChange('no_hp', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-2">
                <span className="text-sm font-medium text-muted-foreground">No. HP:</span>
                <span className="text-sm col-span-2 flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  {warga.noHp || warga.no_hp || '-'}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <span className="text-sm font-medium text-muted-foreground">Email:</span>
                <span className="text-sm col-span-2 flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  {warga.email || '-'}
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}