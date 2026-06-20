'use client'
import { SessionProvider } from 'next-auth/react'
import InstallBanner from '@/components/InstallBanner'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      {children}
      <InstallBanner />
    </SessionProvider>
  )
}
