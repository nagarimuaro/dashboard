import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CheckedState } from "@radix-ui/react-checkbox";

interface KemiskinanFormData {
  nama_kk?: string;
  nik_kk?: string;
  no_kk?: string;
  alamat?: string;
  jorong?: string;
  rt?: string;
  rw?: string;
  jumlah_anggota_keluarga?: number;
  status_rumah?: string;
  jenis_lantai?: string;
  jenis_dinding?: string;
  sumber_air?: string;
  penerangan?: string;
  bahan_bakar_masak?: string;
  kepemilikan_jamban?: string;
  penghasilan_bulanan?: number;
  status?: string;
  penerima_bantuan?: boolean;
  jenis_bantuan?: string;
  tahun_data?: number;
  keterangan?: string;
  [key: string]: string | number | boolean | undefined;
}

interface KemiskinanFormProps {
  formData: Partial<KemiskinanFormData>;
  setFormData: React.Dispatch<React.SetStateAction<Partial<KemiskinanFormData>>>;
  jorongList: string[];
  statusOptions: string[];
}

const rtList = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10"];
const rwList = ["01", "02", "03", "04", "05"];
const tahunList = [2025, 2024, 2023, 2022, 2021, 2020];
const statusRumahOptions = ["Milik Sendiri", "Kontrak", "Sewa", "Menumpang", "Lainnya"];
const jenisLantaiOptions = ["Keramik", "Ubin", "Semen", "Papan", "Tanah"];
const jenisDindingOptions = ["Tembok", "Kayu", "Bambu", "Campuran"];
const sumberAirOptions = ["PDAM", "Sumur", "Mata Air", "Sungai", "Lainnya"];
const peneranganOptions = ["PLN", "Non-PLN", "Tidak Ada"];
const bahanBakarOptions = ["LPG", "Minyak Tanah", "Kayu Bakar", "Lainnya"];
const kepemilikanJambanOptions = ["Milik Sendiri", "Bersama", "Umum", "Tidak Ada"];
const jenisBantuanOptions = ["PKH", "BPNT", "BST", "BLT", "Lainnya"];

export default function KemiskinanForm({ formData, setFormData, jorongList, statusOptions }: KemiskinanFormProps) {
  return (
    <div className="grid grid-cols-2 gap-6 py-2">
      {/* Kolom Kiri */}
      <div className="space-y-3">
        <h4 className="font-medium text-sm text-primary border-b pb-1">Data KK</h4>
        
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <Label className="text-xs">Nama KK <span className="text-red-500">*</span></Label>
            <Input value={formData.nama_kk || ""} onChange={(e) => setFormData({ ...formData, nama_kk: e.target.value })} placeholder="Nama kepala keluarga" className="h-8 text-sm" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">NIK KK <span className="text-red-500">*</span></Label>
            <Input value={formData.nik_kk || ""} onChange={(e) => setFormData({ ...formData, nik_kk: e.target.value })} placeholder="16 digit NIK" maxLength={16} className="h-8 text-sm" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <Label className="text-xs">No KK <span className="text-red-500">*</span></Label>
            <Input value={formData.no_kk || ""} onChange={(e) => setFormData({ ...formData, no_kk: e.target.value })} placeholder="16 digit No KK" maxLength={16} className="h-8 text-sm" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Jumlah Anggota</Label>
            <Input type="number" value={formData.jumlah_anggota_keluarga || ""} onChange={(e) => setFormData({ ...formData, jumlah_anggota_keluarga: parseInt(e.target.value) || 0 })} placeholder="0" min={1} className="h-8 text-sm" />
          </div>
        </div>

        <h4 className="font-medium text-sm text-primary border-b pb-1 pt-2">Alamat</h4>

        <div className="space-y-1">
          <Label className="text-xs">Alamat <span className="text-red-500">*</span></Label>
          <Input value={formData.alamat || ""} onChange={(e) => setFormData({ ...formData, alamat: e.target.value })} placeholder="Alamat lengkap" className="h-8 text-sm" />
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div className="space-y-1">
            <Label className="text-xs">Jorong <span className="text-red-500">*</span></Label>
            <Select value={formData.jorong || ""} onValueChange={(v: string) => setFormData({ ...formData, jorong: v })}>
              <SelectTrigger className="h-8 text-sm"><SelectValue placeholder="Pilih" /></SelectTrigger>
              <SelectContent>{jorongList.map((j) => (<SelectItem key={j} value={j}>{j}</SelectItem>))}</SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">RT</Label>
            <Select value={formData.rt || ""} onValueChange={(v: string) => setFormData({ ...formData, rt: v })}>
              <SelectTrigger className="h-8 text-sm"><SelectValue placeholder="RT" /></SelectTrigger>
              <SelectContent>{rtList.map((r) => (<SelectItem key={r} value={r}>{r}</SelectItem>))}</SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">RW</Label>
            <Select value={formData.rw || ""} onValueChange={(v: string) => setFormData({ ...formData, rw: v })}>
              <SelectTrigger className="h-8 text-sm"><SelectValue placeholder="RW" /></SelectTrigger>
              <SelectContent>{rwList.map((r) => (<SelectItem key={r} value={r}>{r}</SelectItem>))}</SelectContent>
            </Select>
          </div>
        </div>

        <h4 className="font-medium text-sm text-primary border-b pb-1 pt-2">Kondisi Rumah</h4>

        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <Label className="text-xs">Status Rumah</Label>
            <Select value={formData.status_rumah || ""} onValueChange={(v: string) => setFormData({ ...formData, status_rumah: v })}>
              <SelectTrigger className="h-8 text-sm"><SelectValue placeholder="Pilih" /></SelectTrigger>
              <SelectContent>{statusRumahOptions.map((s) => (<SelectItem key={s} value={s}>{s}</SelectItem>))}</SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Jenis Lantai</Label>
            <Select value={formData.jenis_lantai || ""} onValueChange={(v: string) => setFormData({ ...formData, jenis_lantai: v })}>
              <SelectTrigger className="h-8 text-sm"><SelectValue placeholder="Pilih" /></SelectTrigger>
              <SelectContent>{jenisLantaiOptions.map((j) => (<SelectItem key={j} value={j}>{j}</SelectItem>))}</SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <Label className="text-xs">Jenis Dinding</Label>
            <Select value={formData.jenis_dinding || ""} onValueChange={(v: string) => setFormData({ ...formData, jenis_dinding: v })}>
              <SelectTrigger className="h-8 text-sm"><SelectValue placeholder="Pilih" /></SelectTrigger>
              <SelectContent>{jenisDindingOptions.map((j) => (<SelectItem key={j} value={j}>{j}</SelectItem>))}</SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Sumber Air</Label>
            <Select value={formData.sumber_air || ""} onValueChange={(v: string) => setFormData({ ...formData, sumber_air: v })}>
              <SelectTrigger className="h-8 text-sm"><SelectValue placeholder="Pilih" /></SelectTrigger>
              <SelectContent>{sumberAirOptions.map((s) => (<SelectItem key={s} value={s}>{s}</SelectItem>))}</SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Kolom Kanan */}
      <div className="space-y-3">
        <h4 className="font-medium text-sm text-primary border-b pb-1">Fasilitas</h4>

        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <Label className="text-xs">Penerangan</Label>
            <Select value={formData.penerangan || ""} onValueChange={(v: string) => setFormData({ ...formData, penerangan: v })}>
              <SelectTrigger className="h-8 text-sm"><SelectValue placeholder="Pilih" /></SelectTrigger>
              <SelectContent>{peneranganOptions.map((p) => (<SelectItem key={p} value={p}>{p}</SelectItem>))}</SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Bahan Bakar</Label>
            <Select value={formData.bahan_bakar_masak || ""} onValueChange={(v: string) => setFormData({ ...formData, bahan_bakar_masak: v })}>
              <SelectTrigger className="h-8 text-sm"><SelectValue placeholder="Pilih" /></SelectTrigger>
              <SelectContent>{bahanBakarOptions.map((b) => (<SelectItem key={b} value={b}>{b}</SelectItem>))}</SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <Label className="text-xs">Kepemilikan Jamban</Label>
            <Select value={formData.kepemilikan_jamban || ""} onValueChange={(v: string) => setFormData({ ...formData, kepemilikan_jamban: v })}>
              <SelectTrigger className="h-8 text-sm"><SelectValue placeholder="Pilih" /></SelectTrigger>
              <SelectContent>{kepemilikanJambanOptions.map((k) => (<SelectItem key={k} value={k}>{k}</SelectItem>))}</SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Penghasilan/Bulan</Label>
            <Input type="number" value={formData.penghasilan_bulanan || ""} onChange={(e) => setFormData({ ...formData, penghasilan_bulanan: parseInt(e.target.value) || 0 })} placeholder="Rp" className="h-8 text-sm" />
          </div>
        </div>

        <h4 className="font-medium text-sm text-primary border-b pb-1 pt-2">Status & Bantuan</h4>

        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <Label className="text-xs">Status <span className="text-red-500">*</span></Label>
            <Select value={formData.status || ""} onValueChange={(v: string) => setFormData({ ...formData, status: v })}>
              <SelectTrigger className="h-8 text-sm"><SelectValue placeholder="Pilih" /></SelectTrigger>
              <SelectContent>{statusOptions.map((s) => (<SelectItem key={s} value={s}>{s}</SelectItem>))}</SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Tahun Data <span className="text-red-500">*</span></Label>
            <Select value={String(formData.tahun_data || new Date().getFullYear())} onValueChange={(v: string) => setFormData({ ...formData, tahun_data: parseInt(v) })}>
              <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>{tahunList.map((t) => (<SelectItem key={t} value={String(t)}>{t}</SelectItem>))}</SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center space-x-2">
            <Checkbox id="penerima_bantuan" checked={formData.penerima_bantuan || false} onCheckedChange={(checked: CheckedState) => setFormData({ ...formData, penerima_bantuan: checked === true })} />
            <Label htmlFor="penerima_bantuan" className="text-xs font-normal cursor-pointer">Penerima Bantuan</Label>
          </div>
          {formData.penerima_bantuan && (
            <Select value={formData.jenis_bantuan || ""} onValueChange={(v: string) => setFormData({ ...formData, jenis_bantuan: v })}>
              <SelectTrigger className="h-8 text-sm flex-1"><SelectValue placeholder="Jenis bantuan" /></SelectTrigger>
              <SelectContent>{jenisBantuanOptions.map((j) => (<SelectItem key={j} value={j}>{j}</SelectItem>))}</SelectContent>
            </Select>
          )}
        </div>

        <div className="space-y-1">
          <Label className="text-xs">Keterangan</Label>
          <Textarea value={formData.keterangan || ""} onChange={(e) => setFormData({ ...formData, keterangan: e.target.value })} placeholder="Keterangan tambahan" rows={2} className="text-sm resize-none" />
        </div>
      </div>
    </div>
  );
}
