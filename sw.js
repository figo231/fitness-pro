const CACHE_NAME = "fitness-pro-v1";
const urlsToCache = [
  "./index.html",
  "./logo.png",
  "./icon-192.png",
  "./icon-512.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) return caches.delete(key);
        })
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  // الصفحات الثابتة (index, logo, icons) من الكاش لو الإنترنت ضعيف
  // أما طلبات الـ API (Apps Script) دايمًا تروح للإنترنت مباشرة
  if (event.request.url.includes("script.google.com")) {
    return; // سيب الطلب يروح عادي بدون تدخل
  }

  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
