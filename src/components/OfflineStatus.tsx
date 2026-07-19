'use client'

import { useState, useEffect, useCallback } from 'react'
import { onSyncStatus, syncNow, startAutoSync, stopAutoSync, getLastSyncTime } from '@/lib/sync-manager'
import { getSyncQueue } from '@/lib/offline-db'

export default function OfflineStatus() {
  const [isOnline, setIsOnline] = useState(true)
  const [isSyncing, setIsSyncing] = useState(false)
  const [lastSync, setLastSync] = useState<Date | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [pendingCount, setPendingCount] = useState(0)

  const refreshPending = useCallback(async () => {
    const q = await getSyncQueue()
    setPendingCount(q.length)
  }, [])

  useEffect(() => {
    setIsOnline(navigator.onLine)
    startAutoSync()
    refreshPending()

    const unsub = onSyncStatus((s) => {
      setIsSyncing(s.isSyncing)
      setLastSync(s.lastSync)
      setError(s.error)
      refreshPending()
    })

    const handleOnline = () => { setIsOnline(true); setTimeout(syncNow, 1500) }
    const handleOffline = () => setIsOnline(false)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    getLastSyncTime().then(d => { if (d) setLastSync(d) })

    // Refresh pending count every 10s
    const interval = setInterval(refreshPending, 10_000)

    return () => {
      unsub()
      stopAutoSync()
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      clearInterval(interval)
    }
  }, [refreshPending])

  // Offline warning — full width top bar
  if (!isOnline) {
    return (
      <div className="fixed top-0 left-0 right-0 z-[60] bg-amber-500 text-white text-center py-2 px-4 text-xs sm:text-sm font-medium shadow-md">
        <i className="bi bi-wifi-off mr-1" /> Offline — perubahan disimpan lokal, sync otomatis saat online
      </div>
    )
  }

  // Error banner
  if (error && !isSyncing) {
    return (
      <div className="fixed top-0 left-0 right-0 z-[60] bg-red-500 text-white text-center py-2 px-4 text-xs sm:text-sm shadow-md flex items-center justify-center gap-2">
        <i className="bi bi-exclamation-triangle-fill" /><span>{error}</span>
        <button onClick={() => { setError(null); syncNow() }} className="underline font-medium">Coba lagi</button>
      </div>
    )
  }

  // Syncing indicator
  if (isSyncing) {
    return (
      <div className="fixed top-2 right-4 z-[60]">
        <div className="bg-blue-600 text-white text-xs px-3 py-1.5 rounded-full shadow-lg flex items-center gap-2">
          <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
          Sync...
        </div>
      </div>
    )
  }

  // Pending changes indicator
  if (pendingCount > 0) {
    return (
      <div className="fixed top-2 right-4 z-[60]">
        <button onClick={() => syncNow()}
          className="bg-amber-500 text-white text-xs px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5 hover:bg-amber-600 transition-colors">
          <i className="bi bi-arrow-up-circle" /> {pendingCount} belum tersinkron
        </button>
      </div>
    )
  }

  return null
}
