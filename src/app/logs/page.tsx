'use client'
import { useState, useEffect } from 'react'

type Log = {
  id: string; action: string; detail: string | null; createdAt: string
  user: { name: string; email: string }
}

const ACTION_LABELS: Record<string, string> = {
  ORDER_BARU: 'Order Baru', UPDATE_STATUS: 'Update Status',
  HAPUS_ORDER: 'Hapus Order', CREATE_USER: 'Buat User', UPDATE_SERVICE: 'Update Layanan',
}

export default function LogsPage() {
  const [logs, setLogs] = useState<Log[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/logs?limit=100').then(r => r.json()).then(setLogs).finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="p-4 sm:p-6 text-center text-gray-400">Memuat...</div>

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-4 sm:mb-6">
        <h1 className="text-lg sm:text-xl font-semibold text-gray-900">Log Aktivitas</h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-0.5">{logs.length} aktivitas tercatat</p>
      </div>

      <div className="card p-0 overflow-hidden">
        {logs.length === 0 ? (
          <div className="py-12 text-center text-gray-400 text-sm">Belum ada aktivitas</div>
        ) : (
          <div className="divide-y divide-gray-50">
            {logs.map(log => (
              <div key={log.id} className="px-4 sm:px-5 py-3 hover:bg-gray-50/50">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <span className="text-sm font-medium text-gray-900">
                      {ACTION_LABELS[log.action] || log.action}
                    </span>
                    {log.detail && (
                      <span className="text-sm text-gray-500 block sm:inline sm:ml-2 truncate">{log.detail}</span>
                    )}
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-xs text-gray-500">{log.user.name}</div>
                    <div className="text-[10px] text-gray-400">{fmtTime(log.createdAt)}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function fmtTime(d: string) {
  return new Date(d).toLocaleString('id-ID', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
}
