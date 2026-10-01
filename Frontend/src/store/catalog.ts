import { useSyncExternalStore } from 'react'
import { Room, Product } from '../types'
import { hotelRooms as seedRooms, bakeryProducts as seedProducts } from '../data/mockData'
import { getBookings } from './shop'

const ROOMS_KEY = 'univent_rooms'
const PRODUCTS_KEY = 'univent_products'

function read<T>(key: string, seed: T[]): T[] {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(seed))
      return seed
    }
    const parsed = JSON.parse(raw) as T[]
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : seed
  } catch {
    return seed
  }
}

function write(key: string, value: unknown) {
  localStorage.setItem(key, JSON.stringify(value))
  version += 1
  listeners.forEach(l => l())
}

type Listener = () => void
const listeners = new Set<Listener>()
let version = 0
function subscribe(l: Listener) {
  listeners.add(l)
  return () => { listeners.delete(l) }
}
function getVersion() {
  return version
}

// ---- Rooms (hotel admin edits price + number of rooms) ----
export function getRooms(): Room[] {
  return read<Room>(ROOMS_KEY, seedRooms)
}

export function updateRoom(id: string, patch: Partial<Pick<Room, 'price' | 'totalRooms' | 'name' | 'isActive'>>): Room | null {
  const rooms = getRooms()
  const idx = rooms.findIndex(r => r.id === id)
  if (idx < 0) return null
  rooms[idx] = { ...rooms[idx], ...patch, updatedAt: new Date().toISOString() }
  write(ROOMS_KEY, rooms)
  return rooms[idx]
}

// ---- Products (bakery admin edits price + stock) ----
export function getProducts(): Product[] {
  return read<Product>(PRODUCTS_KEY, seedProducts)
}

export function updateProduct(id: string, patch: Partial<Pick<Product, 'price' | 'stock' | 'name' | 'isActive'>>): Product | null {
  const products = getProducts()
  const idx = products.findIndex(p => p.id === id)
  if (idx < 0) return null
  products[idx] = { ...products[idx], ...patch, updatedAt: new Date().toISOString() }
  write(PRODUCTS_KEY, products)
  return products[idx]
}

/**
 * Live availability: a booking holds a room only while its payment is
 * awaiting verification or verified. Failed / reversed / cancelled bookings
 * release the room automatically.
 */
export function bookingHoldsRoom(b: { status: string; paymentStatus?: string }): boolean {
  if (b.status === 'cancelled') return false
  const pay = b.paymentStatus || 'confirmed' // legacy bookings count as paid
  return pay === 'awaiting_confirmation' || pay === 'confirmed'
}

export function getAvailableRooms(room: Room): number {
  const held = getBookings().filter(b => b.roomSlug === room.slug && bookingHoldsRoom(b)).length
  return Math.max(0, room.totalRooms - held)
}

const ROOM_PREFIX: Record<string, string> = {
  'room-double-deluxe': 'DD',
  'room-royal-standard': 'RS',
  'room-royal-executive': 'RE',
  'room-luxury-king': 'LK',
  'room-executive-suite': 'ES',
  'room-premium-royal': 'PR',
}

const ROOM_NUMBERS_KEY = 'univent_room_numbers'

function readRoomNumbers(): Record<string, string[]> {
  try {
    return JSON.parse(localStorage.getItem(ROOM_NUMBERS_KEY) || '{}')
  } catch {
    return {}
  }
}

/** Assigns the lowest free room number of that type, e.g. "DD-04". */
export function assignRoomNumber(roomId: string): string {
  const prefix = ROOM_PREFIX[roomId] || 'RM'
  const taken = new Set(readRoomNumbers()[roomId] || [])
  let n = 1
  while (taken.has(`${prefix}-${String(n).padStart(2, '0')}`)) n += 1
  const num = `${prefix}-${String(n).padStart(2, '0')}`
  const all = readRoomNumbers()
  all[roomId] = [...(all[roomId] || []), num]
  localStorage.setItem(ROOM_NUMBERS_KEY, JSON.stringify(all))
  version += 1
  listeners.forEach(l => l())
  return num
}

/** Releases a room number (reversal / cancellation) so it can be re-issued. */
export function releaseRoomNumber(roomId: string, num: string | null) {
  if (!num) return
  const all = readRoomNumbers()
  all[roomId] = (all[roomId] || []).filter(x => x !== num)
  localStorage.setItem(ROOM_NUMBERS_KEY, JSON.stringify(all))
  version += 1
  listeners.forEach(l => l())
}

export function useCatalog() {
  useSyncExternalStore(subscribe, getVersion)
  return { rooms: getRooms(), products: getProducts() }
}
