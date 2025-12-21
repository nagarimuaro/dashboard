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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Label } from "../ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { ScrollArea } from "../ui/scroll-area";
import {
  HeartPulse,
  Search,
  Plus,
  Eye,
  Edit,
  Trash2,
  AlertTriangle,
  Calendar,
  User,
  History,
  FileText,
  Activity,
  RefreshCw,
  Loader2,
  X,
  CheckCircle,
} from "lucide-react";
import { toast } from "sonner";
import posyanduService, { Kehamilan, AncRecord } from "@/services/posyanduService";
import apiClient from "@/services/apiClient";

interface HistoriPemeriksaan {
  id: number;
  tanggal: string;
  usia_kehamilan: number;
  berat_badan: number;
  tekanan_darah: string;
  tinggi_fundus: number;
  detak_jantung_janin: number;
  keluhan: string;
  tindakan: string;
  petugas: string;
}

interface DataKehamilan extends Kehamilan {
  nama_ibu?: string;
  nik_ibu?: string;
  usia_ibu?: number;
  histori?: HistoriPemeriksaan[];
}

interface KaderKehamilanProps {
  userRole: string;
  embedded?: boolean;
}

const KaderKehamilan: React.FC<KaderKehamilanProps> = ({ userRole, embedded }) => {
  const [data, setData] = useState<DataKehamilan[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [showFormDialog, setShowFormDialog] = useState(false);
  const [selectedData, setSelectedData] = useState<DataKehamilan | null>(null);
  const [editingData, setEditingData] = useState<DataKehamilan | null>(null);
  const [ancRecords, setAncRecords] = useState<AncRecord[]>([]);
  const [loadingAnc, setLoadingAnc] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 15,
    total: 0,
  });
  
  // Form state
  const [formData, setFormData] = useState({
    warga_id: 0,
    tanggal_hpht: '',
    gravida: 1,
    paritas: 0,
    abortus: 0,
    status_risiko: 'Rendah' as 'Rendah' | 'Tinggi' | 'Sangat Tinggi',
    faktor_risiko: [] as string[],
    keterangan: '',
  });
  
  // Warga selection state
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
        // Validate that warga is female for kehamilan
        if (response.data.jenis_kelamin !== 'P') {
          setSelectedWarga(null);
          toast.error('Hanya warga perempuan yang bisa didaftarkan kehamilan');
          return;
        }
        setSelectedWarga(response.data);
        setFormData(prev => ({ ...prev, warga_id: response.data.id }));
        toast.success('Warga ditemukan');
      } else {
        setSelectedWarga(null);
        toast.error('Warga tidak ditemukan');
      }
    } catch (error) {
      console.error('Error searching warga:', error);
      setSelectedWarga(null);
      toast.error('Warga tidak ditemukan');
    } finally {
      setSearchingWarga(false);
    }
  };

  const clearSelectedWarga = () => {
    setSelectedWarga(null);
    setSearchNik('');
    setFormData(prev => ({ ...prev, warga_id: 0 }));
  };

  // Load data from API
  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await posyanduService.getKehamilanAktif({
        page: pagination.current_page,
        per_page: pagination.per_page,
        ...(searchQuery ? { search: searchQuery } : {}),
      });
      
      // Transform API response to component format
      const dataArray = response.data || response || [];
      const transformedData: DataKehamilan[] = (Array.isArray(dataArray) ? dataArray : []).map((item: Kehamilan) => ({
        ...item,
        nama_ibu: item.warga?.nama || 'N/A',
        nik_ibu: item.warga?.nik || 'N/A',
        usia_ibu: item.warga?.tanggal_lahir 
          ? Math.floor((new Date().getTime() - new Date(item.warga.tanggal_lahir).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
          : undefined,
      }));
      
      setData(transformedData);
      setPagination({
        current_page: response.current_page,
        last_page: response.last_page,
        per_page: response.per_page,
        total: response.total,
      });
    } catch (err: any) {
      console.error('Failed to load kehamilan data:', err);
      setError(err.message || 'Gagal memuat data kehamilan');
      toast.error('Gagal memuat data kehamilan');
    } finally {
      setLoading(false);
    }
  }, [pagination.current_page, pagination.per_page, searchQuery]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Load ANC records for selected kehamilan
  const loadAncRecords = async (kehamilanId: number) => {
    setLoadingAnc(true);
    try {
      const records = await posyanduService.getAncRecords(kehamilanId);
      setAncRecords(records);
    } catch (err) {
      console.error('Failed to load ANC records:', err);
      toast.error('Gagal memuat riwayat pemeriksaan');
    } finally {
      setLoadingAnc(false);
    }
  };

  const handleViewDetail = async (item: DataKehamilan) => {
    setSelectedData(item);
    setShowDetailDialog(true);
    await loadAncRecords(item.id);
  };

  const handleRefresh = () => {
    loadData();
  };

  const handleAdd = () => {
    setEditingData(null);
    setFormData({
      warga_id: 0,
      tanggal_hpht: '',
      gravida: 1,
      paritas: 0,
      abortus: 0,
      status_risiko: 'Rendah',
      faktor_risiko: [],
      keterangan: '',
    });
    setSelectedWarga(null);
    setSearchNik('');
    setShowFormDialog(true);
  };

  const handleEdit = (item: DataKehamilan) => {
    setEditingData(item);
    setFormData({
      warga_id: item.warga_id || 0,
      tanggal_hpht: item.tanggal_hpht || '',
      gravida: item.gravida || 1,
      paritas: item.paritas || item.para || 0,
      abortus: item.abortus || 0,
      status_risiko: (item.status_risiko as any) || 'Rendah',
      faktor_risiko: (Array.isArray(item.faktor_risiko) ? item.faktor_risiko : []) as string[],
      keterangan: item.keterangan || item.catatan || '',
    });
    // Set selected warga from existing data
    if (item.warga_id && item.warga) {
      setSelectedWarga({
        id: item.warga_id,
        nama: item.warga.nama,
        nik: item.warga.nik,
        tanggal_lahir: item.warga.tanggal_lahir,
        alamat: item.warga.alamat,
        jorong: item.warga.jorong,
      });
    } else if (item.warga_id) {
      setSelectedWarga({
        id: item.warga_id,
        nama: item.nama_ibu || 'N/A',
        nik: item.nik_ibu || 'N/A',
      });
    }
    setShowFormDialog(true);
  };

  const handleSubmit = async () => {
    if (!formData.warga_id || formData.warga_id === 0) {
      toast.error('Pilih ibu hamil terlebih dahulu');
      return;
    }
    if (!formData.tanggal_hpht) {
      toast.error('Tanggal HPHT wajib diisi');
      return;
    }

    setSubmitting(true);
    try {
      // Prepare clean payload for API
      const payload = {
        warga_id: formData.warga_id,
        tanggal_hpht: formData.tanggal_hpht,
        gravida: formData.gravida || 1,
        paritas: formData.paritas || 0,
        abortus: formData.abortus || 0,
        status_risiko: formData.status_risiko || 'Rendah',
        faktor_risiko: formData.faktor_risiko || [],
        keterangan: formData.keterangan || null,
      };

      if (editingData) {
        await posyanduService.updateKehamilan(editingData.id, payload);
        toast.success('Data kehamilan berhasil diperbarui');
      } else {
        await posyanduService.createKehamilan(payload);
        toast.success('Data kehamilan berhasil ditambahkan');
      }
      setShowFormDialog(false);
      setFormData({
        warga_id: 0,
        tanggal_hpht: '',
        gravida: 1,
        paritas: 0,
        abortus: 0,
        status_risiko: 'Rendah',
        faktor_risiko: [],
        keterangan: '',
      });
      setSelectedWarga(null);
      setSearchNik('');
      loadData();
    } catch (err: any) {
      console.error('Failed to save kehamilan:', err);
      toast.error('Gagal menyimpan data: ' + (err.message || 'Unknown error'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Apakah Anda yakin ingin menghapus data ini?')) return;
    
    try {
      await posyanduService.deleteKehamilan(id);
      toast.success('Data berhasil dihapus');
      loadData();
    } catch (err: any) {
      toast.error(err.message || 'Gagal menghapus data');
    }
  };

  const filteredData = data.filter(
    (item) =>
      item.nama_ibu.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.nik_ibu.includes(searchQuery)
  );

  const getRisikoBadge = (status: string) => {
    const s = status?.toLowerCase();
    switch (s) {
      case "rendah":
        return <Badge className="bg-green-100 text-green-800">Rendah</Badge>;
      case "sedang":
        return <Badge className="bg-yellow-100 text-yellow-800">Sedang</Badge>;
      case "tinggi":
        return <Badge className="bg-red-100 text-red-800">Tinggi</Badge>;
      case "sangat tinggi":
        return <Badge className="bg-red-200 text-red-900">Sangat Tinggi</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Data Kehamilan</h1>
          <p className="text-muted-foreground">
            Pantau data kehamilan ibu di wilayah Anda
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
            <CardTitle className="text-sm font-medium">Total Ibu Hamil</CardTitle>
            <HeartPulse className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pagination.total || data.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Risiko Tinggi</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {data.filter((d) => d.status_risiko === "tinggi").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Trimester 3</CardTitle>
            <Calendar className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {data.filter((d) => d.trimester === 3).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Risiko Rendah</CardTitle>
            <HeartPulse className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {data.filter((d) => d.status_risiko === "rendah").length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <CardTitle>Daftar Ibu Hamil</CardTitle>
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
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : data.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <HeartPulse className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Belum ada data kehamilan</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama Ibu</TableHead>
                  <TableHead>Usia</TableHead>
                  <TableHead>Usia Kehamilan</TableHead>
                  <TableHead>Trimester</TableHead>
                  <TableHead>Status Risiko</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{item.nama_ibu}</div>
                        <div className="text-sm text-muted-foreground">
                          NIK: {item.nik_ibu}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{item.usia_ibu || '-'} tahun</TableCell>
                    <TableCell>{item.usia_kehamilan_minggu || item.usia_kehamilan || '-'} minggu</TableCell>
                    <TableCell>Trimester {item.trimester || '-'}</TableCell>
                    <TableCell>{getRisikoBadge(item.status_risiko)}</TableCell>
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
          )}
        </CardContent>
      </Card>

      {/* Detail Dialog dengan Histori */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <HeartPulse className="h-5 w-5 text-rose-500" />
              Detail Kehamilan
            </DialogTitle>
            <DialogDescription>
              Informasi lengkap data kehamilan dan histori pemeriksaan
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
                  Histori Pemeriksaan ({ancRecords.length})
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="info" className="mt-4">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-muted-foreground">Nama Ibu</Label>
                      <p className="font-medium">{selectedData.nama_ibu}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">NIK</Label>
                      <p className="font-medium">{selectedData.nik_ibu}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Usia Ibu</Label>
                      <p className="font-medium">{selectedData.usia_ibu || '-'} tahun</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Tanggal HPHT</Label>
                      <p className="font-medium">{selectedData.tanggal_hpht}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Usia Kehamilan</Label>
                      <p className="font-medium">{selectedData.usia_kehamilan} minggu</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Trimester</Label>
                      <p className="font-medium">Trimester {selectedData.trimester}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Status Risiko</Label>
                      <div className="mt-1">{getRisikoBadge(selectedData.status_risiko)}</div>
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
                  {loadingAnc ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    </div>
                  ) : ancRecords.length > 0 ? (
                    <div className="space-y-4">
                      {ancRecords.map((h, index) => (
                        <Card key={h.id} className={index === 0 ? "border-rose-200 bg-rose-50/50" : ""}>
                          <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <span className="font-semibold">{h.tanggal_pemeriksaan}</span>
                                {index === 0 && (
                                  <Badge className="bg-rose-100 text-rose-700">Terbaru</Badge>
                                )}
                              </div>
                              <Badge variant="outline">K-{h.kunjungan_ke} Minggu ke-{h.usia_kehamilan}</Badge>
                            </div>
                          </CardHeader>
                          <CardContent className="pt-2">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                              <div>
                                <span className="text-muted-foreground">BB:</span>
                                <span className="ml-1 font-medium">{h.berat_badan || '-'} kg</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">TD:</span>
                                <span className="ml-1 font-medium">{h.tekanan_darah_sistolik || '-'}/{h.tekanan_darah_diastolik || '-'} mmHg</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">TFU:</span>
                                <span className="ml-1 font-medium">{h.tinggi_fundus || '-'} cm</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">DJJ:</span>
                                <span className="ml-1 font-medium">{h.denyut_jantung_janin || '-'} bpm</span>
                              </div>
                            </div>
                            <div className="mt-3 space-y-2 text-sm">
                              {h.keluhan && (
                                <div>
                                  <span className="text-muted-foreground">Keluhan:</span>
                                  <span className="ml-1">{h.keluhan}</span>
                                </div>
                              )}
                              {h.tindakan && (
                                <div>
                                  <span className="text-muted-foreground">Tindakan:</span>
                                  <span className="ml-1">{h.tindakan}</span>
                                </div>
                              )}
                              {h.petugas && (
                                <div className="pt-2 border-t">
                                  <span className="text-muted-foreground">Petugas:</span>
                                  <span className="ml-1 font-medium">{h.petugas}</span>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                      <History className="h-12 w-12 mb-2 opacity-50" />
                      <p>Belum ada histori pemeriksaan</p>
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
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <HeartPulse className="h-5 w-5 text-rose-500" />
              {editingData ? 'Edit Data Kehamilan' : 'Tambah Data Kehamilan'}
            </DialogTitle>
            <DialogDescription>
              {editingData ? 'Perbarui informasi kehamilan' : 'Tambah data kehamilan baru'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {/* Warga Selection */}
            <div className="space-y-3 p-4 border rounded-lg bg-gray-50">
              <Label className="text-base font-semibold">Data Ibu Hamil *</Label>
              
              {selectedWarga ? (
                <div className="flex items-start justify-between p-3 bg-white rounded-lg border border-green-200">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                    <div>
                      <p className="font-medium">{selectedWarga.nama}</p>
                      <p className="text-sm text-muted-foreground">NIK: {selectedWarga.nik}</p>
                      {selectedWarga.alamat && (
                        <p className="text-sm text-muted-foreground">{selectedWarga.alamat}</p>
                      )}
                    </div>
                  </div>
                  {!editingData && (
                    <Button variant="ghost" size="sm" onClick={clearSelectedWarga}>
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Masukkan NIK (16 digit)"
                      value={searchNik}
                      onChange={(e) => setSearchNik(e.target.value.replace(/\D/g, '').slice(0, 16))}
                      className="flex-1"
                    />
                    <Button 
                      onClick={handleSearchWarga} 
                      disabled={searchingWarga || searchNik.length < 16}
                    >
                      {searchingWarga ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Search className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Cari ibu hamil berdasarkan NIK untuk mendaftarkan kehamilan
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="tanggal_hpht">Tanggal HPHT *</Label>
              <Input
                id="tanggal_hpht"
                type="date"
                value={formData.tanggal_hpht}
                onChange={(e) => setFormData({ ...formData, tanggal_hpht: e.target.value })}
              />
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="gravida">Gravida</Label>
                <Input
                  id="gravida"
                  type="number"
                  min="1"
                  value={formData.gravida}
                  onChange={(e) => setFormData({ ...formData, gravida: parseInt(e.target.value) || 1 })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="paritas">Paritas</Label>
                <Input
                  id="paritas"
                  type="number"
                  min="0"
                  value={formData.paritas}
                  onChange={(e) => setFormData({ ...formData, paritas: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="abortus">Abortus</Label>
                <Input
                  id="abortus"
                  type="number"
                  min="0"
                  value={formData.abortus}
                  onChange={(e) => setFormData({ ...formData, abortus: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="status_risiko">Status Risiko</Label>
              <Select 
                value={formData.status_risiko} 
                onValueChange={(v) => setFormData({ ...formData, status_risiko: v as 'Rendah' | 'Tinggi' | 'Sangat Tinggi' })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih status risiko" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Rendah">Rendah</SelectItem>
                  <SelectItem value="Tinggi">Tinggi</SelectItem>
                  <SelectItem value="Sangat Tinggi">Sangat Tinggi</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="keterangan">Keterangan</Label>
              <Input
                id="keterangan"
                value={formData.keterangan}
                onChange={(e) => setFormData({ ...formData, keterangan: e.target.value })}
                placeholder="Catatan/keterangan tambahan..."
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

export default KaderKehamilan;
