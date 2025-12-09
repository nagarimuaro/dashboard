import React, { useState } from "react"
import { DataWarga } from "./data-warga"
import { WargaDetail } from "./warga-detail"
import { AddWarga } from "./add-warga"
import { Button } from "./ui/button"
import { Plus } from "lucide-react"

interface WargaManagementProps {
  userRole: 'admin_global' | 'admin_nagari' | 'staff_nagari' | 'warga'
}

export function WargaManagement({ userRole }: WargaManagementProps) {
  const [currentView, setCurrentView] = useState<'list' | 'detail' | 'add'>('list')
  const [selectedWargaId, setSelectedWargaId] = useState<string | number | null>(null)

  const handleNavigateToDetail = (wargaId: string | number) => {
    console.log('WargaManagement: Navigating to detail with ID:', wargaId)
    setSelectedWargaId(wargaId)
    setCurrentView('detail')
  }

  const handleNavigateToAdd = () => {
    setCurrentView('add')
  }

  const handleBackToList = () => {
    setCurrentView('list')
    setSelectedWargaId(null)
  }

  const handleAddSuccess = () => {
    setCurrentView('list')
  }

  if (currentView === 'detail' && selectedWargaId) {
    return (
      <WargaDetail 
        wargaId={selectedWargaId}
        onBack={handleBackToList}
        userRole={userRole}
      />
    )
  }

  if (currentView === 'add') {
    return (
      <AddWarga 
        onBack={handleBackToList}
        onSuccess={handleAddSuccess}
      />
    )
  }

  return (
    <div className="space-y-6">
      {/* Add Button for non-warga users */}
      {userRole !== 'warga' && (
        <div className="flex justify-end">
          <Button onClick={handleNavigateToAdd}>
            <Plus className="h-4 w-4 mr-2" />
            Tambah Warga Baru
          </Button>
        </div>
      )}
      
      <DataWarga
        userRole={userRole}
        onNavigateToDetail={handleNavigateToDetail}
      />
    </div>
  )
}