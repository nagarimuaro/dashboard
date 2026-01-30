import React, { useState, useEffect, useRef } from "react"
import { 
  Plus, 
  Search, 
  Image as ImageIcon,
  Eye,
  Edit,
  Trash2,
  MoreVertical,
  ChevronLeft,
  Save,
  ArrowUpDown,
  Upload,
  X,
  GripVertical,
  ExternalLink,
  Monitor,
  Smartphone,
  ToggleLeft,
  ToggleRight
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
import cmsService from "../services/cmsService-fixed"

interface CMSHeroBannersProps {
  userRole: string
  onModuleChange: (module: string) => void
}

interface HeroBanner {
  id: number
  title: string
  subtitle?: string
  description?: string
  image_url?: string
  mobile_image_url?: string
  button_text?: string
  button_url?: string
  button_target?: string
  overlay_color?: string
  text_position?: string
  text_align?: string
  is_active: boolean
  sort_order: number
  start_date?: string
  end_date?: string
  created_at: string
  updated_at: string
}

const TEXT_POSITIONS = [
  { value: "left", label: "Kiri" },
  { value: "center", label: "Tengah" },
  { value: "right", label: "Kanan" }
]

const TEXT_ALIGNS = [
  { value: "left", label: "Rata Kiri" },
  { value: "center", label: "Rata Tengah" },
  { value: "right", label: "Rata Kanan" }
]

const BUTTON_TARGETS = [
  { value: "_self", label: "Tab Sama" },
  { value: "_blank", label: "Tab Baru" }
]

export function CMSHeroBanners({ userRole, onModuleChange }: CMSHeroBannersProps) {
  const [banners, setBanners] = useState<HeroBanner[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [showForm, setShowForm] = useState(false)
  const [editingBanner, setEditingBanner] = useState<HeroBanner | null>(null)
  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    description: "",
    image_url: "",
    mobile_image_url: "",
    button_text: "",
    button_url: "",
    button_target: "_self",
    overlay_color: "rgba(0,0,0,0.4)",
    text_position: "center",
    text_align: "center",
    is_active: true,
    sort_order: 1,
    start_date: "",
    end_date: ""
  })
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [bannerToDelete, setBannerToDelete] = useState<HeroBanner | null>(null)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [previewMode, setPreviewMode] = useState<"desktop" | "mobile">("desktop")
  
  // Store actual files for upload
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [mobileImageFile, setMobileImageFile] = useState<File | null>(null)
  
  const imageInputRef = useRef<HTMLInputElement>(null)
  const mobileImageInputRef = useRef<HTMLInputElement>(null)

  // Get tenant ID from localStorage
  const tenantId = JSON.parse(localStorage.getItem('current_tenant') || '{}')?.id || 1

  useEffect(() => {
    fetchBanners()
  }, [searchQuery, statusFilter])

  const fetchBanners = async () => {
    setLoading(true)
    try {
      const response = await cmsService.getHeroBanners(tenantId)
      console.log('Hero banners API response:', response)
      
      if (response.success && response.data) {
        let filteredBanners = response.data
        console.log('Banner data:', filteredBanners.map((b: HeroBanner) => ({ id: b.id, title: b.title, image_url: b.image_url })))
        
        if (searchQuery) {
          filteredBanners = filteredBanners.filter((b: HeroBanner) => 
            b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            b.subtitle?.toLowerCase().includes(searchQuery.toLowerCase())
          )
        }
        
        if (statusFilter !== "all") {
          filteredBanners = filteredBanners.filter((b: HeroBanner) => 
            statusFilter === "active" ? b.is_active : !b.is_active
          )
        }
        
        setBanners(filteredBanners.sort((a: HeroBanner, b: HeroBanner) => a.sort_order - b.sort_order))
      } else {
        // Fallback mock data
        const mockBanners: HeroBanner[] = [
          {
            id: 1,
            title: "Selamat Datang di Portal Nagari",
            subtitle: "Membangun Nagari Yang Maju dan Sejahtera",
            description: "Portal resmi informasi dan layanan nagari",
            image_url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&h=600&fit=crop",
            button_text: "Pelajari Lebih Lanjut",
            button_url: "/profil",
            overlay_color: "rgba(0,0,0,0.4)",
            text_position: "center",
            text_align: "center",
            is_active: true,
            sort_order: 1,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: 2,
            title: "Layanan Online 24 Jam",
            subtitle: "Akses Layanan Kapan Saja",
            image_url: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1920&h=600&fit=crop",
            button_text: "Akses Layanan",
            button_url: "/layanan",
            overlay_color: "rgba(0,0,0,0.5)",
            text_position: "left",
            text_align: "left",
            is_active: true,
            sort_order: 2,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ]
        setBanners(mockBanners)
      }
    } catch (error) {
      console.error('Error fetching banners:', error)
      toast.error("Gagal memuat data banner")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title.trim()) {
      toast.error("Judul banner wajib diisi")
      return
    }

    try {
      let response
      if (editingBanner) {
        // @ts-ignore - cmsService is JS, types are not defined
        response = await cmsService.updateHeroBanner(tenantId, editingBanner.id, formData, imageFile, mobileImageFile)
      } else {
        // @ts-ignore - cmsService is JS, types are not defined
        response = await cmsService.createHeroBanner(tenantId, formData, imageFile, mobileImageFile)
      }

      if (response.success) {
        toast.success(editingBanner ? "Banner berhasil diperbarui" : "Banner berhasil ditambahkan")
        resetForm()
        fetchBanners()
      } else {
        toast.error(response.error || "Gagal menyimpan banner")
      }
    } catch (error) {
      console.error('Error saving banner:', error)
      toast.error("Gagal menyimpan banner")
    }
  }

  const handleDelete = async () => {
    if (!bannerToDelete) return

    try {
      const response = await cmsService.deleteHeroBanner(tenantId, bannerToDelete.id)
      
      if (response.success) {
        toast.success("Banner berhasil dihapus")
        setDeleteDialogOpen(false)
        setBannerToDelete(null)
        fetchBanners()
      } else {
        toast.error(response.error || "Gagal menghapus banner")
      }
    } catch (error) {
      console.error('Error deleting banner:', error)
      toast.error("Gagal menghapus banner")
    }
  }

  const handleToggleActive = async (banner: HeroBanner) => {
    try {
      const response = await cmsService.updateHeroBanner(tenantId, banner.id, {
        ...banner,
        is_active: !banner.is_active
      })
      
      if (response.success) {
        toast.success(`Banner ${!banner.is_active ? 'diaktifkan' : 'dinonaktifkan'}`)
        fetchBanners()
      }
    } catch (error) {
      console.error('Error toggling banner:', error)
      toast.error("Gagal mengubah status banner")
    }
  }

  const handleImageUpload = async (file: File, type: 'desktop' | 'mobile') => {
    if (!file) return

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      toast.error("Format file tidak didukung. Gunakan JPG, PNG, atau WebP")
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Ukuran file maksimal 5MB")
      return
    }

    // Store the file for later upload during form submission
    if (type === 'desktop') {
      setImageFile(file)
    } else {
      setMobileImageFile(file)
    }

    // Create preview using FileReader
    const reader = new FileReader()
    reader.onload = (e) => {
      const base64Url = e.target?.result as string
      if (type === 'desktop') {
        setFormData(prev => ({ ...prev, image_url: base64Url }))
      } else {
        setFormData(prev => ({ ...prev, mobile_image_url: base64Url }))
      }
    }
    reader.readAsDataURL(file)
    toast.success("Gambar berhasil dipilih")
  }

  const handleEdit = (banner: HeroBanner) => {
    console.log('Editing banner:', banner)
    console.log('Banner image_url:', banner.image_url)
    setEditingBanner(banner)
    setFormData({
      title: banner.title,
      subtitle: banner.subtitle || "",
      description: banner.description || "",
      image_url: banner.image_url || "",
      mobile_image_url: banner.mobile_image_url || "",
      button_text: banner.button_text || "",
      button_url: banner.button_url || "",
      button_target: banner.button_target || "_self",
      overlay_color: banner.overlay_color || "rgba(0,0,0,0.4)",
      text_position: banner.text_position || "center",
      text_align: banner.text_align || "center",
      is_active: banner.is_active,
      sort_order: banner.sort_order,
      start_date: banner.start_date || "",
      end_date: banner.end_date || ""
    })
    // Reset file states when editing (will use existing images unless new ones are uploaded)
    setImageFile(null)
    setMobileImageFile(null)
    setShowForm(true)
  }

  const resetForm = () => {
    setFormData({
      title: "",
      subtitle: "",
      description: "",
      image_url: "",
      mobile_image_url: "",
      button_text: "",
      button_url: "",
      button_target: "_self",
      overlay_color: "rgba(0,0,0,0.4)",
      text_position: "center",
      text_align: "center",
      is_active: true,
      sort_order: banners.length + 1,
      start_date: "",
      end_date: ""
    })
    setEditingBanner(null)
    setImageFile(null)
    setMobileImageFile(null)
    setShowForm(false)
  }

  // Stats
  const totalBanners = banners.length
  const activeBanners = banners.filter(b => b.is_active).length

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
              {editingBanner ? "Edit Banner" : "Tambah Banner Baru"}
            </h1>
            <p className="text-muted-foreground">
              {editingBanner ? "Perbarui banner hero" : "Tambahkan banner baru untuk halaman utama"}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Main Form */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Informasi Banner</CardTitle>
                  <CardDescription>Judul dan teks yang ditampilkan di banner</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Judul Banner *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                      placeholder="Contoh: Selamat Datang di Portal Nagari"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subtitle">Subtitle</Label>
                    <Input
                      id="subtitle"
                      value={formData.subtitle}
                      onChange={(e) => setFormData({...formData, subtitle: e.target.value})}
                      placeholder="Contoh: Membangun Nagari Yang Maju"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Deskripsi</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      placeholder="Deskripsi singkat banner..."
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Gambar Banner</CardTitle>
                  <CardDescription>Upload gambar untuk desktop dan mobile (opsional)</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Desktop Image */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Monitor className="h-4 w-4" />
                      Gambar Desktop (1920x600)
                    </Label>
                    {formData.image_url ? (
                      <div className="relative">
                        <img 
                          src={formData.image_url} 
                          alt="Desktop preview" 
                          className="w-full h-40 object-cover rounded-lg bg-muted"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            target.nextElementSibling?.classList.remove('hidden');
                          }}
                        />
                        <div className="hidden w-full h-40 bg-muted rounded-lg flex items-center justify-center">
                          <div className="text-center">
                            <ImageIcon className="h-8 w-8 mx-auto text-muted-foreground" />
                            <p className="text-xs text-muted-foreground mt-1">Gagal memuat gambar</p>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute top-2 right-2"
                          onClick={() => {
                            setFormData({...formData, image_url: ""});
                            setImageFile(null);
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <div 
                        className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => imageInputRef.current?.click()}
                      >
                        <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">
                          Klik untuk upload gambar desktop
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          JPG, PNG, WebP (Max 5MB)
                        </p>
                      </div>
                    )}
                    <input
                      ref={imageInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) handleImageUpload(file, 'desktop')
                      }}
                    />
                    <Input
                      placeholder="Atau masukkan URL gambar..."
                      value={formData.image_url}
                      onChange={(e) => setFormData({...formData, image_url: e.target.value})}
                    />
                  </div>

                  {/* Mobile Image */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Smartphone className="h-4 w-4" />
                      Gambar Mobile (768x400) - Opsional
                    </Label>
                    {formData.mobile_image_url ? (
                      <div className="relative max-w-xs">
                        <img 
                          src={formData.mobile_image_url} 
                          alt="Mobile preview" 
                          className="w-full h-32 object-cover rounded-lg bg-muted"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            target.nextElementSibling?.classList.remove('hidden');
                          }}
                        />
                        <div className="hidden w-full h-32 bg-muted rounded-lg flex items-center justify-center">
                          <div className="text-center">
                            <ImageIcon className="h-6 w-6 mx-auto text-muted-foreground" />
                            <p className="text-xs text-muted-foreground mt-1">Gagal memuat</p>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute top-2 right-2"
                          onClick={() => {
                            setFormData({...formData, mobile_image_url: ""});
                            setMobileImageFile(null);
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <div 
                        className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:bg-muted/50 transition-colors max-w-xs"
                        onClick={() => mobileImageInputRef.current?.click()}
                      >
                        <Upload className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">
                          Upload gambar mobile
                        </p>
                      </div>
                    )}
                    <input
                      ref={mobileImageInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) handleImageUpload(file, 'mobile')
                      }}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Tombol CTA</CardTitle>
                  <CardDescription>Tombol aksi pada banner (opsional)</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="button_text">Teks Tombol</Label>
                      <Input
                        id="button_text"
                        value={formData.button_text}
                        onChange={(e) => setFormData({...formData, button_text: e.target.value})}
                        placeholder="Contoh: Pelajari Lebih Lanjut"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="button_url">URL Tombol</Label>
                      <Input
                        id="button_url"
                        value={formData.button_url}
                        onChange={(e) => setFormData({...formData, button_url: e.target.value})}
                        placeholder="Contoh: /profil atau https://..."
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Target Tombol</Label>
                    <Select 
                      value={formData.button_target} 
                      onValueChange={(value: string) => setFormData({...formData, button_target: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {BUTTON_TARGETS.map(target => (
                          <SelectItem key={target.value} value={target.value}>
                            {target.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Pengaturan Tampilan</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Posisi Teks</Label>
                    <Select 
                      value={formData.text_position} 
                      onValueChange={(value: string) => setFormData({...formData, text_position: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {TEXT_POSITIONS.map(pos => (
                          <SelectItem key={pos.value} value={pos.value}>
                            {pos.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Rata Teks</Label>
                    <Select 
                      value={formData.text_align} 
                      onValueChange={(value: string) => setFormData({...formData, text_align: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {TEXT_ALIGNS.map(align => (
                          <SelectItem key={align.value} value={align.value}>
                            {align.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="overlay_color">Warna Overlay</Label>
                    <Input
                      id="overlay_color"
                      value={formData.overlay_color}
                      onChange={(e) => setFormData({...formData, overlay_color: e.target.value})}
                      placeholder="rgba(0,0,0,0.4)"
                    />
                    <p className="text-xs text-muted-foreground">
                      Format: rgba(r,g,b,opacity)
                    </p>
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
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Jadwal Tayang</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
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
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="is_active">Aktif</Label>
                    <Switch
                      id="is_active"
                      checked={formData.is_active}
                      onCheckedChange={(checked: boolean) => setFormData({...formData, is_active: checked})}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Banner akan ditampilkan jika status aktif
                  </p>
                </CardContent>
              </Card>

              <div className="flex gap-2">
                <Button type="button" variant="outline" className="flex-1" onClick={resetForm}>
                  Batal
                </Button>
                <Button type="submit" className="flex-1">
                  <Save className="h-4 w-4 mr-2" />
                  {editingBanner ? "Simpan" : "Tambah"}
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Hero Banners</h1>
          <p className="text-muted-foreground">Kelola banner untuk halaman utama website</p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Tambah Banner
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Banner</p>
                <p className="text-2xl font-bold">{totalBanners}</p>
              </div>
              <ImageIcon className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Banner Aktif</p>
                <p className="text-2xl font-bold text-green-600">{activeBanners}</p>
              </div>
              <ToggleRight className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Banner Nonaktif</p>
                <p className="text-2xl font-bold text-gray-500">{totalBanners - activeBanners}</p>
              </div>
              <ToggleLeft className="h-8 w-8 text-gray-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari banner..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter Status" />
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

      {/* Banner List */}
      <Card>
        <CardContent className="pt-6">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
              <p className="mt-2 text-muted-foreground">Memuat data...</p>
            </div>
          ) : banners.length === 0 ? (
            <div className="text-center py-8">
              <ImageIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Belum ada banner</p>
              <Button className="mt-4" onClick={() => setShowForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Tambah Banner Pertama
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {banners.map((banner, index) => (
                <div 
                  key={banner.id} 
                  className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <GripVertical className="h-5 w-5 cursor-grab" />
                    <span className="text-sm font-medium w-6">{index + 1}</span>
                  </div>
                  
                  {banner.image_url ? (
                    <img 
                      src={banner.image_url} 
                      alt={banner.title}
                      className="w-32 h-20 object-cover rounded-md flex-shrink-0"
                    />
                  ) : (
                    <div className="w-32 h-20 bg-muted rounded-md flex items-center justify-center flex-shrink-0">
                      <ImageIcon className="h-8 w-8 text-muted-foreground" />
                    </div>
                  )}
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium truncate">{banner.title}</h3>
                    {banner.subtitle && (
                      <p className="text-sm text-muted-foreground truncate">{banner.subtitle}</p>
                    )}
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant={banner.is_active ? "default" : "secondary"}>
                        {banner.is_active ? "Aktif" : "Nonaktif"}
                      </Badge>
                      {banner.button_text && (
                        <Badge variant="outline">
                          <ExternalLink className="h-3 w-3 mr-1" />
                          {banner.button_text}
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleToggleActive(banner)}
                    >
                      {banner.is_active ? (
                        <ToggleRight className="h-5 w-5 text-green-600" />
                      ) : (
                        <ToggleLeft className="h-5 w-5 text-gray-400" />
                      )}
                    </Button>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(banner)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-red-600"
                          onClick={() => {
                            setBannerToDelete(banner)
                            setDeleteDialogOpen(true)
                          }}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Hapus
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Banner?</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus banner "{bannerToDelete?.title}"? 
              Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
