/**
 * API Integration Test Script
 * Test basic functionality dengan backend Laravel
 */

import { authService } from './src/services/authService.js';
import { wargaService } from './src/services/wargaService.js';
import { keluargaService } from './src/services/keluargaService.js';
import { userService } from './src/services/userService.js';
import { dashboardService } from './src/services/dashboardService.js';

/**
 * Test Suite untuk API Integration
 */
export const testAPI = async () => {
  console.log('🧪 Starting API Integration Tests...');
  
  // Test 1: Login
  try {
    console.log('\n1. Testing Login...');
    const loginResult = await authService.login({
      email: 'admin@cilandak.nagari.id',
      password: 'password123',
      tenant_slug: 'cilandak'
    });
    console.log('✅ Login Success:', loginResult?.user?.name || 'User data received');
  } catch (error) {
    console.log('❌ Login Failed:', error.message);
  }

  // Test 2: Dashboard Stats (Real Data)
  try {
    console.log('\n2. Testing Dashboard Stats...');
    const stats = await dashboardService.getDashboardStats();
    console.log('✅ Dashboard Stats:', {
      totalWarga: stats.data.stats.totalWarga,
      totalKeluarga: stats.data.stats.totalKeluarga,
      realData: stats.data.stats.totalWarga > 0 ? 'Yes' : 'Mock'
    });
  } catch (error) {
    console.log('❌ Dashboard Stats Failed:', error.message);
  }

  // Test 3: Warga Data (First Page)
  try {
    console.log('\n3. Testing Warga Data...');
    const wargaData = await wargaService.getAll({ page: 1, per_page: 5 });
    console.log('✅ Warga Data:', {
      count: wargaData?.data?.data?.length || 0,
      total: wargaData?.data?.meta?.total || wargaData?.data?.total || 'Unknown',
      realData: wargaData?.data ? 'Yes' : 'Mock'
    });
  } catch (error) {
    console.log('❌ Warga Data Failed:', error.message);
  }

  // Test 4: Keluarga Data
  try {
    console.log('\n4. Testing Keluarga Data...');
    const keluargaData = await keluargaService.getAll({ page: 1, per_page: 5 });
    console.log('✅ Keluarga Data:', {
      count: keluargaData?.data?.data?.length || 0,
      total: keluargaData?.data?.meta?.total || keluargaData?.data?.total || 'Unknown',
      realData: keluargaData?.data ? 'Yes' : 'Mock'
    });
  } catch (error) {
    console.log('❌ Keluarga Data Failed:', error.message);
  }

  // Test 5: Current User
  try {
    console.log('\n5. Testing Current User...');
    const currentUser = await authService.getCurrentUser();
    console.log('✅ Current User:', currentUser?.name || currentUser?.email || 'User data received');
  } catch (error) {
    console.log('❌ Current User Failed:', error.message);
  }

  console.log('\n🏁 API Integration Tests Completed!');
  console.log('\n📊 Summary:');
  console.log('- Backend URL: http://cilandak.nagari2.test/api');
  console.log('- Tenant: cilandak (auto-detected)');
  console.log('- Auth: Token-based with Laravel Sanctum');
  console.log('- Real Data: Dashboard gets actual counts from API');
  console.log('- Fallback: Mock data when endpoints unavailable');
};

// Export untuk console testing
window.testAPI = testAPI;

console.log('🔧 API Test Suite loaded. Run testAPI() in browser console to test.');