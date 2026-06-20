const DB_NAME = 'zlaundry'
const DB_VERSION = 1

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION)
    req.onupgradeneeded = () => {
      const db = req.result
      if (!db.objectStoreNames.contains('orders')) {
        const store = db.createObjectStore('orders', { keyPath: 'id' })
        store.createIndex('status', 'status')
        store.createIndex('createdAt', 'createdAt')
      }
      if (!db.objectStoreNames.contains('syncQueue')) {
        db.createObjectStore('syncQueue', { keyPath: 'id', autoIncrement: true })
      }
      if (!db.objectStoreNames.contains('meta')) {
        db.createObjectStore('meta', { keyPath: 'key' })
      }
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

// ---- Orders ----

export async function saveOrders(orders: any[]) {
  const db = await openDB()
  const tx = db.transaction('orders', 'readwrite')
  const store = tx.objectStore('orders')
  store.clear()
  for (const order of orders) {
    store.put(order)
  }
  return new Promise<void>((resolve, reject) => {
    tx.oncomplete = () => { db.close(); resolve() }
    tx.onerror = () => { db.close(); reject(tx.error) }
  })
}

export async function getOrders(): Promise<any[]> {
  const db = await openDB()
  const tx = db.transaction('orders', 'readonly')
  const store = tx.objectStore('orders')
  const req = store.getAll()
  return new Promise((resolve, reject) => {
    req.onsuccess = () => { db.close(); resolve(req.result || []) }
    req.onerror = () => { db.close(); reject(req.error) }
  })
}

export async function updateOrderStatus(id: string, status: string) {
  const db = await openDB()
  const tx = db.transaction('orders', 'readwrite')
  const store = tx.objectStore('orders')
  const req = store.get(id)
  return new Promise<void>((resolve, reject) => {
    req.onsuccess = () => {
      const order = req.result
      if (order) {
        order.status = status
        store.put(order)
      }
    }
    tx.oncomplete = () => { db.close(); resolve() }
    tx.onerror = () => { db.close(); reject(tx.error) }
  })
}

export async function addOrderLocal(order: any) {
  const db = await openDB()
  const tx = db.transaction('orders', 'readwrite')
  tx.objectStore('orders').put(order)
  return new Promise<void>((resolve, reject) => {
    tx.oncomplete = () => { db.close(); resolve() }
    tx.onerror = () => { db.close(); reject(tx.error) }
  })
}

// ---- Sync Queue ----

type SyncAction = {
  type: 'CREATE_ORDER' | 'UPDATE_STATUS'
  payload: any
  timestamp: number
}

export async function enqueueSync(action: SyncAction) {
  const db = await openDB()
  const tx = db.transaction('syncQueue', 'readwrite')
  tx.objectStore('syncQueue').add({ ...action, timestamp: Date.now() })
  return new Promise<void>((resolve, reject) => {
    tx.oncomplete = () => { db.close(); resolve() }
    tx.onerror = () => { db.close(); reject(tx.error) }
  })
}

export async function getSyncQueue(): Promise<(SyncAction & { id: number })[]> {
  const db = await openDB()
  const tx = db.transaction('syncQueue', 'readonly')
  const req = tx.objectStore('syncQueue').getAll()
  return new Promise((resolve, reject) => {
    req.onsuccess = () => { db.close(); resolve(req.result || []) }
    req.onerror = () => { db.close(); reject(req.error) }
  })
}

export async function clearSyncQueue() {
  const db = await openDB()
  const tx = db.transaction('syncQueue', 'readwrite')
  tx.objectStore('syncQueue').clear()
  return new Promise<void>((resolve, reject) => {
    tx.oncomplete = () => { db.close(); resolve() }
    tx.onerror = () => { db.close(); reject(tx.error) }
  })
}

export async function removeSyncItem(id: number) {
  const db = await openDB()
  const tx = db.transaction('syncQueue', 'readwrite')
  tx.objectStore('syncQueue').delete(id)
  return new Promise<void>((resolve, reject) => {
    tx.oncomplete = () => { db.close(); resolve() }
    tx.onerror = () => { db.close(); reject(tx.error) }
  })
}

// ---- Meta (last sync timestamp) ----

export async function setLastSync(time: number) {
  const db = await openDB()
  const tx = db.transaction('meta', 'readwrite')
  tx.objectStore('meta').put({ key: 'lastSync', value: time })
  return new Promise<void>((resolve, reject) => {
    tx.oncomplete = () => { db.close(); resolve() }
    tx.onerror = () => { db.close(); reject(tx.error) }
  })
}

export async function getLastSync(): Promise<number | null> {
  const db = await openDB()
  const tx = db.transaction('meta', 'readonly')
  const req = tx.objectStore('meta').get('lastSync')
  return new Promise((resolve, reject) => {
    req.onsuccess = () => { db.close(); resolve(req.result?.value || null) }
    req.onerror = () => { db.close(); reject(req.error) }
  })
}
