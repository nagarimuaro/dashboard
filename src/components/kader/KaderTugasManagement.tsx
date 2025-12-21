import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
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
  DropdownMenuLabel,
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
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { 
  ClipboardList, 
  Plus, 
  Search, 
  MoreHorizontal, 
  Pencil, 
  Trash2, 
  Loader2,
  RefreshCw,
  AlertCircle,
  Target,
  Calendar,
  MapPin,
  CheckCircle2,
  XCircle,
  Clock,
  Users
} from 'lucide-react';
import { kaderTugasService, KaderTugas, TugasConfig, CreateTugasData, UpdateTugasData } from '@/services/kaderTugasService';
import kelompokKaderService, { KelompokKader } from '@/services/kelompokKaderService';
import jorongService from '@/services/jorongService';

export default function KaderTugasManagement() {
  // State
  const [tugasList, setTugasList] = useState<KaderTugas[]>([]);
  const [config, setConfig] = useState<TugasConfig | null>(null);
  const [kelompokList, setKelompokList] = useState<KelompokKader[]>([]);
  const [jorongList, setJorongList] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('Aktif');
  const [dataTypeFilter, setDataTypeFilter] = useState<string>('all');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [perPage] = useState(15);
  
  // Dialog states
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isBulkAssignDialogOpen, setIsBulkAssignDialogOpen] = useState(false);
  const [selectedTugas, setSelectedTugas] = useState<KaderTugas | null>(null);
  
  // Form states
  const [formData, setFormData] = useState<CreateTugasData>({
    kelompok_id: 0,
    data_type: '',
    jorongs: [],
    target_data: undefined,
    periode_mulai: '',
    periode_selesai: '',
    catatan: ''
  });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  
  // Bulk assign states
  const [bulkAssignments, setBulkAssignments] = useState<Array<{
    kelompok_id: number;
    data_type: string;
    jorongs: string[];
    target_data: number;
  }>>([]);

  // Fetch config
  const fetchConfig = useCallback(async () => {
    try {
      const response = await kaderTugasService.getConfig();
      if (response.success) {
        setConfig(response.data);
      }
    } catch (err) {
      console.error('Failed to fetch config:', err);
    }
  }, []);

  // Fetch kelompok list
  const fetchKelompokList = useCallback(async () => {
    try {
      const response = await kelompokKaderService.getAll({ per_page: 100 });
      if (response.success) {
        setKelompokList(response.data.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch kelompok list:', err);
    }
  }, []);

  // Fetch jorong list
  const fetchJorongList = useCallback(async () => {
    try {
      const response = await jorongService.getList();
      if (response.success && response.data && response.data.data) {
        setJorongList(response.data.data.map((j: any) => j.nama));
      }
    } catch (err) {
      console.error('Failed to fetch jorong list:', err);
    }
  }, []);

  // Fetch tugas list
  const fetchTugasList = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params: any = {
        page: currentPage,
        per_page: perPage,
      };
      
      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }
      if (dataTypeFilter !== 'all') {
        params.data_type = dataTypeFilter;
      }

      const response = await kaderTugasService.getList(params);
      if (response.success) {
        setTugasList(response.data.data || []);
        setTotalPages(response.data.last_page || 1);
      }
    } catch (err: any) {
      setError(err.message || 'Gagal memuat data tugas');
    } finally {
      setLoading(false);
    }
  }, [currentPage, perPage, statusFilter, dataTypeFilter]);

  useEffect(() => {
    fetchConfig();
    fetchKelompokList();
    fetchJorongList();
  }, [fetchConfig, fetchKelompokList, fetchJorongList]);

  useEffect(() => {
    fetchTugasList();
  }, [fetchTugasList]);

  // Handle form input change
  const handleInputChange = (field: keyof CreateTugasData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setFormError(null);
  };

  // Handle jorong selection
  const handleJorongToggle = (jorong: string) => {
    setFormData(prev => ({
      ...prev,
      jorongs: prev.jorongs?.includes(jorong)
        ? prev.jorongs.filter(j => j !== jorong)
        : [...(prev.jorongs || []), jorong]
    }));
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      kelompok_id: 0,
      data_type: '',
      jorongs: [],
      target_data: undefined,
      periode_mulai: '',
      periode_selesai: '',
      catatan: ''
    });
    setFormError(null);
  };

  // Handle add tugas
  const handleAddTugas = async () => {
    if (!formData.kelompok_id || !formData.data_type) {
      setFormError('Kelompok dan jenis data harus dipilih');
      return;
    }

    setFormLoading(true);
    setFormError(null);

    try {
      const response = await kaderTugasService.create(formData);
      if (response.success) {
        setIsAddDialogOpen(false);
        resetForm();
        fetchTugasList();
      }
    } catch (err: any) {
      setFormError(err.response?.data?.message || err.message || 'Gagal menambah tugas');
    } finally {
      setFormLoading(false);
    }
  };

  // Handle edit tugas
  const handleEditTugas = async () => {
    if (!selectedTugas) return;

    setFormLoading(true);
    setFormError(null);

    try {
      const updateData: UpdateTugasData = {
        jorongs: formData.jorongs,
        target_data: formData.target_data,
        periode_mulai: formData.periode_mulai || undefined,
        periode_selesai: formData.periode_selesai || undefined,
        catatan: formData.catatan || undefined,
      };

      const response = await kaderTugasService.update(selectedTugas.id, updateData);
      if (response.success) {
        setIsEditDialogOpen(false);
        setSelectedTugas(null);
        resetForm();
        fetchTugasList();
      }
    } catch (err: any) {
      setFormError(err.response?.data?.message || err.message || 'Gagal mengupdate tugas');
    } finally {
      setFormLoading(false);
    }
  };

  // Handle delete tugas
  const handleDeleteTugas = async () => {
    if (!selectedTugas) return;

    try {
      const response = await kaderTugasService.delete(selectedTugas.id);
      if (response.success) {
        setIsDeleteDialogOpen(false);
        setSelectedTugas(null);
        fetchTugasList();
      }
    } catch (err: any) {
      console.error('Failed to delete tugas:', err);
    }
  };

  // Open edit dialog
  const openEditDialog = (tugas: KaderTugas) => {
    setSelectedTugas(tugas);
    setFormData({
      kelompok_id: tugas.kelompok_id,
      data_type: tugas.data_type,
      jorongs: tugas.jorongs || [],
      target_data: tugas.target_data || undefined,
      periode_mulai: tugas.periode_mulai || '',
      periode_selesai: tugas.periode_selesai || '',
      catatan: tugas.catatan || ''
    });
    setIsEditDialogOpen(true);
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Aktif':
        return <Badge className="bg-green-100 text-green-800"><Clock className="w-3 h-3 mr-1" />Aktif</Badge>;
      case 'Selesai':
        return <Badge className="bg-blue-100 text-blue-800"><CheckCircle2 className="w-3 h-3 mr-1" />Selesai</Badge>;
      case 'Dibatalkan':
        return <Badge className="bg-red-100 text-red-800"><XCircle className="w-3 h-3 mr-1" />Dibatalkan</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  // Get data type label
  const getDataTypeLabel = (dataType: string) => {
    return config?.data_types[dataType] || dataType;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Penugasan Kader</h1>
          <p className="text-gray-500">Kelola penugasan data dan jorong untuk kelompok kader</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => fetchTugasList()}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Tambah Tugas
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Cari kelompok..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                <SelectItem value="Aktif">Aktif</SelectItem>
                <SelectItem value="Selesai">Selesai</SelectItem>
                <SelectItem value="Dibatalkan">Dibatalkan</SelectItem>
              </SelectContent>
            </Select>
            <Select value={dataTypeFilter} onValueChange={setDataTypeFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Jenis Data" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Jenis</SelectItem>
                {config && Object.entries(config.data_types).map(([key, label]) => (
                  <SelectItem key={key} value={key}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-500" />
          <span className="text-red-700">{error}</span>
        </div>
      )}

      {/* Tugas Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardList className="w-5 h-5" />
            Daftar Tugas
          </CardTitle>
          <CardDescription>
            {tugasList.length} tugas ditemukan
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Kelompok</TableHead>
                  <TableHead>Jenis Data</TableHead>
                  <TableHead>Jorong</TableHead>
                  <TableHead>Target</TableHead>
                  <TableHead>Periode</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[80px]">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tugasList.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                      Belum ada data tugas
                    </TableCell>
                  </TableRow>
                ) : (
                  tugasList.map((tugas) => (
                    <TableRow key={tugas.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-gray-400" />
                          <span className="font-medium">{tugas.kelompok?.nama || '-'}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{getDataTypeLabel(tugas.data_type)}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {tugas.jorongs?.slice(0, 2).map((jorong, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              <MapPin className="w-3 h-3 mr-1" />
                              {jorong}
                            </Badge>
                          ))}
                          {tugas.jorongs && tugas.jorongs.length > 2 && (
                            <Badge variant="secondary" className="text-xs">
                              +{tugas.jorongs.length - 2} lagi
                            </Badge>
                          )}
                          {(!tugas.jorongs || tugas.jorongs.length === 0) && (
                            <span className="text-gray-400 text-sm">Semua jorong</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {tugas.target_data ? (
                          <div className="flex items-center gap-2">
                            <Target className="w-4 h-4 text-gray-400" />
                            <span>{tugas.target_data} data</span>
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {tugas.periode_mulai || tugas.periode_selesai ? (
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <span>
                              {tugas.periode_mulai ? new Date(tugas.periode_mulai).toLocaleDateString('id-ID') : '-'}
                              {' - '}
                              {tugas.periode_selesai ? new Date(tugas.periode_selesai).toLocaleDateString('id-ID') : '-'}
                            </span>
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </TableCell>
                      <TableCell>{getStatusBadge(tugas.status)}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Aksi</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => openEditDialog(tugas)}>
                              <Pencil className="w-4 h-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => {
                                setSelectedTugas(tugas);
                                setIsDeleteDialogOpen(true);
                              }}
                              className="text-red-600"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Hapus
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t">
              <p className="text-sm text-gray-500">
                Halaman {currentPage} dari {totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => prev - 1)}
                >
                  Sebelumnya
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(prev => prev + 1)}
                >
                  Selanjutnya
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Tambah Tugas Baru</DialogTitle>
            <DialogDescription>
              Tugaskan kelompok kader ke jenis data dan jorong tertentu
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {formError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
                {formError}
              </div>
            )}

            <div className="space-y-2">
              <Label>Kelompok Kader *</Label>
              <Select 
                value={formData.kelompok_id?.toString() || ''} 
                onValueChange={(v: string) => handleInputChange('kelompok_id', parseInt(v))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih kelompok..." />
                </SelectTrigger>
                <SelectContent>
                  {kelompokList.map((kelompok) => (
                    <SelectItem key={kelompok.id} value={kelompok.id.toString()}>
                      {kelompok.nama}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Jenis Data *</Label>
              <Select 
                value={formData.data_type} 
                onValueChange={(v: string) => handleInputChange('data_type', v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih jenis data..." />
                </SelectTrigger>
                <SelectContent>
                  {config && Object.entries(config.data_types).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Jorong yang Ditugaskan</Label>
              <div className="grid grid-cols-2 gap-2 p-3 border rounded-lg max-h-40 overflow-y-auto">
                {jorongList.map((jorong) => (
                  <div key={jorong} className="flex items-center space-x-2">
                    <Checkbox
                      id={`jorong-${jorong}`}
                      checked={formData.jorongs?.includes(jorong)}
                      onCheckedChange={() => handleJorongToggle(jorong)}
                    />
                    <label htmlFor={`jorong-${jorong}`} className="text-sm cursor-pointer">
                      {jorong}
                    </label>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-500">Kosongkan untuk semua jorong</p>
            </div>

            <div className="space-y-2">
              <Label>Target Data</Label>
              <Input
                type="number"
                placeholder="Contoh: 50"
                value={formData.target_data || ''}
                onChange={(e) => handleInputChange('target_data', parseInt(e.target.value) || undefined)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Periode Mulai</Label>
                <Input
                  type="date"
                  value={formData.periode_mulai || ''}
                  onChange={(e) => handleInputChange('periode_mulai', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Periode Selesai</Label>
                <Input
                  type="date"
                  value={formData.periode_selesai || ''}
                  onChange={(e) => handleInputChange('periode_selesai', e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Catatan</Label>
              <Textarea
                placeholder="Catatan tambahan..."
                value={formData.catatan || ''}
                onChange={(e) => handleInputChange('catatan', e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Batal
            </Button>
            <Button onClick={handleAddTugas} disabled={formLoading}>
              {formLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Simpan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Tugas</DialogTitle>
            <DialogDescription>
              Ubah detail penugasan
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {formError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
                {formError}
              </div>
            )}

            <div className="space-y-2">
              <Label>Kelompok</Label>
              <Input value={selectedTugas?.kelompok?.nama || ''} disabled />
            </div>

            <div className="space-y-2">
              <Label>Jenis Data</Label>
              <Input value={getDataTypeLabel(selectedTugas?.data_type || '')} disabled />
            </div>

            <div className="space-y-2">
              <Label>Jorong yang Ditugaskan</Label>
              <div className="grid grid-cols-2 gap-2 p-3 border rounded-lg max-h-40 overflow-y-auto">
                {jorongList.map((jorong) => (
                  <div key={jorong} className="flex items-center space-x-2">
                    <Checkbox
                      id={`edit-jorong-${jorong}`}
                      checked={formData.jorongs?.includes(jorong)}
                      onCheckedChange={() => handleJorongToggle(jorong)}
                    />
                    <label htmlFor={`edit-jorong-${jorong}`} className="text-sm cursor-pointer">
                      {jorong}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Target Data</Label>
              <Input
                type="number"
                placeholder="Contoh: 50"
                value={formData.target_data || ''}
                onChange={(e) => handleInputChange('target_data', parseInt(e.target.value) || undefined)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Periode Mulai</Label>
                <Input
                  type="date"
                  value={formData.periode_mulai || ''}
                  onChange={(e) => handleInputChange('periode_mulai', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Periode Selesai</Label>
                <Input
                  type="date"
                  value={formData.periode_selesai || ''}
                  onChange={(e) => handleInputChange('periode_selesai', e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Catatan</Label>
              <Textarea
                placeholder="Catatan tambahan..."
                value={formData.catatan || ''}
                onChange={(e) => handleInputChange('catatan', e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Batal
            </Button>
            <Button onClick={handleEditTugas} disabled={formLoading}>
              {formLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Simpan Perubahan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Tugas?</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus tugas untuk kelompok "{selectedTugas?.kelompok?.nama}"?
              Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteTugas} className="bg-red-600 hover:bg-red-700">
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
