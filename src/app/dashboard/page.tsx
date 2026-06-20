import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { formatRupiah, formatTanggal, STATUS_LABELS, STATUS_COLORS } from '@/lib/utils'

export const dynamic = 'force-dynamic'

async function getDashboardData() {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const [totalToday, pendapatanToday, statusCounts, recentOrders] = await Promise.all([
    prisma.order.count({
      where: { createdAt: { gte: today, lt: tomorrow } },
    }),
    prisma.order.aggregate({
      where: { createdAt: { gte: today, lt: tomorrow } },
      _sum: { totalPrice: true },
    }),
    prisma.order.groupBy({
      by: ['status'],
      _count: true,
    }),
    prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { customer: true, service: true },
    }),
  ])

  const statusMap: Record<string, number> = {}
  statusCounts.forEach(s => { statusMap[s.status] = s._count })

  return {
    totalToday,
    pendapatanToday: pendapatanToday._sum.totalPrice || 0,
    statusMap,
    recentOrders,
  }
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  const { totalToday, pendapatanToday, statusMap, recentOrders } = await getDashboardData()

  const stats = [
    { label: 'Order Hari Ini', value: `${totalToday} order`, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Pendapatan Hari Ini', value: formatRupiah(pendapatanToday), color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Masuk', value: `${statusMap['MASUK'] || 0}`, color: 'text-blue-500', bg: 'bg-blue-50' },
    { label: 'Proses', value: `${statusMap['PROSES'] || 0}`, color: 'text-yellow-600', bg: 'bg-yellow-50' },
    { label: 'Selesai', value: `${statusMap['SELESAI'] || 0}`, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Diambil', value: `${statusMap['DIAMBIL'] || 0}`, color: 'text-gray-500', bg: 'bg-gray-50' },
  ]

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Selamat datang, {session?.user?.name} · {formatTanggal(new Date())}
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {stats.map((s, i) => (
          <div key={i} className="card">
            <div className={`text-xs font-medium text-gray-500 mb-2`}>{s.label}</div>
            <div className={`text-lg font-semibold ${s.color}`}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Recent orders */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-medium text-gray-900">Order Terbaru</h2>
          <a href="/orders" className="text-sm text-blue-600 hover:underline">Lihat semua →</a>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left text-xs text-gray-400 font-medium pb-3 pr-4">#</th>
                <th className="text-left text-xs text-gray-400 font-medium pb-3 pr-4">Pelanggan</th>
                <th className="text-left text-xs text-gray-400 font-medium pb-3 pr-4">Layanan</th>
                <th className="text-left text-xs text-gray-400 font-medium pb-3 pr-4">Total</th>
                <th className="text-left text-xs text-gray-400 font-medium pb-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map(order => (
                <tr key={order.id} className="border-b border-gray-50 last:border-0">
                  <td className="py-3 pr-4 text-gray-400 text-xs">#{order.orderNumber}</td>
                  <td className="py-3 pr-4">
                    <div className="font-medium text-gray-900">{order.customer.name}</div>
                    <div className="text-xs text-gray-400">{order.customer.phone}</div>
                  </td>
                  <td className="py-3 pr-4 text-gray-600">{order.service.name}</td>
                  <td className="py-3 pr-4 font-medium">{formatRupiah(order.totalPrice)}</td>
                  <td className="py-3">
                    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[order.status]}`}>
                      {STATUS_LABELS[order.status]}
                    </span>
                  </td>
                </tr>
              ))}
              {recentOrders.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-400 text-sm">
                    Belum ada order hari ini
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
