import React, { useState, useEffect } from "react"
import { 
  Plus, 
  Search, 
  Filter,
  Users,
  Eye,
  Edit,
  Trash2,
  MoreVertical,
  Calendar,
  ChevronLeft,
  Save,
  ArrowUpDown,
  Phone,
  Mail,
  Upload,
  User,
  Building2,
  Star
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Badge } from "./ui/badge"
import { Textarea } from "./ui/textarea"
import { Label } from "./ui/label"
import { Switch } from "./ui/switch"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "./ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog"
import { toast } from "sonner"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"

interface CMSStaffProps {
  userRole: string
  onModuleChange: (module: string) => void
}

interface StaffMember {
  id: number
  name: string
  position: string
  department: string
  description?: string
  photo?: string
  phone?: string
  email?: string
  whatsapp?: string
  is_leadership: boolean
  status: string
  sort_order: number
  start_date?: string
  end_date?: string
  created_at: string
  updated_at: string
}

// Predefined departments
const DEPARTMENTS = [
  "Wali Nagari",
  "Sekretaris Nagari",
  "Kaur Tata Usaha & Umum",
  "Kaur Keuangan",
  "Kaur Perencanaan",
  "Kasi Pemerintahan",
  "Kasi Kesejahteraan",
  "Kasi Pelayanan",
  "Wali Jorong",
  "Badan Permusyawaratan Nagari",
  "Lainnya"
]

// Predefined positions
const POSITIONS = [
  "Wali Nagari",
  "Sekretaris Nagari",
  "Kepala Urusan",
  "Kepala Seksi",
  "Wali Jorong",
  "Ketua BPN",
  "Wakil Ketua BPN",
  "Sekretaris BPN",
  "Anggota BPN",
  "Staff",
  "Lainnya"
]

export function CMSStaff({ userRole, onModuleChange }: CMSStaffProps) {
  const [staff, setStaff] = useState<StaffMember[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [departmentFilter, setDepartmentFilter] = useState("all")
  const [showForm, setShowForm] = useState(false)
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    position: "",
    department: "",
    description: "",
    photo: "",
    phone: "",
    email: "",
    whatsapp: "",
    is_leadership: false,
    status: "active",
    sort_order: 0,
    start_date: "",
    end_date: ""
  })
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [staffToDelete, setStaffToDelete] = useState<StaffMember | null>(null)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)

  // Mock tenant ID
  const tenantId = 1

  useEffect(() => {
    fetchStaff()
  }, [searchQuery, statusFilter, departmentFilter])

  const fetchStaff = async () => {
    setLoading(true)
    try {
      // Mock data untuk development
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const mockStaff: StaffMember[] = [
        {
          id: 1,
          name: "Budi Santoso, S.Pd",
          position: "Wali Nagari",
          department: "Wali Nagari",
          description: "Memimpin penyelenggaraan pemerintahan nagari",
          phone: "081234567890",
          email: "wali@nagari.go.id",
          is_leadership: true,
          status: "active",
          sort_order: 1,
          start_date: "2020-01-01",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 2,
          name: "Siti Aminah, S.E",
          position: "Sekretaris Nagari",
          department: "Sekretaris Nagari",
          description: "Membantu Wali Nagari dalam tugas administrasi",
          phone: "081234567891",
          email: "sekretaris@nagari.go.id",
          is_leadership: true,
          status: "active",
          sort_order: 2,
          start_date: "2020-01-01",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 3,
          name: "Ahmad Fauzi",
          position: "Kepala Urusan",
          department: "Kaur Keuangan",
          description: "Mengelola keuangan nagari",
          phone: "081234567892",
          is_leadership: false,
          status: "active",
          sort_order: 3,
          start_date: "2021-03-15",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 4,
          name: "Dewi Lestari",
          position: "Kepala Seksi",
          department: "Kasi Pelayanan",
          description: "Menangani pelayanan publik",
          phone: "081234567893",
          is_leadership: false,
          status: "active",
          sort_order: 4,
          start_date: "2022-01-10",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ]

      // Apply filters
      let filteredStaff = mockStaff
      
      if (searchQuery) {
        filteredStaff = filteredStaff.filter(s => 
          s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.position.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.department.toLowerCase().includes(searchQuery.toLowerCase())
        )
      }
      
      if (statusFilter !== "all") {
        filteredStaff = filteredStaff.filter(s => s.status === statusFilter)
      }
      
      if (departmentFilter !== "all") {
        filteredStaff = filteredStaff.filter(s => s.department === departmentFilter)
      }

      setStaff(filteredStaff)
    } catch (error) {
      console.error('Error fetching staff:', error)
      toast.error("Gagal memuat data struktur organisasi")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim() || !formData.position.trim()) {
      toast.error("Nama dan jabatan wajib diisi")
      return
    }

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500))
      
      if (editingStaff) {
        toast.success("Data pejabat berhasil diperbarui")
      } else {
        toast.success("Pejabat baru berhasil ditambahkan")
      }
      
      resetForm()
      fetchStaff()
    } catch (error) {
      console.error('Error saving staff:', error)
      toast.error("Gagal menyimpan data")
    }
  }

  const handleDelete = async () => {
    if (!staffToDelete) return

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300))
      
      toast.success("Data pejabat berhasil dihapus")
      setDeleteDialogOpen(false)
      setStaffToDelete(null)
      fetchStaff()
    } catch (error) {
      console.error('Error deleting staff:', error)
      toast.error("Gagal menghapus data")
    }
  }

  const handleEdit = (member: StaffMember) => {
    setEditingStaff(member)
    setFormData({
      name: member.name,
      position: member.position,
      department: member.department,
      description: member.description || "",
      photo: member.photo || "",
      phone: member.phone || "",
      email: member.email || "",
      whatsapp: member.whatsapp || "",
      is_leadership: member.is_leadership,
      status: member.status,
      sort_order: member.sort_order,
      start_date: member.start_date || "",
      end_date: member.end_date || ""
    })
    setShowForm(true)
  }

  const resetForm = () => {
    setFormData({
      name: "",
      position: "",
      department: "",
      description: "",
      photo: "",
      phone: "",
      email: "",
      whatsapp: "",
      is_leadership: false,
      status: "active",
      sort_order: staff.length + 1,
      start_date: "",
      end_date: ""
    })
    setEditingStaff(null)
    setShowForm(false)
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  // Stats
  const totalStaff = staff.length
  const activeStaff = staff.filter(s => s.status === 'active').length
  const leadershipCount = staff.filter(s => s.is_leadership).length

  if (showForm) {
    return (
      <div className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="sm" onClick={resetForm}>
            <ChevronLeft className="h-4 w-4 mr-1" />
            Kembali
          </Button>
          <div>
            <h1 className="text-2xl font-bold">
              {editingStaff ? "Edit Pejabat" : "Tambah Pejabat Baru"}
            </h1>
            <p className="text-muted-foreground">
              {editingStaff ? "Perbarui data pejabat/staff" : "Tambahkan anggota baru ke struktur organisasi"}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Main Form */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Informasi Dasar</CardTitle>
                  <CardDescription>Data identitas pejabat/staff</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nama Lengkap *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        placeholder="Contoh: Budi Santoso, S.Pd"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="position">Jabatan *</Label>
                      <Select 
                        value={formData.position} 
                        onValueChange={(value) => setFormData({...formData, position: value})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih jabatan" />
                        </SelectTrigger>
                        <SelectContent>
                          {POSITIONS.map(pos => (
                            <SelectItem key={pos} value={pos}>{pos}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="department">Bidang/Unit</Label>
                      <Select 
                        value={formData.department} 
                        onValueChange={(value) => setFormData({...formData, department: value})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih bidang" />
                        </SelectTrigger>
                        <SelectContent>
                          {DEPARTMENTS.map(dept => (
                            <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="sort_order">Urutan Tampil</Label>
                      <Input
                        id="sort_order"
                        type="number"
                        min="1"
                        value={formData.sort_order}
                        onChange={(e) => setFormData({...formData, sort_order: parseInt(e.target.value) || 1})}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Deskripsi Tugas</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      placeholder="Jelaskan tugas dan tanggung jawab..."
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Kontak</CardTitle>
                  <CardDescription>Informasi kontak yang dapat dihubungi</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="phone">No. Telepon</Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        placeholder="08xx-xxxx-xxxx"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="whatsapp">No. WhatsApp</Label>
                      <Input
                        id="whatsapp"
                        value={formData.whatsapp}
                        onChange={(e) => setFormData({...formData, whatsapp: e.target.value})}
                        placeholder="08xx-xxxx-xxxx"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      placeholder="email@nagari.go.id"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Masa Jabatan</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="start_date">Tanggal Mulai</Label>
                      <Input
                        id="start_date"
                        type="date"
                        value={formData.start_date}
                        onChange={(e) => setFormData({...formData, start_date: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="end_date">Tanggal Berakhir</Label>
                      <Input
                        id="end_date"
                        type="date"
                        value={formData.end_date}
                        onChange={(e) => setFormData({...formData, end_date: e.target.value})}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Foto</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col items-center gap-4">
                    <Avatar className="h-32 w-32">
                      {formData.photo ? (
                        <AvatarImage src={formData.photo} alt={formData.name} />
                      ) : (
                        <AvatarFallback className="text-2xl bg-primary/10">
                          {formData.name ? getInitials(formData.name) : <User className="h-12 w-12" />}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <div className="space-y-2 w-full">
                      <Label htmlFor="photo">URL Foto</Label>
                      <Input
                        id="photo"
                        value={formData.photo}
                        onChange={(e) => setFormData({...formData, photo: e.target.value})}
                        placeholder="https://..."
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Status & Pengaturan</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select 
                      value={formData.status} 
                      onValueChange={(value) => setFormData({...formData, status: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Aktif</SelectItem>
                        <SelectItem value="inactive">Tidak Aktif</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between py-2">
                    <div className="space-y-0.5">
                      <Label>Pimpinan</Label>
                      <p className="text-xs text-muted-foreground">
                        Tandai sebagai pimpinan nagari
                      </p>
                    </div>
                    <Switch
                      checked={formData.is_leadership}
                      onCheckedChange={(checked) => setFormData({...formData, is_leadership: checked})}
                    />
                  </div>
                </CardContent>
              </Card>

              <div className="flex gap-3">
                <Button type="button" variant="outline" onClick={resetForm} className="flex-1">
                  Batal
                </Button>
                <Button type="submit" className="flex-1">
                  <Save className="h-4 w-4 mr-2" />
                  Simpan
                </Button>
              </div>
            </div>
          </div>
        </form>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Users className="h-6 w-6" />
            Struktur Organisasi
          </h1>
          <p className="text-muted-foreground mt-1">
            Kelola data pejabat dan staff pemerintahan nagari
          </p>
        </div>
        <Button onClick={() => setShowForm(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Tambah Pejabat
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pejabat/Staff</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStaff}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aktif</CardTitle>
            <User className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{activeStaff}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pimpinan</CardTitle>
            <Star className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{leadershipCount}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Cari nama, jabatan, atau bidang..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Bidang" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Bidang</SelectItem>
                {DEPARTMENTS.map(dept => (
                  <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-36">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                <SelectItem value="active">Aktif</SelectItem>
                <SelectItem value="inactive">Tidak Aktif</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="pt-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : staff.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Users className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Belum ada data struktur organisasi</p>
              <Button onClick={() => setShowForm(true)} className="mt-4">
                Tambah Pejabat Pertama
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Pejabat/Staff</TableHead>
                  <TableHead>Jabatan</TableHead>
                  <TableHead>Bidang</TableHead>
                  <TableHead>Kontak</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="w-16">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {staff.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          {member.photo ? (
                            <AvatarImage src={member.photo} alt={member.name} />
                          ) : (
                            <AvatarFallback className="bg-primary/10">
                              {getInitials(member.name)}
                            </AvatarFallback>
                          )}
                        </Avatar>
                        <div>
                          <div className="font-medium flex items-center gap-2">
                            {member.name}
                            {member.is_leadership && (
                              <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                            )}
                          </div>
                          {member.description && (
                            <div className="text-xs text-muted-foreground truncate max-w-48">
                              {member.description}
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{member.position}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <Building2 className="h-3 w-3 text-muted-foreground" />
                        {member.department}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {member.phone && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Phone className="h-3 w-3" />
                            {member.phone}
                          </div>
                        )}
                        {member.email && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Mail className="h-3 w-3" />
                            {member.email}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant={member.status === 'active' ? 'default' : 'secondary'}>
                        {member.status === 'active' ? 'Aktif' : 'Tidak Aktif'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEdit(member)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => {
                              setStaffToDelete(member)
                              setDeleteDialogOpen(true)
                            }}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Hapus
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Pejabat?</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus <strong>{staffToDelete?.name}</strong> dari struktur organisasi?
              Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
