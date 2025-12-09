import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  FileText, 
  CheckCircle, 
  XCircle, 
  Send, 
  Eye, 
  Clock,
  User,
  Phone,
  FileCheck,
  Loader2,
  Plus,
  Search,
  BarChart3,
  TrendingUp,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight
} from 'lucide-react';
import suratRequestService from '@/services/suratRequestService';
import apiClient from '@/services/apiClient.js';

// Types
interface Warga {
  id: number;
  nik: string;
  nama: string;
  alamat?: string;
  no_hp?: string;
}

interface SuratTemplate {
  id: number;
  nama: string;
  kode: string;
}

interface SuratRequest {
  id: number;
  tenant_id: number;
  warga_id: number;
  template_id: number;
  tracking_code: string;
  status: 'pending' | 'staff_review' | 'wali_review' | 'signed' | 'sent' | 'rejected';
  phone_number: string;
  keperluan: string;
  catatan?: string;
  staff_notes?: string;
  wali_notes?: string;
  rejected_reason?: string;
  signature_path?: string;
  pdf_path?: string;
  created_at: string;
  updated_at: string;
  warga?: Warga;
  template?: SuratTemplate;
}

interface Stats {
  pending: number;
  staff_review: number;
  wali_review: number;
  signed: number;
  sent: number;
  rejected: number;
  total: number;
}

interface TemplateStats {
  template_id: number;
  template_name: string;
  kategori: string;
  total: number;
  pending: number;
  in_process: number;
  signed: number;
  sent: number;
  rejected: number;
}

interface Report {
  status: Stats;
  by_template: TemplateStats[];
  summary: {
    total: number;
    in_process: number;
    completed: number;
    rejected: number;
    completion_rate: number;
    success_rate: number;
  };
}

export default function SuratRequestPage() {
  const [activeTab, setActiveTab] = useState('requests');
  const [requests, setRequests] = useState<SuratRequest[]>([]);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;
  const [stats, setStats] = useState<Stats>({
    pending: 0,
    staff_review: 0,
    wali_review: 0,
    signed: 0,
    sent: 0,
    rejected: 0,
    total: 0
  });
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [reportLoading, setReportLoading] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<SuratRequest | null>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState('');
  
  // State untuk Buat Surat Manual
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [templates, setTemplates] = useState<SuratTemplate[]>([]);
  const [searchNik, setSearchNik] = useState('');
  const [searchedWarga, setSearchedWarga] = useState<Warga | null>(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [createForm, setCreateForm] = useState({
    template_id: '',
    keperluan: '',
    catatan: ''
  });

  useEffect(() => {
    fetchData();
    fetchTemplates();
    fetchReport(); // Load report on page load
  }, []);

  useEffect(() => {
    if (filterStatus) {
      fetchData();
    }
  }, [filterStatus]);

  const fetchReport = async () => {
    try {
      setReportLoading(true);
      const data = await suratRequestService.getReport();
      console.log('Report data received:', data);
      // Data should have: status, by_template, summary
      if (data && data.summary && data.by_template) {
        setReport(data);
      } else {
        console.error('Invalid report data structure:', data);
      }
    } catch (error) {
      console.error('Error fetching report:', error);
    } finally {
      setReportLoading(false);
    }
  };

  const fetchTemplates = async () => {
    try {
      const response = await apiClient.get('/surat-templates');
      if (response.data?.data) {
        setTemplates(response.data.data);
      } else if (Array.isArray(response.data)) {
        setTemplates(response.data);
      }
    } catch (error) {
      console.error('Error fetching templates:', error);
    }
  };

  const handleSearchWarga = async () => {
    if (!searchNik || searchNik.length < 16) {
      toast.error('NIK harus 16 digit');
      return;
    }
    try {
      setSearchLoading(true);
      const response = await apiClient.get(`/public/wargas/nik/${searchNik}`);
      if (response.data?.data) {
        setSearchedWarga(response.data.data);
        toast.success('Warga ditemukan');
      } else {
        setSearchedWarga(null);
        toast.error('Warga tidak ditemukan');
      }
    } catch (error) {
      console.error('Error searching warga:', error);
      setSearchedWarga(null);
      toast.error('Warga tidak ditemukan');
    } finally {
      setSearchLoading(false);
    }
  };

  const handleCreateManual = async () => {
    if (!searchedWarga) {
      toast.error('Cari warga terlebih dahulu');
      return;
    }
    if (!createForm.template_id) {
      toast.error('Pilih jenis surat');
      return;
    }
    if (!createForm.keperluan) {
      toast.error('Keperluan harus diisi');
      return;
    }
    
    try {
      setActionLoading(true);
      await suratRequestService.createManual({
        nik: searchedWarga.nik,
        template_id: parseInt(createForm.template_id),
        keperluan: createForm.keperluan,
        catatan: createForm.catatan
      });
      toast.success('Permohonan surat berhasil dibuat');
      setShowCreateDialog(false);
      setSearchedWarga(null);
      setSearchNik('');
      setCreateForm({ template_id: '', keperluan: '', catatan: '' });
      fetchData();
    } catch (error: any) {
      console.error('Error creating request:', error);
      toast.error(error.response?.data?.message || 'Gagal membuat permohonan');
    } finally {
      setActionLoading(false);
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const [requestsRes, statsRes] = await Promise.all([
        suratRequestService.getAll({ status: filterStatus || undefined }),
        suratRequestService.getStats()
      ]);
      
      // Handle response structure - apiClient returns data directly
      let requestsData = [];
      if (requestsRes?.data?.data) {
        requestsData = requestsRes.data.data;
      } else if (requestsRes?.data && Array.isArray(requestsRes.data)) {
        requestsData = requestsRes.data;
      } else if (Array.isArray(requestsRes)) {
        requestsData = requestsRes;
      }
      
      setRequests(requestsData);
      // statsRes is now the direct stats object
      setStats(statsRes || {
        pending: 0,
        staff_review: 0,
        wali_review: 0,
        signed: 0,
        sent: 0,
        rejected: 0,
        total: 0
      });
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Gagal mengambil data');
    } finally {
      setLoading(false);
    }
  };

  const handleStaffApprove = async (id: number) => {
    try {
      setActionLoading(true);
      await suratRequestService.staffApprove(id);
      toast.success('Berhasil disetujui staff');
      fetchData();
      setShowDetailDialog(false);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Gagal menyetujui');
    } finally {
      setActionLoading(false);
    }
  };

  const handleStaffReject = async (id: number) => {
    if (!rejectReason) {
      toast.error('Alasan penolakan harus diisi');
      return;
    }
    try {
      setActionLoading(true);
      await suratRequestService.staffReject(id, rejectReason);
      toast.success('Berhasil ditolak');
      setShowRejectDialog(false);
      setRejectReason('');
      fetchData();
      setShowDetailDialog(false);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Gagal menolak');
    } finally {
      setActionLoading(false);
    }
  };

  const handleWaliSign = async (id: number) => {
    try {
      setActionLoading(true);
      await suratRequestService.waliSign(id);
      toast.success('Surat berhasil ditandatangani');
      fetchData();
      setShowDetailDialog(false);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Gagal menandatangani');
    } finally {
      setActionLoading(false);
    }
  };

  const handleWaliReject = async (id: number) => {
    if (!rejectReason) {
      toast.error('Alasan penolakan harus diisi');
      return;
    }
    try {
      setActionLoading(true);
      await suratRequestService.waliReject(id, rejectReason);
      toast.success('Berhasil ditolak');
      setShowRejectDialog(false);
      setRejectReason('');
      fetchData();
      setShowDetailDialog(false);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Gagal menolak');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSendToUser = async (id: number) => {
    try {
      setActionLoading(true);
      await suratRequestService.sendToUser(id);
      toast.success('PDF berhasil dikirim ke WhatsApp');
      fetchData();
      setShowDetailDialog(false);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Gagal mengirim PDF');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
      pending: { label: 'Pending', variant: 'secondary' },
      staff_review: { label: 'Review Staff', variant: 'default' },
      staff_rejected: { label: 'Ditolak Staff', variant: 'destructive' },
      wali_review: { label: 'Review Wali', variant: 'default' },
      wali_rejected: { label: 'Ditolak Wali', variant: 'destructive' },
      signed: { label: 'Ditandatangani', variant: 'outline' },
      sent: { label: 'Terkirim', variant: 'default' },
      rejected: { label: 'Ditolak', variant: 'destructive' }
    };
    const config = statusConfig[status] || { label: status, variant: 'secondary' as const };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Permintaan Surat</h1>
          <p className="text-muted-foreground">Kelola permintaan surat dari WhatsApp dan dashboard</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={async () => {
            try {
              const data = await suratRequestService.getReport();
              console.log('TEST Report:', data);
              alert('Data: ' + JSON.stringify(data, null, 2).substring(0, 500));
            } catch (e: any) {
              console.error('TEST Error:', e);
              alert('Error: ' + e.message);
            }
          }}>
            Test API
          </Button>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Buat Surat Manual
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="requests" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Daftar Permintaan
          </TabsTrigger>
          <TabsTrigger value="report" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Laporan
          </TabsTrigger>
        </TabsList>

        <TabsContent value="requests" className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            <Card className="cursor-pointer hover:bg-accent" onClick={() => setFilterStatus('')}>
              <CardHeader className="pb-2">
            <CardDescription>Total</CardDescription>
            <CardTitle className="text-2xl">{stats.total}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="cursor-pointer hover:bg-accent" onClick={() => setFilterStatus('pending')}>
          <CardHeader className="pb-2">
            <CardDescription>Pending</CardDescription>
            <CardTitle className="text-2xl">{stats.pending}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="cursor-pointer hover:bg-accent" onClick={() => setFilterStatus('staff_review')}>
          <CardHeader className="pb-2">
            <CardDescription>Review Staff</CardDescription>
            <CardTitle className="text-2xl">{stats.staff_review}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="cursor-pointer hover:bg-accent" onClick={() => setFilterStatus('wali_review')}>
          <CardHeader className="pb-2">
            <CardDescription>Review Wali</CardDescription>
            <CardTitle className="text-2xl">{stats.wali_review}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="cursor-pointer hover:bg-accent" onClick={() => setFilterStatus('signed')}>
          <CardHeader className="pb-2">
            <CardDescription>Signed</CardDescription>
            <CardTitle className="text-2xl">{stats.signed}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="cursor-pointer hover:bg-accent" onClick={() => setFilterStatus('sent')}>
          <CardHeader className="pb-2">
            <CardDescription>Terkirim</CardDescription>
            <CardTitle className="text-2xl">{stats.sent}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="cursor-pointer hover:bg-accent" onClick={() => setFilterStatus('rejected')}>
          <CardHeader className="pb-2">
            <CardDescription>Ditolak</CardDescription>
            <CardTitle className="text-2xl">{stats.rejected}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Daftar Permintaan
            {filterStatus && (
              <Badge variant="outline" className="ml-2">
                Filter: {filterStatus}
                <button 
                  className="ml-1 hover:text-destructive" 
                  onClick={() => setFilterStatus('')}
                >
                  ×
                </button>
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : requests.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Tidak ada permintaan surat
            </div>
          ) : (
            <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">No</TableHead>
                  <TableHead>Kode Tracking</TableHead>
                  <TableHead>Pemohon</TableHead>
                  <TableHead>Jenis Surat</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(() => {
                  const totalPages = Math.ceil(requests.length / itemsPerPage);
                  const startIndex = (currentPage - 1) * itemsPerPage;
                  const paginatedRequests = requests.slice(startIndex, startIndex + itemsPerPage);
                  
                  return paginatedRequests.map((request, index) => (
                  <TableRow key={request.id}>
                    <TableCell className="text-center font-medium">{startIndex + index + 1}</TableCell>
                    <TableCell className="font-mono">{request.tracking_code}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{request.warga?.nama || '-'}</div>
                        <div className="text-sm text-muted-foreground">{request.phone_number}</div>
                      </div>
                    </TableCell>
                    <TableCell>{request.template?.nama || '-'}</TableCell>
                    <TableCell>{getStatusBadge(request.status)}</TableCell>
                    <TableCell>{formatDate(request.created_at)}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedRequest(request);
                          setShowDetailDialog(true);
                        }}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Detail
                      </Button>
                    </TableCell>
                  </TableRow>
                ));
                })()}
              </TableBody>
            </Table>
            
            {/* Pagination */}
            {(() => {
              const totalPages = Math.ceil(requests.length / itemsPerPage);
              const startIndex = (currentPage - 1) * itemsPerPage;
              return (
                <div className="flex items-center justify-between mt-4 pt-4 border-t">
                  <div className="text-sm text-muted-foreground">
                    Menampilkan {startIndex + 1} - {Math.min(startIndex + itemsPerPage, requests.length)} dari {requests.length} permintaan
                  </div>
                  {totalPages > 1 && (
                    <div className="flex items-center gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(1)}
                        disabled={currentPage === 1}
                        className="h-8 w-8 p-0"
                      >
                        <ChevronsLeft className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className="h-8 w-8 p-0"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      
                      <div className="flex items-center gap-1 mx-2">
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          let pageNum: number;
                          if (totalPages <= 5) {
                            pageNum = i + 1;
                          } else if (currentPage <= 3) {
                            pageNum = i + 1;
                          } else if (currentPage >= totalPages - 2) {
                            pageNum = totalPages - 4 + i;
                          } else {
                            pageNum = currentPage - 2 + i;
                          }
                          return (
                            <Button
                              key={pageNum}
                              variant={currentPage === pageNum ? "default" : "outline"}
                              size="sm"
                              onClick={() => setCurrentPage(pageNum)}
                              className="h-8 w-8 p-0"
                            >
                              {pageNum}
                            </Button>
                          );
                        })}
                      </div>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                        className="h-8 w-8 p-0"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(totalPages)}
                        disabled={currentPage === totalPages}
                        className="h-8 w-8 p-0"
                      >
                        <ChevronsRight className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              );
            })()}
            </>
          )}
        </CardContent>
      </Card>
        </TabsContent>

        {/* Tab Laporan */}
        <TabsContent value="report" className="space-y-6">
          {reportLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : report && report.summary && report.by_template ? (
            <>
              {/* Summary Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Permohonan</CardTitle>
                    <FileText className="h-5 w-5 text-blue-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{report.summary.total || 0}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Dalam Proses</CardTitle>
                    <Clock className="h-5 w-5 text-amber-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-amber-600">{report.summary.in_process || 0}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Selesai</CardTitle>
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-green-600">{report.summary.completed || 0}</div>
                    <p className="text-xs text-muted-foreground">{report.summary.success_rate || 0}% success rate</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Ditolak</CardTitle>
                    <XCircle className="h-5 w-5 text-red-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-red-600">{report.summary.rejected || 0}</div>
                  </CardContent>
                </Card>
              </div>

              {/* Laporan Per Jenis Surat */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Laporan Per Jenis Surat
                  </CardTitle>
                  <CardDescription>
                    Statistik permohonan berdasarkan jenis surat
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {!report.by_template || report.by_template.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      Belum ada data permohonan
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Jenis Surat</TableHead>
                          <TableHead className="text-center">Total</TableHead>
                          <TableHead className="text-center">Pending</TableHead>
                          <TableHead className="text-center">Proses</TableHead>
                          <TableHead className="text-center">Signed</TableHead>
                          <TableHead className="text-center">Terkirim</TableHead>
                          <TableHead className="text-center">Ditolak</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {report.by_template.map((item) => (
                          <TableRow key={item.template_id}>
                            <TableCell>
                              <div className="font-medium">{item.template_name}</div>
                              {item.kategori && (
                                <div className="text-xs text-muted-foreground">{item.kategori}</div>
                              )}
                            </TableCell>
                            <TableCell className="text-center">
                              <Badge variant="outline">{item.total}</Badge>
                            </TableCell>
                            <TableCell className="text-center">
                              {item.pending > 0 ? (
                                <Badge variant="secondary">{item.pending}</Badge>
                              ) : (
                                <span className="text-muted-foreground">-</span>
                              )}
                            </TableCell>
                            <TableCell className="text-center">
                              {item.in_process > 0 ? (
                                <Badge className="bg-blue-500">{item.in_process}</Badge>
                              ) : (
                                <span className="text-muted-foreground">-</span>
                              )}
                            </TableCell>
                            <TableCell className="text-center">
                              {item.signed > 0 ? (
                                <Badge className="bg-emerald-500">{item.signed}</Badge>
                              ) : (
                                <span className="text-muted-foreground">-</span>
                              )}
                            </TableCell>
                            <TableCell className="text-center">
                              {item.sent > 0 ? (
                                <Badge className="bg-green-500">{item.sent}</Badge>
                              ) : (
                                <span className="text-muted-foreground">-</span>
                              )}
                            </TableCell>
                            <TableCell className="text-center">
                              {item.rejected > 0 ? (
                                <Badge variant="destructive">{item.rejected}</Badge>
                              ) : (
                                <span className="text-muted-foreground">-</span>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                        {/* Total Row */}
                        <TableRow className="bg-muted/50 font-medium">
                          <TableCell>Total Semua Surat</TableCell>
                          <TableCell className="text-center">
                            <Badge variant="outline" className="font-bold">{report.summary.total}</Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge variant="secondary">{report.status.pending}</Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge className="bg-blue-500">{report.status.staff_review + report.status.wali_review}</Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge className="bg-emerald-500">{report.status.signed}</Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge className="bg-green-500">{report.status.sent}</Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge variant="destructive">{report.summary.rejected}</Badge>
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>

              {/* Detail Status Flow */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Alur Proses Surat
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3 md:grid-cols-6">
                    <div className="flex flex-col items-center p-3 rounded-lg bg-amber-50 border border-amber-200">
                      <AlertCircle className="h-5 w-5 text-amber-600 mb-1" />
                      <div className="text-xl font-bold text-amber-700">{report.status.pending}</div>
                      <div className="text-xs text-amber-600">Pending</div>
                    </div>
                    <div className="flex flex-col items-center p-3 rounded-lg bg-blue-50 border border-blue-200">
                      <User className="h-5 w-5 text-blue-600 mb-1" />
                      <div className="text-xl font-bold text-blue-700">{report.status.staff_review}</div>
                      <div className="text-xs text-blue-600">Review Staff</div>
                    </div>
                    <div className="flex flex-col items-center p-3 rounded-lg bg-purple-50 border border-purple-200">
                      <FileCheck className="h-5 w-5 text-purple-600 mb-1" />
                      <div className="text-xl font-bold text-purple-700">{report.status.wali_review}</div>
                      <div className="text-xs text-purple-600">Review Wali</div>
                    </div>
                    <div className="flex flex-col items-center p-3 rounded-lg bg-emerald-50 border border-emerald-200">
                      <CheckCircle className="h-5 w-5 text-emerald-600 mb-1" />
                      <div className="text-xl font-bold text-emerald-700">{report.status.signed}</div>
                      <div className="text-xs text-emerald-600">Ditandatangani</div>
                    </div>
                    <div className="flex flex-col items-center p-3 rounded-lg bg-green-50 border border-green-200">
                      <Send className="h-5 w-5 text-green-600 mb-1" />
                      <div className="text-xl font-bold text-green-700">{report.status.sent}</div>
                      <div className="text-xs text-green-600">Terkirim</div>
                    </div>
                    <div className="flex flex-col items-center p-3 rounded-lg bg-red-50 border border-red-200">
                      <XCircle className="h-5 w-5 text-red-600 mb-1" />
                      <div className="text-xl font-bold text-red-700">{report.summary.rejected}</div>
                      <div className="text-xs text-red-600">Ditolak</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : !reportLoading ? (
            <Card>
              <CardContent className="py-12">
                <div className="text-center text-muted-foreground">
                  <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">Belum Ada Data Laporan</p>
                  <p className="text-sm mt-1">Data laporan akan muncul setelah ada permohonan surat</p>
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={fetchReport}
                  >
                    Muat Ulang
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : null}
        </TabsContent>
      </Tabs>

      {/* Detail Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileCheck className="h-5 w-5" />
              Detail Permintaan Surat
            </DialogTitle>
            <DialogDescription>
              Kode Tracking: {selectedRequest?.tracking_code}
            </DialogDescription>
          </DialogHeader>
          
          {selectedRequest && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <User className="h-4 w-4" />
                    Pemohon
                  </div>
                  <div className="font-medium">{selectedRequest.warga?.nama || '-'}</div>
                  <div className="text-sm">{selectedRequest.warga?.nik || '-'}</div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="h-4 w-4" />
                    WhatsApp
                  </div>
                  <div className="font-medium">{selectedRequest.phone_number}</div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <FileText className="h-4 w-4" />
                  Jenis Surat
                </div>
                <div className="font-medium">{selectedRequest.template?.nama || '-'}</div>
              </div>

              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">Keperluan</div>
                <div className="p-3 bg-muted rounded-lg">{selectedRequest.keperluan || '-'}</div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  Status
                </div>
                <div>{getStatusBadge(selectedRequest.status)}</div>
              </div>

              {selectedRequest.rejected_reason && (
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground text-destructive">Alasan Ditolak</div>
                  <div className="p-3 bg-destructive/10 rounded-lg text-destructive">
                    {selectedRequest.rejected_reason}
                  </div>
                </div>
              )}

              <DialogFooter className="flex gap-2 flex-wrap">
                {/* Staff Actions - handle both pending and staff_review */}
                {(selectedRequest.status === 'pending' || selectedRequest.status === 'staff_review') && (
                  <>
                    <Button
                      variant="default"
                      onClick={() => handleStaffApprove(selectedRequest.id)}
                      disabled={actionLoading}
                    >
                      {actionLoading ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <CheckCircle className="h-4 w-4 mr-1" />}
                      Setujui (Staff)
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => setShowRejectDialog(true)}
                      disabled={actionLoading}
                    >
                      <XCircle className="h-4 w-4 mr-1" />
                      Tolak
                    </Button>
                  </>
                )}

                {/* Wali Actions */}
                {selectedRequest.status === 'wali_review' && (
                  <>
                    <Button
                      variant="default"
                      onClick={() => handleWaliSign(selectedRequest.id)}
                      disabled={actionLoading}
                    >
                      {actionLoading ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <FileCheck className="h-4 w-4 mr-1" />}
                      Tanda Tangan (Wali)
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => setShowRejectDialog(true)}
                      disabled={actionLoading}
                    >
                      <XCircle className="h-4 w-4 mr-1" />
                      Tolak
                    </Button>
                  </>
                )}

                {/* Send Action */}
                {selectedRequest.status === 'signed' && (
                  <Button
                    variant="default"
                    onClick={() => handleSendToUser(selectedRequest.id)}
                    disabled={actionLoading}
                  >
                    {actionLoading ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Send className="h-4 w-4 mr-1" />}
                    Kirim ke WhatsApp
                  </Button>
                )}
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tolak Permintaan</DialogTitle>
            <DialogDescription>
              Berikan alasan penolakan permintaan surat ini
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              placeholder="Alasan penolakan..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
              Batal
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => {
                if (selectedRequest?.status === 'pending' || selectedRequest?.status === 'staff_review') {
                  handleStaffReject(selectedRequest.id);
                } else if (selectedRequest?.status === 'wali_review') {
                  handleWaliReject(selectedRequest.id);
                }
              }}
              disabled={actionLoading}
            >
              {actionLoading ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <XCircle className="h-4 w-4 mr-1" />}
              Tolak
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Buat Surat Manual */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Buat Surat Manual
            </DialogTitle>
            <DialogDescription>
              Buat permohonan surat untuk warga secara manual
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Search Warga */}
            <div className="space-y-2">
              <Label>Cari Warga (NIK)</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Masukkan 16 digit NIK"
                  value={searchNik}
                  onChange={(e) => setSearchNik(e.target.value)}
                  maxLength={16}
                />
                <Button 
                  variant="secondary" 
                  onClick={handleSearchWarga}
                  disabled={searchLoading}
                >
                  {searchLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            {/* Warga Info */}
            {searchedWarga && (
              <Card className="bg-muted/50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="font-medium">{searchedWarga.nama}</div>
                      <div className="text-sm text-muted-foreground">NIK: {searchedWarga.nik}</div>
                      {searchedWarga.alamat && (
                        <div className="text-sm text-muted-foreground">{searchedWarga.alamat}</div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Jenis Surat */}
            <div className="space-y-2">
              <Label>Jenis Surat</Label>
              <Select 
                value={createForm.template_id} 
                onValueChange={(value: string) => setCreateForm({...createForm, template_id: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih jenis surat" />
                </SelectTrigger>
                <SelectContent>
                  {templates.map((template) => (
                    <SelectItem key={template.id} value={template.id.toString()}>
                      {template.nama} ({template.kode})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Keperluan */}
            <div className="space-y-2">
              <Label>Keperluan</Label>
              <Input
                placeholder="Untuk keperluan apa surat ini?"
                value={createForm.keperluan}
                onChange={(e) => setCreateForm({...createForm, keperluan: e.target.value})}
              />
            </div>

            {/* Catatan */}
            <div className="space-y-2">
              <Label>Catatan (Opsional)</Label>
              <Textarea
                placeholder="Catatan tambahan..."
                value={createForm.catatan}
                onChange={(e) => setCreateForm({...createForm, catatan: e.target.value})}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowCreateDialog(false);
              setSearchedWarga(null);
              setSearchNik('');
              setCreateForm({ template_id: '', keperluan: '', catatan: '' });
            }}>
              Batal
            </Button>
            <Button 
              onClick={handleCreateManual}
              disabled={actionLoading || !searchedWarga}
            >
              {actionLoading ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <FileText className="h-4 w-4 mr-1" />}
              Buat Permohonan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
