import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect, notFound } from 'next/navigation'
import NotaView from './NotaView'

export const dynamic = 'force-dynamic'

export default async function NotaPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: {
      customer: true,
      service: true,
      kasir: { select: { name: true } },
    },
  })

  if (!order) notFound()

  const settings = await prisma.setting.findMany({ where: { key: { in: ['laundry_name', 'laundry_address', 'laundry_phone'] } } })
  const getSetting = (key: string) => settings.find(s => s.key === key)?.value || ''
  const laundryName = getSetting('laundry_name') || 'Z Laundry'
  const laundryAddress = getSetting('laundry_address')
  const laundryPhone = getSetting('laundry_phone')

  return (
    <NotaView
      order={{
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        totalPrice: Number(order.totalPrice),
        weight: order.weight ? Number(order.weight) : null,
        quantity: order.quantity,
        notes: order.notes,
        createdAt: order.createdAt.toISOString(),
        dueDate: order.dueDate?.toISOString() ?? null,
        customer: { name: order.customer.name, phone: order.customer.phone },
        service: { name: order.service.name },
        kasir: { name: order.kasir.name },
      }}
      laundry={{ name: laundryName, address: laundryAddress, phone: laundryPhone }}
    />
  )
}
