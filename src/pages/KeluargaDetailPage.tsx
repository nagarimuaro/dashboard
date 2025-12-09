import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table'
import { ArrowLeft, Users, Home, Loader2, MapPin } from 'lucide-react'
import { keluargaService } from '../services/keluargaService.js'

export function KeluargaDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [keluarga, setKeluarga] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>('')

  useEffect(() => {
    loadKeluargaDetail()
  }, [id])

  const loadKeluargaDetail = async () => {
    try {
      setLoading(true)
      console.log('📋 Loading keluarga detail for ID:', id)
      const response = await keluargaService.getById(id!)
      console.log('✅ Raw response:', response)
      
      // Handle different response structures
      let keluargaData = response
      if (response.data) {
        keluargaData = response.data
      }
      
      console.log('📦 Keluarga data:', keluargaData)
      console.log('👥 Anggotas:', keluargaData.anggotas)
      console.log('👤 Kepala Keluarga:', keluargaData.kepala_keluarga)
      
      setKeluarga(keluargaData)
    } catch (err: any) {
      console.error('❌ Error loading keluarga detail:', err)
      setError(err.message || 'Gagal memuat detail keluarga')
    } finally {
      setLoading(false)
    }
  }

  const calculateAge = (dateOfBirth: string): number | string => {
    if (!dateOfBirth) return '-'
    const today = new Date()
    const birthDate = new Date(dateOfBirth)
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    return age
  }

  const getNumericAge = (dateOfBirth: string): number => {
    const age = calculateAge(dateOfBirth)
    return typeof age === 'number' ? age : 0
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Memuat detail keluarga...</p>
        </div>
      </div>
    )
  }

  if (error || !keluarga) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <p className="text-destructive text-lg font-semibold">Error</p>
          <p className="text-muted-foreground">{error || 'Data keluarga tidak ditemukan'}</p>
          <Button onClick={() => navigate('/kependudukan/data-keluarga')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali ke Data Keluarga
          </Button>
        </div>
      </div>
    )
  }

  const anggotas = keluarga.anggotas || []
  const kepalaKeluarga = keluarga.kepala_keluarga || (anggotas.length > 0 ? anggotas[0] : null)

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate('/kependudukan/data-keluarga')}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-3xl font-bold">Detail Kartu Keluarga</h1>
          </div>
          <p className="text-muted-foreground">
            Informasi lengkap data keluarga dan anggotanya
          </p>
        </div>
      </div>

      {/* Informasi KK */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Home className="h-5 w-5" />
            Informasi Kartu Keluarga
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">No. Kartu Keluarga</p>
              <p className="text-lg font-mono font-semibold">{keluarga.no_kk}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Kepala Keluarga</p>
              <p className="text-lg font-semibold">{kepalaKeluarga?.nama || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Jumlah Anggota</p>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-base">
                  <Users className="h-4 w-4 mr-1" />
                  {anggotas.length} orang
                </Badge>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm text-muted-foreground flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Alamat
            </p>
            <p className="text-base">
              {[
                keluarga.alamat,
                keluarga.rt && `RT ${keluarga.rt}`,
                keluarga.rw && `RW ${keluarga.rw}`,
                keluarga.jorong && `Jorong ${keluarga.jorong}`
              ].filter(Boolean).join(', ') || '-'}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Informasi Alamat Lengkap */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Alamat Lengkap
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-3 gap-2">
              <span className="text-sm font-medium text-muted-foreground">Alamat:</span>
              <span className="text-sm col-span-2">{keluarga.alamat || '-'}</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <span className="text-sm font-medium text-muted-foreground">RT/RW:</span>
              <span className="text-sm col-span-2">{keluarga.rt || '-'} / {keluarga.rw || '-'}</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <span className="text-sm font-medium text-muted-foreground">Jorong:</span>
              <span className="text-sm col-span-2">{keluarga.jorong || '-'}</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <span className="text-sm font-medium text-muted-foreground">Kecamatan:</span>
              <span className="text-sm col-span-2">{kepalaKeluarga?.kecamatan || '-'}</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <span className="text-sm font-medium text-muted-foreground">Nagari:</span>
              <span className="text-sm col-span-2">{kepalaKeluarga?.nagari || '-'}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Statistik Keluarga
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-3 gap-2">
              <span className="text-sm font-medium text-muted-foreground">Total Anggota:</span>
              <span className="text-sm col-span-2 font-semibold">{anggotas.length} orang</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <span className="text-sm font-medium text-muted-foreground">Laki-laki:</span>
              <span className="text-sm col-span-2">{anggotas.filter((a: any) => a.jenis_kelamin === 'L').length} orang</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <span className="text-sm font-medium text-muted-foreground">Perempuan:</span>
              <span className="text-sm col-span-2">{anggotas.filter((a: any) => a.jenis_kelamin === 'P').length} orang</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <span className="text-sm font-medium text-muted-foreground">Anak-anak:</span>
              <span className="text-sm col-span-2">{anggotas.filter((a: any) => getNumericAge(a.tanggal_lahir) < 18).length} orang</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <span className="text-sm font-medium text-muted-foreground">Dewasa:</span>
              <span className="text-sm col-span-2">{anggotas.filter((a: any) => getNumericAge(a.tanggal_lahir) >= 18).length} orang</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Daftar Anggota Keluarga */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Anggota Keluarga</CardTitle>
          <CardDescription>
            {anggotas.length} orang terdaftar dalam kartu keluarga ini
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">No</TableHead>
                  <TableHead>NIK</TableHead>
                  <TableHead>Nama Lengkap</TableHead>
                  <TableHead className="text-center">JK</TableHead>
                  <TableHead>Tempat/Tgl Lahir</TableHead>
                  <TableHead className="text-center">Umur</TableHead>
                  <TableHead>SHDK</TableHead>
                  <TableHead>Nama Ayah</TableHead>
                  <TableHead>Nama Ibu</TableHead>
                  <TableHead>Agama</TableHead>
                  <TableHead>Status Kawin</TableHead>
                  <TableHead>Pendidikan</TableHead>
                  <TableHead>Pekerjaan</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {anggotas.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={13} className="text-center py-8 text-muted-foreground">
                      Belum ada data anggota keluarga
                    </TableCell>
                  </TableRow>
                ) : (
                  anggotas.map((anggota: any, index: number) => (
                    <TableRow key={anggota.id}>
                      <TableCell className="text-center font-medium">{index + 1}</TableCell>
                      <TableCell className="font-mono text-xs">{anggota.nik || '-'}</TableCell>
                      <TableCell className="font-medium">{anggota.nama}</TableCell>
                      <TableCell className="text-center">
                        <Badge variant={anggota.jenis_kelamin === 'L' ? 'default' : 'secondary'} className="w-6 h-6 p-0 flex items-center justify-center">
                          {anggota.jenis_kelamin === 'L' ? 'L' : 'P'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">
                        {anggota.tempat_lahir || '-'}, {anggota.tanggal_lahir || '-'}
                      </TableCell>
                      <TableCell className="text-center">{calculateAge(anggota.tanggal_lahir)} th</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="whitespace-nowrap">
                          {anggota.shdk || anggota.pivot?.hubungan || '-'}
                        </Badge>
                      </TableCell>
                      <TableCell>{anggota.nama_ayah || '-'}</TableCell>
                      <TableCell>{anggota.nama_ibu || '-'}</TableCell>
                      <TableCell>{anggota.agama || '-'}</TableCell>
                      <TableCell className="whitespace-nowrap">{anggota.status_perkawinan || '-'}</TableCell>
                      <TableCell>{anggota.pendidikan || '-'}</TableCell>
                      <TableCell>{anggota.pekerjaan || '-'}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
