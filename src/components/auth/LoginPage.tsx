import React, { useState, useEffect } from 'react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card'
import { Alert, AlertDescription } from '../ui/alert'
import { Eye, EyeOff, Building2 } from 'lucide-react'
import { useApp } from '../../context/AppContext'

interface LoginPageProps {
  onLoginSuccess?: () => void
}

export function LoginPage({ onLoginSuccess }: LoginPageProps) {
  const { login } = useApp()
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [tenantSlug, setTenantSlug] = useState('')

  // Auto-detect tenant from subdomain
  useEffect(() => {
    const hostname = window.location.hostname
    const subdomain = hostname.split('.')[0]
    
    // Deteksi subdomain otomatis (kecuali www, localhost, dan IP)
    if (subdomain !== 'www' && subdomain !== 'localhost' && subdomain !== '127' && !hostname.includes('192.168')) {
      setTenantSlug(subdomain)
    } else {
      // Default untuk development
      setTenantSlug('muaro')
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
    
    if (!formData.email || !formData.password) {
      setError('Email dan password harus diisi')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      console.log('Submitting login form with:', {
        email: formData.email,
        tenant_slug: tenantSlug
      })
      
      const result = await login({
        email: formData.email,
        password: formData.password,
        tenant_slug: tenantSlug
      })
      
      console.log('Login completed successfully:', result)
      onLoginSuccess?.()
    } catch (err: any) {
      console.error('Login error details:', err)
      
      let errorMessage = 'Login gagal. Silakan coba lagi.'
      
      if (err.message) {
        if (err.message.includes('JSON')) {
          errorMessage = 'Terjadi kesalahan komunikasi dengan server. Menggunakan mode demo.'
        } else if (err.message.includes('timeout')) {
          errorMessage = 'Koneksi timeout. Menggunakan mode demo.'
        } else if (err.message.includes('Network')) {
          errorMessage = 'Tidak dapat terhubung ke server. Menggunakan mode demo.'
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
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="h-12 w-12 bg-primary rounded-lg flex items-center justify-center">
              <Building2 className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-foreground">
                Sistem Nagari Terpadu
              </h1>
            </div>
          </div>
          <p className="text-muted-foreground">
            Platform Digital Administrasi & Pelayanan Masyarakat
          </p>
          {tenantSlug && (
            <p className="text-sm text-primary mt-2 font-medium">
              Dashboard: {tenantSlug.charAt(0).toUpperCase() + tenantSlug.slice(1)}
            </p>
          )}
        </div>

        <Card className="w-full">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-xl">Masuk ke Sistem</CardTitle>
            <CardDescription>
              Masukkan email dan password Anda
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="user@example.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Masukkan password"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    required
                    disabled={isLoading}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col space-y-4">
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground"></div>
                    <span>Memproses...</span>
                  </div>
                ) : (
                  'Masuk'
                )}
              </Button>

              <div className="text-center space-y-2">
                <p className="text-xs text-muted-foreground">
                  Sistem Admin Nagari Terpadu v2.0
                </p>
                <p className="text-xs text-muted-foreground">
                  Subdomain: {tenantSlug}
                </p>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
}
