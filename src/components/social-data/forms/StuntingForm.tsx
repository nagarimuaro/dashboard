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

interface StuntingFormData {
  nama_anak?: string;
  nik_anak?: string;
  tanggal_lahir?: string;
  jenis_kelamin?: string;
  nama_ibu?: string;
  nama_ayah?: string;
  alamat?: string;
  jorong?: string;
  rt?: string;
  rw?: string;
  posyandu?: string;
  usia_bulan?: number;
  berat_badan?: number;
  tinggi_badan?: number;
  lingkar_kepala?: number;
  status?: string;
  status_gizi?: string;
  dalam_intervensi?: boolean;
  jenis_intervensi?: string;
  tanggal_pengukuran?: string;
  tahun_data?: number;
  keterangan?: string;
  [key: string]: string | number | boolean | undefined;
}

interface StuntingFormProps {
  formData: Partial<StuntingFormData>;
  setFormData: React.Dispatch<React.SetStateAction<Partial<StuntingFormData>>>;
  jorongList: string[];
  statusOptions: string[];
}

const rtList = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10"];
const rwList = ["01", "02", "03", "04", "05"];
const tahunList = [2025, 2024, 2023, 2022, 2021, 2020];
const jenisKelaminOptions = [
  { value: "L", label: "Laki-laki" },
  { value: "P", label: "Perempuan" },
];
const statusGiziOptions = ["Gizi Baik", "Gizi Kurang", "Gizi Buruk", "Gizi Lebih"];
const jenisIntervensiOptions = ["PMT", "Vitamin A", "Suplementasi", "Konseling Gizi", "Rujukan", "Lainnya"];

export default function StuntingForm({ formData, setFormData, jorongList, statusOptions }: StuntingFormProps) {
  return (
    <div className="grid grid-cols-2 gap-6 py-2">
      {/* Kolom Kiri */}
      <div className="space-y-3">
        <h4 className="font-medium text-sm text-primary border-b pb-1">Data Anak</h4>
        
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <Label className="text-xs">Nama Anak <span className="text-red-500">*</span></Label>
            <Input value={formData.nama_anak || ""} onChange={(e) => setFormData({ ...formData, nama_anak: e.target.value })} placeholder="Nama lengkap" className="h-8 text-sm" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">NIK Anak</Label>
            <Input value={formData.nik_anak || ""} onChange={(e) => setFormData({ ...formData, nik_anak: e.target.value })} placeholder="16 digit NIK" maxLength={16} className="h-8 text-sm" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <Label className="text-xs">Tgl Lahir <span className="text-red-500">*</span></Label>
            <Input type="date" value={formData.tanggal_lahir?.split('T')[0] || ""} onChange={(e) => setFormData({ ...formData, tanggal_lahir: e.target.value })} className="h-8 text-sm" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Jenis Kelamin <span className="text-red-500">*</span></Label>
            <Select value={formData.jenis_kelamin || ""} onValueChange={(v: string) => setFormData({ ...formData, jenis_kelamin: v })}>
              <SelectTrigger className="h-8 text-sm"><SelectValue placeholder="Pilih" /></SelectTrigger>
              <SelectContent>{jenisKelaminOptions.map((jk) => (<SelectItem key={jk.value} value={jk.value}>{jk.label}</SelectItem>))}</SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <Label className="text-xs">Nama Ibu</Label>
            <Input value={formData.nama_ibu || ""} onChange={(e) => setFormData({ ...formData, nama_ibu: e.target.value })} placeholder="Nama ibu" className="h-8 text-sm" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Nama Ayah</Label>
            <Input value={formData.nama_ayah || ""} onChange={(e) => setFormData({ ...formData, nama_ayah: e.target.value })} placeholder="Nama ayah" className="h-8 text-sm" />
          </div>
        </div>

        <h4 className="font-medium text-sm text-primary border-b pb-1 pt-2">Alamat</h4>
        
        <div className="space-y-1">
          <Label className="text-xs">Alamat <span className="text-red-500">*</span></Label>
          <Input value={formData.alamat || ""} onChange={(e) => setFormData({ ...formData, alamat: e.target.value })} placeholder="Alamat lengkap" className="h-8 text-sm" />
        </div>

        <div className="grid grid-cols-4 gap-2">
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
          <div className="space-y-1">
            <Label className="text-xs">Posyandu</Label>
            <Input value={formData.posyandu || ""} onChange={(e) => setFormData({ ...formData, posyandu: e.target.value })} placeholder="Posyandu" className="h-8 text-sm" />
          </div>
        </div>
      </div>

      {/* Kolom Kanan */}
      <div className="space-y-3">
        <h4 className="font-medium text-sm text-primary border-b pb-1">Data Pengukuran</h4>
        
        <div className="grid grid-cols-4 gap-2">
          <div className="space-y-1">
            <Label className="text-xs">Usia (bln)</Label>
            <Input type="number" value={formData.usia_bulan || ""} onChange={(e) => setFormData({ ...formData, usia_bulan: parseInt(e.target.value) || 0 })} placeholder="0" min={0} max={60} className="h-8 text-sm" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Berat (kg) <span className="text-red-500">*</span></Label>
            <Input type="number" step="0.1" value={formData.berat_badan || ""} onChange={(e) => setFormData({ ...formData, berat_badan: parseFloat(e.target.value) || 0 })} placeholder="0.0" className="h-8 text-sm" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Tinggi (cm) <span className="text-red-500">*</span></Label>
            <Input type="number" step="0.1" value={formData.tinggi_badan || ""} onChange={(e) => setFormData({ ...formData, tinggi_badan: parseFloat(e.target.value) || 0 })} placeholder="0.0" className="h-8 text-sm" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">L. Kepala</Label>
            <Input type="number" step="0.1" value={formData.lingkar_kepala || ""} onChange={(e) => setFormData({ ...formData, lingkar_kepala: parseFloat(e.target.value) || 0 })} placeholder="0.0" className="h-8 text-sm" />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div className="space-y-1">
            <Label className="text-xs">Status <span className="text-red-500">*</span></Label>
            <Select value={formData.status || ""} onValueChange={(v: string) => setFormData({ ...formData, status: v })}>
              <SelectTrigger className="h-8 text-sm"><SelectValue placeholder="Pilih" /></SelectTrigger>
              <SelectContent>{statusOptions.map((s) => (<SelectItem key={s} value={s}>{s}</SelectItem>))}</SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Status Gizi</Label>
            <Select value={formData.status_gizi || ""} onValueChange={(v: string) => setFormData({ ...formData, status_gizi: v })}>
              <SelectTrigger className="h-8 text-sm"><SelectValue placeholder="Pilih" /></SelectTrigger>
              <SelectContent>{statusGiziOptions.map((s) => (<SelectItem key={s} value={s}>{s}</SelectItem>))}</SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Tgl Ukur</Label>
            <Input type="date" value={formData.tanggal_pengukuran?.split('T')[0] || ""} onChange={(e) => setFormData({ ...formData, tanggal_pengukuran: e.target.value })} className="h-8 text-sm" />
          </div>
        </div>

        <h4 className="font-medium text-sm text-primary border-b pb-1 pt-2">Intervensi & Lainnya</h4>

        <div className="flex items-center gap-4">
          <div className="flex items-center space-x-2">
            <Checkbox id="dalam_intervensi" checked={formData.dalam_intervensi || false} onCheckedChange={(checked: CheckedState) => setFormData({ ...formData, dalam_intervensi: checked === true })} />
            <Label htmlFor="dalam_intervensi" className="text-xs font-normal cursor-pointer">Dalam intervensi</Label>
          </div>
          {formData.dalam_intervensi && (
            <Select value={formData.jenis_intervensi || ""} onValueChange={(v: string) => setFormData({ ...formData, jenis_intervensi: v })}>
              <SelectTrigger className="h-8 text-sm flex-1"><SelectValue placeholder="Jenis intervensi" /></SelectTrigger>
              <SelectContent>{jenisIntervensiOptions.map((j) => (<SelectItem key={j} value={j}>{j}</SelectItem>))}</SelectContent>
            </Select>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <Label className="text-xs">Tahun Data <span className="text-red-500">*</span></Label>
            <Select value={String(formData.tahun_data || new Date().getFullYear())} onValueChange={(v: string) => setFormData({ ...formData, tahun_data: parseInt(v) })}>
              <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>{tahunList.map((t) => (<SelectItem key={t} value={String(t)}>{t}</SelectItem>))}</SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-1">
          <Label className="text-xs">Keterangan</Label>
          <Textarea value={formData.keterangan || ""} onChange={(e) => setFormData({ ...formData, keterangan: e.target.value })} placeholder="Keterangan tambahan" rows={2} className="text-sm resize-none" />
        </div>
      </div>
    </div>
  );
}
