'use client'
import { useState, useEffect } from 'react'
import { formatTanggal } from '@/lib/utils'

type User = {
  id: string; name: string; email: string; role: 'ADMIN' | 'KASIR'; createdAt: string
}

const emptyForm = { name: '', email: '', password: '', role: 'KASIR' }

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ ...emptyForm })
  const [loading, setLoading] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)

  async function fetchUsers() { const res = await fetch('/api/admin/users'); setUsers(await res.json()) }
  useEffect(() => { fetchUsers() }, [])

  function openAdd() { setEditId(null); setForm({ ...emptyForm }); setShowForm(true) }
  function openEdit(u: User) { setEditId(u.id); setForm({ name: u.name, email: u.email, password: '', role: u.role }); setShowForm(true) }

  async function handleSave() {
    if (!form.name || !form.email) { alert('Nama dan email wajib diisi'); return }
    if (!editId && !form.password) { alert('Password wajib diisi'); return }
    setLoading(true)
    const payload: Record<string, string> = { name: form.name, role: form.role }
    if (!editId) { payload.email = form.email; payload.password = form.password }
    else if (form.password) payload.password = form.password
    const res = editId
      ? await fetch(`/api/admin/users/${editId}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      : await fetch('/api/admin/users', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...payload, email: form.email, password: form.password }) })
    setLoading(false)
    if (res.ok) { setShowForm(false); setEditId(null); fetchUsers() }
    else { const d = await res.json(); alert(d.error || 'Gagal') }
  }

  async function handleDelete(u: User) {
    if (!confirm(`Hapus "${u.name}"?`)) return
    const res = await fetch(`/api/admin/users/${u.id}`, { method: 'DELETE' })
    if (!res.ok) { const d = await res.json(); alert(d.error); return }
    fetchUsers()
  }

  return (
    <div className="p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <div>
          <h1 className="text-lg sm:text-xl font-semibold text-gray-900">Kelola Pengguna</h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">{users.length} pengguna</p>
        </div>
        <button className="btn-primary text-xs sm:text-sm" onClick={openAdd}>+ Tambah</button>
      </div>

      {showForm && (
        <div className="card mb-4 sm:mb-6 border-blue-200 bg-blue-50/30">
          <h2 className="font-medium text-gray-900 mb-4">{editId ? 'Edit' : 'Tambah'} Pengguna</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="label">Nama *</label>
              <input className="input" placeholder="Kasir 2"
                value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div>
              <label className="label">Email *</label>
              <input type="email" className="input" placeholder="kasir2@laundrykas.com"
                value={form.email} disabled={!!editId}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
            </div>
            <div>
              <label className="label">{editId ? 'Password Baru' : 'Password *'}</label>
              <input type="password" className="input" placeholder="min. 6 karakter"
                value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
            </div>
            <div>
              <label className="label">Role *</label>
              <select className="input" value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}>
                <option value="KASIR">Kasir</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>
          </div>
          <div className="flex gap-3 mt-4 justify-end">
            <button className="btn-secondary" onClick={() => { setShowForm(false); setEditId(null) }}>Batal</button>
            <button className="btn-primary" onClick={handleSave} disabled={loading}>{loading ? '...' : <><i className="bi bi-save" /> Simpan</>}</button>
          </div>
        </div>
      )}

      {/* Desktop */}
      <div className="hidden sm:block card p-0 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left text-xs text-gray-400 font-medium px-5 py-3">Nama</th>
              <th className="text-left text-xs text-gray-400 font-medium px-4 py-3">Email</th>
              <th className="text-left text-xs text-gray-400 font-medium px-4 py-3">Role</th>
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
                    {u.role}
                  </span>
                </td>
                <td className="px-4 py-3.5">
                  <div className="flex gap-2">
                    <button onClick={() => openEdit(u)} className="text-xs text-blue-600 hover:underline">Edit</button>
                    <button onClick={() => handleDelete(u)} className="text-xs text-red-500 hover:underline">Hapus</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile */}
      <div className="sm:hidden space-y-3">
        {users.map(u => (
          <div key={u.id} className="card p-4">
            <div className="flex items-start justify-between mb-1">
              <div>
                <div className="font-medium text-gray-900">{u.name}</div>
                <div className="text-xs text-gray-400">{u.email}</div>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${u.role === 'ADMIN' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}`}>
                {u.role}
              </span>
            </div>
            <div className="flex gap-3 mt-2">
              <button onClick={() => openEdit(u)} className="text-xs text-blue-600 font-medium">Edit</button>
              <button onClick={() => handleDelete(u)} className="text-xs text-red-500 font-medium">Hapus</button>
            </div>
          </div>
        ))}
      </div>

      {users.length === 0 && <div className="text-center py-12 text-gray-400 text-sm">Belum ada pengguna</div>}
    </div>
  )
}
