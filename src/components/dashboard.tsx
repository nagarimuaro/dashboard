import React, { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { Badge } from "./ui/badge"
import { Button } from "./ui/button"
import { Alert, AlertDescription } from "./ui/alert"
import { Users, FileText, Clock, CheckCircle, UserPlus, FileCheck, Eye, Download, TrendingUp, AlertCircle, RefreshCw, Calendar } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts"
import { dashboardService } from '../services/dashboardService'

// Canvas Analog Clock Component
function AnalogClock() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const radius = canvas.height / 2 * 0.90;

    function drawClock() {
      // Reset transform and clear
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.translate(canvas.width / 2, canvas.height / 2);
      
      drawFace(ctx, radius);
      drawNumbers(ctx, radius);
      drawTime(ctx, radius);
    }

    function drawFace(ctx: CanvasRenderingContext2D, radius: number) {
      // Clean white/light gray clock face
      const faceGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, radius);
      faceGrad.addColorStop(0, '#ffffff');
      faceGrad.addColorStop(0.8, '#f8fafc');
      faceGrad.addColorStop(1, '#f1f5f9');
      ctx.beginPath();
      ctx.arc(0, 0, radius, 0, 2 * Math.PI);
      ctx.fillStyle = faceGrad;
      ctx.fill();

      // Professional blue border (matching primary color)
      ctx.beginPath();
      ctx.arc(0, 0, radius, 0, 2 * Math.PI);
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = radius * 0.06;
      ctx.stroke();

      // Inner subtle ring
      ctx.beginPath();
      ctx.arc(0, 0, radius * 0.92, 0, 2 * Math.PI);
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Hour markers
      for (let i = 0; i < 12; i++) {
        const ang = i * Math.PI / 6;
        const x1 = Math.sin(ang) * radius * 0.82;
        const y1 = -Math.cos(ang) * radius * 0.82;
        const x2 = Math.sin(ang) * radius * (i % 3 === 0 ? 0.70 : 0.75);
        const y2 = -Math.cos(ang) * radius * (i % 3 === 0 ? 0.70 : 0.75);
        
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.strokeStyle = i % 3 === 0 ? '#1e40af' : '#94a3b8';
        ctx.lineWidth = i % 3 === 0 ? 3 : 1.5;
        ctx.lineCap = 'round';
        ctx.stroke();
      }

      // Center circle (blue)
      ctx.beginPath();
      ctx.arc(0, 0, radius * 0.06, 0, 2 * Math.PI);
      ctx.fillStyle = '#3b82f6';
      ctx.fill();
    }

    function drawNumbers(ctx: CanvasRenderingContext2D, radius: number) {
      // Using line markers instead of numbers for cleaner look
    }

    function drawTime(ctx: CanvasRenderingContext2D, radius: number) {
      const now = new Date();
      let hour = now.getHours();
      let minute = now.getMinutes();
      let second = now.getSeconds();

      // Hour hand (dark blue)
      ctx.strokeStyle = '#1e3a5f';
      ctx.shadowBlur = 0;
      hour = hour % 12;
      const hourAngle = (hour * Math.PI / 6) +
        (minute * Math.PI / (6 * 60)) +
        (second * Math.PI / (360 * 60));
      drawHand(ctx, hourAngle, radius * 0.5, radius * 0.055);

      // Minute hand (dark blue)
      ctx.strokeStyle = '#1e3a5f';
      const minuteAngle = (minute * Math.PI / 30) + (second * Math.PI / (30 * 60));
      drawHand(ctx, minuteAngle, radius * 0.72, radius * 0.04);

      // Second hand (blue accent)
      ctx.strokeStyle = '#3b82f6';
      const secondAngle = (second * Math.PI / 30);
      drawHand(ctx, secondAngle, radius * 0.9, radius * 0.02);
    }

    function drawHand(ctx: CanvasRenderingContext2D, pos: number, length: number, width: number) {
      ctx.beginPath();
      ctx.lineWidth = width;
      ctx.lineCap = "round";
      ctx.moveTo(0, 0);
      ctx.rotate(pos);
      ctx.lineTo(0, -length);
      ctx.stroke();
      ctx.rotate(-pos);
    }

    // Initial draw
    drawClock();

    // Update every second
    const timer = setInterval(drawClock, 1000);

    return () => {
      clearInterval(timer);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      width={160}
      height={160}
      className="rounded-full shadow-lg"
    />
  );
}

// Date Only Component
function DateDisplay() {
  const [date, setDate] = useState(new Date());

  useEffect(() => {
    // Update date at midnight
    const timer = setInterval(() => setDate(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="text-center text-sm flex items-center justify-center gap-1.5 text-slate-600 font-medium">
      <Calendar className="h-3.5 w-3.5 text-blue-500" />
      {date.toLocaleDateString('id-ID', { 
        weekday: 'long', 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric' 
      })}
    </div>
  );
}

interface DashboardProps {
  userRole: 'admin_global' | 'admin_nagari' | 'staff_nagari' | 'warga'
  onModuleChange: (module: string) => void
}

export function Dashboard({ userRole, onModuleChange }: DashboardProps) {
  const [dashboardData, setDashboardData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Load dashboard data
  const loadDashboardData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await dashboardService.getDashboardStats()
      if (response.success) {
        setDashboardData(response.data)
      } else {
        throw new Error(response.message || 'Failed to load dashboard data')
      }
    } catch (err) {
      console.error('Dashboard load error:', err)
      setError(err.message || 'Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  // Load dashboard data on mount
  useEffect(() => {
    loadDashboardData()
  }, [])

  // Get statistics with fallback data
  const stats = dashboardData?.stats || {
    totalWarga: 2847,
    totalKeluarga: 743,
    permohonanPending: 23,
    permohonanSelesai: 187,
    suratBulanIni: 45,
    programKBActive: 156
  }

  const ageData = dashboardData?.charts?.ageDistribution || [
    { range: "0-17", jumlah: 654, color: "#1E40AF" },
    { range: "18-30", jumlah: 892, color: "#059669" },
    { range: "31-45", jumlah: 743, color: "#F59E0B" },
    { range: "46-60", jumlah: 423, color: "#6B7280" },
    { range: "60+", jumlah: 135, color: "#DC2626" },
  ]

  const genderData = dashboardData?.charts?.genderDistribution || [
    { name: "Laki-laki", value: 1456, color: "#1E40AF" },
    { name: "Perempuan", value: 1391, color: "#059669" },
  ]

  const trendData = dashboardData?.charts?.requestTrend || [
    { bulan: "Jan", permohonan: 32 },
    { bulan: "Feb", permohonan: 28 },
    { bulan: "Mar", permohonan: 41 },
    { bulan: "Apr", permohonan: 38 },
    { bulan: "Mei", permohonan: 45 },
    { bulan: "Jun", permohonan: 52 },
  ]

  const recentActivities = dashboardData?.recentActivities || [
    {
      type: "permohonan",
      description: "Permohonan Surat Keterangan Domisili - Ahmad Fauzi",
      time: "2 jam yang lalu",
      status: "pending"
    },
    {
      type: "surat",
      description: "Surat Keterangan Tidak Mampu telah dibuat - Siti Aminah",
      time: "4 jam yang lalu",
      status: "completed"
    },
    {
      type: "warga",
      description: "Data warga baru ditambahkan - Muhammad Rizki",
      time: "1 hari yang lalu",
      status: "info"
    },
    {
      type: "permohonan",
      description: "Permohonan Surat Pengantar Nikah - Dewi Sartika",
      time: "2 hari yang lalu",
      status: "completed"
    }
  ]

  const getStatCards = () => {
    if (userRole === 'warga') {
      return [
        {
          title: "Permohonan Saya",
          value: "3",
          description: "Total permohonan",
          icon: FileText,
          color: "bg-blue-500"
        },
        {
          title: "Dalam Proses",
          value: "1",
          description: "Sedang diproses",
          icon: Clock,
          color: "bg-orange-500"
        },
        {
          title: "Selesai",
          value: "2",
          description: "Sudah selesai",
          icon: CheckCircle,
          color: "bg-green-500"
        }
      ]
    }

    return [
      {
        title: "Total Warga",
        value: stats.totalWarga.toLocaleString(),
        description: "Terdaftar di sistem",
        icon: Users,
        color: "bg-blue-500"
      },
      {
        title: "Total Keluarga",
        value: stats.totalKeluarga.toLocaleString(),
        description: "Kartu Keluarga aktif",
        icon: Users,
        color: "bg-green-500"
      },
      {
        title: "Permohonan Pending",
        value: stats.permohonanPending.toString(),
        description: "Menunggu proses",
        icon: Clock,
        color: "bg-orange-500"
      },
      {
        title: "Surat Bulan Ini",
        value: stats.suratBulanIni.toString(),
        description: "Telah diterbitkan",
        icon: FileCheck,
        color: "bg-purple-500"
      }
    ]
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1>Dashboard</h1>
            <p className="text-muted-foreground">Memuat data dashboard...</p>
          </div>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="border border-blue-100 shadow-md bg-gradient-to-br from-blue-50 to-white">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 w-20 bg-muted rounded animate-pulse"></div>
                <div className="h-8 w-8 bg-muted rounded animate-pulse"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 w-16 bg-muted rounded animate-pulse mb-2"></div>
                <div className="h-3 w-24 bg-muted rounded animate-pulse"></div>
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
      <div className="flex items-center justify-between">
        <div>
          <h1>Dashboard</h1>
          <p className="text-muted-foreground">
            {userRole === 'warga' 
              ? "Selamat datang di portal pelayanan nagari"
              : "Overview data dan aktivitas nagari"
            }
          </p>
        </div>
        <div className="flex gap-2">
          {error && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={loadDashboardData}
              className="border-blue-200 bg-gradient-to-br from-blue-50 to-white hover:from-blue-100 hover:to-blue-50"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          )}
          {userRole !== 'warga' && (
            <Button variant="outline" size="sm" className="border-blue-200 bg-gradient-to-br from-blue-50 to-white hover:from-blue-100 hover:to-blue-50">
              <Download className="h-4 w-4 mr-2" />
              Export Laporan
            </Button>
          )}
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error}. Menampilkan data demo.
          </AlertDescription>
        </Alert>
      )}

      {/* Statistics Cards + Clock */}
      <div className="flex flex-wrap gap-4">
        {/* Clock Card - First */}
        <Card className="min-w-[180px] border border-blue-100 shadow-md bg-gradient-to-br from-blue-50 to-white">
          <CardContent className="flex flex-col items-center justify-center gap-3 pt-4 h-full">
            <AnalogClock />
            <DateDisplay />
          </CardContent>
        </Card>
        
        {getStatCards().map((stat, index) => (
          <Card key={index} className="flex-1 min-w-[200px] border border-blue-100 shadow-md bg-gradient-to-br from-blue-50 to-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <div className={`p-2 rounded-md ${stat.color} text-white`}>
                <stat.icon className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {userRole !== 'warga' && (
        <>
          {/* Charts Section */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {/* Age Distribution */}
            <Card className="lg:col-span-2 border border-blue-100 shadow-md bg-gradient-to-br from-blue-50 to-white">
              <CardHeader>
                <CardTitle>Distribusi Usia Warga</CardTitle>
                <CardDescription>Berdasarkan kelompok umur</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={ageData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="range" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="jumlah" fill="#1E40AF" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Gender Distribution */}
            <Card className="border border-blue-100 shadow-md bg-gradient-to-br from-blue-50 to-white">
              <CardHeader>
                <CardTitle>Distribusi Gender</CardTitle>
                <CardDescription>Perbandingan jenis kelamin</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={genderData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {genderData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Trend Permohonan */}
          <Card className="border border-blue-100 shadow-md bg-gradient-to-br from-blue-50 to-white">
            <CardHeader>
              <CardTitle>Trend Permohonan Surat</CardTitle>
              <CardDescription>6 bulan terakhir</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="bulan" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="permohonan" stroke="#1E40AF" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {/* Recent Activities */}
        <Card className="border border-blue-100 shadow-md bg-gradient-to-br from-blue-50 to-white">
          <CardHeader>
            <CardTitle>Aktivitas Terbaru</CardTitle>
            <CardDescription>
              {userRole === 'warga' ? "Riwayat permohonan Anda" : "Aktivitas sistem terbaru"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="p-2 rounded-full bg-muted">
                    {activity.type === 'permohonan' && <FileText className="h-4 w-4" />}
                    {activity.type === 'surat' && <FileCheck className="h-4 w-4" />}
                    {activity.type === 'warga' && <UserPlus className="h-4 w-4" />}
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm">{activity.description}</p>
                    <div className="flex items-center gap-2">
                      <p className="text-xs text-muted-foreground">{activity.time}</p>
                      <Badge variant={
                        activity.status === 'pending' ? 'destructive' :
                        activity.status === 'completed' ? 'default' : 'secondary'
                      }>
                        {activity.status === 'pending' ? 'Pending' :
                         activity.status === 'completed' ? 'Selesai' : 'Info'}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="border border-blue-100 shadow-md bg-gradient-to-br from-blue-50 to-white">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Aksi cepat yang sering digunakan</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2">
              {userRole === 'warga' ? (
                <>
                  <Button 
                    className="justify-start" 
                    variant="outline"
                    onClick={() => onModuleChange('permohonan-surat')}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Ajukan Permohonan Surat
                  </Button>
                  <Button 
                    className="justify-start" 
                    variant="outline"
                    onClick={() => onModuleChange('permohonan-surat')}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Cek Status Permohonan
                  </Button>
                </>
              ) : (
                <>
                  <Button 
                    className="justify-start" 
                    variant="outline"
                    onClick={() => onModuleChange('data-warga')}
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Tambah Warga Baru
                  </Button>
                  <Button 
                    className="justify-start" 
                    variant="outline"
                    onClick={() => onModuleChange('kelola-permohonan')}
                  >
                    <FileCheck className="h-4 w-4 mr-2" />
                    Proses Permohonan
                  </Button>
                  <Button 
                    className="justify-start" 
                    variant="outline"
                    onClick={() => onModuleChange('template-manager')}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Kelola Template
                  </Button>
                  <Button 
                    className="justify-start" 
                    variant="outline"
                    onClick={() => onModuleChange('arsip-surat')}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Lihat Arsip Surat
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}