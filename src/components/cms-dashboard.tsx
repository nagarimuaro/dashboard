import React, { useState, useEffect } from "react"
import { 
  Plus, 
  Search, 
  Filter,
  FileText,
  Newspaper,
  Settings as SettingsIcon,
  FolderOpen,
  Eye,
  Edit,
  Trash2,
  MoreVertical,
  Calendar,
  User,
  Globe,
  TrendingUp
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Badge } from "./ui/badge"
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
import cmsService from "../services/cmsService-fixed"

interface CMSDashboardProps {
  userRole: string
  onModuleChange: (module: string) => void
}

export function CMSDashboard({ userRole, onModuleChange }: CMSDashboardProps) {
  const [stats, setStats] = useState({
    pages: { total: 0, published: 0, draft: 0 },
    news: { total: 0, published: 0, draft: 0 },
    services: { total: 0, active: 0, inactive: 0 }
  })
  const [recentPages, setRecentPages] = useState([])
  const [recentNews, setRecentNews] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedFilter, setSelectedFilter] = useState("all")

  // Get tenant ID from localStorage
  const tenantId = JSON.parse(localStorage.getItem('current_tenant') || '{}')?.id || 1

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    setLoading(true)
    try {
      // Fetch recent data for dashboard
      const [pagesRes, newsRes, servicesRes] = await Promise.all([
        cmsService.getAdminPages(tenantId, { per_page: 5 }),
        cmsService.getAdminNews(tenantId, { per_page: 5 }),
        cmsService.getAdminServices(tenantId, { per_page: 5 })
      ])

      if (pagesRes.success) {
        setRecentPages(pagesRes.data)
        setStats(prev => ({
          ...prev,
          pages: {
            total: pagesRes.meta?.total || 0,
            published: pagesRes.data.filter(p => p.status === 'published').length,
            draft: pagesRes.data.filter(p => p.status === 'draft').length
          }
        }))
      }

      if (newsRes.success) {
        setRecentNews(newsRes.data)
        setStats(prev => ({
          ...prev,
          news: {
            total: newsRes.meta?.total || 0,
            published: newsRes.data.filter(n => n.status === 'published').length,
            draft: newsRes.data.filter(n => n.status === 'draft').length
          }
        }))
      }

      if (servicesRes.success) {
        setStats(prev => ({
          ...prev,
          services: {
            total: servicesRes.data.length,
            active: servicesRes.data.filter(s => s.status === 'active').length,
            inactive: servicesRes.data.filter(s => s.status === 'inactive').length
          }
        }))
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'draft':
        return 'bg-yellow-100 text-yellow-800'
      case 'archived':
      case 'inactive':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Content Management System</h1>
            <p className="text-muted-foreground mt-1">
              Kelola konten website nagari
            </p>
          </div>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader className="space-y-0 pb-2">
                <div className="h-4 bg-muted rounded animate-pulse" />
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded animate-pulse mb-2" />
                <div className="h-3 bg-muted rounded animate-pulse w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Content Management System</h1>
          <p className="text-muted-foreground mt-1">
            Kelola konten website nagari
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            onClick={() => onModuleChange('cms-settings')}
          >
            <SettingsIcon className="h-4 w-4 mr-2" />
            Pengaturan
          </Button>
          <Button onClick={() => onModuleChange('cms-pages')}>
            <Plus className="h-4 w-4 mr-2" />
            Konten Baru
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => onModuleChange('cms-pages')}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Halaman</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pages.total}</div>
            <p className="text-xs text-muted-foreground">
              {stats.pages.published} published, {stats.pages.draft} draft
            </p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => onModuleChange('cms-news')}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Berita</CardTitle>
            <Newspaper className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.news.total}</div>
            <p className="text-xs text-muted-foreground">
              {stats.news.published} published, {stats.news.draft} draft
            </p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => onModuleChange('cms-services')}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Layanan</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.services.total}</div>
            <p className="text-xs text-muted-foreground">
              {stats.services.active} aktif, {stats.services.inactive} nonaktif
            </p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => onModuleChange('cms-categories')}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Kategori</CardTitle>
            <FolderOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">
              News, Services, Documents
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Button 
          variant="outline" 
          className="h-20 flex-col gap-2"
          onClick={() => onModuleChange('cms-pages')}
        >
          <FileText className="h-6 w-6" />
          Kelola Halaman
        </Button>
        
        <Button 
          variant="outline" 
          className="h-20 flex-col gap-2"
          onClick={() => onModuleChange('cms-news')}
        >
          <Newspaper className="h-6 w-6" />
          Kelola Berita
        </Button>
        
        <Button 
          variant="outline" 
          className="h-20 flex-col gap-2"
          onClick={() => onModuleChange('cms-services')}
        >
          <Globe className="h-6 w-6" />
          Kelola Layanan
        </Button>
        
        <Button 
          variant="outline" 
          className="h-20 flex-col gap-2"
          onClick={() => onModuleChange('cms-settings')}
        >
          <SettingsIcon className="h-6 w-6" />
          Pengaturan Situs
        </Button>
      </div>

      {/* Recent Content */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Pages */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Halaman Terbaru</CardTitle>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => onModuleChange('cms-pages')}
            >
              Lihat Semua
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentPages.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Belum ada halaman yang dibuat</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-2"
                  onClick={() => onModuleChange('cms-pages')}
                >
                  Buat Halaman Pertama
                </Button>
              </div>
            ) : (
              recentPages.slice(0, 5).map((page: any) => (
                <div key={page.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium">{page.title}</h4>
                    <p className="text-sm text-muted-foreground">
                      Diupdate {formatDate(page.updated_at)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(page.status)}>
                      {page.status}
                    </Badge>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Eye className="h-4 w-4 mr-2" />
                          Lihat
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Hapus
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Recent News */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Berita Terbaru</CardTitle>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => onModuleChange('cms-news')}
            >
              Lihat Semua
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentNews.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Newspaper className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Belum ada berita yang dibuat</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-2"
                  onClick={() => onModuleChange('cms-news')}
                >
                  Buat Berita Pertama
                </Button>
              </div>
            ) : (
              recentNews.slice(0, 5).map((news: any) => (
                <div key={news.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium">{news.title}</h4>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(news.published_at || news.created_at)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {news.is_featured && (
                      <Badge variant="secondary">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        Featured
                      </Badge>
                    )}
                    <Badge className={getStatusColor(news.status)}>
                      {news.status}
                    </Badge>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Eye className="h-4 w-4 mr-2" />
                          Lihat
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Hapus
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}