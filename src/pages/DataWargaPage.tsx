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
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Data Warga</h1>
          <p className="text-gray-600">Kelola data warga Nagari</p>
        </div>
        
        {/* Add Button for non-warga users */}
        {userRole !== 'warga' && (
          <Link 
            to="/kependudukan/data-warga/add"
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 inline-flex items-center"
          >
            <span className="mr-2">+</span>
            Tambah Warga Baru
          </Link>
        )}
      </div>
      
      {/* Data Warga Component */}
      <DataWarga
        userRole={userRole as 'admin_global' | 'admin_nagari' | 'staff_nagari' | 'warga'}
        onNavigateToDetail={handleNavigateToDetail}
      />
    </div>
  )
}