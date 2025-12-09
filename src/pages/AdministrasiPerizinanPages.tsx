import React from 'react'
import { LayananSurat } from '../components/layanan-surat'
import { useApp } from '../context/AppContext'

export function PerizinanIMBPage() {
  const { user } = useApp()
  const userRole = user?.role || 'admin_nagari'
  
  return (
    <LayananSurat 
      kategori="administrasi-perizinan"
      userRole={userRole as 'admin_global' | 'admin_nagari' | 'staff_nagari' | 'warga'}
    />
  )
}

export function PerizinanSITUPage() {
  const { user } = useApp()
  const userRole = user?.role || 'admin_nagari'
  
  return (
    <LayananSurat 
      kategori="administrasi-perizinan"
      userRole={userRole as 'admin_global' | 'admin_nagari' | 'staff_nagari' | 'warga'}
    />
  )
}

export function PerizinanHOPage() {
  const { user } = useApp()
  const userRole = user?.role || 'admin_nagari'
  
  return (
    <LayananSurat 
      kategori="administrasi-perizinan"
      userRole={userRole as 'admin_global' | 'admin_nagari' | 'staff_nagari' | 'warga'}
    />
  )
}

export function PerizinanSIUPPage() {
  const { user } = useApp()
  const userRole = user?.role || 'admin_nagari'
  
  return (
    <LayananSurat 
      kategori="administrasi-perizinan"
      userRole={userRole as 'admin_global' | 'admin_nagari' | 'staff_nagari' | 'warga'}
    />
  )
}

export function PerizinanTrayekPage() {
  const { user } = useApp()
  const userRole = user?.role || 'admin_nagari'
  
  return (
    <LayananSurat 
      kategori="administrasi-perizinan"
      userRole={userRole as 'admin_global' | 'admin_nagari' | 'staff_nagari' | 'warga'}
    />
  )
}

export function PerizinanReklamePage() {
  const { user } = useApp()
  const userRole = user?.role || 'admin_nagari'
  
  return (
    <LayananSurat 
      kategori="administrasi-perizinan"
      userRole={userRole as 'admin_global' | 'admin_nagari' | 'staff_nagari' | 'warga'}
    />
  )
}