import { prisma } from '@/lib/prisma'

export async function logActivity(userId: string, action: string, detail?: string) {
  try {
    await prisma.activityLog.create({
      data: { userId, action, detail },
    })
  } catch {
    // fail silently
  }
}
