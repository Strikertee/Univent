/* Backend ↔ local sync. Reads prefer the API when reachable (background pull
   into the same localStorage keys the UI already reads); writes always land
   locally first and mirror to the API in the background. Offline or demo mode
   behaves exactly as before — nothing breaks. */

import { api, hasRealToken } from './api'
import { BOOKINGS_KEY, ORDERS_KEY, SavedBooking, SavedOrder, emitShopChange } from '../store/shop'
import { PRODUCTS_KEY, ROOMS_KEY, emitCatalogChange } from '../store/catalog'
import { SALES_KEY, DailySale, emitSalesChange } from '../store/sales'
import { CART_UPDATED_KEY, replaceCartState } from '../context/CartContext'
import { DIVISIONS_KEY, emitDivisionChange } from '../store/divisions'
import { Cart, CartItem } from '../types'

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
    safeWrite(ORDERS_KEY, mergeById(orders.value.data.data, readKey<SavedOrder>(ORDERS_KEY)))
    emitShopChange()
  }
  if (bookings.status === 'fulfilled' && Array.isArray(bookings.value.data?.data)) {
    safeWrite(BOOKINGS_KEY, mergeById(bookings.value.data.data, readKey<SavedBooking>(BOOKINGS_KEY)))
    emitShopChange()
  }
  if (sales.status === 'fulfilled' && Array.isArray(sales.value.data?.data)) {
    safeWrite(SALES_KEY, mergeById(sales.value.data.data, readKey<DailySale>(SALES_KEY)))
    emitSalesChange()
  }
}

/** Merge server records with local-only ones (same id → server copy wins).
 *  Pulls must NEVER delete local records the server hasn't seen yet —
 *  otherwise a pending order vanishes the moment you log back in. */
function mergeById<T extends { id: string }>(server: T[], local: T[]): T[] {
  const ids = new Set(server.map(r => r.id))
  return [...server, ...local.filter(r => !ids.has(r.id))]
}

function readKey<T>(key: string): T[] {
  try {
    const raw = localStorage.getItem(key)
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function cartKey(item: CartItem): string {  return `${item.type}:${item.productId || item.roomId || item.facilityId || item.id}`
}

function readLocalCart(): { items: CartItem[]; fulfillment: 'pickup' | 'delivery'; updatedAt: string } {
  try {
    const raw = localStorage.getItem('univent_cart')
    const parsed = raw ? JSON.parse(raw) : { items: [], fulfillment: 'pickup' }
    return {
      items: Array.isArray(parsed.items) ? parsed.items : [],
      fulfillment: parsed.fulfillment === 'delivery' ? 'delivery' : 'pickup',
      updatedAt: localStorage.getItem(CART_UPDATED_KEY) || '',
    }
  } catch {
    return { items: [], fulfillment: 'pickup', updatedAt: '' }
  }
}

/**
 * Roaming cart: merges the server copy with this browser's copy so the account
 * sees the same cart on every phone. Union by item (quantities add up), newest
 * side wins for pickup/delivery. Never deletes anyone's items.
 */
export async function pullCart(): Promise<void> {
  if (online !== true || !hasRealToken()) return
  try {
    const res = await api.getClient().get('/cart', { timeout: 12000 })
    const server = res.data?.data as { items: CartItem[]; fulfillment: 'pickup' | 'delivery'; updatedAt: string | null } | undefined
    const serverItems = Array.isArray(server?.items) ? (server as { items: CartItem[] }).items : []
    const serverTs = server?.updatedAt || ''
    const local = readLocalCart()

    if (serverItems.length === 0 && local.items.length === 0) return

    const client = api.getClient()
    let merged: Cart
    let ts: string
    if (serverItems.length === 0) {
      // First login on this account with a local cart → push it up.
      merged = { items: local.items, fulfillment: local.fulfillment } as Cart
      ts = local.updatedAt || new Date().toISOString()
      try {
        await client.put('/cart', { items: merged.items, fulfillment: merged.fulfillment, updatedAt: ts }, { timeout: 12000 })
      } catch { /* stays local-only until next edit */ }
    } else if (local.items.length === 0) {
      merged = { items: serverItems, fulfillment: server?.fulfillment || 'pickup' } as Cart
      ts = serverTs || new Date().toISOString()
    } else {
      // Both sides have items → union, quantities add up, newest fulfillment wins.
      const map = new Map<string, CartItem>()
      for (const item of [...serverItems, ...local.items]) {
        const key = cartKey(item)
        const existing = map.get(key)
        map.set(key, existing ? { ...existing, quantity: existing.quantity + item.quantity } : { ...item })
      }
      const serverNewer = serverTs >= local.updatedAt
      merged = {
        items: [...map.values()],
        fulfillment: serverNewer ? (server?.fulfillment || 'pickup') : local.fulfillment,
      } as Cart
      ts = new Date().toISOString()
      try {
        await client.put('/cart', { items: merged.items, fulfillment: merged.fulfillment, updatedAt: ts }, { timeout: 12000 })
      } catch { /* stays merged locally */ }
    }

    safeWrite('univent_cart', merged)
    safeWrite(CART_UPDATED_KEY, ts)
    replaceCartState(merged, ts)
  } catch (error) {
    console.warn('Cart pull failed, using local cart:', error)
  }
}

/** Full sync: catalogue for everyone, account data + cart when logged in with a real token. */
export async function pullAll(): Promise<void> {
  await pullCatalogue()
  await pullMine()
  await pullCart()
  await pullDivisions()
}

/** Pull divisions (public) and merge with locally created ones. */
export async function pullDivisions(): Promise<void> {
  if (online !== true) return
  try {
    const res = await api.getClient().get('/divisions', { timeout: 12000 })
    const server = res.data?.data
    if (!Array.isArray(server)) return
    const now = new Date().toISOString()
    const withDates = (server as Array<Record<string, unknown>>).map(d => ({
      ...d, createdAt: now, updatedAt: now,
    })) as unknown as Array<{ id: string }>
    let local: Array<{ id: string }> = []
    try {
      local = JSON.parse(localStorage.getItem(DIVISIONS_KEY) || '[]')
    } catch { /* ignore */ }
    const serverIds = new Set(withDates.map((d: { id: string }) => d.id))
    const onlyLocal = local.filter(d => !serverIds.has(d.id))
    safeWrite(DIVISIONS_KEY, [...withDates, ...onlyLocal])
    emitDivisionChange()
  } catch (error) {
    console.warn('Divisions pull failed, using local data:', error)
  }
}
