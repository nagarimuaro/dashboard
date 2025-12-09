import React from 'react'
import { Card, CardContent } from './ui/card'

interface LoadingFallbackProps {
  message?: string
  timeout?: number
  onTimeout?: () => void
}

export function LoadingFallback({ 
  message = "Loading...", 
  timeout = 10000,
  onTimeout 
}: LoadingFallbackProps) {
  const [isTimeout, setIsTimeout] = React.useState(false)

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setIsTimeout(true)
      onTimeout?.()
    }, timeout)

    return () => clearTimeout(timer)
  }, [timeout, onTimeout])

  if (isTimeout) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center space-y-4">
            <div className="text-destructive">
              <h3 className="font-semibold">Loading Timeout</h3>
              <p className="text-sm text-muted-foreground mt-2">
                The application is taking longer than expected to load.
              </p>
            </div>
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            >
              Reload Page
            </button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <p className="text-muted-foreground">{message}</p>
        <div className="text-xs text-muted-foreground/60">
          Please wait while we load your data...
        </div>
      </div>
    </div>
  )
}