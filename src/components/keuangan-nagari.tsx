import React, { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { Button } from "./ui/button"
import { Badge } from "./ui/badge"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { Progress } from "./ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog"
import { Textarea } from "./ui/textarea"
import { Alert, AlertDescription } from "./ui/alert"
import { ScrollArea } from "./ui/scroll-area"
import { Skeleton } from "./ui/skeleton"
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Target, 
  PieChart as PieChartIcon,
  BarChart3,
  Download,
  FileText,
  AlertTriangle,
  Plus,
  Edit,
  Trash2,
  Eye,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  Wallet,
  Building2,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Search,
  Filter,
  MoreHorizontal,
  FileSpreadsheet,
  Printer,
  ChevronRight,
  ChevronDown,
  Loader2,
} from "lucide-react"
import * as keuanganService from "../services/keuanganService"

interface KeuanganNagariProps {
  userRole: 'admin_global' | 'admin_nagari' | 'staff_nagari' | 'warga'
}

// Format currency helper
const formatCurrency = (amount: number | string) => {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount
  if (isNaN(num)) return 'Rp 0'
  if (num >= 1000000000) {
    return `Rp ${(num / 1000000000).toFixed(2)}M`
  } else if (num >= 1000000) {
    return `Rp ${(num / 1000000).toFixed(1)}jt`
  } else {
    return `Rp ${num.toLocaleString('id-ID')}`
  }
}

// Format percentage
const formatPercentage = (value: number) => {
  return `${value.toFixed(1)}%`
}

// Get status badge variant
const getStatusBadge = (persentase: number) => {
  if (persentase >= 80) return { variant: "default" as const, color: "bg-green-100 text-green-800" }
  if (persentase >= 60) return { variant: "secondary" as const, color: "bg-blue-100 text-blue-800" }
  if (persentase >= 40) return { variant: "outline" as const, color: "bg-yellow-100 text-yellow-800" }
  return { variant: "destructive" as const, color: "bg-red-100 text-red-800" }
}

export function KeuanganNagari({ userRole }: KeuanganNagariProps) {
  // State management
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("dashboard")
  
  // Data states
  const [tahunAnggaranList, setTahunAnggaranList] = useState<any[]>([])
  const [selectedTahunAnggaran, setSelectedTahunAnggaran] = useState<number | null>(null)
  const [apbNagari, setApbNagari] = useState<any>(null)
  const [bidangList, setBidangList] = useState<any[]>([])
  const [pendapatanList, setPendapatanList] = useState<any[]>([])
  const [belanjaList, setBelanjaList] = useState<any[]>([])
  const [transaksiList, setTransaksiList] = useState<any[]>([])
  const [laporanAPB, setLaporanAPB] = useState<any>(null)
  
  // Dialog states
  const [showTransaksiDialog, setShowTransaksiDialog] = useState(false)
  const [showPendapatanDialog, setShowPendapatanDialog] = useState(false)
  const [showBelanjaDialog, setShowBelanjaDialog] = useState(false)
  const [editingItem, setEditingItem] = useState<any>(null)
  
  // Form states
  const [formData, setFormData] = useState<any>({})

  // Fetch tahun anggaran on mount
  useEffect(() => {
    fetchTahunAnggaran()
  }, [])

  // Fetch data when tahun anggaran changes
  useEffect(() => {
    if (selectedTahunAnggaran) {
      fetchAllData()
    }
  }, [selectedTahunAnggaran])

  const fetchTahunAnggaran = async () => {
    try {
      setLoading(true)
      const response = await keuanganService.getTahunAnggaran()
      if (response.success && response.data) {
        setTahunAnggaranList(response.data)
        // Auto-select active tahun anggaran
        const active = response.data.find((ta: any) => ta.status === 'disahkan')
        if (active) {
          setSelectedTahunAnggaran(active.id)
        } else if (response.data.length > 0) {
          setSelectedTahunAnggaran(response.data[0].id)
        }
      }
    } catch (err: any) {
      setError(err.message || 'Gagal memuat data tahun anggaran')
    } finally {
      setLoading(false)
    }
  }

  const fetchAllData = async () => {
    if (!selectedTahunAnggaran) return
    
    setLoading(true)
    setError(null)
    
    try {
      const [apbRes, bidangRes, pendapatanRes, belanjaRes, laporanRes] = await Promise.all([
        keuanganService.getAPBNagari(selectedTahunAnggaran!).catch(() => ({ success: false, data: null })),
        keuanganService.getBidang().catch(() => ({ success: false, data: [] })),
        keuanganService.getPendapatan(selectedTahunAnggaran!).catch(() => ({ success: false, data: [] })),
        keuanganService.getBelanja({ tahun_anggaran_id: selectedTahunAnggaran }).catch(() => ({ success: false, data: [] })),
        keuanganService.getLaporanAPBNagari(selectedTahunAnggaran!).catch(() => ({ success: false, data: null })),
      ])

      if (apbRes.success && apbRes.data) setApbNagari(apbRes.data)
      if (bidangRes.success) setBidangList(bidangRes.data || [])
      if (pendapatanRes.success) setPendapatanList(pendapatanRes.data || [])
      if (belanjaRes.success) setBelanjaList(belanjaRes.data || [])
      if (laporanRes.success && laporanRes.data) setLaporanAPB(laporanRes.data)
      
    } catch (err: any) {
      setError(err.message || 'Gagal memuat data')
    } finally {
      setLoading(false)
    }
  }

  const fetchTransaksi = async () => {
    if (!selectedTahunAnggaran) return
    try {
      const response = await keuanganService.getTransaksi(selectedTahunAnggaran)
      if (response.success) {
        setTransaksiList(response.data?.data || [])
      }
    } catch (err) {
      console.error('Error fetching transaksi:', err)
    }
  }

  // Calculate totals from APBNagari
  const calculateTotals = () => {
    if (!apbNagari) {
      return {
        totalPendapatan: 0,
        totalBelanja: 0,
        totalPembiayaan: 0,
        surplusDefisit: 0,
        silpa: 0
      }
    }

    return {
      totalPendapatan: parseFloat(apbNagari.pendapatan?.total || 0),
      totalBelanja: parseFloat(apbNagari.belanja?.total || 0),
      pembiayaanPenerimaan: parseFloat(apbNagari.pembiayaan?.penerimaan || 0),
      pembiayaanPengeluaran: parseFloat(apbNagari.pembiayaan?.pengeluaran || 0),
      surplusDefisit: parseFloat(apbNagari.surplus_defisit || 0),
      silpa: parseFloat(apbNagari.silpa || 0)
    }
  }

  const totals = calculateTotals()

  // Dashboard Overview Tab
  const DashboardTab = () => (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pendapatan</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(totals.totalPendapatan)}</div>
            <p className="text-xs text-muted-foreground">Anggaran Pendapatan Nagari</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Belanja</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{formatCurrency(totals.totalBelanja)}</div>
            <p className="text-xs text-muted-foreground">Anggaran Belanja Nagari</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Surplus/Defisit</CardTitle>
            {totals.surplusDefisit >= 0 ? (
              <ArrowUpRight className="h-4 w-4 text-green-600" />
            ) : (
              <ArrowDownRight className="h-4 w-4 text-red-600" />
            )}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${totals.surplusDefisit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(totals.surplusDefisit)}
            </div>
            <p className="text-xs text-muted-foreground">Pendapatan - Belanja</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">SiLPA</CardTitle>
            <Wallet className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{formatCurrency(totals.silpa)}</div>
            <p className="text-xs text-muted-foreground">Sisa Lebih Perhitungan Anggaran</p>
          </CardContent>
        </Card>
      </div>

      {/* Belanja per Bidang */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Anggaran Belanja per Bidang
          </CardTitle>
          <CardDescription>Ringkasan alokasi anggaran berdasarkan bidang pembangunan</CardDescription>
        </CardHeader>
        <CardContent>
          {apbNagari?.belanja?.per_bidang?.length > 0 ? (
            <div className="space-y-4">
              {apbNagari.belanja.per_bidang.map((bidang: any, index: number) => {
                const totalBelanja = parseFloat(apbNagari.belanja.total) || 1
                const persentase = (parseFloat(bidang.total_anggaran) / totalBelanja) * 100
                return (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{bidang.kode}</Badge>
                        <span className="font-medium">{bidang.nama}</span>
                      </div>
                      <span className="text-sm font-semibold">{formatCurrency(bidang.total_anggaran)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Progress value={persentase} className="flex-1" />
                      <span className="text-xs text-muted-foreground w-12 text-right">{formatPercentage(persentase)}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <BarChart3 className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>Belum ada data belanja per bidang</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveTab("pendapatan")}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Kelola Pendapatan</p>
                <p className="text-2xl font-bold">{pendapatanList.length}</p>
                <p className="text-xs text-muted-foreground">Item pendapatan</p>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveTab("belanja")}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Kelola Belanja</p>
                <p className="text-2xl font-bold">{belanjaList.length}</p>
                <p className="text-xs text-muted-foreground">Item belanja</p>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveTab("laporan")}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Laporan Keuangan</p>
                <p className="text-2xl font-bold">5</p>
                <p className="text-xs text-muted-foreground">Jenis laporan</p>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )

  // Pendapatan Tab
  const PendapatanTab = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Anggaran Pendapatan</h3>
          <p className="text-sm text-muted-foreground">Kelola sumber pendapatan nagari</p>
        </div>
        {(userRole === 'admin_global' || userRole === 'admin_nagari') && (
          <Button onClick={() => {
            setEditingItem(null)
            setFormData({ tahun_anggaran_id: selectedTahunAnggaran })
            setShowPendapatanDialog(true)
          }}>
            <Plus className="h-4 w-4 mr-2" />
            Tambah Pendapatan
          </Button>
        )}
      </div>

      <Card>
        <CardContent className="pt-6">
          {pendapatanList.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Kode Rekening</TableHead>
                  <TableHead>Uraian</TableHead>
                  <TableHead>Kelompok</TableHead>
                  <TableHead className="text-right">Anggaran</TableHead>
                  <TableHead className="text-right">Realisasi</TableHead>
                  <TableHead className="text-right">%</TableHead>
                  <TableHead className="text-center">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendapatanList.map((item: any) => {
                  const persentase = parseFloat(item.anggaran) > 0 
                    ? (parseFloat(item.realisasi) / parseFloat(item.anggaran)) * 100 
                    : 0
                  const status = getStatusBadge(persentase)
                  return (
                    <TableRow key={item.id}>
                      <TableCell className="font-mono text-sm">{item.kode_rekening}</TableCell>
                      <TableCell>{item.uraian}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">{item.kelompok?.replace('_', ' ') || '-'}</Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium">{formatCurrency(item.anggaran)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(item.realisasi)}</TableCell>
                      <TableCell className="text-right">
                        <Badge className={status.color}>{formatPercentage(persentase)}</Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Button variant="ghost" size="icon" title="Edit">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" title="Hapus" className="text-red-600">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <DollarSign className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>Belum ada data pendapatan</p>
              <p className="text-sm">Klik tombol "Tambah Pendapatan" untuk menambah data</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Summary */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground">Total Anggaran</div>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(pendapatanList.reduce((sum: number, item: any) => sum + parseFloat(item.anggaran || 0), 0))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground">Total Realisasi</div>
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrency(pendapatanList.reduce((sum: number, item: any) => sum + parseFloat(item.realisasi || 0), 0))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground">Sisa Anggaran</div>
            <div className="text-2xl font-bold text-orange-600">
              {formatCurrency(pendapatanList.reduce((sum: number, item: any) => 
                sum + (parseFloat(item.anggaran || 0) - parseFloat(item.realisasi || 0)), 0))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )

  // Belanja Tab
  const BelanjaTab = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Anggaran Belanja</h3>
          <p className="text-sm text-muted-foreground">Kelola alokasi belanja nagari</p>
        </div>
        {(userRole === 'admin_global' || userRole === 'admin_nagari') && (
          <Button onClick={() => {
            setEditingItem(null)
            setFormData({ tahun_anggaran_id: selectedTahunAnggaran })
            setShowBelanjaDialog(true)
          }}>
            <Plus className="h-4 w-4 mr-2" />
            Tambah Belanja
          </Button>
        )}
      </div>

      <Card>
        <CardContent className="pt-6">
          {belanjaList.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Kode Rekening</TableHead>
                  <TableHead>Uraian</TableHead>
                  <TableHead>Bidang</TableHead>
                  <TableHead className="text-right">Anggaran</TableHead>
                  <TableHead className="text-right">Realisasi</TableHead>
                  <TableHead className="text-right">%</TableHead>
                  <TableHead className="text-center">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {belanjaList.slice(0, 20).map((item: any) => {
                  const persentase = parseFloat(item.anggaran) > 0 
                    ? (parseFloat(item.realisasi) / parseFloat(item.anggaran)) * 100 
                    : 0
                  const status = getStatusBadge(persentase)
                  return (
                    <TableRow key={item.id}>
                      <TableCell className="font-mono text-sm">{item.kode_rekening}</TableCell>
                      <TableCell className="max-w-[200px] truncate">{item.uraian}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{item.kegiatan?.sub_bidang?.bidang?.nama?.substring(0, 20) || '-'}</Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium">{formatCurrency(item.anggaran)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(item.realisasi)}</TableCell>
                      <TableCell className="text-right">
                        <Badge className={status.color}>{formatPercentage(persentase)}</Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Button variant="ghost" size="icon" title="Edit">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" title="Hapus" className="text-red-600">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Wallet className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>Belum ada data belanja</p>
              <p className="text-sm">Klik tombol "Tambah Belanja" untuk menambah data</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Summary */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground">Total Anggaran</div>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(belanjaList.reduce((sum: number, item: any) => sum + parseFloat(item.anggaran || 0), 0))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground">Total Realisasi</div>
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrency(belanjaList.reduce((sum: number, item: any) => sum + parseFloat(item.realisasi || 0), 0))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground">Sisa Anggaran</div>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(belanjaList.reduce((sum: number, item: any) => 
                sum + (parseFloat(item.anggaran || 0) - parseFloat(item.realisasi || 0)), 0))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )

  // Laporan Tab
  const LaporanTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Laporan Keuangan</h3>
          <p className="text-sm text-muted-foreground">Akses berbagai laporan keuangan nagari</p>
        </div>
        <Button variant="outline">
          <Printer className="h-4 w-4 mr-2" />
          Cetak Semua
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* APBNagari Report */}
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-base">Laporan APBNagari</CardTitle>
                <CardDescription>Ringkasan anggaran</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" className="flex-1">
                <Eye className="h-4 w-4 mr-1" />
                Lihat
              </Button>
              <Button size="sm" variant="outline">
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Realisasi Pendapatan */}
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <CardTitle className="text-base">Realisasi Pendapatan</CardTitle>
                <CardDescription>Per bulan/tahun</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" className="flex-1">
                <Eye className="h-4 w-4 mr-1" />
                Lihat
              </Button>
              <Button size="sm" variant="outline">
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Realisasi Belanja */}
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <TrendingDown className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <CardTitle className="text-base">Realisasi Belanja</CardTitle>
                <CardDescription>Per bidang/kegiatan</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" className="flex-1">
                <Eye className="h-4 w-4 mr-1" />
                Lihat
              </Button>
              <Button size="sm" variant="outline">
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Buku Kas Umum */}
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <FileSpreadsheet className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <CardTitle className="text-base">Buku Kas Umum</CardTitle>
                <CardDescription>BKU Harian</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" className="flex-1">
                <Eye className="h-4 w-4 mr-1" />
                Lihat
              </Button>
              <Button size="sm" variant="outline">
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Buku Bank */}
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Building2 className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <CardTitle className="text-base">Buku Bank</CardTitle>
                <CardDescription>Transaksi perbankan</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" className="flex-1">
                <Eye className="h-4 w-4 mr-1" />
                Lihat
              </Button>
              <Button size="sm" variant="outline">
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* SiLPA */}
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-cyan-100 rounded-lg">
                <Target className="h-6 w-6 text-cyan-600" />
              </div>
              <div>
                <CardTitle className="text-base">Laporan SiLPA</CardTitle>
                <CardDescription>Sisa perhitungan</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" className="flex-1">
                <Eye className="h-4 w-4 mr-1" />
                Lihat
              </Button>
              <Button size="sm" variant="outline">
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* APBNagari Detail Report */}
      {laporanAPB && (
        <Card>
          <CardHeader>
            <CardTitle>Ringkasan APBNagari {laporanAPB.tahun_anggaran}</CardTitle>
            <CardDescription>Status: {laporanAPB.status}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Pendapatan Summary */}
              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  PENDAPATAN
                </h4>
                <div className="grid gap-2 text-sm">
                  <div className="flex justify-between">
                    <span>Total Anggaran Pendapatan</span>
                    <span className="font-medium">{formatCurrency(laporanAPB.pendapatan?.grand_total?.anggaran || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Realisasi Pendapatan</span>
                    <span className="font-medium">{formatCurrency(laporanAPB.pendapatan?.grand_total?.realisasi || 0)}</span>
                  </div>
                </div>
              </div>

              {/* Belanja Summary */}
              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <TrendingDown className="h-4 w-4 text-red-600" />
                  BELANJA
                </h4>
                <div className="grid gap-2 text-sm">
                  <div className="flex justify-between">
                    <span>Total Anggaran Belanja</span>
                    <span className="font-medium">{formatCurrency(laporanAPB.belanja?.grand_total_anggaran || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Realisasi Belanja</span>
                    <span className="font-medium">{formatCurrency(laporanAPB.belanja?.grand_total_realisasi || 0)}</span>
                  </div>
                </div>
              </div>

              {/* SILPA */}
              <div className="p-4 border rounded-lg bg-blue-50">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Wallet className="h-4 w-4 text-blue-600" />
                  SILPA (Sisa Lebih Perhitungan Anggaran)
                </h4>
                <div className="text-2xl font-bold text-blue-600">
                  {formatCurrency(laporanAPB.silpa?.silpa || 0)}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )

  // Loading skeleton
  if (loading && !apbNagari) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-40" />
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map(i => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <DollarSign className="h-6 w-6" />
            Keuangan Nagari
          </h2>
          <p className="text-muted-foreground">
            Sistem Pengelolaan Keuangan Nagari (Permendagri 20/2018)
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Select 
            value={selectedTahunAnggaran?.toString() || ''} 
            onValueChange={(val: string) => setSelectedTahunAnggaran(parseInt(val))}
          >
            <SelectTrigger className="w-[180px]">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Pilih Tahun" />
            </SelectTrigger>
            <SelectContent>
              {tahunAnggaranList.map((ta) => (
                <SelectItem key={ta.id} value={ta.id.toString()}>
                  <div className="flex items-center gap-2">
                    <span>{ta.tahun}</span>
                    {ta.status === 'disahkan' && (
                      <Badge variant="default" className="text-xs">Aktif</Badge>
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button variant="outline" onClick={fetchAllData} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="pendapatan" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Pendapatan
          </TabsTrigger>
          <TabsTrigger value="belanja" className="flex items-center gap-2">
            <TrendingDown className="h-4 w-4" />
            Belanja
          </TabsTrigger>
          <TabsTrigger value="laporan" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Laporan
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="mt-6">
          <DashboardTab />
        </TabsContent>

        <TabsContent value="pendapatan" className="mt-6">
          <PendapatanTab />
        </TabsContent>

        <TabsContent value="belanja" className="mt-6">
          <BelanjaTab />
        </TabsContent>

        <TabsContent value="laporan" className="mt-6">
          <LaporanTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default KeuanganNagari
