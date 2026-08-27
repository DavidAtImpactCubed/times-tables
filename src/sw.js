/**
 * Offline service worker.
 *
 * BUILD, BASE, ASSETS, SHELL and BYTES are substituted at build time by the
 * offline-precache plugin in vite.config.ts, so this file's contents change
 * whenever the build does — which is what makes the update flow work: the
 * browser sees a byte-different worker, installs it, and the old build's
 * cache is dropped on activation.
 *
 * Deliberately conservative about staleness, because a wrong cache on a
 * child's phone is worse than a slow load:
 *   - navigations go to the NETWORK first and fall back to the cached page,
 *     so a new deploy is always picked up wherever there's signal
 *   - assets go to the CACHE first, which is safe because their filenames
 *     are content hashes — a changed file is a changed URL
 *   - the full 17 MB is only fetched when the parent asks for it, from the
 *     offline screen, which needs the progress this worker reports back
 */

const BUILD = '__BUILD__'
const BASE = '__BASE__'
const ASSETS = __ASSETS__
const SHELL = __SHELL__
const BYTES = __BYTES__

const CACHE = `mmq-offline-${BUILD}`
/** Navigations all resolve to the one SPA entry, so they share a cache key. */
const PAGE_KEY = BASE

self.addEventListener('install', (e) => {
  // The shell alone gets the app booting offline; art and narration follow
  // when the parent asks. Never let one failed fetch fail the install.
  e.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE)
      await Promise.all(SHELL.map((url) => cache.add(new Request(url, { cache: 'reload' })).catch(() => {})))
      await self.skipWaiting()
    })(),
  )
})

self.addEventListener('activate', (e) => {
  e.waitUntil(
    (async () => {
      const names = await caches.keys()
      await Promise.all(names.filter((n) => n.startsWith('mmq-offline-') && n !== CACHE).map((n) => caches.delete(n)))
      await self.clients.claim()
    })(),
  )
})

/**
 * Media elements ask for byte ranges. The cache holds whole responses, and
 * handing a 200 back to a Range request makes some browsers refuse to play,
 * so cut the slice ourselves.
 */
async function sliceResponse(res, rangeHeader) {
  const buf = await res.arrayBuffer()
  const m = /^bytes=(\d*)-(\d*)$/.exec(rangeHeader.trim())
  if (!m) return res
  const total = buf.byteLength
  const start = m[1] ? Number(m[1]) : 0
  const end = m[2] ? Math.min(Number(m[2]), total - 1) : total - 1
  if (!(start >= 0 && start <= end)) {
    return new Response(null, { status: 416, headers: { 'Content-Range': `bytes */${total}` } })
  }
  const headers = new Headers(res.headers)
  headers.set('Content-Range', `bytes ${start}-${end}/${total}`)
  headers.set('Content-Length', String(end - start + 1))
  headers.set('Accept-Ranges', 'bytes')
  return new Response(buf.slice(start, end + 1), { status: 206, statusText: 'Partial Content', headers })
}

async function cacheFirst(req) {
  const cache = await caches.open(CACHE)
  const range = req.headers.get('range')
  // Range requests are matched against the whole stored response.
  const hit = await cache.match(req.url)
  if (hit) return range ? sliceResponse(hit, range) : hit
  const res = await fetch(req)
  // Don't store a partial as if it were the whole file.
  if (res.ok && !range) cache.put(req.url, res.clone()).catch(() => {})
  return res
}

async function networkFirst(req) {
  const cache = await caches.open(CACHE)
  try {
    const res = await fetch(req)
    if (res.ok) cache.put(PAGE_KEY, res.clone()).catch(() => {})
    return res
  } catch (err) {
    const hit = await cache.match(PAGE_KEY)
    if (hit) return hit
    throw err
  }
}

self.addEventListener('fetch', (e) => {
  const req = e.request
  if (req.method !== 'GET') return
  let url
  try {
    url = new URL(req.url)
  } catch {
    return
  }
  if (url.origin !== self.location.origin) return
  if (req.mode === 'navigate') {
    e.respondWith(networkFirst(req))
    return
  }
  e.respondWith(cacheFirst(req))
})

// ---- talking to the offline screen --------------------------------------

async function post(msg) {
  const clients = await self.clients.matchAll({ includeUncontrolled: true })
  for (const c of clients) c.postMessage({ scope: 'offline', ...msg })
}

async function countCached() {
  const cache = await caches.open(CACHE)
  let have = 0
  for (const url of ASSETS) if (await cache.match(url)) have++
  return have
}

async function reportStatus() {
  const have = await countCached()
  await post({ type: 'status', done: have, total: ASSETS.length, bytes: BYTES })
}

let running = false

/** Fetch everything not already held, reporting progress as it goes. */
async function precacheAll() {
  if (running) return
  running = true
  try {
    const cache = await caches.open(CACHE)
    const missing = []
    for (const url of ASSETS) if (!(await cache.match(url))) missing.push(url)
    const total = ASSETS.length
    let done = total - missing.length
    let failed = 0
    await post({ type: 'progress', done, total, bytes: BYTES })
    const queue = missing.slice()
    // A handful at a time: enough to fill a hotel wifi pipe, few enough not
    // to swamp a phone on a bad connection.
    const workers = Array.from({ length: 6 }, async () => {
      for (let url = queue.shift(); url !== undefined; url = queue.shift()) {
        try {
          const res = await fetch(url)
          if (res.ok) await cache.put(url, res)
          else failed++
        } catch {
          failed++
        }
        done++
        await post({ type: 'progress', done, total, bytes: BYTES })
      }
    })
    await Promise.all(workers)
    await post({ type: 'done', done: await countCached(), total, failed, bytes: BYTES })
  } finally {
    running = false
  }
}

self.addEventListener('message', (e) => {
  const msg = e.data || {}
  if (msg.type === 'precache') e.waitUntil(precacheAll())
  else if (msg.type === 'status') e.waitUntil(reportStatus())
})
