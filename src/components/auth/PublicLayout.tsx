import React, { useState } from 'react'
import { LoginPage } from './LoginPage'
import { ForgotPasswordPage } from './ForgotPasswordPage'
import { ResetPasswordPage } from './ResetPasswordPage'

type AuthView = 'login' | 'forgot-password' | 'reset-password'

export function PublicLayout() {
  const [currentView, setCurrentView] = useState<AuthView>(() => {
    // Check URL for reset password token
    const urlParams = new URLSearchParams(window.location.search)
    if (urlParams.get('token') && urlParams.get('email')) {
      return 'reset-password'
    }
    return 'login'
  })

  const handleViewChange = (view: AuthView) => {
    setCurrentView(view)
    
    // Update URL without page reload
    if (view === 'login') {
      window.history.pushState({}, '', window.location.pathname)
    }
  }

  const renderCurrentView = () => {
    switch (currentView) {
      case 'forgot-password':
        return (
          <ForgotPasswordPage 
            onBackToLogin={() => handleViewChange('login')}
          />
        )
      
      case 'reset-password':
        return (
          <ResetPasswordPage 
            onBackToLogin={() => handleViewChange('login')}
          />
        )
      
      default:
        return (
          <LoginPage 
            onLoginSuccess={() => {
              // This will be handled by the AuthLayout
              console.log('Login successful')
            }}
            onForgotPassword={() => handleViewChange('forgot-password')}
          />
        )
    }
  }

  return renderCurrentView()
}