/**
 * Gitpub Service Worker
 * Strategy: Cache-first for static assets, Network-first for API calls
 * Version: gitpub-v1
 */

const CACHE_NAME   = 'gitpub-v1';
const API_ORIGIN   = 'https://api.github.com';
const FONTS_ORIGIN = 'https://fonts.googleapis.com';

/* Static assets to pre-cache on install */
const PRECACHE_URLS = [
  '/Gitpub/',
  '/Gitpub/index.html',
  '/Gitpub/gitpal.html',
  '/Gitpub/manifest.json',
  '/Gitpub/css/styles.css',
  '/Gitpub/js/app.js',
  '/Gitpub/icons/icon.svg',
];

/* ── Install: pre-cache static shell ──────────────────────── */
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

/* ── Activate: purge old caches ───────────────────────────── */
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

/* ── Fetch: routing strategy ──────────────────────────────── */
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET and browser-extension requests
  if (request.method !== 'GET' || url.protocol === 'chrome-extension:') return;

  // Network-first for GitHub API calls
  if (url.origin === API_ORIGIN) {
    event.respondWith(networkFirst(request));
    return;
  }

  // Network-first for Google Fonts (CSS)
  if (url.origin === FONTS_ORIGIN) {
    event.respondWith(networkFirst(request));
    return;
  }

  // Cache-first for all other assets (static shell)
  event.respondWith(cacheFirst(request));
});

/* ── Cache-first strategy ─────────────────────────────────── */
async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    // Return offline fallback for navigation requests
    if (request.mode === 'navigate') {
      return caches.match('/Gitpub/index.html');
    }
    return new Response('Offline', { status: 503 });
  }
}

/* ── Network-first strategy ───────────────────────────────── */
async function networkFirst(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    return cached || new Response(
      JSON.stringify({ error: 'offline', message: 'No network and no cache available' }),
      { status: 503, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
