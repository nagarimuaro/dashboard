import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
  DialogFooter,
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
  Upload, FileText, Download, Trash2, Eye, Plus, Edit, Copy, 
  Printer, Loader2, CheckCircle, List, Search, RefreshCw, 
  FileUp, Settings, ChevronLeft, ChevronRight, AlertTriangle,
  FileCheck, X, ExternalLink, Users, ArrowDownToLine, FileEdit
} from 'lucide-react';
import { suratTemplateService } from '@/services/suratTemplateService';
import { OnlyOfficeEditor } from '@/components/OnlyOfficeEditor';

// Toast helper
const showToast = (title: string, description: string, variant?: 'default' | 'destructive') => {
  // Simple toast notification
  const toast = document.createElement('div');
  toast.className = `fixed bottom-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg ${
    variant === 'destructive' ? 'bg-red-500 text-white' : 'bg-green-500 text-white'
  }`;
  toast.innerHTML = `<strong>${title}</strong><br/><span class="text-sm">${description}</span>`;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
};

interface RequiredDocument {
  key: string;
  label: string;
  type: 'ktp' | 'kk' | 'selfie_ktp' | 'photo' | 'document';
  required: boolean;
}

interface AdditionalVariable {
  key: string;
  label: string;
  type: 'text' | 'date' | 'select' | 'number';
  options?: string[]; // for select type
  required: boolean;
}

interface KeperluanOption {
  label: string;
  value: string;
}

interface SuratTemplate {
  id: number;
  nama: string;
  kategori: string;
  kode: string;
  format_nomor: string;
  file_path: string;
  file_name: string;
  deskripsi: string;
  persyaratan: string[];
  required_documents: RequiredDocument[];
  additional_variables: AdditionalVariable[];
  requires_keperluan: boolean;
  keperluan_options: KeperluanOption[];
  is_active: boolean;
  counter: number;
  population_effect: string;
  population_action: string;
  created_at: string;
  updated_at: string;
}

interface GenerateResult {
  warga: { id: number; nama: string; nik: string };
  nomor_surat: string;
  file_name: string;
  docx_url: string;
  pdf_url: string | null;
  has_pdf: boolean;
}

const KATEGORI_OPTIONS = [
  'Kependudukan',
  'Sosial',
  'Ekonomi',
  'Pertanahan',
  'Perizinan',
  'Organisasi',
  'Perumahan',
  'Umum',
];

const POPULATION_EFFECTS = [
  { value: 'none', label: 'Tidak Ada Efek' },
  { value: 'increase', label: 'Penambahan Penduduk' },
  { value: 'decrease', label: 'Pengurangan Penduduk' },
];

const POPULATION_ACTIONS = [
  { value: 'none', label: 'Tidak Ada Aksi' },
  { value: 'set_meninggal', label: 'Set Status Meninggal' },
  { value: 'set_pindah', label: 'Set Status Pindah' },
  { value: 'create_warga', label: 'Buat Warga Baru' },
];

const DOCUMENT_TYPES = [
  { value: 'ktp', label: 'KTP' },
  { value: 'kk', label: 'Kartu Keluarga (KK)' },
  { value: 'selfie_ktp', label: 'Selfie dengan KTP' },
  { value: 'photo', label: 'Foto' },
  { value: 'document', label: 'Dokumen Lainnya' },
];

const VARIABLE_TYPES = [
  { value: 'text', label: 'Teks' },
  { value: 'date', label: 'Tanggal' },
  { value: 'number', label: 'Angka' },
  { value: 'select', label: 'Pilihan (Select)' },
];

export default function TemplateSuratManager() {
  const [templates, setTemplates] = useState<SuratTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedKategori, setSelectedKategori] = useState<string>('all');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  // Dialog states
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [generateDialogOpen, setGenerateDialogOpen] = useState(false);
  const [onlyOfficeEditorOpen, setOnlyOfficeEditorOpen] = useState(false);
  
  // Selected template
  const [selectedTemplate, setSelectedTemplate] = useState<SuratTemplate | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    nama: '',
    kategori: '',
    kode: '',
    deskripsi: '',
    format_nomor: '{nomor}/{kode}/{bulan_romawi}/{tahun}',
    persyaratan: [] as string[],
    required_documents: [] as RequiredDocument[],
    additional_variables: [] as AdditionalVariable[],
    requires_keperluan: false,
    keperluan_options: [] as KeperluanOption[],
    population_effect: 'none',
    population_action: 'none',
    is_active: true,
    file: null as File | null
  });
  const [newPersyaratan, setNewPersyaratan] = useState('');
  const [newDocument, setNewDocument] = useState<Partial<RequiredDocument>>({ key: '', label: '', type: 'document', required: true });
  const [newVariable, setNewVariable] = useState<Partial<AdditionalVariable>>({ key: '', label: '', type: 'text', required: false, options: [] });
  const [newVariableOption, setNewVariableOption] = useState('');
  
  // Preview state
  const [previewData, setPreviewData] = useState<{
    template: SuratTemplate | null;
    file_url: string;
    office_viewer_url?: string;
    google_viewer_url?: string;
    variables: string[];
  } | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewMode, setPreviewMode] = useState<'office' | 'google'>('office');
  
  // Generate state
  const [generateLoading, setGenerateLoading] = useState(false);
  const [generateResult, setGenerateResult] = useState<GenerateResult | null>(null);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const data = await suratTemplateService.getAll({ active: 'all' });
      setTemplates(Array.isArray(data) ? data : []);
    } catch (error: any) {
      console.error('Error loading templates:', error);
      setTemplates([]);
      showToast('Error', error.message || 'Gagal memuat template surat', 'destructive');
    } finally {
      setLoading(false);
    }
  };

  // Filtered and sorted templates (active first, then inactive at bottom)
  const filteredTemplates = templates
    .filter(t => {
      const matchSearch = searchTerm === '' || 
        t.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.kode.toLowerCase().includes(searchTerm.toLowerCase());
      const matchKategori = selectedKategori === 'all' || t.kategori === selectedKategori;
      return matchSearch && matchKategori;
    })
    .sort((a, b) => {
      // Sort: active templates first, inactive at bottom
      if (a.is_active === b.is_active) return 0;
      return a.is_active ? -1 : 1;
    });

  // Paginated templates
  const totalPages = Math.ceil(filteredTemplates.length / itemsPerPage);
  const paginatedTemplates = filteredTemplates.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const resetForm = () => {
    setFormData({
      nama: '',
      kategori: '',
      kode: '',
      deskripsi: '',
      format_nomor: '{nomor}/{kode}/{bulan_romawi}/{tahun}',
      persyaratan: [],
      required_documents: [],
      additional_variables: [],
      requires_keperluan: false,
      keperluan_options: [],
      population_effect: 'none',
      population_action: 'none',
      is_active: true,
      file: null
    });
    setNewPersyaratan('');
    setNewDocument({ key: '', label: '', type: 'document', required: true });
    setNewVariable({ key: '', label: '', type: 'text', required: false, options: [] });
    setNewVariableOption('');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
          file.name.endsWith('.docx')) {
        setFormData({ ...formData, file });
      } else {
        showToast('Error', 'Hanya file .docx yang diperbolehkan', 'destructive');
      }
    }
  };

  const addPersyaratan = () => {
    if (newPersyaratan.trim()) {
      setFormData({
        ...formData,
        persyaratan: [...formData.persyaratan, newPersyaratan.trim()]
      });
      setNewPersyaratan('');
    }
  };

  const removePersyaratan = (index: number) => {
    setFormData({
      ...formData,
      persyaratan: formData.persyaratan.filter((_, i) => i !== index)
    });
  };

  // Required Documents helpers
  const addRequiredDocument = () => {
    if (newDocument.key && newDocument.label && newDocument.type) {
      setFormData({
        ...formData,
        required_documents: [...formData.required_documents, newDocument as RequiredDocument]
      });
      setNewDocument({ key: '', label: '', type: 'document', required: true });
    } else {
      showToast('Error', 'Key dan Label harus diisi', 'destructive');
    }
  };

  const removeRequiredDocument = (index: number) => {
    setFormData({
      ...formData,
      required_documents: formData.required_documents.filter((_, i) => i !== index)
    });
  };

  // Additional Variables helpers
  const addAdditionalVariable = () => {
    if (newVariable.key && newVariable.label && newVariable.type) {
      const varToAdd: AdditionalVariable = {
        key: newVariable.key,
        label: newVariable.label,
        type: newVariable.type as 'text' | 'date' | 'select' | 'number',
        required: newVariable.required || false,
        options: newVariable.type === 'select' ? newVariable.options : undefined
      };
      setFormData({
        ...formData,
        additional_variables: [...formData.additional_variables, varToAdd]
      });
      setNewVariable({ key: '', label: '', type: 'text', required: false, options: [] });
      setNewVariableOption('');
    } else {
      showToast('Error', 'Key dan Label harus diisi', 'destructive');
    }
  };

  const removeAdditionalVariable = (index: number) => {
    setFormData({
      ...formData,
      additional_variables: formData.additional_variables.filter((_, i) => i !== index)
    });
  };

  const addVariableOption = () => {
    if (newVariableOption.trim()) {
      setNewVariable({
        ...newVariable,
        options: [...(newVariable.options || []), newVariableOption.trim()]
      });
      setNewVariableOption('');
    }
  };

  const removeVariableOption = (index: number) => {
    setNewVariable({
      ...newVariable,
      options: (newVariable.options || []).filter((_, i) => i !== index)
    });
  };

  // CREATE
  const handleCreate = async () => {
    if (!formData.file || !formData.nama || !formData.kategori || !formData.kode) {
      showToast('Error', 'Nama, Kategori, Kode, dan File Template harus diisi', 'destructive');
      return;
    }

    try {
      setLoading(true);
      const uploadFormData = new FormData();
      uploadFormData.append('file', formData.file);
      uploadFormData.append('nama', formData.nama);
      uploadFormData.append('kategori', formData.kategori);
      uploadFormData.append('kode', formData.kode.toUpperCase());
      uploadFormData.append('deskripsi', formData.deskripsi);
      uploadFormData.append('format_nomor', formData.format_nomor);
      uploadFormData.append('persyaratan', JSON.stringify(formData.persyaratan));
      uploadFormData.append('required_documents', JSON.stringify(formData.required_documents));
      uploadFormData.append('additional_variables', JSON.stringify(formData.additional_variables));
      uploadFormData.append('requires_keperluan', String(formData.requires_keperluan));
      uploadFormData.append('keperluan_options', JSON.stringify(formData.keperluan_options));
      uploadFormData.append('population_effect', formData.population_effect);
      uploadFormData.append('population_action', formData.population_action);
      
      await suratTemplateService.upload(uploadFormData);
      showToast('Berhasil', 'Template surat berhasil ditambahkan');
      setCreateDialogOpen(false);
      resetForm();
      loadTemplates();
    } catch (error: any) {
      showToast('Error', error.message || 'Gagal menambahkan template', 'destructive');
    } finally {
      setLoading(false);
    }
  };

  // EDIT
  const openEditDialog = (template: SuratTemplate) => {
    setSelectedTemplate(template);
    setFormData({
      nama: template.nama,
      kategori: template.kategori,
      kode: template.kode,
      deskripsi: template.deskripsi || '',
      format_nomor: template.format_nomor,
      persyaratan: template.persyaratan || [],
      required_documents: template.required_documents || [],
      additional_variables: template.additional_variables || [],
      requires_keperluan: template.requires_keperluan || false,
      keperluan_options: template.keperluan_options || [],
      population_effect: template.population_effect || 'none',
      population_action: template.population_action || 'none',
      is_active: template.is_active,
      file: null
    });
    setNewDocument({ key: '', label: '', type: 'document', required: true });
    setNewVariable({ key: '', label: '', type: 'text', required: false, options: [] });
    setNewVariableOption('');
    setEditDialogOpen(true);
  };

  // ONLYOFFICE EDITOR
  const openOnlyOfficeEditor = (template: SuratTemplate) => {
    setSelectedTemplate(template);
    setOnlyOfficeEditorOpen(true);
  };

  const handleOnlyOfficeSaved = () => {
    showToast('Sukses', 'Dokumen berhasil disimpan', 'default');
    loadTemplates();
  };

  const handleUpdate = async () => {
    if (!selectedTemplate) return;

    try {
      setLoading(true);
      const updateFormData = new FormData();
      
      if (formData.file) {
        updateFormData.append('file', formData.file);
      }
      updateFormData.append('nama', formData.nama);
      updateFormData.append('kategori', formData.kategori);
      updateFormData.append('kode', formData.kode.toUpperCase());
      updateFormData.append('deskripsi', formData.deskripsi);
      updateFormData.append('format_nomor', formData.format_nomor);
      updateFormData.append('persyaratan', JSON.stringify(formData.persyaratan));
      updateFormData.append('required_documents', JSON.stringify(formData.required_documents));
      updateFormData.append('additional_variables', JSON.stringify(formData.additional_variables));
      updateFormData.append('requires_keperluan', String(formData.requires_keperluan));
      updateFormData.append('keperluan_options', JSON.stringify(formData.keperluan_options));
      updateFormData.append('population_effect', formData.population_effect);
      updateFormData.append('population_action', formData.population_action);
      updateFormData.append('is_active', formData.is_active ? '1' : '0');
      
      await suratTemplateService.update(selectedTemplate.id, updateFormData);
      showToast('Berhasil', 'Template surat berhasil diupdate');
      setEditDialogOpen(false);
      resetForm();
      setSelectedTemplate(null);
      loadTemplates();
    } catch (error: any) {
      showToast('Error', error.message || 'Gagal mengupdate template', 'destructive');
    } finally {
      setLoading(false);
    }
  };

  // DELETE
  const openDeleteDialog = (template: SuratTemplate) => {
    setSelectedTemplate(template);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedTemplate) return;

    try {
      setLoading(true);
      await suratTemplateService.delete(selectedTemplate.id);
      showToast('Berhasil', 'Template berhasil dihapus');
      setDeleteDialogOpen(false);
      setSelectedTemplate(null);
      loadTemplates();
    } catch (error: any) {
      showToast('Error', error.message || 'Gagal menghapus template', 'destructive');
    } finally {
      setLoading(false);
    }
  };

  // PREVIEW
  const handlePreview = async (template: SuratTemplate) => {
    try {
      setPreviewLoading(true);
      setSelectedTemplate(template);
      setPreviewDialogOpen(true);
      const data = await suratTemplateService.preview(template.id);
      setPreviewData({
        ...data,
        template
      });
    } catch (error: any) {
      showToast('Error', error.message || 'Gagal memuat preview', 'destructive');
      setPreviewDialogOpen(false);
    } finally {
      setPreviewLoading(false);
    }
  };

  // DOWNLOAD
  const handleDownload = async (template: SuratTemplate) => {
    try {
      const blob = await suratTemplateService.download(template.id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${template.kode}_${template.nama}.docx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error: any) {
      showToast('Error', error.message || 'Gagal mengunduh template', 'destructive');
    }
  };

  // TEST GENERATE
  const handleTestGenerate = async (template: SuratTemplate) => {
    setSelectedTemplate(template);
    setGenerateResult(null);
    setGenerateDialogOpen(true);
    
    try {
      setGenerateLoading(true);
      const result = await suratTemplateService.testGenerate(template.id);
      setGenerateResult(result);
    } catch (error: any) {
      showToast('Error', error.message || 'Gagal generate surat test', 'destructive');
    } finally {
      setGenerateLoading(false);
    }
  };

  // DUPLICATE
  const handleDuplicate = async (template: SuratTemplate) => {
    try {
      setLoading(true);
      await suratTemplateService.duplicate(template.id);
      showToast('Berhasil', 'Template berhasil diduplikasi');
      loadTemplates();
    } catch (error: any) {
      showToast('Error', error.message || 'Gagal menduplikasi template', 'destructive');
    } finally {
      setLoading(false);
    }
  };

  // TOGGLE ACTIVE
  const handleToggleActive = async (template: SuratTemplate) => {
    try {
      await suratTemplateService.toggleActive(template.id);
      showToast('Berhasil', template.is_active ? 'Template dinonaktifkan' : 'Template diaktifkan');
      loadTemplates();
    } catch (error: any) {
      showToast('Error', error.message || 'Gagal mengubah status', 'destructive');
    }
  };

  // Get effect badge color
  const getEffectBadge = (effect: string, action: string) => {
    if (effect === 'none') return null;
    
    const colors = {
      'increase': 'bg-green-100 text-green-800',
      'decrease': 'bg-red-100 text-red-800',
    };
    
    const labels = {
      'set_meninggal': 'Kematian',
      'set_pindah': 'Pindah',
      'create_warga': 'Kelahiran',
    };
    
    return (
      <Badge className={colors[effect as keyof typeof colors] || 'bg-gray-100'}>
        {labels[action as keyof typeof labels] || action}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Kelola Template Surat</h1>
          <p className="text-muted-foreground">
            CRUD template surat dengan upload file DOCX dan live preview
          </p>
        </div>
        <div className="flex gap-2">
          <Link to="/pelayanan/variabel-template">
            <Button variant="outline">
              <List className="mr-2 h-4 w-4" />
              Daftar Variabel
            </Button>
          </Link>
          <Button onClick={() => { resetForm(); setCreateDialogOpen(true); }}>
            <Plus className="mr-2 h-4 w-4" />
            Tambah Template
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cari nama atau kode template..."
                  value={searchTerm}
                  onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                  className="pl-9"
                />
              </div>
            </div>
            <Select value={selectedKategori} onValueChange={(v: string) => { setSelectedKategori(v); setCurrentPage(1); }}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Semua Kategori" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Kategori</SelectItem>
                {KATEGORI_OPTIONS.map(k => (
                  <SelectItem key={k} value={k}>{k}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={loadTemplates} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Template Table */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Template ({filteredTemplates.length})</CardTitle>
          <CardDescription>
            Template surat yang tersedia untuk pembuatan dokumen
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading && templates.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-3">Memuat template...</span>
            </div>
          ) : filteredTemplates.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
              <p className="mt-2 text-muted-foreground">
                {searchTerm || selectedKategori !== 'all' 
                  ? 'Tidak ada template yang cocok dengan filter'
                  : 'Belum ada template surat'}
              </p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">No</TableHead>
                    <TableHead>Template</TableHead>
                    <TableHead>Kategori</TableHead>
                    <TableHead>Kode</TableHead>
                    <TableHead>Efek Populasi</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead className="text-center">Digunakan</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedTemplates.map((template, index) => (
                    <TableRow key={template.id} className={!template.is_active ? 'opacity-50' : ''}>
                      <TableCell>{(currentPage - 1) * itemsPerPage + index + 1}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{template.nama}</p>
                          {template.deskripsi && (
                            <p className="text-xs text-muted-foreground line-clamp-1">
                              {template.deskripsi}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{template.kategori}</Badge>
                      </TableCell>
                      <TableCell>
                        <code className="px-2 py-1 bg-muted rounded text-xs font-mono">
                          {template.kode}
                        </code>
                      </TableCell>
                      <TableCell>
                        {getEffectBadge(template.population_effect, template.population_action)}
                      </TableCell>
                      <TableCell className="text-center">
                        <Switch
                          checked={template.is_active}
                          onCheckedChange={() => handleToggleActive(template)}
                        />
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="secondary">{template.counter}x</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handlePreview(template)}
                            title="Preview"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditDialog(template)}
                            title="Edit Metadata"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          {template.file_path && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openOnlyOfficeEditor(template)}
                              title="Edit Dokumen di Browser"
                            >
                              <FileEdit className="h-4 w-4 text-purple-600" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleTestGenerate(template)}
                            title="Test Generate"
                          >
                            <Printer className="h-4 w-4 text-blue-600" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDownload(template)}
                            title="Download DOCX"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDuplicate(template)}
                            title="Duplikasi"
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openDeleteDialog(template)}
                            title="Hapus"
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4 pt-4 border-t">
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

      {/* CREATE Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Tambah Template Baru
            </DialogTitle>
            <DialogDescription>
              Upload file template .docx dengan variabel placeholder
            </DialogDescription>
          </DialogHeader>
          
          <Tabs defaultValue="basic" className="mt-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic">Informasi Dasar</TabsTrigger>
              <TabsTrigger value="requirements">Persyaratan</TabsTrigger>
              <TabsTrigger value="settings">Pengaturan</TabsTrigger>
            </TabsList>
            
            <TabsContent value="basic" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label htmlFor="nama">Nama Template *</Label>
                  <Input
                    id="nama"
                    placeholder="Surat Keterangan Domisili"
                    value={formData.nama}
                    onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                  />
                </div>
                
                <div>
                  <Label htmlFor="kode">Kode Surat *</Label>
                  <Input
                    id="kode"
                    placeholder="SKD"
                    value={formData.kode}
                    onChange={(e) => setFormData({ ...formData, kode: e.target.value.toUpperCase() })}
                  />
                </div>
                
                <div>
                  <Label htmlFor="kategori">Kategori *</Label>
                  <Select
                    value={formData.kategori}
                    onValueChange={(v: string) => setFormData({ ...formData, kategori: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih kategori" />
                    </SelectTrigger>
                    <SelectContent>
                      {KATEGORI_OPTIONS.map(k => (
                        <SelectItem key={k} value={k}>{k}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="col-span-2">
                  <Label htmlFor="deskripsi">Deskripsi</Label>
                  <Textarea
                    id="deskripsi"
                    placeholder="Deskripsi singkat tentang template ini"
                    value={formData.deskripsi}
                    onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
                    rows={2}
                  />
                </div>
                
                <div className="col-span-2">
                  <Label htmlFor="format_nomor">Format Nomor Surat</Label>
                  <Input
                    id="format_nomor"
                    placeholder="{nomor}/{kode}/{bulan_romawi}/{tahun}"
                    value={formData.format_nomor}
                    onChange={(e) => setFormData({ ...formData, format_nomor: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Variabel: {'{nomor}'}, {'{kode}'}, {'{bulan}'}, {'{bulan_romawi}'}, {'{tahun}'}
                  </p>
                </div>
                
                <div className="col-span-2">
                  <Label htmlFor="file">File Template (.docx) *</Label>
                  <div className="mt-2">
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        {formData.file ? (
                          <>
                            <FileCheck className="w-8 h-8 mb-2 text-green-500" />
                            <p className="text-sm font-medium">{formData.file.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {(formData.file.size / 1024).toFixed(1)} KB
                            </p>
                          </>
                        ) : (
                          <>
                            <FileUp className="w-8 h-8 mb-2 text-muted-foreground" />
                            <p className="text-sm text-muted-foreground">
                              Klik untuk upload file .docx
                            </p>
                          </>
                        )}
                      </div>
                      <input
                        id="file"
                        type="file"
                        className="hidden"
                        accept=".docx"
                        onChange={handleFileChange}
                      />
                    </label>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="requirements" className="space-y-6 mt-4">
              {/* Dokumen Upload yang Diperlukan */}
              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                  <Upload className="h-4 w-4 text-blue-500" />
                  <Label className="text-sm font-semibold">Dokumen Upload yang Diperlukan</Label>
                </div>
                <p className="text-xs text-muted-foreground mb-3">
                  Dokumen yang harus diupload pengguna saat mengajukan surat via WhatsApp
                </p>
                
                <div className="grid grid-cols-4 gap-2 mb-3">
                  <Input
                    placeholder="Key (contoh: ktp)"
                    value={newDocument.key}
                    onChange={(e) => setNewDocument({ ...newDocument, key: e.target.value.toLowerCase().replace(/\s/g, '_') })}
                  />
                  <Input
                    placeholder="Label (contoh: KTP)"
                    value={newDocument.label}
                    onChange={(e) => setNewDocument({ ...newDocument, label: e.target.value })}
                  />
                  <Select
                    value={newDocument.type}
                    onValueChange={(v: string) => setNewDocument({ ...newDocument, type: v as RequiredDocument['type'] })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Tipe" />
                    </SelectTrigger>
                    <SelectContent>
                      {DOCUMENT_TYPES.map(t => (
                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={newDocument.required}
                      onCheckedChange={(v: boolean) => setNewDocument({ ...newDocument, required: v })}
                    />
                    <span className="text-xs">Wajib</span>
                    <Button type="button" size="sm" onClick={addRequiredDocument}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                {formData.required_documents.length > 0 ? (
                  <div className="space-y-2">
                    {formData.required_documents.map((doc, i) => (
                      <div key={i} className="flex items-center justify-between text-sm bg-blue-50 p-2 rounded border border-blue-200">
                        <div className="flex items-center gap-3">
                          <Badge variant="outline" className="text-xs">{doc.key}</Badge>
                          <span className="font-medium">{doc.label}</span>
                          <Badge variant="secondary" className="text-xs">
                            {DOCUMENT_TYPES.find(t => t.value === doc.type)?.label || doc.type}
                          </Badge>
                          {doc.required && <Badge className="text-xs bg-red-500">Wajib</Badge>}
                        </div>
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeRequiredDocument(i)}>
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Belum ada dokumen yang diperlukan</p>
                )}
              </div>

              {/* Variable Tambahan */}
              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                  <List className="h-4 w-4 text-purple-500" />
                  <Label className="text-sm font-semibold">Variable Tambahan</Label>
                </div>
                <p className="text-xs text-muted-foreground mb-3">
                  Data tambahan yang diminta dari pengguna tetapi TIDAK dimasukkan ke dalam surat
                </p>
                
                <div className="space-y-3 mb-3 p-3 bg-muted/50 rounded-lg">
                  <div className="grid grid-cols-4 gap-2">
                    <Input
                      placeholder="Key (contoh: alamat_tujuan)"
                      value={newVariable.key}
                      onChange={(e) => setNewVariable({ ...newVariable, key: e.target.value.toLowerCase().replace(/\s/g, '_') })}
                    />
                    <Input
                      placeholder="Label (contoh: Alamat Tujuan)"
                      value={newVariable.label}
                      onChange={(e) => setNewVariable({ ...newVariable, label: e.target.value })}
                    />
                    <Select
                      value={newVariable.type}
                      onValueChange={(v: string) => setNewVariable({ ...newVariable, type: v as AdditionalVariable['type'] })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Tipe" />
                      </SelectTrigger>
                      <SelectContent>
                        {VARIABLE_TYPES.map(t => (
                          <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={newVariable.required}
                        onCheckedChange={(v: boolean) => setNewVariable({ ...newVariable, required: v })}
                      />
                      <span className="text-xs">Wajib</span>
                    </div>
                  </div>
                  
                  {newVariable.type === 'select' && (
                    <div className="pl-2 border-l-2 border-purple-300">
                      <Label className="text-xs text-muted-foreground mb-2 block">Opsi Pilihan:</Label>
                      <div className="flex gap-2 mb-2">
                        <Input
                          placeholder="Tambah opsi..."
                          value={newVariableOption}
                          onChange={(e) => setNewVariableOption(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addVariableOption())}
                          className="text-sm"
                        />
                        <Button type="button" size="sm" variant="outline" onClick={addVariableOption}>
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                      {(newVariable.options || []).length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {newVariable.options?.map((opt, i) => (
                            <Badge key={i} variant="secondary" className="text-xs flex items-center gap-1">
                              {opt}
                              <X className="h-2 w-2 cursor-pointer" onClick={() => removeVariableOption(i)} />
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                  
                  <Button type="button" size="sm" onClick={addAdditionalVariable} className="w-full">
                    <Plus className="h-4 w-4 mr-2" /> Tambah Variable
                  </Button>
                </div>
                
                {formData.additional_variables.length > 0 ? (
                  <div className="space-y-2">
                    {formData.additional_variables.map((v, i) => (
                      <div key={i} className="flex items-center justify-between text-sm bg-purple-50 p-2 rounded border border-purple-200">
                        <div className="flex items-center gap-3 flex-wrap">
                          <Badge variant="outline" className="text-xs font-mono">{v.key}</Badge>
                          <span className="font-medium">{v.label}</span>
                          <Badge variant="secondary" className="text-xs">
                            {VARIABLE_TYPES.find(t => t.value === v.type)?.label || v.type}
                          </Badge>
                          {v.required && <Badge className="text-xs bg-red-500">Wajib</Badge>}
                          {v.type === 'select' && v.options && v.options.length > 0 && (
                            <span className="text-xs text-muted-foreground">
                              Opsi: {v.options.join(', ')}
                            </span>
                          )}
                        </div>
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeAdditionalVariable(i)}>
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Belum ada variable tambahan</p>
                )}
              </div>

              {/* Keperluan Surat */}
              <div className="p-4 border rounded-lg bg-purple-50/50">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-purple-600" />
                    <Label className="text-sm font-semibold">Keperluan Surat</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Label htmlFor="requires_keperluan_edit" className="text-xs">Aktifkan</Label>
                    <Switch
                      id="requires_keperluan_edit"
                      checked={formData.requires_keperluan}
                      onCheckedChange={(checked: boolean) => setFormData({ ...formData, requires_keperluan: checked })}
                    />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Jika diaktifkan, pengguna akan diminta mengisi keperluan surat saat pengajuan via WhatsApp (contoh: mengurus KIS, beasiswa, keperluan bank, dll)
                </p>
              </div>

              {/* Persyaratan Teks (Legacy) */}
              <div className="p-4 border rounded-lg border-dashed opacity-70">
                <div className="flex items-center gap-2 mb-3">
                  <FileText className="h-4 w-4 text-gray-500" />
                  <Label className="text-sm font-semibold">Persyaratan Teks (Info Tambahan)</Label>
                </div>
                <p className="text-xs text-muted-foreground mb-3">
                  Informasi persyaratan dalam bentuk teks yang ditampilkan kepada pengguna
                </p>
                
                <div className="flex gap-2 mb-3">
                  <Input
                    placeholder="Tambah persyaratan teks..."
                    value={newPersyaratan}
                    onChange={(e) => setNewPersyaratan(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addPersyaratan())}
                  />
                  <Button type="button" onClick={addPersyaratan}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                
                {formData.persyaratan.length > 0 && (
                  <ul className="space-y-2">
                    {formData.persyaratan.map((p, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm bg-muted p-2 rounded">
                        <span className="flex-1">{i + 1}. {p}</span>
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removePersyaratan(i)}>
                          <X className="h-3 w-3" />
                        </Button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="settings" className="space-y-4 mt-4">
              <div className="p-4 bg-amber-50 rounded-lg border border-amber-200 mb-4">
                <div className="flex items-start gap-2">
                  <Users className="h-5 w-5 text-amber-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-amber-800">Integrasi Data Kependudukan</p>
                    <p className="text-sm text-amber-700">
                      Pengaturan ini menentukan apakah surat akan mempengaruhi data warga saat disetujui.
                    </p>
                  </div>
                </div>
              </div>
              
              <div>
                <Label>Efek Populasi</Label>
                <Select
                  value={formData.population_effect}
                  onValueChange={(v: string) => setFormData({ ...formData, population_effect: v })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {POPULATION_EFFECTS.map(e => (
                      <SelectItem key={e.value} value={e.value}>{e.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {formData.population_effect !== 'none' && (
                <div>
                  <Label>Aksi Populasi</Label>
                  <Select
                    value={formData.population_action}
                    onValueChange={(v: string) => setFormData({ ...formData, population_action: v })}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {POPULATION_ACTIONS.map(a => (
                        <SelectItem key={a.value} value={a.value}>{a.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formData.population_action === 'set_meninggal' && 'Surat kematian akan mengubah status warga menjadi meninggal'}
                    {formData.population_action === 'set_pindah' && 'Surat pindah akan mengubah status warga menjadi pindah'}
                    {formData.population_action === 'create_warga' && 'Surat kelahiran akan menambahkan warga baru ke database'}
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
          
          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
              Batal
            </Button>
            <Button onClick={handleCreate} disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Upload className="h-4 w-4 mr-2" />}
              Upload Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* EDIT Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5" />
              Edit Template: {selectedTemplate?.nama}
            </DialogTitle>
            <DialogDescription>
              Update informasi template atau ganti file DOCX
            </DialogDescription>
          </DialogHeader>
          
          <Tabs defaultValue="basic" className="mt-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic">Informasi Dasar</TabsTrigger>
              <TabsTrigger value="requirements">Persyaratan</TabsTrigger>
              <TabsTrigger value="settings">Pengaturan</TabsTrigger>
            </TabsList>
            
            <TabsContent value="basic" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label htmlFor="edit-nama">Nama Template</Label>
                  <Input
                    id="edit-nama"
                    value={formData.nama}
                    onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                  />
                </div>
                
                <div>
                  <Label htmlFor="edit-kode">Kode Surat</Label>
                  <Input
                    id="edit-kode"
                    value={formData.kode}
                    onChange={(e) => setFormData({ ...formData, kode: e.target.value.toUpperCase() })}
                  />
                </div>
                
                <div>
                  <Label htmlFor="edit-kategori">Kategori</Label>
                  <Select
                    value={formData.kategori}
                    onValueChange={(v: string) => setFormData({ ...formData, kategori: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {KATEGORI_OPTIONS.map(k => (
                        <SelectItem key={k} value={k}>{k}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="col-span-2">
                  <Label htmlFor="edit-deskripsi">Deskripsi</Label>
                  <Textarea
                    id="edit-deskripsi"
                    value={formData.deskripsi}
                    onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
                    rows={2}
                  />
                </div>
                
                <div className="col-span-2">
                  <Label htmlFor="edit-format">Format Nomor Surat</Label>
                  <Input
                    id="edit-format"
                    value={formData.format_nomor}
                    onChange={(e) => setFormData({ ...formData, format_nomor: e.target.value })}
                  />
                </div>
                
                <div className="col-span-2">
                  <Label>Ganti File Template (Opsional)</Label>
                  <div className="mt-2">
                    <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50">
                      <div className="flex flex-col items-center justify-center py-4">
                        {formData.file ? (
                          <>
                            <FileCheck className="w-6 h-6 mb-1 text-green-500" />
                            <p className="text-sm font-medium">{formData.file.name}</p>
                          </>
                        ) : (
                          <>
                            <FileUp className="w-6 h-6 mb-1 text-muted-foreground" />
                            <p className="text-xs text-muted-foreground">
                              Upload file baru untuk mengganti template
                            </p>
                          </>
                        )}
                      </div>
                      <input
                        type="file"
                        className="hidden"
                        accept=".docx"
                        onChange={handleFileChange}
                      />
                    </label>
                  </div>
                  {selectedTemplate?.file_name && !formData.file && (
                    <p className="text-xs text-muted-foreground mt-1">
                      File saat ini: {selectedTemplate.file_name}
                    </p>
                  )}
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="requirements" className="space-y-6 mt-4">
              {/* Dokumen Upload yang Diperlukan */}
              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                  <Upload className="h-4 w-4 text-blue-500" />
                  <Label className="text-sm font-semibold">Dokumen Upload yang Diperlukan</Label>
                </div>
                <p className="text-xs text-muted-foreground mb-3">
                  Dokumen yang harus diupload pengguna saat mengajukan surat via WhatsApp
                </p>
                
                <div className="grid grid-cols-4 gap-2 mb-3">
                  <Input
                    placeholder="Key (contoh: ktp)"
                    value={newDocument.key}
                    onChange={(e) => setNewDocument({ ...newDocument, key: e.target.value.toLowerCase().replace(/\s/g, '_') })}
                  />
                  <Input
                    placeholder="Label (contoh: KTP)"
                    value={newDocument.label}
                    onChange={(e) => setNewDocument({ ...newDocument, label: e.target.value })}
                  />
                  <Select
                    value={newDocument.type}
                    onValueChange={(v: string) => setNewDocument({ ...newDocument, type: v as RequiredDocument['type'] })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Tipe" />
                    </SelectTrigger>
                    <SelectContent>
                      {DOCUMENT_TYPES.map(t => (
                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={newDocument.required}
                      onCheckedChange={(v: boolean) => setNewDocument({ ...newDocument, required: v })}
                    />
                    <span className="text-xs">Wajib</span>
                    <Button type="button" size="sm" onClick={addRequiredDocument}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                {formData.required_documents.length > 0 ? (
                  <div className="space-y-2">
                    {formData.required_documents.map((doc, i) => (
                      <div key={i} className="flex items-center justify-between text-sm bg-blue-50 p-2 rounded border border-blue-200">
                        <div className="flex items-center gap-3">
                          <Badge variant="outline" className="text-xs">{doc.key}</Badge>
                          <span className="font-medium">{doc.label}</span>
                          <Badge variant="secondary" className="text-xs">
                            {DOCUMENT_TYPES.find(t => t.value === doc.type)?.label || doc.type}
                          </Badge>
                          {doc.required && <Badge className="text-xs bg-red-500">Wajib</Badge>}
                        </div>
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeRequiredDocument(i)}>
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Belum ada dokumen yang diperlukan</p>
                )}
              </div>

              {/* Variable Tambahan */}
              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                  <List className="h-4 w-4 text-purple-500" />
                  <Label className="text-sm font-semibold">Variable Tambahan</Label>
                </div>
                <p className="text-xs text-muted-foreground mb-3">
                  Data tambahan yang diminta dari pengguna tetapi TIDAK dimasukkan ke dalam surat (hanya untuk keperluan verifikasi/administrasi)
                </p>
                
                <div className="space-y-3 mb-3 p-3 bg-muted/50 rounded-lg">
                  <div className="grid grid-cols-4 gap-2">
                    <Input
                      placeholder="Key (contoh: alamat_tujuan)"
                      value={newVariable.key}
                      onChange={(e) => setNewVariable({ ...newVariable, key: e.target.value.toLowerCase().replace(/\s/g, '_') })}
                    />
                    <Input
                      placeholder="Label (contoh: Alamat Tujuan)"
                      value={newVariable.label}
                      onChange={(e) => setNewVariable({ ...newVariable, label: e.target.value })}
                    />
                    <Select
                      value={newVariable.type}
                      onValueChange={(v: string) => setNewVariable({ ...newVariable, type: v as AdditionalVariable['type'] })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Tipe" />
                      </SelectTrigger>
                      <SelectContent>
                        {VARIABLE_TYPES.map(t => (
                          <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={newVariable.required}
                        onCheckedChange={(v: boolean) => setNewVariable({ ...newVariable, required: v })}
                      />
                      <span className="text-xs">Wajib</span>
                    </div>
                  </div>
                  
                  {newVariable.type === 'select' && (
                    <div className="pl-2 border-l-2 border-purple-300">
                      <Label className="text-xs text-muted-foreground mb-2 block">Opsi Pilihan:</Label>
                      <div className="flex gap-2 mb-2">
                        <Input
                          placeholder="Tambah opsi..."
                          value={newVariableOption}
                          onChange={(e) => setNewVariableOption(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addVariableOption())}
                          className="text-sm"
                        />
                        <Button type="button" size="sm" variant="outline" onClick={addVariableOption}>
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                      {(newVariable.options || []).length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {newVariable.options?.map((opt, i) => (
                            <Badge key={i} variant="secondary" className="text-xs flex items-center gap-1">
                              {opt}
                              <X className="h-2 w-2 cursor-pointer" onClick={() => removeVariableOption(i)} />
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                  
                  <Button type="button" size="sm" onClick={addAdditionalVariable} className="w-full">
                    <Plus className="h-4 w-4 mr-2" /> Tambah Variable
                  </Button>
                </div>
                
                {formData.additional_variables.length > 0 ? (
                  <div className="space-y-2">
                    {formData.additional_variables.map((v, i) => (
                      <div key={i} className="flex items-center justify-between text-sm bg-purple-50 p-2 rounded border border-purple-200">
                        <div className="flex items-center gap-3 flex-wrap">
                          <Badge variant="outline" className="text-xs font-mono">{v.key}</Badge>
                          <span className="font-medium">{v.label}</span>
                          <Badge variant="secondary" className="text-xs">
                            {VARIABLE_TYPES.find(t => t.value === v.type)?.label || v.type}
                          </Badge>
                          {v.required && <Badge className="text-xs bg-red-500">Wajib</Badge>}
                          {v.type === 'select' && v.options && v.options.length > 0 && (
                            <span className="text-xs text-muted-foreground">
                              Opsi: {v.options.join(', ')}
                            </span>
                          )}
                        </div>
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeAdditionalVariable(i)}>
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Belum ada variable tambahan</p>
                )}
              </div>

              {/* Keperluan Surat */}
              <div className="p-4 border rounded-lg bg-purple-50/50">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-purple-600" />
                    <Label className="text-sm font-semibold">Keperluan Surat</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Label htmlFor="requires_keperluan_create" className="text-xs">Aktifkan</Label>
                    <Switch
                      id="requires_keperluan_create"
                      checked={formData.requires_keperluan}
                      onCheckedChange={(checked: boolean) => setFormData({ ...formData, requires_keperluan: checked })}
                    />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Jika diaktifkan, pengguna akan diminta mengisi keperluan surat saat pengajuan via WhatsApp (contoh: mengurus KIS, beasiswa, keperluan bank, dll)
                </p>
              </div>

              {/* Persyaratan Teks (Legacy) */}
              <div className="p-4 border rounded-lg border-dashed opacity-70">
                <div className="flex items-center gap-2 mb-3">
                  <FileText className="h-4 w-4 text-gray-500" />
                  <Label className="text-sm font-semibold">Persyaratan Teks (Info Tambahan)</Label>
                </div>
                <p className="text-xs text-muted-foreground mb-3">
                  Informasi persyaratan dalam bentuk teks yang ditampilkan kepada pengguna
                </p>
                
                <div className="flex gap-2 mb-3">
                  <Input
                    placeholder="Tambah persyaratan teks..."
                    value={newPersyaratan}
                    onChange={(e) => setNewPersyaratan(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addPersyaratan())}
                  />
                  <Button type="button" onClick={addPersyaratan}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                
                {formData.persyaratan.length > 0 ? (
                  <ul className="space-y-2">
                    {formData.persyaratan.map((p, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm bg-muted p-2 rounded">
                        <span className="flex-1">{i + 1}. {p}</span>
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removePersyaratan(i)}>
                          <X className="h-3 w-3" />
                        </Button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">Belum ada persyaratan teks</p>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="settings" className="space-y-4 mt-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <Label>Status Template</Label>
                  <p className="text-sm text-muted-foreground">
                    {formData.is_active ? 'Template aktif dan dapat digunakan' : 'Template nonaktif'}
                  </p>
                </div>
                <Switch
                  checked={formData.is_active}
                  onCheckedChange={(v: boolean) => setFormData({ ...formData, is_active: v })}
                />
              </div>
              
              <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                <div className="flex items-start gap-2">
                  <Users className="h-5 w-5 text-amber-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-amber-800">Integrasi Data Kependudukan</p>
                    <p className="text-sm text-amber-700">
                      Pengaturan efek populasi saat surat disetujui
                    </p>
                  </div>
                </div>
              </div>
              
              <div>
                <Label>Efek Populasi</Label>
                <Select
                  value={formData.population_effect}
                  onValueChange={(v: string) => setFormData({ ...formData, population_effect: v })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {POPULATION_EFFECTS.map(e => (
                      <SelectItem key={e.value} value={e.value}>{e.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {formData.population_effect !== 'none' && (
                <div>
                  <Label>Aksi Populasi</Label>
                  <Select
                    value={formData.population_action}
                    onValueChange={(v: string) => setFormData({ ...formData, population_action: v })}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {POPULATION_ACTIONS.map(a => (
                        <SelectItem key={a.value} value={a.value}>{a.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </TabsContent>
          </Tabs>
          
          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Batal
            </Button>
            <Button onClick={handleUpdate} disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <CheckCircle className="h-4 w-4 mr-2" />}
              Simpan Perubahan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* PREVIEW Dialog */}
      <Dialog open={previewDialogOpen} onOpenChange={setPreviewDialogOpen}>
        <DialogContent 
          className="overflow-hidden flex flex-col"
          style={{ maxWidth: '95vw', width: '95vw', height: '95vh' }}
        >
          <DialogHeader className="shrink-0">
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Preview: {selectedTemplate?.nama}
            </DialogTitle>
            <DialogDescription className="sr-only">
              Preview template surat {selectedTemplate?.nama}
            </DialogDescription>
          </DialogHeader>
          
          {previewLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-3">Memuat preview...</span>
            </div>
          ) : previewData ? (
            <Tabs defaultValue="preview" className="flex-1 flex flex-col overflow-hidden">
              <TabsList className="shrink-0 grid w-full grid-cols-3">
                <TabsTrigger value="preview">Live Preview</TabsTrigger>
                <TabsTrigger value="info">Informasi Template</TabsTrigger>
                <TabsTrigger value="variables">Variabel ({previewData.variables?.length || 0})</TabsTrigger>
              </TabsList>
              
              {/* Live Preview Tab */}
              <TabsContent value="preview" className="flex-1 overflow-hidden mt-4">
                <div className="h-full flex flex-col">
                  {/* Toolbar */}
                  <div className="shrink-0 flex items-center justify-between bg-muted px-4 py-2 rounded-t-lg border border-b-0">
                    <div className="flex items-center gap-4">
                      <span className="text-sm font-medium flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        {previewData.template?.file_name || 'document.docx'}
                      </span>
                      {/* Viewer Toggle */}
                      <div className="flex items-center gap-1 bg-background rounded-md p-1">
                        <Button
                          size="sm"
                          variant={previewMode === 'office' ? 'default' : 'ghost'}
                          className="h-7 text-xs"
                          onClick={() => setPreviewMode('office')}
                        >
                          Microsoft
                        </Button>
                        <Button
                          size="sm"
                          variant={previewMode === 'google' ? 'default' : 'ghost'}
                          className="h-7 text-xs"
                          onClick={() => setPreviewMode('google')}
                        >
                          Google
                        </Button>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => previewData.template && handleTestGenerate(previewData.template)}
                      >
                        <Printer className="h-3 w-3 mr-1" />
                        Test Generate
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => previewData.template && handleDownload(previewData.template)}
                      >
                        <Download className="h-3 w-3 mr-1" />
                        Download
                      </Button>
                    </div>
                  </div>
                  
                  {/* Document Preview using Office/Google Viewer */}
                  <div className="flex-1 border rounded-b-lg bg-gray-100 overflow-hidden" style={{ minHeight: '700px' }}>
                    {(previewMode === 'office' && previewData.office_viewer_url) || 
                     (previewMode === 'google' && previewData.google_viewer_url) ? (
                      <iframe
                        src={previewMode === 'office' ? previewData.office_viewer_url : previewData.google_viewer_url}
                        className="w-full h-full border-0"
                        style={{ minHeight: '700px' }}
                        title="Document Preview"
                        sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-popups-to-escape-sandbox"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <div className="text-center p-8">
                          <FileText className="h-16 w-16 text-blue-500 mx-auto mb-4" />
                          <p className="font-medium">Preview tidak tersedia</p>
                          <p className="text-sm text-muted-foreground mt-1 mb-4">
                            File harus dapat diakses secara publik untuk preview online
                          </p>
                          <Button onClick={() => previewData.template && handleDownload(previewData.template)}>
                            <Download className="h-4 w-4 mr-2" />
                            Download DOCX
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <p className="text-xs text-muted-foreground mt-2 text-center">
                    {previewMode === 'office' 
                      ? '📄 Menggunakan Microsoft Office Online Viewer' 
                      : '📄 Menggunakan Google Docs Viewer'}
                    {' • '}
                    <span className="text-amber-600">File harus dapat diakses dari internet untuk preview</span>
                  </p>
                </div>
              </TabsContent>
              
              {/* Info Tab */}
              <TabsContent value="info" className="flex-1 overflow-auto mt-4 space-y-6">
                {/* Template Info */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <Label className="text-muted-foreground text-xs">Kode</Label>
                    <code className="block mt-1 px-2 py-1 bg-muted rounded text-sm font-mono">
                      {previewData.template?.kode}
                    </code>
                  </div>
                  <div>
                    <Label className="text-muted-foreground text-xs">Kategori</Label>
                    <p className="mt-1 font-medium">{previewData.template?.kategori}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground text-xs">Format Nomor</Label>
                    <code className="block mt-1 text-xs">{previewData.template?.format_nomor}</code>
                  </div>
                  <div>
                    <Label className="text-muted-foreground text-xs">Digunakan</Label>
                    <p className="mt-1 font-medium">{previewData.template?.counter}x</p>
                  </div>
                </div>

                {/* Description */}
                {previewData.template?.deskripsi && (
                  <div>
                    <Label className="text-muted-foreground text-xs">Deskripsi</Label>
                    <p className="mt-1 text-sm">{previewData.template.deskripsi}</p>
                  </div>
                )}

                {/* Persyaratan */}
                {previewData.template?.persyaratan && previewData.template.persyaratan.length > 0 && (
                  <div>
                    <Label className="text-muted-foreground text-xs">Persyaratan</Label>
                    <ul className="mt-2 space-y-1">
                      {previewData.template.persyaratan.map((p, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                          {p}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {/* Population Effect */}
                {previewData.template?.population_effect && previewData.template.population_effect !== 'none' && (
                  <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                    <div className="flex items-start gap-2">
                      <Users className="h-5 w-5 text-amber-600 mt-0.5" />
                      <div>
                        <p className="font-medium text-amber-800">Efek Kependudukan</p>
                        <p className="text-sm text-amber-700">
                          {previewData.template.population_effect === 'increase' ? 'Penambahan' : 'Pengurangan'} penduduk - 
                          {previewData.template.population_action === 'set_meninggal' && ' Status warga menjadi meninggal'}
                          {previewData.template.population_action === 'set_pindah' && ' Status warga menjadi pindah'}
                          {previewData.template.population_action === 'create_warga' && ' Warga baru ditambahkan'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </TabsContent>
              
              {/* Variables Tab */}
              <TabsContent value="variables" className="flex-1 overflow-auto mt-4">
                {previewData.variables && previewData.variables.length > 0 ? (
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Variabel placeholder yang terdeteksi dalam template. Variabel ini akan otomatis diganti dengan data warga saat surat di-generate.
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                      {previewData.variables.map((v, i) => (
                        <div key={i} className="flex items-center gap-2 p-2 bg-muted rounded-lg">
                          <code className="text-xs font-mono flex-1">${'{' + v + '}'}</code>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => {
                              navigator.clipboard.writeText('${' + v + '}');
                              showToast('Copied', 'Variable berhasil disalin');
                            }}
                            title="Copy"
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>Tidak ada variabel terdeteksi dalam template ini</p>
                    <p className="text-xs mt-1">Gunakan format ${'{NAMA_VARIABEL}'} dalam file DOCX</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              Tidak ada data preview
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* DELETE Alert Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Hapus Template?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus template <strong>{selectedTemplate?.nama}</strong>?
              Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Trash2 className="h-4 w-4 mr-2" />}
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* TEST GENERATE Dialog */}
      <Dialog open={generateDialogOpen} onOpenChange={setGenerateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Printer className="h-5 w-5" />
              Test Generate: {selectedTemplate?.nama}
            </DialogTitle>
            <DialogDescription>
              Generate surat dengan data warga acak untuk testing
            </DialogDescription>
          </DialogHeader>
          
          {generateLoading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-4">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
              <p className="text-muted-foreground">Sedang generate surat...</p>
            </div>
          ) : generateResult ? (
            <div className="space-y-6">
              {/* Success */}
              <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg border border-green-200">
                <CheckCircle className="h-8 w-8 text-green-600" />
                <div>
                  <p className="font-semibold text-green-800">Surat Berhasil Di-generate!</p>
                  <p className="text-sm text-green-600">Nomor: {generateResult.nomor_surat}</p>
                </div>
              </div>

              {/* Warga Info */}
              <div className="border rounded-lg p-4">
                <Label className="text-muted-foreground mb-2 block">Data Warga (Acak)</Label>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Nama:</span>
                    <span className="ml-2 font-medium">{generateResult.warga.nama}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">NIK:</span>
                    <span className="ml-2 font-mono">{generateResult.warga.nik}</span>
                  </div>
                </div>
              </div>

              {/* Download */}
              <div className="space-y-3">
                <Label className="text-muted-foreground">Download Hasil:</Label>
                <div className="flex flex-wrap gap-3">
                  <Button onClick={() => window.open(generateResult.docx_url, '_blank')}>
                    <ArrowDownToLine className="h-4 w-4 mr-2" />
                    Download DOCX
                  </Button>
                  {generateResult.has_pdf && generateResult.pdf_url && (
                    <Button variant="outline" onClick={() => window.open(generateResult.pdf_url!, '_blank')}>
                      <FileText className="h-4 w-4 mr-2" />
                      Download PDF
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Printer className="h-12 w-12 mx-auto mb-4 opacity-30" />
              <p>Surat akan di-generate dengan data warga acak</p>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setGenerateDialogOpen(false)}>
              Tutup
            </Button>
            {!generateLoading && selectedTemplate && (
              <Button onClick={() => handleTestGenerate(selectedTemplate)}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Generate Ulang
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* OnlyOffice Document Editor */}
      {selectedTemplate && (
        <OnlyOfficeEditor
          templateId={selectedTemplate.id}
          templateName={selectedTemplate.nama}
          isOpen={onlyOfficeEditorOpen}
          onClose={() => {
            setOnlyOfficeEditorOpen(false);
            setSelectedTemplate(null);
          }}
          onSaved={handleOnlyOfficeSaved}
        />
      )}
    </div>
  );
}
