import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { WargaDetail } from '../components/warga-detail'
import { useApp } from '../context/AppContext'

export function WargaDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useApp()
  
  const userRole = user?.role || 'admin_nagari'
  
  if (!id) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">ID warga tidak ditemukan</p>
      </div>
    )
  }
  
  return (
    <WargaDetail
      wargaId={id}
      onBack={() => navigate('/kependudukan/data-warga')}
      userRole={userRole as 'admin_global' | 'admin_nagari' | 'staff_nagari' | 'warga'}
    />
  )
}