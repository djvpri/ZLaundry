const CACHE_NAME = 'zlaundry-v2'
const SHELL = [
  '/',
  '/dashboard',
  '/orders',
  '/laporan',
  '/login',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
]

// Install — cache app shell
self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(SHELL)))
  self.skipWaiting()
})

// Activate — cleanup old caches
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  )
  self.clients.claim()
})

// Fetch — stale-while-revalidate for pages, network-first for API
self.addEventListener('fetch', (e) => {
  const { request } = e
  const url = new URL(request.url)

  // API & _next/data — network only
  if (request.method !== 'GET' || url.pathname.startsWith('/api/') || url.pathname.startsWith('/_next/')) {
    return
  }

  // Static assets — cache first
  if (url.pathname.match(/\.(png|jpg|jpeg|svg|ico|woff2?|ttf)$/)) {
    e.respondWith(
      caches.match(request).then(cached => cached || fetch(request).then(r => {
        const clone = r.clone()
        caches.open(CACHE_NAME).then(c => c.put(request, clone))
        return r
      }))
    )
    return
  }

  // Pages — stale-while-revalidate
  e.respondWith(
    caches.match(request).then(cached => {
      const fetched = fetch(request).then(r => {
        if (r.ok) {
          const clone = r.clone()
          caches.open(CACHE_NAME).then(c => c.put(request, clone))
        }
        return r
      }).catch(() => cached)

      return cached || fetched
    })
  )
})

// Background sync
self.addEventListener('sync', (e) => {
  if (e.tag === 'zlaundry-sync') {
    e.waitUntil(self.clients.matchAll().then(clients => {
      clients.forEach(c => c.postMessage({ type: 'SYNC_NOW' }))
    }))
  }
})
