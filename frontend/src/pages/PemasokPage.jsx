import React, { useEffect, useState } from 'react'
import { Plus, PencilSimple, Trash, X } from '@phosphor-icons/react'
import api from '../services/api'
import { PageHeader, Button, Input, Modal, Table, Tr, Td, Badge, EmptyState } from '../components/ui'

export default function PemasokPage() {
  const [pemasok, setPemasok] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [form, setForm] = useState({ nama_pemasok: '', alamat: '', no_hp: '', email: '', catatan: '' })
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')

  const fetchPemasok = async () => {
    setLoading(true)
    try {
      const params = search ? `?search=${search}` : ''
      const res = await api.get(`/pemasok/${params}`)
      setPemasok(res.data.results || res.data)
    } catch (err) {
      console.error(err)
      setError('Gagal memuat data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchPemasok() }, [search])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      if (editingItem) {
        await api.put(`/pemasok/${editingItem.id}/`, form)
      } else {
        await api.post('/pemasok/', form)
      }
      setShowModal(false)
      setEditingItem(null)
      setForm({ nama_pemasok: '', alamat: '', no_hp: '', email: '', catatan: '' })
      fetchPemasok()
    } catch (err) {
      setError(err.response?.data?.detail || 'Gagal menyimpan')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Yakin hapus pemasok ini?')) return
    try {
      await api.delete(`/pemasok/${id}/`)
      fetchPemasok()
    } catch (err) {
      alert('Gagal menghapus')
    }
  }

  const openEdit = (item) => {
    setEditingItem(item)
    setForm({
      nama_pemasok: item.nama_pemasok,
      alamat: item.alamat || '',
      no_hp: item.no_hp || '',
      email: item.email || '',
      catatan: item.catatan || '',
    })
    setShowModal(true)
  }

  return (
    <div>
      <PageHeader
        title="Pemasok"
        subtitle="Kelola data supplier/pemasok"
        action={<Button icon={Plus} onClick={() => { setEditingItem(null); setForm({ nama_pemasok: '', alamat: '', no_hp: '', email: '', catatan: '' }); setShowModal(true) }}>Tambah Pemasok</Button>}
      />

      {/* Search */}
      <div style={{ marginBottom: 16 }}>
        <Input
          placeholder="Cari pemasok..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ maxWidth: 300 }}
        />
      </div>

      {error && <div style={{ background: 'var(--red-50)', color: 'var(--red-600)', padding: '12px 16px', borderRadius: 8, marginBottom: 16 }}>{error}</div>}

      <div style={{ background: '#fff', borderRadius: 'var(--radius-lg)', border: '1px solid var(--gray-100)', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--gray-400)' }}>Memuat...</div>
        ) : pemasok.length === 0 ? (
          <EmptyState message="Belum ada data pemasok" asRow={false} />
        ) : (
          <Table>
            <thead>
              <Tr>
                <Td style={{ fontWeight: 600 }}>Nama Pemasok</Td>
                <Td style={{ fontWeight: 600 }}>Alamat</Td>
                <Td style={{ fontWeight: 600 }}>No. HP</Td>
                <Td style={{ fontWeight: 600 }}>Email</Td>
                <Td style={{ fontWeight: 600, textAlign: 'right' }}>Aksi</Td>
              </Tr>
            </thead>
            <tbody>
              {pemasok.map(item => (
                <Tr key={item.id}>
                  <Td style={{ fontWeight: 500 }}>{item.nama_pemasok}</Td>
                  <Td style={{ color: 'var(--gray-600)', fontSize: 13 }}>{item.alamat || '-'}</Td>
                  <Td>
                    {item.no_hp ? (
                      <a href={`https://wa.me/${item.no_hp.replace(/\D/g,'')}`} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--green-600)', textDecoration: 'none' }}>
                        {item.no_hp}
                      </a>
                    ) : '-'}
                  </Td>
                  <Td style={{ color: 'var(--gray-500)', fontSize: 13 }}>{item.email || '-'}</Td>
                  <Td style={{ textAlign: 'right' }}>
                    <Button size="sm" variant="ghost" onClick={() => openEdit(item)} title="Edit">
                      <PencilSimple size={16} />
                    </Button>
                    <Button size="sm" variant="ghost" color="var(--red-500)" onClick={() => handleDelete(item.id)} title="Hapus">
                      <Trash size={16} />
                    </Button>
                  </Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        )}
      </div>

      {/* Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingItem ? 'Edit Pemasok' : 'Tambah Pemasok'}>
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Input
              label="Nama Pemasok"
              value={form.nama_pemasok}
              onChange={e => setForm({ ...form, nama_pemasok: e.target.value })}
              required
              placeholder="Contoh: Supplier Kedelai XYZ"
            />
            <Input
              label="Alamat"
              value={form.alamat}
              onChange={e => setForm({ ...form, alamat: e.target.value })}
              placeholder="Alamat lengkap"
            />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Input
                label="No. HP"
                type="tel"
                value={form.no_hp}
                onChange={e => setForm({ ...form, no_hp: e.target.value })}
                placeholder="Contoh: 081234567890"
              />
              <Input
                label="Email"
                type="email"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                placeholder="email@example.com"
              />
            </div>
            <Input
              label="Catatan"
              value={form.catatan}
              onChange={e => setForm({ ...form, catatan: e.target.value })}
              placeholder="Catatan tambahan (opsional)"
            />
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <Button type="submit" style={{ flex: 1 }}>{editingItem ? 'Simpan' : 'Tambah'}</Button>
              <Button type="button" variant="secondary" onClick={() => setShowModal(false)}>Batal</Button>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  )
}