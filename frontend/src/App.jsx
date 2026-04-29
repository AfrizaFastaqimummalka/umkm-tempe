import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Layout from './components/Layout'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import PemasukanPage from './pages/PemasukanPage'
import PengeluaranPage from './pages/PengeluaranPage'
import PelangganPage from './pages/PelangganPage'
import InventoriPage from './pages/InventoriPage'
import PemasokPage from './pages/PemasokPage'
import LaporanPage from './pages/LaporanPage'
import PengaturanPage from './pages/PengaturanPage'
import AdminNotifikasiPage from './pages/AdminNotifikasiPage'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', color:'var(--gray-500)', fontFamily:'var(--font-sans)' }}>Memuat...</div>
  return user ? children : <Navigate to="/login" replace />
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return null
  return user ? <Navigate to="/dashboard" replace /> : children
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
          <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="pemasukan" element={<PemasukanPage />} />
            <Route path="pengeluaran" element={<PengeluaranPage />} />
            <Route path="pelanggan" element={<PelangganPage />} />
            <Route path="inventori" element={<InventoriPage />} />
            <Route path="pemasok" element={<PemasokPage />} />
            <Route path="laporan" element={<LaporanPage />} />
            <Route path="pengaturan" element={<PengaturanPage />} />
            <Route path="admin-notifikasi" element={<AdminNotifikasiPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
