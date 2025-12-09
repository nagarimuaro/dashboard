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
  FileText, 
  Upload, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Eye,
  Plus,
  Download,
  Send,
  FileImage,
  X,
  Filter,
  Search,
  Calendar,
  User,
  Users,
  Home,
  Heart,
  Shield,
  MapPin
} from "lucide-react"

interface LayananSuratProps {
  userRole: 'admin_global' | 'admin_nagari' | 'staff_nagari' | 'warga'
  kategori: string
}

export function LayananSurat({ userRole, kategori }: LayananSuratProps) {
  const [selectedSurat, setSelectedSurat] = useState("")
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [statusFilter, setStatusFilter] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")

  // Mapping kategori ke jenis surat
  const jenisPerKategori = {
    "administrasi-kependudukan": [
      {
        id: "surat-domisili",
        nama: "Surat Keterangan Domisili",
        deskripsi: "Surat keterangan tempat tinggal/domisili",
        syarat: ["KTP", "KK", "Surat Pengantar RT/RW"],
        biaya: "Gratis",
        waktuProses: "1-2 hari kerja",
        icon: Home
      },
      {
        id: "surat-pindah",
        nama: "Surat Pindah Datang/Keluar",
        deskripsi: "Surat untuk kepindahan penduduk",
        syarat: ["KTP", "KK", "Surat Keterangan Pindah dari daerah asal"],
        biaya: "Gratis",
        waktuProses: "2-3 hari kerja",
        icon: Home
      },
      {
        id: "surat-kelahiran",
        nama: "Surat Keterangan Kelahiran",
        deskripsi: "Surat untuk pembuatan akta kelahiran",
        syarat: ["KTP Orang Tua", "KK", "Surat Keterangan Lahir dari Bidan/Dokter"],
        biaya: "Gratis",
        waktuProses: "1 hari kerja",
        icon: User
      },
      {
        id: "surat-kematian",
        nama: "Surat Keterangan Kematian", 
        deskripsi: "Surat untuk keperluan pemakaman dan administrasi",
        syarat: ["KTP Almarhum", "KK", "Surat Keterangan Kematian dari Dokter/RS"],
        biaya: "Gratis",
        waktuProses: "1 hari kerja",
        icon: User
      },
      {
        id: "surat-belum-menikah",
        nama: "Surat Keterangan Belum Menikah",
        deskripsi: "Surat untuk keperluan pernikahan",
        syarat: ["KTP", "KK", "Surat Pengantar RT/RW", "Pas Foto 4x6"],
        biaya: "Gratis",
        waktuProses: "1-2 hari kerja",
        icon: Heart
      },
      {
        id: "surat-nikah",
        nama: "Surat Pengantar Nikah (KUA)",
        deskripsi: "Surat pengantar untuk proses pernikahan di KUA",
        syarat: ["KTP", "KK", "Akta Kelahiran", "Surat Pengantar RT/RW", "Surat Keterangan Belum Menikah"],
        biaya: "Gratis",
        waktuProses: "1 hari kerja",
        icon: Heart
      },
      {
        id: "surat-penghasilan",
        nama: "Surat Keterangan Penghasilan",
        deskripsi: "Surat keterangan penghasilan untuk berbagai keperluan",
        syarat: ["KTP", "KK", "Surat Pengantar RT/RW", "Slip Gaji (jika ada)"],
        biaya: "Gratis",
        waktuProses: "1-2 hari kerja",
        icon: User
      },
      {
        id: "surat-tidak-mampu",
        nama: "Surat Keterangan Tidak Mampu",
        deskripsi: "Surat untuk keperluan bantuan sosial dan pendidikan",
        syarat: ["KTP", "KK", "Surat Pengantar RT/RW", "Foto rumah"],
        biaya: "Gratis",
        waktuProses: "2-3 hari kerja",
        icon: Heart
      },
      {
        id: "surat-skck",
        nama: "Surat Pengantar SKCK",
        deskripsi: "Surat pengantar untuk pembuatan SKCK",
        syarat: ["KTP", "KK", "Surat Pengantar RT/RW", "Pas Foto 4x6"],
        biaya: "Gratis",
        waktuProses: "1 hari kerja",
        icon: Shield
      },
      {
        id: "surat-usaha",
        nama: "Surat Keterangan Usaha",
        deskripsi: "Surat keterangan untuk keperluan usaha mikro",
        syarat: ["KTP", "KK", "Foto tempat usaha", "Surat Pengantar RT/RW"],
        biaya: "Gratis",
        waktuProses: "2-3 hari kerja",
        icon: User
      },
      {
        id: "surat-janda-duda",
        nama: "Surat Keterangan Janda/Duda",
        deskripsi: "Surat keterangan status janda atau duda",
        syarat: ["KTP", "KK", "Surat Kematian Suami/Istri atau Surat Cerai", "Surat Pengantar RT/RW"],
        biaya: "Gratis",
        waktuProses: "1-2 hari kerja",
        icon: User
      },
      {
        id: "surat-izin-keramaian",
        nama: "Surat Izin Keramaian",
        deskripsi: "Surat izin untuk mengadakan keramaian/acara",
        syarat: ["KTP Penanggung Jawab", "Proposal Acara", "Surat Pengantar RT/RW", "Rekomendasi Polsek"],
        biaya: "Sesuai Perda",
        waktuProses: "3-5 hari kerja",
        icon: Shield
      },
      {
        id: "surat-kepemilikan-tanah",
        nama: "Surat Keterangan Kepemilikan Tanah",
        deskripsi: "Surat keterangan kepemilikan tanah adat/warisan",
        syarat: ["KTP", "KK", "Letter C", "Surat Warisan/Jual Beli", "Surat Pengantar RT/RW", "Saksi-saksi"],
        biaya: "Sesuai Perda",
        waktuProses: "7-10 hari kerja",
        icon: MapPin
      },
      {
        id: "surat-ahli-waris",
        nama: "Surat Keterangan Ahli Waris",
        deskripsi: "Surat keterangan untuk keperluan waris",
        syarat: ["KTP Ahli Waris", "KK", "Surat Kematian", "Akta Kelahiran", "Surat Nikah", "Saksi-saksi"],
        biaya: "Sesuai Perda",
        waktuProses: "3-7 hari kerja",
        icon: Users
      }
    ],
    "administrasi-perizinan": [
      {
        id: "perizinan-imb",
        nama: "Izin Mendirikan Bangunan (IMB)",
        deskripsi: "Izin untuk mendirikan bangunan",
        syarat: ["KTP", "KK", "Sertifikat Tanah", "Gambar Bangunan", "SIPPT"],
        biaya: "Sesuai Perda",
        waktuProses: "14-21 hari kerja",
        icon: Home
      },
      {
        id: "perizinan-situ",
        nama: "Surat Izin Tempat Usaha (SITU)",
        deskripsi: "Izin tempat usaha untuk kegiatan perdagangan",
        syarat: ["KTP", "KK", "Surat Keterangan Usaha", "Foto tempat usaha", "Denah lokasi"],
        biaya: "Sesuai Perda",
        waktuProses: "7-14 hari kerja",
        icon: Shield
      },
      {
        id: "perizinan-ho",
        nama: "Izin Gangguan (HO)",
        deskripsi: "Izin untuk usaha yang berpotensi menimbulkan gangguan",
        syarat: ["KTP", "SITU", "Foto tempat usaha", "Persetujuan tetangga"],
        biaya: "Sesuai Perda", 
        waktuProses: "10-14 hari kerja",
        icon: Shield
      },
      {
        id: "perizinan-siup",
        nama: "Surat Izin Usaha Perdagangan (SIUP)",
        deskripsi: "Izin usaha untuk kegiatan perdagangan",
        syarat: ["KTP", "KK", "NPWP", "Akta Perusahaan", "Surat Keterangan Domisili"],
        biaya: "Sesuai Perda",
        waktuProses: "7-14 hari kerja",
        icon: User
      }
    ],
    "administrasi-sosial": [
      {
        id: "sosial-miskin",
        nama: "Surat Keterangan Keluarga Miskin",
        deskripsi: "Surat untuk bantuan program kemiskinan",
        syarat: ["KTP", "KK", "Surat Pengantar RT/RW", "Foto rumah", "Data pendapatan"],
        biaya: "Gratis",
        waktuProses: "3-5 hari kerja",
        icon: Heart
      },
      {
        id: "sosial-beasiswa",
        nama: "Surat Rekomendasi Beasiswa",
        deskripsi: "Surat rekomendasi untuk permohonan beasiswa",
        syarat: ["KTP Orang Tua", "KK", "Rapor/Transkrip", "Surat Keterangan Tidak Mampu"],
        biaya: "Gratis",
        waktuProses: "2-3 hari kerja",
        icon: User
      },
      {
        id: "sosial-bantuan",
        nama: "Surat Rekomendasi Bantuan Sosial",
        deskripsi: "Surat untuk bantuan sosial pemerintah",
        syarat: ["KTP", "KK", "Surat Pengantar RT/RW", "Foto kondisi rumah"],
        biaya: "Gratis",
        waktuProses: "3-5 hari kerja",
        icon: Heart
      }
    ],
    "administrasi-pertanahan": [
      {
        id: "pertanahan-sertifikat",
        nama: "Surat Keterangan Tanah",
        deskripsi: "Surat keterangan kepemilikan tanah",
        syarat: ["KTP", "KK", "Letter C", "Surat Jual Beli", "Surat Pengantar RT/RW"],
        biaya: "Sesuai Perda",
        waktuProses: "7-14 hari kerja",
        icon: MapPin
      },
      {
        id: "pertanahan-riwayat",
        nama: "Surat Riwayat Tanah",
        deskripsi: "Surat riwayat kepemilikan dan transaksi tanah",
        syarat: ["KTP", "Letter C", "Riwayat kepemilikan", "Surat Pengantar RT/RW"],
        biaya: "Sesuai Perda",
        waktuProses: "10-14 hari kerja",
        icon: MapPin
      },
      {
        id: "pertanahan-jual-beli",
        nama: "Surat Jual Beli Tanah",
        deskripsi: "Surat untuk transaksi jual beli tanah",
        syarat: ["KTP Penjual & Pembeli", "Letter C", "Surat Tanah", "Saksi", "Materai"],
        biaya: "Sesuai Perda",
        waktuProses: "5-7 hari kerja",
        icon: MapPin
      }
    ]
  }

  // Mock data permohonan berdasarkan kategori
  const mockPermohonan = [
    {
      id: "REQ001",
      jenisSurat: "Surat Keterangan Domisili",
      pemohon: "Ahmad Fauzi",
      tanggalAjukan: "2024-01-15",
      status: "completed",
      progress: 100,
      estimasiSelesai: "2024-01-17",
      catatan: "Surat telah selesai dan dapat diambil"
    },
    {
      id: "REQ002", 
      jenisSurat: "Surat Keterangan Tidak Mampu",
      pemohon: "Siti Aminah",
      tanggalAjukan: "2024-01-18",
      status: "reviewing",
      progress: 60,
      estimasiSelesai: "2024-01-21",
      catatan: "Sedang dalam proses verifikasi dokumen"
    },
    {
      id: "REQ003",
      jenisSurat: "Surat Pengantar Nikah",
      pemohon: "Muhammad Rizki",
      tanggalAjukan: "2024-01-20",
      status: "submitted",
      progress: 25,
      estimasiSelesai: "2024-01-22", 
      catatan: "Dokumen telah diterima, menunggu proses"
    }
  ]

  const jenisSurat = jenisPerKategori[kategori as keyof typeof jenisPerKategori] || []

  const getKategoriInfo = () => {
    switch (kategori) {
      case 'administrasi-kependudukan':
        return { 
          title: "Administrasi Kependudukan", 
          description: "Layanan surat-surat kependudukan dan kewarganegaraan",
          icon: User,
          color: "bg-blue-100 text-blue-600"
        }
      case 'administrasi-perizinan':
        return { 
          title: "Administrasi Perizinan", 
          description: "Layanan perizinan usaha dan bangunan",
          icon: Shield,
          color: "bg-green-100 text-green-600"
        }
      case 'administrasi-sosial':
        return { 
          title: "Administrasi Sosial", 
          description: "Layanan bantuan sosial dan kemasyarakatan",
          icon: Heart,
          color: "bg-pink-100 text-pink-600"
        }
      case 'administrasi-pertanahan':
        return { 
          title: "Administrasi Pertanahan", 
          description: "Layanan surat-surat pertanahan dan kepemilikan",
          icon: MapPin,
          color: "bg-orange-100 text-orange-600"
        }
      default:
        return { 
          title: "Layanan Surat", 
          description: "Layanan administrasi nagari",
          icon: FileText,
          color: "bg-gray-100 text-gray-600"
        }
    }
  }

  const kategoriInfo = getKategoriInfo()

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    setUploadedFiles(prev => [...prev, ...files])
  }

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index))
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'submitted':
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Submitted</Badge>
      case 'reviewing':
        return <Badge variant="default"><Eye className="h-3 w-3 mr-1" />Reviewing</Badge>
      case 'completed':
        return <Badge variant="outline" className="text-green-600 border-green-600"><CheckCircle className="h-3 w-3 mr-1" />Completed</Badge>
      case 'rejected':
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>
      default:
        return <Badge variant="secondary">Unknown</Badge>
    }
  }

  const filteredPermohonan = mockPermohonan.filter(item => {
    const matchesStatus = statusFilter === "all" || item.status === statusFilter
    const matchesSearch = item.jenisSurat.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.pemohon.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.id.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesStatus && matchesSearch
  })

  const FormPermohonan = ({ jenis }: { jenis: any }) => (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${kategoriInfo.color}`}>
            <jenis.icon className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold">{jenis.nama}</h3>
            <p className="text-sm text-muted-foreground">{jenis.deskripsi}</p>
          </div>
        </div>
        
        <div className="grid gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nama">Nama Pemohon</Label>
              <Input id="nama" placeholder="Nama lengkap sesuai KTP" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nik">NIK</Label>
              <Input id="nik" placeholder="16 digit NIK" />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="alamat">Alamat</Label>
            <Textarea id="alamat" placeholder="Alamat lengkap" />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="noHp">No. HP</Label>
              <Input id="noHp" placeholder="081234567890" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="keperluan">Keperluan</Label>
              <Input id="keperluan" placeholder="Untuk keperluan..." />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="keterangan">Keterangan Tambahan</Label>
            <Textarea id="keterangan" placeholder="Keterangan tambahan jika ada" />
          </div>
        </div>
      </div>

      {/* Upload Dokumen */}
      <div className="space-y-4">
        <div>
          <h4 className="font-medium">Upload Dokumen Persyaratan</h4>
          <p className="text-sm text-muted-foreground">Dokumen yang diperlukan:</p>
          <ul className="text-sm text-muted-foreground ml-4 mt-1">
            {jenis.syarat.map((syarat: string, index: number) => (
              <li key={index} className="list-disc">{syarat}</li>
            ))}
          </ul>
        </div>
        
        <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6">
          <div className="text-center">
            <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
            <div className="mt-2">
              <Label htmlFor="file-upload" className="cursor-pointer">
                <span className="text-sm font-medium text-primary hover:underline">
                  Click to upload
                </span>
                <span className="text-sm text-muted-foreground"> or drag and drop</span>
              </Label>
              <Input
                id="file-upload"
                type="file"
                multiple
                className="hidden"
                onChange={handleFileUpload}
                accept=".pdf,.jpg,.jpeg,.png"
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              PDF, JPG, PNG up to 10MB each
            </p>
          </div>
        </div>
        
        {uploadedFiles.length > 0 && (
          <div className="space-y-2">
            <Label>File yang diupload:</Label>
            {uploadedFiles.map((file, index) => (
              <div key={index} className="flex items-center justify-between p-2 border rounded">
                <div className="flex items-center gap-2">
                  <FileImage className="h-4 w-4" />
                  <span className="text-sm">{file.name}</span>
                  <span className="text-xs text-muted-foreground">
                    ({(file.size / 1024 / 1024).toFixed(2)} MB)
                  </span>
                </div>
                <Button variant="ghost" size="sm" onClick={() => removeFile(index)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <Button className="flex-1">
          <Send className="h-4 w-4 mr-2" />
          Ajukan Permohonan
        </Button>
        <Button variant="outline" onClick={() => setIsFormDialogOpen(false)}>
          Batal
        </Button>
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className={`p-3 rounded-lg ${kategoriInfo.color}`}>
          <kategoriInfo.icon className="h-6 w-6" />
        </div>
        <div>
          <h1>{kategoriInfo.title}</h1>
          <p className="text-muted-foreground">{kategoriInfo.description}</p>
        </div>
      </div>

      <Tabs defaultValue={userRole === 'warga' ? "ajukan" : "kelola"} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="ajukan">
            {userRole === 'warga' ? "Ajukan Permohonan" : "Jenis Surat"}
          </TabsTrigger>
          <TabsTrigger value="kelola">
            {userRole === 'warga' ? "Status Permohonan" : "Kelola Permohonan"}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="ajukan" className="space-y-6">
          {/* Jenis Surat */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {jenisSurat.map((surat) => (
              <Card key={surat.id} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className={`p-2 rounded-lg ${kategoriInfo.color}`}>
                      <surat.icon className="h-5 w-5" />
                    </div>
                    <Badge variant="outline">{surat.biaya}</Badge>
                  </div>
                  <CardTitle className="text-base">{surat.nama}</CardTitle>
                  <CardDescription className="text-sm">{surat.deskripsi}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1">Syarat:</p>
                      <ul className="text-xs text-muted-foreground">
                        {surat.syarat.slice(0, 2).map((syarat, index) => (
                          <li key={index} className="list-disc ml-4">{syarat}</li>
                        ))}
                        {surat.syarat.length > 2 && (
                          <li className="list-disc ml-4">+ {surat.syarat.length - 2} lainnya</li>
                        )}
                      </ul>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        <Clock className="h-3 w-3 inline mr-1" />
                        {surat.waktuProses}
                      </span>
                      <Dialog open={isFormDialogOpen} onOpenChange={setIsFormDialogOpen}>
                        <DialogTrigger asChild>
                          <Button size="sm" onClick={() => setSelectedSurat(surat.id)}>
                            <Plus className="h-4 w-4 mr-1" />
                            Ajukan
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Form Permohonan Surat</DialogTitle>
                            <DialogDescription>
                              Isi formulir berikut untuk mengajukan permohonan surat
                            </DialogDescription>
                          </DialogHeader>
                          <FormPermohonan jenis={surat} />
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="kelola" className="space-y-6">
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
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Status Permohonan */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2>Daftar Permohonan</h2>
              <Badge variant="outline">{filteredPermohonan.length} Permohonan</Badge>
            </div>
            
            {filteredPermohonan.map((permohonan) => (
              <Card key={permohonan.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-base">{permohonan.jenisSurat}</CardTitle>
                      <CardDescription>
                        ID: {permohonan.id} • Pemohon: {permohonan.pemohon} • Diajukan: {permohonan.tanggalAjukan}
                      </CardDescription>
                    </div>
                    {getStatusBadge(permohonan.status)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span>Progress</span>
                        <span>{permohonan.progress}%</span>
                      </div>
                      <Progress value={permohonan.progress} className="h-2" />
                    </div>
                    
                    <div className="grid gap-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Estimasi Selesai:</span>
                        <span>{permohonan.estimasiSelesai}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Catatan:</span>
                        <span className="text-right max-w-64">{permohonan.catatan}</span>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-1" />
                        Detail
                      </Button>
                      {userRole !== 'warga' && permohonan.status === 'submitted' && (
                        <Button size="sm">
                          Proses
                        </Button>
                      )}
                      {permohonan.status === 'completed' && (
                        <Button size="sm">
                          <Download className="h-4 w-4 mr-1" />
                          Download Surat
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
                    {searchTerm || statusFilter !== 'all' 
                      ? 'Tidak ditemukan permohonan sesuai filter yang dipilih'
                      : 'Belum ada permohonan surat yang diajukan'
                    }
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}