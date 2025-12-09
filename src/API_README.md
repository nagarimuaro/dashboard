# API Integration Guide - Nagari Terpadu

## Overview

This guide explains how to use the comprehensive API integration system implemented for Nagari Terpadu. The system includes a robust API client, service layer, state management, and error handling.

## Quick Start

### 1. Environment Setup

Copy and configure environment variables:

```bash
cp .env.example .env
# Edit .env with your production API URL

cp .env.local.example .env.local  
# Edit .env.local for development
```

### 2. App Context Usage

Wrap your app with the AppProvider and access context:

```jsx
import { AppProvider, useApp } from './context/AppContext';

function MyComponent() {
  const { user, tenant, loading, hasPermission } = useApp();
  
  if (loading) return <div>Loading...</div>;
  
  return (
    <div>
      <h1>Welcome {user?.nama}</h1>
      <p>Nagari: {tenant?.nama}</p>
    </div>
  );
}

function App() {
  return (
    <AppProvider>
      <MyComponent />
    </AppProvider>
  );
}
```

### 3. API Service Usage

```jsx
import { wargaService, useApiCall } from './services';

function WargaList() {
  const { data, loading, error, refetch } = useApiCall(
    () => wargaService.getAll({ page: 1, per_page: 10 }),
    [],
    {
      showErrorToast: true,
      errorMessage: 'Failed to load warga data'
    }
  );

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {data?.data?.map(warga => (
        <div key={warga.id}>{warga.nama}</div>
      ))}
      <button onClick={refetch}>Refresh</button>
    </div>
  );
}
```

### 4. Search Component Usage

```jsx
import SearchInput from './components/SearchInput';
import { wargaService } from './services';

function WargaSearch() {
  const searchWarga = (term) => wargaService.search({ search: term });

  return (
    <SearchInput
      placeholder="Search warga..."
      searchFunction={searchWarga}
      onSelect={(warga) => console.log('Selected:', warga)}
    />
  );
}
```

### 5. File Upload Usage

```jsx
import FileUpload from './components/FileUpload';

function DocumentUpload() {
  const handleUpload = (files) => {
    console.log('Uploaded files:', files);
  };

  return (
    <FileUpload
      onUpload={handleUpload}
      accept="image/*,.pdf,.doc,.docx"
      multiple={true}
    />
  );
}
```

## Available Services

### Authentication Service
```jsx
import { authService } from './services';

// Login
const response = await authService.login({ 
  email: 'user@example.com', 
  password: 'password' 
});

// Logout
await authService.logout();

// Get current user
const user = await authService.getCurrentUser();
```

### Warga Service
```jsx
import { wargaService } from './services';

// Get all with pagination
const wargaList = await wargaService.getAll({ page: 1, per_page: 15 });

// Search by NIK
const warga = await wargaService.searchByNIK('1234567890123456');

// Create new warga
const newWarga = await wargaService.create({
  nama: 'Ahmad Fauzi',
  nik: '1234567890123456',
  // ... other fields
});

// Update warga
const updated = await wargaService.update(id, data);

// Get statistics
const stats = await wargaService.getStatistics();
```

### Keluarga Service
```jsx
import { keluargaService } from './services';

// Get all families
const families = await keluargaService.getAll();

// Add family member
await keluargaService.addMember(keluargaId, wargaId, 'Anak');

// Remove family member
await keluargaService.removeMember(keluargaId, wargaId);
```

### Pelayanan Service
```jsx
import { pelayananService } from './services';

// Get all service types
const jenisLayanan = await pelayananService.jenisLayanan.getAll();

// Create new request
const permohonan = await pelayananService.permohonan.create({
  jenis_layanan_id: 1,
  warga_id: 123,
  keterangan: 'Keperluan...'
});

// Update status
await pelayananService.permohonan.updateStatus(id, 'Diproses');

// Generate PDF
const pdf = await pelayananService.permohonan.generateSurat(id);
```

## Custom Hooks

### useApiCall Hook
```jsx
import { useApiCall } from './hooks/useApiCall';

const { data, loading, error, execute, refetch } = useApiCall(
  apiFunction,
  dependencies,
  {
    immediate: true,        // Auto-execute on mount
    showSuccessToast: false,
    showErrorToast: true,
    successMessage: 'Success!',
    errorMessage: 'Custom error message',
    onSuccess: (data) => console.log('Success:', data),
    onError: (error) => console.log('Error:', error)
  }
);
```

### useDebounceSearch Hook
```jsx
import { useDebounceSearch } from './hooks/useDebounceSearch';

const { 
  searchTerm, 
  setSearchTerm, 
  results, 
  loading, 
  error,
  clearSearch 
} = useDebounceSearch(searchFunction, 300);
```

## Error Handling

The system includes comprehensive error handling:

```jsx
try {
  const data = await wargaService.create(wargaData);
} catch (error) {
  if (error instanceof ValidationError) {
    // Handle validation errors
    console.log('Validation errors:', error.errors);
  } else if (error instanceof AuthenticationError) {
    // Handle auth errors (auto-redirects to login)
  } else if (error instanceof NetworkError) {
    // Handle network errors
  } else {
    // Handle other errors
  }
}
```

## Multi-tenant Support

The system automatically handles multi-tenant requests:

```jsx
import { authService } from './services';

// Login with tenant resolution
const response = await authService.login({
  email: 'admin@kotobaru.id',
  password: 'password'
});

// Tenant is automatically detected and set
console.log('Current tenant:', response.tenant);

// All subsequent API calls include tenant header
```

## Performance Monitoring

Enable debug mode to monitor performance:

```env
VITE_ENABLE_DEBUG=true
```

Use performance hooks:

```jsx
import { usePerformance, useRenderTime } from './hooks/usePerformance';

function MyComponent() {
  usePerformance('MyComponent');
  useRenderTime('MyComponent', [dependency1, dependency2]);
  
  return <div>Content</div>;
}
```

## File Upload Features

- Drag & drop support
- Progress tracking
- File type validation
- Size limit validation
- Multiple file support
- Error handling

## Offline Support

The system includes retry mechanisms and offline-capable features for areas with limited internet connectivity.

## Demo Component

Check `/components/ApiDemo.jsx` for complete examples of all features in action.

## Backend Requirements

Ensure your Laravel backend provides all endpoints as documented in the main project description, with proper CORS configuration and multi-tenant support.