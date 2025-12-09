import React, { useState, useEffect } from 'react'
import { useApp } from '../../context/AppContext'
import { LoginPage } from './LoginPage'
import { LoadingFallback } from '../LoadingFallback'

interface AuthLayoutProps {
  children: React.ReactNode
}

export function AuthLayout({ children }: AuthLayoutProps) {
  const { user, loading, initialized } = useApp()
  const [timeoutReached, setTimeoutReached] = useState(false)

  // Handle loading timeout
  useEffect(() => {
    if (loading) {
      const timer = setTimeout(() => {
        setTimeoutReached(true)
      }, 8000) // 8 second timeout
      
      return () => clearTimeout(timer)
    } else {
      setTimeoutReached(false)
    }
  }, [loading])

  // Show loading while initializing with timeout protection
  if (!initialized || loading) {
    if (timeoutReached) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center space-y-4">
            <h2 className="text-xl font-semibold text-destructive">Loading Timeout</h2>
            <p className="text-muted-foreground">
              The application is taking longer than expected to initialize.
            </p>
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            >
              Reload Application
            </button>
          </div>
        </div>
      )
    }

    return (
      <LoadingFallback 
        message="Initializing application..."
        timeout={10000}
        onTimeout={() => setTimeoutReached(true)}
      />
    )
  }

  // Show login page if not authenticated
  if (!user) {
    return <LoginPage />
  }

  // Show main app if authenticated
  return <>{children}</>
}