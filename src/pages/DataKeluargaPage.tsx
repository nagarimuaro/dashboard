import React from 'react'
import { useNavigate } from 'react-router-dom'
import { DataKeluarga } from '../components/data-keluarga'
import { useApp } from '../context/AppContext'

export function DataKeluargaPage() {
  const { user } = useApp()
  const navigate = useNavigate()
  const userRole = user?.role || 'admin_nagari'
  
  const handleNavigateToDetail = (keluargaId: string | number) => {
    console.log('🔄 Navigating to keluarga detail:', keluargaId)
    navigate(`/kependudukan/data-keluarga/${keluargaId}`)
  }
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Data Keluarga</h1>
        <p className="text-muted-foreground">Kelola data keluarga Nagari</p>
      </div>
      
      <DataKeluarga 
        userRole={userRole as any} 
        onNavigateToDetail={handleNavigateToDetail}
      />
    </div>
  )
}