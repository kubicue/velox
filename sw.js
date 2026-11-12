/**
 * Velox - Minimal Offline Service Worker
 * Form Follows Function — 6-File Compact PWA Caching
 */

const CACHE_NAME = "velox-cache-v2";
const ASSETS = [
  "./",
  "./index.html",
  "./css/style.css",
  "./js/app.js",
  "./manifest.json",
  "./icons/icon.svg"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((k) => (k !== CACHE_NAME ? caches.delete(k) : null)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  // Only handle GET requests with http/https schemes
  if (event.request.method !== "GET" || !event.request.url.startsWith("http")) {
    return;
  }

  const url = new URL(event.request.url);

  // Origin check: Only cache and revalidate first-party application assets
  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        return (
          cached ||
          fetch(event.request)
            .then((res) => {
              if (res && res.status === 200 && res.type === "basic") {
                const clone = res.clone();
                caches.open(CACHE_NAME).then((c) => c.put(event.request, clone));
              }
              return res;
            })
            .catch(() => cached)
        );
      })
    );
  } else {
    // External APIs (e.g. weather): pass through to network without polluting app cache
    event.respondWith(
      fetch(event.request).catch(() => {
        return new Response(JSON.stringify({ offline: true, error: "Network unavailable" }), {
          headers: { "Content-Type": "application/json" }
        });
      })
    );
  }
});
