import { useSyncExternalStore } from 'react'

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

const SALES_KEY = 'univent_daily_sales'

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
  return record
}

export function getDailySales(divisionId?: string): DailySale[] {
  const all = read()
  return divisionId ? all.filter(s => s.divisionId === divisionId) : all
}

export function deleteDailySale(id: string) {
  write(read().filter(s => s.id !== id))
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
