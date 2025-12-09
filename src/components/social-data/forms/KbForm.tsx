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

interface KbFormData {
  nama_peserta?: string;
  nik?: string;
  nama_pasangan?: string;
  nik_pasangan?: string;
  tanggal_lahir?: string;
  alamat?: string;
  jorong?: string;
  rt?: string;
  rw?: string;
  jenis_kontrasepsi?: string;
  tanggal_mulai_kb?: string;
  status_peserta?: string;
  tempat_pelayanan?: string;
  nama_petugas?: string;
  efek_samping?: boolean;
  keterangan_efek_samping?: string;
  status?: string;
  tahun_data?: number;
  keterangan?: string;
  [key: string]: string | number | boolean | undefined;
}

interface KbFormProps {
  formData: Partial<KbFormData>;
  setFormData: React.Dispatch<React.SetStateAction<Partial<KbFormData>>>;
  jorongList: string[];
  statusOptions: string[];
}

const rtList = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10"];
const rwList = ["01", "02", "03", "04", "05"];
const tahunList = [2025, 2024, 2023, 2022, 2021, 2020];
const jenisKontrasepsiOptions = ["Pil", "Suntik", "Implant", "IUD", "Kondom", "MOW", "MOP", "MAL"];
const statusPesertaOptions = ["Aktif", "Drop Out", "Pindah", "Hamil", "Meninggal"];
const tempatPelayananOptions = ["Puskesmas", "Posyandu", "Bidan Desa", "RSUD", "Klinik", "Lainnya"];

export default function KbForm({ formData, setFormData, jorongList, statusOptions }: KbFormProps) {
  return (
    <div className="grid grid-cols-2 gap-6 py-2">
      {/* Kolom Kiri */}
      <div className="space-y-3">
        <h4 className="font-medium text-sm text-primary border-b pb-1">Data Peserta</h4>
        
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <Label className="text-xs">Nama Peserta <span className="text-red-500">*</span></Label>
            <Input value={formData.nama_peserta || ""} onChange={(e) => setFormData({ ...formData, nama_peserta: e.target.value })} placeholder="Nama lengkap" className="h-8 text-sm" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">NIK <span className="text-red-500">*</span></Label>
            <Input value={formData.nik || ""} onChange={(e) => setFormData({ ...formData, nik: e.target.value })} placeholder="16 digit NIK" maxLength={16} className="h-8 text-sm" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <Label className="text-xs">Nama Pasangan</Label>
            <Input value={formData.nama_pasangan || ""} onChange={(e) => setFormData({ ...formData, nama_pasangan: e.target.value })} placeholder="Nama pasangan" className="h-8 text-sm" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">NIK Pasangan</Label>
            <Input value={formData.nik_pasangan || ""} onChange={(e) => setFormData({ ...formData, nik_pasangan: e.target.value })} placeholder="16 digit NIK" maxLength={16} className="h-8 text-sm" />
          </div>
        </div>

        <div className="space-y-1">
          <Label className="text-xs">Tanggal Lahir</Label>
          <Input type="date" value={formData.tanggal_lahir?.split('T')[0] || ""} onChange={(e) => setFormData({ ...formData, tanggal_lahir: e.target.value })} className="h-8 text-sm" />
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
      </div>

      {/* Kolom Kanan */}
      <div className="space-y-3">
        <h4 className="font-medium text-sm text-primary border-b pb-1">Data KB</h4>

        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <Label className="text-xs">Jenis Kontrasepsi <span className="text-red-500">*</span></Label>
            <Select value={formData.jenis_kontrasepsi || ""} onValueChange={(v: string) => setFormData({ ...formData, jenis_kontrasepsi: v })}>
              <SelectTrigger className="h-8 text-sm"><SelectValue placeholder="Pilih" /></SelectTrigger>
              <SelectContent>{jenisKontrasepsiOptions.map((j) => (<SelectItem key={j} value={j}>{j}</SelectItem>))}</SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Tgl Mulai KB</Label>
            <Input type="date" value={formData.tanggal_mulai_kb?.split('T')[0] || ""} onChange={(e) => setFormData({ ...formData, tanggal_mulai_kb: e.target.value })} className="h-8 text-sm" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <Label className="text-xs">Status Peserta <span className="text-red-500">*</span></Label>
            <Select value={formData.status_peserta || ""} onValueChange={(v: string) => setFormData({ ...formData, status_peserta: v })}>
              <SelectTrigger className="h-8 text-sm"><SelectValue placeholder="Pilih" /></SelectTrigger>
              <SelectContent>{statusPesertaOptions.map((s) => (<SelectItem key={s} value={s}>{s}</SelectItem>))}</SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Tempat Pelayanan</Label>
            <Select value={formData.tempat_pelayanan || ""} onValueChange={(v: string) => setFormData({ ...formData, tempat_pelayanan: v })}>
              <SelectTrigger className="h-8 text-sm"><SelectValue placeholder="Pilih" /></SelectTrigger>
              <SelectContent>{tempatPelayananOptions.map((t) => (<SelectItem key={t} value={t}>{t}</SelectItem>))}</SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-1">
          <Label className="text-xs">Nama Petugas</Label>
          <Input value={formData.nama_petugas || ""} onChange={(e) => setFormData({ ...formData, nama_petugas: e.target.value })} placeholder="Nama petugas KB" className="h-8 text-sm" />
        </div>

        <h4 className="font-medium text-sm text-primary border-b pb-1 pt-2">Status & Efek Samping</h4>

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
            <Checkbox id="efek_samping" checked={formData.efek_samping || false} onCheckedChange={(checked: CheckedState) => setFormData({ ...formData, efek_samping: checked === true })} />
            <Label htmlFor="efek_samping" className="text-xs font-normal cursor-pointer">Ada Efek Samping</Label>
          </div>
          {formData.efek_samping && (
            <Input value={formData.keterangan_efek_samping || ""} onChange={(e) => setFormData({ ...formData, keterangan_efek_samping: e.target.value })} placeholder="Keterangan efek samping" className="h-8 text-sm flex-1" />
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
