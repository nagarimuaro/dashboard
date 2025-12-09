import React from 'react'
import { Dashboard } from '../components/dashboard'
import { useApp } from '../context/AppContext'

export function DashboardPage() {
  const { user } = useApp()
  
  const userRole = user?.role || 'admin_nagari'
  
  return (
    <Dashboard 
      userRole={userRole as 'admin_global' | 'admin_nagari' | 'staff_nagari' | 'warga'}
      onModuleChange={() => {}} // Not needed with routing
    />
  )
}