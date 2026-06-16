'use client'
import { useState, useEffect } from 'react'
import { formatTanggal } from '@/lib/utils'

type User = {
  id: string
  name: string
  email: string
  role: 'ADMIN' | 'KASIR'
  createdAt: string
}

const emptyForm = { name: '', email: '', password: '', role: 'KASIR' }

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ ...emptyForm })
  const [loading, setLoading] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)

  async function fetchUsers() {
    const res = await fetch('/api/admin/users')
    setUsers(await res.json())
  }

  useEffect(() => { fetchUsers() }, [])

  function openAdd() {
    setEditId(null)
    setForm({ ...emptyForm })
    setShowForm(true)
  }

  function openEdit(u: User) {
    setEditId(u.id)
    setForm({ name: u.name, email: u.email, password: '', role: u.role })
    setShowForm(true)
  }

  async function handleSave() {
    if (!form.name || !form.email) { alert('Nama dan email wajib diisi'); return }
    if (!editId && !form.password) { alert('Password wajib diisi untuk user baru'); return }
    setLoading(true)

    const payload: Record<string, string> = { name: form.name, role: form.role }
    if (!editId) { payload.email = form.email; payload.password = form.password }
    else if (form.password) payload.password = form.password

    const res = editId
      ? await fetch(`/api/admin/users/${editId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      : await fetch('/api/admin/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...payload, email: form.email, password: form.password }),
        })

    setLoading(false)
    if (res.ok) {
      setShowForm(false)
      setEditId(null)
      fetchUsers()
    } else {
      const data = await res.json()
      alert(data.error || 'Gagal menyimpan')
    }
  }

  async function handleDelete(u: User) {
    if (!confirm(`Hapus user "${u.name}"?`)) return
    const res = await fetch(`/api/admin/users/${u.id}`, { method: 'DELETE' })
    if (!res.ok) {
      const data = await res.json()
      alert(data.error)
      return
    }
    fetchUsers()
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Kelola Pengguna</h1>
          <p className="text-sm text-gray-500 mt-0.5">{users.length} pengguna terdaftar</p>
        </div>
        <button className="btn-primary" onClick={openAdd}>+ Tambah Pengguna</button>
      </div>

      {showForm && (
        <div className="card mb-6 border-blue-200 bg-blue-50/30">
          <h2 className="font-medium text-gray-900 mb-4">{editId ? 'Edit Pengguna' : 'Tambah Pengguna Baru'}</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Nama *</label>
              <input className="input" placeholder="cth: Kasir 2"
                value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div>
              <label className="label">Email *</label>
              <input type="email" className="input" placeholder="kasir2@laundrykas.com"
                value={form.email} disabled={!!editId}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
            </div>
            <div>
              <label className="label">{editId ? 'Password Baru (kosongkan jika tidak diubah)' : 'Password *'}</label>
              <input type="password" className="input" placeholder="min. 6 karakter"
                value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
            </div>
            <div>
              <label className="label">Role *</label>
              <select className="input" value={form.role}
                onChange={e => setForm(f => ({ ...f, role: e.target.value }))}>
                <option value="KASIR">Kasir</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>
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
              <th className="text-left text-xs text-gray-400 font-medium px-5 py-3">Nama</th>
              <th className="text-left text-xs text-gray-400 font-medium px-4 py-3">Email</th>
              <th className="text-left text-xs text-gray-400 font-medium px-4 py-3">Role</th>
              <th className="text-left text-xs text-gray-400 font-medium px-4 py-3">Terdaftar</th>
              <th className="text-left text-xs text-gray-400 font-medium px-4 py-3">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} className="border-b border-gray-50 last:border-0">
                <td className="px-5 py-3.5 font-medium text-gray-900">{u.name}</td>
                <td className="px-4 py-3.5 text-gray-500">{u.email}</td>
                <td className="px-4 py-3.5">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${u.role === 'ADMIN' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}`}>
                    {u.role === 'ADMIN' ? 'Admin' : 'Kasir'}
                  </span>
                </td>
                <td className="px-4 py-3.5 text-gray-400 text-xs">{formatTanggal(u.createdAt)}</td>
                <td className="px-4 py-3.5">
                  <div className="flex gap-2">
                    <button onClick={() => openEdit(u)} className="text-xs text-blue-600 hover:underline">Edit</button>
                    <button onClick={() => handleDelete(u)} className="text-xs text-red-500 hover:underline">Hapus</button>
                  </div>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr><td colSpan={5} className="py-12 text-center text-gray-400">Belum ada pengguna</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
