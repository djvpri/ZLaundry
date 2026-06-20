'use client'

import {
  getSyncQueue,
  clearSyncQueue,
  removeSyncItem,
  saveOrders,
  setLastSync,
  getLastSync,
} from '@/lib/offline-db'

type SyncStatus = {
  isSyncing: boolean
  lastSync: Date | null
  pendingCount: number
  error: string | null
}

type SyncListener = (status: SyncStatus) => void

let listeners: SyncListener[] = []
let currentStatus: SyncStatus = {
  isSyncing: false,
  lastSync: null,
  pendingCount: 0,
  error: null,
}

function notify() {
  listeners.forEach(fn => fn({ ...currentStatus }))
}

export function onSyncStatus(fn: SyncListener) {
  listeners.push(fn)
  fn({ ...currentStatus })
  return () => { listeners = listeners.filter(l => l !== fn) }
}

export async function syncNow(): Promise<boolean> {
  if (currentStatus.isSyncing) return false
  if (!navigator.onLine) {
    currentStatus = { ...currentStatus, error: 'Tidak ada koneksi internet' }
    notify()
    return false
  }

  currentStatus = { ...currentStatus, isSyncing: true, error: null }
  notify()

  try {
    // 1. Push pending changes
    const queue = await getSyncQueue()
    let failed = 0
    for (const item of queue) {
      try {
        if (item.type === 'CREATE_ORDER') {
          const res = await fetch('/api/orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(item.payload),
          })
          if (!res.ok) failed++
        } else if (item.type === 'UPDATE_STATUS') {
          const res = await fetch(`/api/orders/${item.payload.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: item.payload.status }),
          })
          if (!res.ok) failed++
        }
      } catch {
        failed++
      }
    }

    // 2. Pull fresh data
    const res = await fetch('/api/orders')
    if (res.ok) {
      const orders = await res.json()
      await saveOrders(orders)
    }

    // 3. Cleanup
    if (failed === 0) {
      await clearSyncQueue()
    }

    const now = Date.now()
    await setLastSync(now)
    currentStatus = {
      isSyncing: false,
      lastSync: new Date(now),
      pendingCount: failed,
      error: failed > 0 ? `${failed} item gagal disinkronkan` : null,
    }
    notify()
    return failed === 0
  } catch (err: any) {
    currentStatus = {
      ...currentStatus,
      isSyncing: false,
      error: err.message || 'Sync gagal',
    }
    notify()
    return false
  }
}

// Auto-sync every 1 minute
let syncInterval: ReturnType<typeof setInterval> | null = null

export function startAutoSync() {
  if (syncInterval) return
  syncInterval = setInterval(() => {
    if (navigator.onLine) syncNow()
  }, 60_000)

  // Also sync on online event
  window.addEventListener('online', () => {
    setTimeout(syncNow, 1000)
  })
}

export function stopAutoSync() {
  if (syncInterval) {
    clearInterval(syncInterval)
    syncInterval = null
  }
}

export async function getLastSyncTime(): Promise<Date | null> {
  const ts = await getLastSync()
  return ts ? new Date(ts) : null
}
