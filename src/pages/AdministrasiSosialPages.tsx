import React from 'react'
import { LayananSurat } from '../components/layanan-surat'
import { useApp } from '../context/AppContext'

export function SosialMiskinPage() {
  const { user } = useApp()
  const userRole = user?.role || 'admin_nagari'
  
  return (
    <LayananSurat 
      kategori="administrasi-sosial"
      userRole={userRole as 'admin_global' | 'admin_nagari' | 'staff_nagari' | 'warga'}
    />
  )
}

export function SosialBeasiswaPage() {
  const { user } = useApp()
  const userRole = user?.role || 'admin_nagari'
  
  return (
    <LayananSurat 
      kategori="administrasi-sosial"
      userRole={userRole as 'admin_global' | 'admin_nagari' | 'staff_nagari' | 'warga'}
    />
  )
}

export function SosialBantuanPage() {
  const { user } = useApp()
  const userRole = user?.role || 'admin_nagari'
  
  return (
    <LayananSurat 
      kategori="administrasi-sosial"
      userRole={userRole as 'admin_global' | 'admin_nagari' | 'staff_nagari' | 'warga'}
    />
  )
}

export function SosialJamkesmasPage() {
  const { user } = useApp()
  const userRole = user?.role || 'admin_nagari'
  
  return (
    <LayananSurat 
      kategori="administrasi-sosial"
      userRole={userRole as 'admin_global' | 'admin_nagari' | 'staff_nagari' | 'warga'}
    />
  )
}