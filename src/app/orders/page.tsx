'use client'
import { useState, useEffect, useCallback } from 'react'
import { formatRupiah, formatTanggalPendek, STATUS_LABELS, STATUS_COLORS, STATUS_NEXT } from '@/lib/utils'

type Service = {
  id: string; name: string; type: string
  pricePerKg?: number; priceFlat?: number; unit?: string
}
type Order = {
  id: string; orderNumber: number; status: string
  totalPrice: number; weight?: number; quantity?: number; notes?: string
  createdAt: string; dueDate?: string
  customer: { name: string; phone: string }
  service: Service
}

const STATUS_TABS = ['SEMUA', 'MASUK', 'PROSES', 'SELESAI', 'DIAMBIL']

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [activeTab, setActiveTab] = useState('SEMUA')
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [updating, setUpdating] = useState<string | null>(null)

  const [form, setForm] = useState({
    customerName: '', customerPhone: '', serviceId: '',
    weight: '', quantity: '1', notes: '',
  })

  const fetchOrders = useCallback(async () => {
    const url = activeTab === 'SEMUA' ? '/api/orders' : `/api/orders?status=${activeTab}`
    const res = await fetch(url)
    const data = await res.json()
    setOrders(data)
  }, [activeTab])

  useEffect(() => { fetchOrders() }, [fetchOrders])
  useEffect(() => {
    fetch('/api/services').then(r => r.json()).then(setServices)
  }, [])

  const selectedService = services.find(s => s.id === form.serviceId)

  const calcTotal = () => {
    if (!selectedService) return 0
    if (selectedService.type === 'PER_KG') {
      return Math.round((parseFloat(form.weight) || 0) * (selectedService.pricePerKg || 0))
    }
    return (selectedService.priceFlat || 0) * (parseInt(form.quantity) || 1)
  }

  async function handleSubmit() {
    if (!form.customerName || !form.customerPhone || !form.serviceId) {
      alert('Lengkapi data terlebih dahulu')
      return
    }
    setLoading(true)
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        weight: parseFloat(form.weight) || undefined,
        quantity: parseInt(form.quantity) || undefined,
      }),
    })
    setLoading(false)
    if (res.ok) {
      setShowForm(false)
      setForm({ customerName: '', customerPhone: '', serviceId: '', weight: '', quantity: '1', notes: '' })
      fetchOrders()
    } else {
      alert('Gagal menyimpan order')
    }
  }

  async function handleUpdateStatus(orderId: string, newStatus: string) {
    setUpdating(orderId)
    await fetch(`/api/orders/${orderId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    })
    setUpdating(null)
    fetchOrders()
  }

  const statusCount = (s: string) => orders.filter(o => s === 'SEMUA' || o.status === s).length

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Order & Status Cucian</h1>
          <p className="text-sm text-gray-500 mt-0.5">{orders.length} order ditampilkan</p>
        </div>
        <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? '✕ Tutup' : '+ Order Baru'}
        </button>
      </div>

      {/* Form order baru */}
      {showForm && (
        <div className="card mb-6 border-blue-200 bg-blue-50/30">
          <h2 className="font-medium text-gray-900 mb-4">Order Baru</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Nama pelanggan *</label>
              <input className="input" placeholder="Cth: Ibu Sari"
                value={form.customerName} onChange={e => setForm(f => ({ ...f, customerName: e.target.value }))} />
            </div>
            <div>
              <label className="label">No. HP *</label>
              <input className="input" placeholder="0812xxxxxxxx"
                value={form.customerPhone} onChange={e => setForm(f => ({ ...f, customerPhone: e.target.value }))} />
            </div>
            <div>
              <label className="label">Layanan *</label>
              <select className="input" value={form.serviceId}
                onChange={e => setForm(f => ({ ...f, serviceId: e.target.value }))}>
                <option value="">-- Pilih layanan --</option>
                {services.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.name} — {s.type === 'PER_KG'
                      ? `Rp ${(s.pricePerKg || 0).toLocaleString('id-ID')}/kg`
                      : `Rp ${(s.priceFlat || 0).toLocaleString('id-ID')}/${s.unit}`}
                  </option>
                ))}
              </select>
            </div>
            {selectedService?.type === 'PER_KG' ? (
              <div>
                <label className="label">Berat (kg)</label>
                <input type="number" step="0.1" min="0" className="input" placeholder="cth: 3.5"
                  value={form.weight} onChange={e => setForm(f => ({ ...f, weight: e.target.value }))} />
              </div>
            ) : (
              <div>
                <label className="label">Jumlah ({selectedService?.unit || 'unit'})</label>
                <input type="number" min="1" className="input" placeholder="1"
                  value={form.quantity} onChange={e => setForm(f => ({ ...f, quantity: e.target.value }))} />
              </div>
            )}
            <div className="col-span-2">
              <label className="label">Catatan (opsional)</label>
              <input className="input" placeholder="Cth: ada noda di kemeja putih"
                value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
            </div>
          </div>
          {/* Total preview */}
          <div className="mt-4 flex items-center justify-between bg-white border border-gray-200 rounded-lg px-4 py-3">
            <div className="text-sm text-gray-500">Total estimasi</div>
            <div className="text-xl font-semibold text-blue-600">{formatRupiah(calcTotal())}</div>
          </div>
          <div className="flex gap-3 mt-4 justify-end">
            <button className="btn-secondary" onClick={() => setShowForm(false)}>Batal</button>
            <button className="btn-primary" onClick={handleSubmit} disabled={loading}>
              {loading ? 'Menyimpan...' : '💾 Simpan Order'}
            </button>
          </div>
        </div>
      )}

      {/* Status tabs */}
      <div className="flex gap-1 mb-4 bg-white border border-gray-200 p-1 rounded-lg w-fit">
        {STATUS_TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-1.5 text-sm rounded-md font-medium transition-colors ${
              activeTab === tab
                ? 'bg-blue-600 text-white'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            {tab === 'SEMUA' ? 'Semua' : STATUS_LABELS[tab]}
            {' '}
            <span className={`text-xs ${activeTab === tab ? 'text-blue-200' : 'text-gray-400'}`}>
              ({statusCount(tab)})
            </span>
          </button>
        ))}
      </div>

      {/* Tabel order */}
      <div className="card p-0 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left text-xs text-gray-400 font-medium px-5 py-3">#</th>
              <th className="text-left text-xs text-gray-400 font-medium px-4 py-3">Pelanggan</th>
              <th className="text-left text-xs text-gray-400 font-medium px-4 py-3">Layanan</th>
              <th className="text-left text-xs text-gray-400 font-medium px-4 py-3">Detail</th>
              <th className="text-left text-xs text-gray-400 font-medium px-4 py-3">Total</th>
              <th className="text-left text-xs text-gray-400 font-medium px-4 py-3">Masuk</th>
              <th className="text-left text-xs text-gray-400 font-medium px-4 py-3">Status</th>
              <th className="text-left text-xs text-gray-400 font-medium px-4 py-3">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => {
              const nextStatus = STATUS_NEXT[order.status]
              return (
                <tr key={order.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50">
                  <td className="px-5 py-3.5 text-gray-400 text-xs">#{order.orderNumber}</td>
                  <td className="px-4 py-3.5">
                    <div className="font-medium text-gray-900">{order.customer.name}</div>
                    <div className="text-xs text-gray-400">{order.customer.phone}</div>
                  </td>
                  <td className="px-4 py-3.5 text-gray-700">{order.service.name}</td>
                  <td className="px-4 py-3.5 text-gray-500 text-xs">
                    {order.weight ? `${order.weight} kg` : ''}
                    {order.quantity ? `${order.quantity} ${order.service.unit || 'unit'}` : ''}
                    {order.notes && <div className="text-gray-400 mt-0.5 truncate max-w-32">{order.notes}</div>}
                  </td>
                  <td className="px-4 py-3.5 font-medium">{formatRupiah(order.totalPrice)}</td>
                  <td className="px-4 py-3.5 text-gray-400 text-xs">{formatTanggalPendek(order.createdAt)}</td>
                  <td className="px-4 py-3.5">
                    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[order.status]}`}>
                      {STATUS_LABELS[order.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    {nextStatus && (
                      <button
                        onClick={() => handleUpdateStatus(order.id, nextStatus)}
                        disabled={updating === order.id}
                        className="btn-secondary text-xs py-1 px-3"
                      >
                        {updating === order.id ? '...' : `→ ${STATUS_LABELS[nextStatus]}`}
                      </button>
                    )}
                    {order.status === 'DIAMBIL' && (
                      <span className="text-xs text-gray-300">Selesai ✓</span>
                    )}
                  </td>
                </tr>
              )
            })}
            {orders.length === 0 && (
              <tr>
                <td colSpan={8} className="py-12 text-center text-gray-400">
                  Tidak ada order {activeTab !== 'SEMUA' ? `dengan status ${STATUS_LABELS[activeTab]}` : ''}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
