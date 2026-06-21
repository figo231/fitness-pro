const CACHE_NAME = "fitness-pro-v2";
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
  self.skipWaiting(); // يفعّل النسخة الجديدة فورًا بدل ما يستنى إغلاق كل التابات
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) return caches.delete(key); // يمسح أي كاش قديم بإصدار مختلف
        })
      )
    )
  );
  self.clients.claim(); // ياخد السيطرة على الصفحات المفتوحة فورًا
});

self.addEventListener("fetch", (event) => {
  // طلبات الـ API (Apps Script) دايمًا تروح للإنترنت مباشرة بدون أي تدخل من الكاش
  if (event.request.url.includes("script.google.com")) {
    return;
  }

  // استراتيجية Network First: يحاول ياخد آخر نسخة من الإنترنت أولاً
  // ولو الإنترنت ضعيف/مقطوع، يرجع للنسخة المخزنة كحل احتياطي فقط
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        const resClone = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, resClone));
        return networkResponse;
      })
      .catch(() => caches.match(event.request))
  );
});
