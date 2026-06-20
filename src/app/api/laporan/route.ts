import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const period = searchParams.get('period') || 'daily'
  const date = searchParams.get('date')

  const now = new Date()
  let start: Date, end: Date

  if (period === 'monthly') {
    const month = parseInt(date?.split('-')[1] || String(now.getMonth() + 1))
    const year = parseInt(date?.split('-')[0] || String(now.getFullYear()))
    start = new Date(year, month - 1, 1)
    end = new Date(year, month, 0, 23, 59, 59, 999)
  } else {
    // daily
    const d = date ? new Date(date) : now
    start = new Date(d)
    start.setHours(0, 0, 0, 0)
    end = new Date(d)
    end.setHours(23, 59, 59, 999)
  }

  const [orders, summary, byService, byStatus] = await Promise.all([
    prisma.order.findMany({
      where: { createdAt: { gte: start, lte: end } },
      include: { customer: true, service: true, kasir: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.order.aggregate({
      where: { createdAt: { gte: start, lte: end } },
      _sum: { totalPrice: true },
      _count: true,
    }),
    prisma.order.groupBy({
      by: ['serviceId'],
      where: { createdAt: { gte: start, lte: end } },
      _sum: { totalPrice: true },
      _count: true,
    }),
    prisma.order.groupBy({
      by: ['status'],
      where: { createdAt: { gte: start, lte: end } },
      _count: true,
    }),
  ])

  // Get service names
  const serviceIds = byService.map(s => s.serviceId)
  const services = await prisma.service.findMany({
    where: { id: { in: serviceIds } },
  })
  const serviceMap = Object.fromEntries(services.map(s => [s.id, s.name]))

  // Get kasir breakdown
  const kasirCounts = await prisma.order.groupBy({
    by: ['kasirId'],
    where: { createdAt: { gte: start, lte: end } },
    _count: true,
    _sum: { totalPrice: true },
  })
  const kasirIds = kasirCounts.map(k => k.kasirId)
  const kasirs = await prisma.user.findMany({
    where: { id: { in: kasirIds } },
    select: { id: true, name: true },
  })
  const kasirMap = Object.fromEntries(kasirs.map(k => [k.id, k.name]))

  const statusMap: Record<string, number> = {}
  byStatus.forEach(s => { statusMap[s.status] = s._count })

  return NextResponse.json({
    period,
    startDate: start,
    endDate: end,
    summary: {
      totalOrders: summary._count,
      totalRevenue: summary._sum.totalPrice || 0,
    },
    byService: byService.map(s => ({
      name: serviceMap[s.serviceId] || s.serviceId,
      count: s._count,
      revenue: s._sum.totalPrice || 0,
    })),
    byStatus: statusMap,
    byKasir: kasirCounts.map(k => ({
      name: kasirMap[k.kasirId] || k.kasirId,
      count: k._count,
      revenue: k._sum.totalPrice || 0,
    })),
    orders,
  })
}
