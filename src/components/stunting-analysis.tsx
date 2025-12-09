import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Baby,
  Activity,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  TrendingDown,
  Minus,
  Scale,
  Ruler,
  Calculator,
  RefreshCw,
  Download,
  Search,
  ChevronRight,
  Users,
  AlertCircle,
  Clock,
  BarChart3,
} from "lucide-react";
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
  Area,
  AreaChart,
  ReferenceLine,
} from "recharts";
import { toast } from "sonner";
import socialDataService from "@/services/socialDataService";

// Status colors matching backend
const STATUS_COLORS = {
  Normal: "#22c55e",
  "Gizi Kurang": "#f97316",
  "Gizi Buruk": "#dc2626",
  Gemuk: "#eab308",
  Obesitas: "#ef4444",
};

const URGENCY_COLORS = {
  normal: "#22c55e",
  sedang: "#eab308",
  tinggi: "#f97316",
  darurat: "#dc2626",
};

interface StuntingDashboardData {
  total_anak_terpantau: number;
  perlu_intervensi: number;
  status_gizi: Record<string, number>;
  tingkat_urgensi: Record<string, number>;
  ringkasan: {
    stunting: number;
    underweight: number;
    wasting: number;
    normal: number;
    overweight: number;
    obesitas: number;
  };
  kasus_darurat: any[];
  grafik_status: {
    labels: string[];
    data: number[];
    colors: string[];
  };
  grafik_urgensi: {
    labels: string[];
    data: number[];
    colors: string[];
  };
  tren_bulanan?: {
    labels: string[];
    jumlah_pengukuran: number[];
    perlu_intervensi: number[];
    avg_z_hfa: number[];
    avg_z_wfa: number[];
  };
  pengukuran_terbaru?: any[];
  perlu_tindak_lanjut?: any[];
}

interface AnalysisResult {
  identitas_anak: {
    nama: string;
    usia_bulan: number;
    usia_text: string;
    jenis_kelamin: string;
    jenis_kelamin_text: string;
  };
  pengukuran: {
    berat_kg: number;
    tinggi_cm: number;
    imt: number;
  };
  zscore: {
    TB_U: number;
    BB_U: number;
    BB_TB: number | null;
    IMT_U: number;
  };
  status: {
    TB_U: string;
    BB_U: string;
    BB_TB: string | null;
    IMT_U: string;
  };
  status_gizi: {
    overall: string;
    perlu_intervensi: boolean;
    tingkat_urgensi: string;
    warna: string;
    aksi: string;
  };
  rekomendasi: string[];
  interpretasi: string;
}

export function StuntingAnalysisDashboard() {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<StuntingDashboardData | null>(null);
  const [activeTab, setActiveTab] = useState("overview");
  
  // Analysis dialog state
  const [showAnalyzeDialog, setShowAnalyzeDialog] = useState(false);
  const [analyzeForm, setAnalyzeForm] = useState({
    warga_id: "",
    berat_kg: "",
    tinggi_cm: "",
    lingkar_kepala_cm: "",
    posyandu: "",
  });
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [analyzing, setAnalyzing] = useState(false);

  // Load dashboard data
  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const response = await socialDataService.getStuntingDashboard();
      if (response.status === "success") {
        setDashboardData(response.data);
      }
    } catch (error) {
      console.error("Error loading stunting dashboard:", error);
      toast.error("Gagal memuat data dashboard stunting");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Handle analyze child
  const handleAnalyze = async () => {
    if (!analyzeForm.warga_id || !analyzeForm.berat_kg || !analyzeForm.tinggi_cm) {
      toast.error("Mohon lengkapi data pengukuran");
      return;
    }

    setAnalyzing(true);
    try {
      const response = await socialDataService.analyzeChildGrowth(
        parseInt(analyzeForm.warga_id),
        {
          berat_kg: parseFloat(analyzeForm.berat_kg),
          tinggi_cm: parseFloat(analyzeForm.tinggi_cm),
          lingkar_kepala_cm: analyzeForm.lingkar_kepala_cm ? parseFloat(analyzeForm.lingkar_kepala_cm) : undefined,
          posyandu: analyzeForm.posyandu || undefined,
          simpan: true,
        }
      );

      if (response.success) {
        setAnalysisResult(response.data);
        toast.success("Analisis berhasil!");
        loadDashboardData(); // Refresh dashboard
      }
    } catch (error: any) {
      console.error("Error analyzing:", error);
      toast.error(error.response?.data?.message || "Gagal melakukan analisis");
    } finally {
      setAnalyzing(false);
    }
  };

  // Get urgency badge
  const getUrgencyBadge = (urgency: string) => {
    const config: Record<string, { color: string; label: string }> = {
      darurat: { color: "bg-red-500", label: "DARURAT" },
      tinggi: { color: "bg-orange-500", label: "Tinggi" },
      sedang: { color: "bg-yellow-500", label: "Sedang" },
      normal: { color: "bg-green-500", label: "Normal" },
    };
    const cfg = config[urgency] || config.normal;
    return <Badge className={`${cfg.color} text-white`}>{cfg.label}</Badge>;
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    const color = STATUS_COLORS[status as keyof typeof STATUS_COLORS] || "#6b7280";
    return (
      <Badge style={{ backgroundColor: color }} className="text-white">
        {status}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
        <span className="ml-2">Memuat data...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Baby className="w-7 h-7 text-pink-500" />
            Analisis Stunting - Standar WHO
          </h1>
          <p className="text-gray-500 mt-1">
            Sistem analisis pertumbuhan anak menggunakan standar WHO LMS (mirip Buku Pink KIA)
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadDashboardData}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={() => setShowAnalyzeDialog(true)}>
            <Calculator className="w-4 h-4 mr-2" />
            Analisis Baru
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-blue-600 font-medium">Total Anak Terpantau</p>
                <p className="text-3xl font-bold text-blue-700">
                  {dashboardData?.total_anak_terpantau || 0}
                </p>
              </div>
              <Users className="w-10 h-10 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-red-600 font-medium">Perlu Intervensi</p>
                <p className="text-3xl font-bold text-red-700">
                  {dashboardData?.perlu_intervensi || 0}
                </p>
              </div>
              <AlertTriangle className="w-10 h-10 text-red-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-yellow-600 font-medium">Stunting</p>
                <p className="text-3xl font-bold text-yellow-700">
                  {dashboardData?.ringkasan?.stunting || 0}
                </p>
              </div>
              <Ruler className="w-10 h-10 text-yellow-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-green-600 font-medium">Normal</p>
                <p className="text-3xl font-bold text-green-700">
                  {dashboardData?.ringkasan?.normal || 0}
                </p>
              </div>
              <CheckCircle className="w-10 h-10 text-green-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detail Cards Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        <Card>
          <CardContent className="pt-4 text-center">
            <p className="text-xs text-gray-500">Underweight</p>
            <p className="text-xl font-bold text-orange-600">
              {dashboardData?.ringkasan?.underweight || 0}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <p className="text-xs text-gray-500">Wasting</p>
            <p className="text-xl font-bold text-red-600">
              {dashboardData?.ringkasan?.wasting || 0}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <p className="text-xs text-gray-500">Overweight</p>
            <p className="text-xl font-bold text-yellow-600">
              {dashboardData?.ringkasan?.overweight || 0}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <p className="text-xs text-gray-500">Obesitas</p>
            <p className="text-xl font-bold text-red-500">
              {dashboardData?.ringkasan?.obesitas || 0}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <p className="text-xs text-gray-500">Urgensi Tinggi</p>
            <p className="text-xl font-bold text-orange-500">
              {dashboardData?.tingkat_urgensi?.tinggi || 0}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <p className="text-xs text-gray-500">Darurat</p>
            <p className="text-xl font-bold text-red-600">
              {dashboardData?.tingkat_urgensi?.darurat || 0}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Gizi Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Distribusi Status Gizi
            </CardTitle>
          </CardHeader>
          <CardContent>
            {dashboardData?.grafik_status && (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={dashboardData.grafik_status.labels.map((label, idx) => ({
                      name: label,
                      value: dashboardData.grafik_status.data[idx],
                      color: dashboardData.grafik_status.colors[idx],
                    }))}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    outerRadius={100}
                    dataKey="value"
                  >
                    {dashboardData.grafik_status.labels.map((_, idx) => (
                      <Cell key={`cell-${idx}`} fill={dashboardData.grafik_status.colors[idx]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Trend Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Tren Pengukuran (6 Bulan Terakhir)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {dashboardData?.tren_bulanan && (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart
                  data={dashboardData.tren_bulanan.labels.map((label, idx) => ({
                    bulan: label,
                    pengukuran: dashboardData.tren_bulanan!.jumlah_pengukuran[idx],
                    intervensi: dashboardData.tren_bulanan!.perlu_intervensi[idx],
                  }))}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="bulan" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="pengukuran"
                    name="Total Pengukuran"
                    stroke="#3b82f6"
                    fill="#93c5fd"
                    strokeWidth={2}
                  />
                  <Area
                    type="monotone"
                    dataKey="intervensi"
                    name="Perlu Intervensi"
                    stroke="#ef4444"
                    fill="#fca5a5"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Measurements & Urgent Cases */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Measurements */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Pengukuran Terbaru
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {dashboardData?.pengukuran_terbaru?.map((p, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium">{p.nama}</p>
                    <p className="text-sm text-gray-500">
                      {p.usia_bulan} bulan • {p.berat_kg}kg / {p.tinggi_cm}cm
                    </p>
                  </div>
                  <div className="text-right">
                    {getStatusBadge(p.status_gizi)}
                    <p className="text-xs text-gray-400 mt-1">{p.tanggal_pengukuran}</p>
                  </div>
                </div>
              ))}
              {(!dashboardData?.pengukuran_terbaru || dashboardData.pengukuran_terbaru.length === 0) && (
                <p className="text-gray-500 text-center py-4">Belum ada data pengukuran</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Urgent Cases */}
        <Card className="border-red-200">
          <CardHeader className="bg-red-50">
            <CardTitle className="flex items-center gap-2 text-red-700">
              <AlertCircle className="w-5 h-5" />
              Kasus Darurat
            </CardTitle>
            <CardDescription>Anak yang membutuhkan penanganan segera</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {dashboardData?.kasus_darurat?.map((k, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-100"
                >
                  <div>
                    <p className="font-medium text-red-800">{k.nama}</p>
                    <p className="text-sm text-red-600">
                      {k.usia_bulan} bulan • Z-Score: {k.z_hfa}
                    </p>
                  </div>
                  <div className="text-right">
                    {getUrgencyBadge("darurat")}
                    <p className="text-xs text-gray-500 mt-1">{k.status_gizi}</p>
                  </div>
                </div>
              ))}
              {(!dashboardData?.kasus_darurat || dashboardData.kasus_darurat.length === 0) && (
                <div className="text-center py-4">
                  <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-2" />
                  <p className="text-green-600 font-medium">Tidak ada kasus darurat</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Needs Follow-up */}
      {dashboardData?.perlu_tindak_lanjut && dashboardData.perlu_tindak_lanjut.length > 0 && (
        <Card className="border-yellow-200">
          <CardHeader className="bg-yellow-50">
            <CardTitle className="flex items-center gap-2 text-yellow-700">
              <Clock className="w-5 h-5" />
              Perlu Tindak Lanjut
            </CardTitle>
            <CardDescription>
              Anak yang belum diukur lebih dari 2 bulan dan membutuhkan intervensi
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama</TableHead>
                  <TableHead>Usia</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Pengukuran Terakhir</TableHead>
                  <TableHead>Keterangan</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dashboardData.perlu_tindak_lanjut.map((p, idx) => (
                  <TableRow key={idx}>
                    <TableCell className="font-medium">{p.nama}</TableCell>
                    <TableCell>{p.usia_bulan} bulan</TableCell>
                    <TableCell>{getStatusBadge(p.status_gizi)}</TableCell>
                    <TableCell>{p.tanggal_pengukuran_terakhir}</TableCell>
                    <TableCell className="text-orange-600">{p.pesan}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Analysis Dialog */}
      <Dialog open={showAnalyzeDialog} onOpenChange={setShowAnalyzeDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calculator className="w-5 h-5" />
              Analisis Pertumbuhan Anak (WHO LMS)
            </DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>ID Warga (Anak) *</Label>
              <Input
                type="number"
                placeholder="Masukkan ID warga"
                value={analyzeForm.warga_id}
                onChange={(e) => setAnalyzeForm({ ...analyzeForm, warga_id: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Posyandu</Label>
              <Input
                placeholder="Nama Posyandu"
                value={analyzeForm.posyandu}
                onChange={(e) => setAnalyzeForm({ ...analyzeForm, posyandu: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Berat Badan (kg) *</Label>
              <Input
                type="number"
                step="0.1"
                placeholder="contoh: 10.5"
                value={analyzeForm.berat_kg}
                onChange={(e) => setAnalyzeForm({ ...analyzeForm, berat_kg: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Tinggi Badan (cm) *</Label>
              <Input
                type="number"
                step="0.1"
                placeholder="contoh: 75.5"
                value={analyzeForm.tinggi_cm}
                onChange={(e) => setAnalyzeForm({ ...analyzeForm, tinggi_cm: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Lingkar Kepala (cm)</Label>
              <Input
                type="number"
                step="0.1"
                placeholder="contoh: 45.0"
                value={analyzeForm.lingkar_kepala_cm}
                onChange={(e) => setAnalyzeForm({ ...analyzeForm, lingkar_kepala_cm: e.target.value })}
              />
            </div>
          </div>

          {/* Analysis Result */}
          {analysisResult && (
            <div className="mt-4 p-4 rounded-lg border" style={{ borderColor: analysisResult.status_gizi.warna }}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-bold text-lg">{analysisResult.identitas_anak.nama}</h3>
                  <p className="text-sm text-gray-500">
                    {analysisResult.identitas_anak.usia_text} • {analysisResult.identitas_anak.jenis_kelamin_text}
                  </p>
                </div>
                <Badge
                  style={{ backgroundColor: analysisResult.status_gizi.warna }}
                  className="text-white text-lg px-4 py-2"
                >
                  {analysisResult.status_gizi.overall}
                </Badge>
              </div>

              <div className="grid grid-cols-4 gap-3 mb-4">
                <div className="text-center p-2 bg-gray-50 rounded">
                  <p className="text-xs text-gray-500">TB/U (Stunting)</p>
                  <p className="font-bold">{analysisResult.zscore.TB_U}</p>
                  <p className="text-xs">{analysisResult.status.TB_U}</p>
                </div>
                <div className="text-center p-2 bg-gray-50 rounded">
                  <p className="text-xs text-gray-500">BB/U (Underweight)</p>
                  <p className="font-bold">{analysisResult.zscore.BB_U}</p>
                  <p className="text-xs">{analysisResult.status.BB_U}</p>
                </div>
                <div className="text-center p-2 bg-gray-50 rounded">
                  <p className="text-xs text-gray-500">BB/TB (Wasting)</p>
                  <p className="font-bold">{analysisResult.zscore.BB_TB ?? "-"}</p>
                  <p className="text-xs">{analysisResult.status.BB_TB ?? "-"}</p>
                </div>
                <div className="text-center p-2 bg-gray-50 rounded">
                  <p className="text-xs text-gray-500">IMT/U</p>
                  <p className="font-bold">{analysisResult.zscore.IMT_U}</p>
                  <p className="text-xs">{analysisResult.status.IMT_U}</p>
                </div>
              </div>

              <div className="mb-3">
                <p className="text-sm font-medium mb-1">Interpretasi:</p>
                <p className="text-sm text-gray-700">{analysisResult.interpretasi}</p>
              </div>

              <div>
                <p className="text-sm font-medium mb-1">Rekomendasi:</p>
                <ul className="text-sm text-gray-700 space-y-1">
                  {analysisResult.rekomendasi.slice(0, 5).map((r, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <ChevronRight className="w-4 h-4 mt-0.5 text-blue-500" />
                      {r}
                    </li>
                  ))}
                </ul>
              </div>

              {analysisResult.status_gizi.perlu_intervensi && (
                <div className="mt-3 p-3 bg-red-50 rounded-lg border border-red-200">
                  <p className="text-sm font-medium text-red-700 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    {analysisResult.status_gizi.aksi}
                  </p>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowAnalyzeDialog(false);
              setAnalysisResult(null);
              setAnalyzeForm({ warga_id: "", berat_kg: "", tinggi_cm: "", lingkar_kepala_cm: "", posyandu: "" });
            }}>
              Tutup
            </Button>
            <Button onClick={handleAnalyze} disabled={analyzing}>
              {analyzing ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Menganalisis...
                </>
              ) : (
                <>
                  <Calculator className="w-4 h-4 mr-2" />
                  Analisis
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default StuntingAnalysisDashboard;
