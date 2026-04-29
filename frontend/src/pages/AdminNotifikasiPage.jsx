import React, { useEffect, useState } from 'react'
import { Plus, PencilSimple, Trash, PaperPlaneTilt, CheckCircle, WarningCircle, TelegramLogo } from '@phosphor-icons/react'
import api from '../services/api'
import { PageHeader, Button, Input, Modal, Table, Tr, Td, Badge, EmptyState } from '../components/ui'

export default function AdminNotifikasiPage() {
  const [admins, setAdmins] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [showConnectModal, setShowConnectModal] = useState(false)
  const [selectedAdmin, setSelectedAdmin] = useState(null)
  const [editingItem, setEditingItem] = useState(null)
  const [form, setForm] = useState({ nama: '', nomor_hp: '', is_active: true })
  const [error, setError] = useState('')
  const [botUsername, setBotUsername] = useState('umkm_tempe_bot') // Ganti default dengan bot sungguhan jika bisa diambil dari API

  const fetchAdmins = async () => {
    setLoading(true)
    try {
      const res = await api.get('/telegram-subscribers/')
      setAdmins(res.data.results || res.data)
    } catch (err) {
      console.error(err)
      setError('Gagal memuat data admin')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAdmins()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      if (editingItem) {
        await api.put(`/telegram-subscribers/${editingItem.id}/`, form)
      } else {
        await api.post('/telegram-subscribers/', form)
      }
      setShowModal(false)
      setEditingItem(null)
      setForm({ nama: '', nomor_hp: '', is_active: true })
      fetchAdmins()
    } catch (err) {
      setError(err.response?.data?.detail || 'Gagal menyimpan data')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Yakin menghapus admin ini? Mereka tidak akan menerima notifikasi lagi.')) return
    try {
      await api.delete(`/telegram-subscribers/${id}/`)
      fetchAdmins()
    } catch (err) {
      alert('Gagal menghapus')
    }
  }

  const openEdit = (item) => {
    setEditingItem(item)
    setForm({
      nama: item.nama,
      nomor_hp: item.nomor_hp || '',
      is_active: item.is_active,
    })
    setShowModal(true)
  }

  const handleTestNotification = async (id) => {
    try {
      const res = await api.post(`/telegram-subscribers/${id}/test_message/`)
      if (res.data.success) {
        alert('Pesan test berhasil dikirim!')
      }
    } catch (err) {
      alert(err.response?.data?.error || 'Gagal mengirim pesan')
    }
  }

  const openConnectModal = (item) => {
    setSelectedAdmin(item)
    setShowConnectModal(true)
  }

  return (
    <div>
      <PageHeader
        title="Admin Notifikasi"
        subtitle="Kelola daftar admin yang menerima laporan via Telegram"
        action={<Button icon={Plus} onClick={() => { setEditingItem(null); setForm({ nama: '', nomor_hp: '', is_active: true }); setShowModal(true) }}>Tambah Admin</Button>}
      />

      {error && <div style={{ background: 'var(--red-50)', color: 'var(--red-600)', padding: '12px 16px', borderRadius: 8, marginBottom: 16 }}>{error}</div>}

      <div style={{ background: '#fff', borderRadius: 'var(--radius-lg)', border: '1px solid var(--gray-100)', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--gray-400)' }}>Memuat...</div>
        ) : (
          <Table headers={['Nama Admin', 'No. HP', 'Status Telegram', 'Aksi']}>
            {admins.length === 0 ? (
              <EmptyState title="Belum ada admin notifikasi terdaftar" />
            ) : (
              admins.map(item => (
                <Tr key={item.id}>
                  <Td style={{ fontWeight: 500 }}>
                    {item.nama}
                    {!item.is_active && <span style={{ marginLeft: 8, fontSize: 11, color: 'var(--red-500)', background: 'var(--red-50)', padding: '2px 6px', borderRadius: 4 }}>Nonaktif</span>}
                  </Td>
                  <Td style={{ color: 'var(--gray-600)', fontSize: 13 }}>{item.nomor_hp || '-'}</Td>
                  <Td>
                    {item.telegram_verified ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--green-600)', fontSize: 13, fontWeight: 500 }}>
                        <CheckCircle size={18} weight="fill" />
                        Terhubung
                      </div>
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--orange-600)', fontSize: 13, fontWeight: 500 }}>
                        <WarningCircle size={18} weight="fill" />
                        Menunggu Verifikasi
                      </div>
                    )}
                  </Td>
                  <Td style={{ textAlign: 'right' }}>
                    {!item.telegram_verified ? (
                      <Button size="sm" variant="outline" style={{ marginRight: 8, borderColor: '#0088cc', color: '#0088cc' }} onClick={() => openConnectModal(item)}>
                        <TelegramLogo size={16} style={{ marginRight: 4 }} />
                        Hubungkan
                      </Button>
                    ) : (
                      <Button size="sm" variant="ghost" style={{ marginRight: 8 }} onClick={() => handleTestNotification(item.id)} title="Test Kirim Notif">
                        <PaperPlaneTilt size={16} />
                      </Button>
                    )}
                    
                    <Button size="sm" variant="ghost" onClick={() => openEdit(item)} title="Edit">
                      <PencilSimple size={16} />
                    </Button>
                    <Button size="sm" variant="ghost" color="var(--red-500)" onClick={() => handleDelete(item.id)} title="Hapus">
                      <Trash size={16} />
                    </Button>
                  </Td>
                </Tr>
              ))
            )}
          </Table>
        )}
      </div>

      {/* Modal Add/Edit */}
      <Modal open={showModal} onClose={() => setShowModal(false)} title={editingItem ? 'Edit Admin' : 'Tambah Admin Baru'}>
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Input
              label="Nama Admin"
              value={form.nama}
              onChange={e => setForm({ ...form, nama: e.target.value })}
              required
              placeholder="Contoh: Budi Santoso"
            />
            <Input
              label="No. HP / WhatsApp"
              type="tel"
              value={form.nomor_hp}
              onChange={e => setForm({ ...form, nomor_hp: e.target.value })}
              placeholder="Contoh: 081234567890"
            />
            
            {editingItem && (
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 14 }}>
                <input
                  type="checkbox"
                  checked={form.is_active}
                  onChange={e => setForm({ ...form, is_active: e.target.checked })}
                />
                Admin Aktif (Menerima Notifikasi)
              </label>
            )}

            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <Button type="submit" style={{ flex: 1 }}>{editingItem ? 'Simpan' : 'Tambah'}</Button>
              <Button type="button" variant="secondary" onClick={() => setShowModal(false)}>Batal</Button>
            </div>
          </div>
        </form>
      </Modal>

      {/* Modal Connect Telegram */}
      <Modal open={showConnectModal} onClose={() => setShowConnectModal(false)} title="Hubungkan Telegram">
        {selectedAdmin && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, textAlign: 'center' }}>
            <div style={{ background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: 8, padding: 20 }}>
              <TelegramLogo size={48} color="#0284c7" style={{ margin: '0 auto 12px' }} weight="duotone" />
              <h3 style={{ margin: '0 0 8px', color: '#0369a1', fontSize: 18 }}>Kode Verifikasi: <strong style={{ letterSpacing: 2 }}>{selectedAdmin.verification_code}</strong></h3>
              <p style={{ margin: 0, color: '#0c4a6e', fontSize: 14, lineHeight: 1.5 }}>
                Minta <b>{selectedAdmin.nama}</b> untuk membuka Telegram, lalu kirimkan kode di bawah ini ke bot.
              </p>
            </div>

            <div style={{ textAlign: 'left', background: '#f8fafc', padding: 16, borderRadius: 8 }}>
              <h4 style={{ margin: '0 0 8px', fontSize: 14, color: '#334155' }}>Instruksi untuk Admin:</h4>
              <ol style={{ margin: 0, paddingLeft: 20, fontSize: 14, color: '#475569', lineHeight: 1.6 }}>
                <li>Buka aplikasi Telegram</li>
                <li>Cari bot Telegram UMKM Tempe</li>
                <li>Ketik atau copy/paste teks berikut ke bot:</li>
              </ol>
              <div style={{ 
                background: '#e2e8f0', padding: '10px 14px', borderRadius: 6, 
                marginTop: 12, fontFamily: 'monospace', fontSize: 16, 
                display: 'flex', justifyContent: 'space-between', alignItems: 'center'
              }}>
                <b>/start {selectedAdmin.verification_code}</b>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  onClick={() => navigator.clipboard.writeText(`/start ${selectedAdmin.verification_code}`)}
                >
                  Copy
                </Button>
              </div>
            </div>

            <Button onClick={() => {
              setShowConnectModal(false)
              fetchAdmins() // Refresh status
            }} style={{ marginTop: 8 }}>
              Selesai & Refresh Status
            </Button>
          </div>
        )}
      </Modal>
    </div>
  )
}
