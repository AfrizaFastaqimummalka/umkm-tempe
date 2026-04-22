import React, { useEffect, useState } from 'react'
import { Plus, PencilSimple, Trash, MagnifyingGlass, Phone, MapPin } from '@phosphor-icons/react'
import api from '../services/api'
import {
  PageHeader, Button, Modal, FormField, Input, Textarea, Table,
  Tr, Td, EmptyState, Alert
} from '../components/ui'

const EMPTY_FORM = { nama: '', no_hp: '', alamat: '', catatan: '' }

export default function PelangganPage() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [search, setSearch] = useState('')

  const fetchItems = async (q = '') => {
    setLoading(true)
    try {
      const res = await api.get('/pelanggan/', { params: q ? { search: q } : {} })
      setItems(res.data.results || res.data)
    } catch { setItems([]) }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchItems() }, [])

  const handleSearch = e => {
    const val = e.target.value
    setSearch(val)
    clearTimeout(window._searchTimer)
    window._searchTimer = setTimeout(() => fetchItems(val), 400)
  }

  const openAdd = () => { setEditItem(null); setForm(EMPTY_FORM); setError(''); setModalOpen(true) }
  const openEdit = item => {
    setEditItem(item)
    setForm({ nama: item.nama, no_hp: item.no_hp, alamat: item.alamat, catatan: item.catatan || '' })
    setError(''); setModalOpen(true)
  }

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const handleSubmit = async e => {
    e.preventDefault()
    if (!form.nama.trim()) { setError('Nama pelanggan wajib diisi'); return }
    setSubmitting(true); setError('')
    try {
      if (editItem) {
        await api.put(`/pelanggan/${editItem.id}/`, form)
      } else {
        await api.post('/pelanggan/', form)
      }
      setModalOpen(false)
      fetchItems(search)
    } catch (err) {
      setError(err.response?.data?.detail || 'Gagal menyimpan data.')
    } finally { setSubmitting(false) }
  }

  const handleDelete = async id => {
    try {
      await api.delete(`/pelanggan/${id}/`)
      setDeleteConfirm(null)
      fetchItems(search)
    } catch { alert('Gagal menghapus data.') }
  }

  return (
    <div>
      <PageHeader
        title="Pelanggan"
        subtitle={`${items.length} pelanggan terdaftar`}
        action={<Button onClick={openAdd}><Plus size={16} weight="bold" /> Tambah Pelanggan</Button>}
      />

      {/* Search */}
      <div style={{ position:'relative', marginBottom:20, maxWidth:340 }}>
        <MagnifyingGlass size={16} style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:'var(--gray-400)' }} />
        <input
          value={search} onChange={handleSearch}
          placeholder="Cari nama pelanggan..."
          style={{
            paddingLeft:36, paddingRight:12, paddingTop:9, paddingBottom:9,
            borderRadius:'var(--radius-md)', border:'1.5px solid var(--gray-300)',
            fontSize:14, width:'100%', color:'var(--gray-900)',
          }}
        />
      </div>

      <Table headers={['No', 'Nama', 'No. HP', 'Alamat', 'Catatan', 'Aksi']} loading={loading}>
        {items.length === 0 && !loading ? (
          <EmptyState
            title="Belum ada data pelanggan"
            subtitle={search ? `Tidak ada hasil untuk "${search}"` : 'Klik Tambah Pelanggan untuk mendaftarkan pelanggan pertama'}
            action={!search && <Button size="sm" onClick={openAdd}><Plus size={14} /> Tambah Sekarang</Button>}
          />
        ) : items.map((item, i) => (
          <Tr key={item.id}>
            <Td muted>{i + 1}</Td>
            <Td>
              <div style={{ fontWeight:600, color:'var(--gray-900)' }}>{item.nama}</div>
              <div style={{ fontSize:11, color:'var(--gray-400)', marginTop:1 }}>
                {new Date(item.created_at).toLocaleDateString('id-ID', { day:'2-digit', month:'short', year:'numeric' })}
              </div>
            </Td>
            <Td>
              {item.no_hp ? (
                <div style={{ display:'flex', alignItems:'center', gap:5, fontSize:13, color:'var(--gray-600)' }}>
                  <Phone size={13} /> {item.no_hp}
                </div>
              ) : <span style={{ color:'var(--gray-300)', fontSize:13 }}>—</span>}
            </Td>
            <Td>
              {item.alamat ? (
                <div style={{ display:'flex', alignItems:'flex-start', gap:5, fontSize:13, color:'var(--gray-600)', maxWidth:200 }}>
                  <MapPin size={13} style={{ marginTop:2, flexShrink:0 }} />
                  <span style={{ overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{item.alamat}</span>
                </div>
              ) : <span style={{ color:'var(--gray-300)', fontSize:13 }}>—</span>}
            </Td>
            <Td muted>{item.catatan || '—'}</Td>
            <Td>
              <div style={{ display:'flex', gap:6 }}>
                <Button size="sm" variant="secondary" onClick={() => openEdit(item)}><PencilSimple size={14} /></Button>
                <Button size="sm" variant="danger" onClick={() => setDeleteConfirm(item)}><Trash size={14} /></Button>
              </div>
            </Td>
          </Tr>
        ))}
      </Table>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editItem ? 'Edit Pelanggan' : 'Tambah Pelanggan'}>
        {error && <Alert type="error" style={{ marginBottom:16 }}>{error}</Alert>}
        <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:16, marginTop: error ? 12 : 0 }}>
          <FormField label="Nama Pelanggan" required>
            <Input name="nama" value={form.nama} onChange={handleChange} placeholder="Nama lengkap pelanggan" required />
          </FormField>
          <FormField label="No. HP">
            <Input name="no_hp" value={form.no_hp} onChange={handleChange} placeholder="Contoh: 08123456789" />
          </FormField>
          <FormField label="Alamat">
            <Textarea name="alamat" value={form.alamat} onChange={handleChange} placeholder="Alamat lengkap pelanggan" rows={2} />
          </FormField>
          <FormField label="Catatan">
            <Textarea name="catatan" value={form.catatan} onChange={handleChange} placeholder="Catatan tambahan (opsional)" rows={2} />
          </FormField>
          <div style={{ display:'flex', gap:10, justifyContent:'flex-end', marginTop:8 }}>
            <Button variant="secondary" onClick={() => setModalOpen(false)} type="button">Batal</Button>
            <Button type="submit" disabled={submitting}>{submitting ? 'Menyimpan...' : editItem ? 'Simpan Perubahan' : 'Tambah'}</Button>
          </div>
        </form>
      </Modal>

      <Modal open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Hapus Pelanggan" width={400}>
        <p style={{ fontSize:14, color:'var(--gray-600)', marginBottom:20 }}>
          Yakin ingin menghapus data pelanggan <strong>{deleteConfirm?.nama}</strong>? Data tidak bisa dikembalikan.
        </p>
        <div style={{ display:'flex', gap:10, justifyContent:'flex-end' }}>
          <Button variant="secondary" onClick={() => setDeleteConfirm(null)}>Batal</Button>
          <Button variant="danger" onClick={() => handleDelete(deleteConfirm.id)}><Trash size={15} /> Hapus</Button>
        </div>
      </Modal>
    </div>
  )
}
