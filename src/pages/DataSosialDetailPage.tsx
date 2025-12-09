/**
 * Data Sosial Detail Page
 * Halaman untuk menampilkan detail lengkap data sosial
 */

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  User,
  MapPin,
  Calendar,
  FileText,
  Phone,
  Home,
  Heart,
  Baby,
  Accessibility,
  GraduationCap,
  DollarSign,
  CheckCircle,
  XCircle,
  Printer,
  Edit,
  Trash2,
  Activity,
  Loader2,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Ruler,
  Scale,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  AreaChart,
  Area,
} from "recharts";
import { toast } from "sonner";
import socialDataService from "@/services/socialDataService";
import { getStatusColor, detailFieldsConfig, STATUS_COLORS, typeConfig } from "@/constants/socialData";
import { calculateStuntingStatus } from "@/utils/stuntingCalculator";
import type { DataSosialGeneric, GrowthHistoryItem } from "@/types/socialData";

interface DataSosialDetailPageProps {
  type: keyof typeof typeConfig;
  itemId: number;
  onBack: () => void;
  onEdit?: (item: DataSosialGeneric) => void;
  onDelete?: (item: DataSosialGeneric) => void;
}

// Get icon for section
const getSectionIcon = (section: string) => {
  const icons: Record<string, React.ReactNode> = {
    "Data Utama": <User className="w-4 h-4" />,
    "Data Anak": <Baby className="w-4 h-4" />,
    "Data Orang Tua": <User className="w-4 h-4" />,
    "Data Peserta": <User className="w-4 h-4" />,
    "Data Penyandang": <Accessibility className="w-4 h-4" />,
    "Data Pemilik": <Home className="w-4 h-4" />,
    "Status Kemiskinan": <DollarSign className="w-4 h-4" />,
    "Status": <FileText className="w-4 h-4" />,
    "Data Pengukuran": <Activity className="w-4 h-4" />,
    "Bantuan yang Diterima": <Heart className="w-4 h-4" />,
    "Bantuan": <Heart className="w-4 h-4" />,
    "Data KB": <Heart className="w-4 h-4" />,
    "Data Kehamilan": <Baby className="w-4 h-4" />,
    "Jenis Disabilitas": <Accessibility className="w-4 h-4" />,
    "Pendidikan & Pekerjaan": <GraduationCap className="w-4 h-4" />,
    "Data Pendidikan": <GraduationCap className="w-4 h-4" />,
    "Kondisi Rumah": <Home className="w-4 h-4" />,
    "Fasilitas": <Home className="w-4 h-4" />,
    "Program Perbaikan": <CheckCircle className="w-4 h-4" />,
    "Intervensi": <Heart className="w-4 h-4" />,
    "Metadata": <Calendar className="w-4 h-4" />,
    "Alamat": <MapPin className="w-4 h-4" />,
  };
  return icons[section] || <FileText className="w-4 h-4" />;
};

// Format value based on type
const formatValue = (value: any, type?: string): React.ReactNode => {
  if (value === null || value === undefined || value === "") {
    return <span className="text-gray-400 italic">-</span>;
  }

  switch (type) {
    case "date":
      try {
        return new Date(value).toLocaleDateString("id-ID", {
          day: "numeric",
          month: "long",
          year: "numeric",
        });
      } catch {
        return value;
      }

    case "currency":
      return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
      }).format(Number(value) || 0);

    case "boolean":
      return value ? (
        <span className="inline-flex items-center gap-1 text-green-600">
          <CheckCircle className="w-4 h-4" />
          Ya
        </span>
      ) : (
        <span className="inline-flex items-center gap-1 text-red-600">
          <XCircle className="w-4 h-4" />
          Tidak
        </span>
      );

    case "badge":
      const hexColor = STATUS_COLORS[String(value)] || "#6b7280";
      return (
        <Badge
          variant="outline"
          style={{
            backgroundColor: `${hexColor}20`,
            color: hexColor,
            borderColor: hexColor,
          }}
        >
          {value}
        </Badge>
      );

    case "array":
      if (Array.isArray(value) && value.length > 0) {
        return (
          <div className="flex flex-wrap gap-1">
            {value.map((item, idx) => (
              <Badge key={idx} variant="secondary" className="text-xs">
                {item}
              </Badge>
            ))}
          </div>
        );
      }
      return <span className="text-gray-400 italic">-</span>;

    case "number":
      if (typeof value === "number") {
        return value.toLocaleString("id-ID");
      }
      return value;

    default:
      if (value === "L") return "Laki-laki";
      if (value === "P") return "Perempuan";
      return String(value);
  }
};

export default function DataSosialDetailPage({
  type,
  itemId,
  onBack,
  onEdit,
  onDelete,
}: DataSosialDetailPageProps) {
  const config = typeConfig[type];
  const [loading, setLoading] = useState(true);
  const [item, setItem] = useState<DataSosialGeneric | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Stunting specific states
  const [growthHistory, setGrowthHistory] = useState<GrowthHistoryItem[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [stuntingAnalysis, setStuntingAnalysis] = useState<{
    status: string;
    zscore: number;
    color: string;
  } | null>(null);

  // Load data
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        console.log('Loading detail data:', { type, itemId });
        const response = await socialDataService.getByIdAndType(type, itemId) as any;
        console.log('Detail response:', response);
        
        // Handle berbagai struktur response
        let itemData = null;
        
        // Jika response adalah { success: true, data: {...} }
        if (response?.success && response?.data) {
          itemData = response.data;
        }
        // Jika response langsung adalah data object
        else if (response?.id) {
          itemData = response;
        }
        // Jika response adalah { data: {...} } tanpa success flag
        else if (response?.data?.id) {
          itemData = response.data;
        }
        
        console.log('Extracted itemData:', itemData);
        
        if (itemData && itemData.id) {
          setItem(itemData as DataSosialGeneric);
        } else {
          console.warn('No valid data found in response:', response);
          setError("Data tidak ditemukan");
        }
      } catch (err: any) {
        console.error("Failed to load data:", err);
        // Tampilkan pesan error yang lebih spesifik
        const errorMessage = err?.message || "Gagal memuat data";
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [type, itemId]);

  // Load growth history for stunting
  useEffect(() => {
    const loadGrowthHistory = async () => {
      if (type !== "stunting" || !item) return;
      
      setLoadingHistory(true);
      try {
        const response = await socialDataService.getGrowthHistory(itemId) as { data?: GrowthHistoryItem[] | { data?: GrowthHistoryItem[] } };
        if (response?.data) {
          const historyData = Array.isArray(response.data) 
            ? response.data 
            : (response.data as { data?: GrowthHistoryItem[] }).data || [];
          setGrowthHistory(historyData);
        }
      } catch (err) {
        console.error("Failed to load growth history:", err);
      } finally {
        setLoadingHistory(false);
      }
    };
    loadGrowthHistory();
  }, [type, item, itemId]);

  // Calculate stunting analysis
  useEffect(() => {
    if (item && type === "stunting") {
      const usia = item.usia_bulan as number | undefined;
      const tinggi = item.tinggi_badan as number | undefined;
      const jk = item.jenis_kelamin as string | undefined;
      
      if (usia && tinggi && jk) {
        const result = calculateStuntingStatus(
          Number(usia),
          Number(tinggi),
          jk as "L" | "P"
        );
        setStuntingAnalysis(result);
      }
    }
  }, [item, type]);

  // Get field configuration for this type
  const fields = detailFieldsConfig[type] || [];

  // Group fields by section
  const groupedFields = useMemo(() => {
    const groups: Record<string, typeof fields> = {};
    fields.forEach((field) => {
      const section = field.section || "Lainnya";
      if (!groups[section]) {
        groups[section] = [];
      }
      groups[section].push(field);
    });
    return groups;
  }, [fields]);

  // Get display name for the item
  const getDisplayName = () => {
    if (!item) return "";
    return (item.nama || item.nama_anak || item.nama_pemilik || "Data") as string;
  };

  // Handle print
  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Memuat data...</p>
        </div>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <AlertTriangle className="w-12 h-12 text-destructive mx-auto" />
          <h2 className="text-xl font-semibold">{error || "Data tidak ditemukan"}</h2>
          <Button onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Kembali
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 print:p-0">
      {/* Header */}
      <div className="flex items-center justify-between print:hidden">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Kembali
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Detail {config.title}</h1>
            <p className="text-muted-foreground">{getDisplayName()}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handlePrint}>
            <Printer className="w-4 h-4 mr-2" />
            Cetak
          </Button>
          {onEdit && (
            <Button variant="outline" size="sm" onClick={() => onEdit(item)}>
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>
          )}
          {onDelete && (
            <Button variant="destructive" size="sm" onClick={() => onDelete(item)}>
              <Trash2 className="w-4 h-4 mr-2" />
              Hapus
            </Button>
          )}
        </div>
      </div>

      {/* Print Header */}
      <div className="hidden print:block mb-8">
        <h1 className="text-2xl font-bold text-center">Detail {config.title}</h1>
        <p className="text-center text-gray-600">{getDisplayName()}</p>
        <Separator className="my-4" />
      </div>

      {/* Status & Summary Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                {type === "stunting" && <Baby className="w-8 h-8 text-primary" />}
                {type === "kemiskinan" && <DollarSign className="w-8 h-8 text-primary" />}
                {type === "kb" && <Heart className="w-8 h-8 text-primary" />}
                {type === "disabilitas" && <Accessibility className="w-8 h-8 text-primary" />}
                {type === "rtlh" && <Home className="w-8 h-8 text-primary" />}
                {type === "putus-sekolah" && <GraduationCap className="w-8 h-8 text-primary" />}
              </div>
              <div>
                <h2 className="text-xl font-semibold">{getDisplayName()}</h2>
                <p className="text-muted-foreground">
                  {item.nik || item.nik_anak || "-"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {item.jorong && `${item.jorong}`}
                  {item.rt && ` RT ${item.rt}`}
                  {item.rw && ` / RW ${item.rw}`}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Status</p>
                <div className="mt-1">{formatValue(item.status, "badge")}</div>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Tahun Data</p>
                <p className="text-2xl font-bold">{item.tahun_data}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content - Tabs for Stunting, Cards for others */}
      {type === "stunting" ? (
        <Tabs defaultValue="detail" className="print:hidden">
          <TabsList>
            <TabsTrigger value="detail">Detail Data</TabsTrigger>
            <TabsTrigger value="analysis">Analisis Stunting</TabsTrigger>
            <TabsTrigger value="history">Riwayat Pertumbuhan</TabsTrigger>
          </TabsList>

          <TabsContent value="detail" className="space-y-4 mt-4">
            {Object.entries(groupedFields).map(([section, sectionFields]) => (
              <Card key={section}>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    {getSectionIcon(section)}
                    {section}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {sectionFields.map((field) => {
                      const value = item[field.key];
                      return (
                        <div key={field.key} className="space-y-1">
                          <p className="text-xs text-muted-foreground uppercase tracking-wide">
                            {field.label}
                          </p>
                          <div className="font-medium text-sm">
                            {formatValue(value, field.type)}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="analysis" className="space-y-4 mt-4">
            {/* Stunting Analysis */}
            {stuntingAnalysis && (
              <Card className="border-2" style={{ borderColor: `${stuntingAnalysis.color}40` }}>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5" style={{ color: stuntingAnalysis.color }} />
                    Hasil Analisis (Standar WHO)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <div
                          className="p-3 rounded-full"
                          style={{ backgroundColor: `${stuntingAnalysis.color}20` }}
                        >
                          {stuntingAnalysis.status === "Normal" ? (
                            <CheckCircle className="w-8 h-8" style={{ color: stuntingAnalysis.color }} />
                          ) : (
                            <AlertTriangle className="w-8 h-8" style={{ color: stuntingAnalysis.color }} />
                          )}
                        </div>
                        <div>
                          <p className="text-3xl font-bold" style={{ color: stuntingAnalysis.color }}>
                            {stuntingAnalysis.status}
                          </p>
                          <p className="text-muted-foreground">
                            Z-Score: <strong>{stuntingAnalysis.zscore.toFixed(2)} SD</strong>
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <Calendar className="w-5 h-5 mx-auto mb-1 text-gray-500" />
                        <p className="text-xs text-muted-foreground">Usia</p>
                        <p className="text-lg font-semibold">{item.usia_bulan} bln</p>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <Ruler className="w-5 h-5 mx-auto mb-1 text-gray-500" />
                        <p className="text-xs text-muted-foreground">Tinggi</p>
                        <p className="text-lg font-semibold">{item.tinggi_badan} cm</p>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <Scale className="w-5 h-5 mx-auto mb-1 text-gray-500" />
                        <p className="text-xs text-muted-foreground">Berat</p>
                        <p className="text-lg font-semibold">{item.berat_badan} kg</p>
                      </div>
                    </div>
                  </div>

                  {/* Z-Score Scale */}
                  <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium mb-3">Interpretasi Z-Score TB/U:</p>
                    <div className="flex items-center gap-2 text-xs">
                      <div className="flex-1 h-3 rounded-full bg-gradient-to-r from-red-500 via-yellow-400 to-green-500" />
                    </div>
                    <div className="flex justify-between text-xs mt-1 text-muted-foreground">
                      <span>-3 SD (Sangat Pendek)</span>
                      <span>-2 SD (Pendek)</span>
                      <span>-1 SD</span>
                      <span>0 (Normal)</span>
                    </div>
                    <div className="grid grid-cols-4 gap-2 mt-3 text-xs">
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 rounded-full bg-green-500" />
                        <span>Normal (≥ -1 SD)</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 rounded-full bg-yellow-500" />
                        <span>Risiko (-1 s/d -2 SD)</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 rounded-full bg-orange-500" />
                        <span>Stunting Ringan (-2 s/d -3 SD)</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 rounded-full bg-red-500" />
                        <span>Stunting Berat (&lt; -3 SD)</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="history" className="space-y-4 mt-4">
            {loadingHistory ? (
              <Card>
                <CardContent className="py-12">
                  <div className="flex items-center justify-center">
                    <Loader2 className="w-6 h-6 animate-spin mr-2" />
                    <span>Memuat riwayat pertumbuhan...</span>
                  </div>
                </CardContent>
              </Card>
            ) : growthHistory.length === 0 ? (
              <Card>
                <CardContent className="py-12">
                  <div className="text-center text-muted-foreground">
                    <Activity className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>Belum ada riwayat pengukuran</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <>
                {/* Growth Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {/* Height Chart */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Ruler className="w-4 h-4" />
                        Pertumbuhan Tinggi Badan
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[250px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={growthHistory}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="usia_bulan" label={{ value: "Usia (bulan)", position: "bottom" }} />
                            <YAxis label={{ value: "cm", angle: -90, position: "insideLeft" }} />
                            <Tooltip />
                            <Area
                              type="monotone"
                              dataKey="tinggi_cm"
                              stroke="#3b82f6"
                              fill="#3b82f680"
                              name="Tinggi (cm)"
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Weight Chart */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Scale className="w-4 h-4" />
                        Pertumbuhan Berat Badan
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[250px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={growthHistory}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="usia_bulan" label={{ value: "Usia (bulan)", position: "bottom" }} />
                            <YAxis label={{ value: "kg", angle: -90, position: "insideLeft" }} />
                            <Tooltip />
                            <Area
                              type="monotone"
                              dataKey="berat_kg"
                              stroke="#10b981"
                              fill="#10b98180"
                              name="Berat (kg)"
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* History Table */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Riwayat Pengukuran</CardTitle>
                    <CardDescription>
                      Total {growthHistory.length} pengukuran
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-2 px-3">Tanggal</th>
                            <th className="text-center py-2 px-3">Usia</th>
                            <th className="text-center py-2 px-3">Tinggi</th>
                            <th className="text-center py-2 px-3">Berat</th>
                            <th className="text-center py-2 px-3">Z-Score</th>
                            <th className="text-center py-2 px-3">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {growthHistory.map((record, idx) => (
                            <tr key={record.id || idx} className="border-b hover:bg-gray-50">
                              <td className="py-2 px-3">
                                {new Date(record.tanggal_pengukuran).toLocaleDateString("id-ID")}
                              </td>
                              <td className="text-center py-2 px-3">{record.usia_bulan} bln</td>
                              <td className="text-center py-2 px-3">{record.tinggi_cm} cm</td>
                              <td className="text-center py-2 px-3">{record.berat_kg} kg</td>
                              <td className="text-center py-2 px-3">
                                {record.zscore_hfa?.toFixed(2) || "-"}
                              </td>
                              <td className="text-center py-2 px-3">
                                {record.status && formatValue(record.status, "badge")}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>
        </Tabs>
      ) : (
        /* Non-stunting: Regular cards layout */
        <div className="space-y-4">
          {Object.entries(groupedFields).map(([section, sectionFields]) => (
            <Card key={section}>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  {getSectionIcon(section)}
                  {section}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {sectionFields.map((field) => {
                    const value = item[field.key];
                    return (
                      <div key={field.key} className="space-y-1">
                        <p className="text-xs text-muted-foreground uppercase tracking-wide">
                          {field.label}
                        </p>
                        <div className="font-medium text-sm">
                          {formatValue(value, field.type)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Print view: All sections */}
      <div className="hidden print:block space-y-4">
        {Object.entries(groupedFields).map(([section, sectionFields]) => (
          <div key={section} className="mb-4">
            <h3 className="font-semibold text-lg border-b pb-1 mb-2">{section}</h3>
            <div className="grid grid-cols-3 gap-2">
              {sectionFields.map((field) => {
                const value = item[field.key];
                const displayValue = 
                  field.type === "boolean" ? (value ? "Ya" : "Tidak") :
                  field.type === "date" ? (value ? new Date(String(value)).toLocaleDateString("id-ID") : "-") :
                  field.type === "currency" ? (value ? `Rp ${Number(value).toLocaleString("id-ID")}` : "-") :
                  (value ?? "-");
                return (
                  <div key={field.key} className="text-sm">
                    <span className="text-gray-500">{field.label}:</span>{" "}
                    <strong>{String(displayValue)}</strong>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Footer Timestamps */}
      <div className="flex items-center justify-between text-xs text-muted-foreground pt-4 border-t">
        {item.created_at && (
          <span>Dibuat: {new Date(String(item.created_at)).toLocaleString("id-ID")}</span>
        )}
        {item.updated_at && (
          <span>Terakhir diperbarui: {new Date(String(item.updated_at)).toLocaleString("id-ID")}</span>
        )}
      </div>
    </div>
  );
}
