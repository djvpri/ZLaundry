'use client'
import { useState, useEffect } from 'react'

type Service = {
  id: string
  name: string
  type: 'PER_KG' | 'SATUAN'
  pricePerKg: number | null
  priceFlat: number | null
  unit: string | null
  isActive: boolean
}

const emptyForm = { name: '', type: 'PER_KG', pricePerKg: '', priceFlat: '', unit: 'pcs' }

export default function AdminServicesPage() {
  const [services, setServices] = useState<Service[]>([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ ...emptyForm })
  const [editId, setEditId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function fetchServices() {
    const res = await fetch('/api/admin/services')
    setServices(await res.json())
  }

  useEffect(() => { fetchServices() }, [])

  function openAdd() {
    setEditId(null)
    setForm({ ...emptyForm })
    setShowForm(true)
  }

  function openEdit(s: Service) {
    setEditId(s.id)
    setForm({
      name: s.name,
      type: s.type,
      pricePerKg: s.pricePerKg?.toString() || '',
      priceFlat: s.priceFlat?.toString() || '',
      unit: s.unit || 'pcs',
    })
    setShowForm(true)
  }

  async function handleSave() {
    if (!form.name) { alert('Nama layanan wajib diisi'); return }
    setLoading(true)

    const payload = {
      name: form.name,
      type: form.type,
      pricePerKg: form.type === 'PER_KG' ? form.pricePerKg : null,
      priceFlat: form.type === 'SATUAN' ? form.priceFlat : null,
      unit: form.type === 'SATUAN' ? form.unit : null,
    }

    const res = editId
      ? await fetch(`/api/admin/services/${editId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      : await fetch('/api/admin/services', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })

    setLoading(false)
    if (res.ok) {
      setShowForm(false)
      setEditId(null)
      fetchServices()
    } else {
      const data = await res.json()
      alert(data.error || 'Gagal menyimpan')
    }
  }

  async function toggleActive(s: Service) {
    await fetch(`/api/admin/services/${s.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !s.isActive }),
    })
    fetchServices()
  }

  async function handleDelete(s: Service) {
    if (!confirm(`Hapus layanan "${s.name}"? Data order yang memakai layanan ini tidak akan terhapus.`)) return
    await fetch(`/api/admin/services/${s.id}`, { method: 'DELETE' })
    fetchServices()
  }

  const formatHarga = (s: Service) => {
    if (s.type === 'PER_KG') return `Rp ${(s.pricePerKg || 0).toLocaleString('id-ID')}/kg`
    return `Rp ${(s.priceFlat || 0).toLocaleString('id-ID')}/${s.unit}`
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Kelola Layanan</h1>
          <p className="text-sm text-gray-500 mt-0.5">{services.length} layanan terdaftar</p>
        </div>
        <button className="btn-primary" onClick={openAdd}>+ Tambah Layanan</button>
      </div>

      {showForm && (
        <div className="card mb-6 border-blue-200 bg-blue-50/30">
          <h2 className="font-medium text-gray-900 mb-4">{editId ? 'Edit Layanan' : 'Tambah Layanan Baru'}</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="label">Nama Layanan *</label>
              <input className="input" placeholder="cth: Reguler (2 hari)"
                value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div>
              <label className="label">Tipe *</label>
              <select className="input" value={form.type}
                onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                <option value="PER_KG">Per Kilogram</option>
                <option value="SATUAN">Per Satuan</option>
              </select>
            </div>
            {form.type === 'PER_KG' ? (
              <div>
                <label className="label">Harga per kg (Rp) *</label>
                <input type="number" className="input" placeholder="cth: 7000"
                  value={form.pricePerKg} onChange={e => setForm(f => ({ ...f, pricePerKg: e.target.value }))} />
              </div>
            ) : (
              <>
                <div>
                  <label className="label">Harga satuan (Rp) *</label>
                  <input type="number" className="input" placeholder="cth: 25000"
                    value={form.priceFlat} onChange={e => setForm(f => ({ ...f, priceFlat: e.target.value }))} />
                </div>
                <div>
                  <label className="label">Satuan</label>
                  <input className="input" placeholder="cth: pasang, lembar, potong"
                    value={form.unit} onChange={e => setForm(f => ({ ...f, unit: e.target.value }))} />
                </div>
              </>
            )}
          </div>
          <div className="flex gap-3 mt-4 justify-end">
            <button className="btn-secondary" onClick={() => { setShowForm(false); setEditId(null) }}>Batal</button>
            <button className="btn-primary" onClick={handleSave} disabled={loading}>
              {loading ? 'Menyimpan...' : '💾 Simpan'}
            </button>
          </div>
        </div>
      )}

      <div className="card p-0 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left text-xs text-gray-400 font-medium px-5 py-3">Nama Layanan</th>
              <th className="text-left text-xs text-gray-400 font-medium px-4 py-3">Tipe</th>
              <th className="text-left text-xs text-gray-400 font-medium px-4 py-3">Harga</th>
              <th className="text-left text-xs text-gray-400 font-medium px-4 py-3">Status</th>
              <th className="text-left text-xs text-gray-400 font-medium px-4 py-3">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {services.map(s => (
              <tr key={s.id} className={`border-b border-gray-50 last:border-0 ${!s.isActive ? 'opacity-50' : ''}`}>
                <td className="px-5 py-3.5 font-medium text-gray-900">{s.name}</td>
                <td className="px-4 py-3.5 text-gray-500 text-xs">
                  <span className={`px-2 py-0.5 rounded-full ${s.type === 'PER_KG' ? 'bg-blue-50 text-blue-700' : 'bg-purple-50 text-purple-700'}`}>
                    {s.type === 'PER_KG' ? 'Per kg' : 'Satuan'}
                  </span>
                </td>
                <td className="px-4 py-3.5 text-gray-700">{formatHarga(s)}</td>
                <td className="px-4 py-3.5">
                  <button onClick={() => toggleActive(s)}
                    className={`px-2.5 py-0.5 rounded-full text-xs font-medium cursor-pointer ${s.isActive ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                    {s.isActive ? 'Aktif' : 'Nonaktif'}
                  </button>
                </td>
                <td className="px-4 py-3.5">
                  <div className="flex gap-2">
                    <button onClick={() => openEdit(s)} className="text-xs text-blue-600 hover:underline">Edit</button>
                    <button onClick={() => handleDelete(s)} className="text-xs text-red-500 hover:underline">Hapus</button>
                  </div>
                </td>
              </tr>
            ))}
            {services.length === 0 && (
              <tr><td colSpan={5} className="py-12 text-center text-gray-400">Belum ada layanan</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
