const FONNTE_API = 'https://api.fonnte.com/send'

type OrderData = {
  orderNumber: number
  customer: { name: string; phone: string }
  service: { name: string }
  weight?: number | null
  quantity?: number | null
  totalPrice: number
  status: string
  dueDate?: Date | null
}

const STATUS_MESSAGES: Record<string, string> = {
  MASUK: 'Pesanan anda sudah diterima dan masuk antrian.',
  PROSES: 'Pesanan anda sedang diproses/cuci.',
  SELESAI: 'Pesanan anda sudah selesai dan siap diambil.',
  DIAMBIL: 'Pesanan anda sudah diambil. Terima kasih!',
}

function formatPhone(phone: string): string {
  let p = phone.replace(/\D/g, '')
  if (p.startsWith('0')) p = '62' + p.slice(1)
  if (!p.startsWith('62')) p = '62' + p
  return p
}

function calcDueText(order: OrderData): string {
  if (!order.dueDate) return ''
  const now = new Date()
  const due = new Date(order.dueDate)
  const diff = due.getTime() - now.getTime()
  const hours = Math.round(diff / (1000 * 60 * 60))
  if (hours <= 0) return 'Sudah bisa diambil!'
  if (hours <= 24) return `Estimasi selesai: ${hours} jam lagi`
  const days = Math.round(hours / 24)
  return `Estimasi selesai: ${days} hari lagi`
}

export async function sendWhatsAppStatus(order: OrderData): Promise<boolean> {
  const token = process.env.FONNTE_TOKEN
  const adminNumber = process.env.WA_ADMIN_NUMBER

  if (!token) {
    console.log('[WA] FONNTE_TOKEN not set, skipping')
    return false
  }

  const phone = formatPhone(order.customer.phone)
  const statusMsg = STATUS_MESSAGES[order.status] || ''
  const dueText = calcDueText(order)

  const msg = [
    `🧺 *Z LAUNDRY*`,
    ``,
    `Halo ${order.customer.name}!`,
    `No. Order: *#${order.orderNumber}*`,
    `Layanan: ${order.service.name}`,
    order.weight ? `Berat: ${order.weight} kg` : null,
    order.quantity ? `Jumlah: ${order.quantity}` : null,
    `Total: *Rp ${order.totalPrice.toLocaleString('id-ID')}*`,
    ``,
    `📦 Status: *${order.status}*`,
    statusMsg,
    dueText ? `\n⏰ ${dueText}` : '',
    ``,
    `Terima kasih 🙏`,
  ].filter(Boolean).join('\n')

  try {
    const res = await fetch(FONNTE_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: token,
      },
      body: JSON.stringify({
        target: phone,
        message: msg,
      }),
    })

    const data = await res.json()
    console.log('[WA] Send result:', data)
    return data.status === true
  } catch (err) {
    console.error('[WA] Send failed:', err)
    return false
  }
}
