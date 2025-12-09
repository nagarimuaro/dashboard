import React from 'react'
import { CMSDashboard } from '../components/cms-dashboard'
import { CMSNews } from '../components/cms-news'
import { CMSSettings } from '../components/cms-settings'
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