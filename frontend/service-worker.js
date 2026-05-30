const CACHE_NAME = "sweetroots-v3";

const CORE_ASSETS = [
  "/",
  "/index.html",
  "/styles.css",
  "/script.js",
  "/config.js",
  "/firebase-config.js",
  "/manifest.webmanifest",
  "/mobile.css",
  "/mobile.js",
  "/offline.html",
  "/og-image.png",
  "/icons/icon-192.png",
  "/icons/icon-512.png"
];

const BYPASS_PATH_PREFIXES = [
  "/__/auth",
  "/api",
  "/auth",
  "/user",
  "/users",
  "/plant",
  "/plants",
  "/media",
  "/upload",
  "/uploads"
];

const CACHEABLE_STATIC_EXTENSIONS = [
  ".css",
  ".html",
  ".ico",
  ".jpg",
  ".jpeg",
  ".js",
  ".json",
  ".png",
  ".svg",
  ".webmanifest",
  ".webp"
];

function isSameOriginRequest(request) {
  return new URL(request.url).origin === self.location.origin;
}

function shouldBypassRequest(request) {
  const url = new URL(request.url);

  if (request.method !== "GET") {
    return true;
  }

  if (url.origin !== self.location.origin) {
    return true;
  }

  return BYPASS_PATH_PREFIXES.some((prefix) => url.pathname.startsWith(prefix));
}

function isCacheableStaticRequest(request) {
  const url = new URL(request.url);

  if (!isSameOriginRequest(request)) {
    return false;
  }

  if (request.mode === "navigate") {
    return true;
  }

  return CACHEABLE_STATIC_EXTENSIONS.some((extension) => url.pathname.endsWith(extension));
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(CORE_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const request = event.request;

  if (shouldBypassRequest(request)) {
    return;
  }

  const isNavigationRequest = request.mode === "navigate";

  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response && response.ok && isCacheableStaticRequest(request)) {
          const clonedResponse = response.clone();

          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, clonedResponse);
          });
        }

        return response;
      })
      .catch(async () => {
        const cachedResponse = await caches.match(request);

        if (cachedResponse) {
          return cachedResponse;
        }

        if (isNavigationRequest) {
          return caches.match("/offline.html");
        }

        return Response.error();
      })
  );
});
