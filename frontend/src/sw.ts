/// <reference lib="webworker" />
import { defaultCache } from "@serwist/next/worker";
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import { Serwist, CacheFirst, NetworkFirst, StaleWhileRevalidate, ExpirationPlugin } from "serwist";

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope & typeof globalThis;

const APP_VERSION = "AquaPrint-v1";

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: false, // Never silently replace running app
  clientsClaim: false,
  navigationPreload: true,
  runtimeCaching: [
    // ── Cache First: Static Assets ──
    {
      matcher: /\/_next\/static\/.*/i,
      handler: new CacheFirst({
        cacheName: `${APP_VERSION}-static`,
        plugins: [
          new ExpirationPlugin({ maxEntries: 200, maxAgeSeconds: 365 * 24 * 60 * 60 }),
        ],
      }),
    },
    {
      matcher: /\.(?:png|jpg|jpeg|svg|gif|webp|ico)$/i,
      handler: new CacheFirst({
        cacheName: `${APP_VERSION}-images`,
        plugins: [
          new ExpirationPlugin({ maxEntries: 100, maxAgeSeconds: 30 * 24 * 60 * 60 }),
        ],
      }),
    },
    {
      matcher: /\.(?:woff|woff2|ttf|otf|eot)$/i,
      handler: new CacheFirst({
        cacheName: `${APP_VERSION}-fonts`,
        plugins: [
          new ExpirationPlugin({ maxEntries: 30, maxAgeSeconds: 365 * 24 * 60 * 60 }),
        ],
      }),
    },
    {
      matcher: /\/icons\/.*/i,
      handler: new CacheFirst({
        cacheName: `${APP_VERSION}-icons`,
        plugins: [
          new ExpirationPlugin({ maxEntries: 50, maxAgeSeconds: 365 * 24 * 60 * 60 }),
        ],
      }),
    },
    // ── Network First: Auth & Dashboard ──
    {
      matcher: /\/api\/v1\/dashboard\/.*/i,
      handler: new NetworkFirst({
        cacheName: `${APP_VERSION}-dashboard-api`,
        networkTimeoutSeconds: 10,
        plugins: [
          new ExpirationPlugin({ maxEntries: 20, maxAgeSeconds: 5 * 60 }),
        ],
      }),
    },
    {
      matcher: /\/api\/v1\/users\/me/i,
      handler: new NetworkFirst({
        cacheName: `${APP_VERSION}-user-api`,
        networkTimeoutSeconds: 10,
        plugins: [
          new ExpirationPlugin({ maxEntries: 5, maxAgeSeconds: 10 * 60 }),
        ],
      }),
    },
    {
      matcher: /\/api\/v1\/auth\/.*/i,
      handler: new NetworkFirst({
        cacheName: `${APP_VERSION}-auth-api`,
        networkTimeoutSeconds: 10,
        plugins: [
          new ExpirationPlugin({ maxEntries: 10, maxAgeSeconds: 5 * 60 }),
        ],
      }),
    },
    // ── Stale While Revalidate: Products, Search, Gamification ──
    {
      matcher: /\/api\/v1\/products\/.*/i,
      handler: new StaleWhileRevalidate({
        cacheName: `${APP_VERSION}-products-api`,
        plugins: [
          new ExpirationPlugin({ maxEntries: 100, maxAgeSeconds: 30 * 60 }),
        ],
      }),
    },
    {
      matcher: /\/api\/v1\/products$/i,
      handler: new StaleWhileRevalidate({
        cacheName: `${APP_VERSION}-product-list-api`,
        plugins: [
          new ExpirationPlugin({ maxEntries: 20, maxAgeSeconds: 15 * 60 }),
        ],
      }),
    },
    {
      matcher: /\/api\/v1\/gamification\/.*/i,
      handler: new StaleWhileRevalidate({
        cacheName: `${APP_VERSION}-gamification-api`,
        plugins: [
          new ExpirationPlugin({ maxEntries: 30, maxAgeSeconds: 15 * 60 }),
        ],
      }),
    },
    {
      matcher: /\/api\/v1\/comparison\/.*/i,
      handler: new StaleWhileRevalidate({
        cacheName: `${APP_VERSION}-comparison-api`,
        plugins: [
          new ExpirationPlugin({ maxEntries: 20, maxAgeSeconds: 15 * 60 }),
        ],
      }),
    },
    // Default fallback
    ...defaultCache,
  ],
  fallbacks: {
    entries: [
      {
        url: "/offline",
        matcher({ request }) {
          return request.destination === "document";
        },
      },
    ],
  },
});

// ── Version-based cache cleanup ──
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => !name.startsWith(APP_VERSION))
          .map((name) => {
            console.log(`[SW] Deleting old cache: ${name}`);
            return caches.delete(name);
          })
      );
    })
  );
});

// ── Notify clients of update ──
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

serwist.addEventListeners();
