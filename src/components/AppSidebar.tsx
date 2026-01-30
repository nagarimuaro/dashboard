import React from "react"
import { Link, useLocation } from 'react-router-dom'
import { 
  BarChart3, 
  Globe, 
  Users, 
  FileText, 
  Map, 
  DollarSign, 
  MessageSquare, 
  Archive, 
  Settings,
  ChevronDown,
  UserCog,
  Heart,
  User,
  Stethoscope,
  MapPin,
  Store,
  PieChart,
  Baby,
  School,
  Beef,
} from "lucide-react"
import { cn } from "./ui/utils"
import { useApp } from "../context/AppContext"

interface AppSidebarProps {
  currentPath: string
  userRole: 'admin_global' | 'admin_nagari' | 'staff_nagari' | 'warga'
  nagariName: string
  collapsed?: boolean
}

// Mapping menu ke permission key
const menuPermissionMap: Record<string, string> = {
  'Dashboard': 'dashboard',
  'Kependudukan': 'data_warga', // Jika punya data_warga atau data_keluarga
  'Wilayah': 'data_warga', // Same permission as Kependudukan
  'Pelayanan Surat': 'surat',
  'CMS': 'cms',
  'Keuangan': 'keuangan',
  'GIS': 'gis',
  'Data Sosial': 'data_sosial',
  'UMKM': 'data_sosial', // UMKM uses same permission as data sosial
  'Kader Posyandu': 'kader',
  'Pengaduan': 'pengaduan',
  'Arsip & Dokumen': 'arsip',
  'User Management': 'user_management',
  'Settings': 'settings',
}

export function AppSidebar({ 
  currentPath, 
  userRole = 'admin_nagari', 
  nagariName = 'Demo Nagari',
  collapsed = false
}: AppSidebarProps) {
  const location = useLocation()
  const { hasPermission, user } = useApp()
  const [openMenus, setOpenMenus] = React.useState<string[]>([])

  const navigation = [
    {
      title: "Dashboard",
      icon: BarChart3,
      url: "/dashboard",
      items: [],
    },
    {
      title: "Kependudukan",
      icon: Users,
      url: "/kependudukan",
      items: [
        { title: "Data Warga", url: "/kependudukan/data-warga" },
        { title: "Data Keluarga", url: "/kependudukan/data-keluarga" },
      ],
    },
    {
      title: "Management Jorong",
      icon: MapPin,
      url: "/wilayah",
      items: [
        { title: "Kelola Jorong", url: "/wilayah/jorong" },
      ],
    },
    {
      title: "Pelayanan Surat",
      icon: FileText,
      url: "/pelayanan",
      items: [
        { title: "WhatsApp Request", url: "/pelayanan/surat-request" },
        { title: "Template Surat", url: "/pelayanan/template-surat" },
      ],
    },
    {
      title: "Websistem & CMS",
      icon: Globe,
      url: "/cms",
      items: [
        { title: "Dashboard", url: "/cms/dashboard" },
        { title: "Hero Banners", url: "/cms/hero-banners" },
        { title: "Berita & Artikel", url: "/cms/news" },
        { title: "Halaman Statis", url: "/cms/pages" },
        { title: "Layanan Publik", url: "/cms/services" },
        { title: "Dokumen Publik", url: "/cms/documents" },
        { title: "Struktur Organisasi", url: "/cms/staff" },
        { title: "Kategori", url: "/cms/categories" },
        { title: "Pengaturan", url: "/cms/settings" },
      ],
    },
    {
      title: "Keuangan Nagari",
      icon: DollarSign,
      url: "/keuangan",
      items: [
        { title: "APB Dashboard", url: "/keuangan/apb" },
        { title: "Realisasi Anggaran", url: "/keuangan/realisasi" },
      ],
    },
    {
      title: "WebGIS",
      icon: Map,
      url: "/gis",
      items: [
        { title: "Peta Digital", url: "/gis/peta" },
        { title: "Batas Wilayah", url: "/gis/batas" },
      ],
    },
    {
      title: "Data Nagari",
      icon: Heart,
      url: "/data-sosial",
      items: [
        { title: "Demografi", url: "/demografi" },
        { title: "Data Kesehatan", url: "/data-sosial/kesehatan" },
        { title: "Data Kemiskinan", url: "/data-sosial/kemiskinan" },
        { title: "Pola Asuh & Gizi", url: "/data-sosial-baru" },
        { title: "Infrastruktur Rumah", url: "/data-sosial/infrastruktur" },
        { title: "Yatim Piatu", url: "/data-sosial/yatim-piatu" },
        { title: "Lembaga Keagamaan", url: "/data-lembaga/keagamaan" },
        { title: "Lembaga Pendidikan", url: "/data-lembaga/pendidikan" },
        { title: "Peternakan", url: "/data-ekonomi/ternak" },
        { title: "Pajak (PBB)", url: "/data-ekonomi/pbb" },
      ],
    },
    {
      title: "UMKM  Nagari",
      icon: Store,
      url: "/umkm",
      items: [
        { title: "Direktori UMKM", url: "/umkm/direktori" },
        { title: "Kategori Usaha", url: "/umkm/kategori" },
      ],
    },
    {
      title: "Kader Nagari",
      icon: Stethoscope,
      url: "/kader",
      items: [
        { title: "Manajemen Kader", url: "/kader/management" },
        { title: "Kelompok Kader", url: "/kader/kelompok" },
        { title: "Penugasan Kader", url: "/kader/tugas" },
        { title: "Performa Kader", url: "/kader/performa" },
      ],
    },
    {
      title: "Pengaduan",
      icon: MessageSquare,
      url: "/pengaduan",
      items: [
        { title: "Keluhan Masyarakat", url: "/pengaduan/keluhan" },
        { title: "Tracking Pengaduan", url: "/pengaduan/tracking" },
      ],
    },
    {
      title: "Arsip & Dokumen",
      icon: Archive,
      url: "/system",
      items: [
        { title: "Arsip Surat", url: "/system/arsip-surat" },
        { title: "Backup & Restore", url: "/system/backup" },
      ],
    },
  ]

  const adminNavigation = [
    {
      title: "User Management",
      icon: UserCog,
      url: "/system/user-management",
    },
    {
      title: "Pengaturan",
      icon: Settings,
      url: "/system/settings",
    },
  ]

  const isActive = (url: string) => {
    if (url === "/dashboard" && location.pathname === "/") return true
    return location.pathname.startsWith(url)
  }

  const isSubmenuActive = (items: { url: string; isHeader?: boolean }[]): boolean => {
    return items.some(item => !item.isHeader && item.url !== '#' && location.pathname.startsWith(item.url))
  }

  const toggleMenu = (title: string) => {
    setOpenMenus(prev => 
      prev.includes(title) 
        ? prev.filter(t => t !== title)
        : [...prev, title]
    )
  }

  const isMenuOpen = (title: string, items: { url: string }[]) => {
    // Jika sudah ada di openMenus, gunakan state tersebut
    // Jika belum pernah di-toggle dan ada submenu aktif, buka otomatis
    if (openMenus.includes(title)) {
      return true;
    }
    // Auto-open jika submenu aktif dan belum pernah di-close manual
    // Kita track dengan menambahkan prefix "closed_" untuk menu yang sudah di-close
    if (openMenus.includes(`closed_${title}`)) {
      return false;
    }
    return isSubmenuActive(items);
  }

  const toggleMenuEnhanced = (title: string) => {
    setOpenMenus(prev => {
      const isCurrentlyOpen = prev.includes(title) || (!prev.includes(`closed_${title}`) && isSubmenuActive(navigation.find(n => n.title === title)?.items || []));
      
      if (isCurrentlyOpen) {
        // Tutup menu - hapus dari open, tambah ke closed
        return [...prev.filter(t => t !== title), `closed_${title}`];
      } else {
        // Buka menu - tambah ke open, hapus dari closed
        return [...prev.filter(t => t !== `closed_${title}`), title];
      }
    });
  }

  const getFilteredNavigation = () => {
    // Admin global melihat semua menu
    if (userRole === 'admin_global') {
      return navigation
    }
    
    // Filter berdasarkan permissions dari context
    return navigation.filter(item => {
      const permissionKey = menuPermissionMap[item.title]
      
      // Jika tidak ada mapping permission, tampilkan (untuk backward compatibility)
      if (!permissionKey) return true
      
      // Cek permission dari user
      return hasPermission(permissionKey)
    })
  }

  // Filter admin navigation berdasarkan permissions
  const getFilteredAdminNavigation = () => {
    // Admin global melihat semua menu admin
    if (userRole === 'admin_global') {
      return adminNavigation
    }
    
    return adminNavigation.filter(item => {
      const permissionKey = menuPermissionMap[item.title]
      
      if (!permissionKey) return true
      
      return hasPermission(permissionKey)
    })
  }

  const filteredNavigation = getFilteredNavigation()

  // Collapsed mode - icon only
  if (collapsed) {
    return (
      <div className="flex flex-col w-16 h-full overflow-hidden text-blue-700 border-r border-blue-200" style={{ background: 'linear-gradient(to bottom, #dbeafe, #eff6ff)' }}>
        {/* Logo Header */}
        <a className="flex items-center justify-center mt-3" href="#">
          <img 
            src="/assets/sintalogo.svg" 
            alt="SINTA Logo" 
            className="h-8 w-8 object-contain"
          />
        </a>
        
        {/* Main Navigation - Icons only */}
        <div className="flex flex-col items-center mt-3 border-t border-blue-200 flex-1 overflow-y-auto pt-1">
          {filteredNavigation.map((item) => (
            <Link
              key={item.title}
              to={item.items.length > 0 ? item.items[0].url : item.url}
              className="flex items-center justify-center w-12 h-12 mt-1 rounded-lg transition-all duration-200"
              style={(isActive(item.url) || isSubmenuActive(item.items)) ? { backgroundColor: '#2563eb', color: 'white' } : {}}
              title={item.title}
              onMouseEnter={(e) => {
                if (!isActive(item.url) && !isSubmenuActive(item.items)) {
                  e.currentTarget.style.backgroundColor = '#60a5fa';
                  e.currentTarget.style.color = 'white';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive(item.url) && !isSubmenuActive(item.items)) {
                  e.currentTarget.style.backgroundColor = '';
                  e.currentTarget.style.color = '';
                }
              }}
            >
              <item.icon className="w-6 h-6 stroke-current" />
            </Link>
          ))}
          
          {/* Admin Section - Icons only */}
          {getFilteredAdminNavigation().length > 0 && (
            <div className="flex flex-col items-center mt-2 border-t border-blue-200 pt-2 w-full">
              {getFilteredAdminNavigation().map((item) => (
                <Link
                  key={item.url}
                  to={item.url}
                  className="flex items-center justify-center w-12 h-12 mt-1 mx-auto rounded-lg transition-all duration-200"
                  style={isActive(item.url) ? { backgroundColor: '#2563eb', color: 'white' } : {}}
                  title={item.title}
                  onMouseEnter={(e) => {
                    if (!isActive(item.url)) {
                      e.currentTarget.style.backgroundColor = '#60a5fa';
                      e.currentTarget.style.color = 'white';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive(item.url)) {
                      e.currentTarget.style.backgroundColor = '';
                      e.currentTarget.style.color = '';
                    }
                  }}
                >
                  <item.icon className="w-6 h-6 stroke-current" />
                </Link>
              ))}
            </div>
          )}
        </div>
        
        {/* Account Footer */}
        <Link 
          to="/profile"
          className="flex items-center justify-center w-full h-14 mt-auto bg-blue-200/30 hover:bg-blue-400 text-blue-700 hover:text-white transition-all duration-200"
          title="Account"
        >
          <User className="w-6 h-6 stroke-current" />
        </Link>
      </div>
    )
  }

  // Expanded mode - full sidebar
  return (
    <div className="flex flex-col w-56 h-full overflow-hidden text-blue-700 border-r border-blue-200" style={{ background: 'linear-gradient(to bottom, #dbeafe, #eff6ff)' }}>
      {/* Logo Header */}
      <a className="flex items-center w-full px-3 mt-3" href="#">
        <img 
          src="/assets/sintalogo.svg" 
          alt="SINTA Logo" 
          className="h-10 w-auto object-contain"
        />
      </a>
      
      {/* Main Navigation */}
      <div className="w-full px-2 flex-1 overflow-y-auto">
        <div className="flex flex-col w-full mt-3 border-t border-blue-200 pt-1">
          {filteredNavigation.map((item) => (
            <div key={item.title} className="w-full">
              {item.items.length > 0 ? (
                <>
                  <button
                    onClick={() => toggleMenuEnhanced(item.title)}
                    className="flex items-center justify-between w-full h-10 px-3 mt-1 rounded-lg transition-all duration-200"
                    style={(isActive(item.url) || isSubmenuActive(item.items)) ? { backgroundColor: '#2563eb', color: 'white' } : {}}
                    onMouseEnter={(e) => {
                      if (!isActive(item.url) && !isSubmenuActive(item.items)) {
                        e.currentTarget.style.backgroundColor = '#60a5fa';
                        e.currentTarget.style.color = 'white';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive(item.url) && !isSubmenuActive(item.items)) {
                        e.currentTarget.style.backgroundColor = '';
                        e.currentTarget.style.color = '';
                      }
                    }}
                  >
                    <div className="flex items-center">
                      <item.icon className="w-5 h-5 stroke-current" />
                      <span className="ml-2 text-sm font-medium">{item.title}</span>
                    </div>
                    <ChevronDown 
                      className={cn(
                        "w-4 h-4 transition-transform",
                        isMenuOpen(item.title, item.items) && "rotate-180"
                      )} 
                    />
                  </button>
                  {isMenuOpen(item.title, item.items) && (
                    <div className="ml-4 mt-1 space-y-0.5">
                      {item.items.map((subItem: any) => (
                        subItem.isHeader ? (
                          <div
                            key={subItem.title}
                            className="px-3 py-1.5 text-xs font-semibold text-blue-500 opacity-70 select-none"
                          >
                            {subItem.title}
                          </div>
                        ) : (
                        <Link
                          key={subItem.url}
                          to={subItem.url}
                          className="flex items-center w-full h-8 px-3 rounded-lg text-sm transition-all duration-200"
                          style={isActive(subItem.url) ? { backgroundColor: '#2563eb', color: 'white' } : { color: '#2563eb' }}
                          onMouseEnter={(e) => {
                            if (!isActive(subItem.url)) {
                              e.currentTarget.style.backgroundColor = '#60a5fa';
                              e.currentTarget.style.color = 'white';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!isActive(subItem.url)) {
                              e.currentTarget.style.backgroundColor = '';
                              e.currentTarget.style.color = '#2563eb';
                            }
                          }}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-current mr-2" />
                          {subItem.title}
                        </Link>
                        )
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <Link
                  to={item.url}
                  className="flex items-center w-full h-10 px-3 mt-1 rounded-lg transition-all duration-200"
                  style={isActive(item.url) ? { backgroundColor: '#2563eb', color: 'white' } : {}}
                  onMouseEnter={(e) => {
                    if (!isActive(item.url)) {
                      e.currentTarget.style.backgroundColor = '#60a5fa';
                      e.currentTarget.style.color = 'white';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive(item.url)) {
                      e.currentTarget.style.backgroundColor = '';
                      e.currentTarget.style.color = '';
                    }
                  }}
                >
                  <item.icon className="w-5 h-5 stroke-current" />
                  <span className="ml-2 text-sm font-medium">{item.title}</span>
                </Link>
              )}
            </div>
          ))}
        </div>
        
        {/* Admin Section */}
        {getFilteredAdminNavigation().length > 0 && (
          <div className="flex flex-col w-full mt-2 border-t border-blue-200 pt-1">
            <div className="w-full px-3 py-1">
              <span className="text-xs font-semibold text-blue-500 uppercase tracking-wider">
                Administrasi
              </span>
            </div>
            {getFilteredAdminNavigation().map((item) => (
              <Link
                key={item.url}
                to={item.url}
                className="flex items-center w-full h-10 px-3 mt-1 rounded-lg transition-all duration-200"
                style={isActive(item.url) ? { backgroundColor: '#2563eb', color: 'white' } : {}}
                onMouseEnter={(e) => {
                  if (!isActive(item.url)) {
                    e.currentTarget.style.backgroundColor = '#60a5fa';
                    e.currentTarget.style.color = 'white';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive(item.url)) {
                    e.currentTarget.style.backgroundColor = '';
                    e.currentTarget.style.color = '';
                  }
                }}
              >
                <item.icon className="w-5 h-5 stroke-current" />
                <span className="ml-2 text-sm font-medium">{item.title}</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
