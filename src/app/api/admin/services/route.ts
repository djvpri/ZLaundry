import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

function adminOnly(session: Awaited<ReturnType<typeof getServerSession>>) {
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  return null
}

export async function GET() {
  const session = await getServerSession(authOptions)
  const err = adminOnly(session)
  if (err) return err

  const services = await prisma.service.findMany({ orderBy: { name: 'asc' } })
  return NextResponse.json(services)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  const err = adminOnly(session)
  if (err) return err

  const body = await req.json()
  const { name, type, pricePerKg, priceFlat, unit } = body

  if (!name || !type) {
    return NextResponse.json({ error: 'Nama dan tipe wajib diisi' }, { status: 400 })
  }
  if (type === 'PER_KG' && !pricePerKg) {
    return NextResponse.json({ error: 'Harga per kg wajib diisi' }, { status: 400 })
  }
  if (type === 'SATUAN' && !priceFlat) {
    return NextResponse.json({ error: 'Harga satuan wajib diisi' }, { status: 400 })
  }

  const service = await prisma.service.create({
    data: {
      name,
      type,
      pricePerKg: type === 'PER_KG' ? Number(pricePerKg) : null,
      priceFlat: type === 'SATUAN' ? Number(priceFlat) : null,
      unit: type === 'SATUAN' ? (unit || 'pcs') : null,
    },
  })
  return NextResponse.json(service, { status: 201 })
}
