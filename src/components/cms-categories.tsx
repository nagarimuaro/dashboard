import React, { useState, useEffect } from "react"
import { 
  Plus, 
  Search, 
  Filter,
  FolderOpen,
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
  Tag,
  Palette
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs"
import { toast } from "sonner"
import cmsService from "../services/cmsService"

interface CMSCategoriesProps {
  userRole: string
  onModuleChange: (module: string) => void
}

export function CMSCategories({ userRole, onModuleChange }: CMSCategoriesProps) {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [showForm, setShowForm] = useState(false)
  const [editingCategory, setEditingCategory] = useState(null)
  const [activeTab, setActiveTab] = useState("news")
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    type: "news",
    color: "#EF4444",
    icon: "heroicon-o-newspaper",
    is_active: true
  })
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [categoryToDelete, setCategoryToDelete] = useState(null)

  // Mock tenant ID
  const tenantId = 1

  // Predefined colors and icons
  const predefinedColors = [
    { name: "Red", value: "#EF4444" },
    { name: "Orange", value: "#F59E0B" },
    { name: "Yellow", value: "#EAB308" },
    { name: "Green", value: "#10B981" },
    { name: "Blue", value: "#3B82F6" },
    { name: "Indigo", value: "#6366F1" },
    { name: "Purple", value: "#8B5CF6" },
    { name: "Pink", value: "#EC4899" },
    { name: "Teal", value: "#06B6D4" },
    { name: "Emerald", value: "#059669" }
  ]

  const predefinedIcons = [
    { name: "Newspaper", value: "heroicon-o-newspaper" },
    { name: "Megaphone", value: "heroicon-o-megaphone" },
    { name: "Calendar", value: "heroicon-o-calendar" },
    { name: "Building Office", value: "heroicon-o-building-office" },
    { name: "Document Text", value: "heroicon-o-document-text" },
    { name: "Eye", value: "heroicon-o-eye" },
    { name: "Scale", value: "heroicon-o-scale" },
    { name: "Building Storefront", value: "heroicon-o-building-storefront" },
    { name: "Heart", value: "heroicon-o-heart" },
    { name: "Shield Check", value: "heroicon-o-shield-check" },
    { name: "Globe", value: "heroicon-o-globe-alt" },
    { name: "Map", value: "heroicon-o-map" }
  ]

  useEffect(() => {
    fetchCategories()
  }, [searchQuery, typeFilter, statusFilter])

  const fetchCategories = async () => {
    setLoading(true)
    try {
      const params = {
        ...(searchQuery && { search: searchQuery }),
        ...(typeFilter !== 'all' && { type: typeFilter }),
        ...(statusFilter !== 'all' && { is_active: statusFilter === 'active' })
      }

      const response = await cmsService.getAdminCategories(tenantId, params)
      if (response.success) {
        setCategories(response.data)
      } else {
        toast.error("Gagal memuat kategori")
        // Mock data for development
        setCategories([
          {
            id: 1,
            name: "Berita Utama",
            description: "Kategori untuk berita utama dan penting",
            type: "news",
            color: "#EF4444",
            icon: "heroicon-o-newspaper",
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: 2,
            name: "Pengumuman",
            description: "Kategori untuk pengumuman resmi",
            type: "news",
            color: "#F59E0B",
            icon: "heroicon-o-megaphone",
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: 3,
            name: "Layanan Administrasi",
            description: "Kategori untuk layanan administrasi kependudukan",
            type: "service",
            color: "#10B981",
            icon: "heroicon-o-document-text",
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ])
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
      toast.error("Terjadi kesalahan saat memuat kategori")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim()) {
      toast.error("Nama kategori wajib diisi")
      return
    }

    try {
      let response
      if (editingCategory) {
        response = await cmsService.updateCategory(tenantId, editingCategory.id, formData)
      } else {
        response = await cmsService.createCategory(tenantId, formData)
      }

      if (response.success) {
        toast.success(editingCategory ? "Kategori berhasil diperbarui" : "Kategori berhasil dibuat")
        setShowForm(false)
        setEditingCategory(null)
        resetForm()
        fetchCategories()
      } else {
        toast.error(response.error || "Gagal menyimpan kategori")
      }
    } catch (error) {
      console.error('Error saving category:', error)
      toast.error("Terjadi kesalahan saat menyimpan kategori")
    }
  }

  const handleEdit = (category: any) => {
    setEditingCategory(category)
    setFormData({
      name: category.name || "",
      description: category.description || "",
      type: category.type || "news",
      color: category.color || "#EF4444",
      icon: category.icon || "heroicon-o-newspaper",
      is_active: category.is_active !== undefined ? category.is_active : true
    })
    setShowForm(true)
  }

  const handleDelete = async () => {
    if (!categoryToDelete) return

    try {
      const response = await cmsService.deleteCategory(tenantId, categoryToDelete.id)
      if (response.success) {
        toast.success("Kategori berhasil dihapus")
        setDeleteDialogOpen(false)
        setCategoryToDelete(null)
        fetchCategories()
      } else {
        toast.error(response.error || "Gagal menghapus kategori")
      }
    } catch (error) {
      console.error('Error deleting category:', error)
      toast.error("Terjadi kesalahan saat menghapus kategori")
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      type: "news",
      color: "#EF4444",
      icon: "heroicon-o-newspaper",
      is_active: true
    })
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'news': return 'Berita'
      case 'service': return 'Layanan'
      case 'document': return 'Dokumen'
      default: return type
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'news': return 'bg-blue-100 text-blue-800'
      case 'service': return 'bg-green-100 text-green-800'
      case 'document': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getCategoriesByType = (type: string) => {
    return categories.filter((cat: any) => cat.type === type)
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
                setEditingCategory(null)
                resetForm()
              }}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Kembali
            </Button>
            <div>
              <h1 className="text-2xl font-semibold">
                {editingCategory ? 'Edit Kategori' : 'Tambah Kategori Baru'}
              </h1>
              <p className="text-muted-foreground mt-1">
                {editingCategory ? 'Perbarui informasi kategori' : 'Buat kategori baru untuk mengelompokkan konten'}
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
                  <CardTitle>Informasi Kategori</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="name">Nama Kategori *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Berita Utama"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">Deskripsi</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Deskripsi singkat tentang kategori ini"
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="type">Tipe Kategori *</Label>
                    <Select 
                      value={formData.type} 
                      onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="news">Berita</SelectItem>
                        <SelectItem value="service">Layanan</SelectItem>
                        <SelectItem value="document">Dokumen</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Visual Settings */}
              <Card>
                <CardHeader>
                  <CardTitle>Pengaturan Visual</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Warna Kategori</Label>
                    <div className="mt-2 grid grid-cols-5 gap-2">
                      {predefinedColors.map((color) => (
                        <button
                          key={color.value}
                          type="button"
                          className={`w-8 h-8 rounded-md border-2 ${
                            formData.color === color.value 
                              ? 'border-foreground' 
                              : 'border-muted'
                          }`}
                          style={{ backgroundColor: color.value }}
                          onClick={() => setFormData(prev => ({ ...prev, color: color.value }))}
                          title={color.name}
                        />
                      ))}
                    </div>
                    <Input
                      type="color"
                      value={formData.color}
                      onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                      className="mt-2 h-10 w-full"
                    />
                  </div>

                  <div>
                    <Label htmlFor="icon">Icon</Label>
                    <Select 
                      value={formData.icon} 
                      onValueChange={(value) => setFormData(prev => ({ ...prev, icon: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {predefinedIcons.map((icon) => (
                          <SelectItem key={icon.value} value={icon.value}>
                            {icon.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="is_active">Kategori Aktif</Label>
                    <Switch
                      id="is_active"
                      checked={formData.is_active}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Preview */}
              <Card>
                <CardHeader>
                  <CardTitle>Preview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div 
                      className="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium"
                      style={{ 
                        backgroundColor: formData.color + '20',
                        color: formData.color
                      }}
                    >
                      {formData.name || 'Nama Kategori'}
                    </div>
                    <Badge variant="outline" className={getTypeColor(formData.type)}>
                      {getTypeLabel(formData.type)}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="space-y-2">
                <Button type="submit" className="w-full">
                  <Save className="h-4 w-4 mr-2" />
                  {editingCategory ? 'Perbarui Kategori' : 'Simpan Kategori'}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  className="w-full"
                  onClick={() => {
                    setShowForm(false)
                    setEditingCategory(null)
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
          <h1 className="text-2xl font-semibold">Kelola Kategori</h1>
          <p className="text-muted-foreground mt-1">
            Kelola kategori untuk berita, layanan, dan dokumen
          </p>
        </div>
        
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Tambah Kategori
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
                  placeholder="Cari kategori..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Tipe</SelectItem>
                <SelectItem value="news">Berita</SelectItem>
                <SelectItem value="service">Layanan</SelectItem>
                <SelectItem value="document">Dokumen</SelectItem>
              </SelectContent>
            </Select>

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
          </div>
        </CardContent>
      </Card>

      {/* Categories by Type */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="news">
            Berita ({getCategoriesByType('news').length})
          </TabsTrigger>
          <TabsTrigger value="service">
            Layanan ({getCategoriesByType('service').length})
          </TabsTrigger>
          <TabsTrigger value="document">
            Dokumen ({getCategoriesByType('document').length})
          </TabsTrigger>
        </TabsList>

        {['news', 'service', 'document'].map((type) => (
          <TabsContent key={type} value={type}>
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">#</TableHead>
                    <TableHead>Nama</TableHead>
                    <TableHead>Deskripsi</TableHead>
                    <TableHead>Warna</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Dibuat</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    Array.from({ length: 3 }).map((_, index) => (
                      <TableRow key={index}>
                        <TableCell><div className="h-4 bg-muted rounded animate-pulse" /></TableCell>
                        <TableCell><div className="h-4 bg-muted rounded animate-pulse w-32" /></TableCell>
                        <TableCell><div className="h-4 bg-muted rounded animate-pulse w-48" /></TableCell>
                        <TableCell><div className="h-6 bg-muted rounded animate-pulse w-6" /></TableCell>
                        <TableCell><div className="h-6 bg-muted rounded animate-pulse w-16" /></TableCell>
                        <TableCell><div className="h-4 bg-muted rounded animate-pulse w-24" /></TableCell>
                        <TableCell><div className="h-8 bg-muted rounded animate-pulse w-8" /></TableCell>
                      </TableRow>
                    ))
                  ) : getCategoriesByType(type).length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        <div className="flex flex-col items-center gap-2">
                          <FolderOpen className="h-12 w-12 text-muted-foreground opacity-50" />
                          <p className="text-muted-foreground">
                            Belum ada kategori {getTypeLabel(type).toLowerCase()}
                          </p>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => {
                              setFormData(prev => ({ ...prev, type }))
                              setShowForm(true)
                            }}
                          >
                            Buat kategori pertama
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    getCategoriesByType(type).map((category: any, index) => (
                      <TableRow key={category.id}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-4 h-4 rounded-sm" 
                              style={{ backgroundColor: category.color }}
                            />
                            <span className="font-medium">{category.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-muted-foreground">
                            {category.description || '-'}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div 
                            className="w-6 h-6 rounded-full border" 
                            style={{ backgroundColor: category.color }}
                            title={category.color}
                          />
                        </TableCell>
                        <TableCell>
                          <Badge variant={category.is_active ? "default" : "secondary"}>
                            {category.is_active ? 'Aktif' : 'Nonaktif'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">
                            {formatDate(category.created_at)}
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
                              <DropdownMenuItem onClick={() => handleEdit(category)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                className="text-destructive"
                                onClick={() => {
                                  setCategoryToDelete(category)
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
          </TabsContent>
        ))}
      </Tabs>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hapus Kategori</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus kategori "{categoryToDelete?.name}"? 
              Semua konten yang menggunakan kategori ini akan menjadi tanpa kategori.
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