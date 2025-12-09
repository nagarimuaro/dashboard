import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Alert, AlertDescription } from '../ui/alert'
import { Separator } from '../ui/separator'
import { 
  Search, 
  Calendar,
  Clock,
  User,
  FileText,
  CheckCircle,
  AlertCircle,
  Loader2,
  Building2,
  ArrowLeft
} from 'lucide-react'

interface TrackingPageProps {
  onNavigateBack: () => void
}

export function TrackingPage({ onNavigateBack }: TrackingPageProps) {
  const [trackingCode, setTrackingCode] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [trackingResult, setTrackingResult] = useState(null)
  const [error, setError] = useState('')

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!trackingCode.trim()) {
      setError('Kode tracking harus diisi')
      return
    }

    setIsLoading(true)
    setError('')
    setTrackingResult(null)

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Demo data based on tracking code
      if (trackingCode.toLowerCase().includes('not-found')) {
        setError('Permohonan dengan kode tersebut tidak ditemukan')
        return
      }

      setTrackingResult({
        kode: trackingCode.toUpperCase(),
        nama_pemohon: 'Ahmad Fauzi',
        jenis_permohonan: 'Surat Keterangan Domisili',
        tanggal_pengajuan: '2024-01-15',
        status: 'diproses',
        estimasi_selesai: '2024-01-17',
        catatan: 'Dokumen sedang dalam proses verifikasi oleh petugas',
        riwayat: [
          {
            tanggal: '2024-01-15 09:30',
            status: 'Permohonan diterima',
            keterangan: 'Permohonan telah diterima dan menunggu verifikasi dokumen'
          },
          {
            tanggal: '2024-01-15 14:20',
            status: 'Dokumen diverifikasi',
            keterangan: 'Dokumen persyaratan telah diverifikasi dan lengkap'
          },
          {
            tanggal: '2024-01-16 10:15',
            status: 'Dalam proses',
            keterangan: 'Surat sedang dalam proses pembuatan oleh petugas'
          }
        ]
      })
    } catch (err) {
      setError('Terjadi kesalahan saat mencari data permohonan')
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'selesai': return 'default'
      case 'diproses': return 'secondary'
      case 'ditolak': return 'destructive'
      case 'menunggu': return 'outline'
      default: return 'outline'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'selesai': return CheckCircle
      case 'diproses': return Loader2
      case 'ditolak': return AlertCircle
      default: return Clock
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      {/* Header */}
      <div className="bg-primary text-primary-foreground py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center space-y-4">
            <Button 
              variant="ghost" 
              className="text-primary-foreground hover:bg-primary-foreground/20 mb-4"
              onClick={onNavigateBack}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Kembali
            </Button>
            <div className="flex justify-center">
              <div className="h-16 w-16 bg-primary-foreground/20 rounded-lg flex items-center justify-center">
                <Search className="h-8 w-8" />
              </div>
            </div>
            <h1 className="text-3xl font-semibold">Lacak Permohonan</h1>
            <p className="text-lg text-primary-foreground/80">
              Masukkan kode tracking untuk melihat status permohonan Anda
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Search Form */}
          <Card>
            <CardHeader>
              <CardTitle>Cari Permohonan</CardTitle>
              <CardDescription>
                Masukkan kode tracking yang Anda terima saat mengajukan permohonan
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleTrack} className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Input
                    placeholder="Contoh: TRK-2024-001"
                    value={trackingCode}
                    onChange={(e) => {
                      setTrackingCode(e.target.value)
                      if (error) setError('')
                    }}
                    disabled={isLoading}
                    className="text-center text-lg font-mono"
                  />
                  <p className="text-xs text-muted-foreground text-center">
                    Kode tracking diberikan saat Anda mengajukan permohonan
                  </p>
                </div>

                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Mencari...</span>
                    </div>
                  ) : (
                    <>
                      <Search className="h-4 w-4 mr-2" />
                      Lacak Permohonan
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Results */}
          {trackingResult && (
            <>
              {/* Main Info */}
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="flex items-center space-x-2">
                        <FileText className="h-5 w-5" />
                        <span>{trackingResult.jenis_permohonan}</span>
                      </CardTitle>
                      <CardDescription className="mt-1">
                        Kode: {trackingResult.kode}
                      </CardDescription>
                    </div>
                    <Badge variant={getStatusVariant(trackingResult.status)} className="flex items-center space-x-1">
                      {(() => {
                        const IconComponent = getStatusIcon(trackingResult.status)
                        return <IconComponent className={trackingResult.status === 'diproses' ? 'h-3 w-3 animate-spin' : 'h-3 w-3'} />
                      })()}
                      <span className="capitalize">{trackingResult.status}</span>
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-3">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="text-sm text-muted-foreground">Pemohon</div>
                        <div className="font-medium">{trackingResult.nama_pemohon}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="text-sm text-muted-foreground">Tanggal Pengajuan</div>
                        <div className="font-medium">
                          {new Date(trackingResult.tanggal_pengajuan).toLocaleDateString('id-ID')}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="text-sm text-muted-foreground">Estimasi Selesai</div>
                        <div className="font-medium">
                          {new Date(trackingResult.estimasi_selesai).toLocaleDateString('id-ID')}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="text-sm text-muted-foreground">Instansi</div>
                        <div className="font-medium">Nagari Koto Baru</div>
                      </div>
                    </div>
                  </div>

                  {trackingResult.catatan && (
                    <>
                      <Separator />
                      <div>
                        <div className="text-sm text-muted-foreground mb-2">Catatan</div>
                        <div className="text-sm bg-muted/50 p-3 rounded-lg">
                          {trackingResult.catatan}
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* History */}
              <Card>
                <CardHeader>
                  <CardTitle>Riwayat Proses</CardTitle>
                  <CardDescription>
                    Timeline proses permohonan Anda
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {trackingResult.riwayat.map((item, index) => (
                      <div key={index} className="flex items-start space-x-4">
                        <div className="flex-shrink-0">
                          <div className="h-8 w-8 bg-primary/10 rounded-full flex items-center justify-center">
                            <CheckCircle className="h-4 w-4 text-primary" />
                          </div>
                        </div>
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium">{item.status}</h4>
                            <span className="text-xs text-muted-foreground">
                              {new Date(item.tanggal).toLocaleString('id-ID')}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {item.keterangan}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {/* Help */}
          <Card>
            <CardHeader>
              <CardTitle>Butuh Bantuan?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm text-muted-foreground">
                Jika Anda mengalami kesulitan dalam melacak permohonan atau memiliki pertanyaan, 
                silakan hubungi kami:
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="font-medium mb-1">Telepon</div>
                  <div className="text-muted-foreground">(0752) 123-456</div>
                </div>
                <div>
                  <div className="font-medium mb-1">Email</div>
                  <div className="text-muted-foreground">pelayanan@koto-baru.nagari.id</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}