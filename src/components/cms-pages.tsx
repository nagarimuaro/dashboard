import React, { useState, useEffect } from "react"
import { 
  Plus, 
  Search, 
  Filter,
  FileText,
  Eye,
  Edit,
  Trash2,
  MoreVertical,
  Calendar,
  User,
  Globe,
  ChevronLeft,
  Save,
  ArrowUpDown
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
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
import { toast } from "sonner"
import cmsService from "../services/cmsService-fixed"

interface CMSPagesProps {
  userRole: string
  onModuleChange: (module: string) => void
}

export function CMSPages({ userRole, onModuleChange }: CMSPagesProps) {
  const [pages, setPages] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [showForm, setShowForm] = useState(false)
  const [editingPage, setEditingPage] = useState(null)
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    excerpt: "",
    status: "draft",
    show_in_menu: false,
    menu_title: "",
    page_template: "",
    seo_title: "",
    seo_description: "",
    seo_keywords: ""
  })
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [pageToDelete, setPageToDelete] = useState(null)

  // Get tenant ID from localStorage
  const tenantId = JSON.parse(localStorage.getItem('current_tenant') || '{}')?.id || 1

  useEffect(() => {
    fetchPages()
  }, [currentPage, searchQuery, statusFilter])

  const fetchPages = async () => {
    setLoading(true)
    try {
      const params = {
        page: currentPage,
        per_page: 10,
        ...(searchQuery && { search: searchQuery }),
        ...(statusFilter !== 'all' && { status: statusFilter })
      }

      const response = await cmsService.getAdminPages(tenantId, params)
      if (response.success) {
        setPages(response.data)
        setTotalPages(Math.ceil((response.meta?.total || 0) / 10))
      } else {
        toast.error("Gagal memuat halaman")
      }
    } catch (error) {
      console.error('Error fetching pages:', error)
      toast.error("Terjadi kesalahan saat memuat halaman")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title.trim() || !formData.content.trim()) {
      toast.error("Judul dan konten wajib diisi")
      return
    }

    try {
      const pageData = {
        ...formData,
        menu_title: formData.menu_title || formData.title
      }

      let response
      if (editingPage) {
        response = await cmsService.updatePage(tenantId, editingPage.id, pageData)
      } else {
        response = await cmsService.createPage(tenantId, pageData)
      }

      if (response.success) {
        toast.success(editingPage ? "Halaman berhasil diperbarui" : "Halaman berhasil dibuat")
        setShowForm(false)
        setEditingPage(null)
        resetForm()
        fetchPages()
      } else {
        toast.error(response.error || "Gagal menyimpan halaman")
      }
    } catch (error) {
      console.error('Error saving page:', error)
      toast.error("Terjadi kesalahan saat menyimpan halaman")
    }
  }

  const handleEdit = (page: any) => {
    setEditingPage(page)
    setFormData({
      title: page.title || "",
      content: page.content || "",
      excerpt: page.excerpt || "",
      status: page.status || "draft",
      show_in_menu: page.show_in_menu || false,
      menu_title: page.menu_title || "",
      page_template: page.page_template || "default",
      seo_title: page.seo_title || "",
      seo_description: page.seo_description || "",
      seo_keywords: page.seo_keywords || ""
    })
    setShowForm(true)
  }

  const handleDelete = async () => {
    if (!pageToDelete) return

    try {
      const response = await cmsService.deletePage(tenantId, pageToDelete.id)
      if (response.success) {
        toast.success("Halaman berhasil dihapus")
        setDeleteDialogOpen(false)
        setPageToDelete(null)
        fetchPages()
      } else {
        toast.error(response.error || "Gagal menghapus halaman")
      }
    } catch (error) {
      console.error('Error deleting page:', error)
      toast.error("Terjadi kesalahan saat menghapus halaman")
    }
  }

  const resetForm = () => {
    setFormData({
      title: "",
      content: "",
      excerpt: "",
      status: "draft",
      show_in_menu: false,
      menu_title: "",
      page_template: "default",
      seo_title: "",
      seo_description: "",
      seo_keywords: ""
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
      case 'published':
        return 'bg-green-100 text-green-800'
      case 'draft':
        return 'bg-yellow-100 text-yellow-800'
      case 'archived':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
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
                setEditingPage(null)
                resetForm()
              }}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Kembali
            </Button>
            <div>
              <h1 className="text-2xl font-semibold">
                {editingPage ? 'Edit Halaman' : 'Tambah Halaman Baru'}
              </h1>
              <p className="text-muted-foreground mt-1">
                {editingPage ? 'Perbarui informasi halaman' : 'Buat halaman statis baru untuk website'}
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
                  <CardTitle>Konten Utama</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="title">Judul Halaman *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Masukkan judul halaman"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="excerpt">Ringkasan</Label>
                    <Textarea
                      id="excerpt"
                      value={formData.excerpt}
                      onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
                      placeholder="Ringkasan singkat tentang halaman ini"
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="content">Konten Halaman *</Label>
                    <Textarea
                      id="content"
                      value={formData.content}
                      onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                      placeholder="Tulis konten halaman dalam format HTML atau Markdown"
                      rows={15}
                      required
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Anda dapat menggunakan HTML tags untuk formatting
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* SEO Settings */}
              <Card>
                <CardHeader>
                  <CardTitle>Pengaturan SEO</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="seo_title">SEO Title</Label>
                    <Input
                      id="seo_title"
                      value={formData.seo_title}
                      onChange={(e) => setFormData(prev => ({ ...prev, seo_title: e.target.value }))}
                      placeholder="Judul untuk mesin pencari (kosong = gunakan judul halaman)"
                    />
                  </div>

                  <div>
                    <Label htmlFor="seo_description">SEO Description</Label>
                    <Textarea
                      id="seo_description"
                      value={formData.seo_description}
                      onChange={(e) => setFormData(prev => ({ ...prev, seo_description: e.target.value }))}
                      placeholder="Deskripsi halaman untuk mesin pencari"
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="seo_keywords">SEO Keywords</Label>
                    <Input
                      id="seo_keywords"
                      value={formData.seo_keywords}
                      onChange={(e) => setFormData(prev => ({ ...prev, seo_keywords: e.target.value }))}
                      placeholder="Kata kunci, pisahkan dengan koma"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Publish Settings */}
              <Card>
                <CardHeader>
                  <CardTitle>Pengaturan Publikasi</CardTitle>
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
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="published">Published</SelectItem>
                        <SelectItem value="archived">Archived</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="page_template">Template</Label>
                    <Select 
                      value={formData.page_template} 
                      onValueChange={(value) => setFormData(prev => ({ ...prev, page_template: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih template" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="default">Default</SelectItem>
                        <SelectItem value="profile">Profile</SelectItem>
                        <SelectItem value="contact">Contact</SelectItem>
                        <SelectItem value="visi-misi">Visi & Misi</SelectItem>
                        <SelectItem value="sejarah">Sejarah</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Navigation Settings */}
              <Card>
                <CardHeader>
                  <CardTitle>Pengaturan Menu</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="show_in_menu">Tampilkan di Menu</Label>
                    <Switch
                      id="show_in_menu"
                      checked={formData.show_in_menu}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, show_in_menu: checked }))}
                    />
                  </div>

                  {formData.show_in_menu && (
                    <div>
                      <Label htmlFor="menu_title">Judul di Menu</Label>
                      <Input
                        id="menu_title"
                        value={formData.menu_title}
                        onChange={(e) => setFormData(prev => ({ ...prev, menu_title: e.target.value }))}
                        placeholder="Kosong = gunakan judul halaman"
                      />
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="space-y-2">
                <Button type="submit" className="w-full">
                  <Save className="h-4 w-4 mr-2" />
                  {editingPage ? 'Perbarui Halaman' : 'Simpan Halaman'}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  className="w-full"
                  onClick={() => {
                    setShowForm(false)
                    setEditingPage(null)
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
          <h1 className="text-2xl font-semibold">Kelola Halaman</h1>
          <p className="text-muted-foreground mt-1">
            Kelola halaman statis website nagari
          </p>
        </div>
        
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Tambah Halaman
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
                  placeholder="Cari halaman..."
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
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Pages Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">#</TableHead>
              <TableHead>Judul</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Template</TableHead>
              <TableHead>Menu</TableHead>
              <TableHead>Terakhir Diupdate</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell><div className="h-4 bg-muted rounded animate-pulse" /></TableCell>
                  <TableCell><div className="h-4 bg-muted rounded animate-pulse w-48" /></TableCell>
                  <TableCell><div className="h-6 bg-muted rounded animate-pulse w-20" /></TableCell>
                  <TableCell><div className="h-4 bg-muted rounded animate-pulse w-24" /></TableCell>
                  <TableCell><div className="h-4 bg-muted rounded animate-pulse w-16" /></TableCell>
                  <TableCell><div className="h-4 bg-muted rounded animate-pulse w-32" /></TableCell>
                  <TableCell><div className="h-8 bg-muted rounded animate-pulse w-8" /></TableCell>
                </TableRow>
              ))
            ) : pages.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  <div className="flex flex-col items-center gap-2">
                    <FileText className="h-12 w-12 text-muted-foreground opacity-50" />
                    <p className="text-muted-foreground">Belum ada halaman</p>
                    <Button variant="outline" size="sm" onClick={() => setShowForm(true)}>
                      Buat halaman pertama
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              pages.map((page: any, index) => (
                <TableRow key={page.id}>
                  <TableCell>{(currentPage - 1) * 10 + index + 1}</TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{page.title}</p>
                      {page.excerpt && (
                        <p className="text-sm text-muted-foreground truncate max-w-96">
                          {page.excerpt}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(page.status)}>
                      {page.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">
                      {page.page_template || 'Default'}
                    </span>
                  </TableCell>
                  <TableCell>
                    {page.show_in_menu ? (
                      <Badge variant="outline">Ya</Badge>
                    ) : (
                      <span className="text-muted-foreground text-sm">Tidak</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">
                      {formatDate(page.updated_at)}
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
                        <DropdownMenuItem onClick={() => handleEdit(page)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-destructive"
                          onClick={() => {
                            setPageToDelete(page)
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
            <DialogTitle>Hapus Halaman</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus halaman "{pageToDelete?.title}"? 
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