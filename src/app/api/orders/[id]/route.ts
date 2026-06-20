import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logActivity } from '@/lib/log-activity'

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { status } = body

  const validStatus = ['MASUK', 'PROSES', 'SELESAI', 'DIAMBIL']
  if (!validStatus.includes(status)) {
    return NextResponse.json({ error: 'Status tidak valid' }, { status: 400 })
  }

  const order = await prisma.order.update({
    where: { id: params.id },
    data: { status },
    include: { customer: true, service: true, kasir: { select: { name: true } } },
  })

  await logActivity(session.user.id as string, 'UPDATE_STATUS', `Order #${order.orderNumber} → ${status}`)

  return NextResponse.json(order)
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: { customer: true },
  })

  await prisma.order.delete({ where: { id: params.id } })

  if (order) {
    await logActivity(session.user.id as string, 'HAPUS_ORDER', `Order #${order.orderNumber} - ${order.customer.name}`)
  }

  return NextResponse.json({ success: true })
}
