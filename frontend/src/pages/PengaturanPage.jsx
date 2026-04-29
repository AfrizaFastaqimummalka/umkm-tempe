import React, { useEffect, useState } from 'react'
import { PaperPlaneTilt, ToggleLeft, ToggleRight, CheckCircle, XCircle } from '@phosphor-icons/react'
import api from '../services/api'
import { PageHeader, Button, Input, Alert } from '../components/ui'

const COMPANY_NAME = 'Pabrik Tempe Pak Iwan'

export default function PengaturanPage() {
  const [settings, setSettings] = useState({
    bot_token: '',
    chat_id: '',
    notifications_enabled: false,
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [testing, setTesting] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })

  const fetchSettings = async () => {
    setLoading(true)
    try {
      const res = await api.get('/pengaturan/telegram/')
      setSettings(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchSettings() }, [])

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    setMessage({ type: '', text: '' })
    try {
      await api.post('/pengaturan/telegram/', settings)
      setMessage({ type: 'success', text: 'Pengaturan berhasil disimpan!' })
    } catch (err) {
      setMessage({ type: 'error', text: 'Gagal menyimpan pengaturan' })
    } finally {
      setSaving(false)
    }
  }

  const handleTest = async () => {
    setTesting(true)
    setMessage({ type: '', text: '' })
    try {
      const res = await api.post('/pengaturan/telegram/test/', {
        bot_token: settings.bot_token,
        chat_id: settings.chat_id,
      })
      if (res.data.success) {
        setMessage({ type: 'success', text: 'Pesan test berhasil dikirim! Cek Telegram Anda.' })
      } else {
        setMessage({ type: 'error', text: res.data.error || 'Gagal mengirim pesan' })
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.error || 'Gagal mengirim pesan test' })
    } finally {
      setTesting(false)
    }
  }

  const toggleNotifications = () => {
    setSettings({ ...settings, notifications_enabled: !settings.notifications_enabled })
  }

  if (loading) {
    return (
      <div>
        <PageHeader title="Pengaturan" subtitle="Konfigurasi sistem" />
        <div style={{ padding: 40, textAlign: 'center', color: 'var(--gray-400)' }}>Memuat...</div>
      </div>
    )
  }

  return (
    <div>
      <PageHeader
        title="Pengaturan"
        subtitle={`Konfigurasi untuk ${COMPANY_NAME}`}
      />

      {message.text && (
        <Alert variant={message.type} style={{ marginBottom: 20 }}>
          {message.text}
        </Alert>
      )}

      {/* Telegram Settings */}
      <div style={{
        background: '#fff', borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--gray-100)', padding: 24,
        boxShadow: 'var(--shadow-sm)', marginBottom: 24,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 10,
            background: 'var(--blue-50)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <PaperPlaneTilt size={20} color="var(--blue-600)" weight="fill" />
          </div>
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--gray-900)', margin: 0 }}>Pengaturan Telegram</h3>
            <p style={{ fontSize: 13, color: 'var(--gray-500)', margin: 0 }}>Konfigurasi bot untuk mengirim notifikasi</p>
          </div>
        </div>

        <form onSubmit={handleSave}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Input
              label="Bot Token"
              value={settings.bot_token}
              onChange={e => setSettings({ ...settings, bot_token: e.target.value })}
              placeholder="Contoh: 1234567890:ABCdefGHIjklMNOpqrsTUVwxyz"
              hint="Dapatkan dari @BotFather di Telegram"
            />
            <Input
              label="Chat ID"
              type="text"
              value={settings.chat_id}
              onChange={e => setSettings({ ...settings, chat_id: e.target.value })}
              placeholder="Contoh: 123456789"
              hint="Chat ID untuk menerima notifikasi"
            />

            {/* Toggle Notifikasi */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '16px 20px', background: 'var(--gray-50)', borderRadius: 'var(--radius-md)',
              marginTop: 8,
            }}>
              <div>
                <div style={{ fontWeight: 600, color: 'var(--gray-800)' }}>Aktifkan Notifikasi</div>
                <div style={{ fontSize: 13, color: 'var(--gray-500)' }}>Kirim laporan otomatis ke Telegram</div>
              </div>
              <button
                type="button"
                onClick={toggleNotifications}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                  color: settings.notifications_enabled ? 'var(--green-500)' : 'var(--gray-300',
                }}
              >
                {settings.notifications_enabled ? (
                  <ToggleRight size={40} weight="fill" />
                ) : (
                  <ToggleLeft size={40} weight="fill" />
                )}
              </button>
            </div>

            <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
              <Button type="submit" loading={saving}>
                Simpan Pengaturan
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={handleTest}
                loading={testing}
                disabled={!settings.bot_token || !settings.chat_id}
              >
                Kirim Pesan Test
              </Button>
            </div>
          </div>
        </form>
      </div>

      {/* Info Section */}
      <div style={{
        background: 'var(--blue-50)', borderRadius: 'var(--radius-lg)',
        padding: 20, border: '1px solid var(--blue-100)',
      }}>
        <h4 style={{ fontSize: 14, fontWeight: 700, color: 'var(--blue-800)', marginBottom: 8 }}>Cara Mendapatkan Chat ID</h4>
        <ol style={{ margin: 0, paddingLeft: 20, fontSize: 13, color: 'var(--blue-700)', lineHeight: 1.8 }}>
          <li>Buka bot @userinfobot di Telegram</li>
          <li>Kirim pesan apapun</li>
          <li>Bot akan membalas dengan Chat ID Anda</li>
          <li>Copy Chat ID tersebut dan masukkan di atas</li>
        </ol>
      </div>
    </div>
  )
}