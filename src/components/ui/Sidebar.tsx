'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import { useState } from 'react'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: 'bi bi-speedometer2' },
  { href: '/orders', label: 'Order & Status', icon: 'bi bi-basket3' },
  { href: '/laporan', label: 'Laporan', icon: 'bi bi-bar-chart-line' },
]

const adminItems = [
  { href: '/admin/services', label: 'Kelola Layanan', icon: 'bi bi-sliders2' },
  { href: '/admin/users', label: 'Kelola Pengguna', icon: 'bi bi-people' },
  { href: '/pengaturan', label: 'Pengaturan', icon: 'bi bi-gear' },
  { href: '/logs', label: 'Log Aktivitas', icon: 'bi bi-clock-history' },
]

export default function Sidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const isAdmin = session?.user?.role === 'ADMIN'
  const [mobileOpen, setMobileOpen] = useState(false)

  const navContent = (
    <>
      <div className="p-5 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center">
            <i className="bi bi-droplet-half text-white text-lg" />
          </div>
          <div>
            <div className="font-semibold text-gray-900 text-sm">Z Laundry</div>
            <div className="text-xs text-gray-400">POS Laundry</div>
          </div>
        </div>
      </div>

      <nav className="p-3 flex-1">
        <div className="space-y-1">
          {navItems.map(item => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                pathname === item.href
                  ? 'bg-blue-50 text-blue-700 font-medium'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <i className={`${item.icon} text-base w-4 text-center`} />
              {item.label}
            </Link>
          ))}
        </div>

        {isAdmin && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="px-3 mb-1 text-xs font-medium text-gray-400 uppercase tracking-wider">Admin</div>
            <div className="space-y-1">
              {adminItems.map(item => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                    pathname === item.href
                      ? 'bg-blue-50 text-blue-700 font-medium'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <i className={`${item.icon} text-base w-4 text-center`} />
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </nav>

      <div className="p-3 border-t border-gray-100">
        <div className="px-3 py-2 mb-1">
          <div className="text-sm font-medium text-gray-900">{session?.user?.name}</div>
          <div className="text-xs text-gray-400">{session?.user?.role === 'ADMIN' ? 'Admin' : 'Kasir'}</div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <i className="bi bi-box-arrow-right text-base" /> Keluar
        </button>
      </div>
    </>
  )

  return (
    <>
      {/* Mobile header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 h-14 bg-white border-b border-gray-200 flex items-center px-4 gap-3">
        <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-lg">
          <i className="bi bi-list text-xl" />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
            <i className="bi bi-droplet-half text-white text-sm" />
          </div>
          <span className="font-semibold text-sm text-gray-900">Z Laundry</span>
        </div>
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black/30" onClick={() => setMobileOpen(false)} />
      )}

      {/* Mobile sidebar */}
      <aside className={`lg:hidden fixed top-14 left-0 bottom-0 z-40 w-64 bg-white border-r border-gray-200 flex flex-col transform transition-transform duration-200 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        {navContent}
      </aside>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-60 bg-white border-r border-gray-200 flex-col min-h-screen">
        {navContent}
      </aside>
    </>
  )
}
