import React from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { AppSidebar } from '../AppSidebar'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { useApp } from '../../context/AppContext'
import { 
  User, 
  Bell, 
  LogOut,
  Settings,
  PanelLeftClose,
  PanelLeft,
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu"

export function AppLayout() {
  const location = useLocation()
  const { user, tenant, logout, unreadCount, loading } = useApp()
  const [sidebarOpen, setSidebarOpen] = React.useState(true)
  
  const testUnreadCount = unreadCount || 5

  const userData = user || {
    nama: 'Demo User',
    role: 'admin_nagari',
    nagari: 'Demo Nagari'
  }
  
  const safeUserRole = userData.role || 'admin_nagari'
  const safeNagariName = userData.nagari || 'Demo Nagari'

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Initializing application...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-100">
      {/* Sidebar */}
      <div className="transition-all duration-300 ease-in-out">
        <AppSidebar 
          currentPath={location.pathname}
          userRole={safeUserRole as 'admin_global' | 'admin_nagari' | 'staff_nagari' | 'warga'}
          nagariName={safeNagariName}
          collapsed={!sidebarOpen}
        />
      </div>
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-blue-100 px-4" style={{ background: 'linear-gradient(to bottom, #dbeafe, #eff6ff)' }}>
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="-ml-2"
              title={sidebarOpen ? 'Tutup Sidebar' : 'Buka Sidebar'}
            >
              {sidebarOpen ? <PanelLeftClose className="h-5 w-5" /> : <PanelLeft className="h-5 w-5" />}
            </Button>
            <h1 className="font-semibold">Sistem Informasi Nagari Terpadu</h1>
            <Badge variant="outline" className="text-xs">
              {tenant?.nama || userData.nagari}
            </Badge>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Notifications */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" title="Notifikasi" className="flex items-center gap-1 relative">
                  <Bell className="h-4 w-4" />
                  <span className="hidden sm:inline text-sm">Notifikasi</span>
                  {testUnreadCount > 0 && (
                    <Badge variant="destructive" className="absolute -top-2 -right-1 px-1 py-0 text-xs min-w-[1.25rem] h-5 flex items-center justify-center rounded-full">
                      {testUnreadCount > 99 ? '99+' : testUnreadCount}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <div className="px-3 py-2 text-sm font-medium border-b">
                  Notifikasi
                  {testUnreadCount > 0 && (
                    <Badge variant="secondary" className="ml-2 text-xs">
                      {testUnreadCount}
                    </Badge>
                  )}
                </div>
                <div className="max-h-96 overflow-y-auto">
                  <DropdownMenuItem className="flex flex-col items-start p-3 space-y-1">
                    <div className="flex items-center justify-between w-full">
                      <span className="text-sm font-medium">Permohonan Surat Baru</span>
                      <span className="text-xs text-muted-foreground">2 menit lalu</span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      Ahmad Rizki mengajukan permohonan surat domisili
                    </span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="flex flex-col items-start p-3 space-y-1">
                    <div className="flex items-center justify-between w-full">
                      <span className="text-sm font-medium">Update Sistem</span>
                      <span className="text-xs text-muted-foreground">1 jam lalu</span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      Sistem telah diperbarui ke versi 2.1.0
                    </span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="flex flex-col items-start p-3 space-y-1">
                    <div className="flex items-center justify-between w-full">
                      <span className="text-sm font-medium">Data Warga</span>
                      <span className="text-xs text-muted-foreground">3 jam lalu</span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      5 data warga baru telah ditambahkan
                    </span>
                  </DropdownMenuItem>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-center py-2 text-sm text-primary">
                  Lihat Semua Notifikasi
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="flex items-center gap-2 border">
                  <span className="text-sm font-medium pl-3 pr-2 py-1 text-foreground uppercase">
                    AHMAD FAUZI
                  </span>
                  <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center">
                    <User className="h-3 w-3 text-primary-foreground" />
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-1.5 text-sm">
                  <div className="font-medium">Ahmad Fauzi</div>
                  <div className="text-muted-foreground">Admin Nagari</div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <a href="/profile" className="flex items-center">
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </a>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <a href="/system/settings" className="flex items-center">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </a>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="flex items-center text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <div className="p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
