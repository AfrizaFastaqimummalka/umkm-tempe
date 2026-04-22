import React, { useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { TrendUp, TrendDown, Wallet, ArrowClockwise } from '@phosphor-icons/react'
import api from '../services/api'
import { formatRupiah } from '../components/ui'

function StatCard({ label, value, icon: Icon, color, bg, loading }) {
  return (
    <div style={{
      background: '#fff', borderRadius: 'var(--radius-lg)',
      padding: '20px 22px', border: '1px solid var(--gray-100)',
      boxShadow: 'var(--shadow-sm)',
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--gray-500)', letterSpacing: '.04em', textTransform: 'uppercase', marginBottom: 8 }}>{label}</p>
          {loading ? (
            <div style={{ height: 28, width: '70%', borderRadius: 6, background: 'var(--gray-100)', animation: 'pulse 1.5s ease infinite' }} />
          ) : (
            <p style={{ fontSize: 22, fontWeight: 800, color, fontFamily: 'var(--font-mono)', lineHeight: 1.2 }}>{value}</p>
          )}
        </div>
        <div style={{ width: 44, height: 44, borderRadius: 12, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Icon size={22} weight="fill" color={color} />
        </div>
      </div>
    </div>
  )
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: '#fff', border: '1px solid var(--gray-200)', borderRadius: 10, padding: '10px 14px', boxShadow: 'var(--shadow-md)', fontSize: 13 }}>
      <p style={{ fontWeight: 700, marginBottom: 6, color: 'var(--gray-700)' }}>{label}</p>
      {payload.map(p => (
        <div key={p.name} style={{ display: 'flex', justifyContent: 'space-between', gap: 20, color: p.fill, marginBottom: 2 }}>
          <span>{p.name === 'pemasukan' ? 'Pemasukan' : 'Pengeluaran'}</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{formatRupiah(p.value)}</span>
        </div>
      ))}
    </div>
  )
}

export default function DashboardPage() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [periode, setPeriode] = useState('bulan')

  const fetchData = async () => {
    setLoading(true)
    try {
      const res = await api.get(`/dashboard/?periode=${periode}`)
      setData(res.data)
    } catch (err) {
      console.error('Dashboard error:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [periode])

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--gray-900)' }}>Dashboard</h1>
          <p style={{ fontSize: 14, color: 'var(--gray-500)', marginTop: 2 }}>{loading ? '...' : data?.label}</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {['hari', 'bulan', 'tahun'].map(p => (
            <button
              key={p} onClick={() => setPeriode(p)}
              style={{
                padding: '6px 14px', borderRadius: 'var(--radius-md)', fontSize: 13, fontWeight: 600,
                background: periode === p ? 'var(--green-500)' : '#fff',
                color: periode === p ? '#fff' : 'var(--gray-500)',
                border: `1.5px solid ${periode === p ? 'var(--green-500)' : 'var(--gray-200)'}`,
                cursor: 'pointer', transition: 'all .15s', textTransform: 'capitalize',
              }}
            >
              {p === 'hari' ? 'Hari Ini' : p === 'bulan' ? 'Bulan Ini' : 'Tahun Ini'}
            </button>
          ))}
          <button onClick={fetchData} style={{ background: 'none', padding: 6, border: '1.5px solid var(--gray-200)', borderRadius: 'var(--radius-md)', display: 'flex', cursor: 'pointer', color: 'var(--gray-500)' }}>
            <ArrowClockwise size={16} />
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 28 }}>
        <StatCard
          label="Total Pemasukan" loading={loading}
          value={data ? formatRupiah(data.total_pemasukan) : '-'}
          icon={TrendUp} color="var(--green-600)" bg="var(--green-50)"
        />
        <StatCard
          label="Total Pengeluaran" loading={loading}
          value={data ? formatRupiah(data.total_pengeluaran) : '-'}
          icon={TrendDown} color="var(--red-600)" bg="var(--red-50)"
        />
        <StatCard
          label="Saldo Bersih" loading={loading}
          value={data ? formatRupiah(data.saldo) : '-'}
          icon={Wallet}
          color={data?.saldo >= 0 ? 'var(--green-600)' : 'var(--red-600)'}
          bg={data?.saldo >= 0 ? 'var(--green-50)' : 'var(--red-50)'}
        />
      </div>

      {/* Chart */}
      <div style={{
        background: '#fff', borderRadius: 'var(--radius-lg)',
        padding: '24px', border: '1px solid var(--gray-100)',
        boxShadow: 'var(--shadow-sm)',
      }}>
        <h2 style={{ fontSize: 15, fontWeight: 700, color: 'var(--gray-800)', marginBottom: 4 }}>Grafik 7 Hari Terakhir</h2>
        <p style={{ fontSize: 13, color: 'var(--gray-400)', marginBottom: 20 }}>Perbandingan pemasukan vs pengeluaran harian</p>

        {loading ? (
          <div style={{ height: 260, background: 'var(--gray-50)', borderRadius: 10, animation: 'pulse 1.5s ease infinite' }} />
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={data?.last_7_days || []} barCategoryGap="30%" barGap={4}>
              <XAxis dataKey="tanggal" tick={{ fontSize: 12, fill: 'var(--gray-400)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--gray-400)' }} axisLine={false} tickLine={false} tickFormatter={v => v >= 1e6 ? `${(v/1e6).toFixed(0)}jt` : `${(v/1e3).toFixed(0)}rb`} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--gray-50)', radius: 6 }} />
              <Bar dataKey="pemasukan" name="pemasukan" fill="var(--green-500)" radius={[6, 6, 0, 0]} />
              <Bar dataKey="pengeluaran" name="pengeluaran" fill="var(--red-500)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}

        {/* Legend */}
        <div style={{ display: 'flex', gap: 20, marginTop: 12 }}>
          {[{ label: 'Pemasukan', color: 'var(--green-500)' }, { label: 'Pengeluaran', color: 'var(--red-500)' }].map(({ label, color }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--gray-500)' }}>
              <div style={{ width: 12, height: 12, borderRadius: 3, background: color }} />
              {label}
            </div>
          ))}
        </div>
      </div>

      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.5} }`}</style>
    </div>
  )
}
