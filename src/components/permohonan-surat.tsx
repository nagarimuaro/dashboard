import React, { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Badge } from "./ui/badge"
import { Label } from "./ui/label"
import { Textarea } from "./ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog"
import { 
  FileText, 
  Upload, 
  Clock, 
  Plus,
  Send,
  FileImage,
  X
} from "lucide-react"

interface PermohonanSuratProps {
  userRole: 'admin_global' | 'admin_nagari' | 'staff_nagari' | 'warga'
}

export function PermohonanSurat({ userRole }: PermohonanSuratProps) {
  const [selectedSurat, setSelectedSurat] = useState("")
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [selectedKategori, setSelectedKategori] = useState<string>("semua")

  // Kategori surat
  const kategoriSurat = [
    { id: "semua", nama: "Semua Kategori" },
    { id: "kependudukan", nama: "Administrasi Kependudukan" },
    { id: "perizinan", nama: "Administrasi Perizinan" },
    { id: "sosial", nama: "Administrasi Sosial" },
    { id: "pertanahan", nama: "Administrasi Pertanahan" },
  ]

  // Mock data jenis surat dengan kategori
  const jenisSurat = [
    {
      id: "surat-domisili",
      nama: "Surat Keterangan Domisili",
      deskripsi: "Surat keterangan tempat tinggal/domisili",
      kategori: "kependudukan",
      syarat: ["KTP", "KK", "Surat Pengantar RT/RW"],
      biaya: "Gratis",
      waktuProses: "1-2 hari kerja"
    },
    {
      id: "surat-tidak-mampu",
      nama: "Surat Keterangan Tidak Mampu",
      deskripsi: "Surat keterangan untuk keperluan bantuan sosial",
      kategori: "sosial",
      syarat: ["KTP", "KK", "Surat Pengantar RT/RW", "Foto rumah"],
      biaya: "Gratis",
      waktuProses: "2-3 hari kerja"
    },
    {
      id: "surat-pengantar-nikah",
      nama: "Surat Pengantar Nikah",
      deskripsi: "Surat pengantar untuk proses pernikahan",
      kategori: "kependudukan",
      syarat: ["KTP", "KK", "Akta Kelahiran", "Surat Pengantar RT/RW"],
      biaya: "Gratis",
      waktuProses: "1 hari kerja"
    },
    {
      id: "surat-usaha",
      nama: "Surat Keterangan Usaha",
      deskripsi: "Surat keterangan untuk keperluan usaha",
      kategori: "perizinan",
      syarat: ["KTP", "KK", "Foto tempat usaha", "Surat Pengantar RT/RW"],
      biaya: "Gratis",
      waktuProses: "2-3 hari kerja"
    },
    {
      id: "surat-kelahiran",
      nama: "Surat Keterangan Kelahiran",
      deskripsi: "Surat keterangan untuk pembuatan akta kelahiran",
      kategori: "kependudukan",
      syarat: ["KTP Orang Tua", "KK", "Surat Keterangan Lahir dari Bidan/Dokter"],
      biaya: "Gratis",
      waktuProses: "1 hari kerja"
    },
    {
      id: "surat-kematian",
      nama: "Surat Keterangan Kematian",
      deskripsi: "Surat keterangan untuk keperluan pemakaman",
      kategori: "kependudukan",
      syarat: ["KTP Almarhum", "KK", "Surat Keterangan Kematian dari Dokter/RS"],
      biaya: "Gratis",
      waktuProses: "1 hari kerja"
    },
    {
      id: "surat-kepemilikan-tanah",
      nama: "Surat Keterangan Kepemilikan Tanah",
      deskripsi: "Surat keterangan untuk kepemilikan tanah",
      kategori: "pertanahan",
      syarat: ["KTP", "KK", "Bukti Kepemilikan", "Surat Pengantar RT/RW"],
      biaya: "Gratis",
      waktuProses: "3-5 hari kerja"
    },
    {
      id: "surat-imb",
      nama: "Surat Izin Mendirikan Bangunan (IMB)",
      deskripsi: "Izin untuk mendirikan bangunan",
      kategori: "perizinan",
      syarat: ["KTP", "KK", "Sertifikat Tanah", "Gambar Bangunan"],
      biaya: "Sesuai ketentuan",
      waktuProses: "7-14 hari kerja"
    },
    {
      id: "surat-bantuan-sosial",
      nama: "Surat Keterangan Bantuan Sosial",
      deskripsi: "Surat keterangan untuk bantuan sosial",
      kategori: "sosial",
      syarat: ["KTP", "KK", "Surat Pengantar RT/RW"],
      biaya: "Gratis",
      waktuProses: "2-3 hari kerja"
    }
  ]

  // Filter surat berdasarkan kategori
  const filteredJenisSurat = selectedKategori === "semua" 
    ? jenisSurat 
    : jenisSurat.filter(surat => surat.kategori === selectedKategori)

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    setUploadedFiles(prev => [...prev, ...files])
  }

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index))
  }

  const getKategoriLabel = (kategoriId: string) => {
    const kategori = kategoriSurat.find(k => k.id === kategoriId)
    return kategori?.nama.replace('Administrasi ', '') || kategoriId
  }

  const FormPermohonan = ({ jenis }: { jenis: any }) => (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <h3 className="font-semibold">{jenis.nama}</h3>
          <p className="text-sm text-muted-foreground">{jenis.deskripsi}</p>
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
      <div>
        <h1 className="text-2xl font-bold">Buat Permohonan Surat</h1>
        <p className="text-muted-foreground">
          Pilih jenis surat yang ingin diajukan
        </p>
      </div>

      {/* Filter Kategori */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">Filter Kategori Surat</CardTitle>
              <CardDescription className="text-sm">
                Pilih kategori untuk melihat jenis surat yang tersedia
              </CardDescription>
            </div>
            <Badge variant="secondary">
              {filteredJenisSurat.length} Surat
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <Select value={selectedKategori} onValueChange={setSelectedKategori}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Pilih kategori surat" />
            </SelectTrigger>
            <SelectContent>
              {kategoriSurat.map((kategori) => (
                <SelectItem key={kategori.id} value={kategori.id}>
                  {kategori.nama}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Jenis Surat Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredJenisSurat.map((surat) => (
          <Card key={surat.id} className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <FileText className="h-8 w-8 text-primary" />
                <div className="flex gap-1">
                  <Badge variant="secondary" className="text-xs">
                    {getKategoriLabel(surat.kategori)}
                  </Badge>
                  <Badge variant="outline">{surat.biaya}</Badge>
                </div>
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
                  <Dialog open={isFormDialogOpen && selectedSurat === surat.id} onOpenChange={setIsFormDialogOpen}>
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
    </div>
  )
}