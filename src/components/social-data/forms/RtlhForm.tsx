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

interface RtlhFormData {
  nama_pemilik?: string;
  nik?: string;
  alamat?: string;
  jorong?: string;
  rt?: string;
  rw?: string;
  kondisi_atap?: string;
  kondisi_dinding?: string;
  kondisi_lantai?: string;
  luas_bangunan?: number;
  status_kepemilikan?: string;
  tahun_bangun?: number;
  jumlah_penghuni?: number;
  sumber_air?: string;
  jamban?: string;
  penerangan?: string;
  status?: string;
  sudah_dapat_bantuan?: boolean;
  tahun_bantuan?: number;
  sumber_bantuan?: string;
  tahun_data?: number;
  keterangan?: string;
  [key: string]: string | number | boolean | undefined;
}

interface RtlhFormProps {
  formData: Partial<RtlhFormData>;
  setFormData: React.Dispatch<React.SetStateAction<Partial<RtlhFormData>>>;
  jorongList: string[];
  statusOptions: string[];
}

const rtList = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10"];
const rwList = ["01", "02", "03", "04", "05"];
const tahunList = [2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015];
const kondisiAtapOptions = ["Baik", "Rusak Ringan", "Rusak Sedang", "Rusak Berat"];
const kondisiDindingOptions = ["Tembok", "Kayu", "Bambu", "Campuran", "Lainnya"];
const kondisiLantaiOptions = ["Keramik", "Ubin", "Semen", "Papan", "Tanah"];
const statusKepemilikanOptions = ["Milik Sendiri", "Sewa", "Menumpang", "Lainnya"];
const sumberAirOptions = ["PDAM", "Sumur", "Mata Air", "Sungai", "Lainnya"];
const jambanOptions = ["Milik Sendiri", "Bersama", "Umum", "Tidak Ada"];
const peneranganOptions = ["PLN", "Non-PLN", "Tidak Ada"];
const sumberBantuanOptions = ["APBD", "APBN", "CSR", "Lainnya"];

export default function RtlhForm({ formData, setFormData, jorongList, statusOptions }: RtlhFormProps) {
  return (
    <div className="grid grid-cols-2 gap-6 py-2">
      {/* Kolom Kiri */}
      <div className="space-y-3">
        <h4 className="font-medium text-sm text-primary border-b pb-1">Data Pemilik</h4>
        
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <Label className="text-xs">Nama Pemilik <span className="text-red-500">*</span></Label>
            <Input value={formData.nama_pemilik || ""} onChange={(e) => setFormData({ ...formData, nama_pemilik: e.target.value })} placeholder="Nama lengkap" className="h-8 text-sm" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">NIK <span className="text-red-500">*</span></Label>
            <Input value={formData.nik || ""} onChange={(e) => setFormData({ ...formData, nik: e.target.value })} placeholder="16 digit NIK" maxLength={16} className="h-8 text-sm" />
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

        <div className="grid grid-cols-3 gap-2">
          <div className="space-y-1">
            <Label className="text-xs">Kondisi Atap <span className="text-red-500">*</span></Label>
            <Select value={formData.kondisi_atap || ""} onValueChange={(v: string) => setFormData({ ...formData, kondisi_atap: v })}>
              <SelectTrigger className="h-8 text-sm"><SelectValue placeholder="Pilih" /></SelectTrigger>
              <SelectContent>{kondisiAtapOptions.map((k) => (<SelectItem key={k} value={k}>{k}</SelectItem>))}</SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Kondisi Dinding <span className="text-red-500">*</span></Label>
            <Select value={formData.kondisi_dinding || ""} onValueChange={(v: string) => setFormData({ ...formData, kondisi_dinding: v })}>
              <SelectTrigger className="h-8 text-sm"><SelectValue placeholder="Pilih" /></SelectTrigger>
              <SelectContent>{kondisiDindingOptions.map((k) => (<SelectItem key={k} value={k}>{k}</SelectItem>))}</SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Kondisi Lantai <span className="text-red-500">*</span></Label>
            <Select value={formData.kondisi_lantai || ""} onValueChange={(v: string) => setFormData({ ...formData, kondisi_lantai: v })}>
              <SelectTrigger className="h-8 text-sm"><SelectValue placeholder="Pilih" /></SelectTrigger>
              <SelectContent>{kondisiLantaiOptions.map((k) => (<SelectItem key={k} value={k}>{k}</SelectItem>))}</SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div className="space-y-1">
            <Label className="text-xs">Luas (m²)</Label>
            <Input type="number" value={formData.luas_bangunan || ""} onChange={(e) => setFormData({ ...formData, luas_bangunan: parseInt(e.target.value) || 0 })} placeholder="0" className="h-8 text-sm" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Tahun Bangun</Label>
            <Input type="number" value={formData.tahun_bangun || ""} onChange={(e) => setFormData({ ...formData, tahun_bangun: parseInt(e.target.value) || 0 })} placeholder="2000" min={1900} max={2025} className="h-8 text-sm" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Jml Penghuni</Label>
            <Input type="number" value={formData.jumlah_penghuni || ""} onChange={(e) => setFormData({ ...formData, jumlah_penghuni: parseInt(e.target.value) || 0 })} placeholder="0" min={1} className="h-8 text-sm" />
          </div>
        </div>
      </div>

      {/* Kolom Kanan */}
      <div className="space-y-3">
        <h4 className="font-medium text-sm text-primary border-b pb-1">Fasilitas</h4>

        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <Label className="text-xs">Status Kepemilikan</Label>
            <Select value={formData.status_kepemilikan || ""} onValueChange={(v: string) => setFormData({ ...formData, status_kepemilikan: v })}>
              <SelectTrigger className="h-8 text-sm"><SelectValue placeholder="Pilih" /></SelectTrigger>
              <SelectContent>{statusKepemilikanOptions.map((s) => (<SelectItem key={s} value={s}>{s}</SelectItem>))}</SelectContent>
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

        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <Label className="text-xs">Jamban</Label>
            <Select value={formData.jamban || ""} onValueChange={(v: string) => setFormData({ ...formData, jamban: v })}>
              <SelectTrigger className="h-8 text-sm"><SelectValue placeholder="Pilih" /></SelectTrigger>
              <SelectContent>{jambanOptions.map((j) => (<SelectItem key={j} value={j}>{j}</SelectItem>))}</SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Penerangan</Label>
            <Select value={formData.penerangan || ""} onValueChange={(v: string) => setFormData({ ...formData, penerangan: v })}>
              <SelectTrigger className="h-8 text-sm"><SelectValue placeholder="Pilih" /></SelectTrigger>
              <SelectContent>{peneranganOptions.map((p) => (<SelectItem key={p} value={p}>{p}</SelectItem>))}</SelectContent>
            </Select>
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
            <Checkbox id="sudah_dapat_bantuan" checked={formData.sudah_dapat_bantuan || false} onCheckedChange={(checked: CheckedState) => setFormData({ ...formData, sudah_dapat_bantuan: checked === true })} />
            <Label htmlFor="sudah_dapat_bantuan" className="text-xs font-normal cursor-pointer">Sudah Dapat Bantuan</Label>
          </div>
        </div>

        {formData.sudah_dapat_bantuan && (
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label className="text-xs">Tahun Bantuan</Label>
              <Select value={String(formData.tahun_bantuan || "")} onValueChange={(v: string) => setFormData({ ...formData, tahun_bantuan: parseInt(v) })}>
                <SelectTrigger className="h-8 text-sm"><SelectValue placeholder="Pilih" /></SelectTrigger>
                <SelectContent>{tahunList.map((t) => (<SelectItem key={t} value={String(t)}>{t}</SelectItem>))}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Sumber Bantuan</Label>
              <Select value={formData.sumber_bantuan || ""} onValueChange={(v: string) => setFormData({ ...formData, sumber_bantuan: v })}>
                <SelectTrigger className="h-8 text-sm"><SelectValue placeholder="Pilih" /></SelectTrigger>
                <SelectContent>{sumberBantuanOptions.map((s) => (<SelectItem key={s} value={s}>{s}</SelectItem>))}</SelectContent>
              </Select>
            </div>
          </div>
        )}

        <div className="space-y-1">
          <Label className="text-xs">Keterangan</Label>
          <Textarea value={formData.keterangan || ""} onChange={(e) => setFormData({ ...formData, keterangan: e.target.value })} placeholder="Keterangan tambahan" rows={2} className="text-sm resize-none" />
        </div>
      </div>
    </div>
  );
}
