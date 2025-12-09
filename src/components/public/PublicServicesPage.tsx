import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Separator } from '../ui/separator'
import { 
  FileText, 
  Clock, 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  Search,
  Calendar,
  CheckCircle,
  AlertCircle,
  Building2
} from 'lucide-react'
import pelayananPublicService from '../../services/pelayananPublicService'

export function PublicServicesPage() {
  const [services, setServices] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [isLoading, setIsLoading] = useState(true)

  const categories = [
    { value: 'all', label: 'Semua Layanan' },
    { value: 'administrasi-kependudukan', label: 'Administrasi Kependudukan' },
    { value: 'administrasi-perizinan', label: 'Administrasi Perizinan' },
    { value: 'administrasi-sosial', label: 'Administrasi Sosial' },
    { value: 'administrasi-pertanahan', label: 'Administrasi Pertanahan' }
  ]

  useEffect(() => {
    loadServices()
  }, [])

  const loadServices = async () => {
    try {
      setIsLoading(true)
      const response = await pelayananPublicService.getPublicServices('koto-baru')
      if (response.success && response.data) {
        setServices(response.data)
      } else {
        // Fallback to demo data
        setServices(getDemoServices())
      }
    } catch (error) {
      console.error('Error loading services:', error)
      // Fallback to demo data
      setServices(getDemoServices())
    } finally {
      setIsLoading(false)
    }
  }

  const getDemoServices = () => [
    {
      id: 1,
      nama: 'Surat Keterangan Domisili',
      kategori: 'administrasi-kependudukan',
      deskripsi: 'Surat keterangan yang menyatakan tempat tinggal seseorang',
      persyaratan: ['KTP Asli', 'KK Asli', 'Surat Pengantar RT/RW'],
      waktu_proses: '1-2 hari kerja',
      biaya: 'Gratis',
      status_aktif: true
    },
    {
      id: 2,
      nama: 'Surat Keterangan Belum Menikah',
      kategori: 'administrasi-kependudukan',
      deskripsi: 'Surat keterangan status pernikahan untuk keperluan administrasi',
      persyaratan: ['KTP Asli', 'KK Asli', 'Pas Foto 4x6'],
      waktu_proses: '1 hari kerja',
      biaya: 'Gratis',
      status_aktif: true
    },
    {
      id: 3,
      nama: 'Izin Mendirikan Bangunan (IMB)',
      kategori: 'administrasi-perizinan',
      deskripsi: 'Izin untuk mendirikan bangunan sesuai dengan rencana tata ruang',
      persyaratan: ['Sertifikat Tanah', 'Gambar Bangunan', 'SPPT PBB'],
      waktu_proses: '7-14 hari kerja',
      biaya: 'Sesuai Perda',
      status_aktif: true
    },
    {
      id: 4,
      nama: 'Surat Keterangan Tidak Mampu',
      kategori: 'administrasi-sosial',
      deskripsi: 'Surat keterangan kondisi ekonomi untuk keperluan bantuan sosial',
      persyaratan: ['KTP Asli', 'KK Asli', 'Surat Pengantar RT/RW'],
      waktu_proses: '1-2 hari kerja',
      biaya: 'Gratis',
      status_aktif: true
    }
  ]

  const filteredServices = services.filter(service => {
    const matchesSearch = service.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.deskripsi.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || service.kategori === selectedCategory
    return matchesSearch && matchesCategory && service.status_aktif
  })

  const getCategoryLabel = (kategori: string) => {
    const category = categories.find(cat => cat.value === kategori)
    return category ? category.label : kategori
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      {/* Header */}
      <div className="bg-primary text-primary-foreground py-12">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="h-16 w-16 bg-primary-foreground/20 rounded-lg flex items-center justify-center">
                <Building2 className="h-8 w-8" />
              </div>
            </div>
            <h1 className="text-3xl font-semibold">Layanan Publik Nagari</h1>
            <p className="text-lg text-primary-foreground/80 max-w-2xl mx-auto">
              Informasi lengkap tentang layanan administrasi dan pelayanan masyarakat
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Search & Filter */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Cari layanan..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {categories.map(category => (
                  <Button
                    key={category.value}
                    variant={selectedCategory === category.value ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedCategory(category.value)}
                  >
                    {category.label}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Services Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="h-3 bg-muted rounded"></div>
                    <div className="h-3 bg-muted rounded w-5/6"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredServices.map(service => (
              <Card key={service.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <CardTitle className="text-lg">{service.nama}</CardTitle>
                      <Badge variant="outline" className="text-xs">
                        {getCategoryLabel(service.kategori)}
                      </Badge>
                    </div>
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  </div>
                  <CardDescription>{service.deskripsi}</CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Persyaratan */}
                  <div>
                    <h4 className="font-medium text-sm mb-2 flex items-center">
                      <FileText className="h-4 w-4 mr-2" />
                      Persyaratan
                    </h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      {service.persyaratan?.slice(0, 3).map((req, idx) => (
                        <li key={idx} className="flex items-start">
                          <span className="h-1.5 w-1.5 bg-muted-foreground rounded-full mt-2 mr-2 flex-shrink-0"></span>
                          {req}
                        </li>
                      ))}
                      {service.persyaratan?.length > 3 && (
                        <li className="text-xs text-muted-foreground">
                          +{service.persyaratan.length - 3} persyaratan lainnya
                        </li>
                      )}
                    </ul>
                  </div>

                  <Separator />

                  {/* Info Proses */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="flex items-center text-muted-foreground mb-1">
                        <Clock className="h-3 w-3 mr-1" />
                        Waktu Proses
                      </div>
                      <div className="font-medium">{service.waktu_proses}</div>
                    </div>
                    <div>
                      <div className="flex items-center text-muted-foreground mb-1">
                        <FileText className="h-3 w-3 mr-1" />
                        Biaya
                      </div>
                      <div className="font-medium">{service.biaya}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {filteredServices.length === 0 && !isLoading && (
          <Card>
            <CardContent className="text-center py-12">
              <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-medium mb-2">Layanan Tidak Ditemukan</h3>
              <p className="text-muted-foreground">
                Tidak ada layanan yang sesuai dengan pencarian Anda
              </p>
            </CardContent>
          </Card>
        )}

        {/* Contact Info */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Informasi Kontak</CardTitle>
            <CardDescription>
              Untuk informasi lebih lanjut atau bantuan layanan
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-start space-x-3">
                <div className="h-8 w-8 bg-primary/10 rounded-lg flex items-center justify-center">
                  <MapPin className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium">Alamat</h4>
                  <p className="text-sm text-muted-foreground">
                    Kantor Nagari Koto Baru<br />
                    Jl. Raya Nagari No. 123<br />
                    Kec. Lima Puluh Kota, Sumbar
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="h-8 w-8 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Phone className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium">Telepon</h4>
                  <p className="text-sm text-muted-foreground">
                    (0752) 123-456<br />
                    0812-3456-7890
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="h-8 w-8 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Mail className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium">Email</h4>
                  <p className="text-sm text-muted-foreground">
                    info@koto-baru.nagari.id<br />
                    pelayanan@koto-baru.nagari.id
                  </p>
                </div>
              </div>
            </div>
            
            <Separator className="my-6" />
            
            <div className="text-center">
              <h4 className="font-medium mb-2">Jam Pelayanan</h4>
              <div className="text-sm text-muted-foreground space-y-1">
                <div className="flex justify-center items-center space-x-2">
                  <Calendar className="h-4 w-4" />
                  <span>Senin - Jumat: 08:00 - 16:00 WIB</span>
                </div>
                <div>Istirahat: 12:00 - 13:00 WIB</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}