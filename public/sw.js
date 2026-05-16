// Service Worker for Zichru PWA
const CACHE_NAME = "zichru-v1";
const STATIC_ASSETS = ["/gemara", "/manifest.json", "/icons/icon-192.png", "/icons/icon-512.png"];

// Install: cache shell assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

// Activate: clean old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME && !k.startsWith("zichru-images-")).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch: serve from cache first for images, network-first for everything else
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // For daf images: serve from cache if available, otherwise fetch
  if (url.pathname.startsWith("/images/") && url.pathname.endsWith(".jpg")) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        if (cached) return cached;
        return fetch(event.request).then((response) => {
          // Don't cache on the fly — only cache via explicit download
          return response;
        });
      })
    );
    return;
  }

  // For API calls: always network
  if (url.pathname.startsWith("/api/")) {
    return;
  }

  // For everything else: network first, fall back to cache
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});

// Handle messages from the app (for image download)
self.addEventListener("message", (event) => {
  if (event.data.type === "DOWNLOAD_IMAGES") {
    const { masechta, imageUrls } = event.data;
    const cacheName = `zichru-images-${masechta}`;

    caches.open(cacheName).then(async (cache) => {
      let done = 0;
      const total = imageUrls.length;

      for (const url of imageUrls) {
        try {
          // Check if already cached
          const existing = await cache.match(url);
          if (!existing) {
            const response = await fetch(url);
            await cache.put(url, response);
          }
          done++;
          // Report progress
          event.source.postMessage({
            type: "DOWNLOAD_PROGRESS",
            masechta,
            done,
            total,
          });
        } catch (err) {
          done++;
          event.source.postMessage({
            type: "DOWNLOAD_PROGRESS",
            masechta,
            done,
            total,
            error: true,
          });
        }
      }

      event.source.postMessage({
        type: "DOWNLOAD_COMPLETE",
        masechta,
      });
    });
  }

  if (event.data.type === "DELETE_IMAGES") {
    const { masechta } = event.data;
    caches.delete(`zichru-images-${masechta}`).then(() => {
      event.source.postMessage({ type: "DELETE_COMPLETE", masechta });
    });
  }

  if (event.data.type === "CHECK_IMAGES") {
    const { masechta, imageUrls } = event.data;
    const cacheName = `zichru-images-${masechta}`;
    caches.open(cacheName).then(async (cache) => {
      let cached = 0;
      for (const url of imageUrls) {
        const existing = await cache.match(url);
        if (existing) cached++;
      }
      event.source.postMessage({
        type: "CHECK_IMAGES_RESULT",
        masechta,
        cached,
        total: imageUrls.length,
      });
    });
  }
});
