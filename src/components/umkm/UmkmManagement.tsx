import { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { 
  Store, 
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
  MapPin,
  DollarSign,
  TrendingUp,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import umkmService, { 
  Umkm, 
  UmkmFormData, 
  JENIS_USAHA_OPTIONS 
} from '@/services/umkmService';
import apiClient from '@/services/apiClient';

// Simple Warga type for dropdown
interface WargaOption {
  id: number;
  nik: string;
  nama: string;
  alamat?: string;
  no_hp?: string;
}

export default function UmkmManagement() {
  // State
  const [umkms, setUmkms] = useState<Umkm[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [jenisFilter, setJenisFilter] = useState<string>('all');
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
  const [selectedUmkm, setSelectedUmkm] = useState<Umkm | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  
  // Pemilik search
  const [wargaOptions, setWargaOptions] = useState<WargaOption[]>([]);
  const [wargaSearchQuery, setWargaSearchQuery] = useState('');
  const [loadingWarga, setLoadingWarga] = useState(false);
  
  // Form states
  const initialFormData: UmkmFormData = {
    nama_usaha: '',
    pemilik_id: null,
    produk: '',
    omzet: undefined,
    alamat: '',
    no_hp: '',
    jenis_usaha: '',
    status: 'Aktif',
    tanggal_mulai: '',
  };
  
  const [formData, setFormData] = useState<UmkmFormData>(initialFormData);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [selectedPemilikName, setSelectedPemilikName] = useState<string>('');

  // Fetch UMKMs
  const fetchUmkms = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params: Record<string, string | number> = {
        page: currentPage,
        per_page: perPage,
      };
      
      if (searchQuery) params.search = searchQuery;
      if (jenisFilter !== 'all') params.jenis_usaha = jenisFilter;
      if (statusFilter !== 'all') params.status = statusFilter;
      
      const response = await umkmService.getList(params);
      if (response.success) {
        setUmkms(response.data.data || []);
        setTotalPages(response.data.last_page || 1);
        setTotal(response.data.total || 0);
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Gagal memuat data UMKM';
      setError(errorMessage);
      console.error('Failed to fetch UMKMs:', err);
    } finally {
      setLoading(false);
    }
  }, [currentPage, perPage, searchQuery, jenisFilter, statusFilter]);

  // Search warga for pemilik dropdown
  const searchWarga = useCallback(async (query: string) => {
    if (query.length < 2) {
      setWargaOptions([]);
      return;
    }
    
    setLoadingWarga(true);
    try {
      const response = await apiClient.get('/wargas', { 
        search: query, 
        per_page: 10,
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
      
      const options = wargaList.map((w: { id: number; nik: string; nama: string; alamat?: string; no_hp?: string }) => ({
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
    fetchUmkms();
  }, [fetchUmkms]);

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
    setSelectedPemilikName('');
  };

  // Open add dialog
  const handleOpenAdd = () => {
    resetForm();
    setIsFormDialogOpen(true);
  };

  // Open edit dialog
  const handleOpenEdit = (umkm: Umkm) => {
    setSelectedUmkm(umkm);
    setFormData({
      nama_usaha: umkm.nama_usaha,
      pemilik_id: umkm.pemilik_id,
      produk: umkm.produk || '',
      omzet: umkm.omzet ? parseFloat(umkm.omzet) : undefined,
      alamat: umkm.alamat || '',
      no_hp: umkm.no_hp || '',
      jenis_usaha: umkm.jenis_usaha || '',
      status: umkm.status,
      tanggal_mulai: umkm.tanggal_mulai || '',
    });
    // Populate pemilik in dropdown if exists
    if (umkm.pemilik) {
      setWargaOptions([{
        id: umkm.pemilik.id,
        nik: umkm.pemilik.nik,
        nama: umkm.pemilik.nama,
        alamat: umkm.pemilik.alamat,
        no_hp: umkm.pemilik.no_hp,
      }]);
      setSelectedPemilikName(umkm.pemilik.nama);
      setWargaSearchQuery(umkm.pemilik.nama);
    }
    setIsEditMode(true);
    setIsFormDialogOpen(true);
  };

  // Open detail dialog
  const handleOpenDetail = (umkm: Umkm) => {
    setSelectedUmkm(umkm);
    setIsDetailDialogOpen(true);
  };

  // Open delete dialog
  const handleOpenDelete = (umkm: Umkm) => {
    setSelectedUmkm(umkm);
    setIsDeleteDialogOpen(true);
  };

  // Handle form submit
  const handleSubmit = async () => {
    if (!formData.nama_usaha.trim()) {
      setFormError('Nama usaha wajib diisi');
      return;
    }

    setFormLoading(true);
    setFormError(null);

    try {
      const submitData = { ...formData };
      
      if (isEditMode && selectedUmkm) {
        await umkmService.update(selectedUmkm.id, submitData);
      } else {
        await umkmService.create(submitData);
      }

      setIsFormDialogOpen(false);
      resetForm();
      fetchUmkms();
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { message?: string } }; message?: string };
      const message = errorObj.response?.data?.message || errorObj.message || 'Gagal menyimpan data';
      setFormError(message);
    } finally {
      setFormLoading(false);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (!selectedUmkm) return;

    try {
      await umkmService.delete(selectedUmkm.id);
      setIsDeleteDialogOpen(false);
      setSelectedUmkm(null);
      fetchUmkms();
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { message?: string } }; message?: string };
      const message = errorObj.response?.data?.message || errorObj.message || 'Gagal menghapus UMKM';
      alert(message);
    }
  };

  // Handle toggle status
  const handleToggleStatus = async (umkm: Umkm) => {
    try {
      const newStatus = umkm.status === 'Aktif' ? 'Tidak Aktif' : 'Aktif';
      await umkmService.toggleStatus(umkm.id, newStatus);
      fetchUmkms();
    } catch (err) {
      console.error('Failed to toggle status:', err);
    }
  };

  // Select pemilik
  const handleSelectPemilik = (warga: WargaOption) => {
    setFormData(prev => ({
      ...prev,
      pemilik_id: warga.id,
      no_hp: warga.no_hp || prev.no_hp,
      alamat: warga.alamat || prev.alamat,
    }));
    setSelectedPemilikName(warga.nama);
    setWargaSearchQuery(warga.nama);
  };

  // Clear pemilik
  const handleClearPemilik = () => {
    setFormData(prev => ({
      ...prev,
      pemilik_id: null,
    }));
    setSelectedPemilikName('');
    setWargaSearchQuery('');
    setWargaOptions([]);
  };

  // Format currency
  const formatCurrency = (value: string | number | null | undefined) => {
    if (!value) return '-';
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num);
  };

  // Summary stats
  const summaryStats = useMemo(() => {
    const aktif = umkms.filter(u => u.status === 'Aktif').length;
    const totalOmzet = umkms.reduce((sum, u) => sum + (u.omzet ? parseFloat(u.omzet) : 0), 0);
    const jenisCount = [...new Set(umkms.map(u => u.jenis_usaha).filter(Boolean))].length;
    return { aktif, totalOmzet, jenisCount };
  }, [umkms]);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Store className="h-6 w-6" />
            Direktori UMKM
          </h1>
          <p className="text-muted-foreground mt-1">
            Kelola data Usaha Mikro Kecil Menengah di nagari
          </p>
        </div>
        <Button onClick={handleOpenAdd} className="gap-2">
          <Plus className="h-4 w-4" />
          Tambah UMKM
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total UMKM</CardTitle>
            <Store className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">UMKM Aktif</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{summaryStats.aktif}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Omzet</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">{formatCurrency(summaryStats.totalOmzet)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Jenis Usaha</CardTitle>
            <Store className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summaryStats.jenisCount}</div>
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
                placeholder="Cari nama usaha, produk, atau pemilik..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={jenisFilter} onValueChange={setJenisFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Jenis Usaha" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Jenis</SelectItem>
                {JENIS_USAHA_OPTIONS.map(jenis => (
                  <SelectItem key={jenis} value={jenis}>{jenis}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-36">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                <SelectItem value="Aktif">Aktif</SelectItem>
                <SelectItem value="Tidak Aktif">Tidak Aktif</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={fetchUmkms} className="gap-2">
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
              <Button variant="outline" onClick={fetchUmkms} className="mt-4">
                Coba Lagi
              </Button>
            </div>
          ) : umkms.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Store className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Belum ada data UMKM</p>
              <Button onClick={handleOpenAdd} className="mt-4">
                Tambah UMKM Pertama
              </Button>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nama Usaha</TableHead>
                    <TableHead>Pemilik</TableHead>
                    <TableHead>Jenis</TableHead>
                    <TableHead>Produk</TableHead>
                    <TableHead className="text-right">Omzet</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead className="w-16">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {umkms.map((umkm) => (
                    <TableRow key={umkm.id}>
                      <TableCell>
                        <div className="font-medium">{umkm.nama_usaha}</div>
                        {umkm.alamat && (
                          <div className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                            <MapPin className="h-3 w-3" />
                            <span className="truncate max-w-48">{umkm.alamat}</span>
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        {umkm.pemilik ? (
                          <div>
                            <div className="font-medium flex items-center gap-1">
                              <User className="h-3 w-3" />
                              {umkm.pemilik.nama}
                            </div>
                            {umkm.no_hp && (
                              <div className="text-xs text-muted-foreground flex items-center gap-1">
                                <Phone className="h-3 w-3" />
                                {umkm.no_hp}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {umkm.jenis_usaha ? (
                          <Badge variant="outline">{umkm.jenis_usaha}</Badge>
                        ) : '-'}
                      </TableCell>
                      <TableCell>
                        <span className="text-sm truncate max-w-32 block">
                          {umkm.produk || '-'}
                        </span>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(umkm.omzet)}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant={umkm.status === 'Aktif' ? 'default' : 'secondary'}>
                          {umkm.status}
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
                            <DropdownMenuItem onClick={() => handleOpenDetail(umkm)}>
                              <Eye className="h-4 w-4 mr-2" />
                              Lihat Detail
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleOpenEdit(umkm)}>
                              <Pencil className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleToggleStatus(umkm)}>
                              <Store className="h-4 w-4 mr-2" />
                              {umkm.status === 'Aktif' ? 'Nonaktifkan' : 'Aktifkan'}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => handleOpenDelete(umkm)}
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
              {isEditMode ? 'Edit UMKM' : 'Tambah UMKM Baru'}
            </DialogTitle>
            <DialogDescription>
              {isEditMode 
                ? 'Perbarui informasi UMKM' 
                : 'Tambahkan data UMKM baru'}
            </DialogDescription>
          </DialogHeader>

          {formError && (
            <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-md flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              {formError}
            </div>
          )}

          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="nama_usaha">Nama Usaha *</Label>
                <Input
                  id="nama_usaha"
                  value={formData.nama_usaha}
                  onChange={(e) => setFormData(prev => ({ ...prev, nama_usaha: e.target.value }))}
                  placeholder="Contoh: Warung Makan Sederhana"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="jenis_usaha">Jenis Usaha</Label>
                <Select 
                  value={formData.jenis_usaha || ''} 
                  onValueChange={(value: string) => setFormData(prev => ({ ...prev, jenis_usaha: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih jenis usaha" />
                  </SelectTrigger>
                  <SelectContent>
                    {JENIS_USAHA_OPTIONS.map(jenis => (
                      <SelectItem key={jenis} value={jenis}>{jenis}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Pemilik Search */}
            <div className="space-y-2">
              <Label>Pemilik (Warga)</Label>
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
              {wargaOptions.length > 0 && !selectedPemilikName && (
                <div className="border rounded-md max-h-48 overflow-y-auto">
                  {wargaOptions.map((warga) => (
                    <div
                      key={warga.id}
                      className="p-3 cursor-pointer hover:bg-muted border-b last:border-b-0"
                      onClick={() => handleSelectPemilik(warga)}
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
              {formData.pemilik_id && selectedPemilikName && (
                <div className="flex items-center justify-between p-2 bg-muted rounded-md">
                  <span className="text-sm">Pemilik: <strong>{selectedPemilikName}</strong></span>
                  <Button variant="ghost" size="sm" onClick={handleClearPemilik}>
                    Hapus
                  </Button>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="produk">Produk / Layanan</Label>
              <Textarea
                id="produk"
                value={formData.produk || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, produk: e.target.value }))}
                placeholder="Deskripsi produk atau layanan yang ditawarkan"
                rows={2}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="omzet">Omzet per Bulan (Rp)</Label>
                <Input
                  id="omzet"
                  type="number"
                  value={formData.omzet || ''}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    omzet: e.target.value ? parseFloat(e.target.value) : undefined 
                  }))}
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tanggal_mulai">Tanggal Mulai Usaha</Label>
                <Input
                  id="tanggal_mulai"
                  type="date"
                  value={formData.tanggal_mulai || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, tanggal_mulai: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="alamat">Alamat Usaha</Label>
              <Textarea
                id="alamat"
                value={formData.alamat || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, alamat: e.target.value }))}
                placeholder="Alamat lengkap lokasi usaha"
                rows={2}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="no_hp">No. HP / WhatsApp</Label>
                <Input
                  id="no_hp"
                  value={formData.no_hp || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, no_hp: e.target.value }))}
                  placeholder="08xx-xxxx-xxxx"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select 
                  value={formData.status} 
                  onValueChange={(value: 'Aktif' | 'Tidak Aktif') => setFormData(prev => ({ ...prev, status: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Aktif">Aktif</SelectItem>
                    <SelectItem value="Tidak Aktif">Tidak Aktif</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

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
              {isEditMode ? 'Simpan Perubahan' : 'Tambah UMKM'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Store className="h-5 w-5" />
              {selectedUmkm?.nama_usaha}
            </DialogTitle>
            <DialogDescription>
              {selectedUmkm?.jenis_usaha && (
                <Badge variant="outline" className="mt-1">{selectedUmkm.jenis_usaha}</Badge>
              )}
            </DialogDescription>
          </DialogHeader>

          {selectedUmkm && (
            <div className="space-y-4">
              {/* Pemilik */}
              <div className="p-4 bg-muted rounded-lg">
                <div className="text-sm text-muted-foreground mb-1">Pemilik</div>
                {selectedUmkm.pemilik ? (
                  <div>
                    <div className="font-medium">{selectedUmkm.pemilik.nama}</div>
                    <div className="text-sm text-muted-foreground">NIK: {selectedUmkm.pemilik.nik}</div>
                  </div>
                ) : (
                  <div className="text-muted-foreground italic">Tidak ada data pemilik</div>
                )}
              </div>

              {/* Info Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground">Produk</div>
                  <div className="font-medium">{selectedUmkm.produk || '-'}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Omzet/Bulan</div>
                  <div className="font-medium text-green-600">{formatCurrency(selectedUmkm.omzet)}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Status</div>
                  <Badge variant={selectedUmkm.status === 'Aktif' ? 'default' : 'secondary'}>
                    {selectedUmkm.status}
                  </Badge>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Mulai Usaha</div>
                  <div className="font-medium">
                    {selectedUmkm.tanggal_mulai 
                      ? new Date(selectedUmkm.tanggal_mulai).toLocaleDateString('id-ID')
                      : '-'}
                  </div>
                </div>
              </div>

              {/* Kontak */}
              <div className="space-y-2">
                {selectedUmkm.alamat && (
                  <div className="flex items-start gap-2 text-sm">
                    <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
                    <span>{selectedUmkm.alamat}</span>
                  </div>
                )}
                {selectedUmkm.no_hp && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{selectedUmkm.no_hp}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetailDialogOpen(false)}>
              Tutup
            </Button>
            <Button onClick={() => {
              setIsDetailDialogOpen(false);
              if (selectedUmkm) handleOpenEdit(selectedUmkm);
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
            <AlertDialogTitle>Hapus UMKM?</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus <strong>{selectedUmkm?.nama_usaha}</strong>?
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
