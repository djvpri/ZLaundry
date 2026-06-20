// lib/plan-enforcement.ts
// Plan limit enforcement for ZLaundry
import { prisma } from '@/lib/prisma'

export interface PlanLimit {
  maxOrder: number
  maxCustomer: number
  maxUser: number
  maxLayanan: number
  fitur: string[]
}

export interface CheckResult {
  allowed: boolean
  current: number
  max: number
  planName: string
}

const PLAN_DEFAULTS: Record<string, PlanLimit> = {
  free: {
    maxOrder: 100,
    maxCustomer: 50,
    maxUser: 2,
    maxLayanan: 10,
    fitur: ['basic_order', 'basic_customer'],
  },
  pro: {
    maxOrder: -1,  // unlimited
    maxCustomer: -1,
    maxUser: -1,
    maxLayanan: -1,
    fitur: ['basic_order', 'basic_customer', 'report', 'face_login', 'offline'],
  },
}

/** Get plan limits */
export function getPlanLimits(plan: string): PlanLimit {
  return PLAN_DEFAULTS[plan] ?? PLAN_DEFAULTS.free
}

/** Get current plan from settings */
async function getCurrentPlan(): Promise<string> {
  const setting = await prisma.setting.findUnique({ where: { key: 'plan' } })
  return setting?.value || 'free'
}

/** Check plan limit */
export async function checkPlanLimit(
  type: 'order' | 'customer' | 'user' | 'layanan'
): Promise<CheckResult> {
  const plan = await getCurrentPlan()
  const limits = getPlanLimits(plan)

  const maxMap = {
    order: limits.maxOrder,
    customer: limits.maxCustomer,
    user: limits.maxUser,
    layanan: limits.maxLayanan,
  }
  const max = maxMap[type]

  if (max === -1) {
    return { allowed: true, current: 0, max: -1, planName: plan }
  }

  const countMap = {
    order: () => prisma.order.count(),
    customer: () => prisma.customer.count(),
    user: () => prisma.user.count(),
    layanan: () => prisma.service.count(),
  }

  const current = await countMap[type]()

  return {
    allowed: current < max,
    current,
    max,
    planName: plan,
  }
}

/** Seed default plans */
export async function seedPlans() {
  const plans = [
    {
      id: 'free',
      name: 'Free',
      hargaBulan: 0,
      hargaTahun: 0,
      maxOrder: 100,
      maxCustomer: 50,
      maxUser: 2,
      maxLayanan: 10,
      fitur: ['basic_order', 'basic_customer'],
      urutan: 1,
    },
    {
      id: 'pro',
      name: 'Pro',
      hargaBulan: 99000,
      hargaTahun: 990000,
      maxOrder: -1,
      maxCustomer: -1,
      maxUser: -1,
      maxLayanan: -1,
      fitur: ['basic_order', 'basic_customer', 'report', 'face_login', 'offline'],
      urutan: 2,
    },
  ]

  for (const plan of plans) {
    await prisma.plan.upsert({
      where: { id: plan.id },
      create: plan,
      update: plan,
    })
  }

  // Set default plan if not exists
  const existing = await prisma.setting.findUnique({ where: { key: 'plan' } })
  if (!existing) {
    await prisma.setting.create({ data: { key: 'plan', value: 'free' } })
  }
}
