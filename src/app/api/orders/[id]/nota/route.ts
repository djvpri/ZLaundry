import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { jsPDF } from 'jspdf'

export const dynamic = 'force-dynamic'

export async function GET(
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

  try {
    const doc = new jsPDF({ unit: 'mm', format: [80, 200] })
    const pageWidth = 80
    let y = 10

    const center = (text: string, yPos: number, fontSize = 10) => {
      doc.setFontSize(fontSize)
      const tw = doc.getTextWidth(text)
      doc.text(text, (pageWidth - tw) / 2, yPos)
    }

    doc.setFont('helvetica', 'bold')
    center('Z LAUNDRY', y, 14)
    y += 6
    doc.setFont('helvetica', 'normal')
    center('POS Laundry - Nota', y, 8)
    y += 5

    doc.setDrawColor(200)
    doc.line(5, y, pageWidth - 5, y)
    y += 5

    doc.setFontSize(9)
    doc.text(`No. Order  : #${order.orderNumber}`, 8, y); y += 4
    doc.text(`Tgl Masuk  : ${new Date(order.createdAt).toLocaleDateString('id-ID')}`, 8, y); y += 4
    if (order.dueDate) {
      doc.text(`Selesai    : ${new Date(order.dueDate).toLocaleDateString('id-ID')}`, 8, y); y += 4
    }
    doc.text(`Kasir      : ${order.kasir.name}`, 8, y); y += 4

    doc.line(5, y, pageWidth - 5, y)
    y += 5

    doc.setFont('helvetica', 'bold')
    doc.text('DATA PELANGGAN', 8, y); y += 4
    doc.setFont('helvetica', 'normal')
    doc.text(`Nama  : ${order.customer.name}`, 8, y); y += 4
    doc.text(`No. HP: ${order.customer.phone}`, 8, y); y += 4

    doc.line(5, y, pageWidth - 5, y)
    y += 5

    doc.setFont('helvetica', 'bold')
    doc.text('LAYANAN', 8, y); y += 4
    doc.setFont('helvetica', 'normal')
    doc.text(order.service.name, 8, y); y += 4
    if (order.weight) { doc.text(`Berat: ${order.weight} kg`, 8, y); y += 4 }
    if (order.quantity) { doc.text(`Jumlah: ${order.quantity}`, 8, y); y += 4 }

    doc.line(5, y, pageWidth - 5, y)
    y += 5

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(12)
    doc.text(`TOTAL : Rp ${order.totalPrice.toLocaleString('id-ID')}`, 8, y)
    y += 8

    if (order.notes) {
      doc.setFontSize(9)
      doc.setFont('helvetica', 'normal')
      doc.text(`Catatan: ${order.notes}`, 8, y); y += 4
    }

    doc.line(5, y, pageWidth - 5, y)
    y += 6

    center('Terima kasih telah menggunakan', y, 8); y += 3
    center('jasa Z Laundry', y, 8)

    const pdfArray = doc.output('arraybuffer')
    return new NextResponse(pdfArray, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="nota-${order.orderNumber}.pdf"`,
      },
    })
  } catch (err) {
    console.error('[PDF] Generate error:', err)
    return NextResponse.json({ error: 'Gagal generate PDF' }, { status: 500 })
  }
}
