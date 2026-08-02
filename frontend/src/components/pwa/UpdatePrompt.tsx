"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function UpdatePrompt() {
  const [showUpdate, setShowUpdate] = useState(false);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;

    const handleUpdate = () => {
      navigator.serviceWorker.getRegistration().then((reg) => {
        if (reg?.waiting) {
          setRegistration(reg);
          setShowUpdate(true);
        }
      });
    };

    navigator.serviceWorker.ready.then((reg) => {
      reg.addEventListener("updatefound", () => {
        const newWorker = reg.installing;
        if (newWorker) {
          newWorker.addEventListener("statechange", () => {
            if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
              setRegistration(reg);
              setShowUpdate(true);
            }
          });
        }
      });
    });

    // Also check immediately
    handleUpdate();
  }, []);

  const handleRefresh = () => {
    if (registration?.waiting) {
      registration.waiting.postMessage({ type: "SKIP_WAITING" });
      window.location.reload();
    }
  };

  return (
    <AnimatePresence>
      {showUpdate && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-[100] w-[90%] max-w-md"
        >
          <div className="glass-card rounded-2xl p-4 shadow-2xl border border-primary/20 flex items-center justify-between gap-3">
            <div className="flex-1">
              <p className="text-sm font-semibold text-on-surface">New version available</p>
              <p className="text-xs text-on-surface-variant">Refresh to get the latest features.</p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowUpdate(false)}
                className="h-8 w-8 p-0"
                aria-label="Dismiss update notification"
              >
                <X className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                onClick={handleRefresh}
                className="bg-primary text-on-primary gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Refresh
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
