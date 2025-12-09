import React, { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Textarea } from "./ui/textarea"
import { Switch } from "./ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs"
import { 
  Settings as SettingsIcon,
  Building2,
  FileText,
  Upload,
  Save,
  Bell,
  Mail,
  Shield,
  Database,
  Palette,
  Globe,
  Clock,
  Users
} from "lucide-react"

interface SettingsProps {
  userRole: 'admin_global' | 'admin_nagari' | 'staff_nagari' | 'warga'
}

export function Settings({ userRole }: SettingsProps) {
  const [isLoading, setIsLoading] = useState(false)

  // Mock data settings
  const nagariSettings = {
    nama: "Nagari Koto Baru",
    kode: "13.71.01.2001",
    alamat: "Jl. Nagari Raya No. 1, Koto Baru",
    kecamatan: "Lembang Jaya",
    kabupaten: "Solok",
    provinsi: "Sumatera Barat",
    kodePos: "27365",
    email: "info@kotobaru.nagari.id",
    website: "www.kotobaru.nagari.id",
    telepon: "(0755) 123456",
    waliNagari: "H. Abdul Rahman, S.Sos",
    nipWaliNagari: "196512121990031002"
  }

  const letterheadSettings = {
    logo: "/logo-nagari.png",
    kop1: "PEMERINTAH NAGARI KOTO BARU",
    kop2: "KECAMATAN LEMBANG JAYA",
    kop3: "KABUPATEN SOLOK",
    alamatKop: "Jl. Nagari Raya No. 1, Koto Baru 27365",
    kontakKop: "Telp. (0755) 123456 | Email: info@kotobaru.nagari.id"
  }

  const systemSettings = {
    timezone: "Asia/Jakarta",
    dateFormat: "DD/MM/YYYY",
    currency: "IDR",
    language: "id",
    autoBackup: true,
    backupTime: "02:00",
    maintenanceMode: false,
    registrationOpen: true,
    maxFileSize: "10",
    allowedFileTypes: "pdf,jpg,jpeg,png,doc,docx"
  }

  const notificationSettings = {
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    newApplications: true,
    documentReady: true,
    systemMaintenance: true,
    weeklyReports: false
  }

  const handleSave = async (section: string) => {
    setIsLoading(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsLoading(false)
    // Show success message
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1>Pengaturan Sistem</h1>
          <p className="text-muted-foreground">Konfigurasi dan pengaturan aplikasi nagari</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Database className="h-4 w-4 mr-2" />
            Backup Settings
          </Button>
        </div>
      </div>

      <Tabs defaultValue="nagari" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="nagari">Nagari</TabsTrigger>
          <TabsTrigger value="letterhead">Letterhead</TabsTrigger>
          <TabsTrigger value="system">Sistem</TabsTrigger>
          <TabsTrigger value="notifications">Notifikasi</TabsTrigger>
          <TabsTrigger value="security">Keamanan</TabsTrigger>
        </TabsList>

        <TabsContent value="nagari" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Informasi Nagari
              </CardTitle>
              <CardDescription>
                Data umum dan identitas nagari
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nama-nagari">Nama Nagari</Label>
                  <Input id="nama-nagari" defaultValue={nagariSettings.nama} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="kode-nagari">Kode Nagari</Label>
                  <Input id="kode-nagari" defaultValue={nagariSettings.kode} />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="alamat-nagari">Alamat</Label>
                <Textarea id="alamat-nagari" defaultValue={nagariSettings.alamat} />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="kecamatan">Kecamatan</Label>
                  <Input id="kecamatan" defaultValue={nagariSettings.kecamatan} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="kabupaten">Kabupaten</Label>
                  <Input id="kabupaten" defaultValue={nagariSettings.kabupaten} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="provinsi">Provinsi</Label>
                  <Input id="provinsi" defaultValue={nagariSettings.provinsi} />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="kode-pos">Kode Pos</Label>
                  <Input id="kode-pos" defaultValue={nagariSettings.kodePos} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="telepon">Telepon</Label>
                  <Input id="telepon" defaultValue={nagariSettings.telepon} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email-nagari">Email</Label>
                  <Input id="email-nagari" type="email" defaultValue={nagariSettings.email} />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input id="website" defaultValue={nagariSettings.website} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="wali-nagari">Wali Nagari</Label>
                  <Input id="wali-nagari" defaultValue={nagariSettings.waliNagari} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nip-wali">NIP Wali Nagari</Label>
                  <Input id="nip-wali" defaultValue={nagariSettings.nipWaliNagari} />
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={() => handleSave('nagari')} disabled={isLoading}>
                  <Save className="h-4 w-4 mr-2" />
                  {isLoading ? 'Menyimpan...' : 'Simpan'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="letterhead" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Pengaturan Kop Surat
              </CardTitle>
              <CardDescription>
                Konfigurasi header dan footer surat resmi
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="logo-upload">Logo Nagari</Label>
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 border rounded-lg flex items-center justify-center bg-muted">
                    <Building2 className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <Input id="logo-upload" type="file" accept="image/*" />
                    <p className="text-xs text-muted-foreground mt-1">
                      Format: PNG, JPG. Ukuran maksimal: 2MB. Rekomendasi: 200x200px
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="kop1">Baris 1 Kop Surat</Label>
                <Input id="kop1" defaultValue={letterheadSettings.kop1} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="kop2">Baris 2 Kop Surat</Label>
                <Input id="kop2" defaultValue={letterheadSettings.kop2} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="kop3">Baris 3 Kop Surat</Label>
                <Input id="kop3" defaultValue={letterheadSettings.kop3} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="alamat-kop">Alamat di Kop</Label>
                <Input id="alamat-kop" defaultValue={letterheadSettings.alamatKop} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="kontak-kop">Kontak di Kop</Label>
                <Input id="kontak-kop" defaultValue={letterheadSettings.kontakKop} />
              </div>

              {/* Preview */}
              <div className="space-y-2">
                <Label>Preview Kop Surat</Label>
                <div className="border rounded-lg p-6 bg-white">
                  <div className="text-center space-y-1">
                    <div className="flex items-center justify-center mb-4">
                      <Building2 className="h-16 w-16 text-blue-600" />
                    </div>
                    <h2 className="text-lg font-bold">{letterheadSettings.kop1}</h2>
                    <h3 className="text-base font-semibold">{letterheadSettings.kop2}</h3>
                    <h3 className="text-base font-semibold">{letterheadSettings.kop3}</h3>
                    <div className="border-t-2 border-black mt-4 pt-2">
                      <p className="text-sm">{letterheadSettings.alamatKop}</p>
                      <p className="text-sm">{letterheadSettings.kontakKop}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={() => handleSave('letterhead')} disabled={isLoading}>
                  <Save className="h-4 w-4 mr-2" />
                  {isLoading ? 'Menyimpan...' : 'Simpan'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <SettingsIcon className="h-5 w-5" />
                Pengaturan Sistem
              </CardTitle>
              <CardDescription>
                Konfigurasi umum aplikasi
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select defaultValue={systemSettings.timezone}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Asia/Jakarta">Asia/Jakarta (WIB)</SelectItem>
                      <SelectItem value="Asia/Makassar">Asia/Makassar (WITA)</SelectItem>
                      <SelectItem value="Asia/Jayapura">Asia/Jayapura (WIT)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date-format">Format Tanggal</Label>
                  <Select defaultValue={systemSettings.dateFormat}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                      <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                      <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="currency">Mata Uang</Label>
                  <Select defaultValue={systemSettings.currency}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="IDR">IDR (Rupiah)</SelectItem>
                      <SelectItem value="USD">USD (Dollar)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="language">Bahasa</Label>
                  <Select defaultValue={systemSettings.language}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="id">Indonesia</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Auto Backup</Label>
                    <p className="text-sm text-muted-foreground">Backup otomatis database harian</p>
                  </div>
                  <Switch defaultChecked={systemSettings.autoBackup} />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Mode Maintenance</Label>
                    <p className="text-sm text-muted-foreground">Matikan akses sementara untuk maintenance</p>
                  </div>
                  <Switch defaultChecked={systemSettings.maintenanceMode} />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Registrasi Terbuka</Label>
                    <p className="text-sm text-muted-foreground">Izinkan pendaftaran user baru</p>
                  </div>
                  <Switch defaultChecked={systemSettings.registrationOpen} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="max-file-size">Maksimal Ukuran File (MB)</Label>
                  <Input id="max-file-size" type="number" defaultValue={systemSettings.maxFileSize} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="backup-time">Waktu Backup</Label>
                  <Input id="backup-time" type="time" defaultValue={systemSettings.backupTime} />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="allowed-files">Jenis File yang Diizinkan</Label>
                <Input id="allowed-files" defaultValue={systemSettings.allowedFileTypes} />
                <p className="text-xs text-muted-foreground">
                  Pisahkan dengan koma. Contoh: pdf,jpg,png,doc,docx
                </p>
              </div>

              <div className="flex justify-end">
                <Button onClick={() => handleSave('system')} disabled={isLoading}>
                  <Save className="h-4 w-4 mr-2" />
                  {isLoading ? 'Menyimpan...' : 'Simpan'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Pengaturan Notifikasi
              </CardTitle>
              <CardDescription>
                Konfigurasi notifikasi dan pemberitahuan
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">Kirim notifikasi via email</p>
                  </div>
                  <Switch defaultChecked={notificationSettings.emailNotifications} />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>SMS Notifications</Label>
                    <p className="text-sm text-muted-foreground">Kirim notifikasi via SMS</p>
                  </div>
                  <Switch defaultChecked={notificationSettings.smsNotifications} />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Push Notifications</Label>
                    <p className="text-sm text-muted-foreground">Notifikasi push di browser</p>
                  </div>
                  <Switch defaultChecked={notificationSettings.pushNotifications} />
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-medium mb-4">Jenis Notifikasi</h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Permohonan Baru</Label>
                      <p className="text-sm text-muted-foreground">Notifikasi saat ada permohonan surat baru</p>
                    </div>
                    <Switch defaultChecked={notificationSettings.newApplications} />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Dokumen Siap</Label>
                      <p className="text-sm text-muted-foreground">Notifikasi saat dokumen sudah siap diambil</p>
                    </div>
                    <Switch defaultChecked={notificationSettings.documentReady} />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Maintenance Sistem</Label>
                      <p className="text-sm text-muted-foreground">Notifikasi jadwal maintenance</p>
                    </div>
                    <Switch defaultChecked={notificationSettings.systemMaintenance} />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Laporan Mingguan</Label>
                      <p className="text-sm text-muted-foreground">Kirim laporan statistik mingguan</p>
                    </div>
                    <Switch defaultChecked={notificationSettings.weeklyReports} />
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={() => handleSave('notifications')} disabled={isLoading}>
                  <Save className="h-4 w-4 mr-2" />
                  {isLoading ? 'Menyimpan...' : 'Simpan'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Pengaturan Keamanan
              </CardTitle>
              <CardDescription>
                Konfigurasi keamanan dan akses sistem
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="session-timeout">Session Timeout (menit)</Label>
                  <Input id="session-timeout" type="number" defaultValue="30" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="max-login-attempts">Max Login Attempts</Label>
                  <Input id="max-login-attempts" type="number" defaultValue="5" />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Two-Factor Authentication</Label>
                    <p className="text-sm text-muted-foreground">Wajibkan 2FA untuk admin</p>
                  </div>
                  <Switch />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Strong Password Policy</Label>
                    <p className="text-sm text-muted-foreground">Minimal 8 karakter, huruf besar, angka, simbol</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Login Notification</Label>
                    <p className="text-sm text-muted-foreground">Notifikasi saat ada login dari device baru</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>IP Whitelist</Label>
                    <p className="text-sm text-muted-foreground">Batasi akses berdasarkan IP address</p>
                  </div>
                  <Switch />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="allowed-ips">Allowed IP Addresses</Label>
                <Textarea 
                  id="allowed-ips" 
                  placeholder="192.168.1.0/24&#10;10.0.0.1&#10;203.142.45.0/28"
                  rows={3}
                />
                <p className="text-xs text-muted-foreground">
                  Satu IP per baris. Gunakan CIDR notation untuk range. Kosongkan untuk mengizinkan semua IP.
                </p>
              </div>

              <div className="flex justify-end">
                <Button onClick={() => handleSave('security')} disabled={isLoading}>
                  <Save className="h-4 w-4 mr-2" />
                  {isLoading ? 'Menyimpan...' : 'Simpan'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}