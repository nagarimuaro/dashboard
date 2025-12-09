import { useState, useEffect, useMemo, useCallback } from "react";
import { useParams } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Filter,
  ChevronDown,
  ChevronUp,
  X,
  Settings2,
  Columns,
  BarChart3,
  PieChart as PieChartIcon,
  Calculator,
  Download,
  RefreshCw,
  Activity,
  AlertTriangle,
  CheckCircle,
  Users,
  Baby,
  Heart,
  Home,
  GraduationCap,
  Accessibility,
  Loader2,
  Eye,
} from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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
  ReferenceLine,
} from "recharts";
import { toast } from "sonner";
import socialDataService from "@/services/socialDataService";
import StuntingAnalysisDashboard from "@/components/stunting-analysis";
import {
  KemiskinanForm,
  StuntingForm,
  KbForm,
  DisabilitasForm,
  RtlhForm,
  PutusSekolahForm,
} from "@/components/social-data/forms";
import { SocialDataDetailDialog } from "@/components/social-data";

// Import dari extracted modules
import { 
  STATUS_COLORS, 
  CHART_COLORS, 
  typeConfig,
  defaultJorongList,
  rtList,
  rwList,
  tahunList,
  getStatusColor,
} from "@/constants/socialData";
import type { 
  DataSosialGeneric as DataSosial, 
  PaginationMeta,
  SocialDataConfigResponse,
  ApiResponse,
  GrowthHistoryResponse,
  GrowthHistoryItem,
  GrowthStatsResponse,
  DataStunting,
} from "@/types/socialData";
import { calculateStuntingStatus } from "@/utils/stuntingCalculator";

// Column definitions (for column visibility feature)
const allColumns = [
  { id: "no", label: "No", default: true },
  { id: "nama", label: "Nama", default: true },
  { id: "nik", label: "NIK", default: true },
  { id: "alamat", label: "Alamat", default: true },
  { id: "jorong", label: "Jorong", default: true },
  { id: "rt_rw", label: "RT/RW", default: true },
  { id: "status", label: "Status", default: true },
  { id: "tahun", label: "Tahun", default: true },
  { id: "keterangan", label: "Keterangan", default: false },
  { id: "aksi", label: "Aksi", default: true },
];

interface DataSosialPageProps {
  type: keyof typeof typeConfig;
  embedded?: boolean; // untuk embed dalam halaman lain tanpa padding ganda
  onViewDetail?: (type: string, itemId: number) => void; // callback untuk navigasi ke detail page
}

export default function DataSosialPage({ type, embedded = false, onViewDetail }: DataSosialPageProps) {
  const config = typeConfig[type];
  
  // Data state
  const [data, setData] = useState<DataSosial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Config from API
  const [jorongList, setJorongList] = useState<string[]>(defaultJorongList);
  const [apiConfig, setApiConfig] = useState<any>(null);
  
  // Pagination from API
  const [pagination, setPagination] = useState<PaginationMeta>({
    current_page: 1,
    last_page: 1,
    per_page: 15,
    total: 0,
  });
  
  // Search & basic filter
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  
  // Checkbox filters
  const [filterStatuses, setFilterStatuses] = useState<string[]>([]);
  const [filterJorongs, setFilterJorongs] = useState<string[]>([]);
  const [filterRTs, setFilterRTs] = useState<string[]>([]);
  const [filterRWs, setFilterRWs] = useState<string[]>([]);
  const [filterYears, setFilterYears] = useState<number[]>([]);
  
  // Filter panel state
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  // Column visibility state
  const [visibleColumns, setVisibleColumns] = useState<string[]>(
    allColumns.filter((col) => col.default).map((col) => col.id)
  );
  const [isColumnSettingsOpen, setIsColumnSettingsOpen] = useState(false);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;
  
  // Dialog state
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<DataSosial | null>(null);
  const [deleteItem, setDeleteItem] = useState<DataSosial | null>(null);
  const [detailItem, setDetailItem] = useState<DataSosial | null>(null);
  const [saving, setSaving] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState<Partial<DataSosial>>({});
  
  // Tab state
  const [activeTab, setActiveTab] = useState("data");
  
  // Stunting calculator state
  const [calcUsia, setCalcUsia] = useState<number>(12);
  const [calcTinggi, setCalcTinggi] = useState<number>(75);
  const [calcJenisKelamin, setCalcJenisKelamin] = useState<"L" | "P">("L");
  const [calcResult, setCalcResult] = useState<{ status: string; zscore: number; color: string } | null>(null);

  // WHO Analysis state (for stunting)
  const [isAnalyzeDialogOpen, setIsAnalyzeDialogOpen] = useState(false);
  const [analyzingItem, setAnalyzingItem] = useState<DataSosial | null>(null);
  const [analyzeForm, setAnalyzeForm] = useState({
    berat_kg: "",
    tinggi_cm: "",
    lingkar_kepala_cm: "",
    posyandu: "",
    tanggal_pengukuran: new Date().toISOString().split('T')[0],
  });
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [growthHistory, setGrowthHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [activeChartTab, setActiveChartTab] = useState<"hfa" | "wfa" | "wfh" | "bfa">("hfa");

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Load config from API
  useEffect(() => {
    const loadConfig = async () => {
      try {
        const response = await socialDataService.getConfig() as SocialDataConfigResponse;
        if (response) {
          setApiConfig(response.types);
          if (response.jorongs && response.jorongs.length > 0) {
            setJorongList(response.jorongs);
          }
        }
      } catch (err) {
        console.error('Failed to load config:', err);
      }
    };
    loadConfig();
  }, []);

  // Load data from API
  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params: any = {
        page: currentPage,
        per_page: itemsPerPage,
      };

      // Add filters
      if (debouncedSearch) params.search = debouncedSearch;
      if (filterStatuses.length === 1) params.status = filterStatuses[0];
      if (filterJorongs.length === 1) params.jorong = filterJorongs[0];
      if (filterYears.length === 1) params.tahun = filterYears[0];

      const response = await socialDataService.getByType(type, params) as any;
      
      // Service returns { current_page, data: [...], last_page, per_page, total }
      // OR in case of nested response: { success, data: { current_page, data: [...] } }
      if (response) {
        let paginatedData = response;
        
        // Check if response has success wrapper (double nested)
        if (response.success && response.data && typeof response.data === 'object') {
          paginatedData = response.data;
        }
        
        // Now paginatedData should be { current_page, data: [...], ... }
        if (paginatedData.data && Array.isArray(paginatedData.data)) {
          setData(paginatedData.data);
          if (paginatedData.current_page) {
            setPagination({
              current_page: paginatedData.current_page,
              last_page: paginatedData.last_page,
              per_page: paginatedData.per_page,
              total: paginatedData.total,
            });
          }
        } else if (Array.isArray(paginatedData)) {
          // Direct array response (unlikely but handle it)
          setData(paginatedData);
        } else if (Array.isArray(response)) {
          // Direct array from service
          setData(response);
        } else {
          console.warn('Unexpected response structure:', response);
          setData([]);
        }
      }
    } catch (err: any) {
      console.error('Failed to load data:', err);
      setError(err.message || 'Gagal memuat data');
      toast.error('Gagal memuat data: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  }, [type, currentPage, debouncedSearch, filterStatuses, filterJorongs, filterYears]);

  // Load data when dependencies change
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Reset filters when type changes
  useEffect(() => {
    setSearchQuery("");
    setDebouncedSearch("");
    setFilterStatuses([]);
    setFilterJorongs([]);
    setFilterRTs([]);
    setFilterRWs([]);
    setFilterYears([]);
    setCurrentPage(1);
  }, [type]);

  // Toggle checkbox filter
  const toggleFilter = (
    value: string | number,
    currentFilters: (string | number)[],
    setFilters: React.Dispatch<React.SetStateAction<any[]>>
  ) => {
    if (currentFilters.includes(value)) {
      setFilters(currentFilters.filter((f) => f !== value));
    } else {
      setFilters([...currentFilters, value]);
    }
    setCurrentPage(1);
  };

  // Toggle column visibility
  const toggleColumn = (columnId: string) => {
    if (visibleColumns.includes(columnId)) {
      setVisibleColumns(visibleColumns.filter((c) => c !== columnId));
    } else {
      setVisibleColumns([...visibleColumns, columnId]);
    }
  };

  // Check if column is visible
  const isColumnVisible = (columnId: string) => visibleColumns.includes(columnId);

  // Clear all filters
  const clearAllFilters = () => {
    setSearchQuery("");
    setDebouncedSearch("");
    setFilterStatuses([]);
    setFilterJorongs([]);
    setFilterRTs([]);
    setFilterRWs([]);
    setFilterYears([]);
    setCurrentPage(1);
  };

  // Refresh data
  const handleRefresh = () => {
    loadData();
  };

  // Count active filters
  const activeFilterCount = useMemo(() => {
    return (
      filterStatuses.length +
      filterJorongs.length +
      filterRTs.length +
      filterRWs.length +
      filterYears.length +
      (searchQuery ? 1 : 0)
    );
  }, [filterStatuses, filterJorongs, filterRTs, filterRWs, filterYears, searchQuery]);

  // Client-side filtering for multi-select (API only supports single filter)
  const filteredData = useMemo(() => {
    return data.filter((item) => {
      // Multi-status filter (client-side if more than 1 selected)
      if (filterStatuses.length > 1 && !filterStatuses.includes(item.status as string)) {
        return false;
      }

      // Multi-jorong filter (client-side if more than 1 selected)
      if (filterJorongs.length > 1 && item.jorong && !filterJorongs.includes(item.jorong)) {
        return false;
      }

      // RT filter (client-side only)
      if (filterRTs.length > 0 && item.rt && !filterRTs.includes(item.rt)) {
        return false;
      }

      // RW filter (client-side only)
      if (filterRWs.length > 0 && item.rw && !filterRWs.includes(item.rw)) {
        return false;
      }

      // Multi-year filter (client-side if more than 1 selected)
      if (filterYears.length > 1 && !filterYears.includes(item.tahun_data)) {
        return false;
      }

      return true;
    });
  }, [data, filterStatuses, filterJorongs, filterRTs, filterRWs, filterYears]);

  // Statistics calculations
  const statistics = useMemo(() => {
    // Status distribution
    const statusCounts: Record<string, number> = {};
    config.statusOptions.forEach(s => { statusCounts[s] = 0; });
    filteredData.forEach(item => {
      if (statusCounts[item.status] !== undefined) {
        statusCounts[item.status]++;
      }
    });
    const statusDistribution = Object.entries(statusCounts).map(([name, value]) => ({
      name,
      value,
      color: STATUS_COLORS[name] || "#6b7280"
    }));

    // Jorong distribution
    const jorongCounts: Record<string, number> = {};
    jorongList.forEach(j => { jorongCounts[j] = 0; });
    filteredData.forEach(item => {
      const itemJorong = item.jorong as string;
      if (itemJorong && jorongCounts[itemJorong] !== undefined) {
        jorongCounts[itemJorong]++;
      }
    });
    const jorongDistribution = Object.entries(jorongCounts).map(([name, value]) => ({
      name,
      value
    }));

    // Year trend
    const yearCounts: Record<number, number> = {};
    tahunList.forEach(t => { yearCounts[t] = 0; });
    filteredData.forEach(item => {
      if (yearCounts[item.tahun_data] !== undefined) {
        yearCounts[item.tahun_data]++;
      }
    });
    const yearTrend = Object.entries(yearCounts)
      .map(([year, count]) => ({ tahun: parseInt(year), jumlah: count }))
      .sort((a, b) => a.tahun - b.tahun);

    // Status by jorong
    const statusByJorong = jorongList.map(jorong => {
      const jorongData: Record<string, any> = { jorong };
      config.statusOptions.forEach(status => {
        jorongData[status] = filteredData.filter(d => d.jorong === jorong && d.status === status).length;
      });
      return jorongData;
    });

    // Total summary (use pagination total for accurate count)
    const total = pagination.total || filteredData.length;
    const criticalStatus = config.statusOptions[0]; // First status is usually the most critical
    const criticalCount = statusCounts[criticalStatus] || 0;
    const criticalPercentage = total > 0 ? ((criticalCount / total) * 100).toFixed(1) : "0";

    return {
      statusDistribution,
      jorongDistribution,
      yearTrend,
      statusByJorong,
      total,
      criticalCount,
      criticalPercentage,
      criticalStatus
    };
  }, [filteredData, config.statusOptions, jorongList, pagination.total]);

  // Pagination using API pagination
  const totalPages = pagination.last_page;
  const paginatedData = filteredData; // Data already paginated from API

  // Generate page numbers
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push("...");
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push("...");
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push("...");
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
        pages.push("...");
        pages.push(totalPages);
      }
    }
    return pages;
  };

  // CRUD handlers
  const handleAdd = () => {
    setEditingItem(null);
    setFormData({
      tahun_data: new Date().getFullYear(),
      jorong: jorongList[0],
      rt: rtList[0],
      rw: rwList[0],
      status: config.statusOptions[0],
    });
    setIsDialogOpen(true);
  };

  const handleEdit = (item: DataSosial) => {
    setEditingItem(item);
    setFormData(item);
    setIsDialogOpen(true);
  };

  const handleDelete = (item: DataSosial) => {
    setDeleteItem(item);
    setIsDeleteDialogOpen(true);
  };

  const handleViewDetail = (item: DataSosial) => {
    // Jika ada callback navigasi, gunakan itu (untuk full page)
    if (onViewDetail) {
      onViewDetail(type, item.id);
    } else {
      // Fallback ke modal jika tidak ada callback
      setDetailItem(item);
      setIsDetailDialogOpen(true);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editingItem) {
        // Update via API
        await socialDataService.updateByType(type, editingItem.id, formData);
        toast.success('Data berhasil diperbarui');
      } else {
        // Create via API
        await socialDataService.createByType(type, formData);
        toast.success('Data berhasil ditambahkan');
      }
      setIsDialogOpen(false);
      setFormData({});
      loadData(); // Refresh data from API
    } catch (err: any) {
      console.error('Failed to save data:', err);
      toast.error('Gagal menyimpan data: ' + (err.message || 'Unknown error'));
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (deleteItem) {
      setSaving(true);
      try {
        await socialDataService.deleteByType(type, deleteItem.id);
        toast.success('Data berhasil dihapus');
        loadData(); // Refresh data from API
      } catch (err: any) {
        console.error('Failed to delete data:', err);
        toast.error('Gagal menghapus data: ' + (err.message || 'Unknown error'));
      } finally {
        setSaving(false);
      }
    }
    setIsDeleteDialogOpen(false);
    setDeleteItem(null);
  };

  // Handle open analyze dialog (for stunting)
  const handleOpenAnalyze = async (item: DataSosial) => {
    setAnalyzingItem(item);
    setAnalyzeForm({
      berat_kg: item.berat_badan?.toString() || "",
      tinggi_cm: item.tinggi_badan?.toString() || "",
      lingkar_kepala_cm: item.lingkar_kepala?.toString() || "",
      posyandu: String(item.posyandu || ""),
      tanggal_pengukuran: new Date().toISOString().split('T')[0],
    });
    setAnalysisResult(null);
    setGrowthHistory([]);
    setIsAnalyzeDialogOpen(true);
    
    // Load growth history if warga_id exists
    if (item.warga_id) {
      setLoadingHistory(true);
      try {
        const wargaId = Number(item.warga_id);
        const response = await socialDataService.getChildGrowthHistory(wargaId) as GrowthHistoryResponse;
        if (response.success && response.data) {
          const historyData = Array.isArray(response.data) ? response.data : (response.data as { data: GrowthHistoryItem[] }).data || [];
          setGrowthHistory(historyData);
        }
      } catch (error) {
        console.error("Error loading growth history:", error);
      } finally {
        setLoadingHistory(false);
      }
    }
  };

  // Handle WHO analysis
  const handleAnalyzeGrowth = async () => {
    if (!analyzingItem) return;
    
    if (!analyzeForm.berat_kg || !analyzeForm.tinggi_cm) {
      toast.error("Mohon isi berat dan tinggi badan");
      return;
    }

    setAnalyzing(true);
    try {
      // Use warga_id from stunting data
      const wargaId = analyzingItem.warga_id;
      
      if (!wargaId) {
        toast.error("Data anak tidak terhubung dengan data warga. Mohon update data terlebih dahulu.");
        return;
      }

      const wargaIdNum = Number(wargaId);
      const analyzeData = {
        berat_kg: parseFloat(analyzeForm.berat_kg),
        tinggi_cm: parseFloat(analyzeForm.tinggi_cm),
        tanggal_pengukuran: analyzeForm.tanggal_pengukuran,
        simpan: true,
        ...(analyzeForm.lingkar_kepala_cm && { lingkar_kepala_cm: parseFloat(analyzeForm.lingkar_kepala_cm) }),
        ...(analyzeForm.posyandu && { posyandu: analyzeForm.posyandu }),
      };
      const response = await socialDataService.analyzeChildGrowth(wargaIdNum, analyzeData as any) as ApiResponse<unknown>;

      if (response.success) {
        setAnalysisResult(response.data);
        toast.success("Analisis berhasil disimpan!");
        
        // Refresh growth history to update chart
        try {
          const historyResponse = await socialDataService.getChildGrowthHistory(wargaIdNum) as GrowthHistoryResponse;
          if (historyResponse.success && historyResponse.data) {
            const historyData = Array.isArray(historyResponse.data) ? historyResponse.data : (historyResponse.data as { data: GrowthHistoryItem[] }).data || [];
            setGrowthHistory(historyData);
          }
        } catch (histErr) {
          console.error("Error refreshing history:", histErr);
        }
        
        // Refresh data to show updated status
        loadData();
      }
    } catch (error: any) {
      console.error("Error analyzing:", error);
      const errorMsg = error.response?.data?.message || error.message || "Gagal melakukan analisis";
      toast.error(errorMsg);
    } finally {
      setAnalyzing(false);
    }
  };

  // View growth history
  const handleViewGrowthHistory = async (item: DataSosial) => {
    if (!item.warga_id) {
      toast.error("Data tidak terhubung dengan warga");
      return;
    }
    
    try {
      const wargaIdNum = Number(item.warga_id);
      const response = await socialDataService.getChildGrowthStats(wargaIdNum) as GrowthStatsResponse;
      if (response.success && response.data) {
        // You could open a modal or navigate to detail page
        console.log("Growth stats:", response.data);
        toast.info(`${item.nama_anak} memiliki ${response.data.ringkasan?.jumlah_pengukuran || 0} pengukuran`);
      }
    } catch (error) {
      console.error("Error loading growth history:", error);
    }
  };

  // Handle stunting calculation
  const handleCalculateStunting = () => {
    const result = calculateStuntingStatus(calcUsia, calcTinggi, calcJenisKelamin);
    setCalcResult(result);
  };

  // Get icon for data type
  const getTypeIcon = () => {
    switch(type) {
      case "kemiskinan": return <Users className="w-5 h-5" />;
      case "stunting": return <Baby className="w-5 h-5" />;
      case "kb": return <Heart className="w-5 h-5" />;
      case "disabilitas": return <Accessibility className="w-5 h-5" />;
      case "rtlh": return <Home className="w-5 h-5" />;
      case "putus-sekolah": return <GraduationCap className="w-5 h-5" />;
      default: return <Activity className="w-5 h-5" />;
    }
  };

  // Get status badge color
  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      // Kemiskinan
      "Sangat Miskin": "bg-red-500",
      "Miskin": "bg-orange-500",
      "Rentan Miskin": "bg-yellow-500",
      "Hampir Miskin": "bg-blue-500",
      // Stunting
      "Stunting Berat": "bg-red-500",
      "Stunting Ringan": "bg-orange-500",
      "Normal": "bg-green-500",
      "Dalam Pemantauan": "bg-blue-500",
      // KB
      "Aktif": "bg-green-500",
      "Drop Out": "bg-red-500",
      "Tidak Aktif": "bg-gray-500",
      "Hamil": "bg-purple-500",
      // Disabilitas
      "Fisik": "bg-blue-500",
      "Intelektual": "bg-purple-500",
      "Mental": "bg-orange-500",
      "Sensorik": "bg-teal-500",
      "Ganda": "bg-red-500",
      // RTLH
      "Sangat Tidak Layak": "bg-red-500",
      "Tidak Layak": "bg-orange-500",
      "Kurang Layak": "bg-yellow-500",
      "Sudah Diperbaiki": "bg-green-500",
      // Putus Sekolah
      "SD": "bg-blue-500",
      "SMP": "bg-purple-500",
      "SMA": "bg-orange-500",
      "Tidak Sekolah": "bg-red-500",
    };
    return colors[status] || "bg-gray-500";
  };

  if (loading) {
    return (
      <div className={embedded ? "" : "p-6"}>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-center h-64">
              <div className="text-gray-500">Memuat data...</div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={`${embedded ? "" : "p-6"} space-y-4`}>
      {/* Page Header with Tabs - Compact */}
      <Card>
        <CardContent className="py-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {!embedded && (
                <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                  {getTypeIcon()}
                </div>
              )}
              <div>
                <h3 className={embedded ? "text-base font-semibold" : "text-lg font-semibold"}>{config.title}</h3>
                <p className="text-sm text-muted-foreground">Total {statistics.total} data</p>
              </div>
            </div>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className={`${type === 'stunting' ? 'grid-cols-3' : 'grid-cols-2'} grid`}>
                <TabsTrigger value="data" className="flex items-center gap-1.5 text-sm">
                  <Users className="w-4 h-4" />
                  Data
                </TabsTrigger>
                <TabsTrigger value="statistik" className="flex items-center gap-1.5 text-sm">
                  <BarChart3 className="w-4 h-4" />
                  Statistik
                </TabsTrigger>
                {type === 'stunting' && (
                  <TabsTrigger value="analisis" className="flex items-center gap-1.5 text-sm">
                    <Baby className="w-4 h-4" />
                    Analisis
                  </TabsTrigger>
                )}
              </TabsList>
            </Tabs>
          </div>
        </CardContent>
      </Card>

      {/* Tab Content - Data */}
      {activeTab === "data" && (
        <>
          {/* Filters Card - Compact */}
          <Card>
            <CardContent className="py-3">
              <div className="flex items-center gap-3 flex-wrap">
                <div className="relative flex-1 min-w-[200px] max-w-sm">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Cari nama, NIK, alamat..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="pl-9 h-9"
                  />
                </div>
                <Button onClick={handleRefresh} variant="outline" size="sm" disabled={loading}>
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                </Button>
                <Button onClick={handleAdd} size="sm" className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="w-4 h-4 mr-1" />
                  Tambah
                </Button>
                <Button
                  variant={isFilterOpen ? "default" : "outline"}
                  size="sm"
                  onClick={() => setIsFilterOpen(!isFilterOpen)}
                  className={isFilterOpen ? "bg-blue-600 hover:bg-blue-700" : ""}
                >
                  <Filter className="w-4 h-4" />
                  {activeFilterCount > 0 && (
                    <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs bg-white text-blue-600">
                      {activeFilterCount}
                    </Badge>
                  )}
                </Button>
                {activeFilterCount > 0 && (
                  <Button variant="ghost" size="sm" onClick={clearAllFilters} className="text-red-500 hover:text-red-700 px-2">
                    <X className="w-4 h-4" />
                  </Button>
                )}
                <Popover open={isColumnSettingsOpen} onOpenChange={setIsColumnSettingsOpen}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Columns className="w-4 h-4" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-48" align="end">
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm text-gray-700 pb-1 border-b">Kolom</h4>
                      {allColumns.map((column) => (
                        <div key={column.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`col-${column.id}`}
                            checked={visibleColumns.includes(column.id)}
                            onCheckedChange={() => toggleColumn(column.id)}
                          />
                          <label htmlFor={`col-${column.id}`} className="text-sm cursor-pointer flex-1">
                            {column.label}
                          </label>
                        </div>
                      ))}
                      <div className="pt-1 border-t flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 text-xs h-7"
                          onClick={() => setVisibleColumns(allColumns.map((c) => c.id))}
                        >
                          Semua
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 text-xs h-7"
                          onClick={() => setVisibleColumns(allColumns.filter((c) => c.default).map((c) => c.id))}
                        >
                          Reset
                        </Button>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </CardContent>
          </Card>

          {/* Filter Panel */}
          <Collapsible open={isFilterOpen}>
            <CollapsibleContent>
              <Card>
                <CardContent className="py-3">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* Status Filter */}
                    <div>
                      <Label className="text-xs font-medium text-gray-600 mb-1.5 block">Status</Label>
                      <div className="flex flex-wrap gap-2">
                        {config.statusOptions.map((status) => (
                          <div key={status} className="flex items-center space-x-1.5">
                            <Checkbox
                              id={`status-${status}`}
                              checked={filterStatuses.includes(status)}
                              onCheckedChange={() => toggleFilter(status, filterStatuses, setFilterStatuses)}
                              className="w-3.5 h-3.5"
                            />
                            <label htmlFor={`status-${status}`} className="text-xs cursor-pointer flex items-center gap-1">
                              <span className={`w-1.5 h-1.5 rounded-full ${getStatusColor(status)}`}></span>
                              {status}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Jorong Filter */}
                    <div>
                      <Label className="text-xs font-medium text-gray-600 mb-1.5 block">Jorong</Label>
                      <div className="flex flex-wrap gap-2">
                        {jorongList.map((jorong) => (
                          <div key={jorong} className="flex items-center space-x-1.5">
                            <Checkbox
                              id={`jorong-${jorong}`}
                              checked={filterJorongs.includes(jorong)}
                              onCheckedChange={() => toggleFilter(jorong, filterJorongs, setFilterJorongs)}
                              className="w-3.5 h-3.5"
                            />
                            <label htmlFor={`jorong-${jorong}`} className="text-xs cursor-pointer">
                              {jorong}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* RT Filter */}
                    <div>
                      <Label className="text-xs font-medium text-gray-600 mb-1.5 block">RT</Label>
                      <div className="flex flex-wrap gap-1.5">
                        {rtList.map((rt) => (
                          <div key={rt} className="flex items-center space-x-1">
                            <Checkbox
                              id={`rt-${rt}`}
                              checked={filterRTs.includes(rt)}
                              onCheckedChange={() => toggleFilter(rt, filterRTs, setFilterRTs)}
                              className="w-3.5 h-3.5"
                            />
                            <label htmlFor={`rt-${rt}`} className="text-xs cursor-pointer">
                              {rt}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* RW Filter */}
                    <div>
                      <Label className="text-xs font-medium text-gray-600 mb-1.5 block">RW</Label>
                      <div className="flex flex-wrap gap-1.5">
                        {rwList.map((rw) => (
                          <div key={rw} className="flex items-center space-x-1">
                            <Checkbox
                              id={`rw-${rw}`}
                              checked={filterRWs.includes(rw)}
                              onCheckedChange={() => toggleFilter(rw, filterRWs, setFilterRWs)}
                              className="w-3.5 h-3.5"
                            />
                            <label htmlFor={`rw-${rw}`} className="text-xs cursor-pointer">
                              {rw}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </CollapsibleContent>
          </Collapsible>

          {/* Active Filters Display */}
          {activeFilterCount > 0 && (
            <div className="flex flex-wrap gap-2">
              {filterStatuses.map((status) => (
                <Badge key={status} variant="secondary" className="bg-blue-100 text-blue-700">
                  Status: {status}
                  <X
                    className="w-3 h-3 ml-1 cursor-pointer hover:text-blue-900"
                    onClick={() => setFilterStatuses(filterStatuses.filter((s) => s !== status))}
                  />
                </Badge>
              ))}
              {filterJorongs.map((jorong) => (
                <Badge key={jorong} variant="secondary" className="bg-green-100 text-green-700">
                  Jorong: {jorong}
                  <X
                    className="w-3 h-3 ml-1 cursor-pointer hover:text-green-900"
                    onClick={() => setFilterJorongs(filterJorongs.filter((j) => j !== jorong))}
                  />
                </Badge>
              ))}
              {filterRTs.map((rt) => (
                <Badge key={rt} variant="secondary" className="bg-purple-100 text-purple-700">
                  RT: {rt}
                  <X
                    className="w-3 h-3 ml-1 cursor-pointer hover:text-purple-900"
                    onClick={() => setFilterRTs(filterRTs.filter((r) => r !== rt))}
                  />
                </Badge>
              ))}
              {filterRWs.map((rw) => (
                <Badge key={rw} variant="secondary" className="bg-orange-100 text-orange-700">
                  RW: {rw}
                  <X
                    className="w-3 h-3 ml-1 cursor-pointer hover:text-orange-900"
                    onClick={() => setFilterRWs(filterRWs.filter((r) => r !== rw))}
                  />
                </Badge>
              ))}
            </div>
          )}

          {/* Data Table */}
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    {isColumnVisible("no") && (
                      <TableHead className="w-12 text-center font-semibold">No</TableHead>
                    )}
                    {isColumnVisible("nama") && (
                      <TableHead className="font-semibold">Nama</TableHead>
                    )}
                    {isColumnVisible("nik") && (
                      <TableHead className="font-semibold">NIK</TableHead>
                    )}
                    {isColumnVisible("alamat") && (
                      <TableHead className="font-semibold">Alamat</TableHead>
                    )}
                    {isColumnVisible("jorong") && (
                  <TableHead className="font-semibold">Jorong</TableHead>
                )}
                {isColumnVisible("rt_rw") && (
                  <TableHead className="font-semibold text-center">RT/RW</TableHead>
                )}
                {isColumnVisible("status") && (
                  <TableHead className="font-semibold">Status</TableHead>
                )}
                {isColumnVisible("tahun") && (
                  <TableHead className="font-semibold text-center">Tahun</TableHead>
                )}
                {isColumnVisible("keterangan") && (
                  <TableHead className="font-semibold">Keterangan</TableHead>
                )}
                {isColumnVisible("aksi") && (
                  <TableHead className="font-semibold text-center">Aksi</TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={visibleColumns.length} className="text-center py-12">
                    <div className="flex flex-col items-center gap-2">
                      <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                      <span className="text-gray-500">Memuat data...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={visibleColumns.length} className="text-center py-8">
                    <div className="flex flex-col items-center gap-2 text-red-500">
                      <AlertTriangle className="w-8 h-8" />
                      <span>{error}</span>
                      <Button variant="outline" size="sm" onClick={handleRefresh}>
                        Coba Lagi
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ) : paginatedData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={visibleColumns.length} className="text-center py-8 text-gray-500">
                    {activeFilterCount > 0 ? "Tidak ada data yang sesuai filter" : "Tidak ada data"}
                  </TableCell>
                </TableRow>
              ) : (
                paginatedData.map((item, index) => (
                  <TableRow key={item.id} className="hover:bg-blue-50/50">
                    {isColumnVisible("no") && (
                      <TableCell className="text-center text-gray-500">
                        {(currentPage - 1) * itemsPerPage + index + 1}
                      </TableCell>
                    )}
                    {isColumnVisible("nama") && (
                      <TableCell className="font-medium">{item.nama || item.nama_anak || item.nama_pemilik || '-'}</TableCell>
                    )}
                    {isColumnVisible("nik") && (
                      <TableCell className="font-mono text-sm">{item.nik || item.nik_anak || '-'}</TableCell>
                    )}
                    {isColumnVisible("alamat") && (
                      <TableCell className="max-w-[200px] truncate">{item.alamat || '-'}</TableCell>
                    )}
                    {isColumnVisible("jorong") && (
                      <TableCell>{item.jorong || '-'}</TableCell>
                    )}
                    {isColumnVisible("rt_rw") && (
                      <TableCell className="text-center">{item.rt || '-'}/{item.rw || '-'}</TableCell>
                    )}
                    {isColumnVisible("status") && (
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded-full text-xs text-white ${getStatusColor(
                            item.status
                          )}`}
                        >
                          {item.status}
                        </span>
                      </TableCell>
                    )}
                    {isColumnVisible("tahun") && (
                      <TableCell className="text-center">{item.tahun_data}</TableCell>
                    )}
                    {isColumnVisible("keterangan") && (
                      <TableCell className="max-w-[200px] truncate">{item.keterangan || '-'}</TableCell>
                    )}
                    {isColumnVisible("aksi") && (
                      <TableCell>
                        <div className="flex items-center justify-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleViewDetail(item)}
                            className="h-8 w-8 hover:bg-purple-100 hover:text-purple-600"
                            title="Lihat Detail"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(item)}
                            className="h-8 w-8 hover:bg-blue-100 hover:text-blue-600"
                            title="Edit"
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(item)}
                            className="h-8 w-8 hover:bg-red-100 hover:text-red-600"
                            title="Hapus"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                          {type === "stunting" && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleOpenAnalyze(item)}
                              className="h-8 w-8 hover:bg-green-100 hover:text-green-600"
                              title="Analisis Pertumbuhan"
                            >
                              <Activity className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {/* Pagination */}
          <div className="flex items-center justify-between px-4 py-3 border-t bg-gray-50">
            <div className="text-sm text-gray-500">
              Menampilkan {pagination.total > 0 ? ((currentPage - 1) * itemsPerPage) + 1 : 0} -{" "}
              {Math.min(currentPage * itemsPerPage, pagination.total)} dari {pagination.total} data
            </div>
            {totalPages > 1 && (
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1 || loading}
                  className="h-8 w-8"
                >
                  <ChevronsLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1 || loading}
                  className="h-8 w-8"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                {getPageNumbers().map((page, idx) =>
                  page === "..." ? (
                    <span key={idx} className="px-2 text-gray-400">
                      ...
                    </span>
                  ) : (
                    <Button
                      key={idx}
                      variant={currentPage === page ? "default" : "outline"}
                      size="icon"
                      onClick={() => setCurrentPage(page as number)}
                      disabled={loading}
                      className={`h-8 w-8 ${
                        currentPage === page ? "bg-blue-600 hover:bg-blue-700" : ""
                      }`}
                    >
                      {page}
                    </Button>
                  )
                )}
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages || loading}
                  className="h-8 w-8"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages || loading}
                  className="h-8 w-8"
                >
                  <ChevronsRight className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
        </>
      )}

      {/* Tab Content - Statistik */}
      {activeTab === "statistik" && (
        <div className="space-y-4">
          {/* Summary Cards - More compact */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Card className="p-3">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Total Data</p>
                  <p className="text-xl font-bold text-gray-900">{statistics.total}</p>
                </div>
              </div>
            </Card>
            <Card className="p-3">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">{statistics.criticalStatus}</p>
                  <p className="text-xl font-bold text-red-600">{statistics.criticalCount}</p>
                </div>
              </div>
            </Card>
            <Card className="p-3">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Activity className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Persentase Kritis</p>
                  <p className="text-xl font-bold text-orange-600">{statistics.criticalPercentage}%</p>
                </div>
              </div>
            </Card>
            <Card className="p-3">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Jorong Aktif</p>
                  <p className="text-xl font-bold text-green-600">{jorongList.length}</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Charts Row 1 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Status Distribution Pie Chart */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <PieChartIcon className="w-4 h-4" />
                  Distribusi Status
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={statistics.statusDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                      nameKey="name"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {statistics.statusDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Jorong Distribution Bar Chart */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <BarChart3 className="w-4 h-4" />
                  Distribusi per Jorong
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={statistics.jorongDistribution}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" fontSize={11} />
                    <YAxis fontSize={11} />
                    <Tooltip />
                    <Bar dataKey="value" fill="#3b82f6" name="Jumlah" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Charts Row 2 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Year Trend Line Chart */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Activity className="w-4 h-4" />
                  Tren per Tahun
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={statistics.yearTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="tahun" fontSize={11} />
                    <YAxis fontSize={11} />
                    <Tooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="jumlah" 
                      stroke="#3b82f6" 
                      strokeWidth={2}
                      dot={{ fill: "#3b82f6", strokeWidth: 2 }}
                      name="Jumlah Data"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Status by Jorong Stacked Bar */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <BarChart3 className="w-4 h-4" />
                  Status per Jorong
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={statistics.statusByJorong}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="jorong" fontSize={10} />
                    <YAxis fontSize={11} />
                    <Tooltip />
                    <Legend />
                    {config.statusOptions.map((status, idx) => (
                      <Bar 
                        key={status} 
                        dataKey={status} 
                        stackId="a" 
                        fill={STATUS_COLORS[status] || CHART_COLORS[idx % CHART_COLORS.length]} 
                      />
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Status Summary Table */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Ringkasan Status</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-center">Jumlah</TableHead>
                      <TableHead className="text-center">Persentase</TableHead>
                      <TableHead>Progress</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {statistics.statusDistribution.map((item) => (
                      <TableRow key={item.name}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-3 h-3 rounded-full" 
                              style={{ backgroundColor: item.color }}
                            />
                            {item.name}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">{item.value}</TableCell>
                        <TableCell className="text-center">
                          {statistics.total > 0 ? ((item.value / statistics.total) * 100).toFixed(1) : 0}%
                        </TableCell>
                        <TableCell>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="h-2 rounded-full transition-all duration-300"
                              style={{
                                width: `${statistics.total > 0 ? (item.value / statistics.total) * 100 : 0}%`,
                                backgroundColor: item.color
                              }}
                            />
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Stunting Calculator - Only show for stunting type */}
          {type === "stunting" && (
            <Card className="border-2 border-blue-200 bg-blue-50/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-700">
                  <Calculator className="w-5 h-5" />
                  Kalkulator Stunting
                </CardTitle>
                <CardDescription>
                  Hitung status stunting berdasarkan standar WHO (TB/U)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                  <div className="space-y-2">
                    <Label>Usia (bulan)</Label>
                    <Input
                      type="number"
                      value={calcUsia}
                      onChange={(e) => setCalcUsia(parseInt(e.target.value) || 0)}
                      placeholder="Usia dalam bulan"
                      min={0}
                      max={60}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Tinggi Badan (cm)</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={calcTinggi}
                      onChange={(e) => setCalcTinggi(parseFloat(e.target.value) || 0)}
                      placeholder="Tinggi badan"
                      min={0}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Jenis Kelamin</Label>
                    <Select value={calcJenisKelamin} onValueChange={(v: "L" | "P") => setCalcJenisKelamin(v)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="L">Laki-laki</SelectItem>
                        <SelectItem value="P">Perempuan</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>&nbsp;</Label>
                    <Button onClick={handleCalculateStunting} className="w-full bg-blue-600 hover:bg-blue-700">
                      <Calculator className="w-4 h-4 mr-2" />
                      Hitung
                    </Button>
                  </div>
                </div>
                
                {calcResult && (
                  <div 
                    className="p-4 rounded-lg border-2 mt-4"
                    style={{ 
                      backgroundColor: `${calcResult.color}10`,
                      borderColor: calcResult.color 
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Hasil Perhitungan:</p>
                        <p className="text-2xl font-bold" style={{ color: calcResult.color }}>
                          {calcResult.status}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          Z-Score: {calcResult.zscore.toFixed(2)} SD
                        </p>
                      </div>
                      <div 
                        className="p-4 rounded-full"
                        style={{ backgroundColor: `${calcResult.color}20` }}
                      >
                        {calcResult.status === "Normal" ? (
                          <CheckCircle className="w-10 h-10" style={{ color: calcResult.color }} />
                        ) : (
                          <AlertTriangle className="w-10 h-10" style={{ color: calcResult.color }} />
                        )}
                      </div>
                    </div>
                    <div className="mt-4 text-sm text-gray-600">
                      <p className="font-medium mb-1">Interpretasi Z-Score:</p>
                      <ul className="list-disc list-inside space-y-1">
                        <li className="text-green-600">Normal: Z-Score ≥ -1 SD</li>
                        <li className="text-yellow-600">Risiko Stunting: -2 SD ≤ Z-Score &lt; -1 SD</li>
                        <li className="text-orange-600">Stunting Ringan: -3 SD ≤ Z-Score &lt; -2 SD</li>
                        <li className="text-red-600">Stunting Berat: Z-Score &lt; -3 SD</li>
                      </ul>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Tab Content - Analisis WHO (Stunting only) */}
      {activeTab === "analisis" && type === "stunting" && (
        <StuntingAnalysisDashboard />
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? "Edit Data" : "Tambah Data Baru"} - {config.title}
            </DialogTitle>
          </DialogHeader>
          
          {/* Dynamic Form based on type */}
          {type === "kemiskinan" && (
            <KemiskinanForm
              formData={formData as any}
              setFormData={setFormData as any}
              jorongList={jorongList}
              statusOptions={config.statusOptions}
            />
          )}
          {type === "stunting" && (
            <StuntingForm
              formData={formData as any}
              setFormData={setFormData as any}
              jorongList={jorongList}
              statusOptions={config.statusOptions}
            />
          )}
          {type === "kb" && (
            <KbForm
              formData={formData as any}
              setFormData={setFormData as any}
              jorongList={jorongList}
              statusOptions={config.statusOptions}
            />
          )}
          {type === "disabilitas" && (
            <DisabilitasForm
              formData={formData as any}
              setFormData={setFormData as any}
              jorongList={jorongList}
              statusOptions={config.statusOptions}
            />
          )}
          {type === "rtlh" && (
            <RtlhForm
              formData={formData as any}
              setFormData={setFormData as any}
              jorongList={jorongList}
              statusOptions={config.statusOptions}
            />
          )}
          {type === "putus-sekolah" && (
            <PutusSekolahForm
              formData={formData as any}
              setFormData={setFormData as any}
              jorongList={jorongList}
              statusOptions={config.statusOptions}
            />
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={saving}>
              Batal
            </Button>
            <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700" disabled={saving}>
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {editingItem ? "Simpan Perubahan" : "Tambah"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Konfirmasi Hapus</DialogTitle>
          </DialogHeader>
          <p className="text-gray-600 py-4">
            Apakah Anda yakin ingin menghapus data <strong>{deleteItem?.nama || deleteItem?.nama_anak || deleteItem?.nama_pemilik}</strong>?
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} disabled={saving}>
              Batal
            </Button>
            <Button onClick={handleConfirmDelete} variant="destructive" disabled={saving}>
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Hapus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Growth Analysis Dialog for Stunting */}
      <Dialog open={isAnalyzeDialogOpen} onOpenChange={setIsAnalyzeDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-green-600" />
              Analisis Pertumbuhan Anak (WHO LMS)
            </DialogTitle>
          </DialogHeader>
          
          {analyzingItem && (
            <div className="space-y-4">
              {/* Child Info */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-800 mb-2">Informasi Anak</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div><span className="text-gray-500">Nama:</span> <strong>{analyzingItem.nama_anak}</strong></div>
                  <div><span className="text-gray-500">NIK:</span> {analyzingItem.nik_anak || '-'}</div>
                  <div><span className="text-gray-500">Tanggal Lahir:</span> {analyzingItem.tanggal_lahir || '-'}</div>
                  <div><span className="text-gray-500">Jenis Kelamin:</span> {analyzingItem.jenis_kelamin === 'L' ? 'Laki-laki' : analyzingItem.jenis_kelamin === 'P' ? 'Perempuan' : '-'}</div>
                </div>
              </div>

              {/* Input Form */}
              <div className="border rounded-lg p-4">
                <h4 className="font-semibold mb-3">Data Pengukuran</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="analyze_tanggal">Tanggal Pengukuran *</Label>
                    <Input
                      id="analyze_tanggal"
                      type="date"
                      value={analyzeForm.tanggal_pengukuran}
                      onChange={(e) => setAnalyzeForm({ ...analyzeForm, tanggal_pengukuran: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="analyze_berat">Berat Badan (kg) *</Label>
                    <Input
                      id="analyze_berat"
                      type="number"
                      step="0.1"
                      min="0"
                      placeholder="contoh: 8.5"
                      value={analyzeForm.berat_kg}
                      onChange={(e) => setAnalyzeForm({ ...analyzeForm, berat_kg: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="analyze_tinggi">Tinggi/Panjang Badan (cm) *</Label>
                    <Input
                      id="analyze_tinggi"
                      type="number"
                      step="0.1"
                      min="0"
                      placeholder="contoh: 68.5"
                      value={analyzeForm.tinggi_cm}
                      onChange={(e) => setAnalyzeForm({ ...analyzeForm, tinggi_cm: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="analyze_lk">Lingkar Kepala (cm)</Label>
                    <Input
                      id="analyze_lk"
                      type="number"
                      step="0.1"
                      min="0"
                      placeholder="contoh: 42.0"
                      value={analyzeForm.lingkar_kepala_cm}
                      onChange={(e) => setAnalyzeForm({ ...analyzeForm, lingkar_kepala_cm: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="analyze_posyandu">Posyandu</Label>
                    <Input
                      id="analyze_posyandu"
                      placeholder="Nama Posyandu"
                      value={analyzeForm.posyandu}
                      onChange={(e) => setAnalyzeForm({ ...analyzeForm, posyandu: e.target.value })}
                    />
                  </div>
                </div>
                <div className="mt-4">
                  <Button 
                    onClick={handleAnalyzeGrowth} 
                    disabled={analyzing || !analyzeForm.tanggal_pengukuran || !analyzeForm.berat_kg || !analyzeForm.tinggi_cm}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {analyzing && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Analisis dengan WHO LMS
                  </Button>
                </div>
              </div>

              {/* Analysis Result */}
              {analysisResult && (
                <div className="border rounded-lg p-4 bg-gray-50">
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    Hasil Analisis WHO
                  </h4>
                  
                  {/* Age Info */}
                  <div className="mb-4 p-3 bg-white rounded-lg">
                    <div className="text-sm">
                      <span className="text-gray-500">Usia saat pengukuran:</span>{" "}
                      <strong>{analysisResult.analysis?.age_months || analysisResult.usia_bulan || 0} bulan</strong>
                    </div>
                  </div>

                  {/* Z-Score Results */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    {/* TB/U - Height for Age */}
                    <div className={`p-3 rounded-lg border ${
                      analysisResult.analysis?.height_for_age?.status === 'normal' ? 'bg-green-50 border-green-200' :
                      analysisResult.analysis?.height_for_age?.status === 'pendek' ? 'bg-yellow-50 border-yellow-200' :
                      analysisResult.analysis?.height_for_age?.status === 'sangat_pendek' ? 'bg-red-50 border-red-200' :
                      analysisResult.analysis?.height_for_age?.status === 'tinggi' ? 'bg-blue-50 border-blue-200' :
                      'bg-gray-50 border-gray-200'
                    }`}>
                      <div className="text-xs text-gray-500 mb-1">TB/U (Height for Age)</div>
                      <div className="font-bold text-lg">
                        Z: {analysisResult.analysis?.height_for_age?.z_score?.toFixed(2) || '-'}
                      </div>
                      <Badge variant={
                        analysisResult.analysis?.height_for_age?.status === 'normal' ? 'default' :
                        analysisResult.analysis?.height_for_age?.status === 'pendek' ? 'secondary' :
                        'destructive'
                      }>
                        {analysisResult.analysis?.height_for_age?.status?.replace('_', ' ').toUpperCase() || '-'}
                      </Badge>
                    </div>

                    {/* BB/U - Weight for Age */}
                    <div className={`p-3 rounded-lg border ${
                      analysisResult.analysis?.weight_for_age?.status === 'normal' ? 'bg-green-50 border-green-200' :
                      analysisResult.analysis?.weight_for_age?.status === 'kurang' ? 'bg-yellow-50 border-yellow-200' :
                      analysisResult.analysis?.weight_for_age?.status === 'sangat_kurang' ? 'bg-red-50 border-red-200' :
                      'bg-gray-50 border-gray-200'
                    }`}>
                      <div className="text-xs text-gray-500 mb-1">BB/U (Weight for Age)</div>
                      <div className="font-bold text-lg">
                        Z: {analysisResult.analysis?.weight_for_age?.z_score?.toFixed(2) || '-'}
                      </div>
                      <Badge variant={
                        analysisResult.analysis?.weight_for_age?.status === 'normal' ? 'default' :
                        analysisResult.analysis?.weight_for_age?.status === 'kurang' ? 'secondary' :
                        'destructive'
                      }>
                        {analysisResult.analysis?.weight_for_age?.status?.replace('_', ' ').toUpperCase() || '-'}
                      </Badge>
                    </div>

                    {/* BB/TB - Weight for Height */}
                    <div className={`p-3 rounded-lg border ${
                      analysisResult.analysis?.weight_for_height?.status === 'normal' ? 'bg-green-50 border-green-200' :
                      analysisResult.analysis?.weight_for_height?.status === 'kurus' ? 'bg-yellow-50 border-yellow-200' :
                      analysisResult.analysis?.weight_for_height?.status === 'sangat_kurus' ? 'bg-red-50 border-red-200' :
                      analysisResult.analysis?.weight_for_height?.status === 'gemuk' ? 'bg-orange-50 border-orange-200' :
                      'bg-gray-50 border-gray-200'
                    }`}>
                      <div className="text-xs text-gray-500 mb-1">BB/TB (Weight for Height)</div>
                      <div className="font-bold text-lg">
                        Z: {analysisResult.analysis?.weight_for_height?.z_score?.toFixed(2) || '-'}
                      </div>
                      <Badge variant={
                        analysisResult.analysis?.weight_for_height?.status === 'normal' ? 'default' :
                        analysisResult.analysis?.weight_for_height?.status === 'kurus' ? 'secondary' :
                        analysisResult.analysis?.weight_for_height?.status === 'gemuk' ? 'secondary' :
                        'destructive'
                      }>
                        {analysisResult.analysis?.weight_for_height?.status?.replace('_', ' ').toUpperCase() || '-'}
                      </Badge>
                    </div>

                    {/* IMT/U - BMI for Age */}
                    <div className={`p-3 rounded-lg border ${
                      analysisResult.analysis?.bmi_for_age?.status === 'normal' ? 'bg-green-50 border-green-200' :
                      analysisResult.analysis?.bmi_for_age?.status === 'kurus' ? 'bg-yellow-50 border-yellow-200' :
                      analysisResult.analysis?.bmi_for_age?.status === 'sangat_kurus' ? 'bg-red-50 border-red-200' :
                      analysisResult.analysis?.bmi_for_age?.status === 'gemuk' || analysisResult.analysis?.bmi_for_age?.status === 'obesitas' ? 'bg-orange-50 border-orange-200' :
                      'bg-gray-50 border-gray-200'
                    }`}>
                      <div className="text-xs text-gray-500 mb-1">IMT/U (BMI for Age)</div>
                      <div className="font-bold text-lg">
                        Z: {analysisResult.analysis?.bmi_for_age?.z_score?.toFixed(2) || '-'}
                      </div>
                      <div className="text-xs text-gray-400 mb-1">
                        IMT: {analysisResult.analysis?.bmi_for_age?.bmi?.toFixed(1) || '-'}
                      </div>
                      <Badge variant={
                        analysisResult.analysis?.bmi_for_age?.status === 'normal' ? 'default' :
                        analysisResult.analysis?.bmi_for_age?.status === 'kurus' ? 'secondary' :
                        analysisResult.analysis?.bmi_for_age?.status === 'gemuk' ? 'secondary' :
                        'destructive'
                      }>
                        {analysisResult.analysis?.bmi_for_age?.status?.replace('_', ' ').toUpperCase() || '-'}
                      </Badge>
                    </div>
                  </div>

                  {/* Recommendations */}
                  {analysisResult.recommendations && analysisResult.recommendations.length > 0 && (
                    <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                      <h5 className="font-semibold text-yellow-800 mb-2 flex items-center gap-1">
                        <AlertTriangle className="w-4 h-4" />
                        Rekomendasi
                      </h5>
                      <ul className="list-disc list-inside text-sm text-yellow-700 space-y-1">
                        {analysisResult.recommendations.map((rec: string, idx: number) => (
                          <li key={idx}>{rec}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Overall Status */}
                  {analysisResult.overall_status && (
                    <div className={`mt-4 p-3 rounded-lg text-center ${
                      analysisResult.overall_status === 'normal' ? 'bg-green-100 text-green-800' :
                      analysisResult.overall_status === 'perlu_perhatian' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      <span className="font-bold">Status Keseluruhan: </span>
                      {analysisResult.overall_status === 'normal' ? '✅ Normal' :
                       analysisResult.overall_status === 'perlu_perhatian' ? '⚠️ Perlu Perhatian' :
                       '🚨 Butuh Penanganan Segera'}
                    </div>
                  )}
                </div>
              )}

              {/* Growth History Chart */}
              <div className="border rounded-lg p-4">
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-blue-600" />
                  Grafik Pertumbuhan
                </h4>
                
                {loadingHistory ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                    <span className="ml-2 text-gray-500">Memuat riwayat...</span>
                  </div>
                ) : growthHistory.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>Belum ada riwayat pengukuran.</p>
                    <p className="text-sm">Lakukan analisis untuk mulai mencatat pertumbuhan anak.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Chart Tabs */}
                    <div className="flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        variant={activeChartTab === "hfa" ? "default" : "outline"}
                        onClick={() => setActiveChartTab("hfa")}
                        className={activeChartTab === "hfa" ? "bg-blue-600" : ""}
                      >
                        TB/U
                      </Button>
                      <Button
                        size="sm"
                        variant={activeChartTab === "wfa" ? "default" : "outline"}
                        onClick={() => setActiveChartTab("wfa")}
                        className={activeChartTab === "wfa" ? "bg-green-600" : ""}
                      >
                        BB/U
                      </Button>
                      <Button
                        size="sm"
                        variant={activeChartTab === "wfh" ? "default" : "outline"}
                        onClick={() => setActiveChartTab("wfh")}
                        className={activeChartTab === "wfh" ? "bg-purple-600" : ""}
                      >
                        BB/TB
                      </Button>
                      <Button
                        size="sm"
                        variant={activeChartTab === "bfa" ? "default" : "outline"}
                        onClick={() => setActiveChartTab("bfa")}
                        className={activeChartTab === "bfa" ? "bg-orange-600" : ""}
                      >
                        IMT/U
                      </Button>
                    </div>

                    {/* Chart */}
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={growthHistory.map((h: any) => ({
                            usia: h.age_months || h.usia_bulan,
                            tanggal: h.tanggal_pengukuran,
                            tinggi: h.tinggi_cm,
                            berat: h.berat_kg,
                            bmi: h.bmi,
                            z_hfa: h.z_score_hfa,
                            z_wfa: h.z_score_wfa,
                            z_wfh: h.z_score_wfh,
                            z_bfa: h.z_score_bfa,
                          })).sort((a: any, b: any) => a.usia - b.usia)}
                          margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis 
                            dataKey="usia" 
                            label={{ value: 'Usia (bulan)', position: 'bottom', offset: -5 }}
                          />
                          <YAxis 
                            label={{ 
                              value: activeChartTab === "hfa" ? 'Tinggi (cm)' : 
                                     activeChartTab === "wfa" ? 'Berat (kg)' :
                                     activeChartTab === "wfh" ? 'Berat (kg)' : 'IMT',
                              angle: -90, 
                              position: 'insideLeft' 
                            }}
                          />
                          <Tooltip 
                            formatter={(value: any, name: string) => {
                              if (name === 'tinggi') return [`${value} cm`, 'Tinggi'];
                              if (name === 'berat') return [`${value} kg`, 'Berat'];
                              if (name === 'bmi') return [value?.toFixed(1), 'IMT'];
                              if (name.startsWith('z_')) return [value?.toFixed(2), 'Z-Score'];
                              return [value, name];
                            }}
                            labelFormatter={(label) => `Usia: ${label} bulan`}
                          />
                          <Legend />
                          
                          {/* Reference lines for Z-score thresholds */}
                          <ReferenceLine y={-2} stroke="#f59e0b" strokeDasharray="5 5" label="-2 SD" />
                          <ReferenceLine y={-3} stroke="#ef4444" strokeDasharray="5 5" label="-3 SD" />
                          
                          {activeChartTab === "hfa" && (
                            <>
                              <Line 
                                type="monotone" 
                                dataKey="tinggi" 
                                stroke="#3b82f6" 
                                strokeWidth={2}
                                dot={{ fill: '#3b82f6', r: 4 }}
                                name="Tinggi Badan"
                              />
                              <Line 
                                type="monotone" 
                                dataKey="z_hfa" 
                                stroke="#93c5fd" 
                                strokeWidth={1}
                                strokeDasharray="3 3"
                                dot={{ fill: '#93c5fd', r: 3 }}
                                name="Z-Score TB/U"
                                yAxisId="right"
                              />
                            </>
                          )}
                          
                          {activeChartTab === "wfa" && (
                            <>
                              <Line 
                                type="monotone" 
                                dataKey="berat" 
                                stroke="#22c55e" 
                                strokeWidth={2}
                                dot={{ fill: '#22c55e', r: 4 }}
                                name="Berat Badan"
                              />
                              <Line 
                                type="monotone" 
                                dataKey="z_wfa" 
                                stroke="#86efac" 
                                strokeWidth={1}
                                strokeDasharray="3 3"
                                dot={{ fill: '#86efac', r: 3 }}
                                name="Z-Score BB/U"
                                yAxisId="right"
                              />
                            </>
                          )}
                          
                          {activeChartTab === "wfh" && (
                            <>
                              <Line 
                                type="monotone" 
                                dataKey="berat" 
                                stroke="#a855f7" 
                                strokeWidth={2}
                                dot={{ fill: '#a855f7', r: 4 }}
                                name="Berat Badan"
                              />
                              <Line 
                                type="monotone" 
                                dataKey="z_wfh" 
                                stroke="#d8b4fe" 
                                strokeWidth={1}
                                strokeDasharray="3 3"
                                dot={{ fill: '#d8b4fe', r: 3 }}
                                name="Z-Score BB/TB"
                                yAxisId="right"
                              />
                            </>
                          )}
                          
                          {activeChartTab === "bfa" && (
                            <>
                              <Line 
                                type="monotone" 
                                dataKey="bmi" 
                                stroke="#f97316" 
                                strokeWidth={2}
                                dot={{ fill: '#f97316', r: 4 }}
                                name="IMT"
                              />
                              <Line 
                                type="monotone" 
                                dataKey="z_bfa" 
                                stroke="#fdba74" 
                                strokeWidth={1}
                                strokeDasharray="3 3"
                                dot={{ fill: '#fdba74', r: 3 }}
                                name="Z-Score IMT/U"
                                yAxisId="right"
                              />
                            </>
                          )}
                          
                          <YAxis 
                            yAxisId="right" 
                            orientation="right"
                            domain={[-4, 4]}
                            label={{ value: 'Z-Score', angle: 90, position: 'insideRight' }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>

                    {/* History Table */}
                    <div className="mt-4">
                      <h5 className="text-sm font-semibold mb-2">Riwayat Pengukuran</h5>
                      <div className="max-h-40 overflow-y-auto">
                        <table className="w-full text-xs">
                          <thead className="bg-gray-100 sticky top-0">
                            <tr>
                              <th className="px-2 py-1 text-left">Tanggal</th>
                              <th className="px-2 py-1 text-center">Usia</th>
                              <th className="px-2 py-1 text-center">BB (kg)</th>
                              <th className="px-2 py-1 text-center">TB (cm)</th>
                              <th className="px-2 py-1 text-center">Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {growthHistory.map((h: any, idx: number) => (
                              <tr key={idx} className="border-b hover:bg-gray-50">
                                <td className="px-2 py-1">{h.tanggal_pengukuran}</td>
                                <td className="px-2 py-1 text-center">{h.age_months || h.usia_bulan} bln</td>
                                <td className="px-2 py-1 text-center">{h.berat_kg}</td>
                                <td className="px-2 py-1 text-center">{h.tinggi_cm}</td>
                                <td className="px-2 py-1 text-center">
                                  <Badge 
                                    variant={
                                      h.status_hfa === 'normal' ? 'default' :
                                      h.status_hfa === 'pendek' ? 'secondary' :
                                      'destructive'
                                    }
                                    className="text-xs"
                                  >
                                    {h.status_hfa?.replace('_', ' ') || '-'}
                                  </Badge>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAnalyzeDialogOpen(false)}>
              Tutup
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Detail Dialog - hanya tampilkan jika tidak ada onViewDetail callback */}
      {!onViewDetail && (
        <SocialDataDetailDialog
          open={isDetailDialogOpen}
          onOpenChange={(open) => {
            setIsDetailDialogOpen(open);
            if (!open) setDetailItem(null);
          }}
          item={detailItem}
          type={type}
          config={config}
        />
      )}
    </div>
  );
}
