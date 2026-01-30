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
} from "lucide-react";
import { toast } from "sonner";
import newModulesService from "@/services/newModulesService";
import type { DataPolaAsuh, DataInfrastruktur, DataYatimPiatu, PaginatedResponse } from "@/services/newModulesService";

type DataType = DataPolaAsuh | DataInfrastruktur | DataYatimPiatu;

interface DataSosialBaruPageProps {
  type: "pola-asuh" | "infrastruktur" | "yatim-piatu";
  onViewDetail?: (type: string, itemId: number) => void;
}

export default function DataSosialBaruPage({ type, onViewDetail }: DataSosialBaruPageProps) {
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
      
      if (type === "pola-asuh") {
        response = await newModulesService.getPolaAsuh(params) as PaginatedResponse<DataType>;
      } else if (type === "infrastruktur") {
        response = await newModulesService.getInfrastruktur(params) as PaginatedResponse<DataType>;
      } else {
        response = await newModulesService.getYatimPiatu(params) as PaginatedResponse<DataType>;
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
      if (type === "pola-asuh") {
        await newModulesService.deletePolaAsuh(deleteItem.id);
      } else if (type === "infrastruktur") {
        await newModulesService.deleteInfrastruktur(deleteItem.id);
      } else {
        await newModulesService.deleteYatimPiatu(deleteItem.id);
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
    switch (type) {
      case "pola-asuh": return "Data Pola Asuh";
      case "infrastruktur": return "Data Infrastruktur Rumah";
      case "yatim-piatu": return "Data Yatim Piatu";
    }
  };

  const renderPolaAsuhRow = (item: DataPolaAsuh, index: number) => (
    <TableRow key={item.id}>
      <TableCell>{(currentPage - 1) * pagination.per_page + index + 1}</TableCell>
      <TableCell>
        <div>
          <div className="font-medium">{item.nama_anak || item.warga?.nama || "-"}</div>
          <div className="text-sm text-muted-foreground">{item.usia_bulan} bulan</div>
        </div>
      </TableCell>
      <TableCell>{item.jorong || "-"}</TableCell>
      <TableCell>
        <div className="space-y-1 text-sm">
          <div className="flex items-center gap-1">
            {item.asi_eksklusif ? (
              <CheckCircle2 className="h-3 w-3 text-green-500" />
            ) : (
              <XCircle className="h-3 w-3 text-red-500" />
            )}
            <span>ASI Eksklusif</span>
          </div>
          <div className="flex items-center gap-1">
            {item.mpasi_sesuai_usia ? (
              <CheckCircle2 className="h-3 w-3 text-green-500" />
            ) : (
              <XCircle className="h-3 w-3 text-red-500" />
            )}
            <span>MPASI Sesuai</span>
          </div>
          <div className="flex items-center gap-1">
            {item.imunisasi_lengkap ? (
              <CheckCircle2 className="h-3 w-3 text-green-500" />
            ) : (
              <XCircle className="h-3 w-3 text-red-500" />
            )}
            <span>Imunisasi Lengkap</span>
          </div>
        </div>
      </TableCell>
      <TableCell>{item.tahun_data}</TableCell>
      <TableCell>
        <Badge variant={item.is_verified ? "default" : "secondary"}>
          {item.is_verified ? "Terverifikasi" : "Belum"}
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

  const renderInfrastrukturRow = (item: DataInfrastruktur, index: number) => (
    <TableRow key={item.id}>
      <TableCell>{(currentPage - 1) * pagination.per_page + index + 1}</TableCell>
      <TableCell>{item.keluarga?.no_kk || "-"}</TableCell>
      <TableCell>{item.jorong || "-"}</TableCell>
      <TableCell>
        <div>
          <div>{item.jenis_rumah || "-"}</div>
          <div className="text-sm text-muted-foreground">{item.status_kepemilikan}</div>
        </div>
      </TableCell>
      <TableCell>
        <div className="space-y-1 text-sm">
          <div className="flex items-center gap-1">
            {item.akses_air_bersih ? (
              <CheckCircle2 className="h-3 w-3 text-green-500" />
            ) : (
              <XCircle className="h-3 w-3 text-red-500" />
            )}
            <span>Air Bersih</span>
          </div>
          <div className="flex items-center gap-1">
            {item.akses_listrik ? (
              <CheckCircle2 className="h-3 w-3 text-green-500" />
            ) : (
              <XCircle className="h-3 w-3 text-red-500" />
            )}
            <span>Listrik</span>
          </div>
          <div className="flex items-center gap-1">
            {item.jamban_sehat ? (
              <CheckCircle2 className="h-3 w-3 text-green-500" />
            ) : (
              <XCircle className="h-3 w-3 text-red-500" />
            )}
            <span>Sanitasi</span>
          </div>
        </div>
      </TableCell>
      <TableCell>
        <Badge variant={item.kondisi_rumah === "Baik" ? "default" : "destructive"}>
          {item.kondisi_rumah}
        </Badge>
      </TableCell>
      <TableCell>{item.tahun_data}</TableCell>
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

  const renderYatimPiatuRow = (item: DataYatimPiatu, index: number) => (
    <TableRow key={item.id}>
      <TableCell>{(currentPage - 1) * pagination.per_page + index + 1}</TableCell>
      <TableCell>
        <div>
          <div className="font-medium">{item.nama_anak || item.warga?.nama || "-"}</div>
          <div className="text-sm text-muted-foreground">
            {item.jenis_kelamin} • {item.tanggal_lahir}
          </div>
        </div>
      </TableCell>
      <TableCell>{item.jorong || "-"}</TableCell>
      <TableCell>
        <Badge>
          {item.status_yatim === "yatim" && "Yatim"}
          {item.status_yatim === "piatu" && "Piatu"}
          {item.status_yatim === "yatim_piatu" && "Yatim Piatu"}
        </Badge>
      </TableCell>
      <TableCell>
        <div className="text-sm">
          <div>Wali: {item.wali?.nama || item.hubungan_wali || "-"}</div>
          <div className="text-muted-foreground">{item.status_pendidikan || "-"}</div>
        </div>
      </TableCell>
      <TableCell>
        <Badge variant={item.penerima_bantuan ? "default" : "secondary"}>
          {item.penerima_bantuan ? "Ya" : "Tidak"}
        </Badge>
      </TableCell>
      <TableCell>{item.tahun_data}</TableCell>
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
              placeholder="Cari..."
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
            Tambah Data
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
                  {type === "pola-asuh" && (
                    <>
                      <TableHead>Nama Anak</TableHead>
                      <TableHead>Jorong</TableHead>
                      <TableHead>Status Pola Asuh</TableHead>
                      <TableHead>Tahun</TableHead>
                      <TableHead>Verifikasi</TableHead>
                    </>
                  )}
                  {type === "infrastruktur" && (
                    <>
                      <TableHead>No KK</TableHead>
                      <TableHead>Jorong</TableHead>
                      <TableHead>Jenis Rumah</TableHead>
                      <TableHead>Fasilitas</TableHead>
                      <TableHead>Kondisi</TableHead>
                      <TableHead>Tahun</TableHead>
                    </>
                  )}
                  {type === "yatim-piatu" && (
                    <>
                      <TableHead>Nama Anak</TableHead>
                      <TableHead>Jorong</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Wali & Pendidikan</TableHead>
                      <TableHead>Bantuan</TableHead>
                      <TableHead>Tahun</TableHead>
                    </>
                  )}
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
                    if (type === "pola-asuh") return renderPolaAsuhRow(item as DataPolaAsuh, index);
                    if (type === "infrastruktur") return renderInfrastrukturRow(item as DataInfrastruktur, index);
                    return renderYatimPiatuRow(item as DataYatimPiatu, index);
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
          <p>Apakah Anda yakin ingin menghapus data ini?</p>
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
