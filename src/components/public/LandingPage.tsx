import React from 'react'
import { Button } from '../ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Separator } from '../ui/separator'
import { 
  Building2, 
  Users, 
  FileText, 
  MapPin, 
  Phone, 
  Mail,
  Calendar,
  Clock,
  ChevronRight,
  Star,
  TrendingUp,
  Shield,
  Globe
} from 'lucide-react'

interface LandingPageProps {
  onNavigateToServices: () => void
  onNavigateToLogin: () => void
  onNavigateToTracking: () => void
}

export function LandingPage({ onNavigateToServices, onNavigateToLogin, onNavigateToTracking }: LandingPageProps) {
  const stats = [
    { label: 'Total Penduduk', value: '2,847', icon: Users },
    { label: 'Keluarga', value: '892', icon: Building2 },
    { label: 'Layanan Aktif', value: '24', icon: FileText },
    { label: 'Permohonan Bulan Ini', value: '156', icon: TrendingUp }
  ]

  const features = [
    {
      icon: FileText,
      title: 'Pelayanan Surat Online',
      description: 'Ajukan permohonan surat keterangan secara online tanpa perlu datang ke kantor'
    },
    {
      icon: Shield,
      title: 'Keamanan Data Terjamin',
      description: 'Sistem keamanan berlapis untuk melindungi data pribadi masyarakat'
    },
    {
      icon: Clock,
      title: 'Proses Cepat',
      description: 'Waktu proses yang lebih cepat dan transparan untuk semua layanan'
    },
    {
      icon: Globe,
      title: 'Akses 24/7',
      description: 'Layanan dapat diakses kapan saja dan dimana saja melalui internet'
    }
  ]

  const services = [
    'Surat Keterangan Domisili',
    'Surat Keterangan Belum Menikah', 
    'Surat Keterangan Tidak Mampu',
    'Izin Mendirikan Bangunan',
    'Surat Keterangan Usaha',
    'Surat Pengantar SKCK'
  ]

  const news = [
    {
      title: 'Pembukaan Pendaftaran Bantuan Sosial 2024',
      date: '15 Januari 2024',
      excerpt: 'Nagari Koto Baru membuka pendaftaran bantuan sosial untuk masyarakat kurang mampu...'
    },
    {
      title: 'Peluncuran Sistem Informasi Nagari Terpadu',
      date: '10 Januari 2024', 
      excerpt: 'Sistem digital baru untuk mempermudah pelayanan administrasi masyarakat...'
    },
    {
      title: 'Kegiatan Gotong Royong Pembersihan Lingkungan',
      date: '5 Januari 2024',
      excerpt: 'Mengajak seluruh masyarakat untuk berpartisipasi dalam menjaga kebersihan nagari...'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      {/* Hero Section */}
      <div className="bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="space-y-4">
                <Badge variant="secondary" className="w-fit">
                  Platform Digital Nagari
                </Badge>
                <h1 className="text-4xl lg:text-5xl font-bold leading-tight">
                  Selamat Datang di<br />
                  <span className="text-accent">Nagari Koto Baru</span>
                </h1>
                <p className="text-xl text-primary-foreground/80">
                  Sistem Informasi Nagari Terpadu untuk pelayanan masyarakat yang lebih baik, 
                  transparan, dan mudah diakses.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  size="lg" 
                  variant="secondary"
                  onClick={onNavigateToServices}
                >
                  Lihat Layanan
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button 
                    size="lg" 
                    variant="outline"
                    onClick={onNavigateToTracking}
                    className="bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary"
                  >
                    Lacak Permohonan
                  </Button>
                  <Button 
                    size="lg" 
                    variant="outline"
                    onClick={onNavigateToLogin}
                    className="bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary"
                  >
                    Masuk Sistem
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="bg-primary-foreground/10 rounded-2xl p-8 backdrop-blur-sm">
                <div className="grid grid-cols-2 gap-6">
                  {stats.map((stat, index) => {
                    const IconComponent = stat.icon
                    return (
                      <div key={index} className="text-center space-y-2">
                        <IconComponent className="h-8 w-8 mx-auto text-accent" />
                        <div className="text-2xl font-bold">{stat.value}</div>
                        <div className="text-sm text-primary-foreground/70">{stat.label}</div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Keunggulan Sistem</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Platform digital yang dirancang khusus untuk meningkatkan kualitas pelayanan publik
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => {
            const IconComponent = feature.icon
            return (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto">
                    <IconComponent className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{feature.description}</CardDescription>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Services Section */}
      <div className="bg-muted/30 py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div>
                <h2 className="text-3xl font-bold mb-4">Layanan Unggulan</h2>
                <p className="text-lg text-muted-foreground">
                  Berbagai layanan administrasi yang dapat diakses secara online untuk kemudahan masyarakat
                </p>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {services.map((service, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 bg-background rounded-lg">
                    <Star className="h-4 w-4 text-accent" />
                    <span className="text-sm">{service}</span>
                  </div>
                ))}
              </div>
              
              <Button onClick={onNavigateToServices}>
                Lihat Semua Layanan
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
            
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Clock className="h-5 w-5 mr-2 text-primary" />
                    Jam Pelayanan
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span>Senin - Jumat</span>
                    <span className="font-medium">08:00 - 16:00 WIB</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Istirahat</span>
                    <span className="font-medium">12:00 - 13:00 WIB</span>
                  </div>
                  <Separator />
                  <div className="text-sm text-muted-foreground">
                    *Layanan online tersedia 24/7
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* News Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Berita & Pengumuman</h2>
          <p className="text-lg text-muted-foreground">
            Informasi terkini dari Nagari Koto Baru
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {news.map((item, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center text-sm text-muted-foreground mb-2">
                  <Calendar className="h-4 w-4 mr-2" />
                  {item.date}
                </div>
                <CardTitle className="text-lg leading-tight">{item.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="line-clamp-3">{item.excerpt}</CardDescription>
                <Button variant="link" className="p-0 h-auto mt-3">
                  Baca selengkapnya
                  <ChevronRight className="ml-1 h-3 w-3" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Contact Section */}
      <div className="bg-muted/30 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Hubungi Kami</h2>
              <p className="text-lg text-muted-foreground">
                Kami siap membantu untuk informasi dan pelayanan yang Anda butuhkan
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="text-center">
                <CardHeader>
                  <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto">
                    <MapPin className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Alamat</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Kantor Nagari Koto Baru<br />
                    Jl. Raya Nagari No. 123<br />
                    Kec. Lima Puluh Kota, Sumbar
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardHeader>
                  <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto">
                    <Phone className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Telepon</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    (0752) 123-456<br />
                    0812-3456-7890
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardHeader>
                  <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto">
                    <Mail className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Email</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    info@koto-baru.nagari.id<br />
                    pelayanan@koto-baru.nagari.id
                  </CardDescription>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-foreground text-background py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <Building2 className="h-6 w-6" />
              <span className="font-semibold">Nagari Koto Baru</span>
            </div>
            <div className="text-sm text-background/70">
              © 2024 Sistem Informasi Nagari Terpadu. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}