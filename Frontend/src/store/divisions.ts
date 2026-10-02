import { useSyncExternalStore } from 'react'
import { Division } from '../types'
import { divisions as seedDivisions } from '../data/mockData'
import { api, hasRealToken } from '../services/api'
import { rememberServerId, serverIdFor } from '../services/idmap'

export const DIVISIONS_KEY = 'univent_divisions'

export function emitDivisionChange() {
  version += 1
  listeners.forEach(l => l())
}

function read(): Division[] {
  try {
    const raw = localStorage.getItem(DIVISIONS_KEY)
    if (!raw) {
      localStorage.setItem(DIVISIONS_KEY, JSON.stringify(seedDivisions))
      return seedDivisions
    }
    const parsed = JSON.parse(raw) as Division[]
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : seedDivisions
  } catch {
    return seedDivisions
  }
}

function write(value: Division[]) {
  localStorage.setItem(DIVISIONS_KEY, JSON.stringify(value))
  emitDivisionChange()
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

function slugify(name: string): string {
  return name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
}

export function getDivisions(): Division[] {
  return read()
}

export function createDivision(input: { name: string; shortDescription?: string; description?: string }): Division {
  const all = read()
  const slug = slugify(input.name)
  if (all.some(d => d.slug === slug)) throw new Error('A division with a similar name already exists')
  const now = new Date().toISOString()
  const record: Division = {
    id: `div-${Date.now()}`,
    name: input.name,
    slug,
    description: input.description || '',
    shortDescription: input.shortDescription || input.name,
    logo: '',
    icon: '🏢',
    color: 'bg-primary-100',
    isActive: true,
    sortOrder: all.length + 1,
    createdAt: now,
    updatedAt: now,
  } as Division
  write([...all, record])
  void pushDivision(record)
  return record
}

async function pushDivision(record: Division): Promise<void> {
  if (!hasRealToken()) return
  try {
    const res = await api.getClient().post('/divisions', {
      name: record.name, slug: record.slug, description: record.description,
    }, { timeout: 15000 })
    const serverId = res.data?.data?.id
    if (serverId) rememberServerId(record.id, serverId)
  } catch (error) {
    console.warn('Division mirror failed (kept locally):', error)
  }
}

export function updateDivisionLocal(id: string, patch: Partial<Division>): Division | null {
  const all = read()
  const idx = all.findIndex(d => d.id === id)
  if (idx < 0) return null
  all[idx] = { ...all[idx], ...patch, updatedAt: new Date().toISOString() }
  write(all)
  void (async () => {
    if (!hasRealToken()) return
    // Seeded ids are identical on the server; pushed ones resolve via the id map.
    const serverId = serverIdFor(id) || (seedDivisions.some(d => d.id === id) ? id : null)
    if (!serverId) return
    try {
      await api.getClient().put(`/divisions/${serverId}`, patch, { timeout: 15000 })
    } catch (error) {
      console.warn('Division update mirror failed:', error)
    }
  })()
  return all[idx]
}

export function useDivisions() {
  useSyncExternalStore(subscribe, getVersion)
  return getDivisions()
}
