'use client'
import { SessionProvider } from 'next-auth/react'
import InstallBanner from '@/components/InstallBanner'
import OfflineStatus from '@/components/OfflineStatus'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <OfflineStatus />
      {children}
      <InstallBanner />
    </SessionProvider>
  )
}
