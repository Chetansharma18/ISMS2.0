// Service Worker to intercept incoming HTTP POST requests to the application
const CACHE_NAME = 'post-payload-store-v1';
const PAYLOAD_KEY = '/__post_payload__';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  // Intercept incoming HTTP POST requests to the web application
  if (req.method === 'POST') {
    event.respondWith((async () => {
      let payload = {};
      try {
        const cloned = req.clone();
        const contentType = cloned.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
          payload = await cloned.json();
        } else if (
          contentType.includes('application/x-www-form-urlencoded') ||
          contentType.includes('multipart/form-data')
        ) {
          const formData = await cloned.formData();
          const obj = {};
          formData.forEach((value, key) => {
            obj[key] = typeof value === 'string' ? value : (value.name || 'File');
          });
          payload = obj;
        } else {
          const rawText = await cloned.text();
          try {
            payload = JSON.parse(rawText);
          } catch {
            payload = { raw: rawText };
          }
        }
      } catch (err) {
        console.warn('[SW] Could not parse POST body:', err);
        payload = { error: 'Failed to parse POST body', message: String(err) };
      }

      // Store in Cache so index.html can retrieve it upon document load
      try {
        const cache = await caches.open(CACHE_NAME);
        await cache.put(
          PAYLOAD_KEY,
          new Response(
            JSON.stringify({
              payload,
              source: 'HTTP POST Request',
              url: req.url,
              timestamp: new Date().toISOString()
            }),
            { headers: { 'content-type': 'application/json' } }
          )
        );
      } catch (err) {
        console.warn('[SW] Cache storage error:', err);
      }

      // Also broadcast directly to open windows
      try {
        const allClients = await self.clients.matchAll({ includeUncontrolled: true, type: 'window' });
        for (const client of allClients) {
          client.postMessage({
            type: 'POST_PAYLOAD_RECEIVED',
            payload,
            source: 'HTTP POST Request',
            timestamp: new Date().toISOString()
          });
        }
      } catch (e) {}

      // Return the document page using GET so the Angular SPA loads smoothly
      try {
        const getReq = new Request(req.url, { method: 'GET', headers: req.headers });
        return await fetch(getReq);
      } catch {
        return await fetch('/');
      }
    })());
  }
});
