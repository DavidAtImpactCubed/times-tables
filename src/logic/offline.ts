/**
 * Talking to the offline service worker (src/sw.js).
 *
 * The worker holds the file list and does the fetching; this module is just
 * the wire. Everything degrades to "not available" rather than throwing, so a
 * browser without service workers (or a page opened over plain http) plays
 * exactly as it did before.
 */

export interface OfflineState {
  /** files held in the cache */
  done: number
  /** files the build is made of */
  total: number
  /** total download size in bytes */
  bytes: number
  /** true once a run has finished */
  finished?: boolean
  /** files a finished run could not fetch */
  failed?: number
}

type Listener = (state: OfflineState) => void

const listeners = new Set<Listener>()

/** Service workers need a secure context; they're absent in dev builds too. */
export const offlineSupported = (): boolean =>
  typeof navigator !== 'undefined' && 'serviceWorker' in navigator && import.meta.env.PROD

function notify(state: OfflineState): void {
  for (const l of listeners) l(state)
}

export function onOfflineState(listener: Listener): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

let wired = false

function wire(): void {
  if (wired || !offlineSupported()) return
  wired = true
  navigator.serviceWorker.addEventListener('message', (e: MessageEvent) => {
    const msg = e.data
    if (!msg || msg.scope !== 'offline') return
    if (msg.type === 'status' || msg.type === 'progress' || msg.type === 'done') {
      notify({
        done: msg.done,
        total: msg.total,
        bytes: msg.bytes,
        finished: msg.type === 'done',
        failed: msg.failed,
      })
    }
  })
}

/** Install (or pick up) the worker. Safe to call on every start. */
export function registerOffline(): void {
  if (!offlineSupported()) return
  wire()
  navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`).catch(() => {
    // no offline support this time round — the game still plays online
  })
}

async function send(message: unknown): Promise<boolean> {
  if (!offlineSupported()) return false
  wire()
  try {
    const reg = await navigator.serviceWorker.ready
    const worker = reg.active ?? navigator.serviceWorker.controller
    if (!worker) return false
    worker.postMessage(message)
    return true
  } catch {
    return false
  }
}

/** Ask how much is already held. The answer arrives via onOfflineState. */
export const askOfflineStatus = (): Promise<boolean> => send({ type: 'status' })

/** Start downloading everything. Progress arrives via onOfflineState. */
export const startOfflineDownload = (): Promise<boolean> => send({ type: 'precache' })
