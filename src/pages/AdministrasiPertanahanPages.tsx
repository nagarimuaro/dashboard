import React from 'react'
import { LayananSurat } from '../components/layanan-surat'
import { useApp } from '../context/AppContext'

export function PertanahanTanahPage() {
  const { user } = useApp()
  const userRole = user?.role || 'admin_nagari'
  
  return (
    <LayananSurat 
      kategori="administrasi-pertanahan"
      userRole={userRole as 'admin_global' | 'admin_nagari' | 'staff_nagari' | 'warga'}
    />
  )
}

export function PertanahanRiwayatPage() {
  const { user } = useApp()
  const userRole = user?.role || 'admin_nagari'
  
  return (
    <LayananSurat 
      kategori="administrasi-pertanahan"
      userRole={userRole as 'admin_global' | 'admin_nagari' | 'staff_nagari' | 'warga'}
    />
  )
}

export function PertanahanJualBeliPage() {
  const { user } = useApp()
  const userRole = user?.role || 'admin_nagari'
  
  return (
    <LayananSurat 
      kategori="administrasi-pertanahan"
      userRole={userRole as 'admin_global' | 'admin_nagari' | 'staff_nagari' | 'warga'}
    />
  )
}