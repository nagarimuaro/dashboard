import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { MessageSquare, FileText, Download, CheckCircle, XCircle, Clock, RefreshCw } from 'lucide-react';
import { pelayananRequestService } from '@/services/pelayananRequestService';

// Toast helper
const showToast = (title: string, description: string, variant?: 'default' | 'destructive') => {
  alert(`${title}: ${description}`);
};

interface PermintaanSurat {
  id: number;
  warga_id: number;
  warga_nama: string;
  warga_nik: string;
  jenis_pelayanan: string;
  template_id: number;
  template_nama: string;
  status: 'pending' | 'processing' | 'completed' | 'rejected';
  nomor_surat: string | null;
  file_path: string | null;
  keterangan: string | null;
  source: 'whatsapp' | 'web' | 'manual';
  phone_number: string | null;
  created_at: string;
  updated_at: string;
}

interface Statistics {
  total: number;
  pending: number;
  processing: number;
  completed: number;
  rejected: number;
  today: number;
}

const STATUS_CONFIG = {
  pending: { label: 'Menunggu', color: 'bg-yellow-500', icon: Clock },
  processing: { label: 'Diproses', color: 'bg-blue-500', icon: RefreshCw },
  completed: { label: 'Selesai', color: 'bg-green-500', icon: CheckCircle },
  rejected: { label: 'Ditolak', color: 'bg-red-500', icon: XCircle }
};

export default function PermintaanSuratMonitor() {
  const [requests, setRequests] = useState<PermintaanSurat[]>([]);
  const [statistics, setStatistics] = useState<Statistics>({
    total: 0,
    pending: 0,
    processing: 0,
    completed: 0,
    rejected: 0,
    today: 0
  });
  const [loading, setLoading] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<PermintaanSurat | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);

  // Filter state
  const [filters, setFilters] = useState({
    status: '',
    jenis: '',
    from_date: '',
    to_date: ''
  });

  // Status update state
  const [statusUpdate, setStatusUpdate] = useState({
    status: '',
    keterangan: ''
  });

  useEffect(() => {
    loadRequests();
    loadStatistics();
    
    // Auto refresh every 30 seconds
    const interval = setInterval(() => {
      loadRequests();
      loadStatistics();
    }, 30000);

    return () => clearInterval(interval);
  }, [filters]);

  const loadRequests = async () => {
    try {
      setLoading(true);
      const data = await pelayananRequestService.getAll(filters);
      // Ensure data is always an array
      setRequests(Array.isArray(data) ? data : []);
    } catch (error: any) {
      console.error('Error loading requests:', error);
      setRequests([]); // Set empty array on error
      showToast('Error', error.message || 'Gagal memuat permintaan surat', 'destructive');
    } finally {
      setLoading(false);
    }
  };

  const loadStatistics = async () => {
    try {
      const data = await pelayananRequestService.getStatistics();
      setStatistics(data);
    } catch (error) {
      console.error('Failed to load statistics:', error);
    }
  };

  const handleViewDetail = (request: PermintaanSurat) => {
    setSelectedRequest(request);
    setDetailDialogOpen(true);
  };

  const handleOpenStatusDialog = (request: PermintaanSurat) => {
    setSelectedRequest(request);
    setStatusUpdate({ status: request.status, keterangan: request.keterangan || '' });
    setStatusDialogOpen(true);
  };

  const handleUpdateStatus = async () => {
    if (!selectedRequest) return;

    try {
      setLoading(true);
      await pelayananRequestService.updateStatus(
        selectedRequest.id,
        statusUpdate.status as any,
        statusUpdate.keterangan ? statusUpdate.keterangan : null
      );

      showToast('Berhasil', 'Status permintaan berhasil diupdate');

      setStatusDialogOpen(false);
      loadRequests();
    } catch (error: any) {
      showToast('Error', error.message || 'Gagal mengupdate status', 'destructive');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateSurat = async (id: number) => {
    try {
      setLoading(true);
      await pelayananRequestService.generateSurat(id);

      showToast('Berhasil', 'Surat berhasil digenerate');

      loadRequests();
    } catch (error: any) {
      showToast('Error', error.message || 'Gagal generate surat', 'destructive');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadSurat = async (id: number, nomorSurat: string) => {
    try {
      const blob = await pelayananRequestService.downloadSurat(id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${nomorSurat}.docx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error: any) {
      showToast('Error', error.message || 'Gagal mengunduh surat', 'destructive');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Monitor Permintaan Surat</h1>
        <p className="text-muted-foreground">
          Pantau dan kelola permintaan surat dari WhatsApp Bot
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Permintaan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Menunggu
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{statistics.pending}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Diproses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{statistics.processing}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Selesai
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{statistics.completed}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Ditolak
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{statistics.rejected}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Hari Ini
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics.today}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filter</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div>
              <Label>Status</Label>
              <Select
                value={filters.status}
                onValueChange={(value: string) => setFilters({ ...filters, status: value === 'all' ? '' : value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Semua Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Status</SelectItem>
                  <SelectItem value="pending">Menunggu</SelectItem>
                  <SelectItem value="processing">Diproses</SelectItem>
                  <SelectItem value="completed">Selesai</SelectItem>
                  <SelectItem value="rejected">Ditolak</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Dari Tanggal</Label>
              <Input
                type="date"
                value={filters.from_date}
                onChange={(e) => setFilters({ ...filters, from_date: e.target.value })}
              />
            </div>

            <div>
              <Label>Sampai Tanggal</Label>
              <Input
                type="date"
                value={filters.to_date}
                onChange={(e) => setFilters({ ...filters, to_date: e.target.value })}
              />
            </div>

            <div className="flex items-end">
              <Button onClick={loadRequests} className="w-full">
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Requests Table */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Permintaan</CardTitle>
          <CardDescription>
            Permintaan surat dari WhatsApp Bot dan sumber lainnya
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading && requests.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">Loading...</p>
          ) : requests.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground" />
              <p className="mt-2 text-muted-foreground">Belum ada permintaan surat</p>
            </div>
          ) : (
            <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
              <Table>
                <TableHeader className="sticky top-0 bg-background z-10">
                  <TableRow>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>NIK / Nama</TableHead>
                    <TableHead>Jenis Surat</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Sumber</TableHead>
                    <TableHead>Nomor Surat</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {requests.map((request) => {
                    const StatusIcon = STATUS_CONFIG[request.status].icon;
                    return (
                      <TableRow key={request.id}>
                        <TableCell>
                          {new Date(request.created_at).toLocaleString('id-ID', {
                            dateStyle: 'short',
                            timeStyle: 'short'
                          })}
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{request.warga_nama}</div>
                            <div className="text-xs text-muted-foreground">{request.warga_nik}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{request.template_nama}</div>
                            <div className="text-xs text-muted-foreground">{request.jenis_pelayanan}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={STATUS_CONFIG[request.status].color}>
                            <StatusIcon className="mr-1 h-3 w-3" />
                            {STATUS_CONFIG[request.status].label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {request.source === 'whatsapp' && <MessageSquare className="mr-1 h-3 w-3" />}
                            {request.source}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {request.nomor_surat ? (
                            <code className="text-xs">{request.nomor_surat}</code>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewDetail(request)}
                              title="Lihat Detail"
                            >
                              <FileText className="h-4 w-4" />
                            </Button>
                            
                            {request.status === 'pending' && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleGenerateSurat(request.id)}
                                title="Generate Surat"
                              >
                                <CheckCircle className="h-4 w-4 text-green-600" />
                              </Button>
                            )}

                            {request.file_path && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDownloadSurat(request.id, request.nomor_surat!)}
                                title="Download Surat"
                              >
                                <Download className="h-4 w-4 text-blue-600" />
                              </Button>
                            )}

                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOpenStatusDialog(request)}
                              title="Update Status"
                            >
                              <RefreshCw className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detail Permintaan Surat</DialogTitle>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">NIK</Label>
                  <p className="font-medium">{selectedRequest.warga_nik}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Nama</Label>
                  <p className="font-medium">{selectedRequest.warga_nama}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Jenis Pelayanan</Label>
                  <p className="font-medium">{selectedRequest.jenis_pelayanan}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Template</Label>
                  <p className="font-medium">{selectedRequest.template_nama}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Status</Label>
                  <Badge className={STATUS_CONFIG[selectedRequest.status].color}>
                    {STATUS_CONFIG[selectedRequest.status].label}
                  </Badge>
                </div>
                <div>
                  <Label className="text-muted-foreground">Sumber</Label>
                  <p className="font-medium capitalize">{selectedRequest.source}</p>
                </div>
                {selectedRequest.phone_number && (
                  <div>
                    <Label className="text-muted-foreground">No. WhatsApp</Label>
                    <p className="font-medium">{selectedRequest.phone_number}</p>
                  </div>
                )}
                {selectedRequest.nomor_surat && (
                  <div>
                    <Label className="text-muted-foreground">Nomor Surat</Label>
                    <p className="font-medium">{selectedRequest.nomor_surat}</p>
                  </div>
                )}
                <div>
                  <Label className="text-muted-foreground">Tanggal Dibuat</Label>
                  <p className="font-medium">
                    {new Date(selectedRequest.created_at).toLocaleString('id-ID')}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Terakhir Update</Label>
                  <p className="font-medium">
                    {new Date(selectedRequest.updated_at).toLocaleString('id-ID')}
                  </p>
                </div>
              </div>
              {selectedRequest.keterangan && (
                <div>
                  <Label className="text-muted-foreground">Keterangan</Label>
                  <p className="font-medium">{selectedRequest.keterangan}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Status Update Dialog */}
      <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Status Permintaan</DialogTitle>
            <DialogDescription>
              Ubah status permintaan surat
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Status</Label>
              <Select
                value={statusUpdate.status}
                onValueChange={(value: string) => setStatusUpdate({ ...statusUpdate, status: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Menunggu</SelectItem>
                  <SelectItem value="processing">Diproses</SelectItem>
                  <SelectItem value="completed">Selesai</SelectItem>
                  <SelectItem value="rejected">Ditolak</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Keterangan</Label>
              <Textarea
                placeholder="Tambahkan keterangan (opsional)"
                value={statusUpdate.keterangan}
                onChange={(e) => setStatusUpdate({ ...statusUpdate, keterangan: e.target.value })}
              />
            </div>

            <Button onClick={handleUpdateStatus} disabled={loading} className="w-full">
              Update Status
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
