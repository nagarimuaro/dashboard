import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Heart, Loader2 } from "lucide-react";
import type { DataSosial, KbFormData } from "../types";

interface KbDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  warga: DataSosial | null;
  form: KbFormData;
  onFormChange: (form: KbFormData) => void;
  onSave: () => void;
  saving: boolean;
}

export function KbDialog({
  open,
  onOpenChange,
  warga,
  form,
  onFormChange,
  onSave,
  saving,
}: KbDialogProps) {
  const handleClose = (value: boolean) => {
    onOpenChange(value);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-pink-600" />
            {(warga as any)?.data_kb_id ? "Edit Data KB" : "Daftarkan KB"}
          </DialogTitle>
        </DialogHeader>

        {warga && (
          <div className="space-y-4 py-4">
            {/* Warga Info */}
            <div className="bg-pink-50 border border-pink-200 p-3 rounded-lg">
              <p className="font-semibold text-pink-800">{warga.nama}</p>
              <p className="text-sm text-pink-700">NIK: {warga.nik}</p>
              <p className="text-sm text-pink-700">
                Usia: {(warga as any).usia} tahun
              </p>
              <p className="text-sm text-pink-700">Alamat: {warga.alamat}</p>
            </div>

            {/* Jenis KB */}
            <div className="space-y-2">
              <Label htmlFor="jenis_kb" className="font-medium">
                Jenis KB <span className="text-red-500">*</span>
              </Label>
              <Select
                value={form.jenis_kb}
                onValueChange={(value: string) =>
                  onFormChange({ ...form, jenis_kb: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih Jenis KB" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pil">Pil</SelectItem>
                  <SelectItem value="Suntik 1 Bulan">Suntik 1 Bulan</SelectItem>
                  <SelectItem value="Suntik 3 Bulan">Suntik 3 Bulan</SelectItem>
                  <SelectItem value="Kondom">Kondom</SelectItem>
                  <SelectItem value="IUD">IUD / Spiral</SelectItem>
                  <SelectItem value="Implant">Implant / Susuk</SelectItem>
                  <SelectItem value="MOW">MOW (Tubektomi)</SelectItem>
                  <SelectItem value="MOP">MOP (Vasektomi)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Tanggal Mulai */}
            <div className="space-y-2">
              <Label htmlFor="tanggal_mulai_kb" className="font-medium">
                Tanggal Mulai KB
              </Label>
              <Input
                id="tanggal_mulai_kb"
                type="date"
                value={form.tanggal_mulai_kb}
                onChange={(e) =>
                  onFormChange({ ...form, tanggal_mulai_kb: e.target.value })
                }
              />
            </div>

            {/* Jumlah Anak */}
            <div className="space-y-2">
              <Label htmlFor="jumlah_anak" className="font-medium">
                Jumlah Anak
              </Label>
              <Input
                id="jumlah_anak"
                type="number"
                min="0"
                value={form.jumlah_anak}
                onChange={(e) =>
                  onFormChange({
                    ...form,
                    jumlah_anak: parseInt(e.target.value) || 0,
                  })
                }
              />
            </div>

            {/* Posyandu */}
            <div className="space-y-2">
              <Label htmlFor="posyandu" className="font-medium">
                Posyandu
              </Label>
              <Input
                id="posyandu"
                placeholder="Nama posyandu"
                value={form.posyandu}
                onChange={(e) =>
                  onFormChange({ ...form, posyandu: e.target.value })
                }
              />
            </div>

            {/* Keterangan */}
            <div className="space-y-2">
              <Label htmlFor="keterangan" className="font-medium">
                Keterangan
              </Label>
              <Input
                id="keterangan"
                placeholder="Keterangan tambahan (opsional)"
                value={form.keterangan}
                onChange={(e) =>
                  onFormChange({ ...form, keterangan: e.target.value })
                }
              />
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => handleClose(false)} disabled={saving}>
            Batal
          </Button>
          <Button
            onClick={onSave}
            disabled={saving}
            style={{ backgroundColor: "#db2777", color: "white" }}
            className="hover:opacity-90"
          >
            {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {(warga as any)?.data_kb_id ? "Simpan Perubahan" : "Daftarkan KB"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
