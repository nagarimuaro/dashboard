import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { DataWarga } from '../components/data-warga'
import { useApp } from '../context/AppContext'

export function DataWargaPage() {
  const navigate = useNavigate()
  const { user } = useApp()
  
  const userRole = user?.role || 'admin_nagari'

  const handleNavigateToDetail = (id: string | number) => {
    navigate(`/kependudukan/data-warga/${id}`)
  }
  
  return (
    <div className="space-y-6">
      {/* Data Warga Component */}
      <DataWarga
        userRole={userRole as 'admin_global' | 'admin_nagari' | 'staff_nagari' | 'warga'}
        onNavigateToDetail={handleNavigateToDetail}
      />
    </div>
  )
}