"use client";

import { useEffect } from "react";
import { initBackgroundSync } from "@/lib/pwa/sync-manager";
import { useSessionStore } from "@/store/sessionStore";

export function usePWA() {
  const { session } = useSessionStore();

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Register service worker
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          console.log("[PWA] Service Worker registered:", registration.scope);
        })
        .catch((error) => {
          console.log("[PWA] Service Worker registration failed:", error);
        });
    }

    // Initialize background sync
    initBackgroundSync(() => session?.access_token);
  }, [session]);
}
