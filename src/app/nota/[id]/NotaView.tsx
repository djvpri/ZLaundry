'use client'

type Props = {
  order: {
    id: string
    orderNumber: number
    status: string
    totalPrice: number
    weight: number | null
    quantity: number | null
    notes: string | null
    createdAt: string
    dueDate: string | null
    customer: { name: string; phone: string }
    service: { name: string }
    kasir: { name: string }
  }
  laundry: { name: string; address: string; phone: string }
}

const STATUS_LABELS: Record<string, string> = {
  MASUK: 'Masuk', PROSES: 'Proses', SELESAI: 'Selesai', DIAMBIL: 'Diambil',
}

export default function NotaView({ order, laundry }: Props) {
  const tgl = new Date(order.createdAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })
  const jam = new Date(order.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
  const due = order.dueDate ? new Date(order.dueDate).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }) : null
  const total = new Intl.NumberFormat('id-ID').format(order.totalPrice)

  return (
    <>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; }
          .nota-wrap { box-shadow: none !important; margin: 0 !important; }
        }
      `}</style>

      {/* Toolbar */}
      <div className="no-print bg-gray-900 text-white px-4 py-3 flex items-center justify-between gap-3">
        <button
          onClick={() => window.history.back()}
          className="flex items-center gap-2 text-sm text-gray-300 hover:text-white transition-colors"
        >
          <i className="bi bi-arrow-left" /> Kembali
        </button>
        <div className="flex gap-2">
          <a
            href={`/api/orders/${order.id}/nota`}
            download
            className="flex items-center gap-1.5 px-4 py-2 text-sm bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
          >
            <i className="bi bi-download" /> Unduh PDF
          </a>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors font-medium"
          >
            <i className="bi bi-printer" /> Cetak
          </button>
        </div>
      </div>

      {/* Preview area */}
      <div className="min-h-screen bg-gray-100 flex justify-center py-8 px-4">
        <div className="nota-wrap bg-white shadow-lg w-full max-w-sm rounded-lg overflow-hidden">

          {/* Header */}
          <div className="bg-blue-600 text-white text-center py-5 px-4">
            <div className="font-bold text-xl tracking-wide">{laundry.name}</div>
            {laundry.address && <div className="text-blue-100 text-xs mt-1">{laundry.address}</div>}
            {laundry.phone && <div className="text-blue-100 text-xs mt-0.5">{laundry.phone}</div>}
          </div>

          {/* Body */}
          <div className="p-5 font-mono text-sm">

            {/* Nomor & tanggal */}
            <div className="flex justify-between items-start mb-1">
              <span className="text-gray-500 text-xs">No. Order</span>
              <span className="font-bold text-gray-900">#{order.orderNumber}</span>
            </div>
            <div className="flex justify-between items-start mb-1">
              <span className="text-gray-500 text-xs">Tgl Masuk</span>
              <span className="text-gray-800 text-xs text-right">{tgl}, {jam}</span>
            </div>
            {due && (
              <div className="flex justify-between items-start mb-1">
                <span className="text-gray-500 text-xs">Est. Selesai</span>
                <span className="text-gray-800 text-xs">{due}</span>
              </div>
            )}
            <div className="flex justify-between items-start mb-1">
              <span className="text-gray-500 text-xs">Kasir</span>
              <span className="text-gray-800 text-xs">{order.kasir.name}</span>
            </div>
            <div className="flex justify-between items-start">
              <span className="text-gray-500 text-xs">Status</span>
              <span className="text-gray-800 text-xs">{STATUS_LABELS[order.status] || order.status}</span>
            </div>

            <div className="border-t border-dashed border-gray-300 my-4" />

            {/* Pelanggan */}
            <div className="mb-3">
              <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Pelanggan</div>
              <div className="text-gray-900 font-medium">{order.customer.name}</div>
              <div className="text-gray-500 text-xs">{order.customer.phone}</div>
            </div>

            <div className="border-t border-dashed border-gray-300 my-4" />

            {/* Layanan */}
            <div className="mb-3">
              <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Layanan</div>
              <div className="flex justify-between">
                <span className="text-gray-800">{order.service.name}</span>
                {order.weight && <span className="text-gray-500 text-xs">{order.weight} kg</span>}
                {order.quantity && !order.weight && <span className="text-gray-500 text-xs">x{order.quantity}</span>}
              </div>
              {order.notes && (
                <div className="text-gray-400 text-xs mt-1">Catatan: {order.notes}</div>
              )}
            </div>

            <div className="border-t border-gray-300 my-4" />

            {/* Total */}
            <div className="flex justify-between items-center">
              <span className="font-bold text-gray-700">TOTAL</span>
              <span className="font-bold text-blue-600 text-lg">Rp {total}</span>
            </div>

            <div className="border-t border-dashed border-gray-300 my-4" />

            {/* Footer */}
            <div className="text-center text-gray-400 text-xs leading-relaxed">
              Terima kasih telah menggunakan<br />jasa {laundry.name}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
