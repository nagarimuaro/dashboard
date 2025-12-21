import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  Eye, 
  Clock,
  User,
  FileCheck,
  Loader2,
  Plus,
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Send
} from 'lucide-react';
import suratRequestService from '@/services/suratRequestService';

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
  const navigate = useNavigate();
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
  const [filterStatus, setFilterStatus] = useState('');
  
  // Search tracking code state
  const [searchTrackingCode, setSearchTrackingCode] = useState('');

  useEffect(() => {
    fetchReport(); // Load report on page load
  }, []);

  // Fetch data whenever filterStatus changes (including empty string for 'all')
  useEffect(() => {
    console.log('useEffect triggered, filterStatus:', filterStatus);
    fetchData(filterStatus);
    setCurrentPage(1); // Reset to first page when filter changes
  }, [filterStatus]);

  const fetchReport = async () => {
    try {
      setReportLoading(true)
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

  const fetchData = async (statusFilter?: string) => {
    try {
      setLoading(true);
      
      // Build params - only include status if it has a value
      const params: Record<string, string> = {};
      const status = statusFilter !== undefined ? statusFilter : filterStatus;
      if (status) {
        params.status = status;
      }
      params.per_page = '100'; // Get more items
      
      console.log('Fetching with params:', params, 'filterStatus:', filterStatus, 'statusFilter arg:', statusFilter);
      
      const [requestsRes, statsRes] = await Promise.all([
        suratRequestService.getAll(params),
        suratRequestService.getStats()
      ]);
      
      console.log('Raw API Response:', requestsRes);
      
      // Handle response structure - Laravel paginated response
      // Structure: { success: true, data: { data: [...], current_page: 1, ... } }
      let requestsData = [];
      
      // Try different response structures
      if (requestsRes?.data?.data?.data && Array.isArray(requestsRes.data.data.data)) {
        // Nested paginated: response.data.data.data
        requestsData = requestsRes.data.data.data;
      } else if (requestsRes?.data?.data && Array.isArray(requestsRes.data.data)) {
        // Paginated: response.data.data (if data is the array)
        requestsData = requestsRes.data.data;
      } else if (requestsRes?.data && Array.isArray(requestsRes.data)) {
        // Direct array: response.data
        requestsData = requestsRes.data;
      } else if (Array.isArray(requestsRes)) {
        // Already an array
        requestsData = requestsRes;
      }
      
      console.log('Parsed requests data:', requestsData.length, 'items');
      if (requestsData.length > 0) {
        console.log('Sample item statuses:', requestsData.slice(0, 5).map((r: any) => r.status));
      }
      
      // Normalize data - backend uses suratTemplate, frontend expects template
      requestsData = requestsData.map((item: any) => ({
        ...item,
        template: item.template || item.surat_template || item.suratTemplate,
        catatan: item.catatan || item.keterangan
      }));
      
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

  // Search by tracking code
  const handleSearchTracking = () => {
    if (!searchTrackingCode.trim()) {
      fetchData();
      return;
    }
    // Filter will be applied via filteredRequests
    setCurrentPage(1);
  };

  // Filter requests based on search tracking code
  const filteredRequests = requests.filter(req => {
    if (!searchTrackingCode.trim()) return true;
    return req.tracking_code?.toLowerCase().includes(searchTrackingCode.toLowerCase().trim());
  });

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
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="flex gap-4 overflow-x-auto pb-2">
        <div 
          className={`cursor-pointer transition-all duration-300 flex-1 min-w-[140px] rounded-xl border border-blue-100 p-4 
            shadow-md hover:shadow-xl
            ${filterStatus === '' ? 'shadow-xl border-blue-300' : ''}`}
          style={{ background: 'linear-gradient(to bottom right, #eff6ff, #ffffff)' }}
          onClick={() => setFilterStatus('')}
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-slate-100">
              <FileText className="h-5 w-5 text-slate-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-semibold uppercase tracking-wide">Total</p>
              <p className="text-2xl font-bold text-slate-700">{stats.total}</p>
            </div>
          </div>
        </div>
        
        <div 
          className={`cursor-pointer transition-all duration-300 flex-1 min-w-[140px] rounded-xl border border-blue-100 p-4 
            shadow-md hover:shadow-xl
            ${filterStatus === 'pending' ? 'shadow-xl border-amber-300' : ''}`}
          style={{ background: 'linear-gradient(to bottom right, #eff6ff, #ffffff)' }}
          onClick={() => setFilterStatus('pending')}
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-100">
              <Clock className="h-5 w-5 text-amber-500" />
            </div>
            <div>
              <p className="text-xs text-amber-600 font-semibold uppercase tracking-wide">Pending</p>
              <p className="text-2xl font-bold text-amber-600">{stats.pending}</p>
            </div>
          </div>
        </div>
        
        <div 
          className={`cursor-pointer transition-all duration-300 flex-1 min-w-[140px] rounded-xl border border-blue-100 p-4 
            shadow-md hover:shadow-xl
            ${filterStatus === 'wali_review' ? 'shadow-xl border-purple-300' : ''}`}
          style={{ background: 'linear-gradient(to bottom right, #eff6ff, #ffffff)' }}
          onClick={() => setFilterStatus('wali_review')}
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-purple-100">
              <FileCheck className="h-5 w-5 text-purple-500" />
            </div>
            <div>
              <p className="text-xs text-purple-600 font-semibold uppercase tracking-wide">Review Wali</p>
              <p className="text-2xl font-bold text-purple-600">{stats.wali_review}</p>
            </div>
          </div>
        </div>
        
        <div 
          className={`cursor-pointer transition-all duration-300 flex-1 min-w-[140px] rounded-xl border border-blue-100 p-4 
            shadow-md hover:shadow-xl
            ${filterStatus === 'signed' ? 'shadow-xl border-emerald-300' : ''}`}
          style={{ background: 'linear-gradient(to bottom right, #eff6ff, #ffffff)' }}
          onClick={() => setFilterStatus('signed')}
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-100">
              <CheckCircle className="h-5 w-5 text-emerald-500" />
            </div>
            <div>
              <p className="text-xs text-emerald-600 font-semibold uppercase tracking-wide">Signed</p>
              <p className="text-2xl font-bold text-emerald-600">{stats.signed}</p>
            </div>
          </div>
        </div>
        
        <div 
          className={`cursor-pointer transition-all duration-300 flex-1 min-w-[140px] rounded-xl border border-blue-100 p-4 
            shadow-md hover:shadow-xl
            ${filterStatus === 'sent' ? 'shadow-xl border-green-300' : ''}`}
          style={{ background: 'linear-gradient(to bottom right, #eff6ff, #ffffff)' }}
          onClick={() => setFilterStatus('sent')}
            >
              <div className="flex items-center gap-4">
            <div className="p-2 rounded-xl bg-green-100">
              <Send className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <p className="text-xs text-green-600 font-semibold uppercase tracking-wide">Terkirim</p>
              <p className="text-2xl font-bold text-green-600">{stats.sent}</p>
            </div>
          </div>
        </div>
        
        <div 
          className={`cursor-pointer transition-all duration-300 flex-1 min-w-[140px] rounded-xl border border-blue-100 p-4 
            shadow-md hover:shadow-xl
            ${filterStatus === 'rejected' ? 'shadow-xl border-red-300' : ''}`}
          style={{ background: 'linear-gradient(to bottom right, #eff6ff, #ffffff)' }}
          onClick={() => setFilterStatus('rejected')}
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-red-100">
              <XCircle className="h-5 w-5 text-red-500" />
            </div>
            <div>
              <p className="text-xs text-red-600 font-semibold uppercase tracking-wide">Ditolak</p>
              <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Table Card */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardDescription>
                {loading ? 'Memuat data...' : `Menampilkan ${filteredRequests.length} permintaan surat`}
              </CardDescription>
            </div>
            
            {/* Search and Actions */}
            <div className="flex items-center gap-2 flex-wrap">
              <div className="relative flex items-center h-9 px-3 border border-input bg-background rounded-md hover:bg-accent hover:text-accent-foreground">
                <Search className="h-4 w-4 text-muted-foreground mr-2" />
                <Input
                  placeholder="Cari kode tracking..."
                  value={searchTrackingCode}
                  onChange={(e) => setSearchTrackingCode(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearchTracking()}
                  className="border-0 p-0 h-auto w-[150px] focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent"
                />
              </div>
              {searchTrackingCode && (
                <Button 
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchTrackingCode('');
                    setFilterStatus('');
                    fetchData();
                  }}
                >
                  Reset
                </Button>
              )}
              <Button 
                style={{ backgroundColor: '#2563eb', color: 'white' }}
                className="hover:bg-blue-700"
                onClick={() => navigate('/pelayanan/surat-request/buat')}
              >
                <Plus className="h-4 w-4 mr-2" />
                Buat Surat Manual
              </Button>
            </div>
          </div>
        </CardHeader>
        
        {/* Status Tabs */}
        <div className="px-6 pb-2">
          <Tabs value={filterStatus || 'all'} onValueChange={(val: string) => setFilterStatus(val === 'all' ? '' : val)}>
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="all" className="text-xs">
                Semua
              </TabsTrigger>
              <TabsTrigger value="pending" className="text-xs">
                Pending
              </TabsTrigger>
              <TabsTrigger value="wali_review" className="text-xs">
                Review Wali
              </TabsTrigger>
              <TabsTrigger value="signed" className="text-xs">
                Ditandatangani
              </TabsTrigger>
              <TabsTrigger value="sent" className="text-xs">
                Terkirim
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        
        <CardContent>
          {/* Data Table */}
          <div className="rounded-md border max-h-[600px] overflow-y-auto">
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchTrackingCode 
                ? `Tidak ditemukan permintaan dengan kode "${searchTrackingCode}"`
                : 'Tidak ada permintaan surat'
              }
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
                  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);
                  const startIndex = (currentPage - 1) * itemsPerPage;
                  const paginatedRequests = filteredRequests.slice(startIndex, startIndex + itemsPerPage);
                  
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
                        onClick={() => navigate(`/pelayanan/surat-request/${request.id}`)}
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
              const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);
              const startIndex = (currentPage - 1) * itemsPerPage;
              return (
                <div className="flex items-center justify-between mt-4 pt-4 border-t">
                  <div className="text-sm text-muted-foreground">
                    Menampilkan {startIndex + 1} - {Math.min(startIndex + itemsPerPage, filteredRequests.length)} dari {filteredRequests.length} permintaan
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
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
