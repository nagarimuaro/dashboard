import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { 
  ArrowLeft, User, Users, Settings, FileText, Copy, Check, 
  Building2, Heart, Baby, Skull, Search, MapPin, Home,
  Briefcase, UserX, Clock, FileCheck, Scale, Car, ChevronDown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import apiClient from "@/services/apiClient";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface SuratVariable {
  id: number;
  kode: string;
  nama: string;
  kategori: string;
  sumber_data: string;
  tipe_data: string;
  format: string | null;
  deskripsi: string | null;
  is_required: boolean;
  is_active: boolean;
  urutan: number;
}

// Konfigurasi kategori
const KATEGORI_CONFIG: Record<string, { 
  label: string; 
  icon: React.ReactNode; 
  color: string;
  description: string;
  tab: string;
}> = {
  // Data Pribadi
  data_pribadi: { 
    label: "Data Pribadi", 
    icon: <User className="h-4 w-4" />, 
    color: "bg-blue-500",
    description: "Data identitas warga dari NIK",
    tab: "pribadi"
  },
  alamat: { 
    label: "Alamat", 
    icon: <MapPin className="h-4 w-4" />, 
    color: "bg-blue-400",
    description: "Data alamat warga",
    tab: "pribadi"
  },
  keluarga: { 
    label: "Keluarga", 
    icon: <Users className="h-4 w-4" />, 
    color: "bg-green-500",
    description: "Data dari Kartu Keluarga",
    tab: "pribadi"
  },
  kontak: { 
    label: "Kontak", 
    icon: <FileText className="h-4 w-4" />, 
    color: "bg-cyan-500",
    description: "Data kontak warga",
    tab: "pribadi"
  },
  
  // Data Nagari & Surat
  nagari: { 
    label: "Nagari/Instansi", 
    icon: <Building2 className="h-4 w-4" />, 
    color: "bg-purple-500",
    description: "Data Nagari dan pejabat",
    tab: "surat"
  },
  surat: { 
    label: "Surat", 
    icon: <FileCheck className="h-4 w-4" />, 
    color: "bg-indigo-500",
    description: "Data surat (nomor, tanggal, dll)",
    tab: "surat"
  },
  
  // Data Per Jenis Surat
  pindah: { 
    label: "Pindah", 
    icon: <Car className="h-4 w-4" />, 
    color: "bg-orange-500",
    description: "Data untuk surat pindah domisili",
    tab: "jenis"
  },
  ahli_waris: { 
    label: "Ahli Waris", 
    icon: <Scale className="h-4 w-4" />, 
    color: "bg-amber-600",
    description: "Data untuk surat ahli waris",
    tab: "jenis"
  },
  kurang_mampu: { 
    label: "Kurang Mampu", 
    icon: <Heart className="h-4 w-4" />, 
    color: "bg-rose-500",
    description: "Data untuk SKTM",
    tab: "jenis"
  },
  kematian: { 
    label: "Kematian", 
    icon: <Skull className="h-4 w-4" />, 
    color: "bg-gray-600",
    description: "Data untuk surat kematian",
    tab: "jenis"
  },
  kelahiran: { 
    label: "Kelahiran", 
    icon: <Baby className="h-4 w-4" />, 
    color: "bg-pink-500",
    description: "Data untuk surat kelahiran",
    tab: "jenis"
  },
  kehilangan: { 
    label: "Kehilangan", 
    icon: <Search className="h-4 w-4" />, 
    color: "bg-red-500",
    description: "Data untuk surat kehilangan",
    tab: "jenis"
  },
  nikah: { 
    label: "Nikah", 
    icon: <Heart className="h-4 w-4" />, 
    color: "bg-pink-600",
    description: "Data untuk surat nikah",
    tab: "jenis"
  },
  keramaian: { 
    label: "Keramaian", 
    icon: <Users className="h-4 w-4" />, 
    color: "bg-yellow-500",
    description: "Data untuk izin keramaian",
    tab: "jenis"
  },
  tanah: { 
    label: "Tanah", 
    icon: <MapPin className="h-4 w-4" />, 
    color: "bg-emerald-600",
    description: "Data untuk surat tanah/DHKP",
    tab: "jenis"
  },
  usaha: { 
    label: "Usaha", 
    icon: <Briefcase className="h-4 w-4" />, 
    color: "bg-teal-500",
    description: "Data untuk surat usaha",
    tab: "jenis"
  },
  organisasi: { 
    label: "Organisasi", 
    icon: <Building2 className="h-4 w-4" />, 
    color: "bg-violet-500",
    description: "Data untuk domisili organisasi",
    tab: "jenis"
  },
  ghaib: { 
    label: "Ghaib", 
    icon: <UserX className="h-4 w-4" />, 
    color: "bg-slate-600",
    description: "Data untuk surat ghaib",
    tab: "jenis"
  },
  janda_duda: { 
    label: "Janda/Duda", 
    icon: <User className="h-4 w-4" />, 
    color: "bg-stone-500",
    description: "Data untuk surat janda/duda",
    tab: "jenis"
  },
  masih_hidup: { 
    label: "Masih Hidup", 
    icon: <Clock className="h-4 w-4" />, 
    color: "bg-lime-600",
    description: "Data untuk surat masih hidup",
    tab: "jenis"
  },
  belum_menikah: { 
    label: "Belum Menikah", 
    icon: <User className="h-4 w-4" />, 
    color: "bg-sky-500",
    description: "Data untuk surat belum menikah",
    tab: "jenis"
  },
  rumah: { 
    label: "Rumah", 
    icon: <Home className="h-4 w-4" />, 
    color: "bg-amber-500",
    description: "Data untuk surat belum punya rumah",
    tab: "jenis"
  },
};

const SUMBER_DATA_BADGE: Record<string, { label: string; className: string }> = {
  warga: { label: "Warga", className: "bg-blue-100 text-blue-800" },
  keluarga: { label: "Keluarga", className: "bg-green-100 text-green-800" },
  tenant: { label: "Tenant", className: "bg-purple-100 text-purple-800" },
  auto: { label: "Auto", className: "bg-gray-100 text-gray-800" },
  permohonan: { label: "Input", className: "bg-orange-100 text-orange-800" },
  input: { label: "Input", className: "bg-orange-100 text-orange-800" },
};

// Component untuk tabel variabel dengan copy
function VariableTable({ variables }: { variables: SuratVariable[] }) {
  const [copiedVar, setCopiedVar] = useState<string | null>(null);

  const handleCopy = async (kode: string) => {
    const placeholder = `\${${kode}}`;
    await navigator.clipboard.writeText(placeholder);
    setCopiedVar(kode);
    toast.success(`Berhasil copy: ${placeholder}`);
    setTimeout(() => setCopiedVar(null), 2000);
  };

  if (variables.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        Tidak ada variabel
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[220px]">Placeholder</TableHead>
          <TableHead className="w-[180px]">Nama</TableHead>
          <TableHead>Deskripsi</TableHead>
          <TableHead className="w-[100px]">Sumber</TableHead>
          <TableHead className="w-[80px]">Aksi</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {variables.map((v) => (
          <TableRow key={v.id}>
            <TableCell>
              <code className="px-2 py-1 bg-slate-100 rounded text-sm font-mono text-blue-600">
                ${'{' + v.kode + '}'}
              </code>
            </TableCell>
            <TableCell className="text-sm font-medium">{v.nama}</TableCell>
            <TableCell className="text-sm text-gray-600">{v.deskripsi || '-'}</TableCell>
            <TableCell>
              <Badge variant="secondary" className={SUMBER_DATA_BADGE[v.sumber_data]?.className || ""}>
                {SUMBER_DATA_BADGE[v.sumber_data]?.label || v.sumber_data}
              </Badge>
            </TableCell>
            <TableCell>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleCopy(v.kode)}
                className="h-8 w-8 p-0"
                title="Copy placeholder"
              >
                {copiedVar === v.kode ? (
                  <Check className="h-4 w-4 text-green-600" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

// Component kategori collapsible
function KategoriSection({ 
  kategori, 
  variables, 
  defaultOpen = false 
}: { 
  kategori: string; 
  variables: SuratVariable[];
  defaultOpen?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const config = KATEGORI_CONFIG[kategori] || {
    label: kategori,
    icon: <FileText className="h-4 w-4" />,
    color: "bg-gray-500",
    description: "",
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="border rounded-lg">
      <CollapsibleTrigger asChild>
        <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${config.color} text-white`}>
              {config.icon}
            </div>
            <div>
              <h3 className="font-semibold">{config.label}</h3>
              <p className="text-sm text-gray-500">{config.description}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline">{variables.length} variabel</Badge>
            <ChevronDown className={`h-5 w-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </div>
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="border-t p-4">
          <VariableTable variables={variables} />
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

export default function DaftarVariabelSurat() {
  const [loading, setLoading] = useState(true);
  const [variables, setVariables] = useState<SuratVariable[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [stats, setStats] = useState<Record<string, number>>({});

  // Fetch semua variabel dari surat_variables
  const fetchVariables = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get("/surat-variables");
      const data = response.data || response;
      
      if (Array.isArray(data)) {
        setVariables(data);
        
        // Calculate stats
        const statsTemp: Record<string, number> = {};
        data.forEach((v: SuratVariable) => {
          statsTemp[v.kategori] = (statsTemp[v.kategori] || 0) + 1;
        });
        setStats(statsTemp);
      }
    } catch (error) {
      console.error("Error fetching variables:", error);
      toast.error("Gagal memuat data variabel");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVariables();
  }, []);

  // Filter variables by search
  const filteredVariables = variables.filter(v => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      v.kode.toLowerCase().includes(query) ||
      v.nama.toLowerCase().includes(query) ||
      v.deskripsi?.toLowerCase().includes(query)
    );
  });

  // Group variables by kategori
  const groupedByKategori = filteredVariables.reduce((acc, v) => {
    if (!acc[v.kategori]) acc[v.kategori] = [];
    acc[v.kategori].push(v);
    return acc;
  }, {} as Record<string, SuratVariable[]>);

  // Separate into tabs
  const pribadiKategori = ['data_pribadi', 'alamat', 'keluarga', 'kontak'];
  const suratKategori = ['nagari', 'surat'];
  const jenisKategori = Object.keys(KATEGORI_CONFIG).filter(
    k => !pribadiKategori.includes(k) && !suratKategori.includes(k)
  );

  const pribadiVariables = pribadiKategori.filter(k => groupedByKategori[k]);
  const suratVariables = suratKategori.filter(k => groupedByKategori[k]);
  const jenisVariables = jenisKategori.filter(k => groupedByKategori[k]);

  // Count totals
  const totalPribadi = pribadiKategori.reduce((sum, k) => sum + (stats[k] || 0), 0);
  const totalSurat = suratKategori.reduce((sum, k) => sum + (stats[k] || 0), 0);
  const totalJenis = jenisKategori.reduce((sum, k) => sum + (stats[k] || 0), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/pelayanan/template-surat">
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Kembali
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Daftar Variabel Surat</h1>
            <p className="text-gray-600">
              {variables.length} variabel tersedia untuk template surat
            </p>
          </div>
        </div>
      </div>

      {/* Info Card */}
      <Card>
        <CardHeader>
          <CardTitle>Cara Menggunakan Placeholder</CardTitle>
          <CardDescription>
            Gunakan format <code className="px-1 bg-slate-100 rounded">${'{NAMA_VARIABLE}'}</code> di file template .docx
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4">
            <div className="p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2 text-blue-700 font-medium">
                <User className="h-4 w-4" />
                Warga
              </div>
              <p className="text-xs text-blue-600 mt-1">Data otomatis dari NIK</p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <div className="flex items-center gap-2 text-green-700 font-medium">
                <Users className="h-4 w-4" />
                Keluarga
              </div>
              <p className="text-xs text-green-600 mt-1">Data dari Kartu Keluarga</p>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <div className="flex items-center gap-2 text-purple-700 font-medium">
                <Building2 className="h-4 w-4" />
                Tenant
              </div>
              <p className="text-xs text-purple-600 mt-1">Data Nagari/Instansi</p>
            </div>
            <div className="p-3 bg-orange-50 rounded-lg">
              <div className="flex items-center gap-2 text-orange-700 font-medium">
                <FileText className="h-4 w-4" />
                Input
              </div>
              <p className="text-xs text-orange-600 mt-1">Diinput saat permohonan</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Cari variabel... (contoh: NAMA, NIK, ALAMAT)"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Tabs */}
      <Tabs defaultValue="pribadi" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pribadi" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Data Pribadi ({totalPribadi})
          </TabsTrigger>
          <TabsTrigger value="surat" className="flex items-center gap-2">
            <FileCheck className="h-4 w-4" />
            Nagari & Surat ({totalSurat})
          </TabsTrigger>
          <TabsTrigger value="jenis" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Per Jenis Surat ({totalJenis})
          </TabsTrigger>
        </TabsList>

        {/* Tab: Data Pribadi */}
        <TabsContent value="pribadi" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Variabel Data Pribadi & Keluarga</CardTitle>
              <CardDescription>
                Data warga yang diambil otomatis berdasarkan NIK dan No. KK
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {pribadiVariables.map(kategori => (
                <KategoriSection
                  key={kategori}
                  kategori={kategori}
                  variables={groupedByKategori[kategori]}
                  defaultOpen={kategori === 'data_pribadi'}
                />
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Nagari & Surat */}
        <TabsContent value="surat" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Variabel Nagari & Surat</CardTitle>
              <CardDescription>
                Data instansi dan informasi surat yang digenerate otomatis
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {suratVariables.map(kategori => (
                <KategoriSection
                  key={kategori}
                  kategori={kategori}
                  variables={groupedByKategori[kategori]}
                  defaultOpen={true}
                />
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Per Jenis Surat */}
        <TabsContent value="jenis" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Variabel Per Jenis Surat</CardTitle>
              <CardDescription>
                Variabel khusus yang diperlukan untuk masing-masing jenis surat
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {jenisVariables.map(kategori => (
                <KategoriSection
                  key={kategori}
                  kategori={kategori}
                  variables={groupedByKategori[kategori]}
                />
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
