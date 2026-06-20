'use client'
import { useState, useEffect } from 'react'

type Settings = Record<string, string>

const SETTING_FIELDS = [
  { key: 'laundry_name', label: 'Nama Laundry', placeholder: 'Z Laundry' },
  { key: 'laundry_address', label: 'Alamat', placeholder: 'Jl. Contah No. 123' },
  { key: 'laundry_phone', label: 'No. Telp', placeholder: '0812xxxxxxxx' },
  { key: 'fonnte_token', label: 'Fonnte Token', placeholder: 'Token dari fonnte.com', type: 'password' },
  { key: 'wa_admin_number', label: 'No. WA Admin', placeholder: '628xxxxxxxxxx' },
]

export default function PengaturanPage() {
  const [settings, setSettings] = useState<Settings>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    fetch('/api/settings')
      .then(r => r.json())
      .then(setSettings)
      .finally(() => setLoading(false))
  }, [])

  async function handleSave() {
    setSaving(true)
    setSuccess(false)
    await fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    })
    setSaving(false)
    setSuccess(true)
    setTimeout(() => setSuccess(false), 2000)
  }

  if (loading) return <div className="p-6 text-center text-gray-400">Memuat...</div>

  return (
    <div className="p-6 max-w-2xl">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900">Pengaturan</h1>
        <p className="text-sm text-gray-500 mt-0.5">Konfigurasi laundry & integrasi WhatsApp</p>
      </div>

      <div className="space-y-6">
        {/* Info Laundry */}
        <div className="card">
          <h2 className="font-medium text-gray-900 mb-4">🧺 Informasi Laundry</h2>
          {SETTING_FIELDS.filter(f => f.key.startsWith('laundry')).map(f => (
            <div key={f.key} className="mb-3">
              <label className="label">{f.label}</label>
              <input
                className="input"
                placeholder={f.placeholder}
                value={settings[f.key] || ''}
                onChange={e => setSettings(s => ({ ...s, [f.key]: e.target.value }))}
              />
            </div>
          ))}
        </div>

        {/* WhatsApp */}
        <div className="card">
          <h2 className="font-medium text-gray-900 mb-4">📱 Integrasi WhatsApp (Fonnte)</h2>
          <p className="text-xs text-gray-500 mb-4">
            Notifikasi otomatis dikirim ke pelanggan saat status order berubah.
            Dapatkan token di <a href="https://fonnte.com" target="_blank" className="text-blue-600 underline">fonnte.com</a>
          </p>
          {SETTING_FIELDS.filter(f => f.key.startsWith('fonnte') || f.key.startsWith('wa_')).map(f => (
            <div key={f.key} className="mb-3">
              <label className="label">{f.label}</label>
              <input
                className="input"
                type={f.type || 'text'}
                placeholder={f.placeholder}
                value={settings[f.key] || ''}
                onChange={e => setSettings(s => ({ ...s, [f.key]: e.target.value }))}
              />
            </div>
          ))}
        </div>

        {/* Save */}
        <div className="flex items-center gap-3">
          <button className="btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? 'Menyimpan...' : '💾 Simpan Pengaturan'}
          </button>
          {success && <span className="text-sm text-green-600 font-medium">✓ Tersimpan</span>}
        </div>
      </div>
    </div>
  )
}
