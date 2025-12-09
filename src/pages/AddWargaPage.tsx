import React from 'react'
import { useNavigate } from 'react-router-dom'
import { AddWarga } from '../components/add-warga'

export function AddWargaPage() {
  const navigate = useNavigate()
  
  const handleBack = () => {
    navigate('/kependudukan/data-warga')
  }
  
  const handleSuccess = () => {
    navigate('/kependudukan/data-warga')
  }
  
  return (
    <AddWarga 
      onBack={handleBack}
      onSuccess={handleSuccess}
    />
  )
}