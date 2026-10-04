import { useSyncExternalStore } from 'react'
import { CartItem } from '../types'
import { api, hasRealToken, uploadDataUrlReceipt } from '../services/api'
import { rememberServerId, serverIdFor } from '../services/idmap'

export interface SavedOrder {
  id: string
  ref: string
  userId: string
  userEmail: string
  items: CartItem[]
  subtotal: number
  tax: number
  shipping: number
  total: number
  method: string
  fulfillment: 'pickup' | 'delivery'
  divisionId: string // bakery division, hotels division, or 'multiple'
  receipt: string | null // photo of transfer receipt uploaded by the customer
  paymentStatus: 'awaiting_confirmation' | 'confirmed' | 'rejected'
  firstName: string
  lastName: string
  email: string
  phone: string
  address: string
  city: string
  state: string
  date: string
  status: 'Processing' | 'Delivered' | 'Cancelled'
}

export type BookingStatus = 'pending' | 'approved' | 'cancelled'
export type BookingPaymentStatus = 'unpaid' | 'awaiting_confirmation' | 'confirmed' | 'rejected' | 'reversed'

export interface SavedBooking {
  id: string
  ref: string
  userId: string
  userEmail: string
  roomSlug: string
  roomName: string
  image: string
  pricePerNight: number
  nights: number
  subtotal: number
  tax: number
  total: number
  method: string
  checkIn: string
  checkOut: string
  guests: number
  firstName: string
  lastName: string
  email: string
  phone: string
  requests: string
  date: string
  status: BookingStatus
  paymentStatus: BookingPaymentStatus
  roomNumber: string | null
  receipt: string | null // photo of transfer receipt uploaded by the customer
  verifiedAt: string | null
}

export const ORDERS_KEY = 'univent_orders'
export const BOOKINGS_KEY = 'univent_bookings'
export const CHECKOUT_DRAFT_KEY = 'univent_checkout_draft'

/** Re-render hook subscribers (used after a background API pull). */
export function emitShopChange() {
  notify()
}

function read<T>(key: string): T[] {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T[]) : []
  } catch {
    return []
  }
}

function write(key: string, value: unknown) {
  localStorage.setItem(key, JSON.stringify(value))
  notify()
}

type Listener = () => void
const listeners = new Set<Listener>()
let version = 0
function notify() {
  version += 1
  listeners.forEach(l => l())
}
function subscribe(l: Listener) {
  listeners.add(l)
  return () => { listeners.delete(l) }
}
function getVersion() {
  return version
}

export function makeRef(prefix: 'UI' | 'BK'): string {
  return `${prefix}-${Date.now().toString().slice(-6)}`
}

// ---- Orders ----
export function saveOrder(order: Omit<SavedOrder, 'id' | 'date' | 'status'>): SavedOrder {
  const record: SavedOrder = {
    ...order,
    id: `order-${Date.now()}`,
    date: new Date().toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' }),
    status: 'Processing',
  }
  const all = read<SavedOrder>(ORDERS_KEY)
  write(ORDERS_KEY, [record, ...all])
  void mirrorOrder(record) // background mirror to API when logged in with a real token
  return record
}

/** Mirrors a local order to the backend (no-op offline or in demo mode).
 *  Returns true when the server has it. Skips records already mirrored. */
export async function mirrorOrder(record: SavedOrder): Promise<boolean> {
  if (!hasRealToken()) return false
  if (serverIdFor(record.id)) return true
  try {
    const receiptUrl = await uploadDataUrlReceipt(record.receipt)
    const res = await api.getClient().post('/orders', {
      ref: record.ref,
      divisionId: record.divisionId,
      fulfillment: record.fulfillment,
      receipt: receiptUrl || undefined,
      shippingAddress: {
        firstName: record.firstName, lastName: record.lastName, email: record.email,
        phone: record.phone, address: record.address, city: record.city, state: record.state,
      },
      items: record.items.map(i => ({
        type: i.type, productId: i.productId, roomId: i.roomId,
        quantity: i.quantity, price: i.price, name: i.name, image: i.image,
      })),
    }, { timeout: 15000 })
    const serverId = res.data?.data?.id
    if (serverId) rememberServerId(record.id, serverId)
    return true
  } catch (error) {
    console.warn('Order API mirror failed (kept locally):', error)
    return false
  }
}

/** Retries every local-only order (created while offline). Server dedupes by ref. */
export async function pushPendingOrders(): Promise<void> {
  if (!hasRealToken()) return
  const pending = read<SavedOrder>(ORDERS_KEY).filter(o => o.id.startsWith('order-') && !serverIdFor(o.id))
  for (const order of pending) {
    await mirrorOrder(order)
  }
}

export function getOrders(userId?: string): SavedOrder[] {
  const all = read<SavedOrder>(ORDERS_KEY)
  return userId ? all.filter(o => o.userId === userId) : all
}

export function updateOrder(id: string, patch: Partial<SavedOrder>): SavedOrder | null {
  const all = read<SavedOrder>(ORDERS_KEY)
  const idx = all.findIndex(o => o.id === id)
  if (idx < 0) return null
  all[idx] = { ...all[idx], ...patch }
  write(ORDERS_KEY, all)
  void pushOrderUpdate(id, patch)
  return all[idx]
}

async function pushOrderUpdate(id: string, patch: Partial<SavedOrder>): Promise<void> {
  if (!hasRealToken()) return
  const serverId = serverIdFor(id) || (/^(order|booking)-/.test(id) ? null : id)
  if (!serverId) return // never mirrored (offline create) — next pull reconciles
  try {
    const body: Record<string, unknown> = {}
    if (patch.status) body.status = patch.status
    if (patch.paymentStatus) body.paymentStatus = patch.paymentStatus
    await api.getClient().put(`/orders/${serverId}`, body, { timeout: 15000 })
  } catch (error) {
    console.warn('Order update mirror failed:', error)
  }
}

// ---- Bookings ----
export function saveBooking(booking: Omit<SavedBooking, 'id' | 'date'>): SavedBooking {
  const record: SavedBooking = {
    ...booking,
    id: `booking-${Date.now()}`,
    date: new Date().toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' }),
  }
  const all = read<SavedBooking>(BOOKINGS_KEY)
  write(BOOKINGS_KEY, [record, ...all])
  void mirrorBooking(record) // background mirror to API when logged in with a real token
  return record
}

/** Looks up the catalogue room id for a slug (needed by the API). */
function roomIdForSlug(slug: string): string | null {
  try {
    const rooms = JSON.parse(localStorage.getItem('univent_rooms') || '[]') as Array<{ id: string; slug: string }>
    return rooms.find(r => r.slug === slug)?.id ?? null
  } catch {
    return null
  }
}

/** Mirrors a local booking to the backend (no-op offline or in demo mode).
 *  Returns true when the server has it. */
export async function mirrorBooking(record: SavedBooking): Promise<boolean> {
  if (!hasRealToken()) return false
  if (serverIdFor(record.id)) return true
  try {
    const roomId = roomIdForSlug(record.roomSlug)
    if (!roomId) return false
    const receiptUrl = await uploadDataUrlReceipt(record.receipt)
    const res = await api.getClient().post('/bookings', {
      ref: record.ref,
      roomId,
      checkIn: record.checkIn,
      checkOut: record.checkOut,
      guests: record.guests,
      adults: record.guests,
      children: 0,
      method: 'transfer',
      receipt: receiptUrl || undefined,
      requests: record.requests,
      firstName: record.firstName,
      lastName: record.lastName,
      email: record.email,
      phone: record.phone,
    }, { timeout: 15000 })
    const serverId = res.data?.data?.id
    if (serverId) rememberServerId(record.id, serverId)
    return true
  } catch (error) {
    console.warn('Booking API mirror failed (kept locally):', error)
    return false
  }
}

/** Retries every local-only booking (created while offline). Server dedupes by ref. */
export async function pushPendingBookings(): Promise<void> {
  if (!hasRealToken()) return
  const pending = read<SavedBooking>(BOOKINGS_KEY).filter(b => b.id.startsWith('booking-') && !serverIdFor(b.id))
  for (const booking of pending) {
    await mirrorBooking(booking)
  }
}

function normalizeBooking(b: SavedBooking): SavedBooking {
  // Backfill bookings saved before the transfer-receipt update
  const legacy = b as unknown as Record<string, unknown>
  let status = b.status
  if (legacy['status'] === 'Confirmed') status = 'approved'
  else if (legacy['status'] === 'Cancelled') status = 'cancelled'
  else if (status !== 'pending' && status !== 'approved' && status !== 'cancelled') status = 'pending'
  let paymentStatus = b.paymentStatus
  const legacyPay = paymentStatus as unknown as string
  if (legacyPay === 'verified') paymentStatus = 'confirmed'
  else if (legacyPay === 'pending_verification') paymentStatus = 'awaiting_confirmation'
  else if (legacyPay === 'failed') paymentStatus = 'rejected'
  else if (!paymentStatus) paymentStatus = 'confirmed'
  return {
    ...b,
    status,
    paymentStatus,
    method: 'transfer',
    roomNumber: b.roomNumber ?? null,
    receipt: (b as SavedBooking).receipt ?? null,
    verifiedAt: b.verifiedAt ?? null,
    userId: b.userId || '',
    userEmail: b.userEmail || b.email || '',
  }
}

export function getBookings(userId?: string): SavedBooking[] {
  const all = read<SavedBooking>(BOOKINGS_KEY).map(normalizeBooking)
  return userId ? all.filter(b => b.userId === userId) : all
}

export function updateBooking(id: string, patch: Partial<SavedBooking>): SavedBooking | null {
  const all = read<SavedBooking>(BOOKINGS_KEY)
  const idx = all.findIndex(b => b.id === id)
  if (idx < 0) return null
  all[idx] = { ...all[idx], ...patch }
  write(BOOKINGS_KEY, all)
  void pushBookingUpdate(id, patch)
  return normalizeBooking(all[idx])
}

async function pushBookingUpdate(id: string, patch: Partial<SavedBooking>): Promise<void> {
  if (!hasRealToken()) return
  const serverId = serverIdFor(id) || (/^(order|booking)-/.test(id) ? null : id)
  if (!serverId) return
  try {
    const body: Record<string, unknown> = {}
    if (patch.status) body.status = patch.status
    if (patch.paymentStatus) body.paymentStatus = patch.paymentStatus
    await api.getClient().put(`/bookings/${serverId}`, body, { timeout: 15000 })
  } catch (error) {
    console.warn('Booking update mirror failed:', error)
  }
}

export function useShopData(userId?: string) {
  useSyncExternalStore(subscribe, getVersion)
  return { orders: getOrders(userId), bookings: getBookings(userId) }
}

export interface CheckoutDraft {
  firstName: string
  lastName: string
  email: string
  phone: string
  address: string
  city: string
  state: string
}

export function saveCheckoutDraft(draft: CheckoutDraft) {
  localStorage.setItem(CHECKOUT_DRAFT_KEY, JSON.stringify(draft))
}

export function getCheckoutDraft(): CheckoutDraft | null {
  try {
    const raw = localStorage.getItem(CHECKOUT_DRAFT_KEY)
    return raw ? (JSON.parse(raw) as CheckoutDraft) : null
  } catch {
    return null
  }
}
