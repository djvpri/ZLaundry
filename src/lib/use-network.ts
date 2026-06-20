'use client'
import { useState, useEffect } from 'react'

type NetworkStatus = {
  isOnline: boolean
  lastSync: Date | null
  isSyncing: boolean
  pendingSync: number
}

export function useNetworkStatus() {
  const [status, setStatus] = useState<NetworkStatus>({
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    lastSync: null,
    isSyncing: false,
    pendingSync: 0,
  })

  useEffect(() => {
    const handleOnline = () => setStatus(s => ({ ...s, isOnline: true }))
    const handleOffline = () => setStatus(s => ({ ...s, isOnline: false }))

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return { ...status, setStatus }
}
