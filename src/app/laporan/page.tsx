'use client'
import { useState, useEffect } from 'react'
import { formatRupiah } from '@/lib/utils'

type LaporanData = {
  period: string
  startDate: string
  endDate: string
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
    const params = new URLSearchParams({ period, date })
    fetch(`/api/laporan?${params}`)
      .then(r => r.json())
      .then(setData)
      .finally(() => setLoading(false))
  }, [period, date])

  if (loading && !data) {
    return <div className="p-6 text-center text-gray-400">Memuat data...</div>
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Laporan</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {data ? `${formatTanggal(data.startDate)} — ${formatTanggal(data.endDate)}` : 'Memuat...'}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-6">
        <div className="flex bg-white border border-gray-200 p-1 rounded-lg">
          <button
            onClick={() => setPeriod('daily')}
            className={`px-4 py-1.5 text-sm rounded-md font-medium transition-colors ${
              period === 'daily' ? 'bg-blue-600 text-white' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            Harian
          </button>
          <button
            onClick={() => setPeriod('monthly')}
            className={`px-4 py-1.5 text-sm rounded-md font-medium transition-colors ${
              period === 'monthly' ? 'bg-blue-600 text-white' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            Bulanan
          </button>
        </div>
        <input
          type={period === 'monthly' ? 'month' : 'date'}
          className="input w-48"
          value={date}
          onChange={e => setDate(e.target.value)}
        />
      </div>

      {data && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="card">
              <div className="text-xs font-medium text-gray-500 mb-1">Total Order</div>
              <div className="text-2xl font-bold text-blue-600">{data.summary.totalOrders}</div>
            </div>
            <div className="card">
              <div className="text-xs font-medium text-gray-500 mb-1">Total Pendapatan</div>
              <div className="text-2xl font-bold text-green-600">{formatRupiah(data.summary.totalRevenue)}</div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
            {/* By Service */}
            <div className="card lg:col-span-2">
              <h2 className="font-medium text-gray-900 mb-3">Pendapatan per Layanan</h2>
              {data.byService.length === 0 ? (
                <p className="text-sm text-gray-400">Tidak ada data</p>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left text-xs text-gray-400 font-medium pb-2">Layanan</th>
                      <th className="text-right text-xs text-gray-400 font-medium pb-2">Order</th>
                      <th className="text-right text-xs text-gray-400 font-medium pb-2">Pendapatan</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.byService.map(s => (
                      <tr key={s.name} className="border-b border-gray-50 last:border-0">
                        <td className="py-2 text-gray-700">{s.name}</td>
                        <td className="py-2 text-right text-gray-500">{s.count}</td>
                        <td className="py-2 text-right font-medium">{formatRupiah(s.revenue)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* By Status */}
            <div className="card">
              <h2 className="font-medium text-gray-900 mb-3">Status Order</h2>
              {Object.keys(data.byStatus).length === 0 ? (
                <p className="text-sm text-gray-400">Tidak ada data</p>
              ) : (
                <div className="space-y-2">
                  {['MASUK', 'PROSES', 'SELESAI', 'DIAMBIL'].map(s => (
                    <div key={s} className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">{s}</span>
                      <span className="font-medium">{data.byStatus[s] || 0}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* By Kasir */}
          {data.byKasir.length > 0 && (
            <div className="card mb-6">
              <h2 className="font-medium text-gray-900 mb-3">Performa Kasir</h2>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left text-xs text-gray-400 font-medium pb-2">Kasir</th>
                    <th className="text-right text-xs text-gray-400 font-medium pb-2">Order Dilayani</th>
                    <th className="text-right text-xs text-gray-400 font-medium pb-2">Total Pendapatan</th>
                  </tr>
                </thead>
                <tbody>
                  {data.byKasir.map(k => (
                    <tr key={k.name} className="border-b border-gray-50 last:border-0">
                      <td className="py-2 text-gray-700">{k.name}</td>
                      <td className="py-2 text-right text-gray-500">{k.count}</td>
                      <td className="py-2 text-right font-medium">{formatRupiah(k.revenue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Detail Orders */}
          <div className="card">
            <h2 className="font-medium text-gray-900 mb-3">Detail Order</h2>
            {data.orders.length === 0 ? (
              <p className="text-sm text-gray-400">Tidak ada order</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left text-xs text-gray-400 font-medium pb-2 pr-3">#</th>
                      <th className="text-left text-xs text-gray-400 font-medium pb-2 pr-3">Pelanggan</th>
                      <th className="text-left text-xs text-gray-400 font-medium pb-2 pr-3">Layanan</th>
                      <th className="text-right text-xs text-gray-400 font-medium pb-2 pr-3">Total</th>
                      <th className="text-left text-xs text-gray-400 font-medium pb-2 pr-3">Kasir</th>
                      <th className="text-left text-xs text-gray-400 font-medium pb-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.orders.slice(0, 50).map((o: any) => (
                      <tr key={o.id} className="border-b border-gray-50 last:border-0">
                        <td className="py-2 pr-3 text-gray-400 text-xs">#{o.orderNumber}</td>
                        <td className="py-2 pr-3 text-gray-700">{o.customer.name}</td>
                        <td className="py-2 pr-3 text-gray-600">{o.service.name}</td>
                        <td className="py-2 pr-3 text-right font-medium">{formatRupiah(o.totalPrice)}</td>
                        <td className="py-2 pr-3 text-gray-500">{o.kasir.name}</td>
                        <td className="py-2 text-gray-500">{o.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {data.orders.length > 50 && (
                  <p className="text-xs text-gray-400 mt-2 text-center">Menampilkan 50 dari {data.orders.length} order</p>
                )}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}

function formatTanggal(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}
