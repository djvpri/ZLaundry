'use client'
import { useState, useEffect } from 'react'
import { formatRupiah } from '@/lib/utils'

type LaporanData = {
  period: string; startDate: string; endDate: string
  summary: { totalOrders: number; totalRevenue: number }
  byService: { name: string; count: number; revenue: number }[]
  byStatus: Record<string, number>
  byKasir: { name: string; count: number; revenue: number }[]
  orders: any[]
}

export default function LaporanPage() {
  const [data, setData] = useState<LaporanData | null>(null)
  const [period, setPeriod] = useState<'daily' | 'monthly'>('daily')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setLoading(true)
    fetch(`/api/laporan?period=${period}&date=${date}`)
      .then(r => r.json()).then(setData).finally(() => setLoading(false))
  }, [period, date])

  if (loading && !data) return <div className="p-4 sm:p-6 text-center text-gray-400">Memuat...</div>

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-4 sm:mb-6">
        <h1 className="text-lg sm:text-xl font-semibold text-gray-900">Laporan</h1>
        {data && <p className="text-xs sm:text-sm text-gray-500 mt-0.5">{fmtTgl(data.startDate)} — {fmtTgl(data.endDate)}</p>}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 sm:gap-3 mb-4 sm:mb-6">
        <div className="flex bg-white border border-gray-200 p-1 rounded-lg">
          <button onClick={() => setPeriod('daily')}
            className={`px-3 sm:px-4 py-1.5 text-xs sm:text-sm rounded-md font-medium ${period === 'daily' ? 'bg-blue-600 text-white' : 'text-gray-500'}`}>
            Harian
          </button>
          <button onClick={() => setPeriod('monthly')}
            className={`px-3 sm:px-4 py-1.5 text-xs sm:text-sm rounded-md font-medium ${period === 'monthly' ? 'bg-blue-600 text-white' : 'text-gray-500'}`}>
            Bulanan
          </button>
        </div>
        <input type={period === 'monthly' ? 'month' : 'date'} className="input w-full sm:w-48" value={date} onChange={e => setDate(e.target.value)} />
      </div>

      {data && (
        <>
          <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div className="card">
              <div className="text-[10px] sm:text-xs font-medium text-gray-500 mb-1">Total Order</div>
              <div className="text-xl sm:text-2xl font-bold text-blue-600">{data.summary.totalOrders}</div>
            </div>
            <div className="card">
              <div className="text-[10px] sm:text-xs font-medium text-gray-500 mb-1">Pendapatan</div>
              <div className="text-lg sm:text-2xl font-bold text-green-600">{formatRupiah(data.summary.totalRevenue)}</div>
            </div>
          </div>

          {/* Per layanan */}
          <div className="card mb-4">
            <h2 className="font-medium text-gray-900 text-sm mb-3">Per Layanan</h2>
            {data.byService.length === 0 ? <p className="text-xs text-gray-400">Tidak ada data</p> : (
              <div className="space-y-2">
                {data.byService.map(s => (
                  <div key={s.name} className="flex items-center justify-between text-sm">
                    <span className="text-gray-700">{s.name} <span className="text-gray-400 text-xs">({s.count})</span></span>
                    <span className="font-medium">{formatRupiah(s.revenue)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Per status */}
          <div className="card mb-4">
            <h2 className="font-medium text-gray-900 text-sm mb-3">Status Order</h2>
            <div className="grid grid-cols-2 gap-2">
              {['MASUK', 'PROSES', 'SELESAI', 'DIAMBIL'].map(s => (
                <div key={s} className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">{s}</span>
                  <span className="font-medium">{data.byStatus[s] || 0}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Per kasir */}
          {data.byKasir.length > 0 && (
            <div className="card mb-4">
              <h2 className="font-medium text-gray-900 text-sm mb-3">Per Kasir</h2>
              <div className="space-y-2">
                {data.byKasir.map(k => (
                  <div key={k.name} className="flex items-center justify-between text-sm">
                    <span className="text-gray-700">{k.name}</span>
                    <div className="text-right">
                      <div className="font-medium">{formatRupiah(k.revenue)}</div>
                      <div className="text-xs text-gray-400">{k.count} order</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Detail orders */}
          <div className="card">
            <h2 className="font-medium text-gray-900 text-sm mb-3">Detail Order ({data.orders.length})</h2>
            {data.orders.length === 0 ? <p className="text-xs text-gray-400">Tidak ada order</p> : (
              <div className="space-y-2">
                {data.orders.slice(0, 50).map((o: any) => (
                  <div key={o.id} className="flex items-center justify-between text-sm py-2 border-b border-gray-50 last:border-0">
                    <div>
                      <div className="text-gray-900">{o.customer.name}</div>
                      <div className="text-xs text-gray-400">#{o.orderNumber} · {o.service.name} · {o.kasir.name}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{formatRupiah(o.totalPrice)}</div>
                      <div className="text-xs text-gray-400">{o.status}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}

function fmtTgl(d: string) { return new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) }
