import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logActivity } from '@/lib/log-activity'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')
  const date = searchParams.get('date')

  const where: any = {}
  if (status) where.status = status
  if (date) {
    const start = new Date(date)
    start.setHours(0, 0, 0, 0)
    const end = new Date(date)
    end.setHours(23, 59, 59, 999)
    where.createdAt = { gte: start, lte: end }
  }

  const orders = await prisma.order.findMany({
    where,
    include: {
      customer: true,
      service: true,
      kasir: { select: { name: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(orders)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { customerName, customerPhone, serviceId, weight, quantity, notes } = body

  if (!customerName || !customerPhone || !serviceId) {
    return NextResponse.json({ error: 'Data tidak lengkap' }, { status: 400 })
  }

  // Cari atau buat customer
  let customer = await prisma.customer.findFirst({
    where: { phone: customerPhone },
  })
  if (!customer) {
    customer = await prisma.customer.create({
      data: { name: customerName, phone: customerPhone },
    })
  }

  // Ambil data service
  const service = await prisma.service.findUnique({ where: { id: serviceId } })
  if (!service) return NextResponse.json({ error: 'Layanan tidak ditemukan' }, { status: 404 })

  // Hitung total
  let totalPrice = 0
  if (service.type === 'PER_KG') {
    totalPrice = Math.round((weight || 0) * (service.pricePerKg || 0))
  } else {
    totalPrice = (service.priceFlat || 0) * (quantity || 1)
  }

  // Hitung due date
  const dueDate = new Date()
  if (service.name.includes('6 jam')) dueDate.setHours(dueDate.getHours() + 6)
  else if (service.name.includes('1 hari')) dueDate.setDate(dueDate.getDate() + 1)
  else dueDate.setDate(dueDate.getDate() + 2)

  const order = await prisma.order.create({
    data: {
      customerId: customer.id,
      serviceId: service.id,
      kasirId: session.user.id as string,
      weight: weight || null,
      quantity: quantity || null,
      totalPrice,
      notes,
      dueDate,
    },
    include: { customer: true, service: true },
  })

  await logActivity(session.user.id as string, 'ORDER_BARU', `Order #${order.orderNumber} - ${customer.name}`)

  return NextResponse.json(order, { status: 201 })
}
