import React, { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { Textarea } from "./ui/textarea"
import { ArrowLeft, Save, Loader2, UserPlus } from "lucide-react"
import { wargaService } from "../services/wargaService.js"

interface AddWargaProps {
  onBack?: () => void
  onSuccess?: () => void
}

export function AddWarga({ onBack, onSuccess }: AddWargaProps) {
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    nik: '',
    nama: '',
    jenis_kelamin: '',
    tempat_lahir: '',
    tanggal_lahir: '',
    status_perkawinan: '',
    pendidikan: '',
    pekerjaan: '',
    agama: 'Islam',
    alamat: '',
    no_hp: '',
    email: '',
    no_kk: '',
    rt: '',
    rw: '',
    jorong: '',
    status_domisili: 'Tetap'
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      setSaving(true)
      const response = await wargaService.create(formData)
      
      if (response && (response.data || response.success !== false)) {
        console.log('Warga created successfully')
        alert('Data warga berhasil ditambahkan')
        
        // Reset form
        setFormData({
          nik: '',
          nama: '',
          jenis_kelamin: '',
          tempat_lahir: '',
          tanggal_lahir: '',
          status_perkawinan: '',
          pendidikan: '',
          pekerjaan: '',
          agama: 'Islam',
          alamat: '',
          no_hp: '',
          email: '',
          no_kk: '',
          rt: '',
          rw: '',
          jorong: '',
          status_domisili: 'Tetap'
        })
        
        if (onSuccess) {
          onSuccess()
        }
      } else {
        console.error('Failed to create warga:', response?.message || 'Unknown error')
        alert('Gagal menambah data warga. Silakan coba lagi.')
      }
    } catch (error) {
      console.error('Error creating warga:', error)
      alert('Terjadi error saat menambah data warga. Silakan coba lagi.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        {onBack && (
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali
          </Button>
        )}
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <UserPlus className="h-6 w-6" />
            Tambah Data Warga
          </h1>
          <p className="text-muted-foreground">Masukkan informasi warga baru</p>
        </div>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>Informasi Warga</CardTitle>
          <CardDescription>
            Lengkapi semua informasi yang diperlukan
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-6">
              {/* Basic Information */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nik">NIK *</Label>
                  <Input 
                    id="nik" 
                    placeholder="16 digit NIK" 
                    value={formData.nik}
                    onChange={(e) => handleInputChange('nik', e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nama">Nama Lengkap *</Label>
                  <Input 
                    id="nama" 
                    placeholder="Nama lengkap" 
                    value={formData.nama}
                    onChange={(e) => handleInputChange('nama', e.target.value)}
                    required
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
                  <Label htmlFor="jenis_kelamin">Jenis Kelamin *</Label>
                  <Select value={formData.jenis_kelamin} onValueChange={(value: string) => handleInputChange('jenis_kelamin', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih jenis kelamin" />
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
                      <SelectValue placeholder="Pilih status" />
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

              <div className="grid grid-cols-2 gap-4">
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
                <div className="space-y-2">
                  <Label htmlFor="pendidikan">Pendidikan</Label>
                  <Select value={formData.pendidikan} onValueChange={(value: string) => handleInputChange('pendidikan', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih pendidikan" />
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
              </div>

              <div className="space-y-2">
                <Label htmlFor="pekerjaan">Pekerjaan</Label>
                <Input 
                  id="pekerjaan" 
                  placeholder="Jenis pekerjaan" 
                  value={formData.pekerjaan}
                  onChange={(e) => handleInputChange('pekerjaan', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="alamat">Alamat Lengkap</Label>
                <Textarea 
                  id="alamat" 
                  placeholder="Alamat lengkap" 
                  value={formData.alamat}
                  onChange={(e) => handleInputChange('alamat', e.target.value)}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="no_kk">No. KK</Label>
                  <Input 
                    id="no_kk" 
                    placeholder="16 digit No. KK" 
                    value={formData.no_kk}
                    onChange={(e) => handleInputChange('no_kk', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="jorong">Jorong</Label>
                  <Input 
                    id="jorong" 
                    placeholder="Nama jorong" 
                    value={formData.jorong}
                    onChange={(e) => handleInputChange('jorong', e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="rt">RT</Label>
                  <Input 
                    id="rt" 
                    placeholder="001" 
                    value={formData.rt}
                    onChange={(e) => handleInputChange('rt', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rw">RW</Label>
                  <Input 
                    id="rw" 
                    placeholder="002" 
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

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="no_hp">No. HP</Label>
                  <Input 
                    id="no_hp" 
                    placeholder="081234567890" 
                    value={formData.no_hp}
                    onChange={(e) => handleInputChange('no_hp', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="email@domain.com" 
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-4 pt-6">
                <Button type="submit" disabled={saving} className="flex-1">
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Simpan Data Warga
                    </>
                  )}
                </Button>
                {onBack && (
                  <Button type="button" variant="outline" onClick={onBack}>
                    Batal
                  </Button>
                )}
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}