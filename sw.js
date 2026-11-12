/**
 * Velox - Service Worker
 * Enables 100% offline functionality, caching & standalone PWA execution.
 */

const CACHE_NAME = "velox-cache-v1";
const ASSETS_TO_CACHE = [
  "./",
  "./index.html",
  "./ship.html",
  "./track.html",
  "./print.html",
  "./manifest.json",
  "./icons/icon.svg",
  "./css/base.css",
  "./css/layout.css",
  "./css/components.css",
  "./css/print.css",
  "./js/app.js",
  "./js/db.js",
  "./js/barcode.js",
  "./js/shippo-engine.js",
  "./js/weather.js",
  "./js/components/shipping-label.js",
  "./js/components/rate-selector.js",
  "./js/components/track-stepper.js"
];

// Install: Cache all core application primitives
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => self.skipWaiting())
  );
});

// Activate: Clean up old cache versions
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => {
          if (name !== CACHE_NAME) {
            return caches.delete(name);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch: Cache-first strategy for local assets, network-first for external APIs
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // If request is within origin (our app files)
  if (url.origin === location.origin) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) {
          // Serve from cache immediately and revalidate in background
          fetch(event.request).then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(event.request, networkResponse);
              });
            }
          }).catch(() => {/* Offline */});
          return cachedResponse;
        }

        return fetch(event.request).then((networkResponse) => {
          if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== "basic") {
            return networkResponse;
          }
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
          return networkResponse;
        });
      })
    );
  } else {
    // External APIs (e.g. Open-Meteo or Shippo): Network with graceful catch
    event.respondWith(
      fetch(event.request).catch(() => {
        return new Response(JSON.stringify({ offline: true, error: "Network unavailable" }), {
          headers: { "Content-Type": "application/json" }
        });
      })
    );
  }
});
