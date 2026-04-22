import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Eye, EyeSlash, LockKey } from '@phosphor-icons/react'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ username: '', password: '' })
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const handleSubmit = async e => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(form.username, form.password)
      navigate('/dashboard')
    } catch (err) {
      setError('Username atau password salah. Silakan coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100dvh', display: 'flex',
      background: 'linear-gradient(135deg, var(--green-50) 0%, #f0fdf9 60%, #fff 100%)',
    }}>
      {/* Left decorative panel - hidden on mobile */}
      <div style={{
        width: '45%', background: 'var(--green-600)',
        display: 'flex', flexDirection: 'column',
        justifyContent: 'center', padding: '60px 48px',
        position: 'relative', overflow: 'hidden',
      }} className="login-left">
        {/* Decorative circles */}
        <div style={{ position:'absolute', top:-80, right:-80, width:320, height:320, borderRadius:'50%', background:'rgba(255,255,255,.06)' }} />
        <div style={{ position:'absolute', bottom:-60, left:-60, width:240, height:240, borderRadius:'50%', background:'rgba(255,255,255,.04)' }} />

        <div style={{ position:'relative', zIndex:1 }}>
          <div style={{ fontSize: 48, marginBottom: 20 }}>🫘</div>
          <h1 style={{ fontSize: 32, fontWeight: 800, color: '#fff', lineHeight: 1.2, marginBottom: 12 }}>
            UMKM Tempe<br />Manajemen Keuangan
          </h1>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,.75)', lineHeight: 1.7, maxWidth: 340 }}>
            Kelola pemasukan, pengeluaran, dan laporan keuangan usaha tempe Anda dengan mudah dan terstruktur.
          </p>
          <div style={{ marginTop: 40, display: 'flex', flexDirection: 'column', gap: 12 }}>
            {['Laporan harian, bulanan & tahunan', 'Export Excel otomatis', 'Rekap via Telegram Bot', 'Data pelanggan terorganisir'].map(f => (
              <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'rgba(255,255,255,.9)', fontSize: 14 }}>
                <span style={{ width:18, height:18, borderRadius:'50%', background:'rgba(255,255,255,.2)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, fontSize:10 }}>✓</span>
                {f}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right: login form */}
      <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', padding:'24px 20px' }}>
        <div style={{ width:'100%', maxWidth:380 }}>
          {/* Mobile brand */}
          <div style={{ textAlign:'center', marginBottom:32 }} className="mobile-brand">
            <div style={{ fontSize:36, marginBottom:8 }}>🫘</div>
            <h1 style={{ fontSize:20, fontWeight:800, color:'var(--gray-900)' }}>UMKM Tempe</h1>
            <p style={{ fontSize:13, color:'var(--gray-500)' }}>Manajemen Keuangan</p>
          </div>

          <div style={{
            background: '#fff', borderRadius: 'var(--radius-lg)',
            padding: '36px 32px', boxShadow: '0 8px 32px rgba(0,0,0,.08)',
            border: '1px solid var(--gray-100)',
          }}>
            <div style={{ marginBottom: 28 }}>
              <div style={{
                width: 44, height: 44, borderRadius: 12,
                background: 'var(--green-50)', display: 'flex',
                alignItems: 'center', justifyContent: 'center', marginBottom: 16,
              }}>
                <LockKey size={22} weight="fill" color="var(--green-600)" />
              </div>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--gray-900)' }}>Masuk ke Sistem</h2>
              <p style={{ fontSize: 13, color: 'var(--gray-500)', marginTop: 4 }}>Masukkan kredensial admin Anda</p>
            </div>

            {error && (
              <div style={{
                background: 'var(--red-50)', border: '1px solid var(--red-500)',
                borderRadius: 'var(--radius-sm)', padding: '10px 14px',
                fontSize: 13, color: 'var(--red-600)', marginBottom: 20,
              }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--gray-700)' }}>Username</label>
                <input
                  name="username" type="text" value={form.username}
                  onChange={handleChange} placeholder="Masukkan username" required
                  style={{
                    padding: '10px 14px', borderRadius: 'var(--radius-sm)',
                    border: '1.5px solid var(--gray-300)', fontSize: 14,
                    color: 'var(--gray-900)', width: '100%',
                  }}
                  onFocus={e => e.target.style.borderColor = 'var(--green-500)'}
                  onBlur={e => e.target.style.borderColor = 'var(--gray-300)'}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--gray-700)' }}>Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    name="password" type={showPass ? 'text' : 'password'}
                    value={form.password} onChange={handleChange}
                    placeholder="Masukkan password" required
                    style={{
                      padding: '10px 42px 10px 14px', borderRadius: 'var(--radius-sm)',
                      border: '1.5px solid var(--gray-300)', fontSize: 14,
                      color: 'var(--gray-900)', width: '100%',
                    }}
                    onFocus={e => e.target.style.borderColor = 'var(--green-500)'}
                    onBlur={e => e.target.style.borderColor = 'var(--gray-300)'}
                  />
                  <button
                    type="button" onClick={() => setShowPass(s => !s)}
                    style={{
                      position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                      background: 'none', color: 'var(--gray-400)', display: 'flex', padding: 0,
                    }}
                  >
                    {showPass ? <EyeSlash size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button
                type="submit" disabled={loading}
                style={{
                  padding: '11px', borderRadius: 'var(--radius-md)',
                  background: loading ? 'var(--gray-300)' : 'var(--green-500)',
                  color: '#fff', fontWeight: 700, fontSize: 15,
                  cursor: loading ? 'not-allowed' : 'pointer', marginTop: 4,
                  transition: 'background .15s',
                }}
              >
                {loading ? 'Memproses...' : 'Masuk'}
              </button>
            </form>
          </div>
          <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--gray-400)', marginTop: 20 }}>
            Sistem Manajemen Keuangan UMKM Tempe © 2025
          </p>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .login-left { display: none !important; }
          .mobile-brand { display: block !important; }
        }
        @media (min-width: 769px) {
          .mobile-brand { display: none !important; }
        }
      `}</style>
    </div>
  )
}
