import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Label } from "../ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { ScrollArea } from "../ui/scroll-area";
import {
  Syringe,
  Search,
  Plus,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  Clock,
  AlertCircle,
  Baby,
  History,
  FileText,
  Calendar,
  RefreshCw,
  Loader2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import posyanduService, { Imunisasi, ImunisasiStatus } from "@/services/posyanduService";
import apiClient from "@/services/apiClient";

interface DataImunisasi extends Omit<Imunisasi, 'status' | 'histori'> {
  nama_anak?: string;
  nik_anak?: string;
  usia_bulan?: number;
  status?: string;
  histori?: Imunisasi[];
  // Legacy field aliases
  petugas?: string;
  batch_number?: string;
}

interface KaderImunisasiProps {
  userRole: string;
  embedded?: boolean;
}

const KaderImunisasi: React.FC<KaderImunisasiProps> = ({ userRole, embedded }) => {
  const [data, setData] = useState<DataImunisasi[]>([]);
  const [sasaranData, setSasaranData] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'sasaran' | 'riwayat'>('sasaran');
  const [loading, setLoading] = useState(true);
  const [loadingSasaran, setLoadingSasaran] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [showFormDialog, setShowFormDialog] = useState(false);
  const [selectedData, setSelectedData] = useState<DataImunisasi | null>(null);
  const [editingData, setEditingData] = useState<DataImunisasi | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [imunisasiStatus, setImunisasiStatus] = useState<ImunisasiStatus | null>(null);
  const [loadingStatus, setLoadingStatus] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [statistics, setStatistics] = useState<{
    total_pemberian: number;
    diberikan: number;
    kipi: number;
    sasaran: { total_anak: number; idl: number; idl_percentage: number };
  } | null>(null);
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 15,
    total: 0,
  });
  const [sasaranPagination, setSasaranPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 50,
    total: 0,
  });
  
  // Form state
  const [formData, setFormData] = useState({
    warga_id: 0,
    jenis_imunisasi: '',
    tanggal_pemberian: '',
    posyandu: '',
    tempat_pemberian: '',
    nama_petugas: '',
    batch_vaksin: '',
    status: 'Diberikan',
    catatan: '',
  });
  
  // Warga (anak) selection state
  const [searchNik, setSearchNik] = useState('');
  const [searchingWarga, setSearchingWarga] = useState(false);
  const [selectedWarga, setSelectedWarga] = useState<{
    id: number;
    nama: string;
    nik: string;
    tanggal_lahir?: string;
    alamat?: string;
    jorong?: string;
  } | null>(null);

  // Search warga by NIK
  const handleSearchWarga = async () => {
    if (!searchNik || searchNik.length < 16) {
      toast.error('NIK harus 16 digit');
      return;
    }
    setSearchingWarga(true);
    try {
      const response = await apiClient.get(`/wargas/nik/${searchNik}`);
      if (response.success && response.data) {
        setSelectedWarga(response.data);
        setFormData(prev => ({ ...prev, warga_id: response.data.id }));
        toast.success('Anak ditemukan');
      } else {
        setSelectedWarga(null);
        toast.error('Data anak tidak ditemukan');
      }
    } catch (error) {
      console.error('Error searching warga:', error);
      setSelectedWarga(null);
      toast.error('Data anak tidak ditemukan');
    } finally {
      setSearchingWarga(false);
    }
  };

  const clearSelectedWarga = () => {
    setSelectedWarga(null);
    setSearchNik('');
    setFormData(prev => ({ ...prev, warga_id: 0 }));
  };

  // Load statistics from API
  const loadStatistics = useCallback(async () => {
    try {
      const stats = await posyanduService.getImunisasiStatistics({ tahun: new Date().getFullYear() });
      setStatistics(stats as any);
    } catch (err) {
      console.error('Failed to load statistics:', err);
    }
  }, []);

  // Load data from API
  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await posyanduService.getImunisasi({
        page: pagination.current_page,
        per_page: pagination.per_page,
        ...(searchQuery ? { search: searchQuery } : {}),
      });
      
      // Transform API response to component format
      const dataArray = response.data || response || [];
      const transformedData: DataImunisasi[] = (Array.isArray(dataArray) ? dataArray : []).map((item: Imunisasi) => ({
        ...item,
        nama_anak: item.warga?.nama || item.nama_anak || 'N/A',
        nik_anak: item.warga?.nik || 'N/A',
        usia_bulan: item.usia_bulan,
      }));
      
      setData(transformedData);
      setPagination({
        current_page: response.current_page,
        last_page: response.last_page,
        per_page: response.per_page,
        total: response.total,
      });
    } catch (err: any) {
      console.error('Failed to load imunisasi data:', err);
      setError(err.message || 'Gagal memuat data imunisasi');
      toast.error('Gagal memuat data imunisasi');
    } finally {
      setLoading(false);
    }
  }, [pagination.current_page, pagination.per_page, searchQuery]);

  // Load sasaran imunisasi (anak 0-18 bulan)
  const loadSasaran = useCallback(async () => {
    setLoadingSasaran(true);
    try {
      const response = await apiClient.get('/imunisasi/sasaran', {
        page: sasaranPagination.current_page,
        per_page: 50, // Load more to show all sasaran
        usia_max_bulan: 18,
        ...(searchQuery ? { search: searchQuery } : {}),
      });
      
      // Response structure: { success: true, data: { data: [...], current_page, last_page, ... } }
      const paginatedData = response.data || response;
      const dataArray = paginatedData.data || paginatedData || [];
      
      // Calculate age for each child
      const transformedData = (Array.isArray(dataArray) ? dataArray : []).map((warga: any) => {
        const birthDate = warga.tanggal_lahir ? new Date(warga.tanggal_lahir) : null;
        const usiaBulan = birthDate 
          ? Math.floor((new Date().getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24 * 30.44))
          : 0;
        return {
          ...warga,
          usia_bulan: usiaBulan,
        };
      });
      
      setSasaranData(transformedData);
      setSasaranPagination({
        current_page: paginatedData.current_page || 1,
        last_page: paginatedData.last_page || 1,
        per_page: paginatedData.per_page || 50,
        total: paginatedData.total || transformedData.length,
      });
    } catch (err: any) {
      console.error('Failed to load sasaran data:', err);
      toast.error('Gagal memuat data sasaran imunisasi');
    } finally {
      setLoadingSasaran(false);
    }
  }, [sasaranPagination.current_page, searchQuery]);

  useEffect(() => {
    loadData();
    loadSasaran();
    loadStatistics();
  }, [loadData, loadSasaran, loadStatistics]);

  // Load imunisasi status for selected warga
  const loadImunisasiStatus = async (wargaId: number) => {
    if (!wargaId || wargaId === 0) {
      setImunisasiStatus(null);
      return;
    }
    setLoadingStatus(true);
    try {
      const status = await posyanduService.getImunisasiStatusWarga(wargaId);
      setImunisasiStatus(status);
    } catch (err) {
      console.error('Gagal memuat status imunisasi:', err);
      setImunisasiStatus(null);
    } finally {
      setLoadingStatus(false);
    }
  };

  const handleViewDetail = async (item: DataImunisasi) => {
    setSelectedData(item);
    setImunisasiStatus(null); // Reset status sebelumnya
    setShowDetailDialog(true);
    if (item.warga_id && item.warga_id > 0) {
      await loadImunisasiStatus(item.warga_id);
    }
  };

  const handleRefresh = () => {
    loadData();
  };

  const handleAdd = () => {
    setEditingData(null);
    setFormData({
      warga_id: 0,
      jenis_imunisasi: '',
      tanggal_pemberian: '',
      posyandu: '',
      tempat_pemberian: '',
      nama_petugas: '',
      batch_vaksin: '',
      status: 'Diberikan',
      catatan: '',
    });
    setSelectedWarga(null);
    setSearchNik('');
    setShowFormDialog(true);
  };

  const handleEdit = (item: DataImunisasi) => {
    setEditingData(item);
    setFormData({
      warga_id: item.warga_id || 0,
      jenis_imunisasi: item.jenis_imunisasi || '',
      tanggal_pemberian: item.tanggal_pemberian || item.tanggal_imunisasi || '',
      posyandu: (item as any).posyandu || '',
      tempat_pemberian: (item as any).tempat_pemberian || '',
      nama_petugas: (item as any).nama_petugas || item.petugas || '',
      batch_vaksin: (item as any).batch_vaksin || item.batch_number || '',
      status: (item as any).status || 'Diberikan',
      catatan: item.catatan || '',
    });
    // Set selected warga from existing data
    if (item.warga_id && item.warga) {
      setSelectedWarga({
        id: item.warga_id,
        nama: item.warga.nama,
        nik: item.warga.nik,
        tanggal_lahir: item.warga.tanggal_lahir,
      });
    } else if (item.warga_id) {
      setSelectedWarga({
        id: item.warga_id,
        nama: item.nama_anak || 'N/A',
        nik: item.nik_anak || 'N/A',
        tanggal_lahir: item.tanggal_lahir,
      });
    }
    setShowFormDialog(true);
  };

  const handleSubmit = async () => {
    if (!formData.warga_id || formData.warga_id === 0) {
      toast.error('Pilih data anak terlebih dahulu');
      return;
    }
    if (!formData.jenis_imunisasi || !formData.tanggal_pemberian) {
      toast.error('Jenis imunisasi dan tanggal wajib diisi');
      return;
    }

    setSubmitting(true);
    try {
      // Prepare clean payload for API
      const payload = {
        warga_id: formData.warga_id,
        jenis_imunisasi: formData.jenis_imunisasi,
        kategori: formData.kategori || null,
        tanggal_pemberian: formData.tanggal_pemberian,
        posyandu: formData.posyandu || null,
        tempat_pemberian: formData.tempat_pemberian || null,
        nama_petugas: formData.nama_petugas || null,
        batch_vaksin: formData.batch_vaksin || null,
        status: formData.status || 'Diberikan',
        catatan: formData.catatan || null,
      };

      if (editingData) {
        await posyanduService.updateImunisasi(editingData.id, payload);
        toast.success('Data imunisasi berhasil diperbarui');
      } else {
        await posyanduService.createImunisasi(payload);
        toast.success('Data imunisasi berhasil ditambahkan');
      }
      setShowFormDialog(false);
      setFormData({
        warga_id: 0,
        jenis_imunisasi: '',
        kategori: 'Dasar',
        tanggal_pemberian: '',
        posyandu: '',
        tempat_pemberian: '',
        nama_petugas: '',
        batch_vaksin: '',
        status: 'Diberikan',
        catatan: '',
      });
      setSelectedWarga(null);
      setSearchNik('');
      loadData();
    } catch (err: any) {
      console.error('Failed to save imunisasi:', err);
      toast.error('Gagal menyimpan data: ' + (err.message || 'Unknown error'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Apakah Anda yakin ingin menghapus data ini?')) return;
    
    try {
      await posyanduService.deleteImunisasi(id);
      toast.success('Data berhasil dihapus');
      loadData();
    } catch (err: any) {
      toast.error(err.message || 'Gagal menghapus data');
    }
  };

  const getStatusBadge = (item: DataImunisasi) => {
    // Determine status from imunisasi_lengkap if available
    if (imunisasiStatus?.imunisasi_lengkap) {
      return <Badge className="bg-green-100 text-green-800">Lengkap</Badge>;
    }
    return <Badge className="bg-yellow-100 text-yellow-800">Sebagian</Badge>;
  };

  const getItemStatusBadge = (status?: string) => {
    switch (status) {
      case "Diberikan":
        return (
          <Badge className="bg-green-100 text-green-800">
            <CheckCircle className="h-3 w-3 mr-1" />
            Diberikan
          </Badge>
        );
      case "Ditunda":
        return (
          <Badge className="bg-yellow-100 text-yellow-800">
            <Clock className="h-3 w-3 mr-1" />
            Ditunda
          </Badge>
        );
      case "Tidak Diberikan":
        return (
          <Badge className="bg-red-100 text-red-800">
            <AlertCircle className="h-3 w-3 mr-1" />
            Tidak Diberikan
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status || '-'}</Badge>;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Data Imunisasi</h1>
          <p className="text-muted-foreground">
            Pantau data imunisasi anak di wilayah Anda
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRefresh} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={handleAdd}>
            <Plus className="h-4 w-4 mr-2" />
            Tambah Data
          </Button>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="py-4">
            <p className="text-red-600">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pemberian</CardTitle>
            <Syringe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics?.total_pemberian ?? pagination.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sasaran Anak</CardTitle>
            <Baby className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {sasaranPagination.total || statistics?.sasaran?.total_anak || 0}
            </div>
            <p className="text-xs text-muted-foreground">Usia 0-18 bulan</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">IDL (Lengkap)</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {statistics?.sasaran?.idl ?? 0}
            </div>
            <p className="text-xs text-muted-foreground">{statistics?.sasaran?.idl_percentage ?? 0}% dari sasaran</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Belum Lengkap</CardTitle>
            <AlertCircle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {(statistics?.sasaran?.total_anak ?? 0) - (statistics?.sasaran?.idl ?? 0)}
            </div>
            <p className="text-xs text-muted-foreground">Perlu dilengkapi</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content with Tabs */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'sasaran' | 'riwayat')} className="w-full">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between w-full">
                <TabsList>
                  <TabsTrigger value="sasaran" className="flex items-center gap-2">
                    <Baby className="h-4 w-4" />
                    Sasaran Imunisasi
                  </TabsTrigger>
                  <TabsTrigger value="riwayat" className="flex items-center gap-2">
                    <History className="h-4 w-4" />
                    Riwayat Pemberian
                  </TabsTrigger>
                </TabsList>
                <div className="relative w-full md:w-64">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Cari nama atau NIK..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent>
          {activeTab === 'sasaran' ? (
            /* Sasaran Imunisasi - Anak 0-18 bulan */
            loadingSasaran ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : sasaranData.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Baby className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Tidak ada anak usia 0-18 bulan</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nama Anak</TableHead>
                    <TableHead>Usia</TableHead>
                    <TableHead>Alamat</TableHead>
                    <TableHead>Status Imunisasi</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sasaranData.map((anak) => {
                    const status = anak.imunisasi_status;
                    const isLengkap = status?.is_lengkap || false;
                    const sudahImunisasi = anak.imunisasi?.length || 0;
                    
                    return (
                      <TableRow key={anak.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{anak.nama}</div>
                            <div className="text-sm text-muted-foreground">
                              NIK: {anak.nik || 'N/A'}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-blue-50">
                            {anak.usia_bulan} bulan
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">{anak.jorong || '-'}</div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {isLengkap ? (
                              <Badge className="bg-green-100 text-green-700 border-green-200">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Lengkap
                              </Badge>
                            ) : sudahImunisasi > 0 ? (
                              <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">
                                <Clock className="h-3 w-3 mr-1" />
                                {sudahImunisasi} imunisasi
                              </Badge>
                            ) : (
                              <Badge className="bg-gray-100 text-gray-600 border-gray-200">
                                <AlertCircle className="h-3 w-3 mr-1" />
                                Belum ada
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedWarga({
                                  id: anak.id,
                                  nama: anak.nama,
                                  nik: anak.nik,
                                  tanggal_lahir: anak.tanggal_lahir,
                                  alamat: anak.alamat,
                                  jorong: anak.jorong,
                                });
                                setFormData(prev => ({ ...prev, warga_id: anak.id }));
                                setEditingData(null);
                                setShowFormDialog(true);
                              }}
                              title="Tambah Imunisasi"
                              className="text-teal-600 hover:text-teal-700"
                            >
                              <Plus className="h-4 w-4 mr-1" />
                              Imunisasi
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={async () => {
                                setSelectedData({
                                  id: 0,
                                  warga_id: anak.id,
                                  nama_anak: anak.nama,
                                  nik_anak: anak.nik,
                                  warga: anak,
                                } as DataImunisasi);
                                setShowDetailDialog(true);
                                await loadImunisasiStatus(anak.id);
                              }}
                              title="Lihat Histori"
                            >
                              <History className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )
          ) : (
            /* Riwayat Pemberian Imunisasi */
            loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : data.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Syringe className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Belum ada data imunisasi</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nama Anak</TableHead>
                    <TableHead>Tanggal Pemberian</TableHead>
                    <TableHead>Usia</TableHead>
                    <TableHead>Jenis Imunisasi</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{item.nama_anak || item.warga?.nama || 'N/A'}</div>
                          <div className="text-sm text-muted-foreground">
                            NIK: {item.nik_anak || item.warga?.nik || 'N/A'}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{item.tanggal_pemberian || item.tanggal_imunisasi || '-'}</TableCell>
                      <TableCell>{item.usia_saat_imunisasi_bulan || item.usia_bulan || '-'} bulan</TableCell>
                      <TableCell>
                        <div className="max-w-[200px] truncate" title={item.jenis_imunisasi}>
                          {item.jenis_imunisasi}
                        </div>
                      </TableCell>
                      <TableCell>{getItemStatusBadge(item.status)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewDetail(item)}
                            title="Lihat Detail & Histori"
                          >
                            <History className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleEdit(item)} title="Edit">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDelete(item.id)} title="Hapus" className="text-red-500 hover:text-red-700">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )
          )}
        </CardContent>
      </Card>

      {/* Detail Dialog dengan Histori */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Syringe className="h-5 w-5 text-teal-500" />
              Detail Imunisasi
            </DialogTitle>
            <DialogDescription>
              Informasi lengkap data imunisasi anak dan histori pemberian
            </DialogDescription>
          </DialogHeader>
          {selectedData && (
            <Tabs defaultValue="info" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="info" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Informasi
                </TabsTrigger>
                <TabsTrigger value="histori" className="flex items-center gap-2">
                  <History className="h-4 w-4" />
                  Histori Imunisasi ({selectedData.histori?.length || 0})
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="info" className="mt-4">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-muted-foreground">Nama Anak</Label>
                      <p className="font-medium">{selectedData.nama_anak}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">NIK</Label>
                      <p className="font-medium">{selectedData.nik_anak}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Tanggal Lahir</Label>
                      <p className="font-medium">{selectedData.tanggal_lahir}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Usia</Label>
                      <p className="font-medium">{selectedData.usia_bulan} bulan</p>
                    </div>
                    <div className="col-span-2">
                      <Label className="text-muted-foreground">Jenis Imunisasi yang Sudah Diberikan</Label>
                      <p className="font-medium">{selectedData.jenis_imunisasi}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Tanggal Pemberian Terakhir</Label>
                      <p className="font-medium">{selectedData.tanggal_pemberian || selectedData.tanggal_imunisasi}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Status</Label>
                      <div className="mt-1">{getItemStatusBadge(selectedData.status)}</div>
                    </div>
                  </div>
                  {selectedData.catatan && (
                    <div>
                      <Label className="text-muted-foreground">Catatan</Label>
                      <p className="mt-1 p-3 bg-gray-50 rounded-lg text-sm">
                        {selectedData.catatan}
                      </p>
                    </div>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="histori" className="mt-4">
                <ScrollArea className="h-[400px] pr-4">
                  {loadingStatus ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    </div>
                  ) : imunisasiStatus?.riwayat && imunisasiStatus.riwayat.length > 0 ? (
                    <div className="space-y-4">
                      {imunisasiStatus.riwayat.map((h, index) => (
                        <Card key={h.id} className={index === 0 ? "border-teal-200 bg-teal-50/50" : ""}>
                          <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <span className="font-semibold">{h.tanggal_pemberian || h.tanggal_imunisasi}</span>
                                {index === 0 && (
                                  <Badge className="bg-teal-100 text-teal-700">Terbaru</Badge>
                                )}
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent className="pt-2">
                            <div className="space-y-3 text-sm">
                              <div className="flex items-start gap-2">
                                <Syringe className="h-4 w-4 text-teal-500 mt-0.5" />
                                <div>
                                  <span className="font-medium">{h.jenis_imunisasi}</span>
                                  {h.kategori && (
                                    <span className="ml-2 text-muted-foreground">({h.kategori})</span>
                                  )}
                                </div>
                              </div>
                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <span className="text-muted-foreground">Tempat:</span>
                                  <span className="ml-1 font-medium">{h.tempat_pemberian || h.posyandu || '-'}</span>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">Batch:</span>
                                  <span className="ml-1 font-medium">{h.batch_vaksin || '-'}</span>
                                </div>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Status:</span>
                                <span className="ml-1">{getItemStatusBadge(h.status)}</span>
                              </div>
                              <div className="pt-2 border-t">
                                <span className="text-muted-foreground">Petugas:</span>
                                <span className="ml-1 font-medium">{h.nama_petugas || '-'}</span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                      <History className="h-12 w-12 mb-2 opacity-50" />
                      <p>Belum ada histori imunisasi</p>
                    </div>
                  )}
                </ScrollArea>
              </TabsContent>
            </Tabs>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDetailDialog(false)}>
              Tutup
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Form Dialog untuk Tambah/Edit */}
      <Dialog open={showFormDialog} onOpenChange={setShowFormDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Syringe className="h-5 w-5 text-teal-500" />
              {editingData ? 'Edit Data Imunisasi' : 'Tambah Data Imunisasi'}
            </DialogTitle>
            <DialogDescription>
              {editingData ? 'Perbarui informasi imunisasi' : 'Tambah data imunisasi baru'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {/* Warga (Anak) Selection */}
            <div className="space-y-2">
              <Label>Data Anak *</Label>
              {selectedWarga ? (
                <div className="p-3 border rounded-lg bg-green-50 border-green-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <div>
                        <p className="font-medium text-green-800">{selectedWarga.nama}</p>
                        <p className="text-sm text-green-600">
                          NIK: {selectedWarga.nik} | Lahir: {selectedWarga.tanggal_lahir}
                        </p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={clearSelectedWarga}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Masukkan NIK anak..."
                      value={searchNik}
                      onChange={(e) => setSearchNik(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSearchWarga()}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleSearchWarga}
                      disabled={searchingWarga || !searchNik}
                    >
                      {searchingWarga ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Search className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">Cari data anak berdasarkan NIK</p>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="jenis_imunisasi">Jenis Imunisasi *</Label>
              <select
                id="jenis_imunisasi"
                className="w-full p-2 border rounded-md"
                value={formData.jenis_imunisasi}
                onChange={(e) => setFormData({ ...formData, jenis_imunisasi: e.target.value })}
              >
                <option value="">Pilih jenis imunisasi</option>
                <option value="HB-0">Hepatitis B 0 (HB-0)</option>
                <option value="BCG">BCG</option>
                <option value="Polio-1">Polio 1</option>
                <option value="Polio-2">Polio 2</option>
                <option value="Polio-3">Polio 3</option>
                <option value="Polio-4">Polio 4</option>
                <option value="DPT-HB-Hib-1">DPT-HB-Hib 1</option>
                <option value="DPT-HB-Hib-2">DPT-HB-Hib 2</option>
                <option value="DPT-HB-Hib-3">DPT-HB-Hib 3</option>
                <option value="DPT-HB-Hib-4">DPT-HB-Hib 4 (Lanjutan)</option>
                <option value="IPV">IPV</option>
                <option value="Campak-MR-1">Campak-MR 1</option>
                <option value="Campak-MR-2">Campak-MR 2 (Lanjutan)</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="tanggal_pemberian">Tanggal Pemberian *</Label>
              <Input
                id="tanggal_pemberian"
                type="date"
                value={formData.tanggal_pemberian}
                onChange={(e) => setFormData({ ...formData, tanggal_pemberian: e.target.value })}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="posyandu">Posyandu</Label>
                <Input
                  id="posyandu"
                  value={formData.posyandu}
                  onChange={(e) => setFormData({ ...formData, posyandu: e.target.value })}
                  placeholder="Nama Posyandu"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tempat_pemberian">Tempat Pemberian</Label>
                <Input
                  id="tempat_pemberian"
                  value={formData.tempat_pemberian}
                  onChange={(e) => setFormData({ ...formData, tempat_pemberian: e.target.value })}
                  placeholder="Puskesmas / Posyandu"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="batch_vaksin">Batch Vaksin</Label>
                <Input
                  id="batch_vaksin"
                  value={formData.batch_vaksin}
                  onChange={(e) => setFormData({ ...formData, batch_vaksin: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nama_petugas">Petugas</Label>
                <Input
                  id="nama_petugas"
                  value={formData.nama_petugas}
                  onChange={(e) => setFormData({ ...formData, nama_petugas: e.target.value })}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                className="w-full p-2 border rounded-md"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="Diberikan">Diberikan</option>
                <option value="Ditunda">Ditunda</option>
                <option value="Tidak Diberikan">Tidak Diberikan</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="catatan">Catatan</Label>
              <Input
                id="catatan"
                value={formData.catatan}
                onChange={(e) => setFormData({ ...formData, catatan: e.target.value })}
                placeholder="Catatan tambahan..."
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowFormDialog(false)} disabled={submitting}>
              Batal
            </Button>
            <Button onClick={handleSubmit} disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                'Simpan'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default KaderImunisasi;
