import React, { useEffect, useState } from 'react'
import { Plus, PencilSimple, Trash, MagnifyingGlass } from '@phosphor-icons/react'
import api from '../services/api'
import {
  PageHeader, Button, Modal, FormField, Input, Select, Table,
  Tr, Td, Badge, EmptyState, Alert, formatRupiah
} from '../components/ui'

const EMPTY_FORM = { tanggal: new Date().toISOString().split('T')[0], jumlah: '', keterangan: '', kategori: 'penjualan' }

const KATEGORI_LABELS = {
  penjualan: { label: 'Penjualan Tempe', color: 'green' },
  titip_jual: { label: 'Titip Jual', color: 'amber' },
  lainnya: { label: 'Lainnya', color: 'gray' },
}

export default function PemasukanPage() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [filter, setFilter] = useState({ bulan: new Date().getMonth() + 1, tahun: new Date().getFullYear() })

  const fetchItems = async () => {
    setLoading(true)
    try {
      const res = await api.get('/pemasukan/', { params: { bulan: filter.bulan, tahun: filter.tahun } })
      setItems(res.data.results || res.data)
    } catch { setItems([]) }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchItems() }, [filter])

  const openAdd = () => { setEditItem(null); setForm(EMPTY_FORM); setError(''); setModalOpen(true) }
  const openEdit = (item) => {
    setEditItem(item)
    setForm({ tanggal: item.tanggal, jumlah: item.jumlah, keterangan: item.keterangan, kategori: item.kategori })
    setError('')
    setModalOpen(true)
  }

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const handleSubmit = async e => {
    e.preventDefault()
    if (!form.jumlah || Number(form.jumlah) <= 0) { setError('Jumlah harus lebih dari 0'); return }
    setSubmitting(true); setError('')
    try {
      if (editItem) {
        await api.put(`/pemasukan/${editItem.id}/`, form)
      } else {
        await api.post('/pemasukan/', form)
      }
      setModalOpen(false)
      fetchItems()
    } catch (err) {
      setError(err.response?.data?.detail || 'Gagal menyimpan data. Coba lagi.')
    } finally { setSubmitting(false) }
  }

  const handleDelete = async (id) => {
    try {
      await api.delete(`/pemasukan/${id}/`)
      setDeleteConfirm(null)
      fetchItems()
    } catch { alert('Gagal menghapus data.') }
  }

  const totalMasuk = items.reduce((s, i) => s + Number(i.jumlah), 0)

  return (
    <div>
      <PageHeader
        title="Pemasukan"
        subtitle={`${items.length} transaksi — Total: ${formatRupiah(totalMasuk)}`}
        action={<Button onClick={openAdd}><Plus size={16} weight="bold" /> Tambah Pemasukan</Button>}
      />

      {/* Filter bar */}
      <div style={{ display:'flex', gap:10, marginBottom:20, flexWrap:'wrap' }}>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <label style={{ fontSize:13, color:'var(--gray-600)', fontWeight:600 }}>Bulan:</label>
          <select
            value={filter.bulan}
            onChange={e => setFilter(f => ({ ...f, bulan: e.target.value }))}
            style={{ padding:'7px 10px', borderRadius:'var(--radius-sm)', border:'1.5px solid var(--gray-300)', fontSize:13, cursor:'pointer' }}
          >
            {['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Ags','Sep','Okt','Nov','Des'].map((m,i) => (
              <option key={i} value={i+1}>{m}</option>
            ))}
          </select>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <label style={{ fontSize:13, color:'var(--gray-600)', fontWeight:600 }}>Tahun:</label>
          <select
            value={filter.tahun}
            onChange={e => setFilter(f => ({ ...f, tahun: e.target.value }))}
            style={{ padding:'7px 10px', borderRadius:'var(--radius-sm)', border:'1.5px solid var(--gray-300)', fontSize:13, cursor:'pointer' }}
          >
            {[2023,2024,2025,2026].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>

      <Table headers={['No', 'Tanggal', 'Kategori', 'Keterangan', 'Jumlah', 'Aksi']} loading={loading}>
        {items.length === 0 && !loading ? (
          <EmptyState
            title="Belum ada data pemasukan"
            subtitle="Klik tombol Tambah Pemasukan untuk mulai mencatat"
            action={<Button size="sm" onClick={openAdd}><Plus size={14} /> Tambah Sekarang</Button>}
          />
        ) : items.map((item, i) => (
          <Tr key={item.id}>
            <Td muted>{i + 1}</Td>
            <Td>{new Date(item.tanggal).toLocaleDateString('id-ID', { day:'2-digit', month:'short', year:'numeric' })}</Td>
            <Td><Badge color={KATEGORI_LABELS[item.kategori]?.color || 'gray'}>{KATEGORI_LABELS[item.kategori]?.label || item.kategori}</Badge></Td>
            <Td muted>{item.keterangan || '-'}</Td>
            <Td align="right">
              <span style={{ fontFamily:'var(--font-mono)', fontWeight:700, color:'var(--green-600)', fontSize:14 }}>
                {formatRupiah(item.jumlah)}
              </span>
            </Td>
            <Td>
              <div style={{ display:'flex', gap:6 }}>
                <Button size="sm" variant="secondary" onClick={() => openEdit(item)}><PencilSimple size={14} /></Button>
                <Button size="sm" variant="danger" onClick={() => setDeleteConfirm(item)}><Trash size={14} /></Button>
              </div>
            </Td>
          </Tr>
        ))}
      </Table>

      {/* Add/Edit Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editItem ? 'Edit Pemasukan' : 'Tambah Pemasukan'}>
        {error && <Alert type="error" style={{ marginBottom:16 }}>{error}</Alert>}
        <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:16 }}>
          <FormField label="Tanggal" required>
            <Input type="date" name="tanggal" value={form.tanggal} onChange={handleChange} required />
          </FormField>
          <FormField label="Kategori" required>
            <Select name="kategori" value={form.kategori} onChange={handleChange}>
              <option value="penjualan">Penjualan Tempe</option>
              <option value="titip_jual">Titip Jual</option>
              <option value="lainnya">Lainnya</option>
            </Select>
          </FormField>
          <FormField label="Jumlah (Rp)" required error={error && Number(form.jumlah) <= 0 ? error : ''}>
            <Input type="number" name="jumlah" value={form.jumlah} onChange={handleChange} placeholder="Contoh: 150000" min="1" required />
          </FormField>
          <FormField label="Keterangan">
            <Input name="keterangan" value={form.keterangan} onChange={handleChange} placeholder="Opsional: catatan singkat" />
          </FormField>
          <div style={{ display:'flex', gap:10, justifyContent:'flex-end', marginTop:8 }}>
            <Button variant="secondary" onClick={() => setModalOpen(false)} type="button">Batal</Button>
            <Button type="submit" disabled={submitting}>{submitting ? 'Menyimpan...' : editItem ? 'Simpan Perubahan' : 'Tambah'}</Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirm Modal */}
      <Modal open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Hapus Pemasukan" width={400}>
        <p style={{ fontSize:14, color:'var(--gray-600)', marginBottom:20 }}>
          Yakin ingin menghapus pemasukan <strong>{formatRupiah(deleteConfirm?.jumlah)}</strong> pada tanggal <strong>{deleteConfirm?.tanggal}</strong>? Tindakan ini tidak dapat dibatalkan.
        </p>
        <div style={{ display:'flex', gap:10, justifyContent:'flex-end' }}>
          <Button variant="secondary" onClick={() => setDeleteConfirm(null)}>Batal</Button>
          <Button variant="danger" onClick={() => handleDelete(deleteConfirm.id)}><Trash size={15} /> Hapus</Button>
        </div>
      </Modal>
    </div>
  )
}
