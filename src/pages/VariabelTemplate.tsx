import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, User, Users, Settings, FileText, Copy, Check, Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import apiClient from "@/services/apiClient";

interface TemplateVariable {
  id: number;
  name: string;
  variable: string;
  source: string;
  surat_type: string | null;
  description: string;
  example: string | null;
  is_active: boolean;
  sort_order: number;
}

interface SuratType {
  value: string;
  label: string;
}

const SOURCE_COLORS: Record<string, string> = {
  warga: "bg-blue-500",
  keluarga: "bg-green-500",
  sistem: "bg-purple-500",
  input: "bg-orange-500",
};

const SOURCE_ICONS: Record<string, React.ReactNode> = {
  warga: <User className="h-4 w-4" />,
  keluarga: <Users className="h-4 w-4" />,
  sistem: <Settings className="h-4 w-4" />,
  input: <FileText className="h-4 w-4" />,
};

// Component untuk table dengan copy functionality
function VariableTable({ 
  variables, 
  onEdit, 
  onDelete,
  showActions = false 
}: { 
  variables: TemplateVariable[];
  onEdit?: (variable: TemplateVariable) => void;
  onDelete?: (variable: TemplateVariable) => void;
  showActions?: boolean;
}) {
  const [copiedVar, setCopiedVar] = useState<string | null>(null);

  const handleCopy = async (variable: string) => {
    await navigator.clipboard.writeText(variable);
    setCopiedVar(variable);
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
          <TableHead className="w-[200px]">Variable</TableHead>
          <TableHead className="w-[350px]">Deskripsi</TableHead>
          <TableHead>Contoh</TableHead>
          <TableHead className="w-[120px]">Aksi</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {variables.map((v) => (
          <TableRow key={v.id}>
            <TableCell className="font-mono text-sm text-blue-600">{v.variable}</TableCell>
            <TableCell className="text-sm">{v.description}</TableCell>
            <TableCell className="text-sm text-gray-600">{v.example || '-'}</TableCell>
            <TableCell>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCopy(v.variable)}
                  className="h-8 w-8 p-0"
                  title="Copy"
                >
                  {copiedVar === v.variable ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
                {showActions && onEdit && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(v)}
                    className="h-8 w-8 p-0"
                    title="Edit"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                )}
                {showActions && onDelete && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(v)}
                    className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                    title="Hapus"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export default function VariabelTemplate() {
  const [loading, setLoading] = useState(true);
  const [variables, setVariables] = useState<{
    warga: TemplateVariable[];
    keluarga: TemplateVariable[];
    sistem: TemplateVariable[];
    input: TemplateVariable[];
  }>({
    warga: [],
    keluarga: [],
    sistem: [],
    input: [],
  });
  const [suratTypes, setSuratTypes] = useState<SuratType[]>([]);
  const [selectedSuratType, setSelectedSuratType] = useState("semua");
  const [filteredInputVariables, setFilteredInputVariables] = useState<TemplateVariable[]>([]);
  
  // Dialog states
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingVariable, setEditingVariable] = useState<TemplateVariable | null>(null);
  const [variableToDelete, setVariableToDelete] = useState<TemplateVariable | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    source: "input",
    surat_type: "",
    description: "",
    example: "",
  });
  const [saving, setSaving] = useState(false);

  // Fetch all variables
  const fetchVariables = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get("/template-variables");
      if (response.success) {
        setVariables(response.data);
      }
    } catch (error) {
      console.error("Error fetching variables:", error);
      toast.error("Gagal memuat data variabel");
    } finally {
      setLoading(false);
    }
  };

  // Fetch input variables with surat type filter
  const fetchInputVariables = async () => {
    try {
      const response = await apiClient.get("/template-variables/input-by-surat", {
        surat_type: selectedSuratType
      });
      if (response.success) {
        // Flatten grouped data
        const grouped = response.data;
        const allVars: TemplateVariable[] = [];
        Object.values(grouped).forEach((vars: any) => {
          vars.forEach((v: TemplateVariable) => allVars.push(v));
        });
        setFilteredInputVariables(allVars);
        
        if (response.surat_types) {
          setSuratTypes(response.surat_types);
        }
      }
    } catch (error) {
      console.error("Error fetching input variables:", error);
    }
  };

  useEffect(() => {
    fetchVariables();
  }, []);

  useEffect(() => {
    fetchInputVariables();
  }, [selectedSuratType]);

  // Handle add/edit
  const handleOpenDialog = (variable?: TemplateVariable) => {
    if (variable) {
      setEditingVariable(variable);
      setFormData({
        name: variable.name,
        source: variable.source,
        surat_type: variable.surat_type || "",
        description: variable.description,
        example: variable.example || "",
      });
    } else {
      setEditingVariable(null);
      setFormData({
        name: "",
        source: "input",
        surat_type: "",
        description: "",
        example: "",
      });
    }
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name || !formData.description) {
      toast.error("Nama dan deskripsi harus diisi");
      return;
    }

    try {
      setSaving(true);
      const payload = {
        ...formData,
        name: formData.name.toUpperCase().replace(/[^A-Z_]/g, "_"),
        surat_type: formData.source === "input" ? formData.surat_type : null,
      };

      if (editingVariable) {
        await apiClient.put(`/template-variables/${editingVariable.id}`, payload);
        toast.success("Variabel berhasil diperbarui");
      } else {
        await apiClient.post("/template-variables", payload);
        toast.success("Variabel berhasil ditambahkan");
      }
      
      setDialogOpen(false);
      fetchVariables();
      fetchInputVariables();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Gagal menyimpan variabel");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!variableToDelete) return;

    try {
      await apiClient.delete(`/template-variables/${variableToDelete.id}`);
      toast.success("Variabel berhasil dihapus");
      setDeleteDialogOpen(false);
      setVariableToDelete(null);
      fetchVariables();
      fetchInputVariables();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Gagal menghapus variabel");
    }
  };

  const openDeleteDialog = (variable: TemplateVariable) => {
    setVariableToDelete(variable);
    setDeleteDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/pelayanan/template-surat">
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Kembali
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Daftar Variabel Template</h1>
            <p className="text-gray-600">
              Gunakan variabel berikut dalam template surat untuk mengisi data otomatis
            </p>
          </div>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="mr-2 h-4 w-4" />
          Tambah Variabel
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Panduan Penggunaan Variabel</CardTitle>
          <CardDescription>
            Variabel dalam kurung kurawal {"{}"} akan diganti dengan data aktual saat surat digenerate
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 flex-wrap">
            <Badge variant="default" className={SOURCE_COLORS.warga}>Warga = Data dari NIK pemohon</Badge>
            <Badge variant="default" className={SOURCE_COLORS.keluarga}>Keluarga = Data dari KK</Badge>
            <Badge variant="default" className={SOURCE_COLORS.sistem}>Sistem = Generate otomatis</Badge>
            <Badge variant="default" className={SOURCE_COLORS.input}>Input = Diminta dari user</Badge>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="warga" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="warga" className="flex items-center gap-2">
            {SOURCE_ICONS.warga}
            Warga ({variables.warga.length})
          </TabsTrigger>
          <TabsTrigger value="keluarga" className="flex items-center gap-2">
            {SOURCE_ICONS.keluarga}
            Keluarga ({variables.keluarga.length})
          </TabsTrigger>
          <TabsTrigger value="sistem" className="flex items-center gap-2">
            {SOURCE_ICONS.sistem}
            Sistem ({variables.sistem.length})
          </TabsTrigger>
          <TabsTrigger value="input" className="flex items-center gap-2">
            {SOURCE_ICONS.input}
            Input User ({variables.input.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="warga">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-blue-600" />
                Variabel Data Warga
              </CardTitle>
              <CardDescription>
                Data pribadi dan alamat warga yang diambil otomatis dari NIK
              </CardDescription>
            </CardHeader>
            <CardContent>
              <VariableTable 
                variables={variables.warga} 
                onEdit={handleOpenDialog}
                onDelete={openDeleteDialog}
                showActions={true}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="keluarga">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-green-600" />
                Variabel Data Keluarga
              </CardTitle>
              <CardDescription>
                Data keluarga dan alamat dari Kartu Keluarga (KK)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <VariableTable 
                variables={variables.keluarga}
                onEdit={handleOpenDialog}
                onDelete={openDeleteDialog}
                showActions={true}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sistem">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-purple-600" />
                Variabel Sistem
              </CardTitle>
              <CardDescription>
                Data yang digenerate otomatis oleh sistem
              </CardDescription>
            </CardHeader>
            <CardContent>
              <VariableTable 
                variables={variables.sistem}
                onEdit={handleOpenDialog}
                onDelete={openDeleteDialog}
                showActions={true}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="input">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-orange-600" />
                Variabel Input User
              </CardTitle>
              <CardDescription>
                Data yang harus diinput oleh user saat pengajuan surat
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium">Filter berdasarkan jenis surat:</span>
                <Select value={selectedSuratType} onValueChange={setSelectedSuratType}>
                  <SelectTrigger className="w-[280px]">
                    <SelectValue placeholder="Pilih jenis surat" />
                  </SelectTrigger>
                  <SelectContent>
                    {suratTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <VariableTable 
                variables={filteredInputVariables}
                onEdit={handleOpenDialog}
                onDelete={openDeleteDialog}
                showActions={true}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingVariable ? "Edit Variabel" : "Tambah Variabel Baru"}
            </DialogTitle>
            <DialogDescription>
              {editingVariable ? "Perbarui data variabel template" : "Tambahkan variabel baru untuk template surat"}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nama Variabel</Label>
              <Input
                id="name"
                placeholder="Contoh: NAMA_USAHA"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value.toUpperCase() })}
              />
              <p className="text-xs text-gray-500">Gunakan HURUF_BESAR dan underscore</p>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="source">Sumber Data</Label>
              <Select value={formData.source} onValueChange={(v: string) => setFormData({ ...formData, source: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="warga">Warga (dari NIK)</SelectItem>
                  <SelectItem value="keluarga">Keluarga (dari KK)</SelectItem>
                  <SelectItem value="sistem">Sistem (auto-generate)</SelectItem>
                  <SelectItem value="input">Input User</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {formData.source === "input" && (
              <div className="grid gap-2">
                <Label htmlFor="surat_type">Jenis Surat</Label>
                <Select value={formData.surat_type} onValueChange={(v: string) => setFormData({ ...formData, surat_type: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih jenis surat" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="umum">Umum</SelectItem>
                    <SelectItem value="pindah">Pindah</SelectItem>
                    <SelectItem value="kelahiran">Kelahiran</SelectItem>
                    <SelectItem value="kematian">Kematian</SelectItem>
                    <SelectItem value="usaha">Usaha</SelectItem>
                    <SelectItem value="tidak_mampu">Tidak Mampu</SelectItem>
                    <SelectItem value="domisili">Domisili</SelectItem>
                    <SelectItem value="nikah">Nikah</SelectItem>
                    <SelectItem value="kehilangan">Kehilangan</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="grid gap-2">
              <Label htmlFor="description">Deskripsi</Label>
              <Input
                id="description"
                placeholder="Contoh: Nama usaha/toko"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="example">Contoh Nilai</Label>
              <Input
                id="example"
                placeholder="Contoh: TOKO BERKAH JAYA"
                value={formData.example}
                onChange={(e) => setFormData({ ...formData, example: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Batal</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editingVariable ? "Simpan" : "Tambah"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Konfirmasi Hapus</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus variabel <strong>{variableToDelete?.variable}</strong>?
              Tindakan ini tidak dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Batal</Button>
            <Button variant="destructive" onClick={handleDelete}>Hapus</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
