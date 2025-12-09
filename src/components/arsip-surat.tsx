import React, { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Badge } from "./ui/badge"
import { Label } from "./ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs"
import { 
  Search,
  Filter,
  Download,
  Eye,
  Calendar,
  FileText,
  User,
  Clock,
  Archive,
  FolderOpen,
  BarChart3,
  Printer,
  Share2,
  Hash,
  Building2
} from "lucide-react"

interface ArsipSuratProps {
  userRole: 'admin_global' | 'admin_nagari' | 'staff_nagari' | 'warga'
}

export function ArsipSurat({ userRole }: ArsipSuratProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterTahun, setFilterTahun] = useState("all")
  const [filterBulan, setFilterBulan] = useState("all")
  const [filterJenis, setFilterJenis] = useState("all")
  const [selectedSurat, setSelectedSurat] = useState<any>(null)

  // Mock data arsip surat
  const arsipData = [
    {
      id: "ARS001",
      nomorSurat: "470/001/NK-KB/2024",
      jenisSurat: "Surat Keterangan Domisili",
      kategori: "Kependudukan",
      pemohon: "Ahmad Fauzi",
      nikPemohon: "1371234567890123",
      tanggalTerbit: "2024-01-15",
      bulan: "Januari",
      tahun: "2024",
      keperluan: "Persyaratan kerja",
      petugas: "Siti Nurhaliza",
      penandatangan: "Wali Nagari Koto Baru",
      statusArsip: "aktif",
      jenisFile: "PDF",
      ukuranFile: "2.3 MB",
      linkFile: "/arsip/surat-domisili-001.pdf"
    },
    {
      id: "ARS002", 
      nomorSurat: "470/002/NK-KB/2024",
      jenisSurat: "Surat Keterangan Tidak Mampu",
      kategori: "Sosial",
      pemohon: "Siti Aminah",
      nikPemohon: "1371234567890124",
      tanggalTerbit: "2024-01-18",
      bulan: "Januari",
      tahun: "2024",
      keperluan: "Bantuan pengobatan",
      petugas: "Ahmad Syahrul",
      penandatangan: "Wali Nagari Koto Baru",
      statusArsip: "aktif",
      jenisFile: "PDF",
      ukuranFile: "1.8 MB",
      linkFile: "/arsip/surat-tidak-mampu-002.pdf"
    },
    {
      id: "ARS003",
      nomorSurat: "470/003/NK-KB/2024",
      jenisSurat: "Surat Pengantar Nikah",
      kategori: "Kependudukan",
      pemohon: "Muhammad Rizki",
      nikPemohon: "1371234567890125",
      tanggalTerbit: "2024-01-20",
      bulan: "Januari",
      tahun: "2024",
      keperluan: "Pernikahan di KUA",
      petugas: "Dewi Sartika",
      penandatangan: "Wali Nagari Koto Baru",
      statusArsip: "aktif",
      jenisFile: "PDF",
      ukuranFile: "2.1 MB",
      linkFile: "/arsip/surat-pengantar-nikah-003.pdf"
    },
    {
      id: "ARS004",
      nomorSurat: "470/025/NK-KB/2023",
      jenisSurat: "Izin Mendirikan Bangunan",
      kategori: "Perizinan",
      pemohon: "Budi Santoso",
      nikPemohon: "1371234567890127",
      tanggalTerbit: "2023-12-15",
      bulan: "Desember",
      tahun: "2023",
      keperluan: "Renovasi rumah",
      petugas: "Hasan Basri",
      penandatangan: "Wali Nagari Koto Baru",
      statusArsip: "arsip",
      jenisFile: "PDF",
      ukuranFile: "4.2 MB",
      linkFile: "/arsip/imb-025-2023.pdf"
    },
    {
      id: "ARS005",
      nomorSurat: "470/024/NK-KB/2023",
      jenisSurat: "Surat Keterangan Usaha",
      kategori: "Kependudukan",
      pemohon: "Fatimah Zahra",
      nikPemohon: "1371234567890126",
      tanggalTerbit: "2023-12-10",
      bulan: "Desember",
      tahun: "2023",
      keperluan: "Kredit UMKM",
      petugas: "Ali Akbar",
      penandatangan: "Wali Nagari Koto Baru",
      statusArsip: "arsip",
      jenisFile: "PDF",
      ukuranFile: "1.9 MB",
      linkFile: "/arsip/surat-usaha-024-2023.pdf"
    }
  ]

  // Statistik arsip
  const arsipStats = {
    totalArsip: arsipData.length,
    suratBulanIni: arsipData.filter(s => s.tahun === "2024" && s.bulan === "Januari").length,
    suratTahunIni: arsipData.filter(s => s.tahun === "2024").length,
    kategoriTerbanyak: "Kependudukan",
    ukuranTotalFile: "12.3 MB"
  }

  // Filter data
  const filteredArsip = arsipData.filter(surat => {
    const matchesSearch = surat.nomorSurat.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         surat.jenisSurat.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         surat.pemohon.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         surat.nikPemohon.includes(searchTerm)
    const matchesTahun = filterTahun === "all" || surat.tahun === filterTahun
    const matchesBulan = filterBulan === "all" || surat.bulan === filterBulan
    const matchesJenis = filterJenis === "all" || surat.kategori === filterJenis
    return matchesSearch && matchesTahun && matchesBulan && matchesJenis
  })

  // Statistik per kategori
  const kategoriStats = [
    {
      kategori: "Kependudukan",
      jumlah: arsipData.filter(s => s.kategori === "Kependudukan").length,
      persentase: Math.round((arsipData.filter(s => s.kategori === "Kependudukan").length / arsipData.length) * 100),
      color: "bg-blue-500"
    },
    {
      kategori: "Sosial",
      jumlah: arsipData.filter(s => s.kategori === "Sosial").length,
      persentase: Math.round((arsipData.filter(s => s.kategori === "Sosial").length / arsipData.length) * 100),
      color: "bg-green-500"
    },
    {
      kategori: "Perizinan",
      jumlah: arsipData.filter(s => s.kategori === "Perizinan").length,
      persentase: Math.round((arsipData.filter(s => s.kategori === "Perizinan").length / arsipData.length) * 100),
      color: "bg-orange-500"
    },
    {
      kategori: "Pertanahan",
      jumlah: arsipData.filter(s => s.kategori === "Pertanahan").length,
      persentase: Math.round((arsipData.filter(s => s.kategori === "Pertanahan").length / arsipData.length) * 100),
      color: "bg-purple-500"
    }
  ]

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'aktif':
        return <Badge variant="default" className="text-green-600 bg-green-100">Aktif</Badge>
      case 'arsip':
        return <Badge variant="secondary">Arsip</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const DetailSurat = ({ surat }: { surat: any }) => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-semibold text-lg">{surat.jenisSurat}</h3>
          <p className="text-sm text-muted-foreground">Nomor: {surat.nomorSurat}</p>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="outline">{surat.kategori}</Badge>
            {getStatusBadge(surat.statusArsip)}
          </div>
        </div>
        <div className="text-right text-sm text-muted-foreground">
          <p>ID: {surat.id}</p>
          <p>Tanggal: {surat.tanggalTerbit}</p>
        </div>
      </div>

      {/* Info Surat */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <User className="h-4 w-4" />
              Data Pemohon
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Nama:</span>
                <span className="font-medium">{surat.pemohon}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">NIK:</span>
                <span className="font-mono">{surat.nikPemohon}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Keperluan:</span>
                <span className="text-right max-w-32">{surat.keperluan}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Data Penerbitan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Petugas:</span>
                <span className="font-medium">{surat.petugas}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Penandatangan:</span>
                <span className="text-right max-w-32">{surat.penandatangan}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tanggal Terbit:</span>
                <span>{surat.tanggalTerbit}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* File Info */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Informasi File
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-3">
            <div className="text-center p-3 border rounded">
              <FileText className="h-8 w-8 text-red-500 mx-auto mb-2" />
              <p className="text-sm font-medium">{surat.jenisFile}</p>
              <p className="text-xs text-muted-foreground">{surat.ukuranFile}</p>
            </div>
            <div className="text-center p-3 border rounded">
              <Hash className="h-8 w-8 text-blue-500 mx-auto mb-2" />
              <p className="text-sm font-medium">Nomor Surat</p>
              <p className="text-xs text-muted-foreground font-mono">{surat.nomorSurat}</p>
            </div>
            <div className="text-center p-3 border rounded">
              <Archive className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <p className="text-sm font-medium">Status</p>
              <p className="text-xs text-muted-foreground">{surat.statusArsip}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-2">
        <Button className="flex-1">
          <Download className="h-4 w-4 mr-2" />
          Download PDF
        </Button>
        <Button variant="outline">
          <Printer className="h-4 w-4 mr-2" />
          Print
        </Button>
        <Button variant="outline">
          <Share2 className="h-4 w-4 mr-2" />
          Share
        </Button>
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1>Arsip & Dokumen</h1>
          <p className="text-muted-foreground">Sistem kearsipan digital surat-surat nagari</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Backup Arsip
          </Button>
          <Button variant="outline" size="sm">
            <BarChart3 className="h-4 w-4 mr-2" />
            Laporan
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Arsip</CardTitle>
            <Archive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{arsipStats.totalArsip}</div>
            <p className="text-xs text-muted-foreground">Dokumen tersimpan</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bulan Ini</CardTitle>
            <Calendar className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{arsipStats.suratBulanIni}</div>
            <p className="text-xs text-muted-foreground">Surat diterbitkan</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tahun Ini</CardTitle>
            <Clock className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{arsipStats.suratTahunIni}</div>
            <p className="text-xs text-muted-foreground">Total 2024</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Kategori Utama</CardTitle>
            <FolderOpen className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold text-orange-600">{arsipStats.kategoriTerbanyak}</div>
            <p className="text-xs text-muted-foreground">Paling banyak</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ukuran Total</CardTitle>
            <FileText className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold text-purple-600">{arsipStats.ukuranTotalFile}</div>
            <p className="text-xs text-muted-foreground">Storage</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="arsip" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="arsip">Daftar Arsip</TabsTrigger>
          <TabsTrigger value="statistik">Statistik & Analisis</TabsTrigger>
        </TabsList>

        <TabsContent value="arsip" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col gap-4 md:flex-row md:items-center">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Cari berdasarkan nomor surat, jenis, pemohon, atau NIK..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Select value={filterTahun} onValueChange={setFilterTahun}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Tahun" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua Tahun</SelectItem>
                      <SelectItem value="2024">2024</SelectItem>
                      <SelectItem value="2023">2023</SelectItem>
                      <SelectItem value="2022">2022</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={filterBulan} onValueChange={setFilterBulan}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Bulan" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua Bulan</SelectItem>
                      <SelectItem value="Januari">Januari</SelectItem>
                      <SelectItem value="Februari">Februari</SelectItem>
                      <SelectItem value="Maret">Maret</SelectItem>
                      <SelectItem value="April">April</SelectItem>
                      <SelectItem value="Mei">Mei</SelectItem>
                      <SelectItem value="Juni">Juni</SelectItem>
                      <SelectItem value="Juli">Juli</SelectItem>
                      <SelectItem value="Agustus">Agustus</SelectItem>
                      <SelectItem value="September">September</SelectItem>
                      <SelectItem value="Oktober">Oktober</SelectItem>
                      <SelectItem value="November">November</SelectItem>
                      <SelectItem value="Desember">Desember</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={filterJenis} onValueChange={setFilterJenis}>
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

          {/* Arsip Table */}
          <Card>
            <CardHeader>
              <CardTitle>Daftar Arsip Surat</CardTitle>
              <CardDescription>
                Menampilkan {filteredArsip.length} dari {arsipData.length} dokumen
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nomor Surat</TableHead>
                      <TableHead>Jenis Surat</TableHead>
                      <TableHead>Pemohon</TableHead>
                      <TableHead>Tanggal Terbit</TableHead>
                      <TableHead>Kategori</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredArsip.map((surat) => (
                      <TableRow key={surat.id}>
                        <TableCell className="font-mono text-xs">{surat.nomorSurat}</TableCell>
                        <TableCell className="font-medium">{surat.jenisSurat}</TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{surat.pemohon}</p>
                            <p className="text-xs text-muted-foreground font-mono">{surat.nikPemohon}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {surat.tanggalTerbit}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{surat.kategori}</Badge>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(surat.statusArsip)}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="ghost" size="sm" onClick={() => setSelectedSurat(surat)}>
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-4xl">
                                <DialogHeader>
                                  <DialogTitle>Detail Arsip Surat</DialogTitle>
                                  <DialogDescription>
                                    Informasi lengkap dokumen arsip
                                  </DialogDescription>
                                </DialogHeader>
                                {selectedSurat && <DetailSurat surat={selectedSurat} />}
                              </DialogContent>
                            </Dialog>
                            <Button variant="ghost" size="sm">
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Printer className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="statistik" className="space-y-4">
          {/* Statistik per Kategori */}
          <Card>
            <CardHeader>
              <CardTitle>Statistik per Kategori</CardTitle>
              <CardDescription>
                Distribusi surat berdasarkan kategori layanan
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {kategoriStats.map((stat, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`w-4 h-4 rounded-full ${stat.color}`}></div>
                      <h4 className="font-medium">{stat.kategori}</h4>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold">{stat.jumlah}</span>
                        <span className="text-sm text-muted-foreground">{stat.persentase}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${stat.color}`}
                          style={{ width: `${stat.persentase}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Trend Penerbitan */}
          <Card>
            <CardHeader>
              <CardTitle>Trend Penerbitan Surat</CardTitle>
              <CardDescription>
                Grafik penerbitan surat dalam 6 bulan terakhir
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
                <div className="text-center">
                  <BarChart3 className="h-12 w-12 text-primary mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-600">Chart Trend Penerbitan</p>
                  <p className="text-xs text-gray-500">Integrasi dengan Chart.js</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Summary Table */}
          <Card>
            <CardHeader>
              <CardTitle>Ringkasan Arsip</CardTitle>
              <CardDescription>
                Rekapitulasi arsip berdasarkan periode
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Periode</TableHead>
                      <TableHead>Kependudukan</TableHead>
                      <TableHead>Sosial</TableHead>
                      <TableHead>Perizinan</TableHead>
                      <TableHead>Pertanahan</TableHead>
                      <TableHead>Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">Januari 2024</TableCell>
                      <TableCell>2</TableCell>
                      <TableCell>1</TableCell>
                      <TableCell>0</TableCell>
                      <TableCell>0</TableCell>
                      <TableCell className="font-medium">3</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Desember 2023</TableCell>
                      <TableCell>1</TableCell>
                      <TableCell>0</TableCell>
                      <TableCell>1</TableCell>
                      <TableCell>0</TableCell>
                      <TableCell className="font-medium">2</TableCell>
                    </TableRow>
                    <TableRow className="bg-muted/50">
                      <TableCell className="font-medium">Total</TableCell>
                      <TableCell className="font-medium">3</TableCell>
                      <TableCell className="font-medium">1</TableCell>
                      <TableCell className="font-medium">1</TableCell>
                      <TableCell className="font-medium">0</TableCell>
                      <TableCell className="font-bold">5</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}