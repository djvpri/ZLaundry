import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import type { Session } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

function adminOnly(session: Session | null) {
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  return null
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  const err = adminOnly(session)
  if (err) return err

  const body = await req.json()
  const { name, type, pricePerKg, priceFlat, unit, isActive } = body

  const data: Record<string, unknown> = {}
  if (name !== undefined) data.name = name
  if (type !== undefined) data.type = type
  if (pricePerKg !== undefined) data.pricePerKg = pricePerKg ? Number(pricePerKg) : null
  if (priceFlat !== undefined) data.priceFlat = priceFlat ? Number(priceFlat) : null
  if (unit !== undefined) data.unit = unit || null
  if (isActive !== undefined) data.isActive = isActive

  const service = await prisma.service.update({
    where: { id: params.id },
    data,
  })
  return NextResponse.json(service)
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  const err = adminOnly(session)
  if (err) return err

  await prisma.service.delete({ where: { id: params.id } })
  return NextResponse.json({ success: true })
}
