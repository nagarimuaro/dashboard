import { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  MapPin, 
  Plus, 
  Search, 
  MoreHorizontal, 
  Pencil, 
  Trash2, 
  Eye,
  Loader2,
  RefreshCw,
  AlertCircle,
  User,
  Phone,
  Mail,
  Home,
  Map,
  Users,
  BarChart3,
  FileText,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import jorongService, { 
  Jorong, 
  JorongFormData, 
  JorongStatistics 
} from '@/services/jorongService';
import apiClient from '@/services/apiClient';

// Simple Warga type for dropdown
interface WargaOption {
  id: number;
  nik: string;
  nama: string;
  alamat?: string;
  no_hp?: string;
}

export default function JorongManagement() {
  // State
  const [jorongs, setJorongs] = useState<Jorong[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [perPage] = useState(10);
  
  // Dialog states
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [selectedJorong, setSelectedJorong] = useState<Jorong | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  
  // Wali Jorong search
  const [wargaOptions, setWargaOptions] = useState<WargaOption[]>([]);
  const [wargaSearchQuery, setWargaSearchQuery] = useState('');
  const [loadingWarga, setLoadingWarga] = useState(false);
  
  // Form states
  const initialFormData: JorongFormData = {
    nama: '',
    kode: '',
    kepala_jorong: '',
    wali_jorong_id: null,
    alamat_kantor: '',
    telepon: '',
    email: '',
    tanggal_penetapan: '',
    nomor_sk: '',
    luas_wilayah: undefined,
    jumlah_rt: undefined,
    jumlah_rw: undefined,
    koordinat_lat: undefined,
    koordinat_lng: undefined,
    batas_utara: '',
    batas_selatan: '',
    batas_timur: '',
    batas_barat: '',
    keterangan: '',
    is_active: true,
  };
  
  const [formData, setFormData] = useState<JorongFormData>(initialFormData);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('umum');
  
  // Statistics state
  const [jorongStats, setJorongStats] = useState<JorongStatistics | null>(null);

  // Fetch jorongs
  const fetchJorongs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params: any = {
        page: currentPage,
        per_page: perPage,
      };
      
      if (searchQuery) params.search = searchQuery;
      if (statusFilter !== 'all') params.is_active = statusFilter === 'active';
      
      const response = await jorongService.getList(params);
      
      if (response.success && response.data) {
        const jorongData = response.data.data || [];
        setJorongs(jorongData);
        setTotalPages(response.data.last_page || 1);
        setTotal(response.data.total || jorongData.length);
      } else {
        setJorongs([]);
        setTotalPages(1);
        setTotal(0);
      }
    } catch (err: any) {
      setError(err.message || 'Gagal memuat data jorong');
      console.error('Failed to fetch jorongs:', err);
    } finally {
      setLoading(false);
    }
  }, [currentPage, perPage, searchQuery, statusFilter]);

  // Search warga for Wali Jorong dropdown
  const searchWarga = useCallback(async (query: string) => {
    if (query.length < 2) {
      setWargaOptions([]);
      return;
    }
    
    setLoadingWarga(true);
    try {
      const response = await apiClient.get('/wargas', { 
        search: query, 
        per_page: 10
      });
      
      // Handle berbagai format response
      let wargaList: any[] = [];
      if (response.data?.data?.data) {
        // Paginated response: { data: { data: [...] } }
        wargaList = response.data.data.data;
      } else if (response.data?.data && Array.isArray(response.data.data)) {
        // Direct array: { data: [...] }
        wargaList = response.data.data;
      } else if (Array.isArray(response.data)) {
        // Raw array
        wargaList = response.data;
      }
      
      const options = wargaList.map((w: any) => ({
        id: w.id,
        nik: w.nik,
        nama: w.nama,
        alamat: w.alamat,
        no_hp: w.no_hp,
      }));
      setWargaOptions(options);
    } catch (err) {
      console.error('Failed to search warga:', err);
      setWargaOptions([]);
    } finally {
      setLoadingWarga(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchJorongs();
  }, [fetchJorongs]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);
  
  // Debounced warga search
  useEffect(() => {
    const timer = setTimeout(() => {
      searchWarga(wargaSearchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [wargaSearchQuery, searchWarga]);

  // Reset form
  const resetForm = () => {
    setFormData(initialFormData);
    setFormError(null);
    setIsEditMode(false);
    setWargaOptions([]);
    setWargaSearchQuery('');
    setActiveTab('umum');
  };

  // Open add dialog
  const handleOpenAdd = () => {
    resetForm();
    setIsFormDialogOpen(true);
  };

  // Open edit dialog
  const handleOpenEdit = (jorong: Jorong) => {
    setSelectedJorong(jorong);
    setFormData({
      nama: jorong.nama,
      kode: jorong.kode || '',
      kepala_jorong: jorong.kepala_jorong || '',
      wali_jorong_id: jorong.wali_jorong_id,
      alamat_kantor: jorong.alamat_kantor || '',
      telepon: jorong.telepon || '',
      email: jorong.email || '',
      tanggal_penetapan: jorong.tanggal_penetapan || '',
      nomor_sk: jorong.nomor_sk || '',
      luas_wilayah: jorong.luas_wilayah ? parseFloat(jorong.luas_wilayah) : undefined,
      jumlah_rt: jorong.jumlah_rt || undefined,
      jumlah_rw: jorong.jumlah_rw || undefined,
      koordinat_lat: jorong.koordinat_lat ? parseFloat(jorong.koordinat_lat) : undefined,
      koordinat_lng: jorong.koordinat_lng ? parseFloat(jorong.koordinat_lng) : undefined,
      batas_utara: jorong.batas_utara || '',
      batas_selatan: jorong.batas_selatan || '',
      batas_timur: jorong.batas_timur || '',
      batas_barat: jorong.batas_barat || '',
      keterangan: jorong.keterangan || '',
      is_active: jorong.is_active,
    });
    // Populate wali jorong in dropdown if exists
    if (jorong.wali_jorong) {
      setWargaOptions([{
        id: jorong.wali_jorong.id,
        nik: jorong.wali_jorong.nik,
        nama: jorong.wali_jorong.nama,
        alamat: jorong.wali_jorong.alamat,
        no_hp: jorong.wali_jorong.no_hp,
      }]);
    }
    setIsEditMode(true);
    setIsFormDialogOpen(true);
  };

  // Open detail dialog
  const handleOpenDetail = async (jorong: Jorong) => {
    setSelectedJorong(jorong);
    setIsDetailDialogOpen(true);
    
    // Fetch statistics
    try {
      const response = await jorongService.getById(jorong.id);
      if (response.success && response.data.statistics) {
        setJorongStats(response.data.statistics);
      }
    } catch (err) {
      console.error('Failed to fetch jorong statistics:', err);
    }
  };

  // Open delete dialog
  const handleOpenDelete = (jorong: Jorong) => {
    setSelectedJorong(jorong);
    setIsDeleteDialogOpen(true);
  };

  // Handle form submit
  const handleSubmit = async () => {
    if (!formData.nama.trim()) {
      setFormError('Nama jorong wajib diisi');
      return;
    }

    // Check for duplicate name (client-side validation)
    const duplicateJorong = jorongs.find(
      j => j.nama.toLowerCase() === formData.nama.trim().toLowerCase() 
        && (!isEditMode || j.id !== selectedJorong?.id)
    );
    
    if (duplicateJorong) {
      setFormError(`Jorong "${formData.nama}" sudah ada. Silakan gunakan nama yang berbeda.`);
      return;
    }

    setFormLoading(true);
    setFormError(null);

    try {
      const submitData = { ...formData };
      
      // Clean up empty values
      if (!submitData.kode) delete submitData.kode;
      if (!submitData.kepala_jorong) delete submitData.kepala_jorong;
      if (!submitData.wali_jorong_id) submitData.wali_jorong_id = null;
      
      if (isEditMode && selectedJorong) {
        await jorongService.update(selectedJorong.id, submitData);
      } else {
        await jorongService.create(submitData);
      }

      setIsFormDialogOpen(false);
      resetForm();
      fetchJorongs();
    } catch (err: any) {
      // Handle Laravel validation errors
      let message = 'Gagal menyimpan data';
      
      if (err.response?.data?.message) {
        message = err.response.data.message;
      } else if (err.response?.data?.errors) {
        // Laravel validation errors object
        const errors = err.response.data.errors;
        const firstError = Object.values(errors)[0];
        message = Array.isArray(firstError) ? firstError[0] : firstError;
      } else if (err.message) {
        message = err.message;
      }
      
      // Check for duplicate key error
      if (message.includes('unique') || message.includes('Duplicate') || message.includes('sudah ada')) {
        message = `Jorong "${formData.nama}" sudah ada. Silakan gunakan nama yang berbeda.`;
      }
      
      setFormError(message);
    } finally {
      setFormLoading(false);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (!selectedJorong) return;

    try {
      const response = await jorongService.delete(selectedJorong.id);
      if (!response.success) {
        throw new Error(response.message);
      }
      setIsDeleteDialogOpen(false);
      setSelectedJorong(null);
      fetchJorongs();
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || 'Gagal menghapus jorong';
      alert(message);
    }
  };

  // Handle toggle active
  const handleToggleActive = async (jorong: Jorong) => {
    try {
      await jorongService.toggleActive(jorong.id, !jorong.is_active);
      fetchJorongs();
    } catch (err) {
      console.error('Failed to toggle active status:', err);
    }
  };

  // Select wali jorong
  const handleSelectWali = (warga: WargaOption) => {
    setFormData(prev => ({
      ...prev,
      wali_jorong_id: warga.id,
      kepala_jorong: warga.nama,
      telepon: warga.no_hp || prev.telepon,
    }));
    setWargaSearchQuery(warga.nama);
  };

  // Clear wali jorong
  const handleClearWali = () => {
    setFormData(prev => ({
      ...prev,
      wali_jorong_id: null,
    }));
    setWargaSearchQuery('');
    setWargaOptions([]);
  };

  // Summary stats
  const summaryStats = useMemo(() => {
    const aktif = jorongs.filter(j => j.is_active).length;
    const totalRT = jorongs.reduce((sum, j) => sum + (j.jumlah_rt || 0), 0);
    const totalRW = jorongs.reduce((sum, j) => sum + (j.jumlah_rw || 0), 0);
    return { aktif, totalRT, totalRW };
  }, [jorongs]);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <MapPin className="h-6 w-6" />
            Kelola Jorong
          </h1>
          <p className="text-muted-foreground mt-1">
            Kelola data jorong/dusun beserta wali jorong
          </p>
        </div>
        <Button onClick={handleOpenAdd} className="gap-2">
          <Plus className="h-4 w-4" />
          Tambah Jorong
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Jorong</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Jorong Aktif</CardTitle>
            <MapPin className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{summaryStats.aktif}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total RT</CardTitle>
            <Home className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summaryStats.totalRT}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total RW</CardTitle>
            <Home className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summaryStats.totalRW}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Cari jorong, kode, atau wali..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                <SelectItem value="active">Aktif</SelectItem>
                <SelectItem value="inactive">Tidak Aktif</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={fetchJorongs} className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="pt-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <AlertCircle className="h-12 w-12 text-destructive mb-4" />
              <p className="text-destructive font-medium">{error}</p>
              <Button variant="outline" onClick={fetchJorongs} className="mt-4">
                Coba Lagi
              </Button>
            </div>
          ) : jorongs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <MapPin className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Belum ada data jorong</p>
              <Button onClick={handleOpenAdd} className="mt-4">
                Tambah Jorong Pertama
              </Button>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16">Kode</TableHead>
                    <TableHead>Nama Jorong</TableHead>
                    <TableHead>Wali Jorong</TableHead>
                    <TableHead className="text-center">RT/RW</TableHead>
                    <TableHead>Kontak</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead className="w-16">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {jorongs.map((jorong) => (
                    <TableRow key={jorong.id}>
                      <TableCell className="font-mono text-sm">
                        {jorong.kode || '-'}
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{jorong.nama}</div>
                        {jorong.alamat_kantor && (
                          <div className="text-xs text-muted-foreground truncate max-w-48">
                            {jorong.alamat_kantor}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        {jorong.wali_jorong ? (
                          <div>
                            <div className="font-medium flex items-center gap-1">
                              <User className="h-3 w-3" />
                              {jorong.wali_jorong.nama}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              NIK: {jorong.wali_jorong.nik}
                            </div>
                          </div>
                        ) : jorong.kepala_jorong ? (
                          <div className="text-muted-foreground">{jorong.kepala_jorong}</div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="font-medium">{jorong.jumlah_rt || 0}</span>
                        <span className="text-muted-foreground"> / </span>
                        <span className="font-medium">{jorong.jumlah_rw || 0}</span>
                      </TableCell>
                      <TableCell>
                        {jorong.telepon && (
                          <div className="flex items-center gap-1 text-sm">
                            <Phone className="h-3 w-3 text-muted-foreground" />
                            {jorong.telepon}
                          </div>
                        )}
                        {jorong.email && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Mail className="h-3 w-3" />
                            {jorong.email}
                          </div>
                        )}
                        {!jorong.telepon && !jorong.email && '-'}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant={jorong.is_active ? 'default' : 'secondary'}>
                          {jorong.is_active ? 'Aktif' : 'Tidak Aktif'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleOpenDetail(jorong)}>
                              <Eye className="h-4 w-4 mr-2" />
                              Lihat Detail
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleOpenEdit(jorong)}>
                              <Pencil className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleToggleActive(jorong)}>
                              <MapPin className="h-4 w-4 mr-2" />
                              {jorong.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => handleOpenDelete(jorong)}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Hapus
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4 pt-4 border-t">
                  <p className="text-sm text-muted-foreground">
                    Halaman {currentPage} dari {totalPages} ({total} data)
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Form Dialog */}
      <Dialog open={isFormDialogOpen} onOpenChange={setIsFormDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isEditMode ? 'Edit Jorong' : 'Tambah Jorong Baru'}
            </DialogTitle>
            <DialogDescription>
              {isEditMode 
                ? 'Perbarui informasi jorong' 
                : 'Tambahkan jorong baru beserta data wali jorong'}
            </DialogDescription>
          </DialogHeader>

          {formError && (
            <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-md flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              {formError}
            </div>
          )}

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-1">
              <TabsTrigger value="umum">Data Jorong</TabsTrigger>
            </TabsList>
            
            <TabsContent value="umum" className="space-y-4 mt-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="nama">Nama Jorong *</Label>
                  <Input
                    id="nama"
                    value={formData.nama}
                    onChange={(e) => setFormData(prev => ({ ...prev, nama: e.target.value }))}
                    placeholder="Contoh: Jorong I"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="kode">Kode</Label>
                  <Input
                    id="kode"
                    value={formData.kode || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, kode: e.target.value }))}
                    placeholder="Contoh: J01"
                  />
                </div>
              </div>

              {/* Wali Jorong Search */}
              <div className="space-y-2">
                <Label>Wali Jorong</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={wargaSearchQuery}
                    onChange={(e) => setWargaSearchQuery(e.target.value)}
                    placeholder="Cari warga berdasarkan nama atau NIK..."
                    className="pl-9"
                  />
                  {loadingWarga && (
                    <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
                  )}
                </div>
                {wargaOptions.length > 0 && (
                  <div className="border rounded-md max-h-48 overflow-y-auto">
                    {wargaOptions.map((warga) => (
                      <div
                        key={warga.id}
                        className={`p-3 cursor-pointer hover:bg-muted border-b last:border-b-0 ${
                          formData.wali_jorong_id === warga.id ? 'bg-primary/10' : ''
                        }`}
                        onClick={() => handleSelectWali(warga)}
                      >
                        <div className="font-medium">{warga.nama}</div>
                        <div className="text-xs text-muted-foreground">
                          NIK: {warga.nik}
                          {warga.no_hp && ` • ${warga.no_hp}`}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {formData.wali_jorong_id && (
                  <div className="flex items-center justify-between p-2 bg-muted rounded-md">
                    <span className="text-sm">Wali terpilih: <strong>{formData.kepala_jorong}</strong></span>
                    <Button variant="ghost" size="sm" onClick={handleClearWali}>
                      Hapus
                    </Button>
                  </div>
                )}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="nomor_sk">Nomor SK Penetapan</Label>
                  <Input
                    id="nomor_sk"
                    value={formData.nomor_sk || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, nomor_sk: e.target.value }))}
                    placeholder="Nomor SK penetapan wali jorong"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tanggal_penetapan">Tanggal Penetapan</Label>
                  <Input
                    id="tanggal_penetapan"
                    type="date"
                    value={formData.tanggal_penetapan || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, tanggal_penetapan: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="alamat_kantor">Alamat Kantor</Label>
                <Textarea
                  id="alamat_kantor"
                  value={formData.alamat_kantor || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, alamat_kantor: e.target.value }))}
                  placeholder="Alamat kantor jorong"
                  rows={2}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="telepon">Telepon</Label>
                  <Input
                    id="telepon"
                    value={formData.telepon || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, telepon: e.target.value }))}
                    placeholder="08xx-xxxx-xxxx"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="email@jorong.id"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked: boolean) => setFormData(prev => ({ ...prev, is_active: checked }))}
                />
                <Label htmlFor="is_active">Jorong Aktif</Label>
              </div>

              <div className="space-y-2">
                <Label htmlFor="keterangan">Keterangan</Label>
                <Textarea
                  id="keterangan"
                  value={formData.keterangan || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, keterangan: e.target.value }))}
                  placeholder="Informasi tambahan tentang jorong..."
                  rows={2}
                />
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter className="mt-6">
            <Button 
              variant="outline" 
              onClick={() => setIsFormDialogOpen(false)}
              disabled={formLoading}
            >
              Batal
            </Button>
            <Button onClick={handleSubmit} disabled={formLoading}>
              {formLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {isEditMode ? 'Simpan Perubahan' : 'Tambah Jorong'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              {selectedJorong?.nama}
            </DialogTitle>
            <DialogDescription>
              Kode: {selectedJorong?.kode || '-'}
            </DialogDescription>
          </DialogHeader>

          {selectedJorong && (
            <div className="space-y-6">
              {/* Wali Jorong Info */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Wali Jorong
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedJorong.wali_jorong ? (
                    <div className="space-y-2">
                      <div className="font-medium text-lg">{selectedJorong.wali_jorong.nama}</div>
                      <div className="text-sm text-muted-foreground">NIK: {selectedJorong.wali_jorong.nik}</div>
                      {selectedJorong.wali_jorong.no_hp && (
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="h-3 w-3" />
                          {selectedJorong.wali_jorong.no_hp}
                        </div>
                      )}
                      {selectedJorong.nomor_sk && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <FileText className="h-3 w-3" />
                          SK: {selectedJorong.nomor_sk}
                        </div>
                      )}
                    </div>
                  ) : selectedJorong.kepala_jorong ? (
                    <div className="text-muted-foreground">{selectedJorong.kepala_jorong}</div>
                  ) : (
                    <div className="text-muted-foreground italic">Belum ditentukan</div>
                  )}
                </CardContent>
              </Card>

              {/* Statistics */}
              {jorongStats && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <BarChart3 className="h-4 w-4" />
                      Statistik Data Sosial
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center p-3 bg-red-50 rounded-lg">
                        <div className="text-2xl font-bold text-red-600">{jorongStats.kemiskinan}</div>
                        <div className="text-xs text-muted-foreground">Kemiskinan</div>
                      </div>
                      <div className="text-center p-3 bg-orange-50 rounded-lg">
                        <div className="text-2xl font-bold text-orange-600">{jorongStats.stunting}</div>
                        <div className="text-xs text-muted-foreground">Stunting</div>
                      </div>
                      <div className="text-center p-3 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">{jorongStats.kb_aktif}</div>
                        <div className="text-xs text-muted-foreground">KB Aktif</div>
                      </div>
                      <div className="text-center p-3 bg-purple-50 rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">{jorongStats.disabilitas}</div>
                        <div className="text-xs text-muted-foreground">Disabilitas</div>
                      </div>
                      <div className="text-center p-3 bg-yellow-50 rounded-lg">
                        <div className="text-2xl font-bold text-yellow-600">{jorongStats.rtlh}</div>
                        <div className="text-xs text-muted-foreground">RTLH</div>
                      </div>
                      <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">{jorongStats.putus_sekolah}</div>
                        <div className="text-xs text-muted-foreground">Putus Sekolah</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Wilayah Info */}
              <div className="grid gap-4 sm:grid-cols-2">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Map className="h-4 w-4" />
                      Info Wilayah
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Luas Wilayah</span>
                      <span>{selectedJorong.luas_wilayah || '-'} Ha</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Jumlah RT</span>
                      <span>{selectedJorong.jumlah_rt || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Jumlah RW</span>
                      <span>{selectedJorong.jumlah_rw || 0}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Home className="h-4 w-4" />
                      Kontak
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="flex items-start gap-2">
                      <Phone className="h-4 w-4 mt-0.5 text-muted-foreground" />
                      <span>{selectedJorong.telepon || '-'}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Mail className="h-4 w-4 mt-0.5 text-muted-foreground" />
                      <span>{selectedJorong.email || '-'}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Home className="h-4 w-4 mt-0.5 text-muted-foreground" />
                      <span className="text-xs">{selectedJorong.alamat_kantor || '-'}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetailDialogOpen(false)}>
              Tutup
            </Button>
            <Button onClick={() => {
              setIsDetailDialogOpen(false);
              if (selectedJorong) handleOpenEdit(selectedJorong);
            }}>
              <Pencil className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Jorong?</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus jorong <strong>{selectedJorong?.nama}</strong>?
              Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
