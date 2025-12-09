import React from 'react'
import { useParams } from 'react-router-dom'
import { LayananSurat } from '../components/layanan-surat'
import { Pengaduan } from '../components/pengaduan'
import { ArsipSurat } from '../components/arsip-surat'
import { UserManagement } from '../components/user-management'
import { Settings } from '../components/settings'
import { useApp } from '../context/AppContext'

export function LayananSuratPage() {
  const { user } = useApp()
  const { kategori } = useParams<{ kategori: string }>()
  const userRole = user?.role || 'admin_nagari'
  
  return (
    <LayananSurat 
      kategori={kategori || 'administrasi-umum'}
      userRole={userRole as 'admin_global' | 'admin_nagari' | 'staff_nagari' | 'warga'}
    />
  )
}

export function PengaduanPage() {
  const { user } = useApp()
  const userRole = user?.role || 'admin_nagari'
  
  return (
    <Pengaduan 
      userRole={userRole as 'admin_global' | 'admin_nagari' | 'staff_nagari' | 'warga'}
    />
  )
}

export function ArsipSuratPage() {
  const { user } = useApp()
  const userRole = user?.role || 'admin_nagari'
  
  return (
    <ArsipSurat 
      userRole={userRole as 'admin_global' | 'admin_nagari' | 'staff_nagari' | 'warga'}
    />
  )
}

export function UserManagementPage() {
  const { user } = useApp()
  const userRole = user?.role || 'admin_nagari'
  
  return (
    <UserManagement 
      userRole={userRole as 'admin_global' | 'admin_nagari' | 'staff_nagari' | 'warga'}
    />
  )
}

export function SettingsPage() {
  const { user } = useApp()
  const userRole = user?.role || 'admin_nagari'
  
  return (
    <Settings 
      userRole={userRole as 'admin_global' | 'admin_nagari' | 'staff_nagari' | 'warga'}
    />
  )
}

export function ProfilePage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Profile</h1>
      <p className="text-muted-foreground">Halaman profile pengguna</p>
    </div>
  )
}