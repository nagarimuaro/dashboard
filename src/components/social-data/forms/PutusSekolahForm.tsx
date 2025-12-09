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

interface PutusSekolahFormData {
  nama_anak?: string;
  nik?: string;
  tanggal_lahir?: string;
  jenis_kelamin?: string;
  nama_ortu?: string;
  alamat?: string;
  jorong?: string;
  rt?: string;
  rw?: string;
  jenjang_terakhir?: string;
  kelas_terakhir?: string;
  nama_sekolah_terakhir?: string;
  tahun_putus?: number;
  alasan_putus?: string;
  status_bekerja?: boolean;
  jenis_pekerjaan?: string;
  dalam_program_kembali?: boolean;
  nama_program?: string;
  status?: string;
  tahun_data?: number;
  keterangan?: string;
  [key: string]: string | number | boolean | undefined;
}

interface PutusSekolahFormProps {
  formData: Partial<PutusSekolahFormData>;
  setFormData: React.Dispatch<React.SetStateAction<Partial<PutusSekolahFormData>>>;
  jorongList: string[];
  statusOptions: string[];
}

const rtList = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10"];
const rwList = ["01", "02", "03", "04", "05"];
const tahunList = [2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015];
const jenisKelaminOptions = [
  { value: "L", label: "Laki-laki" },
  { value: "P", label: "Perempuan" },
];
const jenjangOptions = ["SD", "SMP", "SMA", "SMK"];
const kelasOptions = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"];
const alasanPutusOptions = ["Ekonomi", "Menikah", "Bekerja", "Tidak Berminat", "Jarak", "Kesehatan", "Lainnya"];
const jenisPekerjaanOptions = ["Tani", "Buruh", "Dagang", "Nelayan", "Tidak Bekerja", "Lainnya"];
const programKembaliOptions = ["Kejar Paket A", "Kejar Paket B", "Kejar Paket C", "Kursus", "Lainnya"];

export default function PutusSekolahForm({ formData, setFormData, jorongList, statusOptions }: PutusSekolahFormProps) {
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

        <div className="space-y-1">
          <Label className="text-xs">Nama Orang Tua</Label>
          <Input value={formData.nama_ortu || ""} onChange={(e) => setFormData({ ...formData, nama_ortu: e.target.value })} placeholder="Nama orang tua/wali" className="h-8 text-sm" />
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
        <h4 className="font-medium text-sm text-primary border-b pb-1">Data Sekolah</h4>

        <div className="grid grid-cols-3 gap-2">
          <div className="space-y-1">
            <Label className="text-xs">Jenjang Terakhir <span className="text-red-500">*</span></Label>
            <Select value={formData.jenjang_terakhir || ""} onValueChange={(v: string) => setFormData({ ...formData, jenjang_terakhir: v })}>
              <SelectTrigger className="h-8 text-sm"><SelectValue placeholder="Pilih" /></SelectTrigger>
              <SelectContent>{jenjangOptions.map((j) => (<SelectItem key={j} value={j}>{j}</SelectItem>))}</SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Kelas Terakhir</Label>
            <Select value={formData.kelas_terakhir || ""} onValueChange={(v: string) => setFormData({ ...formData, kelas_terakhir: v })}>
              <SelectTrigger className="h-8 text-sm"><SelectValue placeholder="Kelas" /></SelectTrigger>
              <SelectContent>{kelasOptions.map((k) => (<SelectItem key={k} value={k}>{k}</SelectItem>))}</SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Tahun Putus <span className="text-red-500">*</span></Label>
            <Select value={String(formData.tahun_putus || "")} onValueChange={(v: string) => setFormData({ ...formData, tahun_putus: parseInt(v) })}>
              <SelectTrigger className="h-8 text-sm"><SelectValue placeholder="Tahun" /></SelectTrigger>
              <SelectContent>{tahunList.map((t) => (<SelectItem key={t} value={String(t)}>{t}</SelectItem>))}</SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <Label className="text-xs">Nama Sekolah</Label>
            <Input value={formData.nama_sekolah_terakhir || ""} onChange={(e) => setFormData({ ...formData, nama_sekolah_terakhir: e.target.value })} placeholder="Nama sekolah" className="h-8 text-sm" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Alasan Putus <span className="text-red-500">*</span></Label>
            <Select value={formData.alasan_putus || ""} onValueChange={(v: string) => setFormData({ ...formData, alasan_putus: v })}>
              <SelectTrigger className="h-8 text-sm"><SelectValue placeholder="Pilih" /></SelectTrigger>
              <SelectContent>{alasanPutusOptions.map((a) => (<SelectItem key={a} value={a}>{a}</SelectItem>))}</SelectContent>
            </Select>
          </div>
        </div>

        <h4 className="font-medium text-sm text-primary border-b pb-1 pt-2">Status Saat Ini</h4>

        <div className="flex items-center gap-4">
          <div className="flex items-center space-x-2">
            <Checkbox id="status_bekerja" checked={formData.status_bekerja || false} onCheckedChange={(checked: CheckedState) => setFormData({ ...formData, status_bekerja: checked === true })} />
            <Label htmlFor="status_bekerja" className="text-xs font-normal cursor-pointer">Sudah Bekerja</Label>
          </div>
          {formData.status_bekerja && (
            <Select value={formData.jenis_pekerjaan || ""} onValueChange={(v: string) => setFormData({ ...formData, jenis_pekerjaan: v })}>
              <SelectTrigger className="h-8 text-sm flex-1"><SelectValue placeholder="Jenis pekerjaan" /></SelectTrigger>
              <SelectContent>{jenisPekerjaanOptions.map((j) => (<SelectItem key={j} value={j}>{j}</SelectItem>))}</SelectContent>
            </Select>
          )}
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center space-x-2">
            <Checkbox id="dalam_program" checked={formData.dalam_program_kembali || false} onCheckedChange={(checked: CheckedState) => setFormData({ ...formData, dalam_program_kembali: checked === true })} />
            <Label htmlFor="dalam_program" className="text-xs font-normal cursor-pointer">Dalam Program Kembali</Label>
          </div>
          {formData.dalam_program_kembali && (
            <Select value={formData.nama_program || ""} onValueChange={(v: string) => setFormData({ ...formData, nama_program: v })}>
              <SelectTrigger className="h-8 text-sm flex-1"><SelectValue placeholder="Nama program" /></SelectTrigger>
              <SelectContent>{programKembaliOptions.map((p) => (<SelectItem key={p} value={p}>{p}</SelectItem>))}</SelectContent>
            </Select>
          )}
        </div>

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

        <div className="space-y-1">
          <Label className="text-xs">Keterangan</Label>
          <Textarea value={formData.keterangan || ""} onChange={(e) => setFormData({ ...formData, keterangan: e.target.value })} placeholder="Keterangan tambahan" rows={2} className="text-sm resize-none" />
        </div>
      </div>
    </div>
  );
}
