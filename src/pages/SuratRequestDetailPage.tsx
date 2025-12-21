import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
  FileText, 
  CheckCircle, 
  XCircle, 
  Send, 
  Clock,
  User,
  Phone,
  FileCheck,
  Loader2,
  ArrowLeft,
  Calendar,
  MapPin,
  Image as ImageIcon,
  Eye,
  Download,
  ZoomIn,
  ZoomOut,
  X,
  FileImage,
  Paperclip,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import suratRequestService from '@/services/suratRequestService';

// Types
interface Warga {
  id: number;
  nik: string;
  nama: string;
  alamat?: string;
  no_hp?: string;
  tempat_lahir?: string;
  tanggal_lahir?: string;
  jenis_kelamin?: string;
  agama?: string;
  pekerjaan?: string;
  status_perkawinan?: string;
  golongan_darah?: string;
  pendidikan?: string;
  kewarganegaraan?: string;
  rt?: string;
  rw?: string;
  kelurahan?: string;
  kecamatan?: string;
  kabupaten?: string;
  provinsi?: string;
  no_kk?: string;
  status_hubungan_keluarga?: string;
  nama_ibu?: string;
  nama_ayah?: string;
}

interface SuratTemplate {
  id: number;
  nama: string;
  kode: string;
  kategori?: string;
  deskripsi?: string;
}

interface Attachment {
  id: number | string;
  nama: string;
  file_path: string;
  file_url: string;
  file_type: string;
  file_size?: number;
  created_at: string;
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
  pdf_url?: string;
  sent_at?: string;
  created_at: string;
  updated_at: string;
  warga?: Warga;
  template?: SuratTemplate;
  attachments?: Attachment[];
}

export default function SuratRequestDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [request, setRequest] = useState<SuratRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  
  // Dialog states
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [confirmAction, setConfirmAction] = useState<'staff_approve' | 'wali_sign' | 'send' | 'resend' | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  
  // Image viewer state
  const [selectedImage, setSelectedImage] = useState<Attachment | null>(null);
  const [imageZoom, setImageZoom] = useState(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    if (id) {
      fetchDetail();
    }
  }, [id]);

  // Helper to build full PDF URL from path
  const buildPdfUrl = (path: string | undefined): string | null => {
    if (!path) return null;
    // If already a full URL, return as-is
    if (path.startsWith('http://') || path.startsWith('https://')) {
      return path;
    }
    // Build URL from relative path
    const subdomain = window.location.hostname.split('.')[0];
    return `https://${subdomain}.sintanagari.cloud/storage/${path}`;
  };

  const fetchDetail = async () => {
    try {
      setLoading(true);
      const response = await suratRequestService.getById(parseInt(id!));
      console.log('API Response:', response);
      
      // Handle response structure - bisa response.data.data, response.data, atau langsung response
      let data = response?.data?.data || response?.data || response;
      console.log('Parsed Data:', data);
      
      // Normalize field names - backend menggunakan suratTemplate bukan template
      if (data) {
        // Handle suratTemplate -> template (backend uses suratTemplate)
        if (data.surat_template && !data.template) {
          data.template = data.surat_template;
        }
        // Handle snake_case dari backend
        if (data.suratTemplate && !data.template) {
          data.template = data.suratTemplate;
        }
        // Handle jika template adalah object atau hanya nama string
        if (typeof data.template === 'string') {
          data.template = { nama: data.template };
        }
        // Handle template_nama langsung
        if (data.template_nama && !data.template?.nama) {
          data.template = { ...data.template, nama: data.template_nama };
        }
        // Handle keterangan sebagai catatan jika catatan kosong
        if (data.keterangan && !data.catatan) {
          data.catatan = data.keterangan;
        }
        
        // Build PDF URL if not provided by backend
        if (!data.pdf_url && (data.signed_pdf_path || data.pdf_path)) {
          data.pdf_url = buildPdfUrl(data.signed_pdf_path || data.pdf_path);
        }
      }
      
      console.log('Normalized Data:', data);
      setRequest(data);
    } catch (error) {
      console.error('Error fetching detail:', error);
      toast.error('Gagal mengambil data permintaan');
      navigate('/pelayanan/surat-request');
    } finally {
      setLoading(false);
    }
  };

  const handleStaffApprove = async () => {
    if (!request) return;
    try {
      setActionLoading(true);
      await suratRequestService.staffApprove(request.id);
      toast.success('Berhasil disetujui staff');
      setShowConfirmDialog(false);
      fetchDetail();
    } catch (error) {
      console.error('Error:', error);
      toast.error('Gagal menyetujui');
    } finally {
      setActionLoading(false);
    }
  };

  const handleStaffReject = async () => {
    if (!request || !rejectReason) {
      toast.error('Alasan penolakan harus diisi');
      return;
    }
    try {
      setActionLoading(true);
      await suratRequestService.staffReject(request.id, rejectReason);
      toast.success('Berhasil ditolak');
      setShowRejectDialog(false);
      setRejectReason('');
      fetchDetail();
    } catch (error) {
      console.error('Error:', error);
      toast.error('Gagal menolak');
    } finally {
      setActionLoading(false);
    }
  };

  const handleWaliSign = async () => {
    if (!request) return;
    try {
      setActionLoading(true);
      await suratRequestService.waliSign(request.id);
      toast.success('Surat berhasil ditandatangani');
      setShowConfirmDialog(false);
      fetchDetail();
    } catch (error) {
      console.error('Error:', error);
      toast.error('Gagal menandatangani');
    } finally {
      setActionLoading(false);
    }
  };

  const handleWaliReject = async () => {
    if (!request || !rejectReason) {
      toast.error('Alasan penolakan harus diisi');
      return;
    }
    try {
      setActionLoading(true);
      await suratRequestService.waliReject(request.id, rejectReason);
      toast.success('Berhasil ditolak');
      setShowRejectDialog(false);
      setRejectReason('');
      fetchDetail();
    } catch (error) {
      console.error('Error:', error);
      toast.error('Gagal menolak');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSendToUser = async () => {
    if (!request) return;
    try {
      setActionLoading(true);
      await suratRequestService.sendToUser(request.id);
      toast.success('PDF berhasil dikirim ke WhatsApp');
      setShowConfirmDialog(false);
      fetchDetail();
    } catch (error) {
      console.error('Error:', error);
      toast.error('Gagal mengirim PDF');
    } finally {
      setActionLoading(false);
    }
  };

  const handleGeneratePreview = async () => {
    if (!request) return;
    try {
      setActionLoading(true);
      toast.info('Sedang membuat preview surat...');
      const response = await suratRequestService.generatePreview(request.id);
      toast.success('Preview surat berhasil dibuat');
      fetchDetail(); // Refresh to get the new PDF URL
    } catch (error: any) {
      console.error('Error:', error);
      toast.error(error.response?.data?.message || 'Gagal membuat preview surat');
    } finally {
      setActionLoading(false);
    }
  };

  const openConfirmDialog = (action: 'staff_approve' | 'wali_sign' | 'send' | 'resend') => {
    setConfirmAction(action);
    setShowConfirmDialog(true);
  };

  const handleConfirmAction = () => {
    switch (confirmAction) {
      case 'staff_approve':
        handleStaffApprove();
        break;
      case 'wali_sign':
        handleWaliSign();
        break;
      case 'send':
      case 'resend':
        handleSendToUser();
        break;
    }
  };

  const getConfirmDialogContent = () => {
    switch (confirmAction) {
      case 'staff_approve':
        return {
          title: 'Setujui Permintaan',
          description: 'Apakah Anda yakin ingin menyetujui permintaan surat ini? Permintaan akan diteruskan ke Wali Nagari untuk ditandatangani.'
        };
      case 'wali_sign':
        return {
          title: 'Tanda Tangan Surat',
          description: 'Apakah Anda yakin ingin menandatangani surat ini? Surat akan dibuatkan PDF dan siap dikirim ke pemohon.'
        };
      case 'send':
        return {
          title: 'Kirim ke WhatsApp',
          description: 'Apakah Anda yakin ingin mengirim surat ini ke WhatsApp pemohon? PDF akan dikirim ke nomor yang terdaftar.'
        };
      case 'resend':
        return {
          title: 'Kirim Ulang ke WhatsApp',
          description: 'Surat ini sudah pernah dikirim sebelumnya. Apakah Anda yakin ingin mengirim ulang surat ke WhatsApp pemohon?'
        };
      default:
        return { title: '', description: '' };
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; className?: string }> = {
      pending: { label: 'Pending', variant: 'secondary', className: 'bg-amber-100 text-amber-700 border-amber-200' },
      staff_review: { label: 'Review Staff', variant: 'default', className: 'bg-blue-100 text-blue-700 border-blue-200' },
      wali_review: { label: 'Review Wali', variant: 'default', className: 'bg-purple-100 text-purple-700 border-purple-200' },
      signed: { label: 'Ditandatangani', variant: 'outline', className: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
      sent: { label: 'Terkirim', variant: 'default', className: 'bg-green-100 text-green-700 border-green-200' },
      rejected: { label: 'Ditolak', variant: 'destructive' }
    };
    const config = statusConfig[status] || { label: status, variant: 'secondary' as const };
    return <Badge variant={config.variant} className={config.className}>{config.label}</Badge>;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '-';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const getImageAttachments = () => {
    return request?.attachments?.filter(att => 
      att.file_type?.startsWith('image/') || 
      /\.(jpg|jpeg|png|gif|webp)$/i.test(att.file_path)
    ) || [];
  };

  const openImageViewer = (attachment: Attachment, index: number) => {
    setSelectedImage(attachment);
    setCurrentImageIndex(index);
    setImageZoom(1);
  };

  const closeImageViewer = () => {
    setSelectedImage(null);
    setImageZoom(1);
  };

  const navigateImage = (direction: 'prev' | 'next') => {
    const images = getImageAttachments();
    if (images.length === 0) return;
    
    let newIndex = currentImageIndex;
    if (direction === 'prev') {
      newIndex = currentImageIndex > 0 ? currentImageIndex - 1 : images.length - 1;
    } else {
      newIndex = currentImageIndex < images.length - 1 ? currentImageIndex + 1 : 0;
    }
    setCurrentImageIndex(newIndex);
    setSelectedImage(images[newIndex]);
    setImageZoom(1);
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-xl font-semibold mb-2">Data Tidak Ditemukan</h2>
              <p className="text-muted-foreground mb-4">Permintaan surat dengan ID tersebut tidak ditemukan</p>
              <Button onClick={() => navigate('/pelayanan/surat-request')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Kembali ke Daftar
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const imageAttachments = getImageAttachments();

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/pelayanan/surat-request')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <FileText className="h-6 w-6" />
              Detail Permintaan Surat
            </h1>
            <p className="text-muted-foreground">
              Kode Tracking: <span className="font-mono font-medium">{request.tracking_code}</span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {getStatusBadge(request.status)}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content - Left Side */}
        <div className="lg:col-span-2 space-y-6">
          {/* Tabs for Surat Review and Persyaratan */}
          <Tabs defaultValue="info" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="info" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Informasi
              </TabsTrigger>
              <TabsTrigger value="preview" className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Review Surat
              </TabsTrigger>
              <TabsTrigger value="attachments" className="flex items-center gap-2">
                <ImageIcon className="h-4 w-4" />
                Persyaratan ({imageAttachments.length})
              </TabsTrigger>
            </TabsList>

            {/* Tab Informasi */}
            <TabsContent value="info" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Informasi Permohonan</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Debug Info - Hapus setelah fix */}
                  {process.env.NODE_ENV === 'development' && (
                    <details className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-xs">
                      <summary className="cursor-pointer font-medium text-yellow-700">🔍 Debug Data (klik untuk expand)</summary>
                      <pre className="mt-2 overflow-auto max-h-40 text-yellow-800">
                        {JSON.stringify({
                          template: request.template,
                          keperluan: request.keperluan,
                          warga: request.warga,
                          all_keys: Object.keys(request)
                        }, null, 2)}
                      </pre>
                    </details>
                  )}
                  
                  {/* Data Pemohon - Complete Info */}
                  <div className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-900">
                    <div className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 mb-4 font-medium">
                      <User className="h-4 w-4" />
                      Data Pemohon
                    </div>
                    
                    {/* Header dengan nama dan avatar */}
                    <div className="flex items-center gap-4 mb-4 pb-4 border-b border-blue-200 dark:border-blue-800">
                      <div className="h-14 w-14 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                        <User className="h-7 w-7 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <div className="font-bold text-xl">{request.warga?.nama || '-'}</div>
                        <div className="text-sm text-muted-foreground font-mono">NIK: {request.warga?.nik || '-'}</div>
                      </div>
                    </div>
                    
                    {/* Grid Data Lengkap */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {/* No. WhatsApp */}
                      <div className="bg-white dark:bg-gray-900 p-3 rounded-lg">
                        <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                          <Phone className="h-3 w-3" /> No. WhatsApp
                        </div>
                        <div className="font-medium text-green-600">{request.phone_number || '-'}</div>
                      </div>
                      
                      {/* Tempat, Tanggal Lahir */}
                      <div className="bg-white dark:bg-gray-900 p-3 rounded-lg">
                        <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                          <Calendar className="h-3 w-3" /> Tempat, Tanggal Lahir
                        </div>
                        <div className="font-medium">
                          {request.warga?.tempat_lahir || '-'}
                          {request.warga?.tanggal_lahir && (
                            <>, {new Date(request.warga.tanggal_lahir).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</>
                          )}
                        </div>
                      </div>
                      
                      {/* Jenis Kelamin */}
                      <div className="bg-white dark:bg-gray-900 p-3 rounded-lg">
                        <div className="text-xs text-muted-foreground mb-1">Jenis Kelamin</div>
                        <div className="font-medium">{request.warga?.jenis_kelamin || '-'}</div>
                      </div>
                      
                      {/* Agama */}
                      <div className="bg-white dark:bg-gray-900 p-3 rounded-lg">
                        <div className="text-xs text-muted-foreground mb-1">Agama</div>
                        <div className="font-medium">{request.warga?.agama || '-'}</div>
                      </div>
                      
                      {/* Status Perkawinan */}
                      <div className="bg-white dark:bg-gray-900 p-3 rounded-lg">
                        <div className="text-xs text-muted-foreground mb-1">Status Perkawinan</div>
                        <div className="font-medium">{request.warga?.status_perkawinan || '-'}</div>
                      </div>
                      
                      {/* Pekerjaan */}
                      <div className="bg-white dark:bg-gray-900 p-3 rounded-lg">
                        <div className="text-xs text-muted-foreground mb-1">Pekerjaan</div>
                        <div className="font-medium">{request.warga?.pekerjaan || '-'}</div>
                      </div>
                      
                      {/* Pendidikan */}
                      <div className="bg-white dark:bg-gray-900 p-3 rounded-lg">
                        <div className="text-xs text-muted-foreground mb-1">Pendidikan Terakhir</div>
                        <div className="font-medium">{request.warga?.pendidikan || '-'}</div>
                      </div>
                      
                      {/* Golongan Darah */}
                      <div className="bg-white dark:bg-gray-900 p-3 rounded-lg">
                        <div className="text-xs text-muted-foreground mb-1">Golongan Darah</div>
                        <div className="font-medium">{request.warga?.golongan_darah || '-'}</div>
                      </div>
                      
                      {/* Kewarganegaraan */}
                      <div className="bg-white dark:bg-gray-900 p-3 rounded-lg">
                        <div className="text-xs text-muted-foreground mb-1">Kewarganegaraan</div>
                        <div className="font-medium">{request.warga?.kewarganegaraan || 'WNI'}</div>
                      </div>
                      
                      {/* No. KK */}
                      {request.warga?.no_kk && (
                        <div className="bg-white dark:bg-gray-900 p-3 rounded-lg">
                          <div className="text-xs text-muted-foreground mb-1">No. Kartu Keluarga</div>
                          <div className="font-medium font-mono">{request.warga.no_kk}</div>
                        </div>
                      )}
                      
                      {/* Status Hubungan Keluarga */}
                      {request.warga?.status_hubungan_keluarga && (
                        <div className="bg-white dark:bg-gray-900 p-3 rounded-lg">
                          <div className="text-xs text-muted-foreground mb-1">Status dalam Keluarga</div>
                          <div className="font-medium">{request.warga.status_hubungan_keluarga}</div>
                        </div>
                      )}
                      
                      {/* Nama Ayah */}
                      {request.warga?.nama_ayah && (
                        <div className="bg-white dark:bg-gray-900 p-3 rounded-lg">
                          <div className="text-xs text-muted-foreground mb-1">Nama Ayah</div>
                          <div className="font-medium">{request.warga.nama_ayah}</div>
                        </div>
                      )}
                      
                      {/* Nama Ibu */}
                      {request.warga?.nama_ibu && (
                        <div className="bg-white dark:bg-gray-900 p-3 rounded-lg">
                          <div className="text-xs text-muted-foreground mb-1">Nama Ibu</div>
                          <div className="font-medium">{request.warga.nama_ibu}</div>
                        </div>
                      )}
                    </div>
                    
                    {/* Alamat Lengkap */}
                    <div className="mt-4 bg-white dark:bg-gray-900 p-3 rounded-lg">
                      <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                        <MapPin className="h-3 w-3" /> Alamat Lengkap
                      </div>
                      <div className="font-medium">
                        {request.warga?.alamat || '-'}
                        {(request.warga?.rt || request.warga?.rw) && (
                          <span className="text-muted-foreground">
                            {request.warga?.rt && ` RT ${request.warga.rt}`}
                            {request.warga?.rw && ` RW ${request.warga.rw}`}
                          </span>
                        )}
                      </div>
                      {(request.warga?.kelurahan || request.warga?.kecamatan || request.warga?.kabupaten) && (
                        <div className="text-sm text-muted-foreground mt-1">
                          {[request.warga?.kelurahan, request.warga?.kecamatan, request.warga?.kabupaten, request.warga?.provinsi]
                            .filter(Boolean)
                            .join(', ')}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Jenis Surat - Highlight Card */}
                  <div className="p-4 bg-primary/5 rounded-lg border">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                      <FileCheck className="h-4 w-4" />
                      Jenis Surat yang Diminta
                    </div>
                    <div className="text-lg font-semibold">{request.template?.nama || '-'}</div>
                    {request.template?.kode && (
                      <div className="text-sm text-muted-foreground mt-1">
                        Kode: <span className="font-mono">{request.template.kode}</span>
                      </div>
                    )}
                    {request.template?.kategori && (
                      <Badge variant="outline" className="mt-2">{request.template.kategori}</Badge>
                    )}
                    {request.template?.deskripsi && (
                      <p className="text-sm text-muted-foreground mt-2">{request.template.deskripsi}</p>
                    )}
                  </div>

                  {/* Keperluan */}
                  <div>
                    <div className="text-sm text-muted-foreground mb-2 flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Keperluan Surat
                    </div>
                    <div className="p-3 bg-muted rounded-lg">{request.keperluan || '-'}</div>
                  </div>

                  {/* Catatan */}
                  {request.catatan && (
                    <div>
                      <div className="text-sm text-muted-foreground mb-2">Catatan Tambahan dari Pemohon</div>
                      <div className="p-3 bg-muted rounded-lg">{request.catatan}</div>
                    </div>
                  )}

                  {/* Staff Notes */}
                  {request.staff_notes && (
                    <div>
                      <div className="text-sm text-muted-foreground mb-2">Catatan Staff</div>
                      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">{request.staff_notes}</div>
                    </div>
                  )}

                  {/* Wali Notes */}
                  {request.wali_notes && (
                    <div>
                      <div className="text-sm text-muted-foreground mb-2">Catatan Wali Nagari</div>
                      <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">{request.wali_notes}</div>
                    </div>
                  )}

                  {/* Rejected Reason */}
                  {request.rejected_reason && (
                    <div>
                      <div className="text-sm text-destructive mb-2 flex items-center gap-1">
                        <XCircle className="h-4 w-4" />
                        Alasan Penolakan
                      </div>
                      <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive">
                        {request.rejected_reason}
                      </div>
                    </div>
                  )}

                  <Separator />

                  {/* Timestamps */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Tanggal Pengajuan
                      </div>
                      <div className="font-medium">{formatDate(request.created_at)}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Terakhir Diupdate
                      </div>
                      <div className="font-medium">{formatDate(request.updated_at)}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tab Review Surat (PDF Preview) */}
            <TabsContent value="preview" className="mt-4">
              <Card className="max-w-4xl mx-auto">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Eye className="h-5 w-5" />
                      Review Surat
                    </CardTitle>
                    <CardDescription>
                      Preview surat yang akan/sudah dibuat
                    </CardDescription>
                  </div>
                  {(request.pdf_url || request.pdf_path) && (
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <a href={request.pdf_url || request.pdf_path} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Buka di Tab Baru
                        </a>
                      </Button>
                      <Button variant="outline" size="sm" asChild>
                        <a href={request.pdf_url || request.pdf_path} download>
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </a>
                      </Button>
                    </div>
                  )}
                </CardHeader>
                <CardContent className="p-4">
                  {request.pdf_url || request.pdf_path ? (
                    <div className="space-y-3">
                      {/* PDF Viewer using Google Docs Viewer - A4 ratio container */}
                      <div 
                        className="border rounded-lg overflow-hidden bg-white shadow-sm mx-auto"
                        style={{ 
                          maxWidth: '595px', // A4 width at 72 DPI
                          minHeight: '842px' // A4 height at 72 DPI
                        }}
                      >
                        <iframe
                          src={`https://docs.google.com/viewer?url=${encodeURIComponent(request.pdf_url || request.pdf_path || '')}&embedded=true`}
                          className="w-full border-0"
                          style={{ minHeight: '842px' }}
                          title="Preview Surat"
                          sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-popups-to-escape-sandbox"
                        />
                      </div>
                    
                    </div>
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      <FileText className="h-16 w-16 mx-auto mb-4 opacity-30" />
                      <p className="text-lg font-medium">Surat Belum Tersedia</p>
                      <p className="text-sm mt-1 mb-4">
                        {request.status === 'pending' || request.status === 'staff_review' 
                          ? 'Klik tombol di bawah untuk membuat preview surat'
                          : request.status === 'wali_review'
                          ? 'Preview dapat dibuat atau menunggu tanda tangan Wali Nagari'
                          : 'PDF tidak tersedia'}
                      </p>
                      {/* Generate Preview Button */}
                      {!['signed', 'sent', 'rejected', 'staff_rejected', 'wali_rejected'].includes(request.status) && (
                        <Button 
                          onClick={handleGeneratePreview}
                          disabled={actionLoading}
                        >
                          {actionLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          ) : (
                            <FileText className="h-4 w-4 mr-2" />
                          )}
                          Generate Preview Surat
                        </Button>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tab Persyaratan (Attachments/Images) */}
            <TabsContent value="attachments" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Paperclip className="h-5 w-5" />
                    Dokumen Persyaratan
                  </CardTitle>
                  <CardDescription>
                    Dokumen yang dilampirkan oleh pemohon
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {imageAttachments.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {imageAttachments.map((attachment, index) => (
                        <div 
                          key={attachment.id} 
                          className="group relative border rounded-lg overflow-hidden cursor-pointer hover:ring-2 hover:ring-primary transition-all"
                          onClick={() => openImageViewer(attachment, index)}
                        >
                          <div className="aspect-square bg-gray-100">
                            <img 
                              src={attachment.file_url || attachment.file_path}
                              alt={attachment.nama}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = '/placeholder-image.png';
                              }}
                            />
                          </div>
                          {/* Overlay */}
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                            <div className="bg-white rounded-full p-2">
                              <Eye className="h-5 w-5" />
                            </div>
                          </div>
                          {/* Label */}
                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                            <p className="text-white text-xs truncate">{attachment.nama}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      <FileImage className="h-16 w-16 mx-auto mb-4 opacity-30" />
                      <p className="text-lg font-medium">Tidak Ada Dokumen</p>
                      <p className="text-sm mt-1">Pemohon belum melampirkan dokumen persyaratan</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar - Right Side */}
        <div className="space-y-6">
          {/* Actions Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Aksi</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Staff Actions */}
              {(request.status === 'pending' || request.status === 'staff_review') && (
                <>
                  <Button
                    className="w-full"
                    onClick={() => openConfirmDialog('staff_approve')}
                    disabled={actionLoading}
                  >
                    {actionLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CheckCircle className="h-4 w-4 mr-2" />}
                    Setujui (Staff)
                  </Button>
                  <Button
                    variant="destructive"
                    className="w-full"
                    onClick={() => setShowRejectDialog(true)}
                    disabled={actionLoading}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Tolak Permintaan
                  </Button>
                </>
              )}

              {/* Wali Actions */}
              {request.status === 'wali_review' && (
                <>
                  <Button
                    className="w-full"
                    onClick={() => openConfirmDialog('wali_sign')}
                    disabled={actionLoading}
                  >
                    {actionLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <FileCheck className="h-4 w-4 mr-2" />}
                    Tanda Tangan (Wali)
                  </Button>
                  <Button
                    variant="destructive"
                    className="w-full"
                    onClick={() => setShowRejectDialog(true)}
                    disabled={actionLoading}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Tolak Permintaan
                  </Button>
                </>
              )}

              {/* Send Action */}
              {request.status === 'signed' && (
                <Button
                  className="w-full"
                  onClick={() => openConfirmDialog('send')}
                  disabled={actionLoading}
                >
                  {actionLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
                  Kirim ke WhatsApp
                </Button>
              )}

              {/* Completed State - dengan opsi kirim ulang */}
              {request.status === 'sent' && (
                <div className="space-y-3">
                  <div className="text-center py-3 text-green-600 bg-green-50 rounded-lg border border-green-200">
                    <CheckCircle className="h-8 w-8 mx-auto mb-2" />
                    <p className="font-medium">Surat Sudah Terkirim</p>
                    {request.sent_at && (
                      <p className="text-xs text-green-600/70 mt-1">
                        Terkirim pada: {new Date(request.sent_at).toLocaleString('id-ID')}
                      </p>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => openConfirmDialog('resend')}
                    disabled={actionLoading}
                  >
                    {actionLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
                    Kirim Ulang ke WhatsApp
                  </Button>
                </div>
              )}

              {/* Rejected State */}
              {request.status === 'rejected' && (
                <div className="text-center py-4 text-destructive">
                  <XCircle className="h-8 w-8 mx-auto mb-2" />
                  <p className="font-medium">Permintaan Ditolak</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Status Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Alur Proses</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { key: 'pending', label: 'Pending', icon: Clock },
                  { key: 'staff_review', label: 'Review Staff', icon: User },
                  { key: 'wali_review', label: 'Review Wali', icon: FileCheck },
                  { key: 'signed', label: 'Ditandatangani', icon: CheckCircle },
                  { key: 'sent', label: 'Terkirim', icon: Send },
                ].map((step, index) => {
                  const isActive = request.status === step.key;
                  const isPassed = ['pending', 'staff_review', 'wali_review', 'signed', 'sent'].indexOf(request.status) > index;
                  const isRejected = request.status === 'rejected';
                  
                  return (
                    <div key={step.key} className="flex items-center gap-3">
                      <div className={`
                        h-8 w-8 rounded-full flex items-center justify-center
                        ${isActive ? 'bg-primary text-white' : isPassed ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}
                        ${isRejected && index === 0 ? 'bg-red-100 text-red-600' : ''}
                      `}>
                        <step.icon className="h-4 w-4" />
                      </div>
                      <span className={`text-sm ${isActive ? 'font-semibold' : isPassed ? 'text-green-600' : 'text-muted-foreground'}`}>
                        {step.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

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
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
              Batal
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => {
                if (request?.status === 'pending' || request?.status === 'staff_review') {
                  handleStaffReject();
                } else if (request?.status === 'wali_review') {
                  handleWaliReject();
                }
              }}
              disabled={actionLoading || !rejectReason}
            >
              {actionLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <XCircle className="h-4 w-4 mr-2" />}
              Tolak
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{getConfirmDialogContent().title}</AlertDialogTitle>
            <AlertDialogDescription>
              {getConfirmDialogContent().description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={actionLoading}>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmAction} disabled={actionLoading}>
              {actionLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Ya, Lanjutkan
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Image Viewer Modal */}
      {selectedImage && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center">
          {/* Close Button */}
          <button 
            className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
            onClick={closeImageViewer}
          >
            <X className="h-8 w-8" />
          </button>
          
          {/* Navigation Buttons */}
          {imageAttachments.length > 1 && (
            <>
              <button 
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 z-10 p-2 bg-black/50 rounded-full"
                onClick={() => navigateImage('prev')}
              >
                <ChevronLeft className="h-8 w-8" />
              </button>
              <button 
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 z-10 p-2 bg-black/50 rounded-full"
                onClick={() => navigateImage('next')}
              >
                <ChevronRight className="h-8 w-8" />
              </button>
            </>
          )}
          
          {/* Zoom Controls */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-black/50 rounded-full px-4 py-2">
            <button 
              className="text-white hover:text-gray-300"
              onClick={() => setImageZoom(Math.max(0.5, imageZoom - 0.25))}
            >
              <ZoomOut className="h-5 w-5" />
            </button>
            <span className="text-white text-sm min-w-[60px] text-center">{Math.round(imageZoom * 100)}%</span>
            <button 
              className="text-white hover:text-gray-300"
              onClick={() => setImageZoom(Math.min(3, imageZoom + 0.25))}
            >
              <ZoomIn className="h-5 w-5" />
            </button>
          </div>

          {/* Image Counter */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 text-white bg-black/50 px-3 py-1 rounded-full text-sm">
            {currentImageIndex + 1} / {imageAttachments.length}
          </div>
          
          {/* Image */}
          <div className="max-w-[90vw] max-h-[80vh] overflow-auto">
            <img 
              src={selectedImage.file_url || selectedImage.file_path}
              alt={selectedImage.nama}
              className="transition-transform duration-200"
              style={{ transform: `scale(${imageZoom})` }}
            />
          </div>
          
          {/* Image Info */}
          <div className="absolute bottom-16 left-1/2 -translate-x-1/2 text-white text-center">
            <p className="font-medium">{selectedImage.nama}</p>
            <p className="text-sm text-gray-400">{formatFileSize(selectedImage.file_size)}</p>
          </div>
        </div>
      )}
    </div>
  );
}
