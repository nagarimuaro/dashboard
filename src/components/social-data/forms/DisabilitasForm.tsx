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

interface DisabilitasFormData {
  nama?: string;
  nik?: string;
  tanggal_lahir?: string;
  jenis_kelamin?: string;
  alamat?: string;
  jorong?: string;
  rt?: string;
  rw?: string;
  jenis_disabilitas?: string;
  penyebab_disabilitas?: string;
  tingkat_keparahan?: string;
  memiliki_kartu_disabilitas?: boolean;
  nomor_kartu_disabilitas?: string;
  kebutuhan_alat_bantu?: string;
  status_pekerjaan?: string;
  pendidikan_terakhir?: string;
  nama_pendamping?: string;
  status?: string;
  penerima_bantuan?: boolean;
  jenis_bantuan?: string;
  tahun_data?: number;
  keterangan?: string;
  [key: string]: string | number | boolean | undefined;
}

interface DisabilitasFormProps {
  formData: Partial<DisabilitasFormData>;
  setFormData: React.Dispatch<React.SetStateAction<Partial<DisabilitasFormData>>>;
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
const jenisDisabilitasOptions = ["Fisik", "Intelektual", "Mental", "Sensorik", "Ganda"];
const penyebabOptions = ["Bawaan Lahir", "Kecelakaan", "Penyakit", "Lainnya"];
const tingkatOptions = ["Ringan", "Sedang", "Berat"];
const alatBantuOptions = ["Kursi Roda", "Kruk", "Tongkat", "Alat Dengar", "Kacamata", "Tidak Perlu", "Lainnya"];
const statusPekerjaanOptions = ["Bekerja", "Tidak Bekerja", "Pelajar", "Pensiunan"];
const pendidikanOptions = ["Tidak Sekolah", "SD", "SMP", "SMA", "D3", "S1", "S2", "S3"];
const jenisBantuanOptions = ["PKH", "BPNT", "BST", "BLT", "Alat Bantu", "Lainnya"];

export default function DisabilitasForm({ formData, setFormData, jorongList, statusOptions }: DisabilitasFormProps) {
  return (
    <div className="grid grid-cols-2 gap-6 py-2">
      {/* Kolom Kiri */}
      <div className="space-y-3">
        <h4 className="font-medium text-sm text-primary border-b pb-1">Data Pribadi</h4>
        
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <Label className="text-xs">Nama <span className="text-red-500">*</span></Label>
            <Input value={formData.nama || ""} onChange={(e) => setFormData({ ...formData, nama: e.target.value })} placeholder="Nama lengkap" className="h-8 text-sm" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">NIK <span className="text-red-500">*</span></Label>
            <Input value={formData.nik || ""} onChange={(e) => setFormData({ ...formData, nik: e.target.value })} placeholder="16 digit NIK" maxLength={16} className="h-8 text-sm" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <Label className="text-xs">Tgl Lahir</Label>
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

        <h4 className="font-medium text-sm text-primary border-b pb-1 pt-2">Data Disabilitas</h4>

        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <Label className="text-xs">Jenis Disabilitas <span className="text-red-500">*</span></Label>
            <Select value={formData.jenis_disabilitas || ""} onValueChange={(v: string) => setFormData({ ...formData, jenis_disabilitas: v })}>
              <SelectTrigger className="h-8 text-sm"><SelectValue placeholder="Pilih" /></SelectTrigger>
              <SelectContent>{jenisDisabilitasOptions.map((j) => (<SelectItem key={j} value={j}>{j}</SelectItem>))}</SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Penyebab</Label>
            <Select value={formData.penyebab_disabilitas || ""} onValueChange={(v: string) => setFormData({ ...formData, penyebab_disabilitas: v })}>
              <SelectTrigger className="h-8 text-sm"><SelectValue placeholder="Pilih" /></SelectTrigger>
              <SelectContent>{penyebabOptions.map((p) => (<SelectItem key={p} value={p}>{p}</SelectItem>))}</SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <Label className="text-xs">Tingkat Keparahan</Label>
            <Select value={formData.tingkat_keparahan || ""} onValueChange={(v: string) => setFormData({ ...formData, tingkat_keparahan: v })}>
              <SelectTrigger className="h-8 text-sm"><SelectValue placeholder="Pilih" /></SelectTrigger>
              <SelectContent>{tingkatOptions.map((t) => (<SelectItem key={t} value={t}>{t}</SelectItem>))}</SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Alat Bantu</Label>
            <Select value={formData.kebutuhan_alat_bantu || ""} onValueChange={(v: string) => setFormData({ ...formData, kebutuhan_alat_bantu: v })}>
              <SelectTrigger className="h-8 text-sm"><SelectValue placeholder="Pilih" /></SelectTrigger>
              <SelectContent>{alatBantuOptions.map((a) => (<SelectItem key={a} value={a}>{a}</SelectItem>))}</SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Kolom Kanan */}
      <div className="space-y-3">
        <h4 className="font-medium text-sm text-primary border-b pb-1">Kartu Disabilitas</h4>

        <div className="flex items-center gap-4">
          <div className="flex items-center space-x-2">
            <Checkbox id="memiliki_kartu" checked={formData.memiliki_kartu_disabilitas || false} onCheckedChange={(checked: CheckedState) => setFormData({ ...formData, memiliki_kartu_disabilitas: checked === true })} />
            <Label htmlFor="memiliki_kartu" className="text-xs font-normal cursor-pointer">Memiliki Kartu Disabilitas</Label>
          </div>
          {formData.memiliki_kartu_disabilitas && (
            <Input value={formData.nomor_kartu_disabilitas || ""} onChange={(e) => setFormData({ ...formData, nomor_kartu_disabilitas: e.target.value })} placeholder="Nomor kartu" className="h-8 text-sm flex-1" />
          )}
        </div>

        <h4 className="font-medium text-sm text-primary border-b pb-1 pt-2">Status & Pendidikan</h4>

        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <Label className="text-xs">Status Pekerjaan</Label>
            <Select value={formData.status_pekerjaan || ""} onValueChange={(v: string) => setFormData({ ...formData, status_pekerjaan: v })}>
              <SelectTrigger className="h-8 text-sm"><SelectValue placeholder="Pilih" /></SelectTrigger>
              <SelectContent>{statusPekerjaanOptions.map((s) => (<SelectItem key={s} value={s}>{s}</SelectItem>))}</SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Pendidikan</Label>
            <Select value={formData.pendidikan_terakhir || ""} onValueChange={(v: string) => setFormData({ ...formData, pendidikan_terakhir: v })}>
              <SelectTrigger className="h-8 text-sm"><SelectValue placeholder="Pilih" /></SelectTrigger>
              <SelectContent>{pendidikanOptions.map((p) => (<SelectItem key={p} value={p}>{p}</SelectItem>))}</SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-1">
          <Label className="text-xs">Nama Pendamping</Label>
          <Input value={formData.nama_pendamping || ""} onChange={(e) => setFormData({ ...formData, nama_pendamping: e.target.value })} placeholder="Nama pendamping" className="h-8 text-sm" />
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
