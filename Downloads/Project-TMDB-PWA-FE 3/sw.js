const version = 1;
const cacheName = `pwa-app-project-${version}`;
const movieCacheName = `movies-pwa-project-${version}`;

const preCacheResources = [
  "/",
  `/index.html`,
  "/favorites.html",
  "/search-results.html",
  "/details.html",
  "/cache-results.html",
  "/404.html",
  "/manifest.json",
  "/js/main.js",
  "/css/main.css",
];
self.isOnline = "online" in navigator && navigator.onLine;

self.addEventListener("install", (ev) => {
  ev.waitUntil(
    caches
      .open(cacheName)
      .then((cache) => {
        return cache.addAll(preCacheResources);
      })
      .catch(console.error)
  );
});

self.addEventListener("activate", (ev) => {
  //delete old versions of the cache
  ev.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => ![cacheName, movieCacheName].includes(key))
          .map((nm) => caches.delete(nm))
      );
    })
  );
});

self.addEventListener("fetch", (event) => {
  if (!event.request.url.includes('api/movies')) {
    event.respondWith(
      caches.match(event.request).then((response) => {
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
    );
  }

});

self.addEventListener("online", (ev) => {
  console.log("online ");
  self.isOnline = true;
});

self.addEventListener("offline", (ev) => {
  console.log("offline ");
  self.isOnline = false;
});
