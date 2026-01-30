import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Eye,
  CheckCircle2,
  XCircle,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import newModulesService from "@/services/newModulesService";
import type { DataLembagaKeagamaan, DataLembagaPendidikan, PaginatedResponse } from "@/services/newModulesService";

type DataType = DataLembagaKeagamaan | DataLembagaPendidikan;

interface DataLembagaPageProps {
  type: "lembaga-keagamaan" | "lembaga-pendidikan";
  onViewDetail?: (type: string, itemId: number) => void;
}

export default function DataLembagaPage({ type, onViewDetail }: DataLembagaPageProps) {
  const [data, setData] = useState<DataType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 15,
    total: 0,
  });
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<DataType | null>(null);
  const [deleteItem, setDeleteItem] = useState<DataType | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, [type, currentPage, searchQuery]);

  const loadData = async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        per_page: 15,
        search: searchQuery || undefined,
      };

      let response: PaginatedResponse<DataType>;
      
      if (type === "lembaga-keagamaan") {
        response = await newModulesService.getLembagaKeagamaan(params) as PaginatedResponse<DataType>;
      } else {
        response = await newModulesService.getLembagaPendidikan(params) as PaginatedResponse<DataType>;
      }

      setData(response.data.data);
      setPagination({
        current_page: response.data.current_page,
        last_page: response.data.last_page,
        per_page: response.data.per_page,
        total: response.data.total,
      });
    } catch (error: any) {
      console.error("Failed to load data:", error);
      toast.error(error.message || "Gagal memuat data");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteItem) return;
    
    setSaving(true);
    try {
      if (type === "lembaga-keagamaan") {
        await newModulesService.deleteLembagaKeagamaan(deleteItem.id);
      } else {
        await newModulesService.deleteLembagaPendidikan(deleteItem.id);
      }
      
      toast.success("Data berhasil dihapus");
      setIsDeleteDialogOpen(false);
      setDeleteItem(null);
      loadData();
    } catch (error: any) {
      console.error("Failed to delete:", error);
      toast.error(error.message || "Gagal menghapus data");
    } finally {
      setSaving(false);
    }
  };

  const getTitle = () => {
    return type === "lembaga-keagamaan" 
      ? "Data Lembaga Keagamaan" 
      : "Data Lembaga Pendidikan";
  };

  const renderKeagamaanRow = (item: DataLembagaKeagamaan, index: number) => (
    <TableRow key={item.id}>
      <TableCell>{(currentPage - 1) * pagination.per_page + index + 1}</TableCell>
      <TableCell>
        <div>
          <div className="font-medium">{item.nama}</div>
          <div className="text-sm text-muted-foreground">{item.jenis}</div>
        </div>
      </TableCell>
      <TableCell>
        <div className="text-sm">
          <div>{item.alamat || "-"}</div>
          <div className="text-muted-foreground">{item.jorong || "-"}</div>
        </div>
      </TableCell>
      <TableCell className="text-center">
        {item.kapasitas_jamaah?.toLocaleString() || "-"}
      </TableCell>
      <TableCell className="text-center">
        <div className="space-y-1 text-sm">
          {(item.jumlah_santri_laki || 0) + (item.jumlah_santri_perempuan || 0) > 0 && (
            <div className="flex items-center gap-1 justify-center">
              <Users className="h-3 w-3" />
              <span>{(item.jumlah_santri_laki || 0) + (item.jumlah_santri_perempuan || 0)} santri</span>
            </div>
          )}
          {item.jumlah_pengajar && (
            <div className="text-muted-foreground">{item.jumlah_pengajar} pengajar</div>
          )}
        </div>
      </TableCell>
      <TableCell>
        <div className="text-sm">
          <div>{item.nama_pimpinan || "-"}</div>
          <div className="text-muted-foreground">{item.no_hp_pimpinan || "-"}</div>
        </div>
      </TableCell>
      <TableCell>
        <Badge variant={item.is_active ? "default" : "secondary"}>
          {item.is_active ? "Aktif" : "Tidak Aktif"}
        </Badge>
      </TableCell>
      <TableCell>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onViewDetail?.(type, item.id)}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setEditingItem(item);
              setIsDialogOpen(true);
            }}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setDeleteItem(item);
              setIsDeleteDialogOpen(true);
            }}
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );

  const renderPendidikanRow = (item: DataLembagaPendidikan, index: number) => (
    <TableRow key={item.id}>
      <TableCell>{(currentPage - 1) * pagination.per_page + index + 1}</TableCell>
      <TableCell>
        <div>
          <div className="font-medium">{item.nama}</div>
          <div className="text-sm text-muted-foreground">
            <Badge variant="outline" className="mr-2">{item.jenjang}</Badge>
            <Badge variant={item.status_sekolah === "negeri" ? "default" : "secondary"}>
              {item.status_sekolah === "negeri" ? "Negeri" : "Swasta"}
            </Badge>
          </div>
        </div>
      </TableCell>
      <TableCell>
        <div className="text-sm">
          <div>{item.npsn || "-"}</div>
          <div className="text-muted-foreground">{item.alamat || "-"}</div>
          <div className="text-muted-foreground">{item.jorong || "-"}</div>
        </div>
      </TableCell>
      <TableCell>
        {item.akreditasi && (
          <Badge>{item.akreditasi}</Badge>
        )}
      </TableCell>
      <TableCell className="text-center">
        <div className="space-y-1 text-sm">
          <div className="flex items-center gap-1 justify-center">
            <Users className="h-3 w-3" />
            <span>{(item.jumlah_siswa_laki || 0) + (item.jumlah_siswa_perempuan || 0)} siswa</span>
          </div>
          <div className="text-muted-foreground">
            {(item.jumlah_guru_pns || 0) + (item.jumlah_guru_honorer || 0)} guru
          </div>
        </div>
      </TableCell>
      <TableCell>
        <div className="text-sm">
          <div>{item.nama_kepala_sekolah || "-"}</div>
          <div className="text-muted-foreground">{item.no_hp_kepala_sekolah || "-"}</div>
        </div>
      </TableCell>
      <TableCell>
        <Badge variant={item.is_active ? "default" : "secondary"}>
          {item.is_active ? "Aktif" : "Tidak Aktif"}
        </Badge>
      </TableCell>
      <TableCell>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onViewDetail?.(type, item.id)}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setEditingItem(item);
              setIsDialogOpen(true);
            }}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setDeleteItem(item);
              setIsDeleteDialogOpen(true);
            }}
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>{getTitle()}</CardTitle>
        <div className="flex gap-4 items-center mt-4">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari nama lembaga..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>
          <Button onClick={() => {
            setEditingItem(null);
            setIsDialogOpen(true);
          }}>
            <Plus className="mr-2 h-4 w-4" />
            Tambah Lembaga
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">No</TableHead>
                  <TableHead>Nama Lembaga</TableHead>
                  <TableHead>Alamat</TableHead>
                  {type === "lembaga-keagamaan" ? (
                    <>
                      <TableHead className="text-center">Kapasitas</TableHead>
                      <TableHead className="text-center">Santri/Pengajar</TableHead>
                      <TableHead>Pimpinan</TableHead>
                    </>
                  ) : (
                    <>
                      <TableHead>Akreditasi</TableHead>
                      <TableHead className="text-center">Siswa/Guru</TableHead>
                      <TableHead>Kepala Sekolah</TableHead>
                    </>
                  )}
                  <TableHead>Status</TableHead>
                  <TableHead>Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      Tidak ada data
                    </TableCell>
                  </TableRow>
                ) : (
                  data.map((item, index) => {
                    if (type === "lembaga-keagamaan") {
                      return renderKeagamaanRow(item as DataLembagaKeagamaan, index);
                    }
                    return renderPendidikanRow(item as DataLembagaPendidikan, index);
                  })
                )}
              </TableBody>
            </Table>

            {/* Pagination */}
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-muted-foreground">
                Menampilkan {((currentPage - 1) * pagination.per_page) + 1} - {Math.min(currentPage * pagination.per_page, pagination.total)} dari {pagination.total} data
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="flex items-center px-3 text-sm">
                  Hal {currentPage} / {pagination.last_page}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.min(pagination.last_page, p + 1))}
                  disabled={currentPage === pagination.last_page}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        )}
      </CardContent>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hapus Data</DialogTitle>
          </DialogHeader>
          <p>Apakah Anda yakin ingin menghapus data lembaga ini?</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Batal
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Hapus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
