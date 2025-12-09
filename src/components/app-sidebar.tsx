import React from "react"
import {
  Building2,
  Users,
  FileText,
  ClipboardList,
  Settings,
  BarChart3,
  UserCog,
  Archive,
  ChevronDown,
  DollarSign,
  Map,
  MessageSquare,
  Globe,
  FolderOpen,
  FileUp,
  FilePlus,
  Send,
  CheckSquare,
  LayoutTemplate,
  Inbox,
  Heart,
  Baby,
  HeartPulse,
  Wallet,
  Accessibility,
  Home,
  GraduationCap,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarHeader,
  SidebarRail,
} from "./ui/sidebar"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "./ui/collapsible"

interface AppSidebarProps {
  activeModule: string
  onModuleChange: (module: string) => void
  userRole: 'admin_global' | 'admin_nagari' | 'staff_nagari' | 'warga'
  nagariName?: string
}

export function AppSidebar({ activeModule, onModuleChange, userRole, nagariName }: AppSidebarProps): React.JSX.Element {
  const navigation = [
    // 1. DASHBOARD
    {
      title: "Dashboard",
      icon: BarChart3,
      key: "dashboard",
      items: [],
    },
    
    // 2. KEPENDUDUKAN
    {
      title: "Kependudukan",
      icon: Users,
      key: "kependudukan",
      items: [
        { title: "Data Warga", key: "data-warga", icon: Users },
        { title: "Data Keluarga", key: "data-keluarga", icon: Users },
      ],
    },
    
    // 3. LAYANAN SURAT (urutan logis)
    {
      title: "Layanan Surat",
      icon: FileText,
      key: "layanan-surat",
      items: [
        { title: "Template Surat", key: "template-manager", icon: LayoutTemplate },
        { title: "Permohonan Masuk", key: "kelola-permohonan", icon: Inbox },
        { title: "Buat Surat Baru", key: "permohonan-surat", icon: FilePlus },
        { title: "Arsip Surat", key: "arsip-surat", icon: Archive },
      ],
    },
    
    // 4. CONTENT MANAGEMENT
    {
      title: "Content Management",
      icon: Globe,
      key: "cms",
      items: [
        { title: "CMS Dashboard", key: "cms-dashboard" },
        { title: "Kelola Berita", key: "cms-news" },
        { title: "Pengaturan Situs", key: "cms-settings" },
      ],
    },
    
    // 5. KEUANGAN
    {
      title: "Keuangan",
      icon: DollarSign,
      key: "keuangan",
      items: [
        { title: "APB Dashboard", key: "keuangan-apb" },
        { title: "Realisasi Anggaran", key: "keuangan-realisasi" },
      ],
    },
    
    // 6. GIS
    {
      title: "GIS & Pemetaan",
      icon: Map,
      key: "gis",
      items: [
        { title: "Peta Digital", key: "gis-peta" },
        { title: "Batas Wilayah", key: "gis-batas" },
      ],
    },
    
    // 7. DATA SOSIAL
    {
      title: "Data Sosial",
      icon: Heart,
      key: "data-sosial",
      items: [
        { title: "Data Kemiskinan", key: "data-kemiskinan", icon: Wallet },
        { title: "Data Stunting", key: "data-stunting", icon: Baby },
        { title: "Data KB", key: "data-kb", icon: HeartPulse },
        { title: "Data Disabilitas", key: "data-disabilitas", icon: Accessibility },
        { title: "Data Rumah Tidak Layak", key: "data-rtlh", icon: Home },
        { title: "Data Putus Sekolah", key: "data-putus-sekolah", icon: GraduationCap },
      ],
    },
    
    // 8. PENGADUAN
    {
      title: "Pengaduan",
      icon: MessageSquare,
      key: "pengaduan",
      items: [
        { title: "Keluhan Masyarakat", key: "pengaduan-keluhan" },
        { title: "Tracking Pengaduan", key: "pengaduan-tracking" },
      ],
    },
  ]

  // Filter navigation based on user role
  const getFilteredNavigation = () => {
    if (userRole === 'warga') {
      return navigation.filter(item => 
        ['dashboard', 'layanan-surat', 'pengaduan'].includes(item.key)
      ).map(item => {
        if (item.key === 'layanan-surat') {
          return {
            ...item,
            items: item.items.filter(sub => ['permohonan-surat', 'arsip-surat'].includes(sub.key))
          }
        }
        return item
      })
    }
    
    if (userRole === 'staff_nagari') {
      return navigation.filter(item => 
        !['keuangan', 'cms'].includes(item.key)
      )
    }
    
    return navigation
  }

  const filteredNavigation = getFilteredNavigation()

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <Building2 className="h-4 w-4 text-primary-foreground" />
          </div>
          <div>
            <h2 className="text-sm font-medium">Nagari Terpadu</h2>
            {nagariName && (
              <p className="text-xs text-muted-foreground">{nagariName}</p>
            )}
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu Utama</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {filteredNavigation.map((item) => (
                <SidebarMenuItem key={item.key}>
                  {item.items.length > 0 ? (
                    <Collapsible className="group/collapsible">
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton 
                          className="w-full justify-between"
                          isActive={activeModule.startsWith(item.key)}
                        >
                          <div className="flex items-center gap-2">
                            <item.icon className="h-4 w-4" />
                            <span>{item.title}</span>
                          </div>
                          <ChevronDown className="h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-180" />
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <SidebarMenuSub>
                          {item.items.map((subItem) => (
                            <SidebarMenuSubItem key={subItem.key}>
                              <SidebarMenuSubButton 
                                onClick={() => onModuleChange(subItem.key)}
                                isActive={activeModule === subItem.key}
                              >
                                {subItem.title}
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          ))}
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    </Collapsible>
                  ) : (
                    <SidebarMenuButton 
                      onClick={() => onModuleChange(item.key)}
                      isActive={activeModule === item.key}
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  )}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {(userRole === 'admin_global' || userRole === 'admin_nagari') && (
          <SidebarGroup>
            <SidebarGroupLabel>Pengaturan</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton 
                    onClick={() => onModuleChange('user-management')}
                    isActive={activeModule === 'user-management'}
                  >
                    <UserCog className="h-4 w-4" />
                    <span>User Management</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton 
                    onClick={() => onModuleChange('settings')}
                    isActive={activeModule === 'settings'}
                  >
                    <Settings className="h-4 w-4" />
                    <span>Settings</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}