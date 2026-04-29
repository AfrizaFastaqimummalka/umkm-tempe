import React, { useEffect, useState } from 'react'
import { Plus, PencilSimple, Trash, ArrowSquareOut, ArrowSquareIn, X } from '@phosphor-icons/react'
import api from '../services/api'
import { PageHeader, Button, Input, Select, Modal, Table, Tr, Td, Badge, EmptyState, formatRupiah } from '../components/ui'

const SATUAN_OPTIONS = [
  { value: 'kg', label: 'Kilogram (kg)' },
  { value: 'ons', label: 'Ons' },
  { value: 'pcs', label: 'Pieces (pcs)' },
  { value: 'pack', label: 'Pack' },
  { value: 'zak', label: 'Zak' },
  { value: 'liter', label: 'Liter' },
  { value: 'unit', label: 'Unit' },
]

export default function InventoriPage() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [showMovementModal, setShowMovementModal] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [selectedItem, setSelectedItem] = useState(null)
  const [form, setForm] = useState({ nama_barang: '', jumlah_stok: '', satuan: 'kg' })
  const [movement, setMovement] = useState({ jenis: 'masuk', jumlah: '', keterangan: '' })
  const [error, setError] = useState('')

  const fetchItems = async () => {
    setLoading(true)
    try {
      const res = await api.get('/inventori/')
      setItems(res.data.results || res.data)
    } catch (err) {
      console.error(err)
      setError('Gagal memuat data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchItems() }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      const payload = { ...form, jumlah_stok: parseFloat(form.jumlah_stok) }
      if (editingItem) {
        await api.put(`/inventori/${editingItem.id}/`, payload)
      } else {
        await api.post('/inventori/', payload)
      }
      setShowModal(false)
      setEditingItem(null)
      setForm({ nama_barang: '', jumlah_stok: '', satuan: 'kg' })
      fetchItems()
    } catch (err) {
      setError(err.response?.data?.detail || 'Gagal menyimpan')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Yakin hapus barang ini?')) return
    try {
      await api.delete(`/inventori/${id}/`)
      fetchItems()
    } catch (err) {
      alert('Gagal menghapus')
    }
  }

  const handleMovement = async (e) => {
    e.preventDefault()
    if (!selectedItem) return
    try {
      await api.post('/inventori/movements/', {
        inventori: selectedItem.id,
        jenis: movement.jenis,
        jumlah: parseFloat(movement.jumlah),
        keterangan: movement.keterangan,
      })
      setShowMovementModal(false)
      setMovement({ jenis: 'masuk', jumlah: '', keterangan: '' })
      setSelectedItem(null)
      fetchItems()
    } catch (err) {
      alert('Gagal mencatat pergerakan')
    }
  }

  const openEdit = (item) => {
    setEditingItem(item)
    setForm({ nama_barang: item.nama_barang, jumlah_stok: item.jumlah_stok.toString(), satuan: item.satuan })
    setShowModal(true)
  }

  const openMovement = (item) => {
    setSelectedItem(item)
    setShowMovementModal(true)
  }

  return (
    <div>
      <PageHeader
        title="Inventori"
        subtitle="Kelola stok barang dan material"
        action={<Button icon={Plus} onClick={() => { setEditingItem(null); setForm({ nama_barang: '', jumlah_stok: '', satuan: 'kg' }); setShowModal(true) }}>Tambah Barang</Button>}
      />

      {error && <div style={{ background: 'var(--red-50)', color: 'var(--red-600)', padding: '12px 16px', borderRadius: 8, marginBottom: 16 }}>{error}</div>}

      <div style={{ background: '#fff', borderRadius: 'var(--radius-lg)', border: '1px solid var(--gray-100)', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--gray-400)' }}>Memuat...</div>
        ) : items.length === 0 ? (
          <EmptyState message="Belum ada barang dalam inventori" asRow={false} />
        ) : (
          <Table>
            <thead>
              <Tr>
                <Td style={{ fontWeight: 600 }}>Nama Barang</Td>
                <Td style={{ fontWeight: 600 }}>Jumlah Stok</Td>
                <Td style={{ fontWeight: 600 }}>Satuan</Td>
                <Td style={{ fontWeight: 600 }}>Terakhir Update</Td>
                <Td style={{ fontWeight: 600, textAlign: 'right' }}>Aksi</Td>
              </Tr>
            </thead>
            <tbody>
              {items.map(item => (
                <Tr key={item.id}>
                  <Td style={{ fontWeight: 500 }}>{item.nama_barang}</Td>
                  <Td>
                    <span style={{ 
                      fontFamily: 'var(--font-mono)', 
                      fontWeight: 600,
                      color: item.jumlah_stok <= 5 ? 'var(--red-600)' : 'var(--gray-700)'
                    }}>
                      {item.jumlah_stok}
                    </span>
                    {item.jumlah_stok <= 5 && <Badge variant="red" style={{ marginLeft: 8 }}>Stok Rendah</Badge>}
                  </Td>
                  <Td><Badge variant="gray">{item.satuan}</Badge></Td>
                  <Td style={{ color: 'var(--gray-500)', fontSize: 13 }}>{new Date(item.tanggal_update).toLocaleDateString('id-ID')}</Td>
                  <Td style={{ textAlign: 'right' }}>
                    <Button size="sm" variant="ghost" onClick={() => openMovement(item)} title="Catat Pergerakan">
                      <ArrowSquareIn size={16} />
                    </Button>
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

      {/* Modal Tambah/Edit */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingItem ? 'Edit Barang' : 'Tambah Barang'}>
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Input
              label="Nama Barang"
              value={form.nama_barang}
              onChange={e => setForm({ ...form, nama_barang: e.target.value })}
              required
              placeholder="Contoh: Kedelai, Ragi, dll"
            />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Input
                label="Jumlah Stok"
                type="number"
                step="0.01"
                min="0"
                value={form.jumlah_stok}
                onChange={e => setForm({ ...form, jumlah_stok: e.target.value })}
                required
              />
              <Select
                label="Satuan"
                value={form.satuan}
                onChange={e => setForm({ ...form, satuan: e.target.value })}
                options={SATUAN_OPTIONS}
              />
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <Button type="submit" style={{ flex: 1 }}>{editingItem ? 'Simpan' : 'Tambah'}</Button>
              <Button type="button" variant="secondary" onClick={() => setShowModal(false)}>Batal</Button>
            </div>
          </div>
        </form>
      </Modal>

      {/* Modal Pergerakan Stok */}
      <Modal isOpen={showMovementModal} onClose={() => setShowMovementModal(false)} title={`Pergerakan Stok: ${selectedItem?.nama_barang}`}>
        <form onSubmit={handleMovement}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ padding: '12px 16px', background: 'var(--gray-50)', borderRadius: 8 }}>
              <span style={{ color: 'var(--gray-500)', fontSize: 13 }}>Stok Saat Ini: </span>
              <span style={{ fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{selectedItem?.jumlah_stok} {selectedItem?.satuan}</span>
            </div>
            <Select
              label="Jenis Pergerakan"
              value={movement.jenis}
              onChange={e => setMovement({ ...movement, jenis: e.target.value })}
              options={[
                { value: 'masuk', label: 'Stok Masuk (+)' },
                { value: 'keluar', label: 'Stok Keluar (-)' },
              ]}
            />
            <Input
              label="Jumlah"
              type="number"
              step="0.01"
              min="0"
              value={movement.jumlah}
              onChange={e => setMovement({ ...movement, jumlah: e.target.value })}
              required
            />
            <Input
              label="Keterangan"
              value={movement.keterangan}
              onChange={e => setMovement({ ...movement, keterangan: e.target.value })}
              placeholder="Contoh: Pembelian dari supplier"
            />
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <Button type="submit" style={{ flex: 1 }}>Simpan</Button>
              <Button type="button" variant="secondary" onClick={() => setShowMovementModal(false)}>Batal</Button>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  )
}