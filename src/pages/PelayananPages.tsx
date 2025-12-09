import React from 'react'
import { PermohonanSurat } from '../components/permohonan-surat'
import { KelolaPermohonan } from '../components/kelola-permohonan'
import { GISMap } from '../components/gis-map'
import { TemplateManager } from '../components/template-manager'
import { KeuanganDashboard } from '../components/keuangan-dashboard'
import { useApp } from '../context/AppContext'

export function PermohonanSuratPage() {
  const { user } = useApp()
  const userRole = user?.role || 'admin_nagari'
  
  return (
    <PermohonanSurat 
      userRole={userRole as 'admin_global' | 'admin_nagari' | 'staff_nagari' | 'warga'}
    />
  )
}

export function KelolaPermohonanPage() {
  const { user } = useApp()
  const userRole = user?.role || 'admin_nagari'
  
  return (
    <KelolaPermohonan 
      userRole={userRole as 'admin_global' | 'admin_nagari' | 'staff_nagari' | 'warga'}
    />
  )
}

export function GISMapPage() {
  const { user } = useApp()
  const userRole = user?.role || 'admin_nagari'
  
  return (
    <GISMap 
      userRole={userRole as 'admin_global' | 'admin_nagari' | 'staff_nagari' | 'warga'}
    />
  )
}

export function TemplateManagerPage() {
  const { user } = useApp()
  const userRole = user?.role || 'admin_nagari'
  
  return (
    <TemplateManager 
      userRole={userRole as 'admin_global' | 'admin_nagari' | 'staff_nagari' | 'warga'}
    />
  )
}

export function KeuanganDashboardPage() {
  const { user } = useApp()
  const userRole = user?.role || 'admin_nagari'
  
  return (
    <KeuanganDashboard 
      userRole={userRole as 'admin_global' | 'admin_nagari' | 'staff_nagari' | 'warga'}
    />
  )
}