import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { Separator } from './ui/separator';
import SearchInput from './SearchInput';
import FileUpload from './FileUpload';
import { useApiCall } from '../hooks/useApiCall';
import { useApp } from '../context/AppContext';
import { 
  wargaService, 
  keluargaService, 
  pelayananService,
  dashboardService 
} from '../services/index';
import { toast } from 'sonner@2.0.3';

const ApiDemo = () => {
  const { user, tenant } = useApp();
  const [selectedWarga, setSelectedWarga] = useState(null);

  // Example: Load dashboard stats
  const { 
    data: dashboardStats, 
    loading: loadingStats, 
    error: statsError,
    refetch: refetchStats 
  } = useApiCall(
    () => dashboardService.getStats(),
    [],
    {
      showErrorToast: true,
      errorMessage: 'Failed to load dashboard statistics'
    }
  );

  // Example: Load warga data with pagination
  const { 
    data: wargaData, 
    loading: loadingWarga, 
    refetch: refetchWarga 
  } = useApiCall(
    () => wargaService.getAll({ page: 1, per_page: 5 }),
    []
  );

  // Example: Search warga function
  const searchWarga = async (searchTerm) => {
    return wargaService.search({ search: searchTerm });
  };

  // Example: File upload handler
  const handleFileUpload = async (files) => {
    toast.success(`Successfully uploaded ${files.length} file(s)`);
    console.log('Uploaded files:', files);
  };

  // Example: Create new permohonan
  const createPermohonan = async () => {
    if (!selectedWarga) {
      toast.error('Please select a warga first');
      return;
    }

    try {
      const newPermohonan = await pelayananService.permohonan.create({
        jenis_layanan_id: 1,
        warga_id: selectedWarga.id,
        keterangan: 'Demo permohonan dari API integration',
        data_tambahan: {
          keperluan: 'Testing API integration'
        }
      });

      toast.success('Permohonan created successfully!');
      console.log('Created permohonan:', newPermohonan);
    } catch (error) {
      toast.error('Failed to create permohonan');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">API Integration Demo</h1>
        <Badge variant="outline">
          {tenant?.nama || 'Demo Nagari'}
        </Badge>
      </div>

      {/* Current User Info */}
      <Card>
        <CardHeader>
          <CardTitle>Current User & Tenant</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <strong>User:</strong> {user?.nama || 'Demo User'}
              <br />
              <strong>Role:</strong> {user?.role || 'admin_nagari'}
            </div>
            <div>
              <strong>Tenant:</strong> {tenant?.nama || 'Demo Nagari'}
              <br />
              <strong>Slug:</strong> {tenant?.slug || 'demo'}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dashboard Stats Example */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Dashboard Statistics
            <Button 
              onClick={refetchStats} 
              disabled={loadingStats}
              variant="outline"
              size="sm"
            >
              Refresh
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loadingStats ? (
            <div className="text-center py-4">Loading stats...</div>
          ) : statsError ? (
            <Alert variant="destructive">
              <AlertDescription>
                Error loading stats: {statsError.message}
              </AlertDescription>
            </Alert>
          ) : dashboardStats ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {dashboardStats.total_warga || 'N/A'}
                </div>
                <div className="text-sm text-gray-600">Total Warga</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {dashboardStats.total_keluarga || 'N/A'}
                </div>
                <div className="text-sm text-gray-600">Total Keluarga</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {dashboardStats.surat_dalam_proses || 'N/A'}
                </div>
                <div className="text-sm text-gray-600">Surat Proses</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {dashboardStats.apb_realisasi_persen || 'N/A'}%
                </div>
                <div className="text-sm text-gray-600">APB Realisasi</div>
              </div>
            </div>
          ) : (
            <div className="text-center py-4 text-gray-500">
              No data available
            </div>
          )}
        </CardContent>
      </Card>

      <Separator />

      {/* Search Demo */}
      <Card>
        <CardHeader>
          <CardTitle>Search Warga Demo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <SearchInput
              placeholder="Search warga by name or NIK..."
              searchFunction={searchWarga}
              onSelect={setSelectedWarga}
              renderResult={(warga, index) => (
                <div
                  key={warga.id}
                  className={`p-3 cursor-pointer border-b last:border-b-0 transition-colors
                    ${index === 0 ? 'bg-blue-50' : 'hover:bg-gray-50'}
                  `}
                >
                  <div className="font-medium">{warga.nama}</div>
                  <div className="text-sm text-gray-500">
                    NIK: {warga.nik} • {warga.jorong}
                  </div>
                </div>
              )}
            />
            
            {selectedWarga && (
              <Alert>
                <AlertDescription>
                  Selected: <strong>{selectedWarga.nama}</strong> (NIK: {selectedWarga.nik})
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>

      {/* File Upload Demo */}
      <Card>
        <CardHeader>
          <CardTitle>File Upload Demo</CardTitle>
        </CardHeader>
        <CardContent>
          <FileUpload
            onUpload={handleFileUpload}
            accept="image/*,.pdf,.doc,.docx"
            multiple={true}
          />
        </CardContent>
      </Card>

      {/* Warga List Demo */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Warga Data Example
            <Button 
              onClick={refetchWarga} 
              disabled={loadingWarga}
              variant="outline"
              size="sm"
            >
              Refresh
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loadingWarga ? (
            <div className="text-center py-4">Loading warga data...</div>
          ) : wargaData?.data ? (
            <div className="space-y-2">
              {wargaData.data.map((warga) => (
                <div key={warga.id} className="flex justify-between items-center p-2 border rounded">
                  <div>
                    <div className="font-medium">{warga.nama}</div>
                    <div className="text-sm text-gray-500">NIK: {warga.nik}</div>
                  </div>
                  <Badge variant="outline">{warga.jorong}</Badge>
                </div>
              ))}
              <div className="text-sm text-gray-500 mt-2">
                Showing {wargaData.data.length} of {wargaData.total} total warga
              </div>
            </div>
          ) : (
            <div className="text-center py-4 text-gray-500">
              No warga data available
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action Demo */}
      <Card>
        <CardHeader>
          <CardTitle>Actions Demo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Button 
              onClick={createPermohonan}
              disabled={!selectedWarga}
            >
              Create Permohonan
            </Button>
            <Button 
              variant="outline"
              onClick={() => toast.info('This is a demo toast notification')}
            >
              Test Toast
            </Button>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            Select a warga from the search above to enable creating permohonan
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ApiDemo;