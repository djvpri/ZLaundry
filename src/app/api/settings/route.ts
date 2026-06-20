import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const DEFAULT_SETTINGS = [
  { key: 'fonnte_token', value: '' },
  { key: 'wa_admin_number', value: '' },
  { key: 'laundry_name', value: 'Z Laundry' },
  { key: 'laundry_address', value: '' },
  { key: 'laundry_phone', value: '' },
]

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  let settings = await prisma.setting.findMany()
  if (settings.length === 0) {
    await prisma.setting.createMany({ data: DEFAULT_SETTINGS })
    settings = await prisma.setting.findMany()
  }

  const result: Record<string, string> = {}
  settings.forEach(s => { result[s.key] = s.value })
  return NextResponse.json(result)
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await req.json()

  for (const [key, value] of Object.entries(body)) {
    await prisma.setting.upsert({
      where: { key },
      update: { value: value as string },
      create: { key, value: value as string },
    })
  }

  return NextResponse.json({ success: true })
}
