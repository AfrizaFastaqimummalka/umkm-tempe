import React, { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  ChartBar, ArrowCircleUp, ArrowCircleDown,
  Users, FileText, SignOut, List, X,
  Package, Truck, Gear, BellRinging
} from '@phosphor-icons/react'

const COMPANY_NAME = 'Pabrik Tempe Pak Iwan'

const navItems = [
  { to: '/dashboard',   label: 'Dashboard',    icon: ChartBar },
  { to: '/pemasukan',   label: 'Pemasukan',    icon: ArrowCircleUp },
  { to: '/pengeluaran', label: 'Pengeluaran',  icon: ArrowCircleDown },
  { to: '/pelanggan',   label: 'Pelanggan',    icon: Users },
  { to: '/inventori',   label: 'Inventori',    icon: Package },
  { to: '/pemasok',     label: 'Pemasok',      icon: Truck },
  { to: '/laporan',     label: 'Laporan',      icon: FileText },
  { to: '/admin-notifikasi', label: 'Admin Notif', icon: BellRinging },
  { to: '/pengaturan',  label: 'Pengaturan',   icon: Gear },
]

export default function Layout() {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const SidebarContent = () => (
    <>
      {/* Brand */}
      <div style={{ padding: '28px 20px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'var(--green-500)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <span style={{ fontSize: 18 }}>🫘</span>
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--gray-900)', lineHeight: 1.2 }}>{COMPANY_NAME}</div>
            <div style={{ fontSize: 11, color: 'var(--gray-500)', fontWeight: 500 }}>Sistem Keuangan</div>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: 'var(--gray-100)', margin: '0 20px 12px' }} />

      {/* Nav */}
      <nav style={{ flex: 1, padding: '0 12px' }}>
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            onClick={() => setSidebarOpen(false)}
            style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 12px', borderRadius: 'var(--radius-md)',
              marginBottom: 2, fontSize: 14, fontWeight: 500,
              color: isActive ? 'var(--green-700)' : 'var(--gray-600)',
              background: isActive ? 'var(--green-50)' : 'transparent',
              transition: 'all .15s',
            })}
          >
            {({ isActive }) => (
              <>
                <Icon size={18} weight={isActive ? 'fill' : 'regular'} />
                {label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Logout - More visible button */}
      <div style={{ padding: '12px', marginTop: 'auto' }}>
        <div style={{ height: 1, background: 'var(--gray-100)', marginBottom: 12 }} />
        <button
          onClick={handleLogout}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            width: '100%', padding: '12px 16px', borderRadius: 'var(--radius-md)',
            fontSize: 14, fontWeight: 600, color: '#fff',
            background: 'var(--red-500)', border: 'none',
            cursor: 'pointer', transition: 'all .15s',
            boxShadow: '0 2px 4px rgba(220, 38, 38, 0.2)',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'var(--red-600)'; e.currentTarget.style.transform = 'translateY(-1px)' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'var(--red-500)'; e.currentTarget.style.transform = 'translateY(0)' }}
        >
          <SignOut size={18} weight="bold" />
          Keluar (Logout)
        </button>
      </div>
    </>
  )

  return (
    <div style={{ display: 'flex', minHeight: '100dvh' }}>
      {/* Desktop Sidebar */}
      <aside style={{
        width: 'var(--sidebar-w)', flexShrink: 0,
        background: '#fff', borderRight: '1px solid var(--gray-200)',
        display: 'flex', flexDirection: 'column',
        position: 'sticky', top: 0, height: '100dvh',
      }} className="desktop-sidebar">
        <SidebarContent />
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,.4)',
            zIndex: 40, display: 'none',
          }}
          className="mobile-overlay"
        />
      )}

      {/* Mobile Sidebar drawer */}
      <aside style={{
        position: 'fixed', left: sidebarOpen ? 0 : '-260px', top: 0,
        width: 240, height: '100dvh', background: '#fff',
        borderRight: '1px solid var(--gray-200)',
        display: 'flex', flexDirection: 'column',
        zIndex: 50, transition: 'left .25s ease',
      }} className="mobile-sidebar">
        <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '12px 12px 0' }}>
          <button onClick={() => setSidebarOpen(false)} style={{ background: 'none', padding: 4 }}>
            <X size={20} color="var(--gray-500)" />
          </button>
        </div>
        <SidebarContent />
      </aside>

      {/* Main */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Mobile topbar */}
        <header style={{
          display: 'none', alignItems: 'center', gap: 12,
          padding: '12px 16px', background: '#fff',
          borderBottom: '1px solid var(--gray-200)',
          position: 'sticky', top: 0, zIndex: 30,
        }} className="mobile-header">
          <button onClick={() => setSidebarOpen(true)} style={{ background: 'none', padding: 4 }}>
            <List size={22} color="var(--gray-700)" />
          </button>
          <span style={{ fontWeight: 700, fontSize: 15 }}>UMKM Tempe</span>
        </header>

        <div style={{ flex: 1, padding: '24px', maxWidth: 1200, width: '100%', margin: '0 auto' }}>
          <Outlet />
        </div>
      </main>

      <style>{`
        @media (max-width: 768px) {
          .desktop-sidebar { display: none !important; }
          .mobile-header { display: flex !important; }
          .mobile-overlay { display: block !important; }
        }
        @media (min-width: 769px) {
          .mobile-sidebar { display: none !important; }
        }
      `}</style>
    </div>
  )
}
