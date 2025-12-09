import React, { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Badge } from "./ui/badge"
import { Label } from "./ui/label"
import { Textarea } from "./ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs"
import { Progress } from "./ui/progress"
import { 
  MessageSquare,
  Plus,
  Search,
  Filter,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Eye,
  MessageCircle,
  Phone,
  Mail,
  MapPin,
  Camera,
  Send,
  Star,
  Flag,
  User,
  Calendar,
  Paperclip
} from "lucide-react"

interface PengaduanProps {
  userRole: 'admin_global' | 'admin_nagari' | 'staff_nagari' | 'warga'
}

export function Pengaduan({ userRole }: PengaduanProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [kategoriFilter, setKategoriFilter] = useState("all")
  const [prioritasFilter, setPrioritasFilter] = useState("all")
  const [selectedPengaduan, setSelectedPengaduan] = useState<any>(null)
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false)

  // Mock data pengaduan
  const pengaduanData = [
    {
      id: "ADU001",
      tanggal: "2024-01-20",
      judul: "Jalan Rusak di Jorong Koto Baru",
      kategori: "Infrastruktur",
      prioritas: "tinggi",
      status: "baru",
      pengadu: {
        nama: "Ahmad Fauzi",
        email: "ahmad.fauzi@email.com",
        phone: "081234567890",
        alamat: "Jorong Koto Baru, RT 02/RW 01"
      },
      deskripsi: "Jalan di depan rumah warga mengalami kerusakan parah dengan lubang yang dalam. Hal ini sangat mengganggu aktivitas warga dan berbahaya bagi pengendara motor.",
      lokasi: "Jl. Nagari Raya, Jorong Koto Baru",
      foto: ["jalan_rusak_1.jpg", "jalan_rusak_2.jpg"],
      estimasiPenyelesaian: "2024-02-15",
      timeline: [
        { tanggal: "2024-01-20 09:30", aktivitas: "Pengaduan diterima", status: "completed", petugas: "Sistem" },
        { tanggal: "2024-01-20 10:15", aktivitas: "Pengaduan diteruskan ke Dinas Terkait", status: "current", petugas: "Staff Nagari" }
      ],
      rating: 0,
      feedback: ""
    },
    {
      id: "ADU002",
      tanggal: "2024-01-18",
      judul: "Lampu Jalan Mati di RT 03",
      kategori: "Fasilitas Umum",
      prioritas: "sedang",
      status: "proses",
      pengadu: {
        nama: "Siti Aminah",
        email: "siti.aminah@email.com",
        phone: "081234567891",
        alamat: "Jorong Koto Lama, RT 03/RW 02"
      },
      deskripsi: "Lampu jalan di RT 03 sudah mati sejak 3 hari yang lalu. Kondisi ini membuat jalan menjadi gelap dan tidak aman untuk dilalui pada malam hari.",
      lokasi: "Jl. RT 03, Jorong Koto Lama",
      foto: ["lampu_mati.jpg"],
      estimasiPenyelesaian: "2024-01-25",
      timeline: [
        { tanggal: "2024-01-18 15:30", aktivitas: "Pengaduan diterima", status: "completed", petugas: "Sistem" },
        { tanggal: "2024-01-18 16:00", aktivitas: "Verifikasi lapangan", status: "completed", petugas: "Teknisi" },
        { tanggal: "2024-01-19 08:00", aktivitas: "Pemesanan spare part", status: "current", petugas: "Bagian Pengadaan" }
      ],
      rating: 0,
      feedback: ""
    },
    {
      id: "ADU003",
      tanggal: "2024-01-15",
      judul: "Saluran Air Tersumbat",
      kategori: "Lingkungan",
      prioritas: "tinggi",
      status: "selesai",
      pengadu: {
        nama: "Budi Santoso",
        email: "budi.santoso@email.com",
        phone: "081234567892",
        alamat: "Jorong Ladang Padi, RT 01/RW 01"
      },
      deskripsi: "Saluran air di depan rumah tersumbat sampah sehingga air tidak bisa mengalir dan menimbulkan bau tidak sedap.",
      lokasi: "Depan Rumah No. 15, Jorong Ladang Padi",
      foto: ["saluran_tersumbat.jpg"],
      estimasiPenyelesaian: "2024-01-22",
      timeline: [
        { tanggal: "2024-01-15 10:00", aktivitas: "Pengaduan diterima", status: "completed", petugas: "Sistem" },
        { tanggal: "2024-01-15 14:00", aktivitas: "Tim turun ke lokasi", status: "completed", petugas: "Tim Kebersihan" },
        { tanggal: "2024-01-16 08:00", aktivitas: "Pembersihan saluran", status: "completed", petugas: "Tim Kebersihan" },
        { tanggal: "2024-01-16 16:00", aktivitas: "Pengaduan diselesaikan", status: "completed", petugas: "Supervisor" }
      ],
      rating: 5,
      feedback: "Terima kasih, masalah sudah terselesaikan dengan baik dan cepat."
    },
    {
      id: "ADU004",
      tanggal: "2024-01-19",
      judul: "Pelayanan Surat Lambat",
      kategori: "Pelayanan",
      prioritas: "rendah",
      status: "ditolak",
      pengadu: {
        nama: "Dewi Sartika",
        email: "dewi.sartika@email.com",
        phone: "081234567893",
        alamat: "Jorong Koto Baru, RT 01/RW 01"
      },
      deskripsi: "Surat keterangan domisili saya sudah 5 hari belum jadi, padahal sudah dijanjikan 2 hari kerja.",
      lokasi: "Kantor Nagari",
      foto: [],
      estimasiPenyelesaian: "-",
      timeline: [
        { tanggal: "2024-01-19 11:00", aktivitas: "Pengaduan diterima", status: "completed", petugas: "Sistem" },
        { tanggal: "2024-01-19 14:00", aktivitas: "Investigasi internal", status: "completed", petugas: "Admin Nagari" },
        { tanggal: "2024-01-20 09:00", aktivitas: "Pengaduan ditolak - Dalam batas waktu normal", status: "completed", petugas: "Admin Nagari" }
      ],
      rating: 2,
      feedback: "Kurang puas dengan penjelasan yang diberikan.",
      alasanPenolakan: "Berdasarkan investigasi, pemrosesan surat masih dalam batas waktu normal sesuai SOP yang berlaku."
    }
  ]

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'baru':
        return <Badge variant="secondary" className="text-orange-600 bg-orange-100"><Clock className="h-3 w-3 mr-1" />Baru</Badge>
      case 'proses':
        return <Badge variant="default" className="text-blue-600 bg-blue-100"><MessageCircle className="h-3 w-3 mr-1" />Diproses</Badge>
      case 'selesai':
        return <Badge variant="outline" className="text-green-600 bg-green-100 border-green-600"><CheckCircle className="h-3 w-3 mr-1" />Selesai</Badge>
      case 'ditolak':
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Ditolak</Badge>
      default:
        return <Badge variant="secondary">Unknown</Badge>
    }
  }

  const getPrioritasBadge = (prioritas: string) => {
    switch (prioritas) {
      case 'tinggi':
        return <Badge variant="destructive" className="text-xs"><Flag className="h-2 w-2 mr-1" />Tinggi</Badge>
      case 'sedang':
        return <Badge variant="default" className="text-xs"><Flag className="h-2 w-2 mr-1" />Sedang</Badge>
      case 'rendah':
        return <Badge variant="secondary" className="text-xs"><Flag className="h-2 w-2 mr-1" />Rendah</Badge>
      default:
        return <Badge variant="secondary" className="text-xs">Normal</Badge>
    }
  }

  const getProgressValue = (status: string) => {
    switch (status) {
      case 'baru': return 25
      case 'proses': return 60
      case 'selesai': return 100
      case 'ditolak': return 100
      default: return 0
    }
  }

  const filteredPengaduan = pengaduanData.filter(item => {
    const matchesSearch = item.judul.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.pengadu.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.id.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || item.status === statusFilter
    const matchesKategori = kategoriFilter === "all" || item.kategori === kategoriFilter
    const matchesPrioritas = prioritasFilter === "all" || item.prioritas === prioritasFilter
    return matchesSearch && matchesStatus && matchesKategori && matchesPrioritas
  })

  const FormPengaduan = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="nama-pengadu">Nama Lengkap</Label>
            <Input id="nama-pengadu" placeholder="Nama lengkap" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email-pengadu">Email</Label>
            <Input id="email-pengadu" type="email" placeholder="email@domain.com" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="phone-pengadu">No. HP</Label>
            <Input id="phone-pengadu" placeholder="081234567890" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="kategori-pengaduan">Kategori Pengaduan</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Pilih kategori" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Infrastruktur">Infrastruktur</SelectItem>
                <SelectItem value="Fasilitas Umum">Fasilitas Umum</SelectItem>
                <SelectItem value="Lingkungan">Lingkungan</SelectItem>
                <SelectItem value="Pelayanan">Pelayanan</SelectItem>
                <SelectItem value="Keamanan">Keamanan</SelectItem>
                <SelectItem value="Sosial">Sosial</SelectItem>
                <SelectItem value="Lainnya">Lainnya</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="alamat-pengadu">Alamat</Label>
          <Input id="alamat-pengadu" placeholder="Alamat lengkap" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="judul-pengaduan">Judul Pengaduan</Label>
          <Input id="judul-pengaduan" placeholder="Ringkasan masalah yang ingin dilaporkan" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="lokasi-pengaduan">Lokasi Kejadian</Label>
          <Input id="lokasi-pengaduan" placeholder="Lokasi spesifik kejadian" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="deskripsi-pengaduan">Deskripsi Lengkap</Label>
          <Textarea 
            id="deskripsi-pengaduan" 
            placeholder="Jelaskan detail masalah yang ingin dilaporkan..." 
            rows={4}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="prioritas">Tingkat Prioritas</Label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Pilih prioritas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="rendah">Rendah</SelectItem>
              <SelectItem value="sedang">Sedang</SelectItem>
              <SelectItem value="tinggi">Tinggi</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Upload Foto Pendukung (Opsional)</Label>
          <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6">
            <div className="text-center">
              <Camera className="mx-auto h-8 w-8 text-muted-foreground" />
              <div className="mt-2">
                <Label htmlFor="foto-upload" className="cursor-pointer">
                  <span className="text-sm font-medium text-primary hover:underline">
                    Upload foto
                  </span>
                  <span className="text-sm text-muted-foreground"> atau drag & drop</span>
                </Label>
                <Input
                  id="foto-upload"
                  type="file"
                  multiple
                  className="hidden"
                  accept="image/*"
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                JPG, PNG, max 5MB per file
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        <Button className="flex-1">
          <Send className="h-4 w-4 mr-2" />
          Kirim Pengaduan
        </Button>
        <Button variant="outline" onClick={() => setIsFormDialogOpen(false)}>
          Batal
        </Button>
      </div>
    </div>
  )

  const DetailPengaduan = ({ pengaduan }: { pengaduan: any }) => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-semibold text-lg">{pengaduan.judul}</h3>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="outline">{pengaduan.kategori}</Badge>
            {getStatusBadge(pengaduan.status)}
            {getPrioritasBadge(pengaduan.prioritas)}
          </div>
        </div>
        <div className="text-right text-sm text-muted-foreground">
          <p>ID: {pengaduan.id}</p>
          <p>Tanggal: {pengaduan.tanggal}</p>
        </div>
      </div>

      {/* Progress */}
      <div>
        <div className="flex items-center justify-between text-sm mb-2">
          <span>Progress Penanganan</span>
          <span>{getProgressValue(pengaduan.status)}%</span>
        </div>
        <Progress value={getProgressValue(pengaduan.status)} className="h-3" />
      </div>

      {/* Data Pengadu */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <User className="h-4 w-4" />
            Data Pengadu
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Nama:</span>
                <span className="font-medium">{pengaduan.pengadu.nama}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Email:</span>
                <span className="flex items-center gap-1">
                  <Mail className="h-3 w-3" />
                  {pengaduan.pengadu.email}
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">No. HP:</span>
                <span className="flex items-center gap-1">
                  <Phone className="h-3 w-3" />
                  {pengaduan.pengadu.phone}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Alamat:</span>
                <span className="text-right max-w-48">{pengaduan.pengadu.alamat}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detail Pengaduan */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Detail Pengaduan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div>
              <Label className="text-sm font-medium">Lokasi Kejadian:</Label>
              <p className="text-sm flex items-center gap-1 mt-1">
                <MapPin className="h-3 w-3" />
                {pengaduan.lokasi}
              </p>
            </div>
            <div>
              <Label className="text-sm font-medium">Deskripsi:</Label>
              <p className="text-sm mt-1 text-muted-foreground">{pengaduan.deskripsi}</p>
            </div>
            {pengaduan.foto.length > 0 && (
              <div>
                <Label className="text-sm font-medium">Foto Pendukung:</Label>
                <div className="flex gap-2 mt-1">
                  {pengaduan.foto.map((foto: string, index: number) => (
                    <div key={index} className="w-16 h-16 bg-muted rounded border flex items-center justify-center">
                      <Camera className="h-6 w-6 text-muted-foreground" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Timeline */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Timeline Penanganan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {pengaduan.timeline.map((item: any, index: number) => (
              <div key={index} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className={`w-3 h-3 rounded-full ${
                    item.status === 'completed' ? 'bg-green-500' :
                    item.status === 'current' ? 'bg-blue-500' :
                    'bg-gray-300'
                  }`}></div>
                  {index < pengaduan.timeline.length - 1 && (
                    <div className={`w-0.5 h-8 ${
                      item.status === 'completed' ? 'bg-green-500' : 'bg-gray-300'
                    }`}></div>
                  )}
                </div>
                <div className="flex-1 pb-4">
                  <p className="text-sm font-medium">{item.aktivitas}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                    <Calendar className="h-3 w-3" />
                    <span>{item.tanggal}</span>
                    <span>•</span>
                    <span>Oleh: {item.petugas}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Rating & Feedback */}
      {pengaduan.status === 'selesai' && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Star className="h-4 w-4" />
              Rating & Feedback
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Rating:</span>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star 
                      key={star} 
                      className={`h-4 w-4 ${
                        star <= pengaduan.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                      }`} 
                    />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">({pengaduan.rating}/5)</span>
              </div>
              {pengaduan.feedback && (
                <div>
                  <Label className="text-sm font-medium">Feedback:</Label>
                  <p className="text-sm mt-1 text-muted-foreground">{pengaduan.feedback}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Alasan Penolakan */}
      {pengaduan.status === 'ditolak' && pengaduan.alasanPenolakan && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2 text-red-600">
              <XCircle className="h-4 w-4" />
              Alasan Penolakan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-red-700">{pengaduan.alasanPenolakan}</p>
          </CardContent>
        </Card>
      )}
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1>Sistem Pengaduan Masyarakat</h1>
          <p className="text-muted-foreground">Platform pengaduan dan tracking keluhan masyarakat</p>
        </div>
        <div className="flex gap-2">
          {userRole === 'warga' && (
            <Dialog open={isFormDialogOpen} onOpenChange={setIsFormDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Buat Pengaduan
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Form Pengaduan Baru</DialogTitle>
                  <DialogDescription>
                    Sampaikan keluhan atau aspirasi Anda
                  </DialogDescription>
                </DialogHeader>
                <FormPengaduan />
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pengaduan</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pengaduanData.length}</div>
            <p className="text-xs text-muted-foreground">Bulan ini</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Belum Diproses</CardTitle>
            <Clock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {pengaduanData.filter(p => p.status === 'baru').length}
            </div>
            <p className="text-xs text-muted-foreground">Perlu tindak lanjut</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Dalam Proses</CardTitle>
            <MessageCircle className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {pengaduanData.filter(p => p.status === 'proses').length}
            </div>
            <p className="text-xs text-muted-foreground">Sedang ditangani</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Selesai</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {pengaduanData.filter(p => p.status === 'selesai').length}
            </div>
            <p className="text-xs text-muted-foreground">Bulan ini</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cari berdasarkan judul, pengadu, atau ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua</SelectItem>
                  <SelectItem value="baru">Baru</SelectItem>
                  <SelectItem value="proses">Diproses</SelectItem>
                  <SelectItem value="selesai">Selesai</SelectItem>
                  <SelectItem value="ditolak">Ditolak</SelectItem>
                </SelectContent>
              </Select>
              <Select value={kategoriFilter} onValueChange={setKategoriFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Kategori" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Kategori</SelectItem>
                  <SelectItem value="Infrastruktur">Infrastruktur</SelectItem>
                  <SelectItem value="Fasilitas Umum">Fasilitas Umum</SelectItem>
                  <SelectItem value="Lingkungan">Lingkungan</SelectItem>
                  <SelectItem value="Pelayanan">Pelayanan</SelectItem>
                  <SelectItem value="Keamanan">Keamanan</SelectItem>
                  <SelectItem value="Sosial">Sosial</SelectItem>
                </SelectContent>
              </Select>
              <Select value={prioritasFilter} onValueChange={setPrioritasFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Prioritas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua</SelectItem>
                  <SelectItem value="tinggi">Tinggi</SelectItem>
                  <SelectItem value="sedang">Sedang</SelectItem>
                  <SelectItem value="rendah">Rendah</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pengaduan List */}
      <div className="space-y-4">
        {filteredPengaduan.map((pengaduan) => (
          <Card key={pengaduan.id} className="hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-medium">{pengaduan.judul}</h3>
                    <Badge variant="outline">{pengaduan.kategori}</Badge>
                    {getStatusBadge(pengaduan.status)}
                    {getPrioritasBadge(pengaduan.prioritas)}
                  </div>
                  
                  <div className="grid gap-2 text-sm text-muted-foreground md:grid-cols-3">
                    <div>
                      <span className="font-medium">Pengadu:</span> {pengaduan.pengadu.nama}
                    </div>
                    <div>
                      <span className="font-medium">Tanggal:</span> {pengaduan.tanggal}
                    </div>
                    <div>
                      <span className="font-medium">Lokasi:</span> {pengaduan.lokasi}
                    </div>
                  </div>

                  <div className="mt-3">
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span>Progress</span>
                      <span>{getProgressValue(pengaduan.status)}%</span>
                    </div>
                    <Progress value={getProgressValue(pengaduan.status)} className="h-2" />
                  </div>

                  {pengaduan.status === 'selesai' && pengaduan.rating > 0 && (
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-sm text-muted-foreground">Rating:</span>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star 
                            key={star} 
                            className={`h-3 w-3 ${
                              star <= pengaduan.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                            }`} 
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 ml-4">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" onClick={() => setSelectedPengaduan(pengaduan)}>
                        <Eye className="h-4 w-4 mr-1" />
                        Detail
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Detail Pengaduan</DialogTitle>
                        <DialogDescription>
                          Informasi lengkap pengaduan masyarakat
                        </DialogDescription>
                      </DialogHeader>
                      {selectedPengaduan && <DetailPengaduan pengaduan={selectedPengaduan} />}
                    </DialogContent>
                  </Dialog>

                  {userRole !== 'warga' && pengaduan.status === 'baru' && (
                    <Button size="sm">
                      <MessageCircle className="h-4 w-4 mr-1" />
                      Proses
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredPengaduan.length === 0 && (
          <Card>
            <CardContent className="py-8 text-center">
              <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-medium mb-2">Tidak ada pengaduan</h3>
              <p className="text-sm text-muted-foreground">
                Tidak ditemukan pengaduan sesuai filter yang dipilih
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}