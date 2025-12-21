import { useState, useEffect, useCallback } from 'react';
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
import { Textarea } from '@/components/ui/textarea';
import { 
  Users, 
  UserPlus, 
  Search, 
  MoreHorizontal, 
  Pencil, 
  Trash2, 
  Key,
  Eye,
  EyeOff,
  UserCheck,
  UserX,
  Loader2,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import kaderService, { 
  Kader, 
  KaderConfig, 
  KaderStatistics, 
  CreateKaderData, 
  UpdateKaderData,
  KaderListParams 
} from '@/services/kaderService';

export function KaderManagement() {
  // State
  const [kaders, setKaders] = useState<Kader[]>([]);
  const [config, setConfig] = useState<KaderConfig | null>(null);
  const [statistics, setStatistics] = useState<KaderStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [jenisFilter, setJenisFilter] = useState<string>('all');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [perPage] = useState(15);
  
  // Dialog states
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [selectedKader, setSelectedKader] = useState<Kader | null>(null);
  
  // Form states
  const [formData, setFormData] = useState<CreateKaderData>({
    nama: '',
    email: '',
    password: '',
    jenis: '',
    wilayah: '',
    no_hp: '',
    alamat: '',
    status: 'Aktif',
    permissions: {}
  });
  const [passwordData, setPasswordData] = useState({ password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Fetch config
  const fetchConfig = useCallback(async () => {
    try {
      const response = await kaderService.getConfig();
      if (response.success) {
        setConfig(response.data);
      }
    } catch (err) {
      console.error('Failed to fetch config:', err);
    }
  }, []);

  // Fetch statistics
  const fetchStatistics = useCallback(async () => {
    try {
      const response = await kaderService.getStatistics();
      if (response.success) {
        setStatistics(response.data);
      }
    } catch (err) {
      console.error('Failed to fetch statistics:', err);
    }
  }, []);

  // Fetch kaders
  const fetchKaders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params: KaderListParams = {
        page: currentPage,
        per_page: perPage,
      };
      
      if (searchQuery) params.search = searchQuery;
      if (statusFilter && statusFilter !== 'all') params.status = statusFilter;
      if (jenisFilter && jenisFilter !== 'all') params.jenis = jenisFilter;
      
      const response = await kaderService.getAll(params);
      if (response.success) {
        setKaders(response.data.data || []);
        setTotalPages(response.data.last_page || 1);
      }
    } catch (err: any) {
      setError(err.message || 'Gagal memuat data kader');
      console.error('Failed to fetch kaders:', err);
    } finally {
      setLoading(false);
    }
  }, [currentPage, perPage, searchQuery, statusFilter, jenisFilter]);

  // Initial fetch
  useEffect(() => {
    fetchConfig();
    fetchStatistics();
  }, [fetchConfig, fetchStatistics]);

  useEffect(() => {
    fetchKaders();
  }, [fetchKaders]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Reset form
  const resetForm = () => {
    setFormData({
      nama: '',
      email: '',
      password: '',
      jenis: '',
      wilayah: '',
      no_hp: '',
      alamat: '',
      status: 'Aktif',
      permissions: {}
    });
    setFormError(null);
    setShowPassword(false);
  };

  // Handle add kader
  const handleAddKader = async () => {
    setFormLoading(true);
    setFormError(null);
    try {
      const response = await kaderService.create(formData);
      if (response.success) {
        setIsAddDialogOpen(false);
        resetForm();
        fetchKaders();
        fetchStatistics();
      }
    } catch (err: any) {
      setFormError(err.message || 'Gagal menambahkan kader');
    } finally {
      setFormLoading(false);
    }
  };

  // Handle edit kader
  const handleEditKader = async () => {
    if (!selectedKader) return;
    
    setFormLoading(true);
    setFormError(null);
    try {
      const updateData: UpdateKaderData = {
        nama: formData.nama,
        jenis: formData.jenis,
        wilayah: formData.wilayah,
        no_hp: formData.no_hp,
        alamat: formData.alamat,
        status: formData.status,
        permissions: formData.permissions,
      };
      
      // Only include email if changed
      if (formData.email !== selectedKader.user?.email) {
        updateData.email = formData.email;
      }
      
      const response = await kaderService.update(selectedKader.id, updateData);
      if (response.success) {
        setIsEditDialogOpen(false);
        setSelectedKader(null);
        resetForm();
        fetchKaders();
        fetchStatistics();
      }
    } catch (err: any) {
      setFormError(err.message || 'Gagal mengupdate kader');
    } finally {
      setFormLoading(false);
    }
  };

  // Handle delete kader
  const handleDeleteKader = async () => {
    if (!selectedKader) return;
    
    setFormLoading(true);
    try {
      const response = await kaderService.delete(selectedKader.id);
      if (response.success) {
        setIsDeleteDialogOpen(false);
        setSelectedKader(null);
        fetchKaders();
        fetchStatistics();
      }
    } catch (err: any) {
      setFormError(err.message || 'Gagal menghapus kader');
    } finally {
      setFormLoading(false);
    }
  };

  // Handle change password
  const handleChangePassword = async () => {
    if (!selectedKader) return;
    
    if (passwordData.password !== passwordData.confirmPassword) {
      setFormError('Password tidak sama');
      return;
    }
    
    if (passwordData.password.length < 6) {
      setFormError('Password minimal 6 karakter');
      return;
    }
    
    setFormLoading(true);
    setFormError(null);
    try {
      const response = await kaderService.changePassword(selectedKader.id, passwordData.password);
      if (response.success) {
        setIsPasswordDialogOpen(false);
        setSelectedKader(null);
        setPasswordData({ password: '', confirmPassword: '' });
        setShowPassword(false);
      }
    } catch (err: any) {
      setFormError(err.message || 'Gagal mengubah password');
    } finally {
      setFormLoading(false);
    }
  };

  // Open edit dialog
  const openEditDialog = (kader: Kader) => {
    setSelectedKader(kader);
    
    setFormData({
      nama: kader.nama,
      email: kader.user?.email || '',
      password: '',
      jenis: kader.jenis || '',
      wilayah: kader.wilayah || '',
      no_hp: kader.no_hp || '',
      alamat: kader.alamat || '',
      status: kader.status,
      permissions: {},
    });
    setIsEditDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Kelola Kader</h2>
          <p className="text-muted-foreground">
            Kelola data kader posyandu
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => { fetchKaders(); fetchStatistics(); }}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button onClick={() => { resetForm(); setIsAddDialogOpen(true); }}>
            <UserPlus className="mr-2 h-4 w-4" />
            Tambah Kader
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Kader</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics?.total || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Kader Aktif</CardTitle>
            <UserCheck className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{statistics?.aktif || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Kader Tidak Aktif</CardTitle>
            <UserX className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{statistics?.nonaktif || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filter & Search */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Kader</CardTitle>
          <CardDescription>Data seluruh kader yang terdaftar</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari nama, email, atau no HP..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={(v: string) => { setStatusFilter(v); setCurrentPage(1); }}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Filter Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                <SelectItem value="Aktif">Aktif</SelectItem>
                <SelectItem value="Tidak Aktif">Tidak Aktif</SelectItem>
              </SelectContent>
            </Select>
            <Select value={jenisFilter} onValueChange={(v: string) => { setJenisFilter(v); setCurrentPage(1); }}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Filter Jenis" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Jenis</SelectItem>
                {config?.jenis_options.map(jenis => (
                  <SelectItem key={jenis} value={jenis}>{jenis}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="flex items-center gap-2 p-4 mb-4 bg-red-50 text-red-700 rounded-lg">
              <AlertCircle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          )}

          {/* Table */}
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : kaders.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Tidak ada data kader
            </div>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nama</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Jenis</TableHead>
                      <TableHead>Jorong</TableHead>
                      <TableHead>No HP</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {kaders.map((kader) => (
                      <TableRow key={kader.id}>
                        <TableCell className="font-medium">{kader.nama}</TableCell>
                        <TableCell>{kader.user?.email || '-'}</TableCell>
                        <TableCell>{kader.jenis || '-'}</TableCell>
                        <TableCell>{kader.wilayah || '-'}</TableCell>
                        <TableCell>{kader.no_hp || '-'}</TableCell>
                        <TableCell>
                          <Badge variant={kader.status === 'Aktif' ? 'default' : 'secondary'}>
                            {kader.status === 'Aktif' ? 'Aktif' : 'Tidak Aktif'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Aksi</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => openEditDialog(kader)}>
                                <Pencil className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => {
                                setSelectedKader(kader);
                                setPasswordData({ password: '', confirmPassword: '' });
                                setFormError(null);
                                setIsPasswordDialogOpen(true);
                              }}>
                                <Key className="mr-2 h-4 w-4" />
                                Ganti Password
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                className="text-red-600"
                                onClick={() => {
                                  setSelectedKader(kader);
                                  setIsDeleteDialogOpen(true);
                                }}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Hapus
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-2 py-4">
                  <p className="text-sm text-muted-foreground">
                    Halaman {currentPage} dari {totalPages}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    >
                      Sebelumnya
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Selanjutnya
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Add Kader Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Tambah Kader Baru</DialogTitle>
            <DialogDescription>
              Isi data untuk menambahkan kader baru
            </DialogDescription>
          </DialogHeader>

          {formError && (
            <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
              <AlertCircle className="h-4 w-4" />
              <span>{formError}</span>
            </div>
          )}

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nama">Nama Lengkap *</Label>
                <Input
                  id="nama"
                  value={formData.nama}
                  onChange={(e) => setFormData(prev => ({ ...prev, nama: e.target.value }))}
                  placeholder="Masukkan nama lengkap"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="email@domain.com"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="password">Password *</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    placeholder="Minimal 6 karakter"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="no_hp">No. HP</Label>
                <Input
                  id="no_hp"
                  value={formData.no_hp}
                  onChange={(e) => setFormData(prev => ({ ...prev, no_hp: e.target.value }))}
                  placeholder="08xxxxxxxxxx"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="jenis">Jenis Kader</Label>
                <Select 
                  value={formData.jenis} 
                  onValueChange={(v: string) => setFormData(prev => ({ ...prev, jenis: v }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih jenis kader" />
                  </SelectTrigger>
                  <SelectContent>
                    {config?.jenis_options.map(jenis => (
                      <SelectItem key={jenis} value={jenis}>{jenis}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="wilayah">Jorong</Label>
                <Select 
                  value={formData.wilayah || ''} 
                  onValueChange={(v: string) => setFormData(prev => ({ ...prev, wilayah: v }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih jorong" />
                  </SelectTrigger>
                  <SelectContent>
                    {config?.jorong_options && Object.entries(config.jorong_options).map(([id, nama]) => (
                      <SelectItem key={id} value={nama}>{nama}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="alamat">Alamat</Label>
              <Textarea
                id="alamat"
                value={formData.alamat}
                onChange={(e) => setFormData(prev => ({ ...prev, alamat: e.target.value }))}
                placeholder="Alamat lengkap"
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select 
                value={formData.status} 
                onValueChange={(v: 'Aktif' | 'Tidak Aktif') => setFormData(prev => ({ ...prev, status: v }))}
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

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Batal
            </Button>
            <Button onClick={handleAddKader} disabled={formLoading || !formData.nama || !formData.email || !formData.password}>
              {formLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Simpan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Kader Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Kader</DialogTitle>
            <DialogDescription>
              Ubah data kader {selectedKader?.nama}
            </DialogDescription>
          </DialogHeader>

          {formError && (
            <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
              <AlertCircle className="h-4 w-4" />
              <span>{formError}</span>
            </div>
          )}

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-nama">Nama Lengkap *</Label>
                <Input
                  id="edit-nama"
                  value={formData.nama}
                  onChange={(e) => setFormData(prev => ({ ...prev, nama: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-email">Email *</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-no_hp">No. HP</Label>
                <Input
                  id="edit-no_hp"
                  value={formData.no_hp}
                  onChange={(e) => setFormData(prev => ({ ...prev, no_hp: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-jenis">Jenis Kader</Label>
                <Select 
                  value={formData.jenis} 
                  onValueChange={(v: string) => setFormData(prev => ({ ...prev, jenis: v }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih jenis kader" />
                  </SelectTrigger>
                  <SelectContent>
                    {config?.jenis_options.map(jenis => (
                      <SelectItem key={jenis} value={jenis}>{jenis}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-wilayah">Jorong</Label>
              <Select 
                value={formData.wilayah || ''} 
                onValueChange={(v: string) => setFormData(prev => ({ ...prev, wilayah: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih jorong" />
                </SelectTrigger>
                <SelectContent>
                  {config?.jorong_options && Object.entries(config.jorong_options).map(([id, nama]) => (
                    <SelectItem key={id} value={nama}>{nama}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-alamat">Alamat</Label>
              <Textarea
                id="edit-alamat"
                value={formData.alamat}
                onChange={(e) => setFormData(prev => ({ ...prev, alamat: e.target.value }))}
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-status">Status</Label>
              <Select 
                value={formData.status} 
                onValueChange={(v: 'Aktif' | 'Tidak Aktif') => setFormData(prev => ({ ...prev, status: v }))}
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

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Batal
            </Button>
            <Button onClick={handleEditKader} disabled={formLoading || !formData.nama || !formData.email}>
              {formLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Simpan Perubahan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Kader</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus kader <strong>{selectedKader?.nama}</strong>?
              Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteKader}
              className="bg-red-600 hover:bg-red-700"
              disabled={formLoading}
            >
              {formLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Change Password Dialog */}
      <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ganti Password</DialogTitle>
            <DialogDescription>
              Ganti password untuk kader {selectedKader?.nama}
            </DialogDescription>
          </DialogHeader>

          {formError && (
            <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
              <AlertCircle className="h-4 w-4" />
              <span>{formError}</span>
            </div>
          )}

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="new-password">Password Baru</Label>
              <div className="relative">
                <Input
                  id="new-password"
                  type={showPassword ? 'text' : 'password'}
                  value={passwordData.password}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, password: e.target.value }))}
                  placeholder="Minimal 6 karakter"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Konfirmasi Password</Label>
              <Input
                id="confirm-password"
                type={showPassword ? 'text' : 'password'}
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                placeholder="Ulangi password baru"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPasswordDialogOpen(false)}>
              Batal
            </Button>
            <Button 
              onClick={handleChangePassword} 
              disabled={formLoading || !passwordData.password || !passwordData.confirmPassword}
            >
              {formLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Ganti Password
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default KaderManagement;
