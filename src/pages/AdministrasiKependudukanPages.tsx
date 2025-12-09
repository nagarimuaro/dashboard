import React from 'react'
import { LayananSurat } from '../components/layanan-surat'
import { useApp } from '../context/AppContext'

export function SuratDomisiliPage() {
  const { user } = useApp()
  const userRole = user?.role || 'admin_nagari'
  
  return (
    <LayananSurat 
      kategori="administrasi-kependudukan"
      userRole={userRole as 'admin_global' | 'admin_nagari' | 'staff_nagari' | 'warga'}
    />
  )
}

export function SuratPindahPage() {
  const { user } = useApp()
  const userRole = user?.role || 'admin_nagari'
  
  return (
    <LayananSurat 
      kategori="administrasi-kependudukan"
      userRole={userRole as 'admin_global' | 'admin_nagari' | 'staff_nagari' | 'warga'}
    />
  )
}

export function SuratKelahiranPage() {
  const { user } = useApp()
  const userRole = user?.role || 'admin_nagari'
  
  return (
    <LayananSurat 
      kategori="administrasi-kependudukan"
      userRole={userRole as 'admin_global' | 'admin_nagari' | 'staff_nagari' | 'warga'}
    />
  )
}

export function SuratKematianPage() {
  const { user } = useApp()
  const userRole = user?.role || 'admin_nagari'
  
  return (
    <LayananSurat 
      kategori="administrasi-kependudukan"
      userRole={userRole as 'admin_global' | 'admin_nagari' | 'staff_nagari' | 'warga'}
    />
  )
}

export function SuratBelumMenikahPage() {
  const { user } = useApp()
  const userRole = user?.role || 'admin_nagari'
  
  return (
    <LayananSurat 
      kategori="administrasi-kependudukan"
      userRole={userRole as 'admin_global' | 'admin_nagari' | 'staff_nagari' | 'warga'}
    />
  )
}

export function SuratNikahPage() {
  const { user } = useApp()
  const userRole = user?.role || 'admin_nagari'
  
  return (
    <LayananSurat 
      kategori="administrasi-kependudukan"
      userRole={userRole as 'admin_global' | 'admin_nagari' | 'staff_nagari' | 'warga'}
    />
  )
}

export function SuratJandaDudaPage() {
  const { user } = useApp()
  const userRole = user?.role || 'admin_nagari'
  
  return (
    <LayananSurat 
      kategori="administrasi-kependudukan"
      userRole={userRole as 'admin_global' | 'admin_nagari' | 'staff_nagari' | 'warga'}
    />
  )
}

export function SuratPenghasilanPage() {
  const { user } = useApp()
  const userRole = user?.role || 'admin_nagari'
  
  return (
    <LayananSurat 
      kategori="administrasi-kependudukan"
      userRole={userRole as 'admin_global' | 'admin_nagari' | 'staff_nagari' | 'warga'}
    />
  )
}

export function SuratTidakMampuPage() {
  const { user } = useApp()
  const userRole = user?.role || 'admin_nagari'
  
  return (
    <LayananSurat 
      kategori="administrasi-kependudukan"
      userRole={userRole as 'admin_global' | 'admin_nagari' | 'staff_nagari' | 'warga'}
    />
  )
}

export function SuratSKCKPage() {
  const { user } = useApp()
  const userRole = user?.role || 'admin_nagari'
  
  return (
    <LayananSurat 
      kategori="administrasi-kependudukan"
      userRole={userRole as 'admin_global' | 'admin_nagari' | 'staff_nagari' | 'warga'}
    />
  )
}

export function SuratUsahaPage() {
  const { user } = useApp()
  const userRole = user?.role || 'admin_nagari'
  
  return (
    <LayananSurat 
      kategori="administrasi-kependudukan"
      userRole={userRole as 'admin_global' | 'admin_nagari' | 'staff_nagari' | 'warga'}
    />
  )
}

export function SuratIzinKeramianPage() {
  const { user } = useApp()
  const userRole = user?.role || 'admin_nagari'
  
  return (
    <LayananSurat 
      kategori="administrasi-kependudukan"
      userRole={userRole as 'admin_global' | 'admin_nagari' | 'staff_nagari' | 'warga'}
    />
  )
}

export function SuratKepemilikanTanahPage() {
  const { user } = useApp()
  const userRole = user?.role || 'admin_nagari'
  
  return (
    <LayananSurat 
      kategori="administrasi-kependudukan"
      userRole={userRole as 'admin_global' | 'admin_nagari' | 'staff_nagari' | 'warga'}
    />
  )
}

export function SuratAhliWarisPage() {
  const { user } = useApp()
  const userRole = user?.role || 'admin_nagari'
  
  return (
    <LayananSurat 
      kategori="administrasi-kependudukan"
      userRole={userRole as 'admin_global' | 'admin_nagari' | 'staff_nagari' | 'warga'}
    />
  )
}