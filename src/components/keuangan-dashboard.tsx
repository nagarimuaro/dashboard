import React, { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { Button } from "./ui/button"
import { Badge } from "./ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { Progress } from "./ui/progress"
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Target, 
  PieChart as PieChartIcon,
  BarChart3,
  Download,
  FileText,
  AlertTriangle
} from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs"

interface KeuanganDashboardProps {
  userRole: 'admin_global' | 'admin_nagari' | 'staff_nagari' | 'warga'
}

export function KeuanganDashboard({ userRole }: KeuanganDashboardProps) {
  const [selectedYear, setSelectedYear] = useState("2024")
  const [selectedQuarter, setSelectedQuarter] = useState("all")

  // Mock data APB
  const apbData = {
    totalAnggaran: 2750000000, // 2.75 milyar
    totalRealisasi: 1890000000, // 1.89 milyar
    persentaseRealisasi: 68.7,
    sisaAnggaran: 860000000, // 860 juta
    targetRealisasi: 75 // target 75% untuk kuartal ini
  }

  // Mock data kategori anggaran
  const kategoriAnggaran = [
    {
      kategori: "Belanja Pegawai",
      anggaran: 980000000,
      realisasi: 720000000,
      persentase: 73.5,
      status: "on-track"
    },
    {
      kategori: "Belanja Barang & Jasa",
      anggaran: 650000000,
      realisasi: 420000000,
      persentase: 64.6,
      status: "warning"
    },
    {
      kategori: "Belanja Modal",
      anggaran: 480000000,
      realisasi: 280000000,
      persentase: 58.3,
      status: "warning"
    },
    {
      kategori: "Bantuan Sosial",
      anggaran: 320000000,
      realisasi: 250000000,
      persentase: 78.1,
      status: "good"
    },
    {
      kategori: "Belanja Tak Terduga",
      anggaran: 120000000,
      realisasi: 85000000,
      persentase: 70.8,
      status: "on-track"
    },
    {
      kategori: "Transfer & Hibah",
      anggaran: 200000000,
      realisasi: 135000000,
      persentase: 67.5,
      status: "on-track"
    }
  ]

  // Mock data trend bulanan
  const trendBulanan = [
    { bulan: "Jan", target: 200000000, realisasi: 180000000 },
    { bulan: "Feb", target: 220000000, realisasi: 210000000 },
    { bulan: "Mar", target: 250000000, realisasi: 240000000 },
    { bulan: "Apr", target: 280000000, realisasi: 260000000 },
    { bulan: "Mei", target: 300000000, realisasi: 285000000 },
    { bulan: "Jun", target: 320000000, realisasi: 310000000 },
    { bulan: "Jul", target: 340000000, realisasi: 325000000 },
    { bulan: "Agu", target: 360000000, realisasi: 340000000 },
    { bulan: "Sep", target: 380000000, realisasi: 365000000 }
  ]

  // Mock data pendapatan vs belanja
  const pendapatanBelanja = [
    {
      jenis: "Pendapatan Asli Daerah",
      budget: 450000000,
      realisasi: 380000000,
      persentase: 84.4,
      trend: "up"
    },
    {
      jenis: "Dana Transfer",
      budget: 1800000000,
      realisasi: 1200000000,
      persentase: 66.7,
      trend: "up"
    },
    {
      jenis: "Lain-lain Pendapatan",
      budget: 500000000,
      realisasi: 310000000,
      persentase: 62.0,
      trend: "down"
    }
  ]

  // Mock data program prioritas
  const programPrioritas = [
    {
      program: "Infrastruktur Jalan",
      anggaran: 850000000,
      realisasi: 520000000,
      persentase: 61.2,
      deadline: "Desember 2024",
      status: "warning"
    },
    {
      program: "Bantuan Pendidikan",
      anggaran: 320000000,
      realisasi: 280000000,
      persentase: 87.5,
      deadline: "Oktober 2024",
      status: "good"
    },
    {
      program: "Kesehatan Masyarakat",
      anggaran: 280000000,
      realisasi: 190000000,
      persentase: 67.9,
      deadline: "November 2024",
      status: "on-track"
    },
    {
      program: "Pemberdayaan Ekonomi",
      anggaran: 450000000,
      realisasi: 220000000,
      persentase: 48.9,
      deadline: "Desember 2024",
      status: "critical"
    }
  ]

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000000) {
      return `Rp ${(amount / 1000000000).toFixed(1)}M`
    } else if (amount >= 1000000) {
      return `Rp ${(amount / 1000000).toFixed(0)}jt`
    } else {
      return `Rp ${amount.toLocaleString()}`
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'text-green-600 bg-green-100 border-green-200'
      case 'warning': return 'text-orange-600 bg-orange-100 border-orange-200'
      case 'critical': return 'text-red-600 bg-red-100 border-red-200'
      default: return 'text-blue-600 bg-blue-100 border-blue-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'good': return <TrendingUp className="h-4 w-4" />
      case 'warning': return <AlertTriangle className="h-4 w-4" />
      case 'critical': return <TrendingDown className="h-4 w-4" />
      default: return <Target className="h-4 w-4" />
    }
  }

  // Chart placeholder component
  const ChartPlaceholder = ({ title, height = "h-64" }: { title: string, height?: string }) => (
    <div className={`w-full ${height} bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center`}>
      <div className="text-center">
        <BarChart3 className="h-12 w-12 text-primary mx-auto mb-2" />
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="text-xs text-gray-500">ApexCharts Integration</p>
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1>Dashboard Keuangan</h1>
          <p className="text-muted-foreground">Monitoring APB dan realisasi anggaran nagari</p>
        </div>
        <div className="flex gap-2">
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2024">2024</SelectItem>
              <SelectItem value="2023">2023</SelectItem>
              <SelectItem value="2022">2022</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Laporan
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Anggaran</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(apbData.totalAnggaran)}</div>
            <p className="text-xs text-muted-foreground">APB {selectedYear}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Realisasi</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(apbData.totalRealisasi)}</div>
            <p className="text-xs text-green-600">+{apbData.persentaseRealisasi}% dari target</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sisa Anggaran</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(apbData.sisaAnggaran)}</div>
            <p className="text-xs text-muted-foreground">
              {(100 - apbData.persentaseRealisasi).toFixed(1)}% belum terealisasi
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Target vs Aktual</CardTitle>
            <PieChartIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{apbData.persentaseRealisasi}%</div>
            <Progress value={apbData.persentaseRealisasi} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              Target: {apbData.targetRealisasi}%
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="kategori">Per Kategori</TabsTrigger>
          <TabsTrigger value="program">Program</TabsTrigger>
          <TabsTrigger value="trend">Trend</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Budget vs Realisasi Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Anggaran vs Realisasi</CardTitle>
                <CardDescription>Perbandingan bulanan {selectedYear}</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartPlaceholder title="Budget vs Actual Chart" />
              </CardContent>
            </Card>

            {/* Pendapatan Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Sumber Pendapatan</CardTitle>
                <CardDescription>Breakdown pendapatan nagari</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {pendapatanBelanja.map((item, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{item.jenis}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm">{item.persentase}%</span>
                          {item.trend === 'up' ? (
                            <TrendingUp className="h-4 w-4 text-green-600" />
                          ) : (
                            <TrendingDown className="h-4 w-4 text-red-600" />
                          )}
                        </div>
                      </div>
                      <Progress value={item.persentase} className="h-2" />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Realisasi: {formatCurrency(item.realisasi)}</span>
                        <span>Target: {formatCurrency(item.budget)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="kategori" className="space-y-6">
          <div className="grid gap-4">
            {kategoriAnggaran.map((kategori, index) => (
              <Card key={index}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-medium">{kategori.kategori}</h3>
                      <p className="text-sm text-muted-foreground">
                        {formatCurrency(kategori.realisasi)} dari {formatCurrency(kategori.anggaran)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(kategori.status)}>
                        {getStatusIcon(kategori.status)}
                        <span className="ml-1">{kategori.persentase}%</span>
                      </Badge>
                    </div>
                  </div>
                  <Progress value={kategori.persentase} className="h-3" />
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="program" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Program Prioritas</CardTitle>
              <CardDescription>Status realisasi program unggulan nagari</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {programPrioritas.map((program, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-medium">{program.program}</h4>
                        <p className="text-sm text-muted-foreground">Deadline: {program.deadline}</p>
                      </div>
                      <Badge className={getStatusColor(program.status)}>
                        {getStatusIcon(program.status)}
                        <span className="ml-1">{program.persentase}%</span>
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progress Anggaran</span>
                        <span>{formatCurrency(program.realisasi)} / {formatCurrency(program.anggaran)}</span>
                      </div>
                      <Progress value={program.persentase} className="h-2" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trend" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Trend Realisasi Anggaran</CardTitle>
              <CardDescription>Perkembangan realisasi vs target bulanan</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartPlaceholder title="Trend Line Chart" height="h-80" />
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Top Spending Categories</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartPlaceholder title="Donut Chart" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Quarterly Comparison</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartPlaceholder title="Bar Chart" />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}