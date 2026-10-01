import { useSyncExternalStore } from 'react'
import { CartItem } from '../types'

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

const ORDERS_KEY = 'univent_orders'
const BOOKINGS_KEY = 'univent_bookings'
export const CHECKOUT_DRAFT_KEY = 'univent_checkout_draft'

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
  return record
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
  return all[idx]
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
  return record
}

function normalizeBooking(b: SavedBooking): SavedBooking {
  // Backfill bookings saved before the transfer-receipt update
  const legacy = b as unknown as Record<string, unknown>
  let status = b.status
  if (legacy['status'] === 'Confirmed') status = 'approved'
  else if (legacy['status'] === 'Cancelled') status = 'cancelled'
  else if (status !== 'pending' && status !== 'approved' && status !== 'cancelled') status = 'pending'
  let paymentStatus = b.paymentStatus
  if (paymentStatus === 'verified') paymentStatus = 'confirmed'
  else if (paymentStatus === 'pending_verification') paymentStatus = 'awaiting_confirmation'
  else if (paymentStatus === 'failed') paymentStatus = 'rejected'
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
  return normalizeBooking(all[idx])
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
