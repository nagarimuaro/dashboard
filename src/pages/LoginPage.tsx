import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import './LoginPage.css'

export function LoginPage() {
  const { login } = useApp()
  const navigate = useNavigate()
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [tenantSlug, setTenantSlug] = useState('')

  // Auto-detect tenant from subdomain
  useEffect(() => {
    const hostname = window.location.hostname
    const subdomain = hostname.split('.')[0]
    
    if (subdomain && 
        subdomain !== 'www' && 
        subdomain !== 'sintanagari' &&
        !hostname.includes('localhost') && 
        !hostname.match(/^\d+\.\d+\.\d+\.\d+/)) {
      setTenantSlug(subdomain)
    } else {
      setTenantSlug('cilandak')
    }
  }, [])

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    if (error) setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      await login({
        email: formData.email,
        password: formData.password,
        tenant_slug: tenantSlug
      })
      navigate('/')
    } catch (err: any) {
      let errorMessage = 'Login gagal. Silakan coba lagi.'
      
      if (err.message) {
        if (err.message.includes('JSON')) {
          errorMessage = 'Terjadi kesalahan komunikasi dengan server.'
        } else if (err.message.includes('timeout')) {
          errorMessage = 'Koneksi timeout. Silakan coba lagi.'
        } else if (err.message.includes('Network')) {
          errorMessage = 'Tidak dapat terhubung ke server.'
        } else {
          errorMessage = err.message
        }
      }
      
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <section className="login-page-container">
      <div className="login-container">
        <div className="circle circle-one"></div>
        <div className="form-container">
          <img 
            src="/assets/sintalogo.svg" 
            alt="Logo" 
            className="illustration" 
          />
          <h1 className="opacity">LOGIN</h1>
          
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <input 
              type="email" 
              placeholder="EMAIL" 
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              required
              disabled={isLoading}
            />
            <input 
              type="password" 
              placeholder="PASSWORD" 
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              required
              disabled={isLoading}
            />
            <button 
              type="submit" 
              className="opacity"
              disabled={isLoading}
            >
              {isLoading ? 'LOADING...' : 'SUBMIT'}
            </button>
          </form>
          
          <div className="register-forget opacity">
            <span>v1.0</span>
            <span>© 2026 FazaStudio</span>
          </div>
        </div>
        <div className="circle circle-two"></div>
      </div>
    </section>
  )
}