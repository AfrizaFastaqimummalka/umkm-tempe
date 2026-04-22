import React, { useState, useCallback } from 'react'
import { DownloadSimple, FileXls, TrendUp, TrendDown, Wallet } from '@phosphor-icons/react'
import api from '../services/api'
import { PageHeader, Button, formatRupiah, Table, Tr, Td, Badge, EmptyState } from '../components/ui'

const BULAN_NAMES = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember']

function SummaryCard({ label, value, icon: Icon, color, bg }) {
  return (
    <div style={{ background:'#fff', borderRadius:'var(--radius-lg)', padding:'18px 20px', border:'1px solid var(--gray-100)', flex:1, minWidth:160 }}>
      <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:8 }}>
        <div style={{ width:36, height:36, borderRadius:10, background:bg, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
          <Icon size={18} weight="fill" color={color} />
        </div>
        <span style={{ fontSize:12, fontWeight:600, color:'var(--gray-500)', letterSpacing:'.04em', textTransform:'uppercase' }}>{label}</span>
      </div>
      <p style={{ fontSize:20, fontWeight:800, color, fontFamily:'var(--font-mono)' }}>{value}</p>
    </div>
  )
}

export default function LaporanPage() {
  const today = new Date()
  const [tipe, setTipe] = useState('bulanan')
  const [params, setParams] = useState({
    tanggal: today.toISOString().split('T')[0],
    bulan: today.getMonth() + 1,
    tahun: today.getFullYear(),
  })
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [exporting, setExporting] = useState(false)

  const fetchLaporan = useCallback(async () => {
    setLoading(true)
    try {
      let url = '/laporan/bulanan/'
      let query = { bulan: params.bulan, tahun: params.tahun }
      if (tipe === 'harian') { url = '/laporan/harian/'; query = { tanggal: params.tanggal } }
      if (tipe === 'tahunan') { url = '/laporan/tahunan/'; query = { tahun: params.tahun } }
      const res = await api.get(url, { params: query })
      setData(res.data)
    } catch (err) {
      console.error(err)
    } finally { setLoading(false) }
  }, [tipe, params])

  const handleExport = async () => {
    setExporting(true)
    try {
      const query = new URLSearchParams({ tipe })
      if (tipe === 'harian') query.set('tanggal', params.tanggal)
      if (tipe === 'bulanan') { query.set('bulan', params.bulan); query.set('tahun', params.tahun) }
      if (tipe === 'tahunan') query.set('tahun', params.tahun)

      const token = localStorage.getItem('access_token')
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'
      const res = await fetch(`${API_URL}/api/laporan/export/?${query}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error('Export gagal')
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `laporan_${tipe}_${Date.now()}.xlsx`
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      alert('Gagal export Excel. Coba lagi.')
    } finally { setExporting(false) }
  }

  return (
    <div>
      <PageHeader title="Laporan Keuangan" subtitle="Lihat dan export laporan berdasarkan periode" />

      {/* Controls */}
      <div style={{
        background:'#fff', border:'1px solid var(--gray-200)', borderRadius:'var(--radius-lg)',
        padding:'20px', marginBottom:24,
      }}>
        <div style={{ display:'flex', gap:8, marginBottom:20, flexWrap:'wrap' }}>
          {['harian', 'bulanan', 'tahunan'].map(t => (
            <button key={t} onClick={() => { setTipe(t); setData(null) }}
              style={{
                padding:'7px 18px', borderRadius:'var(--radius-md)', fontSize:13, fontWeight:600,
                background: tipe===t ? 'var(--green-500)' : '#fff',
                color: tipe===t ? '#fff' : 'var(--gray-500)',
                border: `1.5px solid ${tipe===t ? 'var(--green-500)' : 'var(--gray-200)'}`,
                cursor:'pointer', textTransform:'capitalize', transition:'all .15s',
              }}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        <div style={{ display:'flex', gap:12, flexWrap:'wrap', alignItems:'flex-end' }}>
          {tipe === 'harian' && (
            <div style={{ display:'flex', flexDirection:'column', gap:5 }}>
              <label style={{ fontSize:12, fontWeight:600, color:'var(--gray-600)' }}>Tanggal</label>
              <input type="date" value={params.tanggal}
                onChange={e => setParams(p => ({ ...p, tanggal: e.target.value }))}
                style={{ padding:'8px 12px', borderRadius:'var(--radius-sm)', border:'1.5px solid var(--gray-300)', fontSize:14 }}
              />
            </div>
          )}
          {tipe === 'bulanan' && (
            <>
              <div style={{ display:'flex', flexDirection:'column', gap:5 }}>
                <label style={{ fontSize:12, fontWeight:600, color:'var(--gray-600)' }}>Bulan</label>
                <select value={params.bulan} onChange={e => setParams(p => ({ ...p, bulan: parseInt(e.target.value) }))}
                  style={{ padding:'8px 12px', borderRadius:'var(--radius-sm)', border:'1.5px solid var(--gray-300)', fontSize:14, cursor:'pointer' }}>
                  {BULAN_NAMES.map((m, i) => <option key={i} value={i+1}>{m}</option>)}
                </select>
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap:5 }}>
                <label style={{ fontSize:12, fontWeight:600, color:'var(--gray-600)' }}>Tahun</label>
                <select value={params.tahun} onChange={e => setParams(p => ({ ...p, tahun: parseInt(e.target.value) }))}
                  style={{ padding:'8px 12px', borderRadius:'var(--radius-sm)', border:'1.5px solid var(--gray-300)', fontSize:14, cursor:'pointer' }}>
                  {[2023,2024,2025,2026].map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
            </>
          )}
          {tipe === 'tahunan' && (
            <div style={{ display:'flex', flexDirection:'column', gap:5 }}>
              <label style={{ fontSize:12, fontWeight:600, color:'var(--gray-600)' }}>Tahun</label>
              <select value={params.tahun} onChange={e => setParams(p => ({ ...p, tahun: parseInt(e.target.value) }))}
                style={{ padding:'8px 12px', borderRadius:'var(--radius-sm)', border:'1.5px solid var(--gray-300)', fontSize:14, cursor:'pointer' }}>
                {[2023,2024,2025,2026].map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
          )}
          <Button onClick={fetchLaporan} disabled={loading} style={{ alignSelf:'flex-end' }}>
            {loading ? 'Memuat...' : 'Lihat Laporan'}
          </Button>
        </div>
      </div>

      {/* Result */}
      {data && (
        <>
          {/* Summary cards */}
          <div style={{ display:'flex', gap:16, marginBottom:24, flexWrap:'wrap' }}>
            <SummaryCard label="Pemasukan" value={formatRupiah(data.total_pemasukan)}
              icon={TrendUp} color="var(--green-600)" bg="var(--green-50)" />
            <SummaryCard label="Pengeluaran" value={formatRupiah(data.total_pengeluaran)}
              icon={TrendDown} color="var(--red-600)" bg="var(--red-50)" />
            <SummaryCard label="Saldo Bersih" value={formatRupiah(data.saldo)}
              icon={Wallet}
              color={data.saldo >= 0 ? 'var(--green-600)' : 'var(--red-600)'}
              bg={data.saldo >= 0 ? 'var(--green-50)' : 'var(--red-50)'}
            />
          </div>

          {/* Export button */}
          <div style={{ display:'flex', justifyContent:'flex-end', marginBottom:16 }}>
            <Button onClick={handleExport} disabled={exporting} variant="secondary">
              <FileXls size={16} weight="fill" color="var(--green-600)" />
              {exporting ? 'Mengunduh...' : 'Export Excel (.xlsx)'}
            </Button>
          </div>

          {/* Pemasukan table */}
          <div style={{ marginBottom:28 }}>
            <h3 style={{ fontSize:15, fontWeight:700, color:'var(--gray-800)', marginBottom:12 }}>
              Detail Pemasukan
              <span style={{ marginLeft:8, fontSize:13, fontWeight:500, color:'var(--gray-400)' }}>({data.pemasukan.length} transaksi)</span>
            </h3>
            <Table headers={['Tanggal', 'Kategori', 'Keterangan', 'Jumlah']}>
              {data.pemasukan.length === 0 ? (
                <EmptyState title="Tidak ada pemasukan di periode ini" />
              ) : data.pemasukan.map(item => (
                <Tr key={item.id}>
                  <Td>{new Date(item.tanggal).toLocaleDateString('id-ID', { day:'2-digit', month:'short', year:'numeric' })}</Td>
                  <Td><Badge color="green">{item.kategori?.replace('_',' ')}</Badge></Td>
                  <Td muted>{item.keterangan || '-'}</Td>
                  <Td align="right">
                    <span style={{ fontFamily:'var(--font-mono)', fontWeight:700, color:'var(--green-600)', fontSize:14 }}>
                      {formatRupiah(item.jumlah)}
                    </span>
                  </Td>
                </Tr>
              ))}
            </Table>
          </div>

          {/* Pengeluaran table */}
          <div>
            <h3 style={{ fontSize:15, fontWeight:700, color:'var(--gray-800)', marginBottom:12 }}>
              Detail Pengeluaran
              <span style={{ marginLeft:8, fontSize:13, fontWeight:500, color:'var(--gray-400)' }}>({data.pengeluaran.length} transaksi)</span>
            </h3>
            <Table headers={['Tanggal', 'Kategori', 'Keterangan', 'Jumlah']}>
              {data.pengeluaran.length === 0 ? (
                <EmptyState title="Tidak ada pengeluaran di periode ini" />
              ) : data.pengeluaran.map(item => (
                <Tr key={item.id}>
                  <Td>{new Date(item.tanggal).toLocaleDateString('id-ID', { day:'2-digit', month:'short', year:'numeric' })}</Td>
                  <Td><Badge color="amber">{item.kategori?.replace('_',' ')}</Badge></Td>
                  <Td muted>{item.keterangan || '-'}</Td>
                  <Td align="right">
                    <span style={{ fontFamily:'var(--font-mono)', fontWeight:700, color:'var(--red-600)', fontSize:14 }}>
                      {formatRupiah(item.jumlah)}
                    </span>
                  </Td>
                </Tr>
              ))}
            </Table>
          </div>
        </>
      )}

      {!data && !loading && (
        <div style={{ textAlign:'center', padding:'60px 20px', color:'var(--gray-400)' }}>
          <div style={{ fontSize:40, marginBottom:12 }}>📊</div>
          <p style={{ fontWeight:600, color:'var(--gray-600)', marginBottom:4 }}>Pilih periode dan klik "Lihat Laporan"</p>
          <p style={{ fontSize:13 }}>Data laporan akan ditampilkan di sini</p>
        </div>
      )}
    </div>
  )
}
