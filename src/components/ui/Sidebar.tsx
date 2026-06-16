'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: '📊' },
  { href: '/orders', label: 'Order & Status', icon: '👕' },
]

const adminItems = [
  { href: '/admin/services', label: 'Kelola Layanan', icon: '⚙️' },
  { href: '/admin/users', label: 'Kelola Pengguna', icon: '👥' },
]

export default function Sidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const isAdmin = session?.user?.role === 'ADMIN'

  return (
    <aside className="w-60 bg-white border-r border-gray-200 flex flex-col min-h-screen">
      {/* Brand */}
      <div className="p-5 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center">
            <span className="text-white text-lg">🧺</span>
          </div>
          <div>
            <div className="font-semibold text-gray-900 text-sm">LaundryKas</div>
            <div className="text-xs text-gray-400">POS Laundry</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="p-3 flex-1">
        <div className="space-y-1">
          {navItems.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                pathname === item.href
                  ? 'bg-blue-50 text-blue-700 font-medium'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <span>{item.icon}</span>
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
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                    pathname === item.href
                      ? 'bg-blue-50 text-blue-700 font-medium'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <span>{item.icon}</span>
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </nav>

      {/* User */}
      <div className="p-3 border-t border-gray-100">
        <div className="px-3 py-2 mb-1">
          <div className="text-sm font-medium text-gray-900">{session?.user?.name}</div>
          <div className="text-xs text-gray-400">{session?.user?.role === 'ADMIN' ? 'Admin' : 'Kasir'}</div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <span>🚪</span> Keluar
        </button>
      </div>
    </aside>
  )
}
