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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table"
import { 
  Search,
  Filter,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Eye,
  FileText,
  Download,
  Upload,
  MessageSquare,
  Calendar,
  User,
  MapPin,
  Phone,
  Mail,
  Check,
  X,
  RotateCcw,
  Send
} from "lucide-react"

interface KelolaPermohonanProps {
  userRole: 'admin_global' | 'admin_nagari' | 'staff_nagari' | 'warga'
}

export function KelolaPermohonan({ userRole }: KelolaPermohonanProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [jenisFilter, setJenisFilter] = useState("all")
  const [selectedPermohonan, setSelectedPermohonan] = useState<any>(null)
  const [isProcessDialogOpen, setIsProcessDialogOpen] = useState(false)

  // Mock data permohonan yang lebih lengkap
  const permohonanData = [
    {
      id: "REQ001",
      tanggalAjukan: "2024-01-15",
      jenisSurat: "Surat Keterangan Domisili",
      kategori: "Kependudukan",
      pemohon: {
        nama: "Ahmad Fauzi",
        nik: "1371234567890123",
        alamat: "Jorong Koto Baru, RT 02/RW 01",
        noHp: "081234567890",
        email: "ahmad.fauzi@email.com"
      },
      keperluan: "Persyaratan kerja di perusahaan",
      status: "submitted",
      progress: 25,
      estimasiSelesai: "2024-01-17",
      dokumen: [
        { nama: "KTP.pdf", ukuran: "1.2 MB", status: "verified" },
        { nama: "KK.pdf", ukuran: "890 KB", status: "verified" },
        { nama: "Surat_RT.pdf", ukuran: "650 KB", status: "pending" }
      ],
      timeline: [
        { tanggal: "2024-01-15 09:30", aktivitas: "Permohonan diajukan", status: "completed" },
        { tanggal: "2024-01-15 10:15", aktivitas: "Dokumen diterima", status: "completed" },
        { tanggal: "2024-01-15 11:00", aktivitas: "Verifikasi data", status: "current" },
        { tanggal: "", aktivitas: "Pembuatan surat", status: "pending" },
        { tanggal: "", aktivitas: "Penandatanganan", status: "pending" },
        { tanggal: "", aktivitas: "Selesai", status: "pending" }
      ]
    },
    {
      id: "REQ002",
      tanggalAjukan: "2024-01-18",
      jenisSurat: "Surat Keterangan Tidak Mampu",
      kategori: "Sosial",
      pemohon: {
        nama: "Siti Aminah",
        nik: "1371234567890124",
        alamat: "Jorong Koto Lama, RT 03/RW 02",
        noHp: "081234567891",
        email: "siti.aminah@email.com"
      },
      keperluan: "Bantuan biaya pengobatan",
      status: "reviewing",
      progress: 60,
      estimasiSelesai: "2024-01-21",
      dokumen: [
        { nama: "KTP.pdf", ukuran: "1.1 MB", status: "verified" },
        { nama: "KK.pdf", ukuran: "920 KB", status: "verified" },
        { nama: "Foto_Rumah.jpg", ukuran: "2.3 MB", status: "verified" },
        { nama: "Surat_Keterangan_Sakit.pdf", ukuran: "1.5 MB", status: "verified" }
      ],
      timeline: [
        { tanggal: "2024-01-18 08:45", aktivitas: "Permohonan diajukan", status: "completed" },
        { tanggal: "2024-01-18 09:30", aktivitas: "Dokumen diterima", status: "completed" },
        { tanggal: "2024-01-18 14:20", aktivitas: "Verifikasi data", status: "completed" },
        { tanggal: "2024-01-19 10:00", aktivitas: "Pembuatan surat", status: "current" },
        { tanggal: "", aktivitas: "Penandatanganan", status: "pending" },
        { tanggal: "", aktivitas: "Selesai", status: "pending" }
      ]
    },
    {
      id: "REQ003",
      tanggalAjukan: "2024-01-20",
      jenisSurat: "Surat Pengantar Nikah",
      kategori: "Kependudukan",
      pemohon: {
        nama: "Muhammad Rizki",
        nik: "1371234567890125",
        alamat: "Jorong Koto Baru, RT 01/RW 01",
        noHp: "081234567892",
        email: "rizki.muhammad@email.com"
      },
      keperluan: "Pernikahan di KUA",
      status: "completed",
      progress: 100,
      estimasiSelesai: "2024-01-22",
      dokumen: [
        { nama: "KTP.pdf", ukuran: "1.0 MB", status: "verified" },
        { nama: "KK.pdf", ukuran: "880 KB", status: "verified" },
        { nama: "Akta_Kelahiran.pdf", ukuran: "1.2 MB", status: "verified" },
        { nama: "Surat_Belum_Menikah.pdf", ukuran: "750 KB", status: "verified" }
      ],
      timeline: [
        { tanggal: "2024-01-20 10:00", aktivitas: "Permohonan diajukan", status: "completed" },
        { tanggal: "2024-01-20 11:00", aktivitas: "Dokumen diterima", status: "completed" },
        { tanggal: "2024-01-20 15:30", aktivitas: "Verifikasi data", status: "completed" },
        { tanggal: "2024-01-21 09:00", aktivitas: "Pembuatan surat", status: "completed" },
        { tanggal: "2024-01-21 16:00", aktivitas: "Penandatanganan", status: "completed" },
        { tanggal: "2024-01-22 08:30", aktivitas: "Selesai", status: "completed" }
      ]
    },
    {
      id: "REQ004",
      tanggalAjukan: "2024-01-19",
      jenisSurat: "Izin Mendirikan Bangunan",
      kategori: "Perizinan",
      pemohon: {
        nama: "Budi Santoso",
        nik: "1371234567890127",
        alamat: "Jorong Koto Lama, RT 03/RW 02",
        noHp: "081234567893",
        email: "budi.santoso@email.com"
      },
      keperluan: "Renovasi rumah",
      status: "rejected",
      progress: 30,
      estimasiSelesai: "-",
      dokumen: [
        { nama: "KTP.pdf", ukuran: "1.1 MB", status: "verified" },
        { nama: "Sertifikat_Tanah.pdf", ukuran: "2.1 MB", status: "verified" },
        { nama: "Gambar_Bangunan.pdf", ukuran: "3.2 MB", status: "rejected" }
      ],
      timeline: [
        { tanggal: "2024-01-19 14:00", aktivitas: "Permohonan diajukan", status: "completed" },
        { tanggal: "2024-01-19 15:30", aktivitas: "Dokumen diterima", status: "completed" },
        { tanggal: "2024-01-20 11:00", aktivitas: "Verifikasi data", status: "completed" },
        { tanggal: "2024-01-20 16:00", aktivitas: "Ditolak - Gambar tidak sesuai standar", status: "rejected" }
      ],
      catatanPenolakan: "Gambar bangunan tidak memenuhi standar teknis yang ditetapkan. Harap revisi sesuai petunjuk teknis yang berlaku."
    }
  ]

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'submitted':
        return <Badge variant="secondary" className="text-orange-600 bg-orange-100"><Clock className="h-3 w-3 mr-1" />Submitted</Badge>
      case 'reviewing':
        return <Badge variant="default" className="text-blue-600 bg-blue-100"><Eye className="h-3 w-3 mr-1" />Reviewing</Badge>
      case 'completed':
        return <Badge variant="outline" className="text-green-600 bg-green-100 border-green-600"><CheckCircle className="h-3 w-3 mr-1" />Completed</Badge>
      case 'rejected':
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>
      default:
        return <Badge variant="secondary">Unknown</Badge>
    }
  }

  const getPriorityColor = (status: string) => {
    switch (status) {
      case 'submitted': return 'text-orange-500'
      case 'reviewing': return 'text-blue-500'
      case 'completed': return 'text-green-500'
      case 'rejected': return 'text-red-500'
      default: return 'text-gray-500'
    }
  }

  const filteredPermohonan = permohonanData.filter(item => {
    const matchesSearch = item.jenisSurat.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.pemohon.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.id.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || item.status === statusFilter
    const matchesJenis = jenisFilter === "all" || item.kategori === jenisFilter
    return matchesSearch && matchesStatus && matchesJenis
  })

  const ProcessDialog = ({ permohonan }: { permohonan: any }) => (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <h3 className="font-semibold text-lg">{permohonan.jenisSurat}</h3>
          <p className="text-sm text-muted-foreground">ID: {permohonan.id}</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Aksi Proses</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Pilih aksi" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="approve">Setujui dan Lanjutkan</SelectItem>
                <SelectItem value="reject">Tolak Permohonan</SelectItem>
                <SelectItem value="request-docs">Minta Dokumen Tambahan</SelectItem>
                <SelectItem value="schedule">Jadwalkan Review</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Estimasi Selesai</Label>
            <Input type="date" />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Catatan Proses</Label>
          <Textarea placeholder="Tambahkan catatan untuk pemohon..." rows={3} />
        </div>

        <div className="space-y-2">
          <Label>Upload Dokumen Pendukung (Opsional)</Label>
          <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4">
            <div className="text-center">
              <Upload className="mx-auto h-6 w-6 text-muted-foreground" />
              <p className="text-sm text-muted-foreground mt-1">
                Drag & drop files atau click untuk upload
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        <Button className="flex-1">
          <Check className="h-4 w-4 mr-2" />
          Proses Permohonan
        </Button>
        <Button variant="outline" onClick={() => setIsProcessDialogOpen(false)}>
          Batal
        </Button>
      </div>
    </div>
  )

  const DetailPermohonan = ({ permohonan }: { permohonan: any }) => (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-semibold text-lg">{permohonan.jenisSurat}</h3>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="outline">{permohonan.kategori}</Badge>
            {getStatusBadge(permohonan.status)}
          </div>
        </div>
        <div className="text-right text-sm text-muted-foreground">
          <p>ID: {permohonan.id}</p>
          <p>Diajukan: {permohonan.tanggalAjukan}</p>
        </div>
      </div>

      {/* Progress */}
      <div>
        <div className="flex items-center justify-between text-sm mb-2">
          <span>Progress Permohonan</span>
          <span>{permohonan.progress}%</span>
        </div>
        <Progress value={permohonan.progress} className="h-3" />
      </div>

      {/* Pemohon Info */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <User className="h-4 w-4" />
            Data Pemohon
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Nama:</span>
                <span className="font-medium">{permohonan.pemohon.nama}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">NIK:</span>
                <span className="font-mono">{permohonan.pemohon.nik}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Alamat:</span>
                <span className="text-right max-w-48">{permohonan.pemohon.alamat}</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">No. HP:</span>
                <span className="flex items-center gap-1">
                  <Phone className="h-3 w-3" />
                  {permohonan.pemohon.noHp}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Email:</span>
                <span className="flex items-center gap-1">
                  <Mail className="h-3 w-3" />
                  {permohonan.pemohon.email}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Keperluan:</span>
                <span className="text-right max-w-48">{permohonan.keperluan}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dokumen */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Dokumen Persyaratan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {permohonan.dokumen.map((doc: any, index: number) => (
              <div key={index} className="flex items-center justify-between p-2 border rounded">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  <div>
                    <p className="text-sm font-medium">{doc.nama}</p>
                    <p className="text-xs text-muted-foreground">{doc.ukuran}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge 
                    variant={doc.status === 'verified' ? 'default' : doc.status === 'rejected' ? 'destructive' : 'secondary'}
                    className="text-xs"
                  >
                    {doc.status === 'verified' ? 'Verified' : doc.status === 'rejected' ? 'Rejected' : 'Pending'}
                  </Badge>
                  <Button variant="ghost" size="sm">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Timeline */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Timeline Proses
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {permohonan.timeline.map((item: any, index: number) => (
              <div key={index} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className={`w-3 h-3 rounded-full ${
                    item.status === 'completed' ? 'bg-green-500' :
                    item.status === 'current' ? 'bg-blue-500' :
                    item.status === 'rejected' ? 'bg-red-500' :
                    'bg-gray-300'
                  }`}></div>
                  {index < permohonan.timeline.length - 1 && (
                    <div className={`w-0.5 h-8 ${
                      item.status === 'completed' ? 'bg-green-500' : 'bg-gray-300'
                    }`}></div>
                  )}
                </div>
                <div className="flex-1 pb-4">
                  <p className={`text-sm font-medium ${
                    item.status === 'rejected' ? 'text-red-600' : ''
                  }`}>
                    {item.aktivitas}
                  </p>
                  {item.tanggal && (
                    <p className="text-xs text-muted-foreground">{item.tanggal}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Catatan Penolakan */}
      {permohonan.status === 'rejected' && permohonan.catatanPenolakan && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-4 w-4" />
              Catatan Penolakan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-red-700">{permohonan.catatanPenolakan}</p>
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
          <h1>Kelola Permohonan</h1>
          <p className="text-muted-foreground">Proses dan kelola permohonan surat warga</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Laporan
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Permohonan</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{permohonanData.length}</div>
            <p className="text-xs text-muted-foreground">Permohonan hari ini</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Perlu Diproses</CardTitle>
            <Clock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {permohonanData.filter(p => p.status === 'submitted').length}
            </div>
            <p className="text-xs text-muted-foreground">Menunggu proses</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Dalam Review</CardTitle>
            <Eye className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {permohonanData.filter(p => p.status === 'reviewing').length}
            </div>
            <p className="text-xs text-muted-foreground">Sedang diproses</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Selesai</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {permohonanData.filter(p => p.status === 'completed').length}
            </div>
            <p className="text-xs text-muted-foreground">Hari ini</p>
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
                  placeholder="Cari berdasarkan jenis surat, pemohon, atau ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filter Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Status</SelectItem>
                  <SelectItem value="submitted">Submitted</SelectItem>
                  <SelectItem value="reviewing">Reviewing</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
              <Select value={jenisFilter} onValueChange={setJenisFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Kategori" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Kategori</SelectItem>
                  <SelectItem value="Kependudukan">Kependudukan</SelectItem>
                  <SelectItem value="Sosial">Sosial</SelectItem>
                  <SelectItem value="Perizinan">Perizinan</SelectItem>
                  <SelectItem value="Pertanahan">Pertanahan</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Permohonan List */}
      <div className="space-y-4">
        {filteredPermohonan.map((permohonan) => (
          <Card key={permohonan.id} className="hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-medium">{permohonan.jenisSurat}</h3>
                    <Badge variant="outline">{permohonan.kategori}</Badge>
                    {getStatusBadge(permohonan.status)}
                  </div>
                  
                  <div className="grid gap-2 text-sm text-muted-foreground md:grid-cols-3">
                    <div>
                      <span className="font-medium">Pemohon:</span> {permohonan.pemohon.nama}
                    </div>
                    <div>
                      <span className="font-medium">Tanggal:</span> {permohonan.tanggalAjukan}
                    </div>
                    <div>
                      <span className="font-medium">ID:</span> {permohonan.id}
                    </div>
                  </div>

                  <div className="mt-3">
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span>Progress</span>
                      <span>{permohonan.progress}%</span>
                    </div>
                    <Progress value={permohonan.progress} className="h-2" />
                  </div>
                </div>

                <div className="flex gap-2 ml-4">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" onClick={() => setSelectedPermohonan(permohonan)}>
                        <Eye className="h-4 w-4 mr-1" />
                        Detail
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Detail Permohonan</DialogTitle>
                        <DialogDescription>
                          Informasi lengkap permohonan surat
                        </DialogDescription>
                      </DialogHeader>
                      {selectedPermohonan && <DetailPermohonan permohonan={selectedPermohonan} />}
                    </DialogContent>
                  </Dialog>

                  {permohonan.status === 'submitted' && (
                    <Dialog open={isProcessDialogOpen} onOpenChange={setIsProcessDialogOpen}>
                      <DialogTrigger asChild>
                        <Button size="sm" onClick={() => setSelectedPermohonan(permohonan)}>
                          <Send className="h-4 w-4 mr-1" />
                          Proses
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Proses Permohonan</DialogTitle>
                          <DialogDescription>
                            Lakukan aksi untuk permohonan ini
                          </DialogDescription>
                        </DialogHeader>
                        {selectedPermohonan && <ProcessDialog permohonan={selectedPermohonan} />}
                      </DialogContent>
                    </Dialog>
                  )}

                  {permohonan.status === 'reviewing' && (
                    <Button size="sm" variant="outline">
                      <RotateCcw className="h-4 w-4 mr-1" />
                      Update
                    </Button>
                  )}

                  {permohonan.status === 'completed' && (
                    <Button size="sm" variant="outline">
                      <Download className="h-4 w-4 mr-1" />
                      Download
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredPermohonan.length === 0 && (
          <Card>
            <CardContent className="py-8 text-center">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-medium mb-2">Tidak ada permohonan</h3>
              <p className="text-sm text-muted-foreground">
                Tidak ditemukan permohonan sesuai filter yang dipilih
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}