'use client'
import { useState, useEffect, useCallback } from 'react'
import { formatRupiah, formatTanggalPendek, STATUS_LABELS, STATUS_COLORS, STATUS_NEXT } from '@/lib/utils'
import { saveOrders, getOrders, addOrderLocal, updateOrderStatus, enqueueSync } from '@/lib/offline-db'
import { syncNow } from '@/lib/sync-manager'
import { buildEscPos, printViaBluetooth, isBluetoothSupported, selectPrinter, getSavedPrinterName, PrintStatus } from '@/lib/thermal-print'

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
  const [btStatus, setBtStatus] = useState<PrintStatus>('idle')
  const [btMsg, setBtMsg] = useState('')
  const [savedPrinter, setSavedPrinter] = useState<string | null>(null)
  const [printingOrderId, setPrintingOrderId] = useState<string | null>(null)
  const [services, setServices] = useState<Service[]>([])
  const [activeTab, setActiveTab] = useState('SEMUA')
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [updating, setUpdating] = useState<string | null>(null)
  const [isOffline, setIsOffline] = useState(false)

  const [form, setForm] = useState({
    customerName: '', customerPhone: '', serviceId: '',
    weight: '', quantity: '1', notes: '',
  })

  // Load orders — offline first from IndexedDB, then refresh from server
  const fetchOrders = useCallback(async () => {
    // 1. Try local cache first
    const localOrders = await getOrders()
    if (localOrders.length > 0) {
      setOrders(localOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()))
    }

    // 2. Try fetch from server
    if (navigator.onLine) {
      try {
        const url = activeTab === 'SEMUA' ? '/api/orders' : `/api/orders?status=${activeTab}`
        const res = await fetch(url)
        if (res.ok) {
          const data = await res.json()
          setOrders(data)
          await saveOrders(data) // update local cache
        }
      } catch {
        // offline — keep using local data
      }
    }
  }, [activeTab])

  useEffect(() => { fetchOrders() }, [fetchOrders])
  useEffect(() => {
    fetch('/api/services').then(r => r.json()).then(setServices).catch(() => {})
  }, [])
  useEffect(() => {
    setIsOffline(!navigator.onLine)
    const on = () => setIsOffline(false)
    const off = () => setIsOffline(true)
    window.addEventListener('online', on)
    window.addEventListener('offline', off)
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off) }
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
      alert('Lengkapi data terlebih dahulu'); return
    }
    setLoading(true)

    const payload = {
      ...form,
      weight: parseFloat(form.weight) || undefined,
      quantity: parseInt(form.quantity) || undefined,
    }

    if (navigator.onLine) {
      // Online — push directly
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      setLoading(false)
      if (res.ok) {
        setShowForm(false)
        setForm({ customerName: '', customerPhone: '', serviceId: '', weight: '', quantity: '1', notes: '' })
        fetchOrders()
      } else {
        alert('Gagal menyimpan order')
      }
    } else {
      // Offline — save locally + queue sync
      const tempOrder = {
        id: `local-${Date.now()}`,
        orderNumber: Math.floor(Math.random() * 9000) + 1000,
        status: 'MASUK',
        totalPrice: calcTotal(),
        weight: payload.weight || null,
        quantity: payload.quantity || null,
        notes: payload.notes || null,
        createdAt: new Date().toISOString(),
        dueDate: null,
        customer: { name: payload.customerName, phone: payload.customerPhone },
        service: services.find(s => s.id === payload.serviceId) || { name: 'Unknown', type: 'PER_KG' },
        _local: true,
      }

      await addOrderLocal(tempOrder)
      await enqueueSync({ type: 'CREATE_ORDER', payload, timestamp: Date.now() })

      setLoading(false)
      setShowForm(false)
      setForm({ customerName: '', customerPhone: '', serviceId: '', weight: '', quantity: '1', notes: '' })

      // Update local list
      const local = await getOrders()
      setOrders(local.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()))
    }
  }

  async function handleUpdateStatus(orderId: string, newStatus: string) {
    setUpdating(orderId)

    if (navigator.onLine) {
      await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
    } else {
      // Offline — update local + queue
      await updateOrderStatus(orderId, newStatus)
      await enqueueSync({ type: 'UPDATE_STATUS', payload: { id: orderId, status: newStatus }, timestamp: Date.now() })
    }

    setUpdating(null)
    fetchOrders()
  }

  function handlePrintNota(orderId: string) {
    if (!navigator.onLine) {
      alert('Cetak nota butuh koneksi internet'); return
    }
    window.open(`/api/orders/${orderId}/nota`, '_blank')
  }

  async function handlePrintThermal(order: Order) {
    setPrintingOrderId(order.id)
    const escPos = buildEscPos({
      namaToko: 'Z Laundry',
      waktu: new Date(order.createdAt).toLocaleString('id-ID', {
        day: '2-digit', month: 'long', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
      }),
      noTransaksi: `#${order.orderNumber}`,
      kasir: (order as any).kasir?.name || '',
      items: [{
        nama: `${(order as any).service?.name || 'Laundry'}${(order as any).weight ? ` (${(order as any).weight} kg)` : ''}`,
        qty: (order as any).quantity || 1,
        harga: order.totalPrice / ((order as any).quantity || 1),
      }],
      subtotal: order.totalPrice,
      total: order.totalPrice,
      bayar: order.totalPrice,
      kembali: 0,
      metodeBayar: (order as any).paymentMethod || 'CASH',
      catatan: [
        order.notes,
        (order as any).dueDate ? `Selesai: ${new Date((order as any).dueDate).toLocaleDateString('id-ID')}` : '',
        `Pelanggan: ${(order as any).customer?.name || ''}`,
        (order as any).customer?.phone ? `HP: ${(order as any).customer.phone}` : '',
      ].filter(Boolean).join(' | '),
    })
    await printViaBluetooth(escPos, (status, msg) => {
      setBtStatus(status)
      setBtMsg(msg || '')
    })
    setPrintingOrderId(null)
  }

  useEffect(() => {
    getSavedPrinterName().then(name => setSavedPrinter(name))
  }, [])

  const statusCount = (s: string) => orders.filter(o => s === 'SEMUA' || o.status === s).length

  return (
    <div className="p-4 sm:p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-lg sm:text-xl font-semibold text-gray-900">Order & Status</h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            {orders.length} order
            {isOffline && <span className="ml-2 text-amber-600 font-medium">📱 Offline</span>}
          </p>
        </div>
        <div className="flex gap-2">
          {isOffline && (
            <button onClick={() => syncNow()} className="btn-secondary text-xs sm:text-sm">🔄 Sync</button>
          )}
          {isBluetoothSupported() && (
            <button
              onClick={async () => { const name = await selectPrinter(); if (name) setSavedPrinter(name) }}
              className="btn-secondary text-xs sm:text-sm"
              title={savedPrinter ? `Printer: ${savedPrinter}` : 'Pilih printer Bluetooth'}>
              🔵 {savedPrinter ? savedPrinter : 'Set Printer'}
            </button>
          )}
          <button className="btn-primary text-xs sm:text-sm" onClick={() => setShowForm(!showForm)}>
            {showForm ? '✕ Tutup' : '+ Order Baru'}
          </button>
        </div>
      </div>

      {/* Form order baru */}
      {showForm && (
        <div className="card mb-4 sm:mb-6 border-blue-200 bg-blue-50/30">
          <h2 className="font-medium text-gray-900 mb-4">Order Baru</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
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
                <option value="">-- Pilih --</option>
                {services.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
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
            <div className="sm:col-span-2">
              <label className="label">Catatan (opsional)</label>
              <input className="input" placeholder="Cth: ada noda"
                value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between bg-white border border-gray-200 rounded-lg px-4 py-3">
            <div className="text-xs sm:text-sm text-gray-500">Total estimasi</div>
            <div className="text-lg sm:text-xl font-semibold text-blue-600">{formatRupiah(calcTotal())}</div>
          </div>
          <div className="flex gap-3 mt-4 justify-end">
            <button className="btn-secondary" onClick={() => setShowForm(false)}>Batal</button>
            <button className="btn-primary" onClick={handleSubmit} disabled={loading}>
              {loading ? '...' : '💾 Simpan Order'}
            </button>
          </div>
        </div>
      )}

      {/* Status tabs */}
      <div className="overflow-x-auto -mx-4 sm:mx-0 mb-4">
        <div className="flex gap-1 bg-white border border-gray-200 p-1 rounded-lg w-fit mx-4 sm:mx-0">
          {STATUS_TABS.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-3 sm:px-4 py-1.5 text-xs sm:text-sm rounded-md font-medium whitespace-nowrap transition-colors ${
                activeTab === tab ? 'bg-blue-600 text-white' : 'text-gray-500 hover:text-gray-900'
              }`}>
              {tab === 'SEMUA' ? 'Semua' : STATUS_LABELS[tab]}
              <span className={`ml-1 text-xs ${activeTab === tab ? 'text-blue-200' : 'text-gray-400'}`}>
                {statusCount(tab)}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Desktop table */}
      <div className="hidden sm:block card p-0 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left text-xs text-gray-400 font-medium px-5 py-3 whitespace-nowrap">#</th>
              <th className="text-left text-xs text-gray-400 font-medium px-4 py-3 whitespace-nowrap">Pelanggan</th>
              <th className="text-left text-xs text-gray-400 font-medium px-4 py-3 whitespace-nowrap">Layanan</th>
              <th className="text-left text-xs text-gray-400 font-medium px-4 py-3 whitespace-nowrap">Total</th>
              <th className="text-left text-xs text-gray-400 font-medium px-4 py-3 whitespace-nowrap">Masuk</th>
              <th className="text-left text-xs text-gray-400 font-medium px-4 py-3 whitespace-nowrap">Status</th>
              <th className="text-left text-xs text-gray-400 font-medium px-4 py-3 whitespace-nowrap">Aksi</th>
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
                  <td className="px-4 py-3.5 text-gray-700 whitespace-nowrap">{order.service.name}</td>
                  <td className="px-4 py-3.5 font-medium whitespace-nowrap">{formatRupiah(order.totalPrice)}</td>
                  <td className="px-4 py-3.5 text-gray-400 text-xs whitespace-nowrap">{formatTanggalPendek(order.createdAt)}</td>
                  <td className="px-4 py-3.5">
                    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[order.status]}`}>
                      {STATUS_LABELS[order.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex gap-1">
                      {nextStatus && (
                        <button onClick={() => handleUpdateStatus(order.id, nextStatus)}
                          disabled={updating === order.id}
                          className="btn-secondary text-xs py-1 px-2 whitespace-nowrap">
                          {updating === order.id ? '...' : `→ ${STATUS_LABELS[nextStatus]}`}
                        </button>
                      )}
                      <button onClick={() => handlePrintNota(order.id)}
                        className="btn-secondary text-xs py-1 px-2">🖨️</button>
                      {isBluetoothSupported() && (
                        <button
                          onClick={() => handlePrintThermal(order)}
                          disabled={printingOrderId === order.id}
                          className="btn-secondary text-xs py-1 px-2 text-blue-600 disabled:opacity-50">
                          {printingOrderId === order.id ? '...' : '🔵'}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )
            })}
            {orders.length === 0 && (
              <tr>
                <td colSpan={7} className="py-12 text-center text-gray-400">
                  {isOffline ? 'Tidak ada data lokal' : 'Tidak ada order'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="sm:hidden space-y-3">
        {orders.map(order => {
          const nextStatus = STATUS_NEXT[order.status]
          const isLocal = order.id?.toString().startsWith('local-')
          return (
            <div key={order.id} className={`card p-4 ${isLocal ? 'border-amber-200 bg-amber-50/30' : ''}`}>
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="font-medium text-gray-900">{order.customer.name}</div>
                  <div className="text-xs text-gray-400">{order.customer.phone}</div>
                </div>
                <div className="flex items-center gap-1.5">
                  {isLocal && <span className="text-[10px] px-1.5 py-0.5 bg-amber-200 text-amber-700 rounded font-medium">Draft</span>}
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[order.status]}`}>
                    {STATUS_LABELS[order.status]}
                  </span>
                </div>
              </div>
              <div className="text-xs text-gray-500 space-y-1 mb-3">
                <div className="flex justify-between">
                  <span>#{order.orderNumber} · {order.service.name}</span>
                  <span className="font-medium text-gray-900">{formatRupiah(order.totalPrice)}</span>
                </div>
                <div className="text-gray-400">
                  {formatTanggalPendek(order.createdAt)}
                </div>
              </div>
              <div className="flex gap-2">
                {nextStatus && (
                  <button onClick={() => handleUpdateStatus(order.id, nextStatus)}
                    disabled={updating === order.id}
                    className="flex-1 text-xs py-2 bg-blue-50 text-blue-700 rounded-lg font-medium hover:bg-blue-100 transition-colors">
                    {updating === order.id ? '...' : `→ ${STATUS_LABELS[nextStatus]}`}
                  </button>
                )}
                <button onClick={() => handlePrintNota(order.id)}
                  className="px-3 py-2 text-xs bg-gray-50 text-gray-600 rounded-lg border border-gray-200 hover:bg-gray-100">
                  🖨️
                </button>
                {isBluetoothSupported() && (
                  <button
                    onClick={() => handlePrintThermal(order)}
                    disabled={printingOrderId === order.id}
                    className="px-3 py-2 text-xs bg-blue-50 text-blue-600 rounded-lg border border-blue-200 hover:bg-blue-100 disabled:opacity-50">
                    {printingOrderId === order.id ? '...' : '🔵'}
                  </button>
                )}
              </div>
            </div>
          )
        })}
        {orders.length === 0 && (
          <div className="text-center py-12 text-gray-400 text-sm">
            {isOffline ? 'Tidak ada data lokal' : 'Tidak ada order'}
          </div>
        )}
      </div>
    </div>
  )
}
