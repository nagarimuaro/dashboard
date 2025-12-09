import React from 'react'
import { WargaTest } from '../components/warga-test'
import { useApp } from '../context/AppContext'

export function WargaTestPage() {
  const { user } = useApp()
  const userRole = user?.role || 'admin_nagari'
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">🧪 Warga API Test</h1>
        <p className="text-muted-foreground">Testing API integration</p>
      </div>
      
      <WargaTest userRole={userRole as any} />
    </div>
  )
}