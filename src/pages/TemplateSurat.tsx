import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
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
  DialogTrigger,
} from '@/components/ui/dialog';
import { Upload, FileText, Download, Trash2, Eye, Plus, ExternalLink, Printer, Loader2, CheckCircle, List, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { suratTemplateService } from '@/services/suratTemplateService';

// Toast helper
const showToast = (title: string, description: string, variant?: 'default' | 'destructive') => {
  alert(`${title}: ${description}`);
};

interface SuratTemplate {
  id: number;
  nama: string;
  kategori: string;
  kode: string;
  format_nomor: string;
  file_path: string;
  created_at: string;
}

const KATEGORI_OPTIONS = [
  'Kependudukan',
  'Administrasi',
  'Usaha',
  'Keterangan',
  'Rekomendasi',
  'Lainnya'
];

interface GenerateResult {
  warga: { id: number; nama: string; nik: string };
  nomor_surat: string;
  file_name: string;
  docx_url: string;
  pdf_url: string | null;
  has_pdf: boolean;
}

export default function TemplateSurat() {
  const [templates, setTemplates] = useState<SuratTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [previewData, setPreviewData] = useState<{
    template: SuratTemplate | null;
    file_url: string;
    variables: string[];
  } | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  
  // Test generate state
  const [generateDialogOpen, setGenerateDialogOpen] = useState(false);
  const [generateLoading, setGenerateLoading] = useState(false);
  const [generateResult, setGenerateResult] = useState<GenerateResult | null>(null);
  const [selectedTemplateForGenerate, setSelectedTemplateForGenerate] = useState<SuratTemplate | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    nama: '',
    kategori: '',
    kode: '',
    format_nomor: '{nomor}/{kode}/{bulan}/{tahun}',
    file: null as File | null
  });

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const data = await suratTemplateService.getAll();
      // Ensure data is always an array
      setTemplates(Array.isArray(data) ? data : []);
    } catch (error: any) {
      console.error('Error loading templates:', error);
      setTemplates([]); // Set empty array on error
      showToast('Error', error.message || 'Gagal memuat template surat', 'destructive');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        setFormData({ ...formData, file });
      } else {
        showToast('Error', 'Hanya file .docx yang diperbolehkan', 'destructive');
      }
    }
  };

  const handleUpload = async () => {
    if (!formData.file || !formData.nama || !formData.kategori || !formData.kode) {
      showToast('Error', 'Semua field harus diisi', 'destructive');
      return;
    }

    try {
      setLoading(true);
      const uploadFormData = new FormData();
      uploadFormData.append('file', formData.file);
      uploadFormData.append('nama', formData.nama);
      uploadFormData.append('kategori', formData.kategori);
      uploadFormData.append('kode', formData.kode);
      uploadFormData.append('format_nomor', formData.format_nomor);
      
      await suratTemplateService.upload(uploadFormData);

      showToast('Berhasil', 'Template surat berhasil diupload');

      setUploadDialogOpen(false);
      setFormData({
        nama: '',
        kategori: '',
        kode: '',
        format_nomor: '{nomor}/{kode}/{bulan}/{tahun}',
        file: null
      });
      loadTemplates();
    } catch (error: any) {
      showToast('Error', error.message || 'Gagal mengupload template', 'destructive');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number, nama: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus template "${nama}"?`)) {
      return;
    }

    try {
      setLoading(true);
      await suratTemplateService.delete(id);
      showToast('Berhasil', 'Template berhasil dihapus');
      loadTemplates();
    } catch (error: any) {
      showToast('Error', error.message || 'Gagal menghapus template', 'destructive');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (id: number, nama: string) => {
    try {
      const blob = await suratTemplateService.download(id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${nama}.docx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error: any) {
      showToast('Error', error.message || 'Gagal mengunduh template', 'destructive');
    }
  };

  const handlePreview = async (id: number) => {
    try {
      setPreviewLoading(true);
      setPreviewDialogOpen(true);
      const data = await suratTemplateService.preview(id);
      setPreviewData(data);
    } catch (error: any) {
      showToast('Error', error.message || 'Gagal memuat preview', 'destructive');
      setPreviewDialogOpen(false);
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleTestGenerate = async (template: SuratTemplate) => {
    setSelectedTemplateForGenerate(template);
    setGenerateResult(null);
    setGenerateDialogOpen(true);
    
    try {
      setGenerateLoading(true);
      const result = await suratTemplateService.testGenerate(template.id);
      setGenerateResult(result);
      showToast('Berhasil', `Surat berhasil di-generate untuk ${result.warga.nama}`);
    } catch (error: any) {
      showToast('Error', error.message || 'Gagal generate surat', 'destructive');
    } finally {
      setGenerateLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Template Surat</h1>
          <p className="text-muted-foreground">
            Kelola template surat untuk pelayanan WhatsApp
          </p>
        </div>
        <div className="flex gap-2">
          <Link to="/pelayanan/variabel-template">
            <Button variant="outline">
              <List className="mr-2 h-4 w-4" />
              Daftar Variabel
            </Button>
          </Link>

          <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Upload Template
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Upload Template Surat</DialogTitle>
                <DialogDescription>
                  Upload file .docx dengan variabel yang sudah ditentukan
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="nama">Nama Template</Label>
                  <Input
                    id="nama"
                    placeholder="Surat Keterangan Domisili"
                    value={formData.nama}
                    onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="kategori">Kategori</Label>
                  <Select
                    value={formData.kategori}
                    onValueChange={(value: string) => setFormData({ ...formData, kategori: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih kategori" />
                    </SelectTrigger>
                    <SelectContent>
                      {KATEGORI_OPTIONS.map((kat) => (
                        <SelectItem key={kat} value={kat}>
                          {kat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="kode">Kode Surat</Label>
                  <Input
                    id="kode"
                    placeholder="SKD"
                    value={formData.kode}
                    onChange={(e) => setFormData({ ...formData, kode: e.target.value.toUpperCase() })}
                  />
                </div>

                <div>
                  <Label htmlFor="format_nomor">Format Nomor</Label>
                  <Input
                    id="format_nomor"
                    placeholder="{nomor}/{kode}/{bulan}/{tahun}"
                    value={formData.format_nomor}
                    onChange={(e) => setFormData({ ...formData, format_nomor: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Gunakan: {'{nomor}'}, {'{kode}'}, {'{bulan}'}, {'{tahun}'}
                  </p>
                </div>

                <div>
                  <Label htmlFor="file">File Template (.docx)</Label>
                  <Input
                    id="file"
                    type="file"
                    accept=".docx"
                    onChange={handleFileChange}
                  />
                  {formData.file && (
                    <p className="text-xs text-muted-foreground mt-1">
                      File: {formData.file.name}
                    </p>
                  )}
                </div>

                <Button onClick={handleUpload} disabled={loading} className="w-full">
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Template
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Template</CardTitle>
          <CardDescription>
            Template yang tersedia untuk pembuatan surat otomatis via WhatsApp
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading && templates.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">Loading...</p>
          ) : templates.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
              <p className="mt-2 text-muted-foreground">Belum ada template surat</p>
              <p className="text-sm text-muted-foreground">Upload template pertama Anda</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">No</TableHead>
                    <TableHead>Nama Template</TableHead>
                    <TableHead>Kategori</TableHead>
                    <TableHead>Kode</TableHead>
                    <TableHead>Format Nomor</TableHead>
                    <TableHead>Tanggal Upload</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(() => {
                    const totalPages = Math.ceil(templates.length / itemsPerPage);
                    const startIndex = (currentPage - 1) * itemsPerPage;
                    const paginatedTemplates = templates.slice(startIndex, startIndex + itemsPerPage);
                    
                    return paginatedTemplates.map((template, index) => (
                    <TableRow key={template.id}>
                      <TableCell className="text-center font-medium">{startIndex + index + 1}</TableCell>
                      <TableCell className="font-medium">{template.nama}</TableCell>
                      <TableCell>{template.kategori}</TableCell>
                      <TableCell>
                        <code className="px-2 py-1 bg-muted rounded text-xs">
                          {template.kode}
                        </code>
                      </TableCell>
                      <TableCell>
                        <code className="text-xs">{template.format_nomor}</code>
                      </TableCell>
                      <TableCell>
                        {new Date(template.created_at).toLocaleDateString('id-ID')}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handlePreview(template.id)}
                            title="Preview Template"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleTestGenerate(template)}
                            title="Test Cetak dengan Data Warga Acak"
                          >
                            <Printer className="h-4 w-4 text-blue-600" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDownload(template.id, template.nama)}
                            title="Download Template"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(template.id, template.nama)}
                            title="Hapus Template"
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ));
                  })()}
                </TableBody>
              </Table>
              
              {/* Pagination */}
              {(() => {
                const totalPages = Math.ceil(templates.length / itemsPerPage);
                const startIndex = (currentPage - 1) * itemsPerPage;
                return (
                  <div className="flex items-center justify-between mt-4 pt-4 border-t">
                    <div className="text-sm text-muted-foreground">
                      Menampilkan {startIndex + 1} - {Math.min(startIndex + itemsPerPage, templates.length)} dari {templates.length} template
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
            </div>
          )}
        </CardContent>
      </Card>

      {/* Test Generate Dialog */}
      <Dialog open={generateDialogOpen} onOpenChange={setGenerateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Printer className="h-5 w-5" />
              Test Generate Surat: {selectedTemplateForGenerate?.nama}
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
              {/* Success indicator */}
              <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg border border-green-200">
                <CheckCircle className="h-8 w-8 text-green-600" />
                <div>
                  <p className="font-semibold text-green-800">Surat Berhasil Di-generate!</p>
                  <p className="text-sm text-green-600">Nomor Surat: {generateResult.nomor_surat}</p>
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

              {/* Download Options */}
              <div className="space-y-3">
                <Label className="text-muted-foreground">Download Hasil:</Label>
                <div className="flex flex-wrap gap-3">
                  <Button
                    onClick={() => window.open(generateResult.docx_url, '_blank')}
                    className="gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Download DOCX
                  </Button>
                  {generateResult.has_pdf && generateResult.pdf_url && (
                    <Button
                      variant="outline"
                      onClick={() => window.open(generateResult.pdf_url!, '_blank')}
                      className="gap-2"
                    >
                      <FileText className="h-4 w-4" />
                      Download PDF
                    </Button>
                  )}
                </div>
                {!generateResult.has_pdf && (
                  <p className="text-xs text-muted-foreground">
                    💡 Untuk konversi PDF otomatis, install LibreOffice di server
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              Klik tombol di bawah untuk generate surat test
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={() => setGenerateDialogOpen(false)}>
              Tutup
            </Button>
            {!generateLoading && selectedTemplateForGenerate && (
              <Button onClick={() => handleTestGenerate(selectedTemplateForGenerate)}>
                <Printer className="h-4 w-4 mr-2" />
                Generate Ulang
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={previewDialogOpen} onOpenChange={setPreviewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Preview Template: {previewData?.template?.nama}
            </DialogTitle>
            <DialogDescription>
              Lihat detail template dan variabel yang digunakan
            </DialogDescription>
          </DialogHeader>
          
          {previewLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <span className="ml-3">Memuat preview...</span>
            </div>
          ) : previewData ? (
            <div className="space-y-6">
              {/* Template Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Nama</Label>
                  <p className="font-medium">{previewData.template?.nama}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Kategori</Label>
                  <p className="font-medium">{previewData.template?.kategori}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Kode</Label>
                  <code className="px-2 py-1 bg-muted rounded text-sm">
                    {previewData.template?.kode}
                  </code>
                </div>
                <div>
                  <Label className="text-muted-foreground">Format Nomor</Label>
                  <code className="text-sm">{previewData.template?.format_nomor}</code>
                </div>
              </div>

              {/* Variables */}
              {previewData.variables && previewData.variables.length > 0 && (
                <div>
                  <Label className="text-muted-foreground mb-2 block">
                    Variabel yang Terdeteksi ({previewData.variables.length})
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    {previewData.variables.map((variable, index) => (
                      <Badge key={index} variant="secondary" className="font-mono text-xs">
                        ${'{' + variable + '}'}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Preview Options */}
              <div className="border-t pt-4">
                <Label className="text-muted-foreground mb-3 block">
                  Opsi Preview:
                </Label>
                <div className="flex flex-wrap gap-3">
                  <Button
                    variant="default"
                    onClick={() => previewData.template && handleDownload(previewData.template.id, previewData.template.nama)}
                    className="gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Download & Buka di MS Word
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => window.open(previewData.file_url, '_blank')}
                    className="gap-2"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Buka di Tab Baru
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  💡 Untuk preview online, gunakan ngrok agar file dapat diakses publik
                </p>
              </div>

              {/* File Info */}
              <div className="border rounded-lg overflow-hidden">
                <div className="bg-muted px-4 py-2 border-b flex items-center justify-between">
                  <span className="text-sm font-medium">Informasi File</span>
                </div>
                <div className="p-4 space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                    <FileText className="h-10 w-10 text-blue-600" />
                    <div>
                      <p className="font-medium">{previewData.template?.nama}.docx</p>
                      <p className="text-sm text-muted-foreground">
                        Microsoft Word Document
                      </p>
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <p><strong>Path:</strong> {previewData.file_url}</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              Tidak ada data preview
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
