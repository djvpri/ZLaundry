import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { sendWhatsAppStatus } from '@/lib/fonnte'

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: { customer: true, service: true, kasir: { select: { name: true } } },
  })

  if (!order) return NextResponse.json({ error: 'Order tidak ditemukan' }, { status: 404 })

  const sent = await sendWhatsAppStatus(order as any)

  if (!sent) {
    return NextResponse.json({ error: 'Gagal kirim WA. Pastikan FONNTE_TOKEN sudah diset.' }, { status: 500 })
  }

  return NextResponse.json({ success: true, message: 'WhatsApp terkirim' })
}
