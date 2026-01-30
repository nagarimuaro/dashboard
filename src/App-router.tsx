import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AppLayout } from './components/layout/AppLayout'
import { AuthLayout } from './components/layout/AuthLayout'
import { LoginPage } from './pages/LoginPage'
import { DashboardPage } from './pages/DashboardPage'
import { DataWargaPage } from './pages/DataWargaPage'
import { WargaDetailPage } from './pages/WargaDetailPage'
import { AddWargaPage } from './pages/AddWargaPage'
import { DataKeluargaPage } from './pages/DataKeluargaPage'
import { KeluargaDetailPage } from './pages/KeluargaDetailPage'
import { WargaTestPage } from './pages/WargaTestPage'
import { PermohonanSuratPage, KelolaPermohonanPage, GISMapPage, TemplateManagerPage, KeuanganDashboardPage } from './pages/PelayananPages'
import { LayananSuratPage, PengaduanPage, ArsipSuratPage, UserManagementPage, SettingsPage, ProfilePage } from './pages/SystemPages'
import { CMSDashboardPage, CMSNewsPage, CMSPagesPage, CMSServicesPage, CMSStaffPage, CMSCategoriesPage, CMSSettingsPage, CMSHeroBannersPage, CMSDocumentsPage } from './pages/CMSPages'
import { 
  SuratDomisiliPage, SuratPindahPage, SuratKelahiranPage, SuratKematianPage, 
  SuratBelumMenikahPage, SuratNikahPage, SuratJandaDudaPage, SuratPenghasilanPage, 
  SuratTidakMampuPage, SuratSKCKPage, SuratUsahaPage, SuratIzinKeramianPage, 
  SuratKepemilikanTanahPage, SuratAhliWarisPage 
} from './pages/AdministrasiKependudukanPages'
import TemplateSuratManager from './pages/TemplateSuratManager'
import DaftarVariabelSurat from './pages/DaftarVariabelSurat'
import PermintaanSuratMonitor from './pages/PermintaanSuratMonitor'
import SuratRequestPage from './pages/SuratRequestPage'
import SuratRequestDetailPage from './pages/SuratRequestDetailPage'
import BuatSuratManualPage from './pages/BuatSuratManualPage'
import { 
  PerizinanIMBPage, PerizinanSITUPage, PerizinanHOPage, 
  PerizinanSIUPPage, PerizinanTrayekPage, PerizinanReklamePage 
} from './pages/AdministrasiPerizinanPages'
import { 
  SosialMiskinPage, SosialBeasiswaPage, SosialBantuanPage, SosialJamkesmasPage 
} from './pages/AdministrasiSosialPages'
import { 
  PertanahanTanahPage, PertanahanRiwayatPage, PertanahanJualBeliPage 
} from './pages/AdministrasiPertanahanPages'
import DataSosialPage from './pages/DataSosialPage'
import DataSosialDetailWrapper from './pages/DataSosialDetailWrapper'
import DataSosialIndexPage from './pages/DataSosialIndexPage'
import DataKesehatanPage from './pages/DataKesehatanPage'
import DataKemiskinanPage from './pages/DataKemiskinanPage'
import StatistikSosialPage from './pages/StatistikSosialPage'
import DemografiPage from './pages/DemografiPage'
import DataSosialBaruIndexPage from './pages/DataSosialBaruIndexPage'
import DataLembagaIndexPage from './pages/DataLembagaIndexPage'
import DataEkonomiIndexPage from './pages/DataEkonomiIndexPage'
import { KaderManagementPage, KelompokKaderManagementPage, KaderTugasPage, KaderPerformancePage, KaderKehamilanPage, KaderImunisasiPage, KaderPersalinanPage } from './pages/KaderPages'
import { JorongPage } from './pages/WilayahPages'
import { UmkmDirektoriPage, UmkmKategoriPage } from './pages/UmkmPages'
import { AppProvider } from './context/AppContext'
import { AuthProvider } from './context/AuthContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import { MobileBlocker } from './components/MobileBlocker'

function App() {
  return (
    <MobileBlocker>
      <AuthProvider>
        <AppProvider>
          <BrowserRouter>
          <Routes>
            {/* Auth Routes */}
            <Route path="/auth" element={<AuthLayout />}>
              <Route path="login" element={<LoginPage />} />
              <Route index element={<Navigate to="/auth/login" replace />} />
            </Route>

            {/* Main App Routes */}
            <Route path="/" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
              {/* Dashboard */}
              <Route index element={<DashboardPage />} />
              <Route path="dashboard" element={<DashboardPage />} />

            {/* Kependudukan */}
            <Route path="kependudukan">
              <Route index element={<DataWargaPage />} />
              <Route path="data-warga" element={<DataWargaPage />} />
              <Route path="data-warga/:id" element={<WargaDetailPage />} />
              <Route path="data-warga/add" element={<AddWargaPage />} />
              <Route path="data-keluarga" element={<DataKeluargaPage />} />
              <Route path="data-keluarga/:id" element={<KeluargaDetailPage />} />
              <Route path="warga-test" element={<WargaTestPage />} />
            </Route>

            {/* Wilayah */}
            <Route path="wilayah">
              <Route index element={<JorongPage />} />
              <Route path="jorong" element={<JorongPage />} />
            </Route>

            {/* Pelayanan */}
            <Route path="pelayanan">
              <Route index element={<TemplateManagerPage />} />
              <Route path="permohonan-surat" element={<PermohonanSuratPage />} />
              <Route path="kelola-permohonan" element={<KelolaPermohonanPage />} />
              <Route path="template-manager" element={<TemplateManagerPage />} />
              <Route path="template-surat" element={<TemplateSuratManager />} />
              <Route path="variabel-template" element={<DaftarVariabelSurat />} />
              <Route path="daftar-variabel" element={<DaftarVariabelSurat />} />
              <Route path="monitor-permintaan" element={<PermintaanSuratMonitor />} />
              <Route path="arsip-surat" element={<ArsipSuratPage />} />
              <Route path="surat-request" element={<SuratRequestPage />} />
              <Route path="surat-request/buat" element={<BuatSuratManualPage />} />
              <Route path="surat-request/:id" element={<SuratRequestDetailPage />} />
              
              {/* Layanan Surat dengan kategori - more specific routes */}
              <Route path="layanan/administrasi-umum" element={<LayananSuratPage />} />
              <Route path="layanan/administrasi-perizinan" element={<LayananSuratPage />} />
              <Route path="layanan/administrasi-sosial" element={<LayananSuratPage />} />
              <Route path="layanan/administrasi-pertanahan" element={<LayananSuratPage />} />
              <Route path="layanan/:kategori" element={<LayananSuratPage />} />
            </Route>

            {/* Administrasi Kependudukan - Surat Spesifik */}
            <Route path="surat">
              <Route path="domisili" element={<SuratDomisiliPage />} />
              <Route path="pindah" element={<SuratPindahPage />} />
              <Route path="kelahiran" element={<SuratKelahiranPage />} />
              <Route path="kematian" element={<SuratKematianPage />} />
              <Route path="belum-menikah" element={<SuratBelumMenikahPage />} />
              <Route path="nikah" element={<SuratNikahPage />} />
              <Route path="janda-duda" element={<SuratJandaDudaPage />} />
              <Route path="penghasilan" element={<SuratPenghasilanPage />} />
              <Route path="tidak-mampu" element={<SuratTidakMampuPage />} />
              <Route path="skck" element={<SuratSKCKPage />} />
              <Route path="usaha" element={<SuratUsahaPage />} />
              <Route path="izin-keramaian" element={<SuratIzinKeramianPage />} />
              <Route path="kepemilikan-tanah" element={<SuratKepemilikanTanahPage />} />
              <Route path="ahli-waris" element={<SuratAhliWarisPage />} />
            </Route>

            {/* Administrasi Perizinan - Surat Spesifik */}
            <Route path="perizinan">
              <Route path="imb" element={<PerizinanIMBPage />} />
              <Route path="situ" element={<PerizinanSITUPage />} />
              <Route path="ho" element={<PerizinanHOPage />} />
              <Route path="siup" element={<PerizinanSIUPPage />} />
              <Route path="trayek" element={<PerizinanTrayekPage />} />
              <Route path="reklame" element={<PerizinanReklamePage />} />
            </Route>

            {/* Administrasi Sosial - Surat Spesifik */}
            <Route path="sosial">
              <Route path="miskin" element={<SosialMiskinPage />} />
              <Route path="beasiswa" element={<SosialBeasiswaPage />} />
              <Route path="bantuan" element={<SosialBantuanPage />} />
              <Route path="jamkesmas" element={<SosialJamkesmasPage />} />
            </Route>

            {/* Administrasi Pertanahan - Surat Spesifik */}
            <Route path="pertanahan">
              <Route path="tanah" element={<PertanahanTanahPage />} />
              <Route path="riwayat" element={<PertanahanRiwayatPage />} />
              <Route path="jual-beli" element={<PertanahanJualBeliPage />} />
            </Route>

            {/* GIS */}
            <Route path="gis">
              <Route index element={<GISMapPage />} />
              <Route path="peta" element={<GISMapPage />} />
              <Route path="batas" element={<GISMapPage />} />
            </Route>

            {/* Data Sosial */}
            <Route path="statistik-sosial" element={<StatistikSosialPage />} />
            <Route path="demografi" element={<DemografiPage />} />
            <Route path="data-sosial">
              <Route index element={<DataKesehatanPage />} />
              {/* Halaman Grup: Kesehatan (Stunting, KB, Disabilitas) */}
              <Route path="kesehatan" element={<DataKesehatanPage />} />
              {/* Halaman Grup: Kemiskinan (Kemiskinan, RTLH, Putus Sekolah) */}
              <Route path="kemiskinan" element={<DataKemiskinanPage />} />
              {/* Direct access routes (untuk backward compatibility) */}
              <Route path="stunting" element={<DataSosialPage type="stunting" />} />
              <Route path="kb" element={<DataSosialPage type="kb" />} />
              <Route path="disabilitas" element={<DataSosialPage type="disabilitas" />} />
              <Route path="rtlh" element={<DataSosialPage type="rtlh" />} />
              <Route path="putus-sekolah" element={<DataSosialPage type="putus-sekolah" />} />
              {/* Data Sosial Baru - di dalam data-sosial */}
              <Route path="infrastruktur" element={<DataSosialBaruIndexPage />} />
              <Route path="yatim-piatu" element={<DataSosialBaruIndexPage />} />
              {/* Detail pages */}
              <Route path=":type/:id" element={<DataSosialDetailWrapper />} />
            </Route>

            {/* Data Sosial Baru - standalone route */}
            <Route path="data-sosial-baru">
              <Route index element={<DataSosialBaruIndexPage />} />
            </Route>

            {/* Data Lembaga */}
            <Route path="data-lembaga">
              <Route index element={<DataLembagaIndexPage />} />
              <Route path="keagamaan" element={<DataLembagaIndexPage />} />
              <Route path="pendidikan" element={<DataLembagaIndexPage />} />
            </Route>

            {/* Data Ekonomi */}
            <Route path="data-ekonomi">
              <Route index element={<DataEkonomiIndexPage />} />
              <Route path="ternak" element={<DataEkonomiIndexPage />} />
              <Route path="pbb" element={<DataEkonomiIndexPage />} />
            </Route>

            {/* Keuangan */}
            <Route path="keuangan">
              <Route index element={<KeuanganDashboardPage />} />
              <Route path="dashboard" element={<KeuanganDashboardPage />} />
              <Route path="apb" element={<KeuanganDashboardPage />} />
              <Route path="pendapatan" element={<KeuanganDashboardPage />} />
              <Route path="belanja" element={<KeuanganDashboardPage />} />
              <Route path="pembiayaan" element={<KeuanganDashboardPage />} />
              <Route path="transaksi" element={<KeuanganDashboardPage />} />
              <Route path="laporan" element={<KeuanganDashboardPage />} />
              <Route path="aset" element={<KeuanganDashboardPage />} />
              <Route path="realisasi" element={<KeuanganDashboardPage />} />
            </Route>

            {/* Pengaduan */}
            <Route path="pengaduan">
              <Route index element={<PengaduanPage />} />
              <Route path="keluhan" element={<PengaduanPage />} />
              <Route path="tracking" element={<PengaduanPage />} />
            </Route>

            {/* CMS Portal */}
            <Route path="cms">
              <Route index element={<CMSDashboardPage />} />
              <Route path="dashboard" element={<CMSDashboardPage />} />
              <Route path="news" element={<CMSNewsPage />} />
              <Route path="pages" element={<CMSPagesPage />} />
              <Route path="services" element={<CMSServicesPage />} />
              <Route path="staff" element={<CMSStaffPage />} />
              <Route path="categories" element={<CMSCategoriesPage />} />
              <Route path="hero-banners" element={<CMSHeroBannersPage />} />
              <Route path="documents" element={<CMSDocumentsPage />} />
              <Route path="settings" element={<CMSSettingsPage />} />
            </Route>

            {/* Kader Posyandu */}
            <Route path="kader">
              <Route index element={<KaderManagementPage />} />
              <Route path="management" element={<KaderManagementPage />} />
              <Route path="kelompok" element={<KelompokKaderManagementPage />} />
              <Route path="tugas" element={<KaderTugasPage />} />
              <Route path="performa" element={<KaderPerformancePage />} />
              <Route path="kehamilan" element={<KaderKehamilanPage />} />
              <Route path="imunisasi" element={<KaderImunisasiPage />} />
              <Route path="persalinan" element={<KaderPersalinanPage />} />
            </Route>

            {/* UMKM */}
            <Route path="umkm">
              <Route index element={<UmkmDirektoriPage />} />
              <Route path="direktori" element={<UmkmDirektoriPage />} />
              <Route path="kategori" element={<UmkmKategoriPage />} />
            </Route>

            {/* System */}
            <Route path="system">
              <Route index element={<UserManagementPage />} />
              <Route path="user-management" element={<UserManagementPage />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="arsip-surat" element={<ArsipSuratPage />} />
              <Route path="backup" element={<SettingsPage />} />
            </Route>

            {/* Profile */}
            <Route path="profile" element={<ProfilePage />} />

            {/* Fallback untuk route yang tidak ditemukan */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
        </BrowserRouter>
        </AppProvider>
      </AuthProvider>
    </MobileBlocker>
  )
}

export default App