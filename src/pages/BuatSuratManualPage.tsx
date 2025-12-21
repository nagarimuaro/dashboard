import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  FileText, 
  User,
  Loader2,
  Search,
  ArrowLeft,
  CheckCircle,
  Eye
} from 'lucide-react';
import suratRequestService from '@/services/suratRequestService';
import apiClient from '@/services/apiClient.js';

// Types
interface Warga {
  id: number;
  nik: string;
  nama: string;
  alamat?: string;
  phone?: string;
  jenis_kelamin?: string;
  tanggal_lahir?: string;
}

interface TemplateVariable {
  name: string;
  label: string;
  source: 'warga' | 'input' | 'system';
  required: boolean;
}

interface SuratTemplate {
  id: number;
  nama: string;
  kode: string;
  deskripsi?: string;
  variables?: TemplateVariable[];
}

interface CreatedRequest {
  id: number;
  tracking_code: string;
  nomor_surat: string;
  status: string;
  warga?: {
    id: number;
    nama: string;
    nik: string;
  };
  surat_template?: {
    id: number;
    nama: string;
    kode: string;
  };
}

export default function BuatSuratManualPage() {
  const navigate = useNavigate();
  
  // State
  const [templates, setTemplates] = useState<SuratTemplate[]>([]);
  const [searchNik, setSearchNik] = useState('');
  const [searchedWarga, setSearchedWarga] = useState<Warga | null>(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<SuratTemplate | null>(null);
  const [inputVariables, setInputVariables] = useState<TemplateVariable[]>([]);
  const [variableValues, setVariableValues] = useState<Record<string, string>>({});
  const [loadingTemplate, setLoadingTemplate] = useState(false);
  const [templateId, setTemplateId] = useState('');
  const [keperluan, setKeperluan] = useState('');
  const [catatan, setCatatan] = useState('');
  const [success, setSuccess] = useState(false);
  const [createdRequest, setCreatedRequest] = useState<CreatedRequest | null>(null);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const response = await apiClient.get('/surat-templates');
      if (response.data?.data) {
        setTemplates(response.data.data);
      } else if (Array.isArray(response.data)) {
        setTemplates(response.data);
      } else if (Array.isArray(response)) {
        setTemplates(response);
      }
    } catch (error) {
      console.error('Error fetching templates:', error);
      toast.error('Gagal memuat daftar template surat');
    }
  };

  const handleTemplateSelect = async (templateIdValue: string) => {
    setTemplateId(templateIdValue);
    setVariableValues({});
    setInputVariables([]);
    setSelectedTemplate(null);
    
    if (!templateIdValue) return;
    
    try {
      setLoadingTemplate(true);
      const response = await apiClient.get(`/surat-templates/${templateIdValue}`);
      console.log('Template detail response:', response);
      
      const templateData = response.data?.template || response.template;
      if (templateData) {
        setSelectedTemplate(templateData);
        
        // Filter variables that need user input (source: 'input')
        // Exclude nomor_surat and tanggal_surat as they are auto-generated
        const vars = templateData.variables || [];
        const inputVars = vars.filter((v: TemplateVariable) => 
          v.source === 'input' && 
          !v.name.includes('nomor_surat') && 
          !v.name.includes('tanggal_surat')
        );
        setInputVariables(inputVars);
        
        // Initialize variable values
        const initialValues: Record<string, string> = {};
        inputVars.forEach((v: TemplateVariable) => {
          initialValues[v.name] = '';
        });
        setVariableValues(initialValues);
      }
    } catch (error) {
      console.error('Error fetching template detail:', error);
      toast.error('Gagal memuat detail template');
    } finally {
      setLoadingTemplate(false);
    }
  };

  const handleSearchWarga = async () => {
    if (!searchNik || searchNik.length < 16) {
      toast.error('NIK harus 16 digit');
      return;
    }
    try {
      setSearchLoading(true);
      const response = await apiClient.get(`/wargas/nik/${searchNik}`);
      console.log('Warga search response:', response);
      if (response.success && response.data) {
        setSearchedWarga(response.data);
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

  const handleSubmit = async () => {
    if (!searchedWarga) {
      toast.error('Cari warga terlebih dahulu');
      return;
    }
    if (!templateId) {
      toast.error('Pilih jenis surat');
      return;
    }
    
    // Validate required input variables
    for (const variable of inputVariables) {
      if (variable.required && !variableValues[variable.name]) {
        toast.error(`${variable.label} harus diisi`);
        return;
      }
    }
    
    try {
      setActionLoading(true);
      // Create manual request - langsung ke Wali Nagari untuk tanda tangan
      const result = await suratRequestService.createManual({
        nik: searchedWarga.nik,
        template_id: parseInt(templateId),
        keperluan: keperluan,
        catatan: catatan,
        custom_data: variableValues
      });
      
      setSuccess(true);
      setCreatedRequest(result.data || result);
      toast.success('Permohonan berhasil dibuat dan diteruskan ke Wali Nagari');
    } catch (error: any) {
      console.error('Error creating request:', error);
      toast.error(error.response?.data?.message || error.message || 'Gagal membuat permohonan');
    } finally {
      setActionLoading(false);
    }
  };

  const resetForm = () => {
    setSearchNik('');
    setSearchedWarga(null);
    setTemplateId('');
    setSelectedTemplate(null);
    setInputVariables([]);
    setVariableValues({});
    setKeperluan('');
    setCatatan('');
    setSuccess(false);
    setCreatedRequest(null);
  };

  // Success state - show tracking code and link to detail
  if (success && createdRequest) {
    return (
      <div className="space-y-6">
        <Card className="max-w-2xl mx-auto">
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-green-600 mb-2">Permohonan Berhasil Dibuat</h2>
              <p className="text-muted-foreground mb-4">
                Permohonan surat untuk <strong>{createdRequest.warga?.nama || searchedWarga?.nama}</strong> telah diteruskan ke Wali Nagari untuk ditandatangani.
              </p>
              
              {/* Tracking Code */}
              <div className="bg-muted p-4 rounded-lg mb-4">
                <p className="text-sm text-muted-foreground mb-1">Kode Tracking</p>
                <p className="text-2xl font-mono font-bold">{createdRequest.tracking_code}</p>
              </div>

              {/* Nomor Surat */}
              {createdRequest.nomor_surat && (
                <div className="bg-blue-50 p-4 rounded-lg mb-4">
                  <p className="text-sm text-blue-600 mb-1">Nomor Surat</p>
                  <p className="text-lg font-mono font-semibold text-blue-700">{createdRequest.nomor_surat}</p>
                </div>
              )}

              {/* Template Info */}
              <div className="bg-purple-50 p-4 rounded-lg mb-6">
                <p className="text-sm text-purple-600 mb-1">Jenis Surat</p>
                <p className="font-semibold text-purple-700">{createdRequest.surat_template?.nama || selectedTemplate?.nama}</p>
                <p className="text-xs text-purple-500 mt-1">Status: Menunggu Tanda Tangan Wali Nagari</p>
              </div>

              <div className="flex gap-3 justify-center">
                <Button variant="outline" onClick={resetForm}>
                  Buat Permohonan Lain
                </Button>
                <Button onClick={() => navigate(`/pelayanan/surat-request/${createdRequest.id}`)}>
                  <Eye className="h-4 w-4 mr-2" />
                  Lihat Detail
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/pelayanan-surat')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Buat Surat Manual</h1>
          <p className="text-muted-foreground">Buat permohonan surat untuk warga secara manual</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Form Section */}
        <div className="lg:col-span-2 space-y-6">
          {/* Step 1: Cari Warga */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm">1</span>
                Cari Data Warga
              </CardTitle>
              <CardDescription>Masukkan NIK warga yang mengajukan permohonan surat</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Masukkan 16 digit NIK"
                  value={searchNik}
                  onChange={(e) => setSearchNik(e.target.value)}
                  maxLength={16}
                  className="flex-1"
                />
                <Button 
                  onClick={handleSearchWarga}
                  disabled={searchLoading || searchNik.length < 16}
                >
                  {searchLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4 mr-2" />}
                  Cari
                </Button>
              </div>

              {/* Warga Info */}
              {searchedWarga && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                      <User className="h-6 w-6 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-lg">{searchedWarga.nama}</div>
                      <div className="text-sm text-muted-foreground">NIK: {searchedWarga.nik}</div>
                      {searchedWarga.alamat && (
                        <div className="text-sm text-muted-foreground">{searchedWarga.alamat}</div>
                      )}
                    </div>
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Step 2: Pilih Jenis Surat */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm">2</span>
                Pilih Jenis Surat
              </CardTitle>
              <CardDescription>Pilih template surat yang akan dibuat</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Select value={templateId} onValueChange={handleTemplateSelect}>
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
              
              {loadingTemplate && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Memuat detail template...
                </div>
              )}

              {selectedTemplate && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="font-medium text-blue-800">{selectedTemplate.nama}</div>
                  {selectedTemplate.deskripsi && (
                    <div className="text-sm text-blue-600 mt-1">{selectedTemplate.deskripsi}</div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Step 3: Data Surat (Dynamic Variables) */}
          {inputVariables.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm">3</span>
                  Isi Data Surat
                </CardTitle>
                <CardDescription>Lengkapi data yang diperlukan untuk surat</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  {inputVariables.map((variable) => {
                    // Define which fields should use select dropdown
                    const selectFields: Record<string, { options: { value: string; label: string }[] }> = {
                      'jenis_kelamin': {
                        options: [
                          { value: 'L', label: 'Laki-laki' },
                          { value: 'P', label: 'Perempuan' }
                        ]
                      },
                      'jenis_kelamin_bayi': {
                        options: [
                          { value: 'L', label: 'Laki-laki' },
                          { value: 'P', label: 'Perempuan' }
                        ]
                      },
                      'jenis_kelamin_anak': {
                        options: [
                          { value: 'L', label: 'Laki-laki' },
                          { value: 'P', label: 'Perempuan' }
                        ]
                      },
                      'agama': {
                        options: [
                          { value: 'Islam', label: 'Islam' },
                          { value: 'Kristen', label: 'Kristen' },
                          { value: 'Katolik', label: 'Katolik' },
                          { value: 'Hindu', label: 'Hindu' },
                          { value: 'Buddha', label: 'Buddha' },
                          { value: 'Konghucu', label: 'Konghucu' }
                        ]
                      },
                      'status_perkawinan': {
                        options: [
                          { value: 'Belum Kawin', label: 'Belum Kawin' },
                          { value: 'Kawin', label: 'Kawin' },
                          { value: 'Cerai Hidup', label: 'Cerai Hidup' },
                          { value: 'Cerai Mati', label: 'Cerai Mati' }
                        ]
                      },
                      'hubungan_keluarga': {
                        options: [
                          { value: 'Kepala Keluarga', label: 'Kepala Keluarga' },
                          { value: 'Istri', label: 'Istri' },
                          { value: 'Anak', label: 'Anak' },
                          { value: 'Orang Tua', label: 'Orang Tua' },
                          { value: 'Mertua', label: 'Mertua' },
                          { value: 'Menantu', label: 'Menantu' },
                          { value: 'Cucu', label: 'Cucu' },
                          { value: 'Famili Lain', label: 'Famili Lain' }
                        ]
                      }
                    };
                    
                    const selectConfig = selectFields[variable.name];
                    const isDateField = variable.name.includes('tanggal') || variable.name.includes('tgl');
                    
                    return (
                      <div key={variable.name} className="space-y-2">
                        <Label>
                          {variable.label}
                          {variable.required && <span className="text-red-500 ml-1">*</span>}
                        </Label>
                        
                        {selectConfig ? (
                          <Select
                            value={variableValues[variable.name] || ''}
                            onValueChange={(value: string) => setVariableValues({
                              ...variableValues,
                              [variable.name]: value
                            })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder={`Pilih ${variable.label.toLowerCase()}`} />
                            </SelectTrigger>
                            <SelectContent>
                              {selectConfig.options.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : isDateField ? (
                          <Input
                            type="date"
                            value={variableValues[variable.name] || ''}
                            onChange={(e) => setVariableValues({
                              ...variableValues,
                              [variable.name]: e.target.value
                            })}
                          />
                        ) : (
                          <Input
                            placeholder={`Masukkan ${variable.label.toLowerCase()}`}
                            value={variableValues[variable.name] || ''}
                            onChange={(e) => setVariableValues({
                              ...variableValues,
                              [variable.name]: e.target.value
                            })}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 4: Keterangan Tambahan */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm">
                  {inputVariables.length > 0 ? '4' : '3'}
                </span>
                Keterangan Tambahan
              </CardTitle>
              <CardDescription>Informasi tambahan (opsional)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Keperluan</Label>
                <Input
                  placeholder="Untuk keperluan apa surat ini?"
                  value={keperluan}
                  onChange={(e) => setKeperluan(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Catatan</Label>
                <Textarea
                  placeholder="Catatan tambahan..."
                  value={catatan}
                  onChange={(e) => setCatatan(e.target.value)}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Summary Sidebar */}
        <div className="lg:col-span-1">
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle>Ringkasan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Pemohon</span>
                  <span className="font-medium">{searchedWarga?.nama || '-'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">NIK</span>
                  <span className="font-medium font-mono">{searchedWarga?.nik || '-'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Jenis Surat</span>
                  <span className="font-medium">{selectedTemplate?.kode || '-'}</span>
                </div>
                {inputVariables.length > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Data Diisi</span>
                    <span className="font-medium">
                      {Object.values(variableValues).filter(v => v).length}/{inputVariables.length}
                    </span>
                  </div>
                )}
              </div>

              <hr />

              <Button 
                className="w-full"
                size="lg"
                onClick={handleSubmit}
                disabled={actionLoading || !searchedWarga || !templateId || loadingTemplate}
              >
                {actionLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Memproses...
                  </>
                ) : (
                  <>
                    <FileText className="h-4 w-4 mr-2" />
                    Buat Permohonan
                  </>
                )}
              </Button>

              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => navigate('/pelayanan-surat')}
              >
                Batal
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
