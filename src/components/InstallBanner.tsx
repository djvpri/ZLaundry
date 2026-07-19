'use client'

import { usePWAInstall } from '@/lib/use-pwa-install'
import { useState } from 'react'

export default function InstallBanner() {
  const { canInstall, install } = usePWAInstall()
  const [dismissed, setDismissed] = useState(false)

  if (!canInstall || dismissed) return null

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-80 z-50">
      <div className="bg-blue-600 text-white rounded-xl p-4 shadow-lg shadow-blue-200">
        <div className="flex items-start gap-3">
          <i className="bi bi-phone-fill text-2xl" />
          <div className="flex-1 min-w-0">
            <div className="font-medium text-sm mb-0.5">Install Z Laundry</div>
            <div className="text-xs text-blue-100 mb-3">Tambahkan ke layar utama untuk akses lebih cepat</div>
            <div className="flex gap-2">
              <button onClick={install}
                className="px-3 py-1.5 bg-white text-blue-600 rounded-lg text-xs font-semibold hover:bg-blue-50 transition-colors">
                Install
              </button>
              <button onClick={() => setDismissed(true)}
                className="px-3 py-1.5 text-blue-200 text-xs hover:text-white transition-colors">
                Nanti
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
