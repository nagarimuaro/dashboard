import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area,
} from "recharts";
import {
  Users,
  Baby,
  Heart,
  Home,
  GraduationCap,
  Accessibility,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Calculator,
  FileText,
  Download,
  RefreshCw,
  ChevronRight,
  Filter,
  BarChart3,
  PieChartIcon,
  Activity,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import socialDataService from "@/services/socialDataService";

// Types
interface StatistikData {
  total: number;
  byStatus: { status: string; count: number; percentage: number }[];
  byJorong: { jorong: string; count: number }[];
  byGender?: { gender: string; count: number }[];
  byAge?: { range: string; count: number }[];
  trend?: { month: string; count: number }[];
}

interface StuntingCalculation {
  usia_bulan: number;
  jenis_kelamin: 'L' | 'P';
  tinggi_badan: number;
  berat_badan: number;
}

interface StuntingResult {
  status: 'normal' | 'stunting_ringan' | 'stunting_berat' | 'gizi_buruk' | 'gizi_kurang' | 'gizi_baik' | 'gizi_lebih' | 'obesitas';
  zScore: number;
  kategori: string;
  rekomendasi: string;
}

// Colors for charts
const COLORS = ['#22c55e', '#eab308', '#f97316', '#ef4444', '#3b82f6', '#8b5cf6', '#ec4899', '#06b6d4'];
const STATUS_COLORS: Record<string, string> = {
  'Normal': '#22c55e',
  'Stunting Ringan': '#eab308',
  'Stunting Berat': '#ef4444',
  'Sangat Miskin': '#ef4444',
  'Miskin': '#f97316',
  'Rentan Miskin': '#eab308',
  'Hampir Miskin': '#84cc16',
  'Aktif': '#22c55e',
  'Drop Out': '#ef4444',
  'Tidak Aktif': '#6b7280',
};

// WHO Z-Score standards (simplified)
const WHO_TB_U_LAKI = {
  // usia_bulan: [severe_stunting, stunting, normal_min]
  0: [44.2, 46.1, 48.0],
  6: [61.2, 63.3, 65.4],
  12: [68.6, 71.0, 73.4],
  24: [78.0, 81.0, 84.1],
  36: [85.0, 88.7, 92.4],
  48: [90.7, 94.9, 99.1],
  60: [96.1, 100.7, 105.3],
};

const WHO_TB_U_PEREMPUAN = {
  0: [43.6, 45.4, 47.3],
  6: [59.6, 61.5, 63.5],
  12: [66.3, 68.9, 71.4],
  24: [76.0, 79.3, 82.5],
  36: [83.6, 87.4, 91.2],
  48: [89.8, 94.1, 98.4],
  60: [95.2, 99.9, 104.7],
};

// Stunting calculation function
function calculateStuntingStatus(data: StuntingCalculation): StuntingResult {
  const { usia_bulan, jenis_kelamin, tinggi_badan } = data;
  
  const standards = jenis_kelamin === 'L' ? WHO_TB_U_LAKI : WHO_TB_U_PEREMPUAN;
  
  // Find closest age bracket
  const ages = Object.keys(standards).map(Number).sort((a, b) => a - b);
  let closestAge = ages[0];
  for (const age of ages) {
    if (age <= usia_bulan) closestAge = age;
    else break;
  }
  
  const [severeBound, stuntingBound, normalMin] = standards[closestAge as keyof typeof standards];
  
  // Calculate approximate Z-score
  const median = normalMin;
  const sd = (normalMin - stuntingBound) / 2;
  const zScore = (tinggi_badan - median) / sd;
  
  let status: StuntingResult['status'];
  let kategori: string;
  let rekomendasi: string;
  
  if (tinggi_badan < severeBound) {
    status = 'stunting_berat';
    kategori = 'Stunting Berat (< -3 SD)';
    rekomendasi = 'Segera rujuk ke Puskesmas/RS untuk penanganan intensif. Perlu intervensi gizi khusus dan pemantauan ketat.';
  } else if (tinggi_badan < stuntingBound) {
    status = 'stunting_ringan';
    kategori = 'Stunting Ringan (-3 SD s/d -2 SD)';
    rekomendasi = 'Perlu pemantauan rutin, perbaikan pola makan dengan makanan bergizi, dan konsultasi dengan tenaga kesehatan.';
  } else {
    status = 'normal';
    kategori = 'Normal (≥ -2 SD)';
    rekomendasi = 'Pertahankan pola makan sehat dan pantau pertumbuhan secara berkala.';
  }
  
  return { status, zScore: Math.round(zScore * 100) / 100, kategori, rekomendasi };
}

// Dummy data generator
function generateDummyStats(type: string): StatistikData {
  const jorongList = ['Jorong I', 'Jorong II', 'Jorong III', 'Jorong IV', 'Jorong V'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  const statusByType: Record<string, string[]> = {
    kemiskinan: ['Sangat Miskin', 'Miskin', 'Rentan Miskin', 'Hampir Miskin'],
    stunting: ['Normal', 'Stunting Ringan', 'Stunting Berat'],
    kb: ['Aktif', 'Drop Out', 'Tidak Aktif'],
    disabilitas: ['Fisik', 'Intelektual', 'Mental', 'Sensorik'],
    rtlh: ['Sangat Tidak Layak', 'Tidak Layak', 'Sudah Diperbaiki'],
    'putus-sekolah': ['SD', 'SMP', 'SMA'],
  };
  
  const statuses = statusByType[type] || ['Status 1', 'Status 2', 'Status 3'];
  const total = Math.floor(Math.random() * 500) + 100;
  
  // Generate by status
  let remaining = total;
  const byStatus = statuses.map((status, idx) => {
    const count = idx === statuses.length - 1 
      ? remaining 
      : Math.floor(Math.random() * (remaining / (statuses.length - idx)));
    remaining -= count;
    return { status, count, percentage: Math.round((count / total) * 100) };
  });
  
  // Generate by jorong
  remaining = total;
  const byJorong = jorongList.map((jorong, idx) => {
    const count = idx === jorongList.length - 1 
      ? remaining 
      : Math.floor(Math.random() * (remaining / (jorongList.length - idx)));
    remaining -= count;
    return { jorong, count };
  });
  
  // Generate trend
  let baseCount = Math.floor(total / 12);
  const trend = months.map(month => ({
    month,
    count: baseCount + Math.floor(Math.random() * 20) - 10,
  }));
  
  return {
    total,
    byStatus,
    byJorong,
    byGender: [
      { gender: 'Laki-laki', count: Math.floor(total * 0.48) },
      { gender: 'Perempuan', count: Math.floor(total * 0.52) },
    ],
    byAge: [
      { range: '0-5 tahun', count: Math.floor(total * 0.15) },
      { range: '6-17 tahun', count: Math.floor(total * 0.25) },
      { range: '18-45 tahun', count: Math.floor(total * 0.35) },
      { range: '46-60 tahun', count: Math.floor(total * 0.15) },
      { range: '> 60 tahun', count: Math.floor(total * 0.10) },
    ],
    trend,
  };
}

// Category configuration
const categories = [
  { 
    id: 'kemiskinan', 
    title: 'Data Kemiskinan', 
    icon: Users, 
    color: 'text-orange-500',
    bgColor: 'bg-orange-50',
    description: 'Statistik penduduk berdasarkan status kemiskinan'
  },
  { 
    id: 'stunting', 
    title: 'Data Stunting', 
    icon: Baby, 
    color: 'text-red-500',
    bgColor: 'bg-red-50',
    description: 'Data anak dengan kondisi stunting dan normal'
  },
  { 
    id: 'kb', 
    title: 'Data KB', 
    icon: Heart, 
    color: 'text-pink-500',
    bgColor: 'bg-pink-50',
    description: 'Statistik peserta Keluarga Berencana'
  },
  { 
    id: 'disabilitas', 
    title: 'Data Disabilitas', 
    icon: Accessibility, 
    color: 'text-blue-500',
    bgColor: 'bg-blue-50',
    description: 'Data penyandang disabilitas berdasarkan jenis'
  },
  { 
    id: 'rtlh', 
    title: 'Rumah Tidak Layak Huni', 
    icon: Home, 
    color: 'text-amber-500',
    bgColor: 'bg-amber-50',
    description: 'Data rumah tidak layak huni per wilayah'
  },
  { 
    id: 'putus-sekolah', 
    title: 'Putus Sekolah', 
    icon: GraduationCap, 
    color: 'text-purple-500',
    bgColor: 'bg-purple-50',
    description: 'Data anak putus sekolah berdasarkan jenjang'
  },
];

// Population stats interface
interface PopulationStats {
  populasi: {
    total_warga: number;
    warga_aktif: number;
    warga_meninggal: number;
    warga_pindah: number;
    total_keluarga: number;
  };
  social_data_by_population_status: {
    kemiskinan: Record<string, number>;
    stunting: Record<string, number>;
  };
  effect_summary: {
    kemiskinan_aktif: number;
    kemiskinan_tidak_aktif: number;
    stunting_aktif: number;
    stunting_tidak_aktif: number;
  };
}

export default function StatistikSosialPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('kemiskinan');
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<Record<string, StatistikData>>({});
  const [chartType, setChartType] = useState<'bar' | 'pie'>('bar');
  const [populationStats, setPopulationStats] = useState<PopulationStats | null>(null);
  
  // Stunting calculator state
  const [calculatorOpen, setCalculatorOpen] = useState(false);
  const [stuntingForm, setStuntingForm] = useState<StuntingCalculation>({
    usia_bulan: 24,
    jenis_kelamin: 'L',
    tinggi_badan: 80,
    berat_badan: 10,
  });
  const [stuntingResult, setStuntingResult] = useState<StuntingResult | null>(null);

  // Load stats for all categories
  useEffect(() => {
    loadAllStats();
  }, []);

  const loadAllStats = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch summary from API
      const apiResponse = await socialDataService.getSummary();
      const response = apiResponse as any;
      
      // Fetch population stats
      const popStatsResponse = await socialDataService.getPopulationStats();
      const popData = popStatsResponse as any;
      if (popData?.data) {
        setPopulationStats(popData.data as PopulationStats);
      }
      if (response) {
        // Transform API response to match our stats format
        const allStats: Record<string, StatistikData> = {};
        
        // Kemiskinan
        if (response.kemiskinan) {
          const kemiskinan = response.kemiskinan;
          const byStatus = Object.entries(kemiskinan.by_status || {}).map(([status, count]) => ({
            status,
            count: count as number,
            percentage: kemiskinan.total > 0 ? Math.round((count as number / kemiskinan.total) * 100) : 0,
          }));
          allStats.kemiskinan = {
            total: kemiskinan.total || 0,
            byStatus,
            byJorong: [],
            trend: [],
          };
        }

        // Stunting
        if (response.stunting) {
          const stunting = response.stunting;
          const byStatus = Object.entries(stunting.by_status || {}).map(([status, count]) => ({
            status,
            count: count as number,
            percentage: stunting.total > 0 ? Math.round((count as number / stunting.total) * 100) : 0,
          }));
          allStats.stunting = {
            total: stunting.total || 0,
            byStatus,
            byJorong: [],
            trend: [],
          };
        }

        // KB
        if (response.kb) {
          const kb = response.kb;
          const byStatus = Object.entries(kb.by_status || {}).map(([status, count]) => ({
            status,
            count: count as number,
            percentage: kb.total > 0 ? Math.round((count as number / kb.total) * 100) : 0,
          }));
          allStats.kb = {
            total: kb.total || 0,
            byStatus,
            byJorong: [],
            trend: [],
          };
        }

        // Disabilitas
        if (response.disabilitas) {
          const disabilitas = response.disabilitas;
          const byStatus = Object.entries(disabilitas.by_jenis || {}).map(([status, count]) => ({
            status,
            count: count as number,
            percentage: disabilitas.total > 0 ? Math.round((count as number / disabilitas.total) * 100) : 0,
          }));
          allStats.disabilitas = {
            total: disabilitas.total || 0,
            byStatus,
            byJorong: [],
            trend: [],
          };
        }

        // RTLH
        if (response.rtlh) {
          const rtlh = response.rtlh;
          const byStatus = Object.entries(rtlh.by_status || {}).map(([status, count]) => ({
            status,
            count: count as number,
            percentage: rtlh.total > 0 ? Math.round((count as number / rtlh.total) * 100) : 0,
          }));
          allStats.rtlh = {
            total: rtlh.total || 0,
            byStatus,
            byJorong: [],
            trend: [],
          };
        }

        // Putus Sekolah
        if (response.putus_sekolah) {
          const putusSekolah = response.putus_sekolah;
          const byStatus = Object.entries(putusSekolah.by_jenjang || {}).map(([status, count]) => ({
            status,
            count: count as number,
            percentage: putusSekolah.total > 0 ? Math.round((count as number / putusSekolah.total) * 100) : 0,
          }));
          allStats['putus-sekolah'] = {
            total: putusSekolah.total || 0,
            byStatus,
            byJorong: [],
            trend: [],
          };
        }

        setStats(allStats);
      }
    } catch (error: any) {
      console.error('Error loading stats:', error);
      toast.error('Gagal memuat statistik: ' + (error.message || 'Unknown error'));
      
      // Fallback to dummy data if API fails
      const allStats: Record<string, StatistikData> = {};
      for (const cat of categories) {
        allStats[cat.id] = generateDummyStats(cat.id);
      }
      setStats(allStats);
    } finally {
      setLoading(false);
    }
  }, []);

  const currentStats = stats[activeTab];
  const currentCategory = categories.find(c => c.id === activeTab);

  // Calculate stunting
  const handleCalculateStunting = () => {
    const result = calculateStuntingStatus(stuntingForm);
    setStuntingResult(result);
  };

  // Get summary stats for overview
  const overviewStats = useMemo(() => {
    return categories.map(cat => ({
      ...cat,
      total: stats[cat.id]?.total || 0,
      critical: stats[cat.id]?.byStatus.find(s => 
        s.status.includes('Berat') || s.status.includes('Sangat')
      )?.count || 0,
    }));
  }, [stats]);

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Statistik Data Sosial</h1>
          <p className="text-muted-foreground">
            Dashboard analisis data sosial dan kesehatan masyarakat
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadAllStats} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Population Effect Stats */}
      {populationStats && (
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-600" />
              Population Effect - Data Sosial Terhubung dengan Populasi
            </CardTitle>
            <CardDescription>
              Menunjukkan bagaimana data sosial terkait dengan status populasi warga
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {/* Total Warga */}
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="h-4 w-4 text-blue-500" />
                  <span className="text-xs text-muted-foreground">Total Warga</span>
                </div>
                <p className="text-2xl font-bold text-blue-600">{populationStats.populasi.total_warga}</p>
              </div>
              
              {/* Warga Aktif */}
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-xs text-muted-foreground">Warga Aktif</span>
                </div>
                <p className="text-2xl font-bold text-green-600">{populationStats.populasi.warga_aktif}</p>
              </div>
              
              {/* Meninggal */}
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                  <span className="text-xs text-muted-foreground">Meninggal</span>
                </div>
                <p className="text-2xl font-bold text-red-600">{populationStats.populasi.warga_meninggal}</p>
              </div>
              
              {/* Pindah */}
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingDown className="h-4 w-4 text-orange-500" />
                  <span className="text-xs text-muted-foreground">Pindah</span>
                </div>
                <p className="text-2xl font-bold text-orange-600">{populationStats.populasi.warga_pindah}</p>
              </div>
              
              {/* Total Keluarga */}
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <Home className="h-4 w-4 text-purple-500" />
                  <span className="text-xs text-muted-foreground">Total Keluarga</span>
                </div>
                <p className="text-2xl font-bold text-purple-600">{populationStats.populasi.total_keluarga}</p>
              </div>
            </div>
            
            {/* Effect Summary */}
            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg p-3 shadow-sm border-l-4 border-green-500">
                <p className="text-xs text-muted-foreground">Kemiskinan (Warga Aktif)</p>
                <p className="text-lg font-semibold text-green-600">{populationStats.effect_summary.kemiskinan_aktif}</p>
              </div>
              <div className="bg-white rounded-lg p-3 shadow-sm border-l-4 border-red-500">
                <p className="text-xs text-muted-foreground">Kemiskinan (Tidak Aktif)</p>
                <p className="text-lg font-semibold text-red-600">{populationStats.effect_summary.kemiskinan_tidak_aktif}</p>
              </div>
              <div className="bg-white rounded-lg p-3 shadow-sm border-l-4 border-green-500">
                <p className="text-xs text-muted-foreground">Stunting (Warga Aktif)</p>
                <p className="text-lg font-semibold text-green-600">{populationStats.effect_summary.stunting_aktif}</p>
              </div>
              <div className="bg-white rounded-lg p-3 shadow-sm border-l-4 border-red-500">
                <p className="text-xs text-muted-foreground">Stunting (Tidak Aktif)</p>
                <p className="text-lg font-semibold text-red-600">{populationStats.effect_summary.stunting_tidak_aktif}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {overviewStats.map((cat) => {
          const Icon = cat.icon;
          return (
            <Card 
              key={cat.id} 
              className={`cursor-pointer transition-all hover:shadow-md ${activeTab === cat.id ? 'ring-2 ring-primary' : ''}`}
              onClick={() => setActiveTab(cat.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className={`p-2 rounded-lg ${cat.bgColor}`}>
                    <Icon className={`h-5 w-5 ${cat.color}`} />
                  </div>
                  {cat.critical > 0 && (
                    <Badge variant="destructive" className="text-xs">
                      {cat.critical}
                    </Badge>
                  )}
                </div>
                <div className="mt-3">
                  <p className="text-2xl font-bold">{cat.total.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground truncate">{cat.title}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Charts */}
        <div className="lg:col-span-2 space-y-6">
          {/* Status Distribution */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  {currentCategory && <currentCategory.icon className={`h-5 w-5 ${currentCategory.color}`} />}
                  {currentCategory?.title} - Distribusi Status
                </CardTitle>
                <CardDescription>{currentCategory?.description}</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant={chartType === 'bar' ? 'default' : 'outline'} 
                  size="sm"
                  onClick={() => setChartType('bar')}
                >
                  <BarChart3 className="h-4 w-4" />
                </Button>
                <Button 
                  variant={chartType === 'pie' ? 'default' : 'outline'} 
                  size="sm"
                  onClick={() => setChartType('pie')}
                >
                  <PieChartIcon className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {currentStats && (
                <div className="h-[300px]">
                  {chartType === 'bar' ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={currentStats.byStatus}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="status" tick={{ fontSize: 12 }} />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="count" fill="#3b82f6">
                          {currentStats.byStatus.map((entry, index) => (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={STATUS_COLORS[entry.status] || COLORS[index % COLORS.length]} 
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={currentStats.byStatus}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ status, percentage }) => `${status}: ${percentage}%`}
                          outerRadius={100}
                          dataKey="count"
                        >
                          {currentStats.byStatus.map((entry, index) => (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={STATUS_COLORS[entry.status] || COLORS[index % COLORS.length]} 
                            />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Trend Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-blue-500" />
                Tren Bulanan
              </CardTitle>
            </CardHeader>
            <CardContent>
              {currentStats?.trend && (
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={currentStats.trend}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Area 
                        type="monotone" 
                        dataKey="count" 
                        stroke="#3b82f6" 
                        fill="#93c5fd" 
                        name="Jumlah"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Distribution by Jorong */}
          <Card>
            <CardHeader>
              <CardTitle>Distribusi per Jorong/Wilayah</CardTitle>
            </CardHeader>
            <CardContent>
              {currentStats?.byJorong && (
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={currentStats.byJorong} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="jorong" type="category" width={80} />
                      <Tooltip />
                      <Bar dataKey="count" fill="#8b5cf6" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right: Summary & Tools */}
        <div className="space-y-6">
          {/* Status Summary Table */}
          <Card>
            <CardHeader>
              <CardTitle>Ringkasan Status</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Jumlah</TableHead>
                    <TableHead className="text-right">%</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentStats?.byStatus.map((item) => (
                    <TableRow key={item.status}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: STATUS_COLORS[item.status] || '#6b7280' }}
                          />
                          {item.status}
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {item.count.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        {item.percentage}%
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="font-bold">
                    <TableCell>Total</TableCell>
                    <TableCell className="text-right">
                      {currentStats?.total.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">100%</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Stunting Calculator - Only show for stunting tab */}
          {activeTab === 'stunting' && (
            <Card className="border-red-200 bg-red-50/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-700">
                  <Calculator className="h-5 w-5" />
                  Kalkulator Stunting
                </CardTitle>
                <CardDescription>
                  Hitung status stunting anak berdasarkan standar WHO
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Usia (bulan)</Label>
                    <Input
                      type="number"
                      value={stuntingForm.usia_bulan}
                      onChange={(e) => setStuntingForm({
                        ...stuntingForm,
                        usia_bulan: parseInt(e.target.value) || 0
                      })}
                      min={0}
                      max={60}
                    />
                  </div>
                  <div>
                    <Label>Jenis Kelamin</Label>
                    <Select
                      value={stuntingForm.jenis_kelamin}
                      onValueChange={(v: string) => setStuntingForm({
                        ...stuntingForm,
                        jenis_kelamin: v as 'L' | 'P'
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="L">Laki-laki</SelectItem>
                        <SelectItem value="P">Perempuan</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Tinggi Badan (cm)</Label>
                    <Input
                      type="number"
                      value={stuntingForm.tinggi_badan}
                      onChange={(e) => setStuntingForm({
                        ...stuntingForm,
                        tinggi_badan: parseFloat(e.target.value) || 0
                      })}
                      step="0.1"
                    />
                  </div>
                  <div>
                    <Label>Berat Badan (kg)</Label>
                    <Input
                      type="number"
                      value={stuntingForm.berat_badan}
                      onChange={(e) => setStuntingForm({
                        ...stuntingForm,
                        berat_badan: parseFloat(e.target.value) || 0
                      })}
                      step="0.1"
                    />
                  </div>
                </div>
                <Button 
                  className="w-full" 
                  onClick={handleCalculateStunting}
                >
                  <Calculator className="h-4 w-4 mr-2" />
                  Hitung Status Stunting
                </Button>

                {stuntingResult && (
                  <div className={`p-4 rounded-lg border ${
                    stuntingResult.status === 'normal' 
                      ? 'bg-green-50 border-green-200' 
                      : stuntingResult.status === 'stunting_ringan'
                      ? 'bg-yellow-50 border-yellow-200'
                      : 'bg-red-50 border-red-200'
                  }`}>
                    <div className="flex items-center gap-2 mb-2">
                      {stuntingResult.status === 'normal' ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <AlertTriangle className={`h-5 w-5 ${
                          stuntingResult.status === 'stunting_ringan' 
                            ? 'text-yellow-600' 
                            : 'text-red-600'
                        }`} />
                      )}
                      <span className="font-bold">{stuntingResult.kategori}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      Z-Score: {stuntingResult.zScore}
                    </p>
                    <p className="text-sm">{stuntingResult.rekomendasi}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Aksi Cepat</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => navigate(`/data-sosial/${activeTab}`)}
              >
                <FileText className="h-4 w-4 mr-2" />
                Lihat Data {currentCategory?.title}
                <ChevronRight className="h-4 w-4 ml-auto" />
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
              >
                <Download className="h-4 w-4 mr-2" />
                Export Laporan PDF
                <ChevronRight className="h-4 w-4 ml-auto" />
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
              >
                <Filter className="h-4 w-4 mr-2" />
                Filter Data Lanjutan
                <ChevronRight className="h-4 w-4 ml-auto" />
              </Button>
            </CardContent>
          </Card>

          {/* Gender Distribution - if available */}
          {currentStats?.byGender && (
            <Card>
              <CardHeader>
                <CardTitle>Distribusi Gender</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[150px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={currentStats.byGender}
                        cx="50%"
                        cy="50%"
                        innerRadius={30}
                        outerRadius={60}
                        dataKey="count"
                        label={({ gender, count }) => `${gender}: ${count}`}
                      >
                        <Cell fill="#3b82f6" />
                        <Cell fill="#ec4899" />
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
