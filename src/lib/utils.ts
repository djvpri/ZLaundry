export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount)
}

export function formatTanggal(date: Date | string): string {
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(date))
}

export function formatTanggalPendek(date: Date | string): string {
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(date))
}

export const STATUS_LABELS: Record<string, string> = {
  MASUK: 'Masuk',
  PROSES: 'Proses',
  SELESAI: 'Selesai',
  DIAMBIL: 'Diambil',
}

export const STATUS_COLORS: Record<string, string> = {
  MASUK: 'bg-blue-100 text-blue-800',
  PROSES: 'bg-yellow-100 text-yellow-800',
  SELESAI: 'bg-green-100 text-green-800',
  DIAMBIL: 'bg-gray-100 text-gray-600',
}

export const STATUS_NEXT: Record<string, string> = {
  MASUK: 'PROSES',
  PROSES: 'SELESAI',
  SELESAI: 'DIAMBIL',
}
