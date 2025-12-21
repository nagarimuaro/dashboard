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
import {
  Baby,
  Search,
  Plus,
  Eye,
  Edit,
  Trash2,
  Heart,
  Scale,
  Ruler,
  Calendar,
  RefreshCw,
  Loader2,
  X,
  CheckCircle,
  User,
} from "lucide-react";
import { toast } from "sonner";
import posyanduService, { Persalinan, Kehamilan } from "@/services/posyanduService";

interface DataPersalinan extends Persalinan {
  nama_ibu?: string;
  ibu_id?: number;
  ibu?: {
    id: number;
    nama: string;
    nik?: string;
    tanggal_lahir?: string;
  };
}

interface KaderPersalinanProps {
  userRole: string;
  embedded?: boolean;
}

const KaderPersalinan: React.FC<KaderPersalinanProps> = ({ userRole, embedded }) => {
  const [data, setData] = useState<DataPersalinan[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [showFormDialog, setShowFormDialog] = useState(false);
  const [selectedData, setSelectedData] = useState<DataPersalinan | null>(null);
  const [editingData, setEditingData] = useState<DataPersalinan | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 15,
    total: 0,
  });
  
  // Form state
  const [formData, setFormData] = useState({
    warga_id: 0,
    data_kehamilan_id: undefined as number | undefined,
    kehamilan_id: undefined as number | undefined,
    tanggal_persalinan: '',
    tempat_persalinan: '',
    jenis_persalinan: 'Spontan/Normal' as string,
    penolong_persalinan: '',
    nama_penolong: '',
    kondisi_ibu: 'Baik' as string,
    komplikasi_ibu: '',
    kondisi_bayi: 'Hidup Sehat' as string,
    berat_lahir_gram: 0,
    panjang_lahir_cm: 0,
    jenis_kelamin_bayi: 'L' as 'L' | 'P',
    nama_bayi: '',
    catatan: '',
  });

  // Kehamilan selection state
  const [kehamilanList, setKehamilanList] = useState<Kehamilan[]>([]);
  const [loadingKehamilan, setLoadingKehamilan] = useState(false);
  const [selectedKehamilan, setSelectedKehamilan] = useState<Kehamilan | null>(null);

  // Load active kehamilan for selection
  const loadKehamilanAktif = useCallback(async () => {
    setLoadingKehamilan(true);
    try {
      const response = await posyanduService.getKehamilanAktif({ per_page: 100 });
      const dataArray = response.data || response || [];
      setKehamilanList(Array.isArray(dataArray) ? dataArray : []);
    } catch (err) {
      console.error('Failed to load kehamilan aktif:', err);
      toast.error('Gagal memuat data kehamilan aktif');
    } finally {
      setLoadingKehamilan(false);
    }
  }, []);

  // Handle kehamilan selection
  const handleSelectKehamilan = (kehamilanId: number) => {
    const kehamilan = kehamilanList.find(k => k.id === kehamilanId);
    if (kehamilan) {
      setSelectedKehamilan(kehamilan);
      setFormData({
        ...formData,
        data_kehamilan_id: kehamilan.id,
        kehamilan_id: kehamilan.id,
        warga_id: kehamilan.warga_id,
      });
    }
  };

  const clearSelectedKehamilan = () => {
    setSelectedKehamilan(null);
    setFormData({
      ...formData,
      data_kehamilan_id: undefined,
      kehamilan_id: undefined,
      warga_id: 0,
    });
  };

  // Load data from API
  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await posyanduService.getPersalinan({
        page: pagination.current_page,
        per_page: pagination.per_page,
        ...(searchQuery ? { search: searchQuery } : {}),
      });
      
      // Transform API response to component format
      const dataArray = response.data || response || [];
      const transformedData: DataPersalinan[] = (Array.isArray(dataArray) ? dataArray : []).map((item: Persalinan) => ({
        ...item,
        nama_ibu: item.ibu?.nama || item.warga?.nama || item.nama_ibu || 'N/A',
        ibu_id: item.ibu_warga_id || item.warga_id,
      }));
      
      setData(transformedData);
      setPagination({
        current_page: response.current_page,
        last_page: response.last_page,
        per_page: response.per_page,
        total: response.total,
      });
    } catch (err: any) {
      console.error('Failed to load persalinan data:', err);
      setError(err.message || 'Gagal memuat data persalinan');
      toast.error('Gagal memuat data persalinan');
    } finally {
      setLoading(false);
    }
  }, [pagination.current_page, pagination.per_page, searchQuery]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRefresh = () => {
    loadData();
  };

  const handleViewDetail = (item: DataPersalinan) => {
    setSelectedData(item);
    setShowDetailDialog(true);
  };

  const handleAdd = () => {
    setEditingData(null);
    setFormData({
      warga_id: 0,
      data_kehamilan_id: undefined,
      kehamilan_id: undefined,
      tanggal_persalinan: '',
      tempat_persalinan: '',
      jenis_persalinan: 'Spontan/Normal',
      penolong_persalinan: '',
      nama_penolong: '',
      kondisi_ibu: 'Baik',
      komplikasi_ibu: '',
      kondisi_bayi: 'Hidup Sehat',
      berat_lahir_gram: 0,
      panjang_lahir_cm: 0,
      jenis_kelamin_bayi: 'L',
      nama_bayi: '',
      catatan: '',
    });
    setSelectedKehamilan(null);
    loadKehamilanAktif();
    setShowFormDialog(true);
  };

  const handleEdit = (item: DataPersalinan) => {
    setEditingData(item);
    setFormData({
      warga_id: item.warga_id || item.ibu_warga_id || 0,
      data_kehamilan_id: item.data_kehamilan_id || item.kehamilan_id,
      kehamilan_id: item.kehamilan_id || item.data_kehamilan_id,
      tanggal_persalinan: item.tanggal_persalinan || '',
      tempat_persalinan: item.tempat_persalinan || '',
      jenis_persalinan: item.jenis_persalinan || 'Spontan/Normal',
      penolong_persalinan: item.penolong_persalinan || item.penolong || '',
      nama_penolong: item.nama_penolong || '',
      kondisi_ibu: item.kondisi_ibu || 'Baik',
      komplikasi_ibu: item.komplikasi_ibu || '',
      kondisi_bayi: item.kondisi_bayi || 'Hidup Sehat',
      berat_lahir_gram: item.berat_lahir_gram || item.berat_bayi || 0,
      panjang_lahir_cm: item.panjang_lahir_cm || item.panjang_bayi || 0,
      jenis_kelamin_bayi: item.jenis_kelamin_bayi || 'L',
      nama_bayi: item.nama_bayi || '',
      catatan: item.catatan || '',
    });
    // Set selected kehamilan from existing data
    if (item.data_kehamilan_id || item.kehamilan_id) {
      const kehamilanId = item.data_kehamilan_id || item.kehamilan_id;
      // Create a pseudo-kehamilan object from available data
      setSelectedKehamilan({
        id: kehamilanId!,
        warga_id: item.warga_id || item.ibu_warga_id || 0,
        nama_ibu: item.ibu?.nama || item.nama_ibu || 'N/A',
        nik_ibu: item.ibu?.nik,
        tanggal_hpht: '',
        gravida: 0,
        abortus: 0,
        status_risiko: 'Rendah',
        status: 'Hamil',
        created_at: '',
        updated_at: '',
        warga: item.ibu ? {
          id: item.ibu.id,
          nama: item.ibu.nama,
          nik: item.ibu.nik || '',
          tanggal_lahir: item.ibu.tanggal_lahir || '',
        } : undefined,
      });
    }
    loadKehamilanAktif();
    setShowFormDialog(true);
  };

  const handleSubmit = async () => {
    if (!editingData && !formData.data_kehamilan_id) {
      toast.error('Pilih data kehamilan ibu terlebih dahulu');
      return;
    }
    if (!formData.tanggal_persalinan) {
      toast.error('Tanggal persalinan wajib diisi');
      return;
    }
    if (!formData.tempat_persalinan) {
      toast.error('Tempat persalinan wajib diisi');
      return;
    }
    if (!formData.jenis_persalinan) {
      toast.error('Jenis persalinan wajib diisi');
      return;
    }
    if (!formData.berat_lahir_gram || formData.berat_lahir_gram < 500) {
      toast.error('Berat lahir wajib diisi (minimal 500 gram)');
      return;
    }
    if (!formData.panjang_lahir_cm || formData.panjang_lahir_cm < 20) {
      toast.error('Panjang lahir wajib diisi (minimal 20 cm)');
      return;
    }

    setSubmitting(true);
    try {
      // Prepare clean payload for API (only required fields)
      const payload = {
        data_kehamilan_id: formData.data_kehamilan_id,
        tanggal_persalinan: formData.tanggal_persalinan,
        tempat_persalinan: formData.tempat_persalinan,
        jenis_persalinan: formData.jenis_persalinan,
        penolong_persalinan: formData.penolong_persalinan || null,
        nama_penolong: formData.nama_penolong || null,
        kondisi_ibu: formData.kondisi_ibu || 'Baik',
        komplikasi_ibu: formData.komplikasi_ibu || null,
        kondisi_bayi: formData.kondisi_bayi || 'Hidup Sehat',
        berat_lahir_gram: Number(formData.berat_lahir_gram),
        panjang_lahir_cm: Number(formData.panjang_lahir_cm),
        jenis_kelamin_bayi: formData.jenis_kelamin_bayi,
        nama_bayi: formData.nama_bayi || null,
        catatan: formData.catatan || null,
      };

      if (editingData) {
        await posyanduService.updatePersalinan(editingData.id, payload);
        toast.success('Data persalinan berhasil diperbarui');
      } else {
        await posyanduService.createPersalinan(payload);
        toast.success('Data persalinan berhasil ditambahkan');
      }
      setShowFormDialog(false);
      setFormData({
        warga_id: 0,
        data_kehamilan_id: undefined,
        kehamilan_id: undefined,
        tanggal_persalinan: '',
        tempat_persalinan: '',
        jenis_persalinan: 'Spontan/Normal',
        penolong_persalinan: '',
        nama_penolong: '',
        kondisi_ibu: 'Baik',
        komplikasi_ibu: '',
        kondisi_bayi: 'Hidup Sehat',
        berat_lahir_gram: 0,
        panjang_lahir_cm: 0,
        jenis_kelamin_bayi: 'L',
        nama_bayi: '',
        catatan: '',
      });
      setSelectedKehamilan(null);
      loadData();
    } catch (err: any) {
      console.error('Failed to save persalinan:', err);
      toast.error('Gagal menyimpan data: ' + (err.message || 'Unknown error'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Apakah Anda yakin ingin menghapus data ini?')) return;
    
    try {
      await posyanduService.deletePersalinan(id);
      toast.success('Data berhasil dihapus');
      loadData();
    } catch (err: any) {
      toast.error(err.message || 'Gagal menghapus data');
    }
  };

  const getKondisiBadge = (kondisi: string, type: "ibu" | "bayi") => {
    const k = kondisi?.toLowerCase();
    if (k === "sehat" || k === "baik" || k === "hidup sehat") {
      return <Badge className="bg-green-100 text-green-800">Sehat</Badge>;
    }
    if (k === "meninggal") {
      return <Badge className="bg-red-100 text-red-800">Meninggal</Badge>;
    }
    if (k === "hidup dengan kelainan") {
      return <Badge className="bg-yellow-100 text-yellow-800">Ada Kelainan</Badge>;
    }
    return (
      <Badge className="bg-yellow-100 text-yellow-800">
        {type === "ibu" ? "Komplikasi" : "Perlu Perawatan"}
      </Badge>
    );
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Data Persalinan</h1>
          <p className="text-muted-foreground">
            Data kelahiran bayi di wilayah Anda
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
            <CardTitle className="text-sm font-medium">Total Kelahiran</CardTitle>
            <Baby className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pagination.total || data.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bayi Laki-laki</CardTitle>
            <Baby className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {data.filter((d) => d.jenis_kelamin_bayi === "L").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bayi Perempuan</CardTitle>
            <Baby className="h-4 w-4 text-pink-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-pink-600">
              {data.filter((d) => d.jenis_kelamin_bayi === "P").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Perlu Perawatan</CardTitle>
            <Heart className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {data.filter((d) => d.kondisi_bayi?.toLowerCase().includes("kelainan") || d.kondisi_bayi === "perlu_perawatan").length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <CardTitle>Daftar Kelahiran</CardTitle>
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Cari nama ibu atau bayi..."
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
              <Baby className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Belum ada data persalinan</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama Bayi</TableHead>
                  <TableHead>Nama Ibu</TableHead>
                  <TableHead>Tanggal Lahir</TableHead>
                  <TableHead>JK</TableHead>
                  <TableHead>Berat/Panjang</TableHead>
                  <TableHead>Kondisi</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.nama_bayi || '-'}</TableCell>
                    <TableCell>{item.nama_ibu || '-'}</TableCell>
                    <TableCell>{item.tanggal_persalinan}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          item.jenis_kelamin_bayi === "L"
                            ? "border-blue-300 text-blue-600"
                            : "border-pink-300 text-pink-600"
                        }
                      >
                        {item.jenis_kelamin_bayi === "L" ? "Laki-laki" : "Perempuan"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="flex items-center gap-1">
                          <Scale className="h-3 w-3" />
                          {item.berat_lahir_gram || item.berat_bayi || '-'} gr
                        </div>
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Ruler className="h-3 w-3" />
                          {item.panjang_lahir_cm || item.panjang_bayi || '-'} cm
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {getKondisiBadge(item.kondisi_bayi, "bayi")}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewDetail(item)}
                        >
                          <Eye className="h-4 w-4" />
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

      {/* Detail Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Detail Persalinan</DialogTitle>
            <DialogDescription>
              Informasi lengkap data kelahiran
            </DialogDescription>
          </DialogHeader>
          {selectedData && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Nama Bayi</Label>
                  <p className="font-medium">{selectedData.nama_bayi || '-'}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Nama Ibu</Label>
                  <p className="font-medium">{selectedData.nama_ibu || '-'}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Tanggal Lahir</Label>
                  <p className="font-medium">{selectedData.tanggal_persalinan || '-'}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Jenis Kelamin</Label>
                  <p className="font-medium">
                    {selectedData.jenis_kelamin_bayi === "L" ? "Laki-laki" : "Perempuan"}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Berat Lahir</Label>
                  <p className="font-medium">{selectedData.berat_lahir_gram || selectedData.berat_bayi || '-'} gram</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Panjang Lahir</Label>
                  <p className="font-medium">{selectedData.panjang_lahir_cm || selectedData.panjang_bayi || '-'} cm</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Tempat Persalinan</Label>
                  <p className="font-medium">{selectedData.tempat_persalinan || '-'}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Penolong</Label>
                  <p className="font-medium">{selectedData.penolong_persalinan || selectedData.penolong || selectedData.nama_penolong || '-'}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Jenis Persalinan</Label>
                  <p className="font-medium">{selectedData.jenis_persalinan || '-'}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Kondisi Ibu</Label>
                  <div className="mt-1">{getKondisiBadge(selectedData.kondisi_ibu, "ibu")}</div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Kondisi Bayi</Label>
                  <div className="mt-1">{getKondisiBadge(selectedData.kondisi_bayi, "bayi")}</div>
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
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Baby className="h-5 w-5 text-indigo-500" />
              {editingData ? 'Edit Data Persalinan' : 'Tambah Data Persalinan'}
            </DialogTitle>
            <DialogDescription>
              {editingData ? 'Perbarui informasi persalinan' : 'Tambah data persalinan baru'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {/* Kehamilan (Ibu) Selection */}
            <div className="space-y-2">
              <Label>Data Kehamilan Ibu *</Label>
              {selectedKehamilan ? (
                <div className="p-3 border rounded-lg bg-green-50 border-green-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <div>
                        <p className="font-medium text-green-800">
                          {selectedKehamilan.warga?.nama || selectedKehamilan.nama_ibu || 'N/A'}
                        </p>
                        <p className="text-sm text-green-600">
                          NIK: {selectedKehamilan.warga?.nik || selectedKehamilan.nik_ibu || 'N/A'} | 
                          Kehamilan ke-{selectedKehamilan.kehamilan_ke || selectedKehamilan.gravida}
                          {selectedKehamilan.usia_kehamilan_minggu && ` | Usia: ${selectedKehamilan.usia_kehamilan_minggu} minggu`}
                        </p>
                      </div>
                    </div>
                    {!editingData && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={clearSelectedKehamilan}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  {loadingKehamilan ? (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Memuat data kehamilan aktif...</span>
                    </div>
                  ) : kehamilanList.length > 0 ? (
                    <select
                      className="w-full p-2 border rounded-md"
                      value=""
                      onChange={(e) => handleSelectKehamilan(parseInt(e.target.value))}
                    >
                      <option value="">Pilih data kehamilan ibu...</option>
                      {kehamilanList.map((k) => (
                        <option key={k.id} value={k.id}>
                          {k.warga?.nama || k.nama_ibu} - NIK: {k.warga?.nik || k.nik_ibu} 
                          (Kehamilan ke-{k.kehamilan_ke || k.gravida}
                          {k.usia_kehamilan_minggu && `, ${k.usia_kehamilan_minggu} minggu`})
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="p-3 border rounded-lg bg-yellow-50 border-yellow-200">
                      <div className="flex items-center gap-2 text-yellow-800">
                        <User className="h-4 w-4" />
                        <span className="text-sm">Tidak ada data kehamilan aktif. Pastikan data kehamilan ibu sudah terdaftar.</span>
                      </div>
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground">Pilih ibu hamil yang akan melahirkan</p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tanggal_persalinan">Tanggal Persalinan *</Label>
                <Input
                  id="tanggal_persalinan"
                  type="date"
                  value={formData.tanggal_persalinan}
                  onChange={(e) => setFormData({ ...formData, tanggal_persalinan: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tempat_persalinan">Tempat Persalinan</Label>
                <Input
                  id="tempat_persalinan"
                  value={formData.tempat_persalinan}
                  onChange={(e) => setFormData({ ...formData, tempat_persalinan: e.target.value })}
                  placeholder="RS / Puskesmas / Rumah"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="jenis_persalinan">Jenis Persalinan</Label>
                <select
                  id="jenis_persalinan"
                  className="w-full p-2 border rounded-md"
                  value={formData.jenis_persalinan}
                  onChange={(e) => setFormData({ ...formData, jenis_persalinan: e.target.value })}
                >
                  <option value="Spontan/Normal">Spontan/Normal</option>
                  <option value="SC">SC (Sectio Caesaria)</option>
                  <option value="Vakum">Vakum</option>
                  <option value="Forsep">Forsep</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="penolong_persalinan">Penolong Persalinan</Label>
                <select
                  id="penolong_persalinan"
                  className="w-full p-2 border rounded-md"
                  value={formData.penolong_persalinan}
                  onChange={(e) => setFormData({ ...formData, penolong_persalinan: e.target.value })}
                >
                  <option value="">Pilih Penolong</option>
                  <option value="Dokter SpOG">Dokter SpOG</option>
                  <option value="Dokter Umum">Dokter Umum</option>
                  <option value="Bidan">Bidan</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              </div>
            </div>
            
            <div className="border-t pt-4 mt-4">
              <h4 className="font-medium mb-3">Data Bayi</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nama_bayi">Nama Bayi</Label>
                  <Input
                    id="nama_bayi"
                    value={formData.nama_bayi}
                    onChange={(e) => setFormData({ ...formData, nama_bayi: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="jenis_kelamin_bayi">Jenis Kelamin</Label>
                  <select
                    id="jenis_kelamin_bayi"
                    className="w-full p-2 border rounded-md"
                    value={formData.jenis_kelamin_bayi}
                    onChange={(e) => setFormData({ ...formData, jenis_kelamin_bayi: e.target.value as 'L' | 'P' })}
                  >
                    <option value="L">Laki-laki</option>
                    <option value="P">Perempuan</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="berat_lahir_gram">Berat Lahir (gram)</Label>
                  <Input
                    id="berat_lahir_gram"
                    type="number"
                    value={formData.berat_lahir_gram || ''}
                    onChange={(e) => setFormData({ ...formData, berat_lahir_gram: parseInt(e.target.value) || 0 })}
                    placeholder="3000"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="panjang_lahir_cm">Panjang Lahir (cm)</Label>
                  <Input
                    id="panjang_lahir_cm"
                    type="number"
                    value={formData.panjang_lahir_cm || ''}
                    onChange={(e) => setFormData({ ...formData, panjang_lahir_cm: parseInt(e.target.value) || 0 })}
                    placeholder="50"
                  />
                </div>
              </div>
            </div>
            
            <div className="border-t pt-4 mt-4">
              <h4 className="font-medium mb-3">Kondisi</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="kondisi_ibu">Kondisi Ibu</Label>
                  <select
                    id="kondisi_ibu"
                    className="w-full p-2 border rounded-md"
                    value={formData.kondisi_ibu}
                    onChange={(e) => setFormData({ ...formData, kondisi_ibu: e.target.value })}
                  >
                    <option value="Baik">Baik</option>
                    <option value="Komplikasi">Komplikasi</option>
                    <option value="Meninggal">Meninggal</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="kondisi_bayi">Kondisi Bayi</Label>
                  <select
                    id="kondisi_bayi"
                    className="w-full p-2 border rounded-md"
                    value={formData.kondisi_bayi}
                    onChange={(e) => setFormData({ ...formData, kondisi_bayi: e.target.value })}
                  >
                    <option value="Hidup Sehat">Hidup Sehat</option>
                    <option value="Hidup dengan Kelainan">Hidup dengan Kelainan</option>
                    <option value="Meninggal">Meninggal</option>
                  </select>
                </div>
              </div>
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

export default KaderPersalinan;
