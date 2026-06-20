const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Default tenant
  const tenant = await prisma.tenant.upsert({
    where: { slug: 'laundrykas' },
    update: {},
    create: {
      namaToko: 'LaundryKas',
      slug: 'laundrykas',
      plan: 'free',
      isActive: true,
    },
  })
  console.log('✅ Tenant:', tenant.namaToko)

  // Admin default
  const hashedPassword = await bcrypt.hash('admin123', 10)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@laundrykas.com' },
    update: {},
    create: {
      name: 'Admin Utama',
      email: 'admin@laundrykas.com',
      password: hashedPassword,
      role: 'ADMIN',
      tenantId: tenant.id,
    },
  })
  console.log('✅ User admin:', admin.email)

  // Kasir default
  const kasirPassword = await bcrypt.hash('kasir123', 10)
  const kasir = await prisma.user.upsert({
    where: { email: 'kasir@laundrykas.com' },
    update: {},
    create: {
      name: 'Kasir 1',
      email: 'kasir@laundrykas.com',
      password: kasirPassword,
      role: 'KASIR',
      tenantId: tenant.id,
    },
  })
  console.log('✅ User kasir:', kasir.email)

  // Layanan default
  const services = [
    { name: 'Reguler (2 hari)', type: 'PER_KG', pricePerKg: 7000 },
    { name: 'Express (6 jam)', type: 'PER_KG', pricePerKg: 15000 },
    { name: 'Kilat (1 hari)', type: 'PER_KG', pricePerKg: 10000 },
    { name: 'Sepatu', type: 'SATUAN', priceFlat: 20000, unit: 'pasang' },
    { name: 'Selimut', type: 'SATUAN', priceFlat: 25000, unit: 'lembar' },
    { name: 'Jas / Blazer', type: 'SATUAN', priceFlat: 30000, unit: 'potong' },
    { name: 'Bed Cover', type: 'SATUAN', priceFlat: 35000, unit: 'lembar' },
  ]

  for (const s of services) {
    await prisma.service.upsert({
      where: { id: s.name },
      update: {},
      create: { ...s, id: s.name },
    }).catch(() =>
      prisma.service.create({ data: s })
    )
  }
  console.log(`✅ ${services.length} layanan ditambahkan`)

  // Sample customers
  const customers = [
    { name: 'Ibu Wati', phone: '081234561111' },
    { name: 'Pak Rudi', phone: '085312345678' },
    { name: 'Nia Rahayu', phone: '087890001234' },
  ]
  for (const c of customers) {
    await prisma.customer.create({ data: c }).catch(() => {})
  }
  console.log(`✅ Sample customers ditambahkan`)

  // Seed plans
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
  console.log(`✅ ${plans.length} plans ditambahkan`)

  // Set default plan
  const existing = await prisma.setting.findUnique({ where: { key: 'plan' } })
  if (!existing) {
    await prisma.setting.create({ data: { key: 'plan', value: 'free' } })
  }
  console.log('✅ Default plan: free')

  console.log('\n🎉 Seed selesai!')
  console.log('Login admin : admin@laundrykas.com / admin123')
  console.log('Login kasir : kasir@laundrykas.com / kasir123')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
