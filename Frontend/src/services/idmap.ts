/** Maps local record ids to server ids for records created while offline-first.
 *  Catalogue ids (rooms/products) are identical on both sides and need no mapping. */

const KEY = 'univent_server_ids'

function readMap(): Record<string, string> {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '{}')
  } catch {
    return {}
  }
}

export function serverIdFor(localId: string): string | null {
  return readMap()[localId] ?? null
}

export function rememberServerId(localId: string, serverId: string) {
  if (!localId || !serverId || localId === serverId) return
  const map = readMap()
  map[localId] = serverId
  try {
    localStorage.setItem(KEY, JSON.stringify(map))
  } catch {
    /* storage full — mapping is best-effort */
  }
}
