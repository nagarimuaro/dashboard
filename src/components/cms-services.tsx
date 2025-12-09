import React, { useState, useEffect } from "react"
import { 
  Plus, 
  Search, 
  Filter,
  Globe,
  Eye,
  Edit,
  Trash2,
  MoreVertical,
  Calendar,
  User,
  ChevronLeft,
  Save,
  ArrowUpDown,
  CheckSquare,
  Square,
  Archive,
  DollarSign,
  Clock,
  Phone
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Badge } from "./ui/badge"
import { Textarea } from "./ui/textarea"
import { Label } from "./ui/label"
import { Switch } from "./ui/switch"
import { Checkbox } from "./ui/checkbox"
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
import { toast } from "sonner"
import cmsService from "../services/cmsService"

interface CMSServicesProps {
  userRole: string
  onModuleChange: (module: string) => void
}

export function CMSServices({ userRole, onModuleChange }: CMSServicesProps) {
  const [services, setServices] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [showForm, setShowForm] = useState(false)
  const [editingService, setEditingService] = useState(null)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    content: "",
    category_id: "",
    status: "active",
    requirements: "",
    process_time: "",
    cost: "",
    contact_info: "",
    is_online: false
  })
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [serviceToDelete, setServiceToDelete] = useState(null)

  // Mock tenant ID
  const tenantId = 1

  useEffect(() => {
    fetchServices()
    fetchCategories()
  }, [currentPage, searchQuery, statusFilter, categoryFilter])

  const fetchServices = async () => {
    setLoading(true)
    try {
      const params = {
        page: currentPage,
        per_page: 10,
        ...(searchQuery && { search: searchQuery }),
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(categoryFilter !== 'all' && { category: categoryFilter })
      }

      const response = await cmsService.getAdminServices(tenantId, params)
      if (response.success) {
        setServices(response.data)
        setTotalPages(Math.ceil((response.meta?.total || 0) / 10))
      } else {
        toast.error("Gagal memuat layanan")
        // Mock data for development
        setServices([
          {
            id: 1,
            name: "Surat Keterangan Domisili",
            description: "Layanan penerbitan surat keterangan domisili",
            status: "active",
            is_online: true,
            cost: 0,
            process_time: "1-2 hari kerja",
            updated_at: new Date().toISOString()
          },
          {
            id: 2,
            name: "Surat Keterangan Usaha",
            description: "Layanan penerbitan surat keterangan usaha untuk UMKM",
            status: "active", 
            is_online: false,
            cost: 10000,
            process_time: "3-5 hari kerja",
            updated_at: new Date().toISOString()
          }
        ])
      }
    } catch (error) {
      console.error('Error fetching services:', error)
      toast.error("Terjadi kesalahan saat memuat layanan")
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await cmsService.getAdminCategories(tenantId, { type: 'service' })
      if (response.success) {
        setCategories(response.data)
      } else {
        // Mock categories for development
        setCategories([
          { id: 1, name: "Administrasi Kependudukan", slug: "administrasi-kependudukan" },
          { id: 2, name: "Perizinan", slug: "perizinan" },
          { id: 3, name: "Sosial", slug: "sosial" }
        ])
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim() || !formData.description.trim()) {
      toast.error("Nama dan deskripsi layanan wajib diisi")
      return
    }

    try {
      const serviceData = {
        ...formData,
        category_id: (formData.category_id && formData.category_id !== 'none') ? parseInt(formData.category_id) : null,
        cost: formData.cost ? parseFloat(formData.cost) : null
      }

      let response
      if (editingService) {
        response = await cmsService.updateService(tenantId, editingService.id, serviceData)
      } else {
        response = await cmsService.createService(tenantId, serviceData)
      }

      if (response.success) {
        toast.success(editingService ? "Layanan berhasil diperbarui" : "Layanan berhasil dibuat")
        setShowForm(false)
        setEditingService(null)
        resetForm()
        fetchServices()
      } else {
        toast.error(response.error || "Gagal menyimpan layanan")
      }
    } catch (error) {
      console.error('Error saving service:', error)
      toast.error("Terjadi kesalahan saat menyimpan layanan")
    }
  }

  const handleEdit = (service: any) => {
    setEditingService(service)
    setFormData({
      name: service.name || "",
      description: service.description || "",
      content: service.content || "",
      category_id: service.category_id?.toString() || "none",
      status: service.status || "active",
      requirements: service.requirements || "",
      process_time: service.process_time || "",
      cost: service.cost?.toString() || "",
      contact_info: service.contact_info || "",
      is_online: service.is_online || false
    })
    setShowForm(true)
  }

  const handleDelete = async () => {
    if (!serviceToDelete) return

    try {
      const response = await cmsService.deleteService(tenantId, serviceToDelete.id)
      if (response.success) {
        toast.success("Layanan berhasil dihapus")
        setDeleteDialogOpen(false)
        setServiceToDelete(null)
        fetchServices()
      } else {
        toast.error(response.error || "Gagal menghapus layanan")
      }
    } catch (error) {
      console.error('Error deleting service:', error)
      toast.error("Terjadi kesalahan saat menghapus layanan")
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      content: "",
      category_id: "none",
      status: "active",
      requirements: "",
      process_time: "",
      cost: "",
      contact_info: "",
      is_online: false
    })
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'inactive':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatCurrency = (amount: number) => {
    if (!amount || amount === 0) return 'Gratis'
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount)
  }

  if (showForm) {
    return (
      <div className="space-y-6">
        {/* Form Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              onClick={() => {
                setShowForm(false)
                setEditingService(null)
                resetForm()
              }}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Kembali
            </Button>
            <div>
              <h1 className="text-2xl font-semibold">
                {editingService ? 'Edit Layanan' : 'Tambah Layanan Baru'}
              </h1>
              <p className="text-muted-foreground mt-1">
                {editingService ? 'Perbarui informasi layanan' : 'Buat layanan publik baru'}
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Informasi Layanan</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="name">Nama Layanan *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Surat Keterangan Domisili"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">Deskripsi Singkat *</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Deskripsi singkat tentang layanan ini"
                      rows={3}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="content">Informasi Detail</Label>
                    <Textarea
                      id="content"
                      value={formData.content}
                      onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                      placeholder="Informasi lengkap tentang layanan, prosedur, dll."
                      rows={8}
                    />
                  </div>

                  <div>
                    <Label htmlFor="requirements">Syarat-syarat</Label>
                    <Textarea
                      id="requirements"
                      value={formData.requirements}
                      onChange={(e) => setFormData(prev => ({ ...prev, requirements: e.target.value }))}
                      placeholder="1. Fotokopi KTP&#10;2. Fotokopi KK&#10;3. Surat pengantar RT/RW"
                      rows={5}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Tulis setiap syarat dalam baris terpisah
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Service Settings */}
              <Card>
                <CardHeader>
                  <CardTitle>Pengaturan Layanan</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="status">Status</Label>
                    <Select 
                      value={formData.status} 
                      onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Aktif</SelectItem>
                        <SelectItem value="inactive">Nonaktif</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="category_id">Kategori</Label>
                    <Select 
                      value={formData.category_id} 
                      onValueChange={(value) => setFormData(prev => ({ ...prev, category_id: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih kategori" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Tanpa kategori</SelectItem>
                        {categories.map((category: any) => (
                          <SelectItem key={category.id} value={category.id.toString()}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="is_online">Layanan Online</Label>
                    <Switch
                      id="is_online"
                      checked={formData.is_online}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_online: checked }))}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Process Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Informasi Proses</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="process_time">Waktu Proses</Label>
                    <Input
                      id="process_time"
                      value={formData.process_time}
                      onChange={(e) => setFormData(prev => ({ ...prev, process_time: e.target.value }))}
                      placeholder="1-2 hari kerja"
                    />
                  </div>

                  <div>
                    <Label htmlFor="cost">Biaya (Rp)</Label>
                    <Input
                      id="cost"
                      type="number"
                      value={formData.cost}
                      onChange={(e) => setFormData(prev => ({ ...prev, cost: e.target.value }))}
                      placeholder="0"
                      min="0"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Kosong atau 0 = Gratis
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="contact_info">Kontak Layanan</Label>
                    <Textarea
                      id="contact_info"
                      value={formData.contact_info}
                      onChange={(e) => setFormData(prev => ({ ...prev, contact_info: e.target.value }))}
                      placeholder="PIC: Ahmad Fauzi&#10;Telp: 0812-3456-7890&#10;Email: layanan@nagari.id"
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="space-y-2">
                <Button type="submit" className="w-full">
                  <Save className="h-4 w-4 mr-2" />
                  {editingService ? 'Perbarui Layanan' : 'Simpan Layanan'}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  className="w-full"
                  onClick={() => {
                    setShowForm(false)
                    setEditingService(null)
                    resetForm()
                  }}
                >
                  Batal
                </Button>
              </div>
            </div>
          </div>
        </form>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Kelola Layanan</h1>
          <p className="text-muted-foreground mt-1">
            Kelola layanan publik yang disediakan nagari
          </p>
        </div>
        
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Tambah Layanan
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Cari layanan..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                <SelectItem value="active">Aktif</SelectItem>
                <SelectItem value="inactive">Nonaktif</SelectItem>
              </SelectContent>
            </Select>

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Kategori</SelectItem>
                {categories.map((category: any) => (
                  <SelectItem key={category.id} value={category.slug}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Services Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">#</TableHead>
              <TableHead>Nama Layanan</TableHead>
              <TableHead>Kategori</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Mode</TableHead>
              <TableHead>Biaya</TableHead>
              <TableHead>Waktu Proses</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell><div className="h-4 bg-muted rounded animate-pulse" /></TableCell>
                  <TableCell><div className="h-4 bg-muted rounded animate-pulse w-48" /></TableCell>
                  <TableCell><div className="h-4 bg-muted rounded animate-pulse w-24" /></TableCell>
                  <TableCell><div className="h-6 bg-muted rounded animate-pulse w-20" /></TableCell>
                  <TableCell><div className="h-4 bg-muted rounded animate-pulse w-16" /></TableCell>
                  <TableCell><div className="h-4 bg-muted rounded animate-pulse w-20" /></TableCell>
                  <TableCell><div className="h-4 bg-muted rounded animate-pulse w-24" /></TableCell>
                  <TableCell><div className="h-8 bg-muted rounded animate-pulse w-8" /></TableCell>
                </TableRow>
              ))
            ) : services.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8">
                  <div className="flex flex-col items-center gap-2">
                    <Globe className="h-12 w-12 text-muted-foreground opacity-50" />
                    <p className="text-muted-foreground">Belum ada layanan</p>
                    <Button variant="outline" size="sm" onClick={() => setShowForm(true)}>
                      Buat layanan pertama
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              services.map((service: any, index) => (
                <TableRow key={service.id}>
                  <TableCell>{(currentPage - 1) * 10 + index + 1}</TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{service.name}</p>
                      <p className="text-sm text-muted-foreground truncate max-w-96">
                        {service.description}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    {service.category ? (
                      <Badge variant="outline">{service.category.name}</Badge>
                    ) : (
                      <span className="text-muted-foreground text-sm">Tanpa kategori</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(service.status)}>
                      {service.status === 'active' ? 'Aktif' : 'Nonaktif'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {service.is_online ? (
                      <Badge variant="secondary">Online</Badge>
                    ) : (
                      <Badge variant="outline">Offline</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className="text-sm font-medium">
                      {formatCurrency(service.cost)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">
                      {service.process_time || '-'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(service)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-destructive"
                          onClick={() => {
                            setServiceToDelete(service)
                            setDeleteDialogOpen(true)
                          }}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Hapus
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Halaman {currentPage} dari {totalPages}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              Sebelumnya
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              Selanjutnya
            </Button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hapus Layanan</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus layanan "{serviceToDelete?.name}"? 
              Tindakan ini tidak dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Batal
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Hapus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}