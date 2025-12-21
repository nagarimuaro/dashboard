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
     
      
      <DataKeluarga 
        userRole={userRole as any} 
        onNavigateToDetail={handleNavigateToDetail}
      />
    </div>
  )
}