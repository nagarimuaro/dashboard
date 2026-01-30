import React from 'react'
import { CMSDashboard } from '../components/cms-dashboard'
import { CMSNews } from '../components/cms-news'
import { CMSSettings } from '../components/cms-settings'
import { CMSPages } from '../components/cms-pages'
import { CMSServices } from '../components/cms-services'
import { CMSCategories } from '../components/cms-categories'
import { CMSStaff } from '../components/cms-staff'
import { CMSHeroBanners } from '../components/cms-hero-banners'
import { CMSDocuments } from '../components/cms-documents'
import { useApp } from '../context/AppContext'

export function CMSDashboardPage() {
  const { user } = useApp()
  const userRole = user?.role || 'admin_nagari'
  
  const handleModuleChange = (module: string) => {
    console.log('Module changed to:', module)
  }
  
  return (
    <CMSDashboard 
      userRole={userRole as 'admin_global' | 'admin_nagari' | 'staff_nagari' | 'warga'}
      onModuleChange={handleModuleChange}
    />
  )
}

export function CMSNewsPage() {
  const { user } = useApp()
  const userRole = user?.role || 'admin_nagari'
  
  const handleModuleChange = (module: string) => {
    console.log('Module changed to:', module)
  }
  
  return (
    <CMSNews 
      userRole={userRole as 'admin_global' | 'admin_nagari' | 'staff_nagari' | 'warga'}
      onModuleChange={handleModuleChange}
    />
  )
}

export function CMSPagesPage() {
  const { user } = useApp()
  const userRole = user?.role || 'admin_nagari'
  
  const handleModuleChange = (module: string) => {
    console.log('Module changed to:', module)
  }
  
  return (
    <CMSPages 
      userRole={userRole as 'admin_global' | 'admin_nagari' | 'staff_nagari' | 'warga'}
      onModuleChange={handleModuleChange}
    />
  )
}

export function CMSServicesPage() {
  const { user } = useApp()
  const userRole = user?.role || 'admin_nagari'
  
  const handleModuleChange = (module: string) => {
    console.log('Module changed to:', module)
  }
  
  return (
    <CMSServices 
      userRole={userRole as 'admin_global' | 'admin_nagari' | 'staff_nagari' | 'warga'}
      onModuleChange={handleModuleChange}
    />
  )
}

export function CMSCategoriesPage() {
  const { user } = useApp()
  const userRole = user?.role || 'admin_nagari'
  
  const handleModuleChange = (module: string) => {
    console.log('Module changed to:', module)
  }
  
  return (
    <CMSCategories 
      userRole={userRole as 'admin_global' | 'admin_nagari' | 'staff_nagari' | 'warga'}
      onModuleChange={handleModuleChange}
    />
  )
}

export function CMSStaffPage() {
  const { user } = useApp()
  const userRole = user?.role || 'admin_nagari'
  
  const handleModuleChange = (module: string) => {
    console.log('Module changed to:', module)
  }
  
  return (
    <CMSStaff 
      userRole={userRole as 'admin_global' | 'admin_nagari' | 'staff_nagari' | 'warga'}
      onModuleChange={handleModuleChange}
    />
  )
}

export function CMSSettingsPage() {
  const { user } = useApp()
  const userRole = user?.role || 'admin_nagari'
  
  const handleModuleChange = (module: string) => {
    console.log('Module changed to:', module)
  }
  
  return (
    <CMSSettings 
      userRole={userRole as 'admin_global' | 'admin_nagari' | 'staff_nagari' | 'warga'}
      onModuleChange={handleModuleChange}
    />
  )
}

export function CMSHeroBannersPage() {
  const { user } = useApp()
  const userRole = user?.role || 'admin_nagari'
  
  const handleModuleChange = (module: string) => {
    console.log('Module changed to:', module)
  }
  
  return (
    <CMSHeroBanners 
      userRole={userRole as 'admin_global' | 'admin_nagari' | 'staff_nagari' | 'warga'}
      onModuleChange={handleModuleChange}
    />
  )
}

export function CMSDocumentsPage() {
  const { user } = useApp()
  const userRole = user?.role || 'admin_nagari'
  
  const handleModuleChange = (module: string) => {
    console.log('Module changed to:', module)
  }
  
  return (
    <CMSDocuments 
      userRole={userRole as 'admin_global' | 'admin_nagari' | 'staff_nagari' | 'warga'}
      onModuleChange={handleModuleChange}
    />
  )
}