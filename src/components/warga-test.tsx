import React, { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { Button } from "./ui/button"
import { Badge } from "./ui/badge"
import { Loader2, User, RefreshCw, Search } from "lucide-react"
import { wargaService } from "../services/wargaService.js"
import apiClient from "../services/apiClient.js"

interface WargaTestProps {
  userRole: 'admin_global' | 'admin_nagari' | 'staff_nagari' | 'warga'
}

export function WargaTest({ userRole }: WargaTestProps) {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const testEndpoint = async (endpointName: string, testFunction: () => Promise<any>) => {
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      console.log(`Testing ${endpointName}...`)
      const response = await testFunction()
      console.log(`${endpointName} response:`, response)
      setResult({
        endpoint: endpointName,
        success: true,
        data: response,
        message: 'Endpoint working correctly'
      })
    } catch (error: any) {
      console.error(`${endpointName} error:`, error)
      setError(`${endpointName}: ${error.message}`)
      setResult({
        endpoint: endpointName,
        success: false,
        error: error.message,
        message: 'Endpoint failed'
      })
    } finally {
      setLoading(false)
    }
  }

  // Test available endpoints
  const testGetAll = () => testEndpoint('GET /api/warga', () => wargaService.getAll())
  const testGetById = () => testEndpoint('GET /api/warga/1', () => wargaService.getById('1'))
  const testStatistics = () => testEndpoint('GET /api/warga/statistics', () => wargaService.getStatistics())

  // Test alternative endpoints that might exist
  const testWargas = () => testEndpoint('GET /api/wargas', () => apiClient.get('/api/wargas'))
  const testUsers = () => testEndpoint('GET /api/users', () => apiClient.get('/api/users'))
  const testMe = () => testEndpoint('GET /api/me', () => apiClient.get('/api/me'))
  const testDashboard = () => testEndpoint('GET /api/dashboard/stats', () => apiClient.get('/api/dashboard/stats'))

  const testCreate = () => testEndpoint('POST /api/warga', () => wargaService.create({
    nik: '1234567890123456',
    nama: 'Test User',
    jenis_kelamin: 'L',
    tempat_lahir: 'Jakarta',
    tanggal_lahir: '1990-01-01',
    status_perkawinan: 'Belum Kawin',
    pendidikan: 'S1',
    pekerjaan: 'Developer',
    agama: 'Islam',
    alamat: 'Test Address',
    no_hp: '08123456789',
    email: 'test@example.com'
  }))

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Warga API Testing Dashboard
          </CardTitle>
          <CardDescription>
            Test warga service integration with backend API - User Role: {userRole}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Standard Warga Endpoints:</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <Button onClick={testGetAll} disabled={loading} variant="outline" size="sm">
                  {loading ? <Loader2 className="mr-1 h-3 w-3 animate-spin" /> : null}
                  /api/warga
                </Button>
                
                <Button onClick={testGetById} disabled={loading} variant="outline" size="sm">
                  {loading ? <Loader2 className="mr-1 h-3 w-3 animate-spin" /> : null}
                  /api/warga/1
                </Button>
                
                <Button onClick={testStatistics} disabled={loading} variant="outline" size="sm">
                  {loading ? <Loader2 className="mr-1 h-3 w-3 animate-spin" /> : null}
                  /statistics
                </Button>
                
                <Button onClick={testCreate} disabled={loading} variant="outline" size="sm">
                  {loading ? <Loader2 className="mr-1 h-3 w-3 animate-spin" /> : null}
                  POST Create
                </Button>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-2">Alternative Endpoints:</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <Button onClick={testWargas} disabled={loading} variant="secondary" size="sm">
                  {loading ? <Loader2 className="mr-1 h-3 w-3 animate-spin" /> : null}
                  /api/wargas
                </Button>
                
                <Button onClick={testUsers} disabled={loading} variant="secondary" size="sm">
                  {loading ? <Loader2 className="mr-1 h-3 w-3 animate-spin" /> : null}
                  /api/users
                </Button>
                
                <Button onClick={testMe} disabled={loading} variant="secondary" size="sm">
                  {loading ? <Loader2 className="mr-1 h-3 w-3 animate-spin" /> : null}
                  /api/me
                </Button>
                
                <Button onClick={testDashboard} disabled={loading} variant="secondary" size="sm">
                  {loading ? <Loader2 className="mr-1 h-3 w-3 animate-spin" /> : null}
                  /dashboard
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {(result || error) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5" />
              Test Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <div className="flex items-center gap-2">
                  <Badge variant="destructive">ERROR</Badge>
                  <span className="text-red-800 font-medium">API Test Failed</span>
                </div>
                <p className="text-red-700 mt-2">{error}</p>
              </div>
            )}

            {result && (
              <div className={`border rounded-lg p-4 ${result.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                <div className="flex items-center gap-2 mb-3">
                  <Badge variant={result.success ? 'default' : 'destructive'}>
                    {result.success ? 'SUCCESS' : 'FAILED'}
                  </Badge>
                  <span className="font-medium">{result.endpoint}</span>
                </div>
                
                <p className={`mb-3 ${result.success ? 'text-green-700' : 'text-red-700'}`}>
                  {result.message}
                </p>

                <div className="bg-gray-50 rounded p-3">
                  <h4 className="font-medium mb-2">Response Data:</h4>
                  <pre className="text-xs overflow-auto max-h-96">
                    {JSON.stringify(result.success ? result.data : { error: result.error }, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>API Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div><strong>Environment:</strong> {process.env.NODE_ENV || 'development'}</div>
            <div><strong>Current Domain:</strong> {window.location.hostname}</div>
            <div><strong>API Base URL:</strong> Should be cilandak.nagari2.test (without /api)</div>
            <div><strong>Expected Full URL:</strong> http://cilandak.nagari2.test/api/warga</div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}