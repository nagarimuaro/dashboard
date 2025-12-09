import React, { useState, useEffect } from "react"
import { AppSidebar } from "./components/AppSidebar"
import { Dashboard } from "./components/dashboard"
import { WargaManagement } from "./components/warga-management"
import { DataKeluarga } from "./components/data-keluarga"
import { WargaTest } from "./components/warga-test"
import { PermohonanSurat } from "./components/permohonan-surat"
import { KelolaPermohonan } from "./components/kelola-permohonan"
import { GISMap } from "./components/gis-map"
import { LeafletMap } from "./components/leaflet-map"
import { TemplateManager } from "./components/template-manager"
import { KeuanganDashboard } from "./components/keuangan-dashboard"
import { LayananSurat } from "./components/layanan-surat"
import { Pengaduan } from "./components/pengaduan"
import { ArsipSurat } from "./components/arsip-surat"
import { UserManagement } from "./components/user-management"
import { Settings } from "./components/settings"
import { ProfilePage } from "./components/auth/ProfilePage"
import { CMSDashboard } from "./components/cms-dashboard"
import { CMSNews } from "./components/cms-news"
import { CMSSettings } from "./components/cms-settings"
import StatistikSosialPage from "./pages/StatistikSosialPage"
import { Separator } from "./components/ui/separator"
import { Button } from "./components/ui/button"
import { Badge } from "./components/ui/badge"
import { AppProvider, useApp } from "./context/AppContext"
import { AuthLayout } from "./components/auth/AuthLayout"
import { 
  User, 
  Bell, 
  Settings as SettingsIcon, 
  LogOut,
  ChevronDown
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./components/ui/dropdown-menu"

// Error Boundary Component
class AppErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('App Error Boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="text-center space-y-4 p-8">
            <h1 className="text-2xl font-bold text-destructive">Something went wrong</h1>
            <p className="text-muted-foreground">The application encountered an unexpected error.</p>
            <p className="text-xs text-muted-foreground">
              {this.state.error?.message || 'Unknown error occurred'}
            </p>
            <Button 
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
            >
              Reload Application
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

function AppContent() {
  const [activeModule, setActiveModule] = useState("dashboard")
  const [userRole, setUserRole] = useState<'admin_global' | 'admin_nagari' | 'staff_nagari' | 'warga'>('admin_nagari')
  const [appReady, setAppReady] = useState(false)
  const { user, tenant, logout, unreadCount, loading } = useApp()

  // Ensure app is ready after a brief delay to prevent timeout issues
  useEffect(() => {
    const timer = setTimeout(() => {
      setAppReady(true)
    }, 200)
    
    return () => clearTimeout(timer)
  }, [])
  
  // Use context data or fallback to demo data
  const userData = user || {
    nama: "Ahmad Fauzi",
    role: userRole,
    nagari: tenant?.nama || "Nagari Koto Baru",
    avatar: null
  }

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin_global': return 'Super Admin'
      case 'admin_nagari': return 'Admin Nagari'
      case 'staff_nagari': return 'Staff/Operator'
      case 'warga': return 'Warga'
      default: return 'Unknown'
    }
  }

  const renderContent = () => {
    switch (activeModule) {
      case 'dashboard':
        return <Dashboard userRole={userRole} onModuleChange={setActiveModule} />
      case 'data-warga':
        return <WargaManagement userRole={userRole} />
      case 'warga-test':
        return <WargaTest userRole={userRole} />
      case 'data-keluarga':
        return <DataKeluarga userRole={userRole} />
      
      // Administrasi Kependudukan
      case 'surat-domisili':
      case 'surat-pindah':
      case 'surat-kelahiran':
      case 'surat-kematian':
      case 'surat-belum-menikah':
      case 'surat-nikah':
      case 'surat-janda-duda':
      case 'surat-penghasilan':
      case 'surat-tidak-mampu':
      case 'surat-skck':
      case 'surat-usaha':
      case 'surat-izin-keramaian':
      case 'surat-kepemilikan-tanah':
      case 'surat-ahli-waris':
        return <LayananSurat userRole={userRole} kategori="administrasi-kependudukan" />
      
      // Administrasi Perizinan
      case 'perizinan-imb':
      case 'perizinan-situ':
      case 'perizinan-ho':
      case 'perizinan-siup':
      case 'perizinan-trayek':
      case 'perizinan-reklame':
        return <LayananSurat userRole={userRole} kategori="administrasi-perizinan" />
      
      // Administrasi Sosial
      case 'sosial-miskin':
      case 'sosial-beasiswa':
      case 'sosial-bantuan':
      case 'sosial-jamkesmas':
        return <LayananSurat userRole={userRole} kategori="administrasi-sosial" />
      
      // Statistik Data Sosial
      case 'statistik-sosial':
        return <StatistikSosialPage />
      
      // Administrasi Pertanahan
      case 'pertanahan-sertifikat':
      case 'pertanahan-riwayat':
      case 'pertanahan-jual-beli':
        return <LayananSurat userRole={userRole} kategori="administrasi-pertanahan" />
      
      case 'permohonan-surat':
        return <PermohonanSurat userRole={userRole} />
      case 'kelola-permohonan':
        return <KelolaPermohonan userRole={userRole} />
      case 'template-manager':
        return <TemplateManager userRole={userRole} />
      case 'letterhead-settings':
        return <Settings userRole={userRole} />
      case 'keuangan-apb':
      case 'keuangan-realisasi':
        return <KeuanganDashboard userRole={userRole} />
      case 'gis-peta':
      case 'gis-batas':
        return <LeafletMap userRole={userRole} />
      case 'pengaduan-keluhan':
      case 'pengaduan-tracking':
        return <Pengaduan userRole={userRole} />
      case 'arsip-surat':
        return <ArsipSurat userRole={userRole} />
      case 'backup-restore':
        return <Settings userRole={userRole} />
      case 'user-management':
        return <UserManagement userRole={userRole} />
      case 'settings':
        return <Settings userRole={userRole} />
      case 'profile':
        return <ProfilePage />
      
      // CMS Modules
      case 'cms-dashboard':
        return <CMSDashboard userRole={userRole} onModuleChange={setActiveModule} />
      case 'cms-news':
        return <CMSNews userRole={userRole} onModuleChange={setActiveModule} />
      case 'cms-settings':
        return <CMSSettings userRole={userRole} onModuleChange={setActiveModule} />
      
      default:
        return <Dashboard userRole={userRole} onModuleChange={setActiveModule} />
    }
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <AppSidebar 
        currentPath={activeModule}
        userRole={userRole}
        nagariName={userData.nagari}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Loading State */}
        {(loading || !appReady) && (
          <div className="flex items-center justify-center h-screen">
            <div className="text-center space-y-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="text-muted-foreground">Initializing application...</p>
            </div>
          </div>
        )}
        
        {/* Header */}
        {!loading && appReady && (
          <>
            <header className="flex h-16 shrink-0 items-center gap-2 border-b border-blue-100 px-4" style={{ background: 'linear-gradient(to bottom, #dbeafe, #eff6ff)' }}>
              <div className="flex flex-1 items-center justify-between">
                <div className="flex items-center gap-2">
                  <h1 className="font-semibold">Sistem Informasi Nagari Terpadu</h1>
                  <Badge variant="outline" className="text-xs">
                    {tenant?.nama || userData.nagari}
                  </Badge>
                </div>
                
                <div className="flex items-center gap-2">
                  {/* Role Switcher (Demo) */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">
                        Role: {getRoleLabel(userRole)}
                        <ChevronDown className="h-4 w-4 ml-1" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setUserRole('admin_global')}>
                        Super Admin
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setUserRole('admin_nagari')}>
                        Admin Nagari
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setUserRole('staff_nagari')}>
                        Staff/Operator
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setUserRole('warga')}>
                        Warga
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  
                  {/* Notifications */}
                  <Button variant="ghost" size="sm">
                    <Bell className="h-4 w-4" />
                    {unreadCount > 0 && (
                      <Badge variant="destructive" className="ml-1 px-1 py-0 text-xs">
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </Badge>
                    )}
                  </Button>
                  
                  {/* User Menu */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center">
                          <User className="h-3 w-3 text-primary-foreground" />
                        </div>
                        <span className="text-sm">{userData.nama}</span>
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <div className="px-2 py-1.5 text-sm">
                        <div className="font-medium">{userData.nama}</div>
                        <div className="text-muted-foreground">{getRoleLabel(userRole)}</div>
                      </div>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => setActiveModule('profile')}>
                        <User className="mr-2 h-4 w-4" />
                        Profile
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setActiveModule('settings')}>
                        <SettingsIcon className="mr-2 h-4 w-4" />
                        Settings
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        className="text-destructive"
                        onClick={logout}
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        Logout
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </header>
            
            {/* Main Content */}
            <div className="flex-1 overflow-y-auto p-4">
              {renderContent()}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function AppWithAuth() {
  return (
    <AuthLayout>
      <AppContent />
    </AuthLayout>
  )
}

export default function App() {
  return (
    <AppErrorBoundary>
      <AppProvider>
        <AppWithAuth />
      </AppProvider>
    </AppErrorBoundary>
  )
}