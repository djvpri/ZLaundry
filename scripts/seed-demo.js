// Seed data DEMO untuk ZLaundry — mengisi tenant tempat akun demo@zomet.my.id
// berada (diakses via SSO dari Z One) dengan pelanggan & order laundry yang
// realistis (status MASUK/PROSES/SELESAI/DIAMBIL) tersebar ~2 bulan terakhir.
//
// IDEMPOTENT / RESET MANUAL: tiap dijalankan, order & pelanggan demo tenant ini
// DIHAPUS lalu diisi ulang (user & tenant TIDAK dihapus; layanan/Service bersifat
// global jadi cuma dibuat kalau belum ada). Jalankan ulang untuk reset:
//   node scripts/seed-demo.js

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const DEMO_EMAIL = process.env.DEMO_EMAIL || 'demo@zomet.my.id'
const DEMO_SLUG = process.env.DEMO_SLUG || 'demo'

const now = new Date()
const rint = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)]
function daysAgo(n, hour) {
  const d = new Date(now)
  d.setDate(d.getDate() - n)
  d.setHours(hour != null ? hour : rint(8, 19), rint(0, 59), 0, 0)
  return d
}
function addDays(date, n) { const d = new Date(date); d.setDate(d.getDate() + n); return d }

const FIRST = ['Budi', 'Sari', 'Andi', 'Dewi', 'Rizky', 'Putri', 'Agus', 'Maya', 'Fajar', 'Indah',
  'Hendra', 'Ratna', 'Yoga', 'Lestari', 'Bayu', 'Wulan', 'Dimas', 'Citra', 'Eko', 'Nadia']
const LAST = ['Santoso', 'Dewi', 'Kurniawan', 'Pratama', 'Wijaya', 'Nugroho', 'Putra', 'Halim', 'Saputra', 'Anggraini']

const SERVICES = [
  { name: 'Cuci Kering', type: 'PER_KG', pricePerKg: 7000, unit: 'kg' },
  { name: 'Cuci Setrika', type: 'PER_KG', pricePerKg: 10000, unit: 'kg' },
  { name: 'Setrika Saja', type: 'PER_KG', pricePerKg: 5000, unit: 'kg' },
  { name: 'Express Cuci Setrika', type: 'PER_KG', pricePerKg: 15000, unit: 'kg' },
  { name: 'Bed Cover', type: 'SATUAN', priceFlat: 25000, unit: 'pcs' },
  { name: 'Cuci Sepatu', type: 'SATUAN', priceFlat: 35000, unit: 'pasang' },
]

async function main() {
  // 1. Tenant demo
  const demoUser = await prisma.user.findFirst({ where: { email: DEMO_EMAIL } })
  let tenantId = demoUser?.tenantId
  if (!tenantId) tenantId = (await prisma.tenant.findFirst({ where: { slug: DEMO_SLUG } }))?.id
  if (!tenantId) tenantId = (await prisma.tenant.findFirst())?.id
  if (!tenantId) throw new Error('Tidak ada tenant di ZLaundry. Buat tenant dulu.')
  const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } })

  // Kasir: user di tenant ini (untuk kasirId order)
  let kasir = demoUser && demoUser.tenantId === tenantId ? demoUser : await prisma.user.findFirst({ where: { tenantId } })
  if (!kasir) kasir = await prisma.user.findFirst()
  if (!kasir) throw new Error('Tidak ada user untuk dijadikan kasir. Buat user dulu.')
  console.log(`Target tenant: ${tenant.namaToko} (${tenant.slug}) | kasir: ${kasir.name}`)

  // 2. RESET order & pelanggan tenant ini
  await prisma.order.deleteMany({ where: { tenantId } })
  await prisma.customer.deleteMany({ where: { tenantId } })
  console.log('Order & pelanggan demo lama dibersihkan.')

  // 3. Layanan (global) — buat kalau belum ada
  const services = []
  for (const s of SERVICES) {
    let svc = await prisma.service.findFirst({ where: { name: s.name } })
    if (!svc) svc = await prisma.service.create({ data: s })
    services.push(svc)
  }

  // 4. Pelanggan
  const customers = []
  const CUST = 15
  for (let i = 0; i < CUST; i++) {
    customers.push(await prisma.customer.create({
      data: {
        tenantId,
        name: `${pick(FIRST)} ${pick(LAST)}`,
        phone: `0812${String(rint(10000000, 99999999))}`,
      },
    }))
  }

  // 5. Order tersebar 60 hari
  let total = 0
  const ORDERS = 45
  for (let i = 0; i < ORDERS; i++) {
    const cust = pick(customers)
    const svc = pick(services)
    const createdAt = daysAgo(rint(0, 60))
    let weight = null, quantity = null, totalPrice = 0
    if (svc.type === 'PER_KG') {
      weight = Math.round((Math.random() * 4.5 + 1.5) * 10) / 10 // 1.5–6.0 kg
      totalPrice = Math.round(weight * svc.pricePerKg)
    } else {
      quantity = rint(1, 3)
      totalPrice = quantity * svc.priceFlat
    }
    const ageDays = Math.floor((now - createdAt) / 86400000)
    let status
    if (ageDays > 7) status = Math.random() < 0.85 ? 'DIAMBIL' : 'SELESAI'
    else if (ageDays > 3) status = pick(['SELESAI', 'DIAMBIL', 'SELESAI'])
    else if (ageDays > 1) status = pick(['PROSES', 'SELESAI'])
    else status = pick(['MASUK', 'PROSES'])

    await prisma.order.create({
      data: {
        tenantId,
        customerId: cust.id,
        serviceId: svc.id,
        kasirId: kasir.id,
        weight, quantity, totalPrice, status,
        notes: Math.random() < 0.25 ? pick(['Pewangi extra', 'Pisah baju putih', 'Lipat rapi', 'Jangan pakai pemutih']) : null,
        createdAt,
        dueDate: addDays(createdAt, svc.name.includes('Express') ? 1 : rint(2, 3)),
      },
    })
    total++
  }

  console.log('✅ Seed demo ZLaundry selesai:')
  console.log(`   pelanggan=${customers.length}, layanan=${services.length}, order=${total}`)
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
