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
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { 
  Users, 
  UserPlus, 
  Search, 
  MoreHorizontal, 
  Pencil, 
  Trash2, 
  Loader2,
  RefreshCw,
  AlertCircle,
  UsersRound,
  UserCheck,
  UserX,
  Crown,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import kelompokKaderService, { 
  KelompokKader, 
  KelompokKaderConfig, 
  KelompokKaderStatistics, 
  CreateKelompokKaderData, 
  UpdateKelompokKaderData,
  KelompokKaderListParams,
  KelompokKaderMember
} from '@/services/kelompokKaderService';

export function KelompokKaderManagement() {
  // State
  const [kelompoks, setKelompoks] = useState<KelompokKader[]>([]);
  const [config, setConfig] = useState<KelompokKaderConfig | null>(null);
  const [statistics, setStatistics] = useState<KelompokKaderStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [jorongFilter, setJorongFilter] = useState<string>('all');
  const [expandedKelompoks, setExpandedKelompoks] = useState<Set<number>>(new Set());
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [perPage] = useState(15);
  
  // Dialog states
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isAddMemberDialogOpen, setIsAddMemberDialogOpen] = useState(false);
  const [selectedKelompok, setSelectedKelompok] = useState<KelompokKader | null>(null);
  const [selectedMemberToAdd, setSelectedMemberToAdd] = useState<number | null>(null);
  const [memberRole, setMemberRole] = useState<string>('anggota');
  
  // Form states
  const [formData, setFormData] = useState<CreateKelompokKaderData>({
    nama: '',
    kode: '',
    deskripsi: '',
    ketua_id: undefined,
    jorong: '',
    is_active: true,
    members: [],
    permissions: {}
  });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Fetch config
  const fetchConfig = useCallback(async () => {
    try {
      const response = await kelompokKaderService.getConfig();
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
      const response = await kelompokKaderService.getStatistics();
      if (response.success) {
        setStatistics(response.data);
      }
    } catch (err) {
      console.error('Failed to fetch statistics:', err);
    }
  }, []);

  // Fetch kelompoks
  const fetchKelompoks = useCallback(async (updateSelectedId?: number) => {
    setLoading(true);
    setError(null);
    try {
      const params: KelompokKaderListParams = {
        page: currentPage,
        per_page: perPage,
      };
      
      if (searchQuery) params.search = searchQuery;
      if (statusFilter && statusFilter !== 'all') params.is_active = statusFilter;
      if (jorongFilter && jorongFilter !== 'all') params.jorong = jorongFilter;
      
      const response = await kelompokKaderService.getAll(params);
      if (response.success) {
        const data = response.data.data || [];
        setKelompoks(data);
        setTotalPages(response.data.last_page || 1);
        
        // Update selectedKelompok if requested
        if (updateSelectedId) {
          const updated = data.find((k: KelompokKader) => k.id === updateSelectedId);
          if (updated) {
            setSelectedKelompok(updated);
          }
        }
      }
    } catch (err: any) {
      setError(err.message || 'Gagal memuat data kelompok kader');
      console.error('Failed to fetch kelompoks:', err);
    } finally {
      setLoading(false);
    }
  }, [currentPage, perPage, searchQuery, statusFilter, jorongFilter]);

  // Initial fetch
  useEffect(() => {
    fetchConfig();
    fetchStatistics();
  }, [fetchConfig, fetchStatistics]);

  useEffect(() => {
    fetchKelompoks();
  }, [fetchKelompoks]);

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
      kode: '',
      deskripsi: '',
      ketua_id: undefined,
      jorong: '',
      is_active: true,
      members: [],
      permissions: {}
    });
    setFormError(null);
  };

  // Handle add kelompok
  const handleAddKelompok = async () => {
    setFormLoading(true);
    setFormError(null);
    try {
      const response = await kelompokKaderService.create(formData);
      if (response.success) {
        setIsAddDialogOpen(false);
        resetForm();
        fetchKelompoks();
        fetchStatistics();
      }
    } catch (err: any) {
      setFormError(err.message || 'Gagal menambahkan kelompok kader');
    } finally {
      setFormLoading(false);
    }
  };

  // Handle edit kelompok
  const handleEditKelompok = async () => {
    if (!selectedKelompok) return;
    
    setFormLoading(true);
    setFormError(null);
    try {
      const response = await kelompokKaderService.update(selectedKelompok.id, formData);
      if (response.success) {
        setIsEditDialogOpen(false);
        setSelectedKelompok(null);
        resetForm();
        fetchKelompoks();
        fetchStatistics();
      }
    } catch (err: any) {
      setFormError(err.message || 'Gagal mengupdate kelompok kader');
    } finally {
      setFormLoading(false);
    }
  };

  // Handle delete kelompok
  const handleDeleteKelompok = async () => {
    if (!selectedKelompok) return;
    
    setFormLoading(true);
    try {
      const response = await kelompokKaderService.delete(selectedKelompok.id);
      if (response.success) {
        setIsDeleteDialogOpen(false);
        setSelectedKelompok(null);
        fetchKelompoks();
        fetchStatistics();
      }
    } catch (err: any) {
      setFormError(err.message || 'Gagal menghapus kelompok kader');
    } finally {
      setFormLoading(false);
    }
  };



  // Toggle member selection
  const toggleMember = (kaderId: number) => {
    setFormData(prev => {
      const members = prev.members || [];
      if (members.includes(kaderId)) {
        return { ...prev, members: members.filter(id => id !== kaderId) };
      } else {
        if (members.length >= 6) {
          setFormError('Maksimal 6 anggota per kelompok');
          return prev;
        }
        return { ...prev, members: [...members, kaderId] };
      }
    });
  };

  // Open edit dialog
  const openEditDialog = (kelompok: KelompokKader) => {
    setSelectedKelompok(kelompok);
    
    setFormData({
      nama: kelompok.nama,
      kode: kelompok.kode || '',
      deskripsi: kelompok.deskripsi || '',
      ketua_id: kelompok.ketua_id || undefined,
      jorong: kelompok.jorong || '',
      is_active: kelompok.is_active,
      members: [],
      permissions: {},
    });
    setFormError(null);
    setIsEditDialogOpen(true);
  };

  // Add member to kelompok
  const handleAddMember = async () => {
    if (!selectedKelompok || !selectedMemberToAdd) return;
    
    setFormLoading(true);
    setFormError(null);
    try {
      await kelompokKaderService.addMember(
        selectedKelompok.id, 
        selectedMemberToAdd, 
        memberRole
      );
      setIsAddMemberDialogOpen(false);
      setSelectedMemberToAdd(null);
      setMemberRole('anggota');
      fetchKelompoks(selectedKelompok.id);
    } catch (err: any) {
      setFormError(err.message || 'Gagal menambah anggota');
    } finally {
      setFormLoading(false);
    }
  };

  // Remove member from kelompok
  const handleRemoveMember = async (kaderId: number) => {
    if (!selectedKelompok) return;
    
    setFormLoading(true);
    try {
      await kelompokKaderService.removeMember(selectedKelompok.id, kaderId);
      fetchKelompoks(selectedKelompok.id);
    } catch (err: any) {
      setFormError(err.message || 'Gagal menghapus anggota');
    } finally {
      setFormLoading(false);
    }
  };

  // Get available kaders (not in current kelompok)
  const getAvailableKaders = () => {
    if (!selectedKelompok || !config?.kader_options) return [];
    const memberIds = selectedKelompok.members?.map(m => m.id) || [];
    return config.kader_options.filter(k => !memberIds.includes(k.id));
  };

  // Toggle expand kelompok
  const toggleExpand = (kelompokId: number) => {
    setExpandedKelompoks(prev => {
      const newSet = new Set(prev);
      if (newSet.has(kelompokId)) {
        newSet.delete(kelompokId);
      } else {
        newSet.add(kelompokId);
      }
      return newSet;
    });
  };

  // Get role label
  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'ketua': return 'Ketua';
      case 'wakil': return 'Wakil Ketua';
      case 'anggota': return 'Anggota';
      default: return role;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Kelola Kelompok Kader</h2>
          <p className="text-muted-foreground">
            Kelola kelompok kader dan anggotanya
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => { fetchKelompoks(); fetchStatistics(); }}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button onClick={() => { resetForm(); setIsAddDialogOpen(true); }}>
            <UsersRound className="mr-2 h-4 w-4" />
            Tambah Kelompok
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Kelompok</CardTitle>
            <UsersRound className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics?.total || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Kelompok Aktif</CardTitle>
            <UserCheck className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{statistics?.aktif || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Kelompok Nonaktif</CardTitle>
            <UserX className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{statistics?.nonaktif || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Anggota</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{statistics?.total_members || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filter & Search */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Kelompok Kader</CardTitle>
          <CardDescription>Data seluruh kelompok kader yang terdaftar</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari nama atau kode kelompok..."
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
                <SelectItem value="true">Aktif</SelectItem>
                <SelectItem value="false">Tidak Aktif</SelectItem>
              </SelectContent>
            </Select>
            <Select value={jorongFilter} onValueChange={(v: string) => { setJorongFilter(v); setCurrentPage(1); }}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Filter Jorong" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Jorong</SelectItem>
                {config?.jorong_options && Object.entries(config.jorong_options).map(([id, nama]) => (
                  <SelectItem key={id} value={nama}>{nama}</SelectItem>
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
          ) : kelompoks.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Tidak ada data kelompok kader
            </div>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-10"></TableHead>
                      <TableHead>Nama Kelompok</TableHead>
                      <TableHead>Kode</TableHead>
                      <TableHead>Jorong</TableHead>
                      <TableHead>Anggota</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {kelompoks.map((kelompok) => (
                      <>
                        <TableRow key={kelompok.id} className="cursor-pointer hover:bg-muted/50" onClick={() => toggleExpand(kelompok.id)}>
                          <TableCell className="w-10">
                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                              {expandedKelompoks.has(kelompok.id) ? (
                                <ChevronDown className="h-4 w-4" />
                              ) : (
                                <ChevronRight className="h-4 w-4" />
                              )}
                            </Button>
                          </TableCell>
                          <TableCell className="font-medium">{kelompok.nama}</TableCell>
                          <TableCell>{kelompok.kode || '-'}</TableCell>
                          <TableCell>{kelompok.jorong || '-'}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-xs">
                              {kelompok.members?.length || 0} anggota
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={kelompok.is_active ? 'default' : 'secondary'}>
                              {kelompok.is_active ? 'Aktif' : 'Tidak Aktif'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Aksi</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => openEditDialog(kelompok)}>
                                  <Pencil className="mr-2 h-4 w-4" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                  className="text-red-600"
                                  onClick={() => {
                                    setSelectedKelompok(kelompok);
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
                        
                        {/* Expanded Member Row */}
                        {expandedKelompoks.has(kelompok.id) && (
                          <TableRow key={`${kelompok.id}-members`} className="bg-muted/30 hover:bg-muted/30">
                            <TableCell colSpan={7} className="py-4">
                              <div className="px-4">
                                <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                                  <Users className="h-4 w-4" />
                                  Daftar Anggota ({kelompok.members?.length || 0} orang)
                                </h4>
                                {kelompok.members && kelompok.members.length > 0 ? (
                                  <div className="rounded-md border bg-background">
                                    <Table>
                                      <TableHeader>
                                        <TableRow>
                                          <TableHead className="w-12">No</TableHead>
                                          <TableHead>Nama</TableHead>
                                          <TableHead>Jenis</TableHead>
                                          <TableHead>No HP</TableHead>
                                          <TableHead>Role</TableHead>
                                          <TableHead>Status</TableHead>
                                        </TableRow>
                                      </TableHeader>
                                      <TableBody>
                                        {kelompok.members.map((member, index) => (
                                          <TableRow key={member.id}>
                                            <TableCell className="text-muted-foreground">{index + 1}</TableCell>
                                            <TableCell className="font-medium">
                                              <div className="flex items-center gap-2">
                                                {member.pivot?.role === 'ketua' && <Crown className="h-4 w-4 text-yellow-500" />}
                                                {member.nama}
                                              </div>
                                            </TableCell>
                                            <TableCell>{member.jenis || '-'}</TableCell>
                                            <TableCell>{member.no_hp || '-'}</TableCell>
                                            <TableCell>
                                              <Badge variant={member.pivot?.role === 'ketua' ? 'default' : 'outline'} className="text-xs">
                                                {getRoleLabel(member.pivot?.role || 'anggota')}
                                              </Badge>
                                            </TableCell>
                                            <TableCell>
                                              <Badge variant={member.status === 'Aktif' ? 'default' : 'secondary'} className="text-xs">
                                                {member.status}
                                              </Badge>
                                            </TableCell>
                                          </TableRow>
                                        ))}
                                      </TableBody>
                                    </Table>
                                  </div>
                                ) : (
                                  <p className="text-sm text-muted-foreground py-4 text-center">
                                    Belum ada anggota dalam kelompok ini
                                  </p>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </>
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

      {/* Add Kelompok Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Tambah Kelompok Kader Baru</DialogTitle>
            <DialogDescription>
              Isi data untuk menambahkan kelompok kader baru (3-6 anggota)
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
                <Label htmlFor="nama">Nama Kelompok *</Label>
                <Input
                  id="nama"
                  value={formData.nama}
                  onChange={(e) => setFormData(prev => ({ ...prev, nama: e.target.value }))}
                  placeholder="Contoh: Kelompok Melati"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="kode">Kode Kelompok</Label>
                <Input
                  id="kode"
                  value={formData.kode}
                  onChange={(e) => setFormData(prev => ({ ...prev, kode: e.target.value }))}
                  placeholder="Contoh: KK-001"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="jorong">Jorong</Label>
                <Select 
                  value={formData.jorong || ''} 
                  onValueChange={(v: string) => setFormData(prev => ({ ...prev, jorong: v }))}
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
                <Label htmlFor="ketua">Ketua Kelompok</Label>
                <Select 
                  value={formData.ketua_id?.toString() || ''} 
                  onValueChange={(v: string) => {
                    const ketuaId = parseInt(v);
                    setFormData(prev => ({ 
                      ...prev, 
                      ketua_id: ketuaId,
                      members: prev.members?.includes(ketuaId) ? prev.members : [...(prev.members || []), ketuaId]
                    }));
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih ketua" />
                  </SelectTrigger>
                  <SelectContent>
                    {config?.kader_options?.map(kader => (
                      <SelectItem key={kader.id} value={kader.id.toString()}>
                        {kader.nama} {kader.jenis ? `(${kader.jenis})` : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="deskripsi">Deskripsi</Label>
              <Textarea
                id="deskripsi"
                value={formData.deskripsi}
                onChange={(e) => setFormData(prev => ({ ...prev, deskripsi: e.target.value }))}
                placeholder="Deskripsi kelompok"
                rows={2}
              />
            </div>

            {/* Members Selection */}
            <div className="space-y-3">
              <Label>Anggota Kelompok ({formData.members?.length || 0}/6)</Label>
              <div className="border rounded-lg p-4 max-h-48 overflow-y-auto">
                <div className="grid grid-cols-2 gap-2">
                  {config?.kader_options?.map(kader => (
                    <div key={kader.id} className="flex items-center gap-2 p-2 rounded hover:bg-muted">
                      <Checkbox
                        id={`member-${kader.id}`}
                        checked={formData.members?.includes(kader.id) || false}
                        onCheckedChange={() => toggleMember(kader.id)}
                        disabled={!formData.members?.includes(kader.id) && (formData.members?.length || 0) >= 6}
                      />
                      <Label htmlFor={`member-${kader.id}`} className="text-sm cursor-pointer flex-1">
                        {kader.nama}
                        {kader.jenis && <span className="text-muted-foreground ml-1">({kader.jenis})</span>}
                        {formData.ketua_id === kader.id && <Badge className="ml-2 text-xs">Ketua</Badge>}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
              <p className="text-xs text-muted-foreground">Pilih 3-6 kader sebagai anggota kelompok</p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Batal
            </Button>
            <Button 
              onClick={handleAddKelompok} 
              disabled={formLoading || !formData.nama || (formData.members?.length || 0) < 3}
            >
              {formLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Simpan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Kelompok Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={(open: boolean) => {
        setIsEditDialogOpen(open);
        if (!open) {
          setSelectedKelompok(null);
          setFormError(null);
        }
      }}>
        <DialogContent className="max-w-5xl w-[95vw] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Kelompok Kader</DialogTitle>
            <DialogDescription>
              Ubah data kelompok kader {selectedKelompok?.nama}
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
                <Label htmlFor="edit-nama">Nama Kelompok *</Label>
                <Input
                  id="edit-nama"
                  value={formData.nama}
                  onChange={(e) => setFormData(prev => ({ ...prev, nama: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-kode">Kode Kelompok</Label>
                <Input
                  id="edit-kode"
                  value={formData.kode}
                  onChange={(e) => setFormData(prev => ({ ...prev, kode: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-jorong">Jorong</Label>
                <Select 
                  value={formData.jorong || ''} 
                  onValueChange={(v: string) => setFormData(prev => ({ ...prev, jorong: v }))}
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
                <Label htmlFor="edit-status">Status</Label>
                <Select 
                  value={formData.is_active ? 'true' : 'false'} 
                  onValueChange={(v: string) => setFormData(prev => ({ ...prev, is_active: v === 'true' }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Aktif</SelectItem>
                    <SelectItem value="false">Tidak Aktif</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-deskripsi">Deskripsi</Label>
              <Textarea
                id="edit-deskripsi"
                value={formData.deskripsi}
                onChange={(e) => setFormData(prev => ({ ...prev, deskripsi: e.target.value }))}
                rows={2}
              />
            </div>

            {/* Members Table */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Anggota Kelompok ({selectedKelompok?.members?.length || 0}/6)</Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedMemberToAdd(null);
                    setMemberRole('anggota');
                    setIsAddMemberDialogOpen(true);
                  }}
                  disabled={(selectedKelompok?.members?.length || 0) >= 6}
                >
                  <UserPlus className="h-4 w-4 mr-1" />
                  Tambah Anggota
                </Button>
              </div>
              
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">No</TableHead>
                      <TableHead>Nama</TableHead>
                      <TableHead>Jenis</TableHead>
                      <TableHead>No HP</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedKelompok?.members && selectedKelompok.members.length > 0 ? (
                      selectedKelompok.members.map((member, index) => (
                        <TableRow key={member.id}>
                          <TableCell className="text-muted-foreground">{index + 1}</TableCell>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              {member.pivot?.role === 'ketua' && <Crown className="h-4 w-4 text-yellow-500" />}
                              {member.nama}
                            </div>
                          </TableCell>
                          <TableCell>{member.jenis || '-'}</TableCell>
                          <TableCell>{member.no_hp || '-'}</TableCell>
                          <TableCell>
                            <Badge variant={member.pivot?.role === 'ketua' ? 'default' : 'outline'} className="text-xs">
                              {getRoleLabel(member.pivot?.role || 'anggota')}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                              onClick={() => handleRemoveMember(member.id)}
                              disabled={formLoading}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                          Belum ada anggota. Klik "Tambah Anggota" untuk menambahkan.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Batal
            </Button>
            <Button 
              onClick={handleEditKelompok} 
              disabled={formLoading || !formData.nama}
            >
              {formLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Simpan Perubahan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Member Dialog */}
      <Dialog open={isAddMemberDialogOpen} onOpenChange={setIsAddMemberDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tambah Anggota</DialogTitle>
            <DialogDescription>
              Pilih kader untuk ditambahkan ke kelompok {selectedKelompok?.nama}
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
              <Label>Pilih Kader</Label>
              <Select 
                value={selectedMemberToAdd?.toString() || ''} 
                onValueChange={(v: string) => setSelectedMemberToAdd(parseInt(v))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih kader..." />
                </SelectTrigger>
                <SelectContent>
                  {getAvailableKaders().map(kader => (
                    <SelectItem key={kader.id} value={kader.id.toString()}>
                      {kader.nama} {kader.jenis ? `(${kader.jenis})` : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Role dalam Kelompok</Label>
              <Select value={memberRole} onValueChange={setMemberRole}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ketua">Ketua</SelectItem>
                  <SelectItem value="wakil">Wakil Ketua</SelectItem>
                  <SelectItem value="anggota">Anggota</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddMemberDialogOpen(false)}>
              Batal
            </Button>
            <Button 
              onClick={handleAddMember} 
              disabled={formLoading || !selectedMemberToAdd}
            >
              {formLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Tambah
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Kelompok Kader</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus kelompok <strong>{selectedKelompok?.nama}</strong>?
              Semua anggota akan dikeluarkan dari kelompok. Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteKelompok}
              className="bg-red-600 hover:bg-red-700"
              disabled={formLoading}
            >
              {formLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default KelompokKaderManagement;
