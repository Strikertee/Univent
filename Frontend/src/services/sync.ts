/* Backend ↔ local sync. Reads prefer the API when reachable (background pull
   into the same localStorage keys the UI already reads); writes always land
   locally first and mirror to the API in the background. Offline or demo mode
   behaves exactly as before — nothing breaks. */

import { api, hasRealToken } from './api'
import { BOOKINGS_KEY, ORDERS_KEY, emitShopChange } from '../store/shop'
import { PRODUCTS_KEY, ROOMS_KEY, emitCatalogChange } from '../store/catalog'
import { SALES_KEY, emitSalesChange } from '../store/sales'

let online: boolean | null = null

export async function probeBackend(): Promise<boolean> {
  try {
    online = await api.checkConnection(6000)
  } catch {
    online = false
  }
  return online === true
}

export function backendOnline(): boolean {
  return online === true
}

function safeWrite(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* storage full — UI keeps working from memory */
  }
}

/** Pull shared catalogue (works for guests too — no login needed). */
export async function pullCatalogue(): Promise<void> {
  if (online !== true) return
  try {
    const client = api.getClient()
    const [rooms, products] = await Promise.all([
      client.get('/rooms', { timeout: 12000 }),
      client.get('/products', { timeout: 12000 }),
    ])
    if (Array.isArray(rooms.data?.data)) safeWrite(ROOMS_KEY, rooms.data.data)
    if (Array.isArray(products.data?.data)) safeWrite(PRODUCTS_KEY, products.data.data)
    emitCatalogChange()
  } catch (error) {
    console.warn('Catalogue pull failed, using local data:', error)
  }
}

/** Pull the logged-in user's orders/bookings/sales (needs a real JWT). */
export async function pullMine(): Promise<void> {
  if (online !== true || !hasRealToken()) return
  const client = api.getClient()
  // Independent calls — one failing (e.g. /sales needs an admin role) must not block the rest.
  const [orders, bookings, sales] = await Promise.allSettled([
    client.get('/orders', { timeout: 12000 }),
    client.get('/bookings', { timeout: 12000 }),
    client.get('/sales', { timeout: 12000 }),
  ])
  if (orders.status === 'fulfilled' && Array.isArray(orders.value.data?.data)) {
    safeWrite(ORDERS_KEY, orders.value.data.data)
    emitShopChange()
  }
  if (bookings.status === 'fulfilled' && Array.isArray(bookings.value.data?.data)) {
    safeWrite(BOOKINGS_KEY, bookings.value.data.data)
    emitShopChange()
  }
  if (sales.status === 'fulfilled' && Array.isArray(sales.value.data?.data)) {
    safeWrite(SALES_KEY, sales.value.data.data)
    emitSalesChange()
  }
}

/** Full sync: catalogue for everyone, account data when logged in with a real token. */
export async function pullAll(): Promise<void> {
  await pullCatalogue()
  await pullMine()
}
