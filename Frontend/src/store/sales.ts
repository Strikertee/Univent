import { useSyncExternalStore } from 'react'
import { api, hasRealToken } from '../services/api'
import { rememberServerId, serverIdFor } from '../services/idmap'

export interface DailySale {
  id: string
  divisionId: string
  divisionName: string
  date: string // YYYY-MM-DD
  item: string // what was sold / service rendered
  amount: number
  enteredBy: string
  createdAt: string
}

export const SALES_KEY = 'univent_daily_sales'

/** Re-render hook subscribers (used after a background API pull). */
export function emitSalesChange() {
  version += 1
  listeners.forEach(l => l())
}

function read(): DailySale[] {
  try {
    const raw = localStorage.getItem(SALES_KEY)
    return raw ? (JSON.parse(raw) as DailySale[]) : []
  } catch {
    return []
  }
}

function write(value: DailySale[]) {
  localStorage.setItem(SALES_KEY, JSON.stringify(value))
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

export function addDailySale(entry: Omit<DailySale, 'id' | 'createdAt'>): DailySale {
  const record: DailySale = { ...entry, id: `sale-${Date.now()}`, createdAt: new Date().toISOString() }
  const all = read()
  write([record, ...all])
  void pushSale(record)
  return record
}

async function pushSale(record: DailySale): Promise<void> {
  if (!hasRealToken()) return
  try {
    const res = await api.getClient().post('/sales', {
      divisionId: record.divisionId, date: record.date, item: record.item, amount: record.amount,
    }, { timeout: 15000 })
    const serverId = res.data?.data?.id
    if (serverId) rememberServerId(record.id, serverId)
  } catch (error) {
    console.warn('Sales API mirror failed (kept locally):', error)
  }
}

export function getDailySales(divisionId?: string): DailySale[] {
  const all = read()
  return divisionId ? all.filter(s => s.divisionId === divisionId) : all
}

export function deleteDailySale(id: string) {
  write(read().filter(s => s.id !== id))
  void pushSaleDelete(id)
}

async function pushSaleDelete(id: string): Promise<void> {
  if (!hasRealToken()) return
  const serverId = serverIdFor(id) || (/^sale-/.test(id) ? null : id)
  if (!serverId) return
  try {
    await api.getClient().delete(`/sales/${serverId}`, { timeout: 15000 })
  } catch (error) {
    console.warn('Sales delete mirror failed:', error)
  }
}

export function salesTotal(sales: DailySale[]): number {
  return sales.reduce((sum, s) => sum + s.amount, 0)
}

export function todayISO(): string {
  return new Date().toISOString().slice(0, 10)
}

export function useDailySales(divisionId?: string) {
  useSyncExternalStore(subscribe, getVersion)
  return getDailySales(divisionId)
}
